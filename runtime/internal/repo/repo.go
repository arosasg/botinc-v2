// Package repo is the runtime's git work: check out, branch, commit, push and
// open a pull request. Credentials arrive per run and are written to a file
// git reads through a credential helper, never into the remote URL, so a
// token cannot end up in .git/config or in a log line.
package repo

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type Checkout struct {
	Dir           string
	FullName      string
	DefaultBranch string
	Branch        string

	token          string
	credentialFile string
	authorN        string
	authorE        string
}

// Clone checks the repository out at a fresh branch for this run.
func Clone(ctx context.Context, root, fullName, defaultBranch, token, branch string) (*Checkout, error) {
	if !strings.Contains(fullName, "/") {
		return nil, fmt.Errorf("repository must be owner/name, got %q", fullName)
	}
	if defaultBranch == "" {
		defaultBranch = "main"
	}
	dir := filepath.Join(root, strings.ReplaceAll(fullName, "/", "__"))
	if err := os.MkdirAll(filepath.Dir(dir), 0o700); err != nil {
		return nil, err
	}
	c := &Checkout{
		Dir: dir, FullName: fullName, DefaultBranch: defaultBranch, Branch: branch,
		token: token, authorN: "BotInc", authorE: "runtime@botinc.ai",
	}
	if err := c.writeCredentials(root); err != nil {
		return nil, err
	}
	url := "https://github.com/" + fullName + ".git"
	if _, err := c.git(ctx, root, "clone", "--depth", "50", "--branch", defaultBranch, url, dir); err != nil {
		return nil, fmt.Errorf("clone %s: %w", fullName, err)
	}
	if _, err := c.git(ctx, dir, "config", "user.name", c.authorN); err != nil {
		return nil, err
	}
	if _, err := c.git(ctx, dir, "config", "user.email", c.authorE); err != nil {
		return nil, err
	}
	if branch != "" {
		if _, err := c.git(ctx, dir, "checkout", "-b", branch); err != nil {
			return nil, err
		}
	}
	return c, nil
}

// writeCredentials stores the token in a 0600 file and points git at it. The
// URL stays clean, so nothing that echoes a remote can leak the credential.
func (c *Checkout) writeCredentials(root string) error {
	if c.token == "" {
		return nil
	}
	path := filepath.Join(root, ".git-credentials")
	line := "https://x-access-token:" + c.token + "@github.com\n"
	if err := os.WriteFile(path, []byte(line), 0o600); err != nil {
		return err
	}
	c.credentialFile = path
	return nil
}

func (c *Checkout) git(ctx context.Context, dir string, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Dir = dir
	cmd.Env = append(os.Environ(),
		"GIT_TERMINAL_PROMPT=0",
		"GIT_ASKPASS=/bin/true",
		"GIT_CONFIG_NOSYSTEM=1",
	)
	if c.credentialFile != "" {
		cmd.Env = append(cmd.Env,
			"GIT_CONFIG_COUNT=1",
			"GIT_CONFIG_KEY_0=credential.helper",
			"GIT_CONFIG_VALUE_0=store --file="+c.credentialFile,
		)
	}
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		return out.String(), fmt.Errorf("git %s: %w: %s", strings.Join(args, " "), err, strings.TrimSpace(errb.String()))
	}
	return strings.TrimSpace(out.String()), nil
}

// Dirty reports whether the working tree has changes worth committing.
func (c *Checkout) Dirty(ctx context.Context) (bool, error) {
	out, err := c.git(ctx, c.Dir, "status", "--porcelain")
	if err != nil {
		return false, err
	}
	return strings.TrimSpace(out) != "", nil
}

// Commit stages everything and records one commit. It reports false when the
// tree was clean, so a run that changed nothing does not invent a commit.
func (c *Checkout) Commit(ctx context.Context, message string) (bool, error) {
	dirty, err := c.Dirty(ctx)
	if err != nil || !dirty {
		return false, err
	}
	if _, err := c.git(ctx, c.Dir, "add", "-A"); err != nil {
		return false, err
	}
	if _, err := c.git(ctx, c.Dir, "commit", "-m", message); err != nil {
		return false, err
	}
	return true, nil
}

func (c *Checkout) Push(ctx context.Context) error {
	if c.Branch == "" {
		return errors.New("nothing to push: this checkout has no branch")
	}
	_, err := c.git(ctx, c.Dir, "push", "-u", "origin", c.Branch)
	return err
}

func (c *Checkout) Head(ctx context.Context) (string, error) {
	return c.git(ctx, c.Dir, "rev-parse", "HEAD")
}

// Diffstat is a short summary of what the run changed, for the run record.
func (c *Checkout) Diffstat(ctx context.Context) (string, error) {
	return c.git(ctx, c.Dir, "diff", "--stat", c.DefaultBranch+"...HEAD")
}

type PullRequest struct {
	Number int    `json:"number"`
	URL    string `json:"html_url"`
}

// OpenPullRequest opens the PR as a draft. Review and approval are separate
// steps that a person owns; the runtime never marks its own work ready.
func (c *Checkout) OpenPullRequest(ctx context.Context, title, body string) (*PullRequest, error) {
	if c.token == "" {
		return nil, errors.New("no GitHub token for this run")
	}
	payload := map[string]any{
		"title": title, "body": body,
		"head": c.Branch, "base": c.DefaultBranch, "draft": true,
	}
	b, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.github.com/repos/"+c.FullName+"/pulls", bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	var pr PullRequest
	if res.StatusCode >= 300 {
		var msg struct {
			Message string `json:"message"`
		}
		_ = json.NewDecoder(res.Body).Decode(&msg)
		return nil, fmt.Errorf("open pull request: %s: %s", res.Status, msg.Message)
	}
	if err := json.NewDecoder(res.Body).Decode(&pr); err != nil {
		return nil, err
	}
	return &pr, nil
}

// Cleanup removes the credential file. Called on every exit path.
func (c *Checkout) Cleanup() {
	if c.credentialFile != "" {
		_ = os.Remove(c.credentialFile)
	}
}
