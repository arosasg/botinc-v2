package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type sourceEnvironmentGroup struct {
	workspaceID   string
	repositoryURL string
	values        map[string]string
	secretKeys    []string
}

type sourceEnvironmentKeyring struct {
	Version      int               `json:"version"`
	CurrentKeyID int               `json:"current_key_id"`
	Keys         map[string]string `json:"keys"`
}

var validEnvironmentKey = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)

func migrateRepositoryEnvironments(ctx context.Context, source *pgxpool.Pool, target pgx.Tx, targetAEAD cipher.AEAD, workspaceIDs []string) (int, error) {
	keyring, err := sourceEnvironmentCiphers(ctx, source)
	if err != nil {
		return 0, err
	}
	rows, err := source.Query(ctx, `select g.workspace_id::text, g.repository_url, v.key, v.is_secret, v.value_plain, v.value_sealed
		from workspace_env_group g join workspace_env_var v on v.group_id=g.id and v.workspace_id=g.workspace_id
		where g.workspace_id=any($1::uuid[]) and g.repository_url is not null
		order by g.workspace_id,g.repository_url,v.key`, workspaceIDs)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	groups := map[string]*sourceEnvironmentGroup{}
	order := []string{}
	for rows.Next() {
		var workspaceID, repositoryURL, key string
		var isSecret bool
		var plain *string
		var sealed []byte
		if err := rows.Scan(&workspaceID, &repositoryURL, &key, &isSecret, &plain, &sealed); err != nil {
			return 0, err
		}
		if !validEnvironmentKey.MatchString(key) || blockedEnvironmentKey(key) {
			continue
		}
		groupKey := workspaceID + "\x00" + repositoryURL
		group := groups[groupKey]
		if group == nil {
			group = &sourceEnvironmentGroup{workspaceID: workspaceID, repositoryURL: repositoryURL, values: map[string]string{}}
			groups[groupKey] = group
			order = append(order, groupKey)
		}
		value := ""
		if isSecret {
			opened, err := openSourceEnvironment(keyring, sealed)
			if err != nil {
				return 0, fmt.Errorf("decrypt repository environment %s key %s: %w", repositoryURL, key, err)
			}
			value = string(opened)
			group.secretKeys = append(group.secretKeys, key)
		} else if plain != nil {
			value = *plain
		}
		group.values[key] = value
	}
	if err := rows.Err(); err != nil {
		return 0, err
	}

	migrated := 0
	for _, groupKey := range order {
		group := groups[groupKey]
		workspaceID, _, err := targetWorkspaceOwner(ctx, target, group.workspaceID)
		if err != nil {
			return 0, err
		}
		repositoryID, existingSetup, err := targetRepository(ctx, target, workspaceID, group.repositoryURL)
		if err != nil {
			return 0, err
		}
		plaintext, err := json.Marshal(group.values)
		if err != nil {
			return 0, err
		}
		ref, err := insertTargetSecret(ctx, target, targetAEAD, workspaceID, plaintext)
		if err != nil {
			return 0, err
		}
		variableKeys := make([]string, 0, len(group.values))
		for key := range group.values {
			variableKeys = append(variableKeys, key)
		}
		sort.Strings(variableKeys)
		sort.Strings(group.secretKeys)
		patch, _ := json.Marshal(map[string]any{
			"environment_secret_ref":    ref,
			"environment_variable_keys": variableKeys,
			"environment_secret_keys":   group.secretKeys,
		})
		if _, err := target.Exec(ctx, `update repositories set setup=setup || $2::jsonb where id=$1`, repositoryID, patch); err != nil {
			return 0, err
		}
		var old struct {
			EnvironmentSecretRef string `json:"environment_secret_ref"`
		}
		if json.Unmarshal(existingSetup, &old) == nil && old.EnvironmentSecretRef != "" && old.EnvironmentSecretRef != ref {
			if _, err := target.Exec(ctx, `delete from secrets where ref=$1`, old.EnvironmentSecretRef); err != nil {
				return 0, err
			}
		}
		migrated++
	}
	return migrated, nil
}

