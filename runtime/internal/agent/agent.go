// Package agent drives a coding CLI as a subprocess and turns its output into
// the events the server records. Each supported CLI is described by a small
// adapter, so adding one is a table entry rather than a new code path.
package agent

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// Adapter says how to invoke one CLI and how to read what it prints.
type Adapter struct {
	Provider string
	Binary   string
	// Args builds the command line for a prompt.
	Args func(prompt, model string) []string
	// Env is the credential the CLI expects, as NAME=value.
	Env func(secret string) []string
	// Parse turns one line of output into an event; ok=false skips the line.
	Parse func(line string) (Event, bool)
}

type Event struct {
	Type    string
	Payload map[string]any
}

// jsonLine reads a CLI that prints one JSON object per line. Anything that is
// not JSON is still forwarded as a log line rather than dropped, because a
// stack trace on stderr is exactly what a person needs to see.
func jsonLine(line string) (Event, bool) {
	trimmed := strings.TrimSpace(line)
	if trimmed == "" {
		return Event{}, false
	}
	var obj map[string]any
	if err := json.Unmarshal([]byte(trimmed), &obj); err != nil {
		return Event{Type: "log", Payload: map[string]any{"line": trimmed}}, true
	}
	typ, _ := obj["type"].(string)
	switch typ {
	case "item.completed":
		if item, ok := obj["item"].(map[string]any); ok && item["type"] == "agent_message" {
			return Event{Type: "result", Payload: map[string]any{"result": item["text"]}}, true
		}
		return Event{Type: "tool", Payload: obj}, true
	case "assistant", "text", "message":
		return Event{Type: "log", Payload: obj}, true
	case "tool_use", "tool_result":
		return Event{Type: "tool", Payload: obj}, true
	case "result":
		return Event{Type: "result", Payload: obj}, true
	case "error":
		return Event{Type: "error", Payload: obj}, true
	default:
		return Event{Type: "log", Payload: obj}, true
	}
}

// Adapters is the supported set. Remote-only: every one of these runs inside
// the sandbox, never on anybody's laptop.
var Adapters = map[string]Adapter{
	"claude": {
		Provider: "claude", Binary: "claude",
		Args: func(prompt, model string) []string {
			args := []string{"-p", prompt, "--output-format", "stream-json", "--verbose", "--permission-mode", "acceptEdits"}
			if model != "" && model != "auto" {
				args = append(args, "--model", model)
			}
			return args
		},
		Env:   func(secret string) []string { return []string{"ANTHROPIC_API_KEY=" + secret} },
		Parse: jsonLine,
	},
	"codex": {
		Provider: "codex", Binary: "codex",
		Args: func(prompt, model string) []string {
			args := []string{"exec", "--json", "--full-auto", prompt}
			if model != "" && model != "auto" {
				args = append(args, "--model", model)
			}
			return args
		},
		Env:   func(secret string) []string { return []string{"OPENAI_API_KEY=" + secret} },
		Parse: jsonLine,
	},
	"openrouter": {
		Provider: "openrouter", Binary: "claude",
		Args: func(prompt, model string) []string {
			args := []string{"-p", prompt, "--output-format", "stream-json", "--verbose", "--permission-mode", "acceptEdits"}
			if model != "" && model != "auto" {
				args = append(args, "--model", model)
			}
			return args
		},
		Env: func(secret string) []string {
			return []string{"ANTHROPIC_API_KEY=", "ANTHROPIC_AUTH_TOKEN=" + secret, "ANTHROPIC_BASE_URL=https://openrouter.ai/api"}
		},
		Parse: jsonLine,
	},
}

// Pick resolves the adapter for a credential provider, falling back to claude.
func Pick(provider string) (Adapter, error) {
	if a, ok := Adapters[provider]; ok {
		return a, nil
	}
	if a, ok := Adapters["claude"]; ok && provider == "" {
		return a, nil
	}
	return Adapter{}, fmt.Errorf("no coding CLI adapter for provider %q", provider)
}

type Options struct {
	Dir             string
	Prompt          string
	Model           string
	Secret          string
	CredentialEnv   map[string]string
	CredentialFiles map[string]string
	MCPConfig       []byte
	Timeout         time.Duration
	BudgetCents     int
	// Emit receives every event as it is parsed.
	Emit func(Event)
}

var ErrBinaryMissing = errors.New("the coding CLI is not installed in this sandbox")

