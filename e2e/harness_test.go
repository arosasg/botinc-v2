// Package e2e drives the real binaries against a real database. Nothing here
// is a stand-in: the server, the runtime and the CLI are compiled and run as
// separate processes, exactly as they would be deployed. The only substitute
// is the coding CLI itself, because a test must not call a model.
//
// If this suite passes, the pieces are genuinely connected.
package e2e

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	binDir   string // holds the compiled binaries and the fake coding CLI
	adminURL string
)

func TestMain(m *testing.M) {
	adminURL = os.Getenv("TEST_DATABASE_URL")
	if adminURL == "" {
		fmt.Fprintln(os.Stderr, "TEST_DATABASE_URL is required: the end-to-end suite needs a real Postgres")
		os.Exit(1)
	}
	dir, err := os.MkdirTemp("", "botinc-e2e-*")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	binDir = dir

	for _, b := range []struct{ out, pkg, mod string }{
		{"botinc", "./cmd/botinc", "../cli"},
		{"botinc-server", "./cmd/server", "../server"},
		{"botinc-runtime", "./cmd/botinc-runtime", "../runtime"},
	} {
		cmd := exec.Command("go", "build", "-o", filepath.Join(dir, b.out), b.pkg)
		cmd.Dir = b.mod
		cmd.Env = os.Environ()
		if out, err := cmd.CombinedOutput(); err != nil {
			fmt.Fprintf(os.Stderr, "building %s failed: %v\n%s\n", b.out, err, out)
			os.Exit(1)
		}
	}
	if err := writeFakeCodingCLI(dir); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	code := m.Run()
	_ = os.RemoveAll(dir)
	os.Exit(code)
}

// writeFakeCodingCLI stands in for `claude`. It speaks the same stream-json
// the adapter parses and writes a file, so a build run has something real to
// commit. A test must never call a model.
func writeFakeCodingCLI(dir string) error {
	script := `#!/bin/sh
# Stand-in for a coding CLI. Prints the same stream-json shape and, when asked
# to change something, actually changes it.
echo '{"type":"assistant","text":"reading the repository"}'
echo '{"type":"tool_use","name":"Read","file":"README.md"}'
if [ -n "$BOTINC_FAKE_WRITE" ]; then
  printf 'changed by the fake coding CLI\n' >> "$BOTINC_FAKE_WRITE"
  echo '{"type":"tool_use","name":"Edit","file":"'"$BOTINC_FAKE_WRITE"'"}'
fi
if [ -n "$BOTINC_FAKE_FAIL" ]; then
  echo '{"type":"error","message":"the fake CLI was told to fail"}'
  exit 7
fi
echo '{"type":"result","result":"'"${BOTINC_FAKE_ANSWER:-Done.}"'","total_cost_usd":0.0312}'
exit 0
`
	return os.WriteFile(filepath.Join(dir, "claude"), []byte(script), 0o755)
}

// stack is one deployment: a private database and a server process.
type stack struct {
	t         *testing.T
	url       string
	pool      *pgxpool.Pool
	home      string
	token     string
	workspace string
}

func freePort(t *testing.T) int {
	t.Helper()
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port
}

// newStack starts a deployment. extraEnv is handed to the server process and,
// through the local sandbox provider, on to the runtime and its coding CLI.
func newStack(t *testing.T, extraEnv ...string) *stack {
	t.Helper()
	ctx := context.Background()

	admin, err := pgxpool.New(ctx, adminURL)
	if err != nil {
		t.Fatal(err)
	}
	name := "botinc_e2e_" + strconv.FormatInt(time.Now().UnixNano(), 36)
	if _, err := admin.Exec(ctx, `create database `+name); err != nil {
		t.Fatal(err)
	}
	admin.Close()
	dbURL := swapDatabase(adminURL, name)

	port := freePort(t)
	url := fmt.Sprintf("http://127.0.0.1:%d", port)
	home := t.TempDir()
	runWork := filepath.Join(home, "runs")

	logPath := filepath.Join(home, "server.log")
	logFile, err := os.Create(logPath)
	if err != nil {
		t.Fatal(err)
	}
	srv := exec.Command(filepath.Join(binDir, "botinc-server"))
	srv.Env = append(os.Environ(),
		"DATABASE_URL="+dbURL,
		"PORT="+strconv.Itoa(port),
		"APP_ENV=test",
		"JWT_SECRET=e2e-secret",
		"FRONTEND_ORIGIN=http://localhost:3100",
		"BOTINC_PUBLIC_API_URL="+url,
		"BOTINC_DEV_VERIFICATION_CODE=000000",
		"BOTINC_SECRETS_KEY=a3f1c07d9b2e45568a1d0c3e7f92b4d6a3f1c07d9b2e45568a1d0c3e7f92b4d6",
		// Remote-only in production; the local provider is the development
		// path and runs the real runtime binary as a child process here.
		"BOTINC_SANDBOX_PROVIDER=local",
		"BOTINC_RUNTIME_BINARY="+filepath.Join(binDir, "botinc-runtime"),
		"BOTINC_RUNTIME_WORKDIR="+runWork,
		"PATH="+binDir+string(os.PathListSeparator)+os.Getenv("PATH"),
	)
	srv.Env = append(srv.Env, extraEnv...)
	srv.Stdout, srv.Stderr = logFile, logFile
	if err := srv.Start(); err != nil {
		t.Fatal(err)
	}

	s := &stack{t: t, url: url, home: home}
	t.Cleanup(func() {
		if srv.Process != nil {
			_ = srv.Process.Kill()
			_, _ = srv.Process.Wait()
		}
		_ = logFile.Close()
		if t.Failed() {
			if body, err := os.ReadFile(logPath); err == nil && len(body) > 0 {
				t.Logf("server log:\n%s", body)
			}
		}
		if s.pool != nil {
			s.pool.Close()
		}
		if admin, err := pgxpool.New(context.Background(), adminURL); err == nil {
			_, _ = admin.Exec(context.Background(), `drop database if exists `+name+` with (force)`)
			admin.Close()
		}
	})

	s.waitHealthy()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		t.Fatal(err)
	}
	s.pool = pool
	return s
}

