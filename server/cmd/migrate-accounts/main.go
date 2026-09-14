// Command migrate-accounts transfers encrypted v1 coding-agent accounts into
// the already imported v2 workspaces. Plaintext exists only in this process:
// every credential is authenticated with the source key and immediately
// re-encrypted with the target key and target workspace as associated data.
package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type sourceAccount struct {
	id, workspaceID, ownerEmail, provider, accountKey, label, email, plan string
	credentialKind, credentialEncrypted, refreshEncrypted, refreshError   string
	expiresAt                                                             *time.Time
	enabled                                                               bool
	createdAt, updatedAt                                                  time.Time
	limits                                                                json.RawMessage
	usageCapturedAt                                                       *time.Time
	runtimeStatus, limitReason                                            string
	limitedUntil                                                          *time.Time
}

type sourceLimit struct {
	Label    string  `json:"label"`
	Percent  float64 `json:"percent"`
	ResetsAt *string `json:"resets_at"`
}

type targetLimit struct {
	Window     string  `json:"window"`
	Used       float64 `json:"used"`
	Limit      float64 `json:"limit"`
	ResetsAt   string  `json:"resets_at,omitempty"`
	ObservedAt string  `json:"observed_at,omitempty"`
}

func main() {
	if err := run(context.Background()); err != nil {
		fmt.Fprintln(os.Stderr, "account migration failed:", err)
		os.Exit(1)
	}
}

func run(ctx context.Context) error {
	sourceURL := strings.TrimSpace(os.Getenv("SOURCE_DATABASE_URL"))
	targetURL := strings.TrimSpace(os.Getenv("TARGET_DATABASE_URL"))
	workspaceCSV := strings.TrimSpace(os.Getenv("SOURCE_WORKSPACE_IDS"))
	if sourceURL == "" || targetURL == "" || workspaceCSV == "" {
		return errors.New("SOURCE_DATABASE_URL, TARGET_DATABASE_URL and SOURCE_WORKSPACE_IDS are required")
	}
	sourcePool, err := pgxpool.New(ctx, sourceURL)
	if err != nil {
		return err
	}
	defer sourcePool.Close()
	sourceAEAD, err := sourceCipher(ctx, sourcePool, os.Getenv("SOURCE_SECRETS_KEY"))
	if err != nil {
		return err
	}
	targetAEAD, err := targetCipher(os.Getenv("TARGET_SECRETS_KEY"))
	if err != nil {
		return err
	}
	targetPool, err := pgxpool.New(ctx, targetURL)
	if err != nil {
		return err
	}
	defer targetPool.Close()

	workspaceIDs := strings.Split(workspaceCSV, ",")
	rows, err := sourcePool.Query(ctx, `
		with latest_snapshot as (
			select distinct on (runtime.workspace_id, ra.account_key)
				runtime.workspace_id, ra.account_key, ra.limits, ra.usage_captured_at,
				ra.status, ra.limit_reason, ra.limited_until
			from runtime_account ra
			join agent_runtime runtime on runtime.id=ra.runtime_id
			where runtime.workspace_id = any($1::uuid[])
			order by runtime.workspace_id, ra.account_key,
				coalesce(ra.usage_captured_at,ra.last_reported_at) desc
		)
		select a.id::text, a.workspace_id::text, u.email, a.provider, a.account_key,
			a.label, a.email, a.plan, a.credential_kind, a.credential_encrypted,
			a.refresh_encrypted, a.expires_at, a.refresh_error, a.enabled,
			a.created_at, a.updated_at,
			coalesce(snapshot.limits, '[]'::jsonb), snapshot.usage_captured_at,
			coalesce(snapshot.status, ''), coalesce(snapshot.limit_reason, ''), snapshot.limited_until
		from agent_account a join "user" u on u.id=a.owner_id
		left join latest_snapshot snapshot
			on snapshot.workspace_id=a.workspace_id and snapshot.account_key=a.account_key
		where a.workspace_id = any($1::uuid[])
		order by a.workspace_id, a.provider, a.account_key`, workspaceIDs)
	if err != nil {
		return err
	}
	defer rows.Close()
	var accounts []sourceAccount
	for rows.Next() {
		var account sourceAccount
		if err := rows.Scan(&account.id, &account.workspaceID, &account.ownerEmail, &account.provider,
			&account.accountKey, &account.label, &account.email, &account.plan, &account.credentialKind,
			&account.credentialEncrypted, &account.refreshEncrypted, &account.expiresAt, &account.refreshError,
			&account.enabled, &account.createdAt, &account.updatedAt, &account.limits, &account.usageCapturedAt,
			&account.runtimeStatus, &account.limitReason, &account.limitedUntil); err != nil {
			return err
		}
		accounts = append(accounts, account)
	}
	if err := rows.Err(); err != nil {
		return err
	}
	if len(accounts) == 0 {
		return errors.New("source query returned no accounts")
	}

	tx, err := targetPool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	counts := map[string]int{}
	for _, account := range accounts {
		targetWorkspace, targetUser, err := targetIdentity(ctx, tx, account.workspaceID, account.ownerEmail)
		if err != nil {
			return err
		}
		credential := []byte("{}")
		refreshError := account.refreshError
		hasCredential := strings.TrimSpace(account.credentialEncrypted) != ""
		if hasCredential {
			credential, err = openSource(sourceAEAD, account.credentialEncrypted)
			if err != nil {
				return fmt.Errorf("decrypt credential for account %s: %w", account.id, err)
			}
		} else {
			// Legacy harness profiles referenced credentials installed on the old
			// daemon instead of storing a per-account secret. Preserve the account
			// and make its unavailable state explicit rather than dropping it or
			// pretending that it can be routed in v2.
			refreshError = "Legacy shared-credential profile requires reconnection"
		}
		credentialRef, err := insertTargetSecret(ctx, tx, targetAEAD, targetWorkspace, credential)
		if err != nil {
			return err
		}
		refreshRef := ""
		if account.refreshEncrypted != "" {
			refresh, err := openSource(sourceAEAD, account.refreshEncrypted)
			if err != nil {
				return fmt.Errorf("decrypt refresh credential for account %s: %w", account.id, err)
			}
			refreshRef, err = insertTargetSecret(ctx, tx, targetAEAD, targetWorkspace, refresh)
			if err != nil {
				return err
			}
		}
		kind := "api_key"
		if account.credentialKind == "oauth" {
			kind = "subscription"
		}
		status := "connected"
		if !account.enabled || refreshError != "" || account.runtimeStatus == "limited" {
			status = "limited"
		}
		quota, err := convertQuota(account.limits, account.usageCapturedAt)
		if err != nil {
			return fmt.Errorf("convert quota for account %s: %w", account.id, err)
		}
		provider := account.provider
		if provider == "dsh" {
			provider = "deepseek"
		}
		_, err = tx.Exec(ctx, `insert into model_accounts
			(id, workspace_id, user_id, provider, account_key, label, email, plan, kind,
			 credential_kind, status, quota, secret_ref, refresh_ref, expires_at, refresh_error, created_at, updated_at)
			values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
			on conflict (id) do update set workspace_id=excluded.workspace_id, user_id=excluded.user_id,
				provider=excluded.provider, account_key=excluded.account_key, label=excluded.label,
				email=excluded.email, plan=excluded.plan, kind=excluded.kind,
				credential_kind=excluded.credential_kind, status=excluded.status,
				quota=excluded.quota,
				secret_ref=excluded.secret_ref, refresh_ref=excluded.refresh_ref,
				expires_at=excluded.expires_at, refresh_error=excluded.refresh_error,
				updated_at=excluded.updated_at`, account.id, targetWorkspace, targetUser, provider,
			account.accountKey, account.label, account.email, account.plan, kind, account.credentialKind,
			status, quota, credentialRef, refreshRef, account.expiresAt, refreshError,
			account.createdAt, account.updatedAt)
		if err != nil {
			return fmt.Errorf("insert target account %s: %w", account.id, err)
		}
		counts[provider]++
	}
	pluginCount, err := migrateWorkspaceConnectors(ctx, sourcePool, tx, targetAEAD, workspaceIDs)
	if err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}
	providers := make([]string, 0, len(counts))
	for provider := range counts {
		providers = append(providers, provider)
	}
	sort.Strings(providers)
	fmt.Printf("migrated %d accounts", len(accounts))
	for _, provider := range providers {
		fmt.Printf(" %s=%d", provider, counts[provider])
	}
	fmt.Printf(" mcp_connectors=%d\n", pluginCount)
	return nil
}

