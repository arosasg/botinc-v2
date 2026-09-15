package api

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

// A conversation is workspace-wide: the Operator must see every connected
// repository and, once GitHub is connected, carry its credential so it can
// clone and push what the request is about without a per-message connector
// selection. Routine runs keep their explicit-connector contract (see
// TestSelectedConnectorsFollowChatAndRoutineRuns).
func TestConversationRunsCarryEveryWorkspaceRepositoryWithCredentials(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	ws := mustWorkspaceID(t, h)
	for _, name := range []string{"arosasg/botinc-v2", "didit-protocol/fe-application-console", "didit-protocol/service-didit-verification"} {
		if _, err := testPool.Exec(t.Context(), `insert into repositories (workspace_id,full_name,default_branch) values ($1,$2,'main')`, ws, name); err != nil {
			t.Fatal(err)
		}
	}
	environmentRef, err := h.server.writeSecret(t.Context(), ws, `{"PRIVATE_API_URL":"https://private.example.test"}`)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := testPool.Exec(t.Context(), `update repositories set setup=jsonb_build_object('environment_secret_ref',$3::text) where workspace_id=$1 and full_name=$2`, ws, "didit-protocol/service-didit-verification", environmentRef); err != nil {
		t.Fatal(err)
	}

	// Without GitHub the run still lists the repositories, so the answer can
	// say what is missing instead of guessing, and it carries no credential.
	spec := conversationRunSpec(t, h, "Which repositories can you see?")
	if len(spec.Repositories) != 3 {
		t.Fatalf("a conversation must list every workspace repository: %+v", spec.Repositories)
	}
	for _, repository := range spec.Repositories {
		if repository.Token != "" {
			t.Fatalf("no GitHub connection, yet a credential was issued: %+v", spec.Repositories)
		}
	}

	var connected struct {
		Plugin Plugin `json:"plugin"`
	}
	h.decode(h.do("POST", h.w("/plugins"), map[string]any{
		"kind":   "mcp:github",
		"secret": `{"command":"github-mcp-server","env":{"GITHUB_PERSONAL_ACCESS_TOKEN":"authorized-test-token"}}`,
	}, 201), &connected)

	spec = conversationRunSpec(t, h, "Review the open pull requests on all my repositories and fix the failing ones.")
	if len(spec.Repositories) != 3 {
		t.Fatalf("a conversation must list every workspace repository: %+v", spec.Repositories)
	}
	seen := map[string]bool{}
	for _, repository := range spec.Repositories {
		seen[repository.FullName] = true
		if repository.Token != "authorized-test-token" {
			t.Fatalf("every repository must carry the workspace GitHub credential: %+v", spec.Repositories)
		}
		if repository.FullName == "didit-protocol/service-didit-verification" && repository.Environment["PRIVATE_API_URL"] != "https://private.example.test" {
			t.Fatalf("repository environment did not reach the runtime spec: %+v", repository.Environment)
		}
	}
	if !seen["arosasg/botinc-v2"] || !seen["didit-protocol/fe-application-console"] || !seen["didit-protocol/service-didit-verification"] {
		t.Fatalf("repositories missing from the spec: %+v", spec.Repositories)
	}
	if len(spec.MCPConfig) != 0 {
		t.Fatalf("no connector was selected for the message, so none may be attached: %s", spec.MCPConfig)
	}
}

type runtimeRepositorySpec struct {
	MCPConfig    []byte `json:"mcp_config"`
	Repositories []struct {
		FullName      string            `json:"full_name"`
		DefaultBranch string            `json:"default_branch"`
		Token         string            `json:"token,omitempty"`
		Environment   map[string]string `json:"environment,omitempty"`
	} `json:"repositories"`
}

// conversationRunSpec sends one message in a fresh conversation, waits for its
// run to be dispatched, fetches the spec the runtime would receive and then
// finishes the run so the next message starts its own.
func conversationRunSpec(t *testing.T, h *harness, body string) runtimeRepositorySpec {
	t.Helper()
	var conversation struct {
		Conversation Conversation `json:"conversation"`
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"title": body}, 201), &conversation)
	var sent struct {
		Run struct {
			ID uuid.UUID `json:"id"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/conversations/"+conversation.Conversation.ID.String()+"/messages"), map[string]any{"body": body}, 201), &sent)
	token := ""
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) && token == "" {
		for _, dispatched := range h.box.seen() {
			if dispatched.RunID == sent.Run.ID.String() {
				token = dispatched.RunToken
			}
		}
		if token == "" {
			time.Sleep(20 * time.Millisecond)
		}
	}
	if token == "" {
		t.Fatal("the conversation run was never dispatched")
	}
	var spec runtimeRepositorySpec
	h.decode(runtimeCall(h, "GET", "/api/runtime/runs/"+sent.Run.ID.String()+"/spec", token, nil), &spec)
	if _, err := testPool.Exec(t.Context(), `update runs set status='done',finished_at=now() where id=$1`, sent.Run.ID); err != nil {
		t.Fatal(err)
	}
	return spec
}
