package migration

import (
	"context"
	"encoding/json"
	"github.com/arosasg/botinc-v2/server/internal/db"
	"github.com/arosasg/botinc-v2/server/migrations"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"io"
	"log/slog"
	"os"
	"strings"
	"testing"
)

func row(v map[string]any) Row { var r Row; _ = json.Unmarshal(raw(v), &r); return r }

func TestLegacyMergedDevStatusIsComplete(t *testing.T) {
	if got := statuses["merged_dev"]; got != "done" {
		t.Fatalf("merged_dev maps to %q, want done", got)
	}
}

func TestGitHubRepositoryName(t *testing.T) {
	for input, want := range map[string]string{
		"https://github.com/arosasg/botinc-v2.git":             "arosasg/botinc-v2",
		"https://github.com/didit-protocol/service-didit-auth": "didit-protocol/service-didit-auth",
	} {
		got, err := githubRepositoryName(input)
		if err != nil || got != want {
			t.Fatalf("githubRepositoryName(%q) = %q, %v; want %q", input, got, err, want)
		}
	}
	for _, input := range []string{"http://github.com/a/b", "https://example.com/a/b", "https://github.com/a/b/extra", "https://token@github.com/a/b"} {
		if _, err := githubRepositoryName(input); err == nil {
			t.Fatalf("unsafe repository URL %q was accepted", input)
		}
	}
}

func TestImportRollbackReplayAndRelationships(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Fatal("TEST_DATABASE_URL required for migration database tests")
	}
	ctx := context.Background()
	admin, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	defer admin.Close()
	name := "migration_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if _, err := admin.Exec(ctx, "create database "+name); err != nil {
		t.Fatal(err)
	}
	defer admin.Exec(ctx, "drop database "+name+" with (force)")
	config, err := pgxpool.ParseConfig(url)
	if err != nil {
		t.Fatal(err)
	}
	config.ConnConfig.Database = name
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	d := &db.DB{Pool: pool}
	if err := db.Migrate(ctx, d, migrations.FS, slog.New(slog.NewTextHandler(io.Discard, nil))); err != nil {
		t.Fatal(err)
	}
	ws, user, parent, child, comment := uuid.New(), uuid.New(), uuid.New(), uuid.New(), uuid.New()
	when := "2026-09-13T00:00:00Z"
	s := &Snapshot{Hash: "snapshot-one", Manifest: Manifest{WorkspaceID: ws, IssueCount: 2}, Workspace: row(map[string]any{"id": ws, "name": "Migrated", "issue_prefix": "OLD", "created_at": when}), Members: []Row{row(map[string]any{"user_id": user, "email": "owner@example.test", "name": "Owner", "role": "owner"})}, Repositories: []Row{row(map[string]any{"url": "https://github.com/arosasg/botinc-v2.git"})}, Files: map[string]json.RawMessage{}}
	for n, id := range []uuid.UUID{parent, child} {
		i := row(map[string]any{"id": id, "workspace_id": ws, "number": n + 1, "title": "Source issue", "description": "Preserved text", "status": "backlog", "priority": "medium", "created_at": when, "updated_at": when, "creator_id": user, "assignee_type": "agent", "assignee_id": uuid.NewString()})
		if n == 1 {
			i["parent_issue_id"] = raw(parent)
		}
		s.Issues = append(s.Issues, i)
		s.Files["comments/"+id.String()+".json"] = json.RawMessage(`[]`)
	}
	s.Files["comments/"+child.String()+".json"] = raw([]any{map[string]any{"id": comment, "issue_id": child, "author_type": "user", "author_id": user, "content": "Historical comment", "created_at": when}})
	s.Manifest.Files = map[string]string{}
	if _, err := Apply(ctx, pool, s, "stranger@example.test", true); err == nil {
		t.Fatal("nonmember became migration owner")
	}
	preview, err := Apply(ctx, pool, s, "owner@example.test", false)
	if err != nil {
		t.Fatal(err)
	}
	if preview.Issues != 2 || preview.Comments != 1 || preview.Applied {
		t.Fatal(preview)
	}
	var count int
	pool.QueryRow(ctx, `select count(*) from workspaces`).Scan(&count)
	if count != 0 {
		t.Fatal("dry run persisted workspace")
	}
	report, err := Apply(ctx, pool, s, "owner@example.test", true)
	if err != nil {
		t.Fatal(err)
	}
	if !report.Applied {
		t.Fatal("import not committed")
	}
	replay, err := Apply(ctx, pool, s, "owner@example.test", true)
	if err != nil {
		t.Fatal(err)
	}
	if !replay.Replayed || replay.Issues != 2 || replay.Comments != 1 {
		t.Fatal(replay)
	}
	if replay.Repositories != 1 {
		t.Fatalf("repository replay count = %d, want 1", replay.Repositories)
	}
	var pid uuid.UUID
	var author uuid.UUID
	var text string
	if err := pool.QueryRow(ctx, `select parent_id from issues where id=$1`, child).Scan(&pid); err != nil || pid != parent {
		t.Fatal("parent lost", err)
	}
	if err := pool.QueryRow(ctx, `select c.body,u.id from issue_comments c join users u on c.author_user_id=u.id where c.id=$1 and u.email='owner@example.test'`, comment).Scan(&text, &author); err != nil || text != "Historical comment" {
		t.Fatal("comment attribution lost", err)
	}
	if err := pool.QueryRow(ctx, `select count(*) from repositories where workspace_id=$1 and full_name='arosasg/botinc-v2'`, ws).Scan(&count); err != nil || count != 1 {
		t.Fatal("repository lost or duplicated", err, count)
	}
	s.Hash = "changed-snapshot"
	if _, err := Apply(ctx, pool, s, "owner@example.test", true); err == nil {
		t.Fatal("changed snapshot silently overwrote imported work")
	}
}
