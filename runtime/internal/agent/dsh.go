package agent

import (
	"bufio"
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
)

//go:embed dsh_bridge.mjs
var dshBridge []byte

type dshModelSpec struct {
	Wire, Name string
	Context    int
	MaxTokens  int
	Efforts    map[string]any
}

func dshModel(model string) (dshModelSpec, error) {
	switch strings.ToLower(strings.TrimSpace(model)) {
	case "", "auto", "deepseek v4.1 flash", "deepseek-v4.1-flash":
		return dshModelSpec{
			Wire: "deepseek/deepseek-v4.1-flash", Name: "DeepSeek V4.1 Flash", Context: 1048576, MaxTokens: 32768,
			Efforts: map[string]any{"off": nil, "low": "low", "high": "high", "max": "max"},
		}, nil
	case "deepseek v3", "deepseek-v3", "deepseek/deepseek-chat":
		return dshModelSpec{Wire: "deepseek/deepseek-chat", Name: "DeepSeek V3", Context: 163840, MaxTokens: 16000}, nil
	case "deepseek r1", "deepseek-r1", "deepseek/deepseek-r1":
		return dshModelSpec{Wire: "deepseek/deepseek-r1", Name: "DeepSeek R1", Context: 64000, MaxTokens: 16000}, nil
	default:
		return dshModelSpec{}, fmt.Errorf("dsh: unsupported model %q", model)
	}
}

var validDSHMCPServerName = regexp.MustCompile(`^[A-Za-z0-9_-]{1,32}$`)

func dshMCPPlugins(config []byte) ([]any, error) {
	if len(config) == 0 {
		return nil, nil
	}
	var document struct {
		Servers map[string]mcpServerConfig `json:"mcpServers"`
	}
	if err := json.Unmarshal(config, &document); err != nil {
		return nil, fmt.Errorf("decode DSH MCP configuration: %w", err)
	}
	names := make([]string, 0, len(document.Servers))
	for name := range document.Servers {
		if !validDSHMCPServerName.MatchString(name) {
			return nil, fmt.Errorf("DSH MCP server name %q must use 1-32 letters, numbers, underscores, or hyphens", name)
		}
		names = append(names, name)
	}
	sort.Strings(names)
	plugins := make([]any, 0, len(names))
	for _, name := range names {
		server := document.Servers[name]
		pluginConfig := map[string]any{"serverName": name, "failOnStartupError": true}
		switch {
		case strings.TrimSpace(server.URL) != "":
			pluginConfig["transport"] = "streamable-http"
			pluginConfig["url"] = server.URL
			pluginConfig["headers"] = server.Headers
		case strings.TrimSpace(server.Command) != "":
			pluginConfig["transport"] = "stdio"
			pluginConfig["command"] = server.Command
			pluginConfig["args"] = server.Args
			pluginConfig["env"] = server.Env
		default:
			return nil, fmt.Errorf("DSH MCP server %q needs a URL or command", name)
		}
		plugins = append(plugins, map[string]any{
			"id": "botinc-mcp-" + name, "name": "@deepseek-ai/dsh-mcp-client", "config": pluginConfig,
		})
	}
	return plugins, nil
}

func writeDSHProfile(dir string, model dshModelSpec, mcpConfig []byte) (string, error) {
	bridgePath := filepath.Join(dir, "bridge.mjs")
	if err := os.WriteFile(bridgePath, dshBridge, 0o600); err != nil {
		return "", err
	}
	mcpPlugins, err := dshMCPPlugins(mcpConfig)
	if err != nil {
		return "", err
	}
	modelConfig := map[string]any{"id": model.Wire, "name": model.Name, "input": []string{"text"}, "contextWindow": model.Context, "maxTokens": model.MaxTokens}
	if model.Efforts != nil {
		modelConfig["reasoningEfforts"] = model.Efforts
	}
	insert := []any{
		map[string]any{"id": "botinc-openrouter", "name": "@deepseek-ai/dsh-llm-pi-ai", "config": map[string]any{
			"providers": map[string]any{"openrouter": map[string]any{
				"api": "openai-completions", "apiKeyEnv": "OPENROUTER_API_KEY", "baseURL": "https://openrouter.ai/api/v1",
				"streamIdleTimeoutMs": 300000, "retryPolicy": map[string]any{"mode": "normal", "maxRetries": 2},
				"models": []any{modelConfig},
			}},
		}},
	}
	insert = append(insert, mcpPlugins...)
	insert = append(insert, map[string]any{"id": "botinc-bridge", "name": bridgePath})
	profile := []any{
		map[string]any{"id": "sdk-jsonrpc-server", "disabled": true},
		map[string]any{"id": "llm-deepseek", "disabled": true},
		map[string]any{"id": "system-prompt", "config": map[string]any{"personaPrefix": "{{botinc_persona}}"}},
		map[string]any{"insert": insert},
	}
	data, err := json.Marshal(profile)
	if err != nil {
		return "", err
	}
	path := filepath.Join(dir, "profile.json")
	return path, os.WriteFile(path, data, 0o600)
}

