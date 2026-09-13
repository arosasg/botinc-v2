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

type Plugin struct {
	ID        uuid.UUID       `json:"id"`
	Kind      string          `json:"kind"`
	Status    string          `json:"status"`
	Scopes    json.RawMessage `json:"scopes"`
	Account   json.RawMessage `json:"account"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

const pluginCols = `id, kind, status, scopes, account, created_at, updated_at`

func (p *Plugin) scan() []any {
	return []any{&p.ID, &p.Kind, &p.Status, &p.Scopes, &p.Account, &p.CreatedAt, &p.UpdatedAt}
}

func (s *Server) listPlugins(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select `+pluginCols+` from plugins where workspace_id=$1 order by kind`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Plugin{}
	for rows.Next() {
		var p Plugin
		if err := rows.Scan(p.scan()...); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, p)
	}
	httpx.JSON(w, 200, map[string]any{"plugins": out})
}

func (s *Server) connectPlugin(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.ErrorCode(w, 403, "forbidden", "only an owner or admin can connect a plugin")
		return
	}
	var in struct {
		Kind    string          `json:"kind"`
		Scopes  json.RawMessage `json:"scopes"`
		Account json.RawMessage `json:"account"`
		Secret  string          `json:"secret"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	in.Kind = strings.ToLower(strings.TrimSpace(in.Kind))
	if in.Kind == "" {
		httpx.ErrorCode(w, 400, "kind_required", "say which plugin")
		return
	}
	if len(in.Scopes) == 0 {
		in.Scopes = json.RawMessage(`[]`)
	}
	if len(in.Account) == 0 {
		in.Account = json.RawMessage(`{}`)
	}
	ctx := r.Context()
	if in.Kind == "github" {
		var account struct {
			Login string `json:"login"`
			ID    int64  `json:"id"`
		}
		if strings.TrimSpace(in.Secret) == "" {
			httpx.Error(w, 400, "enter a GitHub token")
			return
		}
		if err := s.githubGet(ctx, in.Secret, "/user", &account); err != nil {
			httpx.Error(w, 400, err.Error())
			return
		}
		in.Account, _ = json.Marshal(account)
	}
	ref := ""
	if strings.TrimSpace(in.Secret) != "" {
		var err error
		if ref, err = s.writeSecret(ctx, sc.WorkspaceID, in.Secret); err != nil {
			if errors.Is(err, errNoSecretsKey) {
				httpx.ErrorCode(w, 503, "no_secrets_key", "this server cannot store credentials yet")
				return
			}
			s.fail(w, err)
			return
		}
	}
	var p Plugin
	err := s.pool.QueryRow(ctx, `insert into plugins (workspace_id, kind, scopes, account, secret_ref, connected_by) values ($1,$2,$3,$4,$5,$6)
		on conflict (workspace_id, kind) do update set status='connected', scopes=excluded.scopes, account=excluded.account,
		secret_ref=case when excluded.secret_ref <> '' then excluded.secret_ref else plugins.secret_ref end, updated_at=now()
		returning `+pluginCols, sc.WorkspaceID, in.Kind, in.Scopes, in.Account, ref, sc.UserID).Scan(p.scan()...)
	if err != nil {
		s.deleteSecret(ctx, ref)
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "plugin.connected", p)
	httpx.JSON(w, 201, map[string]any{"plugin": p})
}

func (s *Server) disconnectPlugin(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.ErrorCode(w, 403, "forbidden", "only an owner or admin can disconnect a plugin")
		return
	}
	id, ok := idParam(r, "id")
	if !ok {
		httpx.ErrorCode(w, 404, "plugin_not_found", "plugin not found")
		return
	}
	ctx := r.Context()
	var ref string
	err := s.pool.QueryRow(ctx, `delete from plugins where id=$1 and workspace_id=$2 returning secret_ref`, id, sc.WorkspaceID).Scan(&ref)
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.ErrorCode(w, 404, "plugin_not_found", "plugin not found")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	s.deleteSecret(ctx, ref)
	s.hub.Publish(sc.WorkspaceID, "plugin.disconnected", map[string]any{"id": id})
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}
