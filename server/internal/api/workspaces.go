package api

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"net/mail"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/arosasg/botinc-v2/server/internal/auth"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
)

type Workspace struct {
	ID          uuid.UUID `json:"id"`
	Slug        string    `json:"slug"`
	Name        string    `json:"name"`
	Plan        string    `json:"plan"`
	IssuePrefix string    `json:"issue_prefix"`
	CreatedAt   time.Time `json:"created_at"`
	Role        string    `json:"role,omitempty"`
	Aliases     []string  `json:"aliases,omitempty"`
}

const workspaceCols = `w.id, w.slug, w.name, w.plan, w.issue_prefix, w.created_at`

func (ws *Workspace) scan() []any {
	return []any{&ws.ID, &ws.Slug, &ws.Name, &ws.Plan, &ws.IssuePrefix, &ws.CreatedAt}
}

var slugRe = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(name string) string {
	s := strings.Trim(slugRe.ReplaceAllString(strings.ToLower(name), "-"), "-")
	if len(s) > 40 {
		s = s[:40]
	}
	if s == "" {
		s = "workspace"
	}
	return s
}

func (s *Server) createWorkspaceFor(ctx context.Context, userID uuid.UUID, name string) (Workspace, error) {
	base := slugify(name)
	var ws Workspace
	for i := 0; i < 20; i++ {
		slug := base
		if i > 0 {
			raw := make([]byte, 3)
			_, _ = rand.Read(raw)
			slug = base + "-" + hex.EncodeToString(raw)
		}
		tx, err := s.pool.Begin(ctx)
		if err != nil {
			return ws, err
		}
		err = tx.QueryRow(ctx, `insert into workspaces (slug, name, created_by) values ($1,$2,$3) returning id, slug, name, plan, issue_prefix, created_at`, slug, strings.TrimSpace(name), userID).Scan(ws.scan()...)
		if err != nil {
			_ = tx.Rollback(ctx)
			if strings.Contains(err.Error(), "workspaces_slug_key") {
				continue
			}
			return ws, err
		}
		if _, err := tx.Exec(ctx, `insert into members (workspace_id, user_id, role) values ($1,$2,'owner')`, ws.ID, userID); err != nil {
			_ = tx.Rollback(ctx)
			return ws, err
		}
		if _, err := tx.Exec(ctx, `insert into routing_policies (workspace_id) values ($1)`, ws.ID); err != nil {
			_ = tx.Rollback(ctx)
			return ws, err
		}
		// Starter credit: $2.00 once, per the landing.
		if _, err := tx.Exec(ctx, `with claim as (
 insert into starter_credit_claims(user_id,workspace_id) values($2,$1) on conflict do nothing returning user_id
) insert into credit_ledger (workspace_id, kind, amount_cents, note) select $1,'grant',200,'Starter credit' from claim`, ws.ID, userID); err != nil {
			_ = tx.Rollback(ctx)
			return ws, err
		}
		if err := SeedWorkflows(ctx, tx, ws.ID); err != nil {
			_ = tx.Rollback(ctx)
			return ws, err
		}
		if err := tx.Commit(ctx); err != nil {
			return ws, err
		}
		ws.Role = "owner"
		return ws, nil
	}
	return ws, errors.New("could not allocate a workspace slug")
}

// seedWorkflows installs the three built-in workflows every workspace starts with.
func SeedWorkflows(ctx context.Context, tx pgx.Tx, ws uuid.UUID) error {
	type wf struct {
		key, name, desc string
		graph           map[string]any
	}
	step := func(key, name, kind, model string) map[string]any {
		return map[string]any{"key": key, "name": name, "kind": kind, "model": model}
	}
	list := []wf{
		{"fix-review", "Fix & review", "Plan → Implement → Review → Verify. A pull request waits for your approval.", map[string]any{
			"nodes":  []any{step("start", "Start", "start", ""), step("plan", "Plan", "task", "auto"), step("implement", "Implement", "task", "auto"), step("review", "Review", "task", "auto"), step("verify", "Verify", "task", ""), step("approval", "Your approval", "approval", ""), step("finish", "Finish", "finish", "")},
			"edges":  []any{[]string{"start", "plan"}, []string{"plan", "implement"}, []string{"implement", "review"}, []string{"review", "verify"}, []string{"verify", "approval"}, []string{"approval", "finish"}},
			"limits": map[string]any{"max_attempts": 3, "task_limit_cents": 200}}},
		{"answer", "Answer", "One reply from the Operator, with tools when needed.", map[string]any{
			"nodes": []any{step("start", "Start", "start", ""), step("answer", "Answer", "task", "auto"), step("finish", "Finish", "finish", "")},
			"edges": []any{[]string{"start", "answer"}, []string{"answer", "finish"}}, "limits": map[string]any{"task_limit_cents": 100}}},
		{"code-review", "Code review", "An independent reviewer reads the change against the issue and reports.", map[string]any{
			"nodes": []any{step("start", "Start", "start", ""), step("review", "Review", "task", "auto"), step("finish", "Finish", "finish", "")},
			"edges": []any{[]string{"start", "review"}, []string{"review", "finish"}}, "limits": map[string]any{"task_limit_cents": 100}}},
	}
	for _, w := range list {
		var id, vid uuid.UUID
		if err := tx.QueryRow(ctx, `insert into workflows (workspace_id, key, name, description) values ($1,$2,$3,$4) returning id`, ws, w.key, w.name, w.desc).Scan(&id); err != nil {
			return err
		}
		g, _ := json.Marshal(w.graph)
		if err := tx.QueryRow(ctx, `insert into workflow_versions (workflow_id, version, status, graph) values ($1,1,'active',$2) returning id`, id, g).Scan(&vid); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `update workflows set active_version_id=$2 where id=$1`, id, vid); err != nil {
			return err
		}
	}
	return nil
}