type dshBlock struct {
	Type       string     `json:"type"`
	Text       string     `json:"text"`
	ToolCallID string     `json:"toolCallId"`
	IsError    bool       `json:"isError"`
	Content    []dshBlock `json:"content"`
}

type dshState struct {
	sessionID, output, failure, reason string
	ended, idle                        bool
}

var dshSessionID = func() string { return fmt.Sprintf("botinc-%d", time.Now().UnixNano()) }

func (s *dshState) observe(method string, raw json.RawMessage, emit func(Event)) error {
	var params struct {
		SessionID string `json:"sessionId"`
		Status    string `json:"status"`
		Message   string `json:"message"`
		Frame     struct {
			Type  string `json:"type"`
			Chunk struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"chunk"`
		} `json:"frame"`
		Event struct {
			Type string `json:"type"`
			Data struct {
				CallID    string          `json:"callId"`
				Name      string          `json:"name"`
				Arguments string          `json:"arguments"`
				Reason    json.RawMessage `json:"reason"`
				Message   struct {
					Content []dshBlock `json:"content"`
				} `json:"message"`
			} `json:"data"`
		} `json:"event"`
	}
	if err := json.Unmarshal(raw, &params); err != nil {
		return fmt.Errorf("dsh notification %s: %w", method, err)
	}
	if params.SessionID != s.sessionID {
		return nil
	}
	switch method {
	case "session.error":
		s.failure = params.Message
	case "session.status":
		s.idle = params.Status == "idle"
	case "session.stream":
		if params.Frame.Type == "chunk" && (params.Frame.Chunk.Type == "text-delta" || params.Frame.Chunk.Type == "reasoning-delta") {
			emit(Event{Type: "log", Payload: map[string]any{"text": params.Frame.Chunk.Text, "kind": params.Frame.Chunk.Type}})
		}
	case "session.event":
		data := params.Event.Data
		switch params.Event.Type {
		case "turn/start":
			s.ended, s.idle = false, false
		case "turn/end":
			s.ended = true
			var terminal struct {
				Kind string `json:"kind"`
			}
			if err := json.Unmarshal(data.Reason, &terminal); err != nil {
				return fmt.Errorf("dsh terminal reason: %w", err)
			}
			s.reason = terminal.Kind
			if terminal.Kind != "completed" {
				s.failure = "dsh turn ended: " + terminal.Kind
			}
		case "assistant/message":
			s.output = ""
			for _, block := range data.Message.Content {
				if block.Type == "text" {
					s.output += block.Text
				}
			}
		case "tool/call":
			input := map[string]any{}
			if json.Unmarshal([]byte(data.Arguments), &input) != nil {
				input = map[string]any{"raw": data.Arguments}
			}
			emit(Event{Type: "tool", Payload: map[string]any{"name": data.Name, "call_id": data.CallID, "input": input, "status": "running"}})
		case "tool/result":
			for _, block := range data.Message.Content {
				if block.Type != "tool-result" {
					continue
				}
				status := "done"
				if block.IsError {
					status = "failed"
				}
				emit(Event{Type: "tool", Payload: map[string]any{"call_id": block.ToolCallID, "output": dshText(block.Content), "status": status}})
			}
		}
	}
	return nil
}

func dshText(blocks []dshBlock) string {
	var out strings.Builder
	for _, block := range blocks {
		if block.Type == "text" {
			out.WriteString(block.Text)
		} else if block.Type == "tool-result" {
			out.WriteString(dshText(block.Content))
		}
	}
	return out.String()
}

func runDSH(ctx context.Context, adapter Adapter, options Options) (map[string]any, error) {
	openRouterKey := strings.TrimSpace(options.Secret)
	if openRouterKey == "" {
		openRouterKey = strings.TrimSpace(options.CredentialEnv["OPENROUTER_API_KEY"])
	}
	if openRouterKey == "" {
		return nil, errors.New("DeepSeek Harness needs an OpenRouter API key")
	}
	model, err := dshModel(options.Model)
	if err != nil {
		return nil, err
	}
	if options.Timeout > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, options.Timeout)
		defer cancel()
	}
	dir, err := os.MkdirTemp(options.Dir, ".botinc-dsh-")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(dir)
	profile, err := writeDSHProfile(dir, model, options.MCPConfig)
	if err != nil {
		return nil, err
	}
	credentialEnv, secrets, cleanup, err := materializeCredential(adapter.Provider, options)
	if err != nil {
		return nil, err
	}
	defer cleanup()
	if len(options.MCPConfig) > 0 {
		secrets = append(secrets, string(options.MCPConfig))
		var document any
		if json.Unmarshal(options.MCPConfig, &document) == nil {
			secrets = append(secrets, stringLeaves(document)...)
		}
	}
	cmd := exec.CommandContext(ctx, adapter.Binary, "--profile", "sdk-minimal", "--patch", profile)
	cmd.Dir = options.Dir
	cmd.Env = append(os.Environ(), adapter.Env(openRouterKey)...)
	cmd.Env = append(cmd.Env, "DSH_HOME="+filepath.Join(dir, "home"))
	cmd.Env = append(cmd.Env, credentialEnv...)
	cmd.Env = append(cmd.Env, envPairs(options.Env)...)
	secrets = append(secrets, options.Secrets...)
	isolate(cmd)
	cmd.WaitDelay = 10 * time.Second
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	if err := cmd.Start(); err != nil {
		return nil, err
	}

	emit := func(event Event) {
		if event.Payload == nil {
			event.Payload = map[string]any{}
		}
		event.Payload = redactSecrets(event.Payload, secrets).(map[string]any)
		if options.Emit != nil {
			options.Emit(event)
		}
	}
	var stderrWait sync.WaitGroup
	stderrWait.Add(1)
	go func() {
		defer stderrWait.Done()
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			emit(Event{Type: "log", Payload: map[string]any{"line": scanner.Text(), "stream": "stderr"}})
		}
	}()

	write := func(id int, method string, params any) error {
		return json.NewEncoder(stdin).Encode(map[string]any{"jsonrpc": "2.0", "id": id, "method": method, "params": params})
	}
	state := dshState{sessionID: dshSessionID()}
	initialize := map[string]any{"model": model.Wire, "systemPrompt": "You are Operator, a careful software engineer. Complete the requested work and report the verified result."}
	if effort := strings.ToLower(strings.TrimSpace(options.Effort)); effort != "" && effort != "auto" && effort != "default" && effort != "not recorded" {
		if _, err := effortArgs("codex", effort); err != nil {
			return nil, err
		}
		initialize["reasoningEffort"] = effort
	}
	if err := write(1, "initialize", initialize); err != nil {
		return nil, err
	}
	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 64*1024), 4<<20)
	shutdown := false
	for scanner.Scan() {
		var frame struct {
			ID     int             `json:"id"`
			Method string          `json:"method"`
			Params json.RawMessage `json:"params"`
			Error  *struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		if err := json.Unmarshal(scanner.Bytes(), &frame); err != nil {
			return nil, fmt.Errorf("dsh: invalid protocol frame: %w", err)
		}
		if frame.Error != nil {
			return nil, fmt.Errorf("dsh RPC: %s", frame.Error.Message)
		}
		if frame.ID == 1 {
			if err := write(2, "session/prompt", map[string]any{"sessionId": state.sessionID, "prompt": options.Prompt}); err != nil {
				return nil, err
			}
		}
		if frame.Method != "" {
			if err := state.observe(frame.Method, frame.Params, emit); err != nil {
				return nil, err
			}
		}
		if state.ended && state.idle && !shutdown {
			shutdown = true
			if err := write(3, "shutdown", map[string]any{}); err != nil {
				return nil, err
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("dsh stream: %w", err)
	}
	waitErr := cmd.Wait()
	stderrWait.Wait()
	result := map[string]any{"result": state.output, "model": model.Name}
	if ctx.Err() != nil {
		return result, fmt.Errorf("the coding CLI ran past its time limit: %w", ctx.Err())
	}
	if waitErr != nil {
		return result, fmt.Errorf("dsh exited non-zero: %w", waitErr)
	}
	if !shutdown || !state.ended || !state.idle {
		return result, errors.New("dsh exited before a terminal turn and idle status")
	}
	if state.failure != "" {
		return result, errors.New(state.failure)
	}
	if strings.TrimSpace(state.output) == "" {
		return result, errors.New("dsh completed without final text")
	}
	return result, nil
}
