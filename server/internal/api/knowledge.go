package api

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Skill struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Body      string    `json:"body"`
	Enabled   bool      `json:"enabled"`
	CreatedBy uuid.UUID `json:"created_by"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (s *Server) listSkills(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select id,name,body,enabled,created_by,updated_at from skills where workspace_id=$1 order by name,id`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Skill{}
	for rows.Next() {
		var k Skill
		if err = rows.Scan(&k.ID, &k.Name, &k.Body, &k.Enabled, &k.CreatedBy, &k.UpdatedAt); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, k)
	}
	if err = rows.Err(); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]any{"skills": out})
}
func (s *Server) saveSkill(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.Error(w, 403, "only owners and admins can change workspace skills")
		return
	}
	var in struct {
		Name    *string `json:"name"`
		Body    *string `json:"body"`
		Enabled *bool   `json:"enabled"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	create := r.Method == http.MethodPost
	if create && (in.Name == nil || in.Body == nil) || in.Name != nil && (strings.TrimSpace(*in.Name) == "" || len(*in.Name) > 200) || in.Body != nil && (strings.TrimSpace(*in.Body) == "" || len(*in.Body) > 100000) {
		httpx.Error(w, 400, "a skill needs a name and instructions (up to 100000 bytes)")
		return
	}
	var k Skill
	var err error
	if create {
		err = s.pool.QueryRow(r.Context(), `insert into skills(workspace_id,name,body,created_by,enabled) values($1,$2,$3,$4,coalesce($5,true)) returning id,name,body,enabled,created_by,updated_at`, sc.WorkspaceID, in.Name, in.Body, sc.UserID, in.Enabled).Scan(&k.ID, &k.Name, &k.Body, &k.Enabled, &k.CreatedBy, &k.UpdatedAt)
	} else {
		id, ok := idParam(r, "id")
		if !ok {
			httpx.Error(w, 400, "bad skill id")
			return
		}
		err = s.pool.QueryRow(r.Context(), `update skills set name=coalesce($3,name),body=coalesce($4,body),enabled=coalesce($5,enabled),updated_at=now() where workspace_id=$1 and id=$2 returning id,name,body,enabled,created_by,updated_at`, sc.WorkspaceID, id, in.Name, in.Body, in.Enabled).Scan(&k.ID, &k.Name, &k.Body, &k.Enabled, &k.CreatedBy, &k.UpdatedAt)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.Error(w, 404, "skill not found")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "skill.updated", k)
	status := 200
	if create {
		status = 201
	}
	httpx.JSON(w, status, map[string]any{"skill": k})
}
func (s *Server) deleteSkill(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.Error(w, 403, "only owners and admins can delete workspace skills")
		return
	}
	id, ok := idParam(r, "id")
	if !ok {
		httpx.Error(w, 400, "bad skill id")
		return
	}
	tag, err := s.pool.Exec(r.Context(), `delete from skills where workspace_id=$1 and id=$2`, sc.WorkspaceID, id)
	if err != nil {
		s.fail(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		httpx.Error(w, 404, "skill not found")
		return
	}
	s.hub.Publish(sc.WorkspaceID, "skill.deleted", nil)
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

type Memory struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	Scope     string     `json:"scope"`
	ProjectID *uuid.UUID `json:"project_id"`
	Body      string     `json:"body"`
	Pinned    bool       `json:"pinned"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func (s *Server) listMemories(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select id,user_id,scope,project_id,body,pinned,updated_at from memories where workspace_id=$1 and (scope<>'personal' or user_id=$2) order by pinned desc,updated_at desc,id`, sc.WorkspaceID, sc.UserID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Memory{}
	for rows.Next() {
		var m Memory
		if err = rows.Scan(&m.ID, &m.UserID, &m.Scope, &m.ProjectID, &m.Body, &m.Pinned, &m.UpdatedAt); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, m)
	}
	if err = rows.Err(); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]any{"memories": out})
}
func (s *Server) saveMemory(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var in struct {
		Body      *string    `json:"body"`
		Scope     string     `json:"scope"`
		ProjectID *uuid.UUID `json:"project_id"`
		Pinned    *bool      `json:"pinned"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	create := r.Method == http.MethodPost
	if create && in.Body == nil || in.Body != nil && (strings.TrimSpace(*in.Body) == "" || len(*in.Body) > 100000) {
		httpx.Error(w, 400, "memory text is required (up to 100000 bytes)")
		return
	}
	var m Memory
	var err error
	if create {
		if in.Scope == "" {
			in.Scope = "personal"
		}
		if in.Scope != "personal" && in.Scope != "workspace" && in.Scope != "project" {
			httpx.Error(w, 400, "invalid memory scope")
			return
		}
		if in.Scope != "personal" && !requireRole(sc, "owner", "admin") {
			httpx.Error(w, 403, "only owners and admins can write shared memory")
			return
		}
		if (in.Scope == "project") != (in.ProjectID != nil) {
			httpx.Error(w, 400, "project scope requires a project")
			return
		}
		if in.ProjectID != nil {
			var valid bool
			err = s.pool.QueryRow(r.Context(), `select exists(select 1 from projects where id=$1 and workspace_id=$2)`, in.ProjectID, sc.WorkspaceID).Scan(&valid)
			if err != nil {
				s.fail(w, err)
				return
			}
			if !valid {
				httpx.Error(w, 404, "project not found")
				return
			}
		}
		err = s.pool.QueryRow(r.Context(), `insert into memories(workspace_id,user_id,scope,project_id,body,pinned) values($1,$2,$3,$4,$5,coalesce($6,false)) returning id,user_id,scope,project_id,body,pinned,updated_at`, sc.WorkspaceID, sc.UserID, in.Scope, in.ProjectID, in.Body, in.Pinned).Scan(&m.ID, &m.UserID, &m.Scope, &m.ProjectID, &m.Body, &m.Pinned, &m.UpdatedAt)
	} else {
		id, ok := idParam(r, "id")
		if !ok {
			httpx.Error(w, 400, "bad memory id")
			return
		}
		err = s.pool.QueryRow(r.Context(), `update memories set body=coalesce($4,body),pinned=coalesce($5,pinned),updated_at=now() where workspace_id=$1 and id=$2 and ((scope='personal' and user_id=$3) or (scope<>'personal' and $6)) returning id,user_id,scope,project_id,body,pinned,updated_at`, sc.WorkspaceID, id, sc.UserID, in.Body, in.Pinned, requireRole(sc, "owner", "admin")).Scan(&m.ID, &m.UserID, &m.Scope, &m.ProjectID, &m.Body, &m.Pinned, &m.UpdatedAt)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.Error(w, 404, "memory not found or not editable")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	// Do not broadcast private memory contents to the workspace.
	s.hub.Publish(sc.WorkspaceID, "memory.updated", nil)
	status := 200
	if create {
		status = 201
	}
	httpx.JSON(w, status, map[string]any{"memory": m})
}
func (s *Server) deleteMemory(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		httpx.Error(w, 400, "bad memory id")
		return
	}
	tag, err := s.pool.Exec(r.Context(), `delete from memories where workspace_id=$1 and id=$2 and ((scope='personal' and user_id=$3) or (scope<>'personal' and $4))`, sc.WorkspaceID, id, sc.UserID, requireRole(sc, "owner", "admin"))
	if err != nil {
		s.fail(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		httpx.Error(w, 404, "memory not found or not editable")
		return
	}
	s.hub.Publish(sc.WorkspaceID, "memory.deleted", nil)
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}
