package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/arosasg/botinc-v2/runtime/internal/protocol"
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
}
