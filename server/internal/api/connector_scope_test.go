package api

import (
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestSelectedConnectorsFollowChatAndRoutineRuns(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var connected struct {
		Plugin Plugin `json:"plugin"`
	}
	h.decode(h.do("POST", h.w("/plugins"), map[string]any{
		"kind":   "mcp:github",
		"secret": `{"command":"github-mcp-server","env":{"GITHUB_PERSONAL_ACCESS_TOKEN":"authorized-test-token"}}`,
	}, 201), &connected)
	if _, err := testPool.Exec(t.Context(), `insert into repositories (workspace_id,full_name,default_branch) values ($1,'arosasg/botinc-v2','main')`, mustWorkspaceID(t, h)); err != nil {
		t.Fatal(err)
	}

	var routine struct {
		Autopilot Autopilot `json:"autopilot"`
	}
	h.decode(h.do("POST", h.w("/autopilots"), map[string]any{
		"name": "Review pull requests", "prompt": "Review every pull request that needs attention.",
		"trigger": map[string]any{"kind": "manual"}, "plugin_ids": []uuid.UUID{connected.Plugin.ID},
	}, 201), &routine)
	if len(routine.Autopilot.PluginIDs) != 1 || routine.Autopilot.PluginIDs[0] != connected.Plugin.ID {
		t.Fatalf("routine did not retain its selected connector: %+v", routine.Autopilot.PluginIDs)
	}
	var fired struct {
		Run struct {
			ID uuid.UUID `json:"id"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/autopilots/"+routine.Autopilot.ID.String()+"/trigger"), nil, 202), &fired)
	assertRunPlugin(t, fired.Run.ID, connected.Plugin.ID)
	config, err := h.server.runtimeMCPConfig(t.Context(), mustWorkspaceID(t, h), fired.Run.ID)
	if err != nil || !strings.Contains(string(config), `"github"`) {
		t.Fatalf("runtime did not receive the routine connector: %s, %v", config, err)
	}
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) && len(h.box.seen()) == 0 {
		time.Sleep(20 * time.Millisecond)
	}
	specs := h.box.seen()
	if len(specs) == 0 {
		t.Fatal("routine was never dispatched")
	}
	specRec := runtimeCall(h, "GET", "/api/runtime/runs/"+fired.Run.ID.String()+"/spec", specs[0].RunToken, nil)
	var spec struct {
		Repositories []struct {
			FullName string `json:"full_name"`
			Token    string `json:"token,omitempty"`
		} `json:"repositories"`
	}
	h.decode(specRec, &spec)
	if len(spec.Repositories) != 1 || spec.Repositories[0].FullName != "arosasg/botinc-v2" || spec.Repositories[0].Token != "" {
		t.Fatalf("routine spec must not receive an unrelated repository checkout credential: %+v", spec.Repositories)
	}
	if _, err := testPool.Exec(t.Context(), `update runs set status='done',finished_at=now() where id=$1`, fired.Run.ID); err != nil {
		t.Fatal(err)
	}
	for _, fullName := range []string{"arosasg/second", "arosasg/third", "arosasg/fourth", "arosasg/fifth", "arosasg/sixth"} {
		if _, err := testPool.Exec(t.Context(), `insert into repositories (workspace_id,full_name,default_branch) values ($1,$2,'main')`, mustWorkspaceID(t, h), fullName); err != nil {
			t.Fatal(err)
		}
	}

	var conversation struct {
		Conversation Conversation `json:"conversation"`
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"title": "Use GitHub"}, 201), &conversation)
	var sent struct {
		Run struct {
			ID uuid.UUID `json:"id"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/conversations/"+conversation.Conversation.ID.String()+"/messages"), map[string]any{
		"body": "Inspect the repository.", "plugin_ids": []uuid.UUID{connected.Plugin.ID},
	}, 201), &sent)
	assertRunPlugin(t, sent.Run.ID, connected.Plugin.ID)
	deadline = time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) && len(h.box.seen()) < 2 {
		time.Sleep(20 * time.Millisecond)
	}
	specs = h.box.seen()
	if len(specs) < 2 {
		t.Fatal("chat was never dispatched")
	}
	chatSpecRec := runtimeCall(h, "GET", "/api/runtime/runs/"+sent.Run.ID.String()+"/spec", specs[len(specs)-1].RunToken, nil)
	h.decode(chatSpecRec, &spec)
	if len(spec.Repositories) != 6 {
		t.Fatalf("chat spec received %d repositories, want every connected repository", len(spec.Repositories))
	}
	for _, repository := range spec.Repositories {
		if repository.Token != "authorized-test-token" {
			t.Fatalf("chat repository %s has no workspace GitHub credential", repository.FullName)
		}
	}
}

func assertRunPlugin(t *testing.T, runID, pluginID uuid.UUID) {
	t.Helper()
	var count int
	if err := testPool.QueryRow(t.Context(), `select count(*) from run_plugins where run_id=$1 and plugin_id=$2`, runID, pluginID).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatalf("run %s did not retain plugin %s", runID, pluginID)
	}
}