func convertQuota(raw json.RawMessage, observedAt *time.Time) (json.RawMessage, error) {
	var source []sourceLimit
	if len(raw) == 0 {
		return json.RawMessage(`[]`), nil
	}
	if err := json.Unmarshal(raw, &source); err != nil {
		return nil, err
	}
	out := make([]targetLimit, 0, len(source))
	for _, window := range source {
		if strings.TrimSpace(window.Label) == "" || window.Percent < 0 {
			continue
		}
		target := targetLimit{Window: strings.ToLower(strings.TrimSpace(window.Label)), Used: window.Percent, Limit: 100}
		if window.ResetsAt != nil {
			target.ResetsAt = *window.ResetsAt
		}
		if observedAt != nil {
			target.ObservedAt = observedAt.UTC().Format(time.RFC3339)
		}
		out = append(out, target)
	}
	return json.Marshal(out)
}

func migrateWorkspaceConnectors(ctx context.Context, source *pgxpool.Pool, target pgx.Tx, aead cipher.AEAD, workspaceIDs []string) (int, error) {
	rows, err := source.Query(ctx, `select id::text, coalesce(mcp_config, '{}'::jsonb)::text
		from workspace where id = any($1::uuid[]) order by id`, workspaceIDs)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	total := 0
	for rows.Next() {
		var sourceWorkspace, raw string
		if err := rows.Scan(&sourceWorkspace, &raw); err != nil {
			return 0, err
		}
		var config struct {
			Servers map[string]json.RawMessage `json:"mcpServers"`
		}
		if err := json.Unmarshal([]byte(raw), &config); err != nil {
			return 0, fmt.Errorf("decode MCP configuration for workspace %s: %w", sourceWorkspace, err)
		}
		workspaceID, connectedBy, err := targetWorkspaceOwner(ctx, target, sourceWorkspace)
		if err != nil {
			return 0, err
		}
		for serverName, entry := range config.Servers {
			ref, err := insertTargetSecret(ctx, target, aead, workspaceID, entry)
			if err != nil {
				return 0, err
			}
			kind := "mcp:" + strings.ToLower(strings.TrimSpace(serverName))
			account, _ := json.Marshal(map[string]string{"name": serverName, "source": "v1 migration"})
			_, err = target.Exec(ctx, `insert into plugins (workspace_id, kind, status, account, secret_ref, connected_by)
				values ($1,$2,'connected',$3,$4,$5)
				on conflict (workspace_id,kind) do update set status='connected', account=excluded.account,
				secret_ref=excluded.secret_ref, connected_by=excluded.connected_by, updated_at=now()`,
				workspaceID, kind, account, ref, connectedBy)
			if err != nil {
				return 0, fmt.Errorf("insert connector %s: %w", serverName, err)
			}
			total++
		}
	}
	return total, rows.Err()
}

