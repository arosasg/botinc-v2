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
	Dir     string
	Prompt  string
	Model   string
	Secret  string
	Timeout time.Duration
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
	cmd := exec.CommandContext(ctx, a.Binary, a.Args(o.Prompt, o.Model)...)
	cmd.Dir = o.Dir
	cmd.Env = append(os.Environ(), a.Env(o.Secret)...)
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
