package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
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
