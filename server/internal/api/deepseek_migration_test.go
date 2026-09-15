package api

import (
	"io/fs"
	"testing"

	"github.com/google/uuid"

	"github.com/arosasg/botinc-v2/server/migrations"
)

func TestDeepSeekMigrationReusesWorkspaceOpenRouterSecret(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	var openRouter, legacy, reconnected struct {
		Account Account `json:"account"`
	}
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "openrouter", "kind": "api_key", "secret": "workspace-openrouter-key",
	}, 201), &openRouter)
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "deepseek", "kind": "api_key", "secret": "legacy-placeholder",
	}, 201), &legacy)
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "deepseek", "kind": "api_key", "secret": "manually-reconnected-key",
	}, 201), &reconnected)

	if _, err := testPool.Exec(t.Context(), `update model_accounts set status='limited',
		credential_kind='legacy', refresh_error='Legacy shared-credential profile requires reconnection'
		where id=$1`, legacy.Account.ID); err != nil {
		t.Fatal(err)
	}
	body, err := fs.ReadFile(migrations.FS, "0012_restore_deepseek_harness.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := testPool.Exec(t.Context(), string(body)); err != nil {
		t.Fatal(err)
	}

	var openRouterRef, legacyRef, reconnectedRef, status, kind, credentialKind, refreshError string
	if err := testPool.QueryRow(t.Context(), `select secret_ref from model_accounts where id=$1`, openRouter.Account.ID).Scan(&openRouterRef); err != nil {
		t.Fatal(err)
	}
	if err := testPool.QueryRow(t.Context(), `select secret_ref,status,kind,credential_kind,refresh_error
		from model_accounts where id=$1`, legacy.Account.ID).Scan(&legacyRef, &status, &kind, &credentialKind, &refreshError); err != nil {
		t.Fatal(err)
	}
	if err := testPool.QueryRow(t.Context(), `select secret_ref from model_accounts where id=$1`, reconnected.Account.ID).Scan(&reconnectedRef); err != nil {
		t.Fatal(err)
	}
	if openRouterRef == "" || legacyRef != openRouterRef {
		t.Fatal("the legacy harness did not inherit its workspace OpenRouter credential reference")
	}
	if status != "connected" || kind != "api_key" || credentialKind != "api_key" || refreshError != "" {
		t.Fatalf("the legacy harness was not restored: status=%s kind=%s credential_kind=%s error=%q", status, kind, credentialKind, refreshError)
	}
	if reconnectedRef == "" || reconnectedRef == openRouterRef {
		t.Fatal("the migration overwrote a manually reconnected DeepSeek account")
	}

	// The update is intentionally idempotent. A second application must not
	// turn manually reconnected accounts into shared-credential profiles.
	if _, err := testPool.Exec(t.Context(), string(body)); err != nil {
		t.Fatal(err)
	}
	var after uuid.UUID
	if err := testPool.QueryRow(t.Context(), `select id from model_accounts where id=$1 and secret_ref=$2`, reconnected.Account.ID, reconnectedRef).Scan(&after); err != nil {
		t.Fatal(err)
	}
}

func TestDeepSeekMigrationPrefersExplicitDeepSeekOpenRouterAccount(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	var generic, preferred, legacy struct {
		Account Account `json:"account"`
	}
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "openrouter", "kind": "api_key", "label": "Personal", "secret": "expired-generic-key",
	}, 201), &generic)
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "openrouter", "kind": "api_key", "label": "OpenRouter - DeepSeek", "secret": "working-deepseek-key",
	}, 201), &preferred)
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "deepseek", "kind": "api_key", "secret": "legacy-placeholder",
	}, 201), &legacy)

	if _, err := testPool.Exec(t.Context(), `update model_accounts set secret_ref=(select secret_ref from model_accounts where id=$1) where id=$2`, generic.Account.ID, legacy.Account.ID); err != nil {
		t.Fatal(err)
	}
	body, err := fs.ReadFile(migrations.FS, "0013_prefer_deepseek_openrouter_secret.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := testPool.Exec(t.Context(), string(body)); err != nil {
		t.Fatal(err)
	}

	var preferredRef, legacyRef string
	if err := testPool.QueryRow(t.Context(), `select secret_ref from model_accounts where id=$1`, preferred.Account.ID).Scan(&preferredRef); err != nil {
		t.Fatal(err)
	}
	if err := testPool.QueryRow(t.Context(), `select secret_ref from model_accounts where id=$1`, legacy.Account.ID).Scan(&legacyRef); err != nil {
		t.Fatal(err)
	}
	if preferredRef == "" || legacyRef != preferredRef {
		t.Fatal("the DeepSeek harness did not select its explicitly named OpenRouter credential")
	}
}
