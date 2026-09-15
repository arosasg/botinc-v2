package repo

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// These tests use a real git against a local bare repository, so the commands
// and their flags are exercised rather than mocked. No network is involved.

func gitInit(t *testing.T, dir string, args ...string) {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "GIT_CONFIG_NOSYSTEM=1", "HOME="+dir)
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("git %s: %v\n%s", strings.Join(args, " "), err, out)
	}
}

// originRepo builds a bare repository with one commit on main.
func originRepo(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	seed := filepath.Join(root, "seed")
	bare := filepath.Join(root, "origin.git")
	if err := os.MkdirAll(seed, 0o755); err != nil {
		t.Fatal(err)
	}
	gitInit(t, root, "init", "--bare", "--initial-branch=main", bare)
	gitInit(t, seed, "init", "--initial-branch=main")
	gitInit(t, seed, "config", "user.email", "seed@example.test")
	gitInit(t, seed, "config", "user.name", "Seed")
	if err := os.WriteFile(filepath.Join(seed, "README.md"), []byte("# seed\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	gitInit(t, seed, "add", "-A")
	gitInit(t, seed, "commit", "-m", "first")
	gitInit(t, seed, "remote", "add", "origin", bare)
	gitInit(t, seed, "push", "-u", "origin", "main")
	return bare
}

// cloneLocal is Clone against a path instead of github.com, so the git plumbing
// is the same code path without needing the network.
func cloneLocal(t *testing.T, origin, branch string) *Checkout {
	t.Helper()
	root := t.TempDir()
	dir := filepath.Join(root, "work")
	c := &Checkout{Dir: dir, FullName: "test/repo", DefaultBranch: "main", Branch: branch, authorN: "BotInc", authorE: "runtime@botinc.ai"}
	if _, err := c.git(context.Background(), root, "clone", "--branch", "main", origin, dir); err != nil {
		t.Fatal(err)
	}
	if _, err := c.git(context.Background(), dir, "config", "user.name", c.authorN); err != nil {
		t.Fatal(err)
	}
	if _, err := c.git(context.Background(), dir, "config", "user.email", c.authorE); err != nil {
		t.Fatal(err)
	}
	if branch != "" {
		if _, err := c.git(context.Background(), dir, "checkout", "-b", branch); err != nil {
			t.Fatal(err)
		}
	}
	return c
}

func TestCommitReportsNothingWhenTheTreeIsClean(t *testing.T) {
	c := cloneLocal(t, originRepo(t), "botinc/bot-1-abc")
	ctx := context.Background()

	dirty, err := c.Dirty(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if dirty {
		t.Fatal("a fresh checkout is not dirty")
	}
	committed, err := c.Commit(ctx, "nothing to do")
	if err != nil {
		t.Fatal(err)
	}
	if committed {
		t.Fatal("a clean tree must not produce a commit")
	}
}

func TestCommitAndPushRoundTrip(t *testing.T) {
	origin := originRepo(t)
	c := cloneLocal(t, origin, "botinc/bot-2-def")
	ctx := context.Background()

	if err := os.WriteFile(filepath.Join(c.Dir, "fix.txt"), []byte("fixed\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	dirty, err := c.Dirty(ctx)
	if err != nil || !dirty {
		t.Fatalf("the tree should be dirty: %v %v", dirty, err)
	}
	committed, err := c.Commit(ctx, "BOT-2: fix the thing")
	if err != nil || !committed {
		t.Fatalf("commit failed: %v %v", committed, err)
	}
	if err := c.Push(ctx); err != nil {
		t.Fatal(err)
	}
	head, err := c.Head(ctx)
	if err != nil || len(head) != 40 {
		t.Fatalf("head should be a full sha: %q %v", head, err)
	}
	stat, err := c.Diffstat(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stat, "fix.txt") {
		t.Fatalf("diffstat should mention the file: %q", stat)
	}
	// The branch really landed on the origin.
	out, err := exec.Command("git", "--git-dir", origin, "branch", "--list", "botinc/bot-2-def").CombinedOutput()
	if err != nil || !strings.Contains(string(out), "botinc/bot-2-def") {
		t.Fatalf("branch not pushed: %q %v", out, err)
	}
}

func TestPushWithoutABranchIsRefused(t *testing.T) {
	c := cloneLocal(t, originRepo(t), "")
	if err := c.Push(context.Background()); err == nil {
		t.Fatal("pushing without a branch must be an error, not a silent no-op")
	}
}

func TestCloneRejectsAMalformedRepositoryName(t *testing.T) {
	if _, err := Clone(context.Background(), t.TempDir(), "notaslug", "main", "", "b"); err == nil {
		t.Fatal("a name without owner/ must be refused")
	}
}

// The token must never be written where a later command could echo it.
func TestTokenStaysOutOfTheRepositoryConfig(t *testing.T) {
	root := t.TempDir()
	c := &Checkout{token: "ghs_supersecrettoken"}
	if err := c.writeCredentials(root); err != nil {
		t.Fatal(err)
	}
	info, err := os.Stat(c.credentialFile)
	if err != nil {
		t.Fatal(err)
	}
	if info.Mode().Perm() != 0o600 {
		t.Fatalf("the credential file must be 0600, got %v", info.Mode().Perm())
	}
	body, err := os.ReadFile(c.credentialFile)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(body), "ghs_supersecrettoken") {
		t.Fatal("the helper file should hold the token")
	}
	c.Cleanup()
	if _, err := os.Stat(c.credentialFile); !os.IsNotExist(err) {
		t.Fatal("cleanup must remove the credential file")
	}
}

func TestRepositoryEnvironmentIsPrivateIgnoredAndExact(t *testing.T) {
	c := cloneLocal(t, originRepo(t), "botinc/env")
	path, err := c.WriteEnvironment(context.Background(), map[string]string{
		"PLAIN":  "value with spaces",
		"SECRET": "line one\nline \"two\"\\end",
	})
	if err != nil {
		t.Fatal(err)
	}
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	if info.Mode().Perm() != 0o600 {
		t.Fatalf("repository .env must be 0600, got %v", info.Mode().Perm())
	}
	body, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	want := "PLAIN=\"value with spaces\"\nSECRET=\"line one\\nline \\\"two\\\"\\\\end\"\n"
	if string(body) != want {
		t.Fatalf("repository .env = %q, want %q", body, want)
	}
	dirty, err := c.Dirty(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if dirty {
		t.Fatal("materialized repository .env must not be stageable")
	}
}

func TestRepositoryEnvironmentRefusesTrackedDotenv(t *testing.T) {
	c := cloneLocal(t, originRepo(t), "botinc/env-tracked")
	if err := os.WriteFile(filepath.Join(c.Dir, ".env"), []byte("SAFE=tracked\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	gitInit(t, c.Dir, "add", ".env", "-f")
	gitInit(t, c.Dir, "commit", "-m", "track dotenv")
	if _, err := c.WriteEnvironment(context.Background(), map[string]string{"SECRET": "never-write"}); err == nil {
		t.Fatal("tracked .env must be refused")
	}
	body, err := os.ReadFile(filepath.Join(c.Dir, ".env"))
	if err != nil || string(body) != "SAFE=tracked\n" {
		t.Fatalf("tracked .env changed: %q, %v", body, err)
	}
}

func TestOpenPullRequestNeedsAToken(t *testing.T) {
	c := &Checkout{FullName: "a/b", Branch: "x", DefaultBranch: "main"}
	if _, err := c.OpenPullRequest(context.Background(), "t", "b"); err == nil {
		t.Fatal("opening a pull request without a token must be an error")
	}
}
