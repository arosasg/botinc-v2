package protocol

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestEveryCallCarriesTheRunToken(t *testing.T) {
	var seen string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seen = r.Header.Get("Authorization")
		if !strings.HasPrefix(r.URL.Path, "/api/runtime/runs/run-1/") {
			t.Errorf("call went to the wrong run: %s", r.URL.Path)
		}
		_, _ = io.WriteString(w, `{"run":{"id":"run-1","purpose":"chat"}}`)
	}))
	defer srv.Close()

	c := New(srv.URL, "run-1", "brt_secret")
	if _, err := c.Claim(context.Background()); err != nil {
		t.Fatal(err)
	}
	if seen != "Bearer brt_secret" {
		t.Fatalf("token not sent: %q", seen)
	}
}

func TestRejectedTokenIsNotRetried(t *testing.T) {
	var calls int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		atomic.AddInt32(&calls, 1)
		w.WriteHeader(401)
		_, _ = io.WriteString(w, `{"error":"invalid run token"}`)
	}))
	defer srv.Close()

	c := New(srv.URL, "run-1", "wrong")
	_, err := c.Claim(context.Background())
	if !errors.Is(err, ErrUnauthorized) {
		t.Fatalf("want ErrUnauthorized, got %v", err)
	}
	if n := atomic.LoadInt32(&calls); n != 1 {
		t.Fatalf("a rejected token must not be retried, saw %d calls", n)
	}
}

func TestServerErrorsAreRetried(t *testing.T) {
	var calls int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		if atomic.AddInt32(&calls, 1) < 3 {
			w.WriteHeader(503)
			return
		}
		_, _ = io.WriteString(w, `{"run":{"id":"run-1"}}`)
	}))
	defer srv.Close()

	c := New(srv.URL, "run-1", "brt_x")
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	if _, err := c.Claim(ctx); err != nil {
		t.Fatalf("a transient 503 should be survived: %v", err)
	}
	if n := atomic.LoadInt32(&calls); n != 3 {
		t.Fatalf("want 3 attempts, saw %d", n)
	}
}

func TestEventSequenceIncrements(t *testing.T) {
	var got []int
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Events []Event `json:"events"`
		}
		_ = json.NewDecoder(r.Body).Decode(&in)
		for _, e := range in.Events {
			got = append(got, e.Seq)
		}
		w.WriteHeader(200)
	}))
	defer srv.Close()

	c := New(srv.URL, "run-1", "brt_x")
	for i := 0; i < 3; i++ {
		if err := c.Emit(context.Background(), "log", map[string]any{"line": "x"}); err != nil {
			t.Fatal(err)
		}
	}
	if len(got) != 3 || got[0] != 1 || got[1] != 2 || got[2] != 3 {
		t.Fatalf("sequence numbers must increment: %v", got)
	}
}

func TestSpecDecodesTheWholeRun(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = io.WriteString(w, `{
			"run":{"id":"r1","purpose":"build","model":"auto","prompt":"Fix it","task_limit_cents":200},
			"steps":[{"key":"plan","name":"Plan","kind":"task"},{"key":"approval","name":"Your approval","kind":"approval"}],
			"issue":{"identifier":"BOT-7","title":"Broken","description":"details"},
			"repositories":[{"full_name":"a/b","default_branch":"main"}],
			"credential":{"provider":"claude","kind":"subscription","secret":"s"}
		}`)
	}))
	defer srv.Close()

	s, err := New(srv.URL, "r1", "brt_x").Spec(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if s.Issue == nil || s.Issue.Identifier != "BOT-7" {
		t.Fatalf("issue did not decode: %+v", s.Issue)
	}
	if len(s.Steps) != 2 || s.Steps[1].Kind != "approval" {
		t.Fatalf("steps did not decode: %+v", s.Steps)
	}
	if s.Credential == nil || s.Credential.Secret != "s" {
		t.Fatal("credential did not decode")
	}
	if len(s.Repositories) != 1 || s.Repositories[0].FullName != "a/b" {
		t.Fatal("repositories did not decode")
	}
}