// drainGrace is how long output is still collected after the process should
// have finished.
var drainGrace = 30 * time.Second

// Run drives the CLI to completion and returns the final result event, if the
// CLI produced one. A non-zero exit is an error even when output looked fine:
// the exit status is the only honest signal that the work finished.
func Run(ctx context.Context, a Adapter, o Options) (map[string]any, error) {
	if _, err := exec.LookPath(a.Binary); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrBinaryMissing, a.Binary)
	}
	if o.Timeout > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, o.Timeout)
		defer cancel()
	}
	args := a.Args(o.Prompt, o.Model)
	removeMCP := func() {}
	if len(o.MCPConfig) > 0 && a.Provider == "claude" {
		mcpPath := filepath.Join(o.Dir, ".botinc-mcp.json")
		if err := os.WriteFile(mcpPath, o.MCPConfig, 0o600); err != nil {
			return nil, fmt.Errorf("write MCP configuration: %w", err)
		}
		removeMCP = func() { _ = os.Remove(mcpPath) }
		defer removeMCP()
		// Workspace connectors are already selected by the user and scoped to
		// this isolated run. Print mode has nobody available to answer a second
		// permission prompt, so explicitly allow only the configured MCP tools.
		args = append(args, "--mcp-config", mcpPath, "--strict-mcp-config", "--allowedTools", "mcp__*")
	}
	if o.BudgetCents > 0 && (a.Provider == "claude" || a.Provider == "openrouter") {
		args = append(args, "--max-budget-usd", fmt.Sprintf("%.2f", float64(o.BudgetCents)/100))
	}
	cmd := exec.CommandContext(ctx, a.Binary, args...)
	cmd.Dir = o.Dir
	credentialEnv, secrets, cleanup, err := materializeCredential(a.Provider, o)
	if err != nil {
		return nil, err
	}
	defer cleanup()
	if len(o.MCPConfig) > 0 {
		secrets = append(secrets, string(o.MCPConfig))
		var document any
		if json.Unmarshal(o.MCPConfig, &document) == nil {
			secrets = append(secrets, stringLeaves(document)...)
		}
	}
	cmd.Env = append(os.Environ(), a.Env(o.Secret)...)
	cmd.Env = append(cmd.Env, credentialEnv...)
	isolate(cmd)
	// If a descendant still holds a pipe after the process is gone, give up on
	// the output rather than blocking the run forever.
	cmd.WaitDelay = 10 * time.Second

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}
	if err := cmd.Start(); err != nil {
		return nil, err
	}

	var (
		mu     sync.Mutex
		result map[string]any
		wg     sync.WaitGroup
	)
	consume := func(r io.Reader, stream string) {
		defer wg.Done()
		sc := bufio.NewScanner(r)
		sc.Buffer(make([]byte, 0, 64*1024), 4<<20)
		for sc.Scan() {
			ev, ok := a.Parse(sc.Text())
			if !ok {
				continue
			}
			if ev.Payload == nil {
				ev.Payload = map[string]any{}
			}
			ev.Payload = redactSecrets(ev.Payload, secrets).(map[string]any)
			ev.Payload["stream"] = stream
			if ev.Type == "result" {
				mu.Lock()
				result = ev.Payload
				mu.Unlock()
			}
			if o.Emit != nil {
				o.Emit(ev)
			}
		}
	}
	wg.Add(2)
	go consume(stdout, "stdout")
	go consume(stderr, "stderr")

	// Bound the drain as well: WaitDelay covers the pipes cmd owns, but a
	// reader wedged on something else must not hold the run open.
	drained := make(chan struct{})
	go func() { wg.Wait(); close(drained) }()
	select {
	case <-drained:
	case <-time.After(drainGrace):
	}

	if err := cmd.Wait(); err != nil {
		if ctx.Err() != nil {
			return result, fmt.Errorf("the coding CLI ran past its time limit: %w", ctx.Err())
		}
		return result, fmt.Errorf("%s exited non-zero: %w", a.Binary, err)
	}
	if failed, _ := result["is_error"].(bool); failed {
		return result, errors.New("the coding CLI reported an error result")
	}
	return result, nil
}

var credentialRootEnv = map[string]string{
	"claude": "CLAUDE_CONFIG_DIR",
	"codex":  "CODEX_HOME",
}

