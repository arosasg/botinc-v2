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
	sourceAEAD, err := sourceCipher(os.Getenv("SOURCE_SECRETS_KEY"))
	if err != nil {
		return err
	}
	targetAEAD, err := targetCipher(os.Getenv("TARGET_SECRETS_KEY"))
	if err != nil {
		return err
	}
	sourcePool, err := pgxpool.New(ctx, sourceURL)
	if err != nil {
		return err
	}
	defer sourcePool.Close()
	targetPool, err := pgxpool.New(ctx, targetURL)
	if err != nil {
		return err
	}
	defer targetPool.Close()

	workspaceIDs := strings.Split(workspaceCSV, ",")
	rows, err := sourcePool.Query(ctx, `
		select a.id::text, a.workspace_id::text, u.email, a.provider, a.account_key,
			a.label, a.email, a.plan, a.credential_kind, a.credential_encrypted,
			a.refresh_encrypted, a.expires_at, a.refresh_error, a.enabled,
			a.created_at, a.updated_at
		from agent_account a join "user" u on u.id=a.owner_id
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
			&account.enabled, &account.createdAt, &account.updatedAt); err != nil {
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
		credential, err := openSource(sourceAEAD, account.credentialEncrypted)
		if err != nil {
			return fmt.Errorf("decrypt credential for account %s: %w", account.id, err)
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
		if !account.enabled || account.refreshError != "" {
			status = "limited"
		}
		_, err = tx.Exec(ctx, `insert into model_accounts
			(id, workspace_id, user_id, provider, account_key, label, email, plan, kind,
			 credential_kind, status, secret_ref, refresh_ref, expires_at, refresh_error, created_at, updated_at)
			values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
			on conflict (id) do update set workspace_id=excluded.workspace_id, user_id=excluded.user_id,
			 provider=excluded.provider, account_key=excluded.account_key, label=excluded.label,
			 email=excluded.email, plan=excluded.plan, kind=excluded.kind,
			 credential_kind=excluded.credential_kind, status=excluded.status,
			 secret_ref=excluded.secret_ref, refresh_ref=excluded.refresh_ref,
			 expires_at=excluded.expires_at, refresh_error=excluded.refresh_error,
			 updated_at=excluded.updated_at`, account.id, targetWorkspace, targetUser, account.provider,
			account.accountKey, account.label, account.email, account.plan, kind, account.credentialKind,
			status, credentialRef, refreshRef, account.expiresAt, account.refreshError,
			account.createdAt, account.updatedAt)
		if err != nil {
			return fmt.Errorf("insert target account %s: %w", account.id, err)
		}
		counts[account.provider]++
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
	fmt.Println()
	return nil
}

func targetIdentity(ctx context.Context, tx pgx.Tx, sourceWorkspace, email string) (uuid.UUID, uuid.UUID, error) {
	prefix := sourceWorkspace
	if len(prefix) > 8 {
		prefix = prefix[:8]
	}
	var workspaceID, userID uuid.UUID
	err := tx.QueryRow(ctx, `select w.id, u.id from workspaces w join members m on m.workspace_id=w.id
		join users u on u.id=m.user_id where w.slug=$1 and lower(u.email)=lower($2)`, "v1-"+prefix, email).
		Scan(&workspaceID, &userID)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("target identity for source workspace %s: %w", sourceWorkspace, err)
	}
	return workspaceID, userID, nil
}

func sourceCipher(raw string) (cipher.AEAD, error) {
	key, err := base64.StdEncoding.DecodeString(strings.TrimSpace(raw))
	if err != nil || len(key) != 32 {
		return nil, errors.New("SOURCE_SECRETS_KEY must be a base64-encoded 32-byte key")
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