// waitHealthy blocks until the server answers, so a test never races the boot.
func (s *stack) waitHealthy() {
	s.t.Helper()
	deadline := time.Now().Add(30 * time.Second)
	for time.Now().Before(deadline) {
		res, err := http.Get(s.url + "/healthz")
		if err == nil {
			res.Body.Close()
			if res.StatusCode == 200 {
				return
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	s.t.Fatal("the server never became healthy")
}

func swapDatabase(url, name string) string {
	i := strings.LastIndex(url, "/")
	if i < 0 {
		return url
	}
	rest := ""
	if j := strings.Index(url[i:], "?"); j >= 0 {
		rest = url[i+j:]
	}
	return url[:i+1] + name + rest
}

// signIn walks the real email-code flow over HTTP.
func (s *stack) signIn(email string) {
	s.t.Helper()
	s.post("/api/auth/email/start", map[string]any{"email": email}, nil)
	var out struct {
		Token     string `json:"token"`
		Workspace struct {
			Slug string `json:"slug"`
		} `json:"workspace"`
	}
	s.post("/api/auth/email/verify", map[string]any{"email": email, "code": "000000"}, &out)
	if out.Token == "" || out.Workspace.Slug == "" {
		s.t.Fatalf("sign-in gave no session: %+v", out)
	}
	s.token, s.workspace = out.Token, out.Workspace.Slug
}

func (s *stack) post(path string, in, out any) {
	s.t.Helper()
	body, _ := json.Marshal(in)
	res, err := http.Post(s.url+path, "application/json", strings.NewReader(string(body)))
	if err != nil {
		s.t.Fatal(err)
	}
	defer res.Body.Close()
	var raw []byte
	raw, _ = readAll(res)
	if res.StatusCode >= 300 {
		s.t.Fatalf("POST %s: %s: %s", path, res.Status, raw)
	}
	if out != nil {
		if err := json.Unmarshal(raw, out); err != nil {
			s.t.Fatalf("decode %s: %v: %s", path, err, raw)
		}
	}
}

func readAll(res *http.Response) ([]byte, error) {
	buf := make([]byte, 0, 4096)
	tmp := make([]byte, 4096)
	for {
		n, err := res.Body.Read(tmp)
		buf = append(buf, tmp[:n]...)
		if err != nil {
			return buf, nil
		}
	}
}

// botinc runs the compiled CLI. A non-zero exit fails the test with the
// command's own output, so the failure explains itself.
func (s *stack) botinc(args ...string) string {
	s.t.Helper()
	out, err := s.try(args...)
	if err != nil {
		s.t.Fatalf("botinc %s failed: %v\n%s", strings.Join(args, " "), err, out)
	}
	return out
}

func (s *stack) try(args ...string) (string, error) {
	s.t.Helper()
	cmd := exec.Command(filepath.Join(binDir, "botinc"), args...)
	cmd.Env = append(os.Environ(),
		"BOTINC_API_URL="+s.url,
		"BOTINC_CONFIG="+filepath.Join(s.home, "config.json"),
		"BOTINC_TOKEN="+s.token,
		"BOTINC_WORKSPACE="+s.workspace,
	)
	out, err := cmd.CombinedOutput()
	return string(out), err
}

func (s *stack) jsonOut(v any, args ...string) {
	s.t.Helper()
	out := s.botinc(append(args, "--json")...)
	if err := json.Unmarshal([]byte(out), v); err != nil {
		s.t.Fatalf("botinc %s did not print JSON: %v\n%s", strings.Join(args, " "), err, out)
	}
}

// waitForRun polls until the run reaches a terminal state, then returns it.
func (s *stack) waitForRun(id string, timeout time.Duration) map[string]any {
	s.t.Helper()
	deadline := time.Now().Add(timeout)
	var last map[string]any
	for time.Now().Before(deadline) {
		var out struct {
			Run map[string]any `json:"run"`
		}
		s.jsonOut(&out, "run", "show", id)
		last = out.Run
		switch out.Run["status"] {
		case "done", "failed", "cancelled":
			return out.Run
		}
		time.Sleep(250 * time.Millisecond)
	}
	s.t.Fatalf("run %s never finished; last state %+v", id, last)
	return last
}
