package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/arosasg/botinc-v2/server/internal/auth"
	"github.com/arosasg/botinc-v2/server/internal/config"
	"github.com/arosasg/botinc-v2/server/internal/db"
	"github.com/arosasg/botinc-v2/server/internal/realtime"
	"github.com/arosasg/botinc-v2/server/internal/runs"
	"github.com/arosasg/botinc-v2/server/internal/sandbox"
	"github.com/arosasg/botinc-v2/server/migrations"
)

// These tests talk to a real Postgres. There is no skip path: a missing or
// unreachable database fails the run loudly, because a suite that silently
// passes without its database is worse than no suite.

var (
	testPool  *pgxpool.Pool
	testDBURL string
)

func TestMain(m *testing.M) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		fmt.Fprintln(os.Stderr, "TEST_DATABASE_URL is required; these tests need a real Postgres")
		os.Exit(1)
	}
	ctx := context.Background()
	admin, err := pgxpool.New(ctx, url)
	if err != nil {
		fmt.Fprintln(os.Stderr, "connect:", err)
		os.Exit(1)
	}
	if err := admin.Ping(ctx); err != nil {
		fmt.Fprintln(os.Stderr, "ping:", err)
		os.Exit(1)
	}
	// A throwaway database per run keeps the suite from colliding with any
	// other task's schema on a shared server.
	name := "botinc_api_test_" + strings.ReplaceAll(uuid.NewString()[:8], "-", "")
	if _, err := admin.Exec(ctx, `create database `+name); err != nil {
		fmt.Fprintln(os.Stderr, "create database:", err)
		os.Exit(1)
	}
	admin.Close()

	testDBURL = swapDatabase(url, name)
	d, err := db.Open(ctx, testDBURL)
	if err != nil {
		fmt.Fprintln(os.Stderr, "open test database:", err)
		os.Exit(1)
	}
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	if err := db.Migrate(ctx, d, migrations.FS, log); err != nil {
		fmt.Fprintln(os.Stderr, "migrate:", err)
		os.Exit(1)
	}
	testPool = d.Pool

	code := m.Run()

	d.Close()
	if admin, err := pgxpool.New(ctx, url); err == nil {
		_, _ = admin.Exec(ctx, `drop database if exists `+name+` with (force)`)
		admin.Close()
	}
	os.Exit(code)
}

func swapDatabase(url, name string) string {
	if i := strings.LastIndex(url, "/"); i >= 0 {
		rest := ""
		if j := strings.Index(url[i:], "?"); j >= 0 {
			rest = url[i+j:]
		}
		return url[:i+1] + name + rest
	}
	return url
}

// fakeSandbox stands in for a cloud provider: it records what was asked for
// and never starts anything, so run routing can be tested without a VM.
type fakeSandbox struct {
	mu      sync.Mutex
	specs   []sandbox.Spec
	killed  []string
	failing bool
}

func (f *fakeSandbox) Name() string { return "fake" }

func (f *fakeSandbox) Provision(_ context.Context, spec sandbox.Spec) (*sandbox.Sandbox, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.failing {
		return nil, sandbox.ErrUnavailable
	}
	f.specs = append(f.specs, spec)
	return &sandbox.Sandbox{Provider: "fake", ExternalID: "sb_" + spec.RunID}, nil
}

func (f *fakeSandbox) Kill(_ context.Context, id string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.killed = append(f.killed, id)
	return nil
}

func (f *fakeSandbox) seen() []sandbox.Spec {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]sandbox.Spec{}, f.specs...)
}

// harness is one server wired to the test database, plus a signed-in client.
type harness struct {
	t      *testing.T
	server *Server
	router http.Handler
	box    *fakeSandbox
	token  string
	ws     string
	userID uuid.UUID
}

func newHarness(t *testing.T) *harness {
	t.Helper()
	cfg := config.Config{
		Env:             "test",
		FrontendOrigin:  "http://localhost:3100",
		PublicAPIURL:    "http://api.test",
		DevLoginCode:    "000000",
		SecretsKey:      "a3f1c07d9b2e45568a1d0c3e7f92b4d6a3f1c07d9b2e45568a1d0c3e7f92b4d6",
		SandboxProvider: "fake",
	}
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	a := auth.New(testPool, cfg.DevLoginCode, "", false)
	hub := realtime.New(log, cfg.FrontendOrigin)
	box := &fakeSandbox{}
	rs := runs.New(testPool, hub, box, log, cfg.PublicAPIURL, "", 10*time.Minute)
	srv := New(cfg, testPool, a, hub, rs, log)
	return &harness{t: t, server: srv, router: srv.Router(), box: box}
}

// signIn walks the real email-code flow so the tests exercise it too.
func (h *harness) signIn(email string) {
	h.t.Helper()
	h.do("POST", "/api/auth/email/start", map[string]any{"email": email}, 200)
	var out struct {
		Token     string `json:"token"`
		Workspace struct {
			ID   uuid.UUID `json:"id"`
			Slug string    `json:"slug"`
		} `json:"workspace"`
		User struct {
			ID uuid.UUID `json:"id"`
		} `json:"user"`
	}
	h.decode(h.do("POST", "/api/auth/email/verify", map[string]any{"email": email, "code": "000000"}, 200), &out)
	if out.Token == "" || out.Workspace.Slug == "" {
		h.t.Fatalf("sign-in returned no session or workspace: %+v", out)
	}
	h.token, h.ws, h.userID = out.Token, out.Workspace.Slug, out.User.ID
}

func (h *harness) request(method, path string, body any) *httptest.ResponseRecorder {
	h.t.Helper()
	var rdr io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			h.t.Fatal(err)
		}
		rdr = strings.NewReader(string(b))
	}
	req := httptest.NewRequest(method, path, rdr)
	req.Header.Set("Content-Type", "application/json")
	if h.token != "" {
		req.Header.Set("Authorization", "Bearer "+h.token)
	}
	rec := httptest.NewRecorder()
	h.router.ServeHTTP(rec, req)
	return rec
}

// do asserts the status code and returns the recorder.
func (h *harness) do(method, path string, body any, want int) *httptest.ResponseRecorder {
	h.t.Helper()
	rec := h.request(method, path, body)
	if rec.Code != want {
		h.t.Fatalf("%s %s: got %d want %d\n%s", method, path, rec.Code, want, rec.Body.String())
	}
	return rec
}

func (h *harness) decode(rec *httptest.ResponseRecorder, v any) {
	h.t.Helper()
	if err := json.Unmarshal(rec.Body.Bytes(), v); err != nil {
		h.t.Fatalf("decode %s: %v", rec.Body.String(), err)
	}
}

// w builds a workspace-scoped path.
func (h *harness) w(suffix string) string { return "/api/w/" + h.ws + suffix }

func uniqueEmail(t *testing.T) string {
	return strings.ToLower(strings.ReplaceAll(t.Name(), "/", "-")) + "-" + uuid.NewString()[:8] + "@example.test"
}
