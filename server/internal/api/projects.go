package api

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
)

type Project struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Repos     int       `json:"repositories"`
	OpenWork  int       `json:"open_issues"`
}

func (s *Server) listProjects(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select p.id, p.name, p.created_at,
		(select count(*) from repositories rp where rp.project_id=p.id),
		(select count(*) from issues i where i.project_id=p.id and i.status not in ('done','cancelled'))
		from projects p where p.workspace_id=$1 order by p.created_at`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Project{}
	for rows.Next() {
		var p Project
		if err := rows.Scan(&p.ID, &p.Name, &p.CreatedAt, &p.Repos, &p.OpenWork); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, p)
	}
	httpx.JSON(w, 200, map[string]any{"projects": out})
}

func (s *Server) createProject(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var in struct {
		Name string `json:"name"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	in.Name = strings.TrimSpace(in.Name)
	if in.Name == "" {
		httpx.ErrorCode(w, 400, "name_required", "a project needs a name")
		return
	}
	var p Project
	if err := s.pool.QueryRow(r.Context(), `insert into projects (workspace_id, name) values ($1,$2) returning id, name, created_at`, sc.WorkspaceID, in.Name).Scan(&p.ID, &p.Name, &p.CreatedAt); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "project.created", p)
	httpx.JSON(w, 201, map[string]any{"project": p})
}

type Repository struct {
	ID             uuid.UUID  `json:"id"`
	ProjectID      *uuid.UUID `json:"project_id"`
	Provider       string     `json:"provider"`
	FullName       string     `json:"full_name"`
	DefaultBranch  string     `json:"default_branch"`
	InstallationID *int64     `json:"installation_id"`
	CreatedAt      time.Time  `json:"created_at"`
}

func (s *Server) listRepositories(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select id, project_id, provider, full_name, default_branch, installation_id, created_at from repositories where workspace_id=$1 order by full_name`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Repository{}
	for rows.Next() {
		var rp Repository
		if err := rows.Scan(&rp.ID, &rp.ProjectID, &rp.Provider, &rp.FullName, &rp.DefaultBranch, &rp.InstallationID, &rp.CreatedAt); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, rp)
	}
	httpx.JSON(w, 200, map[string]any{"repositories": out})
}

func (s *Server) addRepository(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.ErrorCode(w, 403, "forbidden", "only an owner or admin can connect a repository")
		return
	}
	var in struct {
		FullName       string     `json:"full_name"`
		ProjectID      *uuid.UUID `json:"project_id"`
		DefaultBranch  string     `json:"default_branch"`
		InstallationID *int64     `json:"installation_id"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	in.FullName = strings.TrimSpace(in.FullName)
	if !strings.Contains(in.FullName, "/") {
		httpx.ErrorCode(w, 400, "bad_repository", "use owner/name")
		return
	}
	if in.DefaultBranch == "" {
		in.DefaultBranch = "main"
	}
	var rp Repository
	err := s.pool.QueryRow(r.Context(), `insert into repositories (workspace_id, project_id, full_name, default_branch, installation_id)
		values ($1,$2,$3,$4,$5)
		on conflict (workspace_id, full_name) do update set project_id=excluded.project_id, default_branch=excluded.default_branch, installation_id=excluded.installation_id
		returning id, project_id, provider, full_name, default_branch, installation_id, created_at`,
		sc.WorkspaceID, in.ProjectID, in.FullName, in.DefaultBranch, in.InstallationID).
		Scan(&rp.ID, &rp.ProjectID, &rp.Provider, &rp.FullName, &rp.DefaultBranch, &rp.InstallationID, &rp.CreatedAt)
	if err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "repository.connected", rp)
	httpx.JSON(w, 201, map[string]any{"repository": rp})
}
