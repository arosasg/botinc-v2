package api

import (
	"testing"

	"github.com/google/uuid"
)

func TestWorkspaceSlugAliasKeepsMigratedLinksWorking(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	oldSlug := h.ws
	canonical := "didit-" + uuid.NewString()[:8]
	var workspaceID uuid.UUID
	if err := testPool.QueryRow(t.Context(), `update workspaces set slug=$2 where slug=$1 returning id`, oldSlug, canonical).Scan(&workspaceID); err != nil {
		t.Fatal(err)
	}
	if _, err := testPool.Exec(t.Context(), `insert into workspace_slug_aliases(slug,workspace_id) values($1,$2)`, oldSlug, workspaceID); err != nil {
		t.Fatal(err)
	}
	var workspace Workspace
	h.decode(h.do("GET", "/api/w/"+oldSlug, nil, 200), &workspace)
	if workspace.Slug != canonical {
		t.Fatalf("old link should return canonical slug %q, got %q", canonical, workspace.Slug)
	}
	var list struct {
		Workspaces []Workspace `json:"workspaces"`
	}
	h.decode(h.do("GET", "/api/workspaces", nil, 200), &list)
	if len(list.Workspaces) != 1 || len(list.Workspaces[0].Aliases) != 1 || list.Workspaces[0].Aliases[0] != oldSlug {
		t.Fatalf("workspace selector must expose the old shareable link as an alias: %+v", list.Workspaces)
	}
}

func TestConversationEffortSurvivesImmediateAndQueuedRuns(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var created struct {
		Conversation Conversation `json:"conversation"`
		Run          struct {
			ID     uuid.UUID `json:"id"`
			Effort string    `json:"effort"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "Start", "effort": "High"}, 201), &created)
	if created.Run.Effort != "High" {
		t.Fatalf("immediate run lost composer effort: %+v", created.Run)
	}
	var stepEffort string
	if err := testPool.QueryRow(t.Context(), `select effort from run_steps where run_id=$1 order by idx limit 1`, created.Run.ID).Scan(&stepEffort); err != nil {
		t.Fatal(err)
	}
	if stepEffort != "High" {
		t.Fatalf("run step lost composer effort: %q", stepEffort)
	}
	h.do("POST", h.w("/conversations/"+created.Conversation.ID.String()+"/messages"), map[string]any{"body": "Next", "effort": "Low"}, 201)
	var queuedEffort string
	if err := testPool.QueryRow(t.Context(), `select effort from message_queue where conversation_id=$1`, created.Conversation.ID).Scan(&queuedEffort); err != nil {
		t.Fatal(err)
	}
	if queuedEffort != "Low" {
		t.Fatalf("queued message lost composer effort: %q", queuedEffort)
	}
}