func (s *Server) listWorkspaces(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	rows, err := s.pool.Query(r.Context(), `select `+workspaceCols+`, m.role from workspaces w join members m on m.workspace_id=w.id where m.user_id=$1 order by w.created_at`, p.User.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Workspace{}
	for rows.Next() {
		var ws Workspace
		if err := rows.Scan(append(ws.scan(), &ws.Role)...); err != nil {
			s.fail(w, err)
			return
		}
		aliasRows, err := s.pool.Query(r.Context(), `select slug from workspace_slug_aliases where workspace_id=$1 order by created_at,slug`, ws.ID)
		if err != nil {
			s.fail(w, err)
			return
		}
		for aliasRows.Next() {
			var alias string
			if err := aliasRows.Scan(&alias); err != nil {
				aliasRows.Close()
				s.fail(w, err)
				return
			}
			ws.Aliases = append(ws.Aliases, alias)
		}
		if err := aliasRows.Err(); err != nil {
			aliasRows.Close()
			s.fail(w, err)
			return
		}
		aliasRows.Close()
		out = append(out, ws)
	}
	httpx.JSON(w, 200, map[string]any{"workspaces": out})
}

func (s *Server) createWorkspace(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	var in struct {
		Name string `json:"name"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if strings.TrimSpace(in.Name) == "" {
		httpx.Error(w, 400, "name is required")
		return
	}
	ws, err := s.createWorkspaceFor(r.Context(), p.User.ID, in.Name)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 201, ws)
}

func (s *Server) getWorkspace(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var ws Workspace
	if err := s.pool.QueryRow(r.Context(), `select `+workspaceCols+` from workspaces w where w.id=$1`, sc.WorkspaceID).Scan(ws.scan()...); err != nil {
		s.fail(w, err)
		return
	}
	ws.Role = sc.Role
	httpx.JSON(w, 200, ws)
}

func (s *Server) updateWorkspace(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.Error(w, 403, "only owners and admins can change the workspace")
		return
	}
	var in struct {
		Name        *string `json:"name"`
		IssuePrefix *string `json:"issue_prefix"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if in.IssuePrefix != nil {
		p := strings.ToUpper(strings.TrimSpace(*in.IssuePrefix))
		if len(p) < 2 || len(p) > 6 || slugRe.ReplaceAllString(strings.ToLower(p), "") != strings.ToLower(p) {
			httpx.Error(w, 400, "issue prefix must be 2-6 letters or digits")
			return
		}
		in.IssuePrefix = &p
	}
	if _, err := s.pool.Exec(r.Context(), `update workspaces set name=coalesce($2,name), issue_prefix=coalesce($3,issue_prefix) where id=$1`, sc.WorkspaceID, in.Name, in.IssuePrefix); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "workspace.updated", nil)
	s.getWorkspace(w, r)
}

// overview is the one call the workspace shell makes on load.
func (s *Server) overview(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	ctx := r.Context()
	var ws Workspace
	if err := s.pool.QueryRow(ctx, `select `+workspaceCols+` from workspaces w where w.id=$1`, sc.WorkspaceID).Scan(ws.scan()...); err != nil {
		s.fail(w, err)
		return
	}
	ws.Role = sc.Role
	counts := map[string]int{}
	rows, err := s.pool.Query(ctx, `select status, count(*) from issues where workspace_id=$1 group by status`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	for rows.Next() {
		var st string
		var n int
		_ = rows.Scan(&st, &n)
		counts[st] = n
	}
	rows.Close()
	var credits int
	_ = s.pool.QueryRow(ctx, `select coalesce(sum(amount_cents),0) from credit_ledger where workspace_id=$1`, sc.WorkspaceID).Scan(&credits)
	var running int
	_ = s.pool.QueryRow(ctx, `select count(*) from runs where workspace_id=$1 and status in ('provisioning','running')`, sc.WorkspaceID).Scan(&running)
	httpx.JSON(w, 200, map[string]any{"workspace": ws, "issue_counts": counts, "credit_cents": credits, "running_runs": running})
}

type memberRow struct {
	UserID    uuid.UUID `json:"user_id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	AvatarURL string    `json:"avatar_url"`
	Role      string    `json:"role"`
	JoinedAt  time.Time `json:"joined_at"`
}

func (s *Server) listMembers(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select u.id, u.email, u.name, u.avatar_url, m.role, m.created_at from members m join users u on u.id=m.user_id where m.workspace_id=$1 order by m.created_at`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []memberRow{}
	for rows.Next() {
		var m memberRow
		if err := rows.Scan(&m.UserID, &m.Email, &m.Name, &m.AvatarURL, &m.Role, &m.JoinedAt); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, m)
	}
	httpx.JSON(w, 200, map[string]any{"members": out})
}

func (s *Server) updateMember(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner") {
		httpx.Error(w, 403, "only the owner can change roles")
		return
	}
	uid, ok := idParam(r, "user")
	if !ok {
		httpx.Error(w, 400, "bad user id")
		return
	}
	var in struct {
		Role string `json:"role"`
	}
	if err := httpx.Decode(r, &in); err != nil || (in.Role != "admin" && in.Role != "member" && in.Role != "owner") {
		httpx.Error(w, 400, "role must be owner, admin or member")
		return
	}
	ctx := r.Context()
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(ctx)
	// Serialize all membership changes on the workspace, including removal.
	if _, err = tx.Exec(ctx, `select id from workspaces where id=$1 for update`, sc.WorkspaceID); err != nil {
		s.fail(w, err)
		return
	}
	var current string
	if err = tx.QueryRow(ctx, `select role from members where workspace_id=$1 and user_id=$2`, sc.WorkspaceID, uid).Scan(&current); errors.Is(err, pgx.ErrNoRows) {
		httpx.Error(w, 404, "member not found")
		return
	} else if err != nil {
		s.fail(w, err)
		return
	}
	var owners int
	if err = tx.QueryRow(ctx, `select count(*) from members where workspace_id=$1 and role='owner'`, sc.WorkspaceID).Scan(&owners); err != nil {
		s.fail(w, err)
		return
	}
	if current == "owner" && in.Role != "owner" && owners <= 1 {
		httpx.Error(w, 400, "a workspace keeps at least one owner")
		return
	}
	if _, err = tx.Exec(ctx, `update members set role=$3 where workspace_id=$1 and user_id=$2`, sc.WorkspaceID, uid, in.Role); err != nil {
		s.fail(w, err)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "member.updated", nil)

	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

func (s *Server) removeMember(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	uid, ok := idParam(r, "user")
	if !ok {
		httpx.Error(w, 400, "bad user id")
		return
	}
	if uid != sc.UserID && !requireRole(sc, "owner", "admin") {
		httpx.Error(w, 403, "only owners and admins can remove members")
		return
	}
	ctx := r.Context()
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(ctx)
	if _, err = tx.Exec(ctx, `select id from workspaces where id=$1 for update`, sc.WorkspaceID); err != nil {
		s.fail(w, err)
		return
	}
	var role string
	if err = tx.QueryRow(ctx, `select role from members where workspace_id=$1 and user_id=$2`, sc.WorkspaceID, uid).Scan(&role); errors.Is(err, pgx.ErrNoRows) {
		httpx.Error(w, 404, "member not found")
		return
	} else if err != nil {
		s.fail(w, err)
		return
	}
	if role == "owner" && sc.Role != "owner" {
		httpx.Error(w, 403, "only owners can remove an owner")
		return
	}
	var owners int
	if err = tx.QueryRow(ctx, `select count(*) from members where workspace_id=$1 and role='owner'`, sc.WorkspaceID).Scan(&owners); err != nil {
		s.fail(w, err)
		return
	}
	if role == "owner" && owners <= 1 {
		httpx.Error(w, 400, "a workspace keeps at least one owner")
		return
	}
	if _, err = tx.Exec(ctx, `delete from members where workspace_id=$1 and user_id=$2`, sc.WorkspaceID, uid); err != nil {
		s.fail(w, err)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "member.removed", nil)

	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

type invitationRow struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

func (s *Server) listInvitations(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select id, email, role, expires_at, created_at from invitations where workspace_id=$1 and accepted_at is null and expires_at>now() order by created_at desc`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []invitationRow{}
	for rows.Next() {
		var i invitationRow
		if err := rows.Scan(&i.ID, &i.Email, &i.Role, &i.ExpiresAt, &i.CreatedAt); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, i)
	}
	httpx.JSON(w, 200, map[string]any{"invitations": out})
}

func (s *Server) createInvitation(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.Error(w, 403, "only owners and admins can invite")
		return
	}
	var in struct {
		Email string `json:"email"`
		Role  string `json:"role"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if in.Role == "" {
		in.Role = "member"
	}
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	addr, err := mail.ParseAddress(in.Email)
	if err != nil || addr.Address != in.Email || (in.Role != "member" && in.Role != "admin") {
		httpx.Error(w, 400, "a valid email and member or admin role are required")
		return
	}
	raw := make([]byte, 24)
	_, _ = rand.Read(raw)
	token := base64.RawURLEncoding.EncodeToString(raw)
	h := sha256.Sum256([]byte(token))
	var id uuid.UUID
	if err := s.pool.QueryRow(r.Context(), `insert into invitations (workspace_id, email, role, token_hash, invited_by, expires_at) values ($1,$2,$3,$4,$5,now()+interval '7 days') returning id`,
		sc.WorkspaceID, strings.ToLower(strings.TrimSpace(in.Email)), in.Role, hex.EncodeToString(h[:]), sc.UserID).Scan(&id); err != nil {
		s.fail(w, err)
		return
	}
	link := strings.TrimRight(s.cfg.FrontendOrigin, "/") + "/invite/" + token
	httpx.JSON(w, 201, map[string]any{"id": id, "link": link})
}

func (s *Server) revokeInvitation(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.Error(w, 403, "only owners and admins can revoke invitations")
		return
	}
	id, ok := idParam(r, "id")
	if !ok {
		httpx.Error(w, 400, "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `delete from invitations where id=$1 and workspace_id=$2`, id, sc.WorkspaceID); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

func (s *Server) acceptInvite(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	var in struct {
		Token string `json:"token"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	ctx := r.Context()
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(ctx)
	h := sha256.Sum256([]byte(strings.TrimSpace(in.Token)))
	var wsID uuid.UUID
	var role string
	err = tx.QueryRow(ctx, `update invitations set accepted_at=now() where token_hash=$1 and email=$2 and accepted_at is null and expires_at>now() returning workspace_id,role`, hex.EncodeToString(h[:]), p.User.Email).Scan(&wsID, &role)
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.Error(w, 400, "that invitation is no longer valid for this account")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	if _, err = tx.Exec(ctx, `insert into members(workspace_id,user_id,role) values($1,$2,$3) on conflict do nothing`, wsID, p.User.ID, role); err != nil {
		s.fail(w, err)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(wsID, "member.created", nil)

	var ws Workspace
	_ = s.pool.QueryRow(r.Context(), `select `+workspaceCols+` from workspaces w where w.id=$1`, wsID).Scan(ws.scan()...)
	ws.Role = role
	httpx.JSON(w, 200, ws)
}

type routingPolicy struct {
	Order                 []string `json:"order"`
	Fallback              string   `json:"fallback"`
	DefaultTaskLimitCents int      `json:"default_task_limit_cents"`
}

func (s *Server) getRouting(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var raw []byte
	var p routingPolicy
	if err := s.pool.QueryRow(r.Context(), `select order_json, fallback, default_task_limit_cents from routing_policies where workspace_id=$1`, sc.WorkspaceID).Scan(&raw, &p.Fallback, &p.DefaultTaskLimitCents); err != nil {
		s.fail(w, err)
		return
	}
	_ = json.Unmarshal(raw, &p.Order)
	httpx.JSON(w, 200, p)
}

func (s *Server) putRouting(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var p routingPolicy
	if err := httpx.Decode(r, &p); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if p.Fallback != "ask" && p.Fallback != "credits" && p.Fallback != "wait" {
		httpx.Error(w, 400, "fallback must be ask, credits or wait")
		return
	}
	if len(p.Order) == 0 {
		p.Order = []string{"subscription", "api_key", "credits"}
	}
	if p.DefaultTaskLimitCents <= 0 {
		p.DefaultTaskLimitCents = 200
	}
	raw, _ := json.Marshal(p.Order)
	if _, err := s.pool.Exec(r.Context(), `insert into routing_policies (workspace_id, order_json, fallback, default_task_limit_cents) values ($1,$2,$3,$4)
		on conflict (workspace_id) do update set order_json=excluded.order_json, fallback=excluded.fallback, default_task_limit_cents=excluded.default_task_limit_cents, updated_at=now()`, sc.WorkspaceID, raw, p.Fallback, p.DefaultTaskLimitCents); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, p)
}
