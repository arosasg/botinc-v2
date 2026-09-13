package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
)

// A model account is a subscription or key the workspace can spend work
// against. The secret itself never appears in a response; the row carries a
// ref into the credential store and the runtime spec is the only reader.

type Account struct {
	ID        uuid.UUID       `json:"id"`
	UserID    *uuid.UUID      `json:"user_id"`
	Provider  string          `json:"provider"`
	Label     string          `json:"label"`
	Plan      string          `json:"plan"`
	Kind      string          `json:"kind"`
	Status    string          `json:"status"`
	Quota     json.RawMessage `json:"quota"`
	HasSecret bool            `json:"has_secret"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

const accountCols = `id, user_id, provider, label, plan, kind, status, quota, secret_ref <> '', created_at, updated_at`

func (a *Account) scan() []any {
	return []any{&a.ID, &a.UserID, &a.Provider, &a.Label, &a.Plan, &a.Kind, &a.Status, &a.Quota, &a.HasSecret, &a.CreatedAt, &a.UpdatedAt}
}

var accountProviders = map[string]bool{
	"claude": true, "codex": true, "cursor": true, "copilot": true,
	"gemini": true, "openrouter": true, "api": true,
}

var accountKinds = map[string]bool{"subscription": true, "api_key": true, "credits": true}

func (s *Server) listAccounts(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select `+accountCols+` from model_accounts where workspace_id=$1 order by created_at`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Account{}
	for rows.Next() {
		var a Account
		if err := rows.Scan(a.scan()...); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, a)
	}
	httpx.JSON(w, 200, map[string]any{"accounts": out})
}

func (s *Server) connectAccount(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var in struct {
		Provider string `json:"provider"`
		Label    string `json:"label"`
		Plan     string `json:"plan"`
		Kind     string `json:"kind"`
		Secret   string `json:"secret"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	in.Provider = strings.ToLower(strings.TrimSpace(in.Provider))
	if !accountProviders[in.Provider] {
		httpx.ErrorCode(w, 400, "unknown_provider", "that provider is not supported")
		return
	}
	if !accountKinds[in.Kind] {
		in.Kind = "subscription"
	}
	if in.Kind == "api_key" && strings.TrimSpace(in.Secret) == "" {
		httpx.ErrorCode(w, 400, "secret_required", "an API key account needs a key")
		return
	}
	if in.Label == "" {
		in.Label = in.Provider
	}
	ctx := r.Context()
	ref := ""
	if strings.TrimSpace(in.Secret) != "" {
		var err error
		ref, err = s.writeSecret(ctx, sc.WorkspaceID, strings.TrimSpace(in.Secret))
		if err != nil {
			if errors.Is(err, errNoSecretsKey) {
				httpx.ErrorCode(w, 503, "no_secrets_key", "this server cannot store credentials yet")
				return
			}
			s.fail(w, err)
			return
		}
	}
	var a Account
	if err := s.pool.QueryRow(ctx, `insert into model_accounts (workspace_id, user_id, provider, label, plan, kind, secret_ref) values ($1,$2,$3,$4,$5,$6,$7) returning `+accountCols,
		sc.WorkspaceID, sc.UserID, in.Provider, in.Label, in.Plan, in.Kind, ref).Scan(a.scan()...); err != nil {
		s.deleteSecret(ctx, ref)
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "account.connected", a)
	httpx.JSON(w, 201, map[string]any{"account": a})
}

func (s *Server) updateAccount(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		httpx.ErrorCode(w, 404, "account_not_found", "account not found")
		return
	}
	var in struct {
		Label  *string         `json:"label"`
		Plan   *string         `json:"plan"`
		Status *string         `json:"status"`
		Quota  json.RawMessage `json:"quota"`
		Secret *string         `json:"secret"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if in.Status != nil {
		switch *in.Status {
		case "connected", "limited", "disconnected":
		default:
			httpx.ErrorCode(w, 400, "bad_status", "unknown status")
			return
		}
	}
	ctx := r.Context()
	if in.Secret != nil && strings.TrimSpace(*in.Secret) != "" {
		var old string
		_ = s.pool.QueryRow(ctx, `select secret_ref from model_accounts where id=$1 and workspace_id=$2`, id, sc.WorkspaceID).Scan(&old)
		ref, err := s.writeSecret(ctx, sc.WorkspaceID, strings.TrimSpace(*in.Secret))
		if err != nil {
			s.fail(w, err)
			return
		}
		if _, err := s.pool.Exec(ctx, `update model_accounts set secret_ref=$3 where id=$1 and workspace_id=$2`, id, sc.WorkspaceID, ref); err != nil {
			s.fail(w, err)
			return
		}
		s.deleteSecret(ctx, old)
	}
	var a Account
	err := s.pool.QueryRow(ctx, `update model_accounts set label=coalesce($3,label), plan=coalesce($4,plan), status=coalesce($5,status),
		quota=coalesce($6,quota), updated_at=now() where id=$1 and workspace_id=$2 returning `+accountCols,
		id, sc.WorkspaceID, in.Label, in.Plan, in.Status, in.Quota).Scan(a.scan()...)
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.ErrorCode(w, 404, "account_not_found", "account not found")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "account.updated", a)
	httpx.JSON(w, 200, map[string]any{"account": a})
}

func (s *Server) disconnectAccount(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		httpx.ErrorCode(w, 404, "account_not_found", "account not found")
		return
	}
	ctx := r.Context()
	var ref string
	err := s.pool.QueryRow(ctx, `delete from model_accounts where id=$1 and workspace_id=$2 returning secret_ref`, id, sc.WorkspaceID).Scan(&ref)
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.ErrorCode(w, 404, "account_not_found", "account not found")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	s.deleteSecret(ctx, ref)
	s.hub.Publish(sc.WorkspaceID, "account.disconnected", map[string]any{"id": id})
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}
