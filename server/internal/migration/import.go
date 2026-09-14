// Package migration imports a complete, hashed CLI export into a separate v2
// workspace. It never changes v1 and never starts imported automation.
package migration

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/arosasg/botinc-v2/server/internal/api"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Row map[string]json.RawMessage

func (r Row) Text(k string) string  { var s string; _ = json.Unmarshal(r[k], &s); return s }
func (r Row) Int(k string) int      { var n int; _ = json.Unmarshal(r[k], &n); return n }
func (r Row) ID(k string) uuid.UUID { id, _ := uuid.Parse(r.Text(k)); return id }
func raw(v any) []byte              { b, _ := json.Marshal(v); return b }

type Manifest struct {
	Format       int               `json:"format"`
	WorkspaceID  uuid.UUID         `json:"workspace_id"`
	IssueCount   int               `json:"issue_count"`
	RoutineCount int               `json:"routine_count"`
	Files        map[string]string `json:"files"`
}
type Snapshot struct {
	Manifest                  Manifest
	Hash                      string
	Files                     map[string]json.RawMessage
	Workspace                 Row
	Members, Projects, Issues []Row
	Routines                  []struct {
		Autopilot Row   `json:"autopilot"`
		Triggers  []Row `json:"triggers"`
	}
}
type Report struct {
	WorkspaceID   uuid.UUID `json:"workspace_id"`
	Slug          string    `json:"slug"`
	Issues        int       `json:"issues"`
	Comments      int       `json:"comments"`
	Routines      int       `json:"routines"`
	ArchivedFiles int       `json:"archived_files"`
	Applied       bool      `json:"applied"`
	Replayed      bool      `json:"replayed"`
	Warnings      []string  `json:"warnings"`
}

func Load(dir string) (*Snapshot, error) {
	b, err := os.ReadFile(filepath.Join(dir, "manifest.json"))
	if err != nil {
		return nil, err
	}
	s := &Snapshot{Files: map[string]json.RawMessage{}}
	if err := json.Unmarshal(b, &s.Manifest); err != nil {
		return nil, err
	}
	sum := sha256.Sum256(b)
	s.Hash = hex.EncodeToString(sum[:])
	if s.Manifest.Format != 1 || s.Manifest.WorkspaceID == uuid.Nil {
		return nil, errors.New("invalid export manifest")
	}
	for name, digest := range s.Manifest.Files {
		if !filepath.IsLocal(name) || filepath.Ext(name) != ".json" {
			return nil, errors.New("unsafe export path")
		}
		b, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			return nil, err
		}
		sum := sha256.Sum256(b)
		if hex.EncodeToString(sum[:]) != digest || !json.Valid(b) {
			return nil, fmt.Errorf("export integrity failed: %s", name)
		}
		s.Files[name] = b
	}
	for name, target := range map[string]any{"workspace.json": &s.Workspace, "members.json": &s.Members, "projects.json": &s.Projects, "issues.json": &s.Issues, "routines-full.json": &s.Routines} {
		if err := json.Unmarshal(s.Files[name], target); err != nil {
			return nil, fmt.Errorf("%s: %w", name, err)
		}
	}
	if s.Workspace.ID("id") != s.Manifest.WorkspaceID || len(s.Issues) != s.Manifest.IssueCount || len(s.Routines) != s.Manifest.RoutineCount {
		return nil, errors.New("manifest counts or workspace mismatch")
	}
	ids := map[uuid.UUID]bool{}
	numbers := map[int]bool{}
	for _, i := range s.Issues {
		id := i.ID("id")
		if id == uuid.Nil || ids[id] || i.ID("workspace_id") != s.Manifest.WorkspaceID || i.Int("number") < 1 || numbers[i.Int("number")] {
			return nil, errors.New("invalid or duplicate issue identity")
		}
		ids[id] = true
		numbers[i.Int("number")] = true
		for _, kind := range []string{"comments", "runs"} {
			if _, ok := s.Files[kind+"/"+id.String()+".json"]; !ok {
				return nil, fmt.Errorf("missing %s history for issue %s", kind, id)
			}
		}
		if _, ok := statuses[i.Text("status")]; !ok {
			return nil, fmt.Errorf("unsupported issue status %q", i.Text("status"))
		}
	}
	for _, i := range s.Issues {
		if id := i.ID("parent_issue_id"); id != uuid.Nil && !ids[id] {
			return nil, errors.New("export has a parent outside its issue inventory")
		}
	}
	return s, nil
}

var statuses = map[string]string{"backlog": "todo", "todo": "todo", "in_progress": "blocked", "in_review": "in_review", "merged_dev": "done", "blocked": "blocked", "done": "done", "cancelled": "cancelled"}
var priorities = map[string]string{"urgent": "urgent", "high": "high", "medium": "normal", "normal": "normal", "low": "low", "none": "low"}