var forbiddenCredentialEnv = map[string]bool{
	"HOME": true, "PATH": true, "SHELL": true, "USER": true,
	"TMPDIR": true, "XDG_CONFIG_HOME": true, "XDG_DATA_HOME": true,
	"XDG_STATE_HOME": true, "XDG_CACHE_HOME": true,
	"CLAUDE_CONFIG_DIR": true, "CODEX_HOME": true,
}

// materializeCredential writes provider-auth files into a private directory
// owned by this run. Stored credentials cannot choose their own filesystem
// root, and all files disappear before the sandbox reports completion.
func materializeCredential(provider string, o Options) ([]string, []string, func(), error) {
	environment := make([]string, 0, len(o.CredentialEnv)+1)
	secrets := make([]string, 0, len(o.CredentialEnv)+len(o.CredentialFiles)+1)
	if o.Secret != "" {
		secrets = append(secrets, o.Secret)
	}
	for name, value := range o.CredentialEnv {
		name = strings.TrimSpace(name)
		upper := strings.ToUpper(name)
		if name == "" || strings.ContainsAny(name, "= \t\r\n\x00") || forbiddenCredentialEnv[upper] || strings.HasPrefix(upper, "BOTINC_") {
			return nil, nil, func() {}, fmt.Errorf("credential environment name %q is not allowed", name)
		}
		environment = append(environment, name+"="+value)
		if value != "" {
			secrets = append(secrets, value)
		}
	}
	if len(o.CredentialFiles) == 0 {
		return environment, secrets, func() {}, nil
	}
	rootName, ok := credentialRootEnv[provider]
	if !ok {
		return nil, nil, func() {}, fmt.Errorf("provider %q does not support file credentials", provider)
	}
	root := filepath.Join(o.Dir, ".botinc-credentials", provider)
	if err := os.MkdirAll(root, 0o700); err != nil {
		return nil, nil, func() {}, fmt.Errorf("create credential directory: %w", err)
	}
	cleanup := func() { _ = os.RemoveAll(filepath.Join(o.Dir, ".botinc-credentials")) }
	for relative, contents := range o.CredentialFiles {
		cleaned := filepath.Clean(strings.TrimSpace(relative))
		if cleaned == "." || filepath.IsAbs(cleaned) || cleaned == ".." || strings.HasPrefix(cleaned, ".."+string(filepath.Separator)) {
			cleanup()
			return nil, nil, func() {}, fmt.Errorf("credential file path %q escapes its private directory", relative)
		}
		target := filepath.Join(root, cleaned)
		if err := os.MkdirAll(filepath.Dir(target), 0o700); err != nil {
			cleanup()
			return nil, nil, func() {}, fmt.Errorf("create credential parent: %w", err)
		}
		if err := os.WriteFile(target, []byte(contents), 0o600); err != nil {
			cleanup()
			return nil, nil, func() {}, fmt.Errorf("write credential file: %w", err)
		}
		if contents != "" {
			secrets = append(secrets, contents)
			var document any
			if json.Unmarshal([]byte(contents), &document) == nil {
				secrets = append(secrets, stringLeaves(document)...)
			}
		}
	}
	environment = append(environment, rootName+"="+root)
	return environment, secrets, cleanup, nil
}

func stringLeaves(value any) []string {
	var out []string
	switch current := value.(type) {
	case string:
		if current != "" {
			out = append(out, current)
			if strings.HasPrefix(strings.ToLower(current), "bearer ") {
				out = append(out, strings.TrimSpace(current[len("Bearer "):]))
			}
		}
	case map[string]any:
		for _, child := range current {
			out = append(out, stringLeaves(child)...)
		}
	case []any:
		for _, child := range current {
			out = append(out, stringLeaves(child)...)
		}
	}
	return out
}

// Parse first so a secret that resembles JSON syntax cannot corrupt the event.
func redact(value any, secret string) any {
	if secret == "" {
		return value
	}
	switch v := value.(type) {
	case string:
		return strings.ReplaceAll(v, secret, "[redacted]")
	case map[string]any:
		for k, x := range v {
			v[k] = redact(x, secret)
		}
		return v
	case []any:
		for i, x := range v {
			v[i] = redact(x, secret)
		}
		return v
	default:
		return value
	}
}

func redactSecrets(value any, secrets []string) any {
	redacted := value
	for _, secret := range secrets {
		redacted = redact(redacted, secret)
	}
	return redacted
}