func targetIdentity(ctx context.Context, tx pgx.Tx, sourceWorkspace, email string) (uuid.UUID, uuid.UUID, error) {
	prefix := sourceWorkspace
	if len(prefix) > 8 {
		prefix = prefix[:8]
	}
	var workspaceID, userID uuid.UUID
	err := tx.QueryRow(ctx, `select w.id, u.id from workspaces w join members m on m.workspace_id=w.id
		join users u on u.id=m.user_id where (w.slug=$1 or exists(select 1 from workspace_slug_aliases alias where alias.workspace_id=w.id and alias.slug=$1)) and lower(u.email)=lower($2)`, "v1-"+prefix, email).
		Scan(&workspaceID, &userID)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("target identity for source workspace %s: %w", sourceWorkspace, err)
	}
	return workspaceID, userID, nil
}

func targetWorkspaceOwner(ctx context.Context, tx pgx.Tx, sourceWorkspace string) (uuid.UUID, uuid.UUID, error) {
	prefix := sourceWorkspace
	if len(prefix) > 8 {
		prefix = prefix[:8]
	}
	var workspaceID, userID uuid.UUID
	err := tx.QueryRow(ctx, `select w.id, m.user_id from workspaces w join members m on m.workspace_id=w.id
		where (w.slug=$1 or exists(select 1 from workspace_slug_aliases alias where alias.workspace_id=w.id and alias.slug=$1)) and m.role='owner' order by m.created_at limit 1`, "v1-"+prefix).Scan(&workspaceID, &userID)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("target owner for source workspace %s: %w", sourceWorkspace, err)
	}
	return workspaceID, userID, nil
}

func sourceCipher(ctx context.Context, pool *pgxpool.Pool, raw string) (cipher.AEAD, error) {
	var key []byte
	if encoded := strings.TrimSpace(raw); encoded != "" {
		decoded, err := base64.StdEncoding.DecodeString(encoded)
		if err != nil || len(decoded) != 32 {
			return nil, errors.New("SOURCE_SECRETS_KEY must be a base64-encoded 32-byte key")
		}
		key = decoded
	} else {
		if err := pool.QueryRow(ctx, `select value from server_secret where name='agent_account_secret_key'`).Scan(&key); err != nil {
			return nil, fmt.Errorf("read source managed agent-account key: %w", err)
		}
		if len(key) != 32 {
			return nil, fmt.Errorf("source managed agent-account key is %d bytes, expected 32", len(key))
		}
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}

func targetCipher(raw string) (cipher.AEAD, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, errors.New("TARGET_SECRETS_KEY is required")
	}
	key, err := hex.DecodeString(raw)
	if err != nil || len(key) != 32 {
		sum := sha256.Sum256([]byte(raw))
		key = sum[:]
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}

func openSource(aead cipher.AEAD, encoded string) ([]byte, error) {
	sealed, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return nil, err
	}
	if len(sealed) < aead.NonceSize()+aead.Overhead() {
		return nil, errors.New("ciphertext is too short")
	}
	return aead.Open(nil, sealed[:aead.NonceSize()], sealed[aead.NonceSize():], nil)
}

func insertTargetSecret(ctx context.Context, tx pgx.Tx, aead cipher.AEAD, workspace uuid.UUID, plaintext []byte) (string, error) {
	nonce := make([]byte, aead.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	sealed := aead.Seal(nonce, nonce, plaintext, []byte(workspace.String()))
	ref := "sec_" + uuid.NewString()
	_, err := tx.Exec(ctx, `insert into secrets (ref, workspace_id, ciphertext) values ($1,$2,$3)`, ref, workspace, sealed)
	return ref, err
}