func Apply(ctx context.Context, pool *pgxpool.Pool, s *Snapshot, ownerEmail string, apply bool) (Report, error) {
	ws := s.Manifest.WorkspaceID
	report := Report{WorkspaceID: ws, Slug: "v1-" + ws.String()[:8], Issues: len(s.Issues), ArchivedFiles: len(s.Files), Warnings: []string{"Imported routines stay paused until provider connections, instructions and schedules are verified.", "Historical run records are archived; old local computers and agent identities are not recreated.", "Attachments retain source references; attachment storage transfer remains a separate migration check."}}
	ownerAllowed := false
	for _, m := range s.Members {
		if strings.EqualFold(m.Text("email"), ownerEmail) && (m.Text("role") == "owner" || m.Text("role") == "admin") {
			ownerAllowed = true
		}
	}
	if !ownerAllowed {
		return report, errors.New("requested owner is not an exported workspace owner or admin")
	}
	tx, err := pool.Begin(ctx)
	if err != nil {
		return report, err
	}
	defer tx.Rollback(ctx)
	var existing string
	if err := tx.QueryRow(ctx, `select snapshot_sha256 from migration_workspaces where source_workspace_id=$1`, ws).Scan(&existing); err == nil {
		if existing != s.Hash {
			return report, errors.New("workspace already imported from another snapshot; an explicit delta migration is required")
		}
		report.Replayed = true
		if err := tx.QueryRow(ctx, `select count(*) from issues where workspace_id=$1`, ws).Scan(&report.Issues); err != nil {
			return report, err
		}
		if err := tx.QueryRow(ctx, `select count(*) from issue_comments c join issues i on i.id=c.issue_id where i.workspace_id=$1`, ws).Scan(&report.Comments); err != nil {
			return report, err
		}
		if err := tx.QueryRow(ctx, `select count(*) from autopilots where workspace_id=$1`, ws).Scan(&report.Routines); err != nil {
			return report, err
		}
		return report, nil
	}
	var occupied bool
	if err := tx.QueryRow(ctx, `select exists(select 1 from workspaces where id=$1)`, ws).Scan(&occupied); err != nil {
		return report, err
	}
	if occupied {
		return report, errors.New("target workspace ID belongs to an existing workspace")
	}
	users := map[uuid.UUID]uuid.UUID{}
	var owner uuid.UUID
	for _, m := range s.Members {
		role := m.Text("role")
		if role != "owner" && role != "admin" && role != "member" {
			return report, fmt.Errorf("unsupported member role %q", role)
		}
		email := m.Text("email")
		if email == "" || m.ID("user_id") == uuid.Nil {
			return report, errors.New("invalid exported member")
		}
		var id uuid.UUID
		if err := tx.QueryRow(ctx, `insert into users(email,name) values($1,$2) on conflict(email) do update set email=excluded.email returning id`, email, m.Text("name")).Scan(&id); err != nil {
			return report, err
		}
		users[m.ID("user_id")] = id
		if strings.EqualFold(email, ownerEmail) {
			owner = id
		}
	}
	if owner == uuid.Nil {
		return report, errors.New("migration owner not mapped")
	}
	prefix := s.Workspace.Text("issue_prefix")
	if prefix == "" {
		prefix = "BOT"
	}
	if _, err := tx.Exec(ctx, `insert into workspaces(id,slug,name,issue_prefix,created_by,created_at) values($1,$2,$3,$4,$5,$6)`, ws, report.Slug, s.Workspace.Text("name"), prefix, owner, s.Workspace.Text("created_at")); err != nil {
		return report, err
	}
	for _, m := range s.Members {
		if _, err := tx.Exec(ctx, `insert into members(workspace_id,user_id,role) values($1,$2,$3)`, ws, users[m.ID("user_id")], m.Text("role")); err != nil {
			return report, err
		}
	}
	if _, err := tx.Exec(ctx, `insert into routing_policies(workspace_id) values($1)`, ws); err != nil {
		return report, err
	}
	if err := api.SeedWorkflows(ctx, tx, ws); err != nil {
		return report, err
	}
	var workflow uuid.UUID
	if err := tx.QueryRow(ctx, `select id from workflows where workspace_id=$1 and key='fix-review'`, ws).Scan(&workflow); err != nil {
		return report, err
	}
	projects := map[uuid.UUID]bool{}
	for _, p := range s.Projects {
		id := p.ID("id")
		if id == uuid.Nil {
			return report, errors.New("invalid project ID")
		}
		projects[id] = true
		if _, err := tx.Exec(ctx, `insert into projects(id,workspace_id,name,created_at) values($1,$2,$3,$4)`, id, ws, p.Text("title"), p.Text("created_at")); err != nil {
			return report, err
		}
	}
	for _, i := range s.Issues {
		var project, author, assignee any
		if id := i.ID("project_id"); id != uuid.Nil {
			if !projects[id] {
				return report, errors.New("issue refers to missing project")
			}
			project = id
		}
		if id, ok := users[i.ID("creator_id")]; ok {
			author = id
		}
		if i.Text("assignee_type") == "user" {
			if id, ok := users[i.ID("assignee_id")]; ok {
				assignee = id
			}
		}
		priority, ok := priorities[i.Text("priority")]
		if !ok {
			return report, fmt.Errorf("unsupported priority %q", i.Text("priority"))
		}
		source := map[string]any{"kind": "migration", "version": "v1", "id": i.Text("id"), "identifier": i.Text("identifier"), "original_status": i.Text("status"), "metadata": i["metadata"], "assignee_type": i.Text("assignee_type"), "assignee_id": i.Text("assignee_id")}
		if _, err := tx.Exec(ctx, `insert into issues(id,workspace_id,project_id,number,title,description,status,priority,assignee_user_id,workflow_id,source,created_by,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, i.ID("id"), ws, project, i.Int("number"), i.Text("title"), i.Text("description"), statuses[i.Text("status")], priority, assignee, workflow, raw(source), author, i.Text("created_at"), i.Text("updated_at")); err != nil {
			return report, err
		}
	}
	for _, i := range s.Issues {
		if parent := i.ID("parent_issue_id"); parent != uuid.Nil {
			if _, err := tx.Exec(ctx, `update issues set parent_id=$2 where id=$1`, i.ID("id"), parent); err != nil {
				return report, err
			}
		}
		var comments []Row
		if err := json.Unmarshal(s.Files["comments/"+i.Text("id")+".json"], &comments); err != nil {
			return report, err
		}
		for _, c := range comments {
			if c.ID("issue_id") != i.ID("id") || c.ID("id") == uuid.Nil {
				return report, errors.New("comment identity mismatch")
			}
			var author any
			kind := "system"
			if id, ok := users[c.ID("author_id")]; ok && c.Text("author_type") == "user" {
				author = id
				kind = "user"
			}
			if _, err := tx.Exec(ctx, `insert into issue_comments(id,issue_id,author_user_id,author_kind,body,created_at,source) values($1,$2,$3,$4,$5,$6,$7)`, c.ID("id"), i.ID("id"), author, kind, c.Text("content"), c.Text("created_at"), raw(c)); err != nil {
				return report, err
			}
			report.Comments++
		}
	}
	for _, full := range s.Routines {
		a := full.Autopilot
		if a.ID("workspace_id") != ws || a.ID("id") == uuid.Nil {
			return report, errors.New("routine identity mismatch")
		}
		triggers := full.Triggers
		if len(triggers) == 0 {
			triggers = []Row{{"kind": json.RawMessage(`"manual"`)}}
		}
		for n, t := range triggers {
			id := a.ID("id")
			if n > 0 {
				id = uuid.NewSHA1(a.ID("id"), []byte(t.Text("id")))
			}
			trigger := map[string]any{"kind": "manual"}
			if t.Text("kind") == "schedule" {
				trigger = map[string]any{"kind": "schedule", "cron": t.Text("cron_expression"), "tz": t.Text("timezone")}
			}
			name := a.Text("title")
			if n > 0 {
				name += " - " + t.Text("label")
			}
			source := map[string]any{"v1": full, "original_enabled": a.Text("status") == "active", "single_agent": true, "remote_only": true, "migration_hold": "verify runtime tools, permissions and trigger before activation"}
			if _, err := tx.Exec(ctx, `insert into autopilots(id,workspace_id,name,description,trigger,prompt,enabled,created_by,created_at,updated_at,source) values($1,$2,$3,$4,$5,$6,false,$7,$8,$9,$10)`, id, ws, name, a.Text("description"), raw(trigger), a.Text("description"), owner, a.Text("created_at"), a.Text("updated_at"), raw(source)); err != nil {
				return report, err
			}
			report.Routines++
		}
	}
	for name, payload := range s.Files {
		if _, err := tx.Exec(ctx, `insert into migration_records(workspace_id,source_path,sha256,payload) values($1,$2,$3,$4)`, ws, name, s.Manifest.Files[name], payload); err != nil {
			return report, err
		}
	}
	if _, err := tx.Exec(ctx, `update workspaces set issue_counter=(select coalesce(max(number),0) from issues where workspace_id=$1) where id=$1`, ws); err != nil {
		return report, err
	}
	if _, err := tx.Exec(ctx, `insert into migration_workspaces(source_workspace_id,workspace_id,snapshot_sha256,source_issue_count,source_routine_count) values($1,$1,$2,$3,$4)`, ws, s.Hash, s.Manifest.IssueCount, s.Manifest.RoutineCount); err != nil {
		return report, err
	}
	if apply {
		if err := tx.Commit(ctx); err != nil {
			return report, err
		}
		report.Applied = true
	}
	return report, nil
}
