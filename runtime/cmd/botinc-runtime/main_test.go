package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/arosasg/botinc-v2/runtime/internal/protocol"
	"github.com/arosasg/botinc-v2/runtime/internal/workflow"
)

func TestRunReportsSpecFailureAfterClaim(t *testing.T) {
	var (
		mu       sync.Mutex
		finished map[string]any
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/api/runtime/runs/run-spec-failure/claim":
			_, _ = w.Write([]byte(`{"run":{"id":"run-spec-failure","purpose":"chat"}}`))
		case "/api/runtime/runs/run-spec-failure/spec":
			http.Error(w, `{"error":"account needs reconnect"}`, http.StatusConflict)
		case "/api/runtime/runs/run-spec-failure/finish":
			var payload map[string]any
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Errorf("decode finish: %v", err)
			}
			mu.Lock()
			finished = payload
			mu.Unlock()
			_, _ = w.Write([]byte(`{"ok":true}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	t.Setenv("BOTINC_API_URL", server.URL)
	t.Setenv("BOTINC_RUN_ID", "run-spec-failure")
	t.Setenv("BOTINC_RUN_TOKEN", "brt_test")
	t.Setenv("BOTINC_WORKDIR", t.TempDir())

	err := run()
	if err == nil {
		t.Fatal("expected the spec failure to be returned")
	}
	mu.Lock()
	defer mu.Unlock()
	if finished == nil {
		t.Fatal("claimed run was not finished after spec failure")
	}
	if finished["status"] != "failed" {
		t.Fatalf("finish status = %v, want failed", finished["status"])
	}
	if finished["error"] != `spec: GET /spec: 409 Conflict: {"error":"account needs reconnect"}` {
		t.Fatalf("finish error = %v", finished["error"])
	}
}

func TestMaterializeAttachmentsAndExposeThemInChatPrompt(t *testing.T) {
	const contents = "tab labels: Issue and Workflow"
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/runtime/runs/run-1/attachments/attachment-1" || r.Header.Get("Authorization") != "Bearer brt_test" {
			http.NotFound(w, r)
			return
		}
		_, _ = w.Write([]byte(contents))
	}))
	defer server.Close()

	spec := protocol.Spec{
		Messages: []protocol.Message{{ID: "message-1", Role: "user", Body: "Read the image."}},
		Attachments: []protocol.Attachment{{
			ID: "attachment-1", MessageID: "message-1", Filename: "screen.png",
			ContentType: "image/png", SizeBytes: int64(len(contents)),
		}},
	}
	workdir := t.TempDir()
	client := protocol.New(server.URL, "run-1", "brt_test")
	if err := materializeAttachments(context.Background(), client, &spec, workdir); err != nil {
		t.Fatal(err)
	}
	wantPath := filepath.Join(workdir, "attachments", "attachment-1-screen.png")
	got, err := os.ReadFile(wantPath)
	if err != nil || string(got) != contents {
		t.Fatalf("materialized attachment = %q, %v", got, err)
	}
	prompt := chatPrompt(spec)
	if !strings.Contains(prompt, `Attachment "screen.png" (image/png, 30 bytes) is available at `+wantPath) {
		t.Fatalf("attachment path missing from prompt: %s", prompt)
	}
	if !strings.Contains(prompt, "Do not wait indefinitely for external CI") {
		t.Fatalf("chat prompt does not tell the agent to return before asynchronous work exhausts the run: %s", prompt)
	}
}

func TestVisibleTimeoutAnswerPreservesTheLatestVerifiedUpdate(t *testing.T) {
	got := visibleTimeoutAnswer("CI is green for PR #42.", fmt.Errorf("agent stopped: %w", context.DeadlineExceeded))
	if !strings.Contains(got, "reached its execution limit") || !strings.Contains(got, "CI is green for PR #42.") {
		t.Fatalf("timeout answer = %q", got)
	}
}

func TestVisibleTimeoutAnswerIgnoresOrdinaryFailures(t *testing.T) {
	if got := visibleTimeoutAnswer("partial", errors.New("provider rejected the request")); got != "" {
		t.Fatalf("ordinary failure produced a timeout answer: %q", got)
	}
}

func TestAutopilotPromptUsesConnectorsWithoutAssumingACheckout(t *testing.T) {
	spec := protocol.Spec{Run: protocol.Run{Prompt: "Summarize new support mail."}}
	prompt := autopilotPrompt(spec, workflow.Node{Key: "summarize", Kind: "task", Prompt: "Use Gmail."}, "Found three messages.", nil)
	for _, want := range []string{"explicitly connected tools", "Summarize new support mail.", "Use Gmail.", "Found three messages."} {
		if !strings.Contains(prompt, want) {
			t.Fatalf("autopilot prompt missing %q: %s", want, prompt)
		}
	}
	if strings.Contains(prompt, "Work in this checkout") {
		t.Fatalf("autopilot prompt incorrectly requires a repository checkout: %s", prompt)
	}
}

func TestRemainingBudgetSupportsUnmeteredAndBoundedRoutines(t *testing.T) {
	if got := remainingBudget(0, 0); got != 0 {
		t.Fatalf("unmetered budget = %d, want 0", got)
	}
	if got := remainingBudget(200, 63); got != 137 {
		t.Fatalf("remaining budget = %d, want 137", got)
	}
}

func TestAutopilotDecisionPromptNamesTheAllowedBranches(t *testing.T) {
	graph := workflow.Graph{Edges: [][]string{{"decision", "yes", "ready"}, {"decision", "no", "blocked"}}}
	prompt := autopilotPrompt(protocol.Spec{}, workflow.Node{Key: "decision", Kind: "condition"}, "", workflowChoices(graph, "decision"))
	if !strings.Contains(prompt, "Respond with exactly one of: ready, blocked") {
		t.Fatalf("decision prompt does not constrain the branch: %s", prompt)
	}
}
