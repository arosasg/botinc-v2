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
	serveTestGitHub(t, h)

	var connected struct {
		Plugin Plugin `json:"plugin"`
	}
	h.decode(h.do("POST", h.w("/plugins"), map[string]any{
		"kind":   "mcp:github",
		"secret": `{"command":"github-mcp-server","env":{"GITHUB_PERSONAL_ACCESS_TOKEN":"authorized-test-token"}}`,
	}, 201), &connected)
	h.do("POST", h.w("/repositories"), map[string]any{"full_name": "arosasg/botinc-v2"}, 201)

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
			Token    string `json:"token"`
		} `json:"repositories"`
	}
	h.decode(specRec, &spec)
	if len(spec.Repositories) != 1 || spec.Repositories[0].FullName != "arosasg/botinc-v2" || spec.Repositories[0].Token != "authorized-test-token" {
		t.Fatalf("routine spec did not receive its verified repository token: %+v", spec.Repositories)
	}
	if _, err := testPool.Exec(t.Context(), `update runs set status='done',finished_at=now() where id=$1`, fired.Run.ID); err != nil {
		t.Fatal(err)
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