func targetRepository(ctx context.Context, target pgx.Tx, workspaceID uuid.UUID, repositoryURL string) (uuid.UUID, []byte, error) {
	fullName, err := repositoryFullName(repositoryURL)
	if err != nil {
		return uuid.Nil, nil, err
	}
	var id uuid.UUID
	var setup []byte
	err = target.QueryRow(ctx, `select id,setup from repositories where workspace_id=$1 and lower(full_name)=lower($2)`, workspaceID, fullName).Scan(&id, &setup)
	if err == nil {
		return id, setup, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, nil, err
	}
	parts := strings.Split(fullName, "/")
	rows, err := target.Query(ctx, `select id,setup from repositories where workspace_id=$1 and lower(split_part(full_name,'/',2))=lower($2) order by full_name limit 2`, workspaceID, parts[1])
	if err != nil {
		return uuid.Nil, nil, err
	}
	defer rows.Close()
	count := 0
	for rows.Next() {
		if err := rows.Scan(&id, &setup); err != nil {
			return uuid.Nil, nil, err
		}
		count++
	}
	if err := rows.Err(); err != nil {
		return uuid.Nil, nil, err
	}
	if count != 1 {
		return uuid.Nil, nil, fmt.Errorf("source repository environment %s matches %d target repositories", repositoryURL, count)
	}
	return id, setup, nil
}

func repositoryFullName(raw string) (string, error) {
	value := strings.TrimSpace(strings.TrimSuffix(raw, ".git"))
	value = strings.TrimPrefix(value, "git@github.com:")
	value = strings.TrimPrefix(value, "ssh://git@github.com/")
	value = strings.TrimPrefix(value, "https://github.com/")
	value = strings.TrimPrefix(value, "http://github.com/")
	value = strings.Trim(value, "/")
	parts := strings.Split(value, "/")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", fmt.Errorf("invalid GitHub repository URL %q", raw)
	}
	return parts[0] + "/" + parts[1], nil
}

func sourceEnvironmentCiphers(ctx context.Context, source *pgxpool.Pool) (map[byte]cipher.AEAD, error) {
	raw := []byte(strings.TrimSpace(os.Getenv("SOURCE_ENV_VAULT_KEYRING")))
	if len(raw) == 0 {
		if err := source.QueryRow(ctx, `select value from server_secret where name='env_vault_keyring'`).Scan(&raw); err != nil {
			return nil, fmt.Errorf("read source environment keyring: %w", err)
		}
	}
	var stored sourceEnvironmentKeyring
	if err := json.Unmarshal(raw, &stored); err != nil {
		return nil, fmt.Errorf("decode source environment keyring: %w", err)
	}
	if stored.Version != 1 || stored.CurrentKeyID < 1 || stored.CurrentKeyID > 255 || len(stored.Keys) == 0 {
		return nil, errors.New("source environment keyring is invalid")
	}
	result := make(map[byte]cipher.AEAD, len(stored.Keys))
	for rawID, encoded := range stored.Keys {
		id, err := strconv.Atoi(rawID)
		if err != nil || id < 1 || id > 255 {
			return nil, fmt.Errorf("invalid source environment key id %q", rawID)
		}
		key, err := base64.StdEncoding.DecodeString(encoded)
		if err != nil || len(key) != 32 {
			return nil, fmt.Errorf("source environment key %d is not 32 bytes", id)
		}
		block, err := aes.NewCipher(key)
		if err != nil {
			return nil, err
		}
		aead, err := cipher.NewGCM(block)
		if err != nil {
			return nil, err
		}
		result[byte(id)] = aead
	}
	if _, ok := result[byte(stored.CurrentKeyID)]; !ok {
		return nil, errors.New("source environment keyring current key is missing")
	}
	return result, nil
}

func openSourceEnvironment(keyring map[byte]cipher.AEAD, sealed []byte) ([]byte, error) {
	if len(sealed) < 2 {
		return nil, errors.New("source environment ciphertext is too short")
	}
	id := sealed[0]
	aead := keyring[id]
	if aead == nil {
		return nil, fmt.Errorf("source environment ciphertext references unknown key %d", id)
	}
	payload := sealed[1:]
	if len(payload) < aead.NonceSize()+aead.Overhead() {
		return nil, errors.New("source environment ciphertext is too short")
	}
	return aead.Open(nil, payload[:aead.NonceSize()], payload[aead.NonceSize():], sealed[:1])
}

func blockedEnvironmentKey(key string) bool {
	upper := strings.ToUpper(key)
	if strings.HasPrefix(upper, "BOTINC_") {
		return true
	}
	switch upper {
	case "HOME", "PATH", "USER", "SHELL", "TERM", "TMPDIR", "TMP", "TEMP",
		"CODEX_HOME", "CLAUDE_CONFIG_DIR", "CURSOR_DATA_DIR", "CURSOR_MCP_AUTH_SOURCE",
		"XDG_CACHE_HOME", "XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_STATE_HOME":
		return true
	}
	return false
}
