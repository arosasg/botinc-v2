package agent

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// fakeCLI writes a shell script that behaves like a coding CLI: it prints the
// lines it is given and exits with the code it is given. That exercises the
// real subprocess, pipe and scanner path without needing a model.
func fakeCLI(t *testing.T, name, body string) (dir string) {
	t.Helper()
	dir = t.TempDir()
	path := filepath.Join(dir, name)
	if err := os.WriteFile(path, []byte("#!/bin/sh\n"+body), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir+string(os.PathListSeparator)+os.Getenv("PATH"))
	return dir
}

func adapterFor(binary string) Adapter {
	return Adapter{
		Provider: "test", Binary: binary,
		Args:  func(prompt, model string) []string { return []string{prompt} },
		Env:   func(secret string) []string { return []string{"TEST_SECRET=" + secret} },
		Parse: jsonLine,
	}
}

func TestRunStreamsEventsAndReturnsTheResult(t *testing.T) {
	fakeCLI(t, "fakecli", `
echo '{"type":"assistant","text":"reading the code"}'
echo '{"type":"tool_use","name":"Edit","file":"main.go"}'
echo '{"type":"result","result":"Fixed the cache.","total_cost_usd":0.0412}'
exit 0
`)
	var got []Event
	out, err := Run(context.Background(), adapterFor("fakecli"), Options{
		Dir: t.TempDir(), Prompt: "fix it", Secret: "s",
		Emit: func(e Event) { got = append(got, e) },
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 3 {
		t.Fatalf("want three events, got %d: %+v", len(got), got)
	}
	if got[0].Type != "log" || got[1].Type != "tool" || got[2].Type != "result" {
		t.Fatalf("event types did not map: %v %v %v", got[0].Type, got[1].Type, got[2].Type)
	}
	if out == nil || out["result"] != "Fixed the cache." {
		t.Fatalf("the result event should come back: %+v", out)
	}
}

// A CLI can print a plausible-looking result and still fail. The exit status
// is the only honest signal, so a non-zero exit must be an error.
func TestNonZeroExitIsAnErrorEvenWithGoodOutput(t *testing.T) {
	fakeCLI(t, "failcli", `
echo '{"type":"result","result":"All good!","total_cost_usd":0.01}'
exit 3
`)
	out, err := Run(context.Background(), adapterFor("failcli"), Options{Dir: t.TempDir(), Prompt: "x", Secret: "s"})
	if err == nil {
		t.Fatal("a non-zero exit must be reported as a failure")
	}
	if out == nil {
		t.Fatal("the partial result should still come back for the record")
	}
}

func TestNonJSONOutputIsForwardedNotDropped(t *testing.T) {
	fakeCLI(t, "noisycli", `
echo 'panic: runtime error: index out of range'
echo '{"type":"result","result":"done"}'
exit 0
`)
	var got []Event
	if _, err := Run(context.Background(), adapterFor("noisycli"), Options{
		Dir: t.TempDir(), Prompt: "x", Secret: "s", Emit: func(e Event) { got = append(got, e) },
	}); err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 {
		t.Fatalf("want both lines, got %d", len(got))
	}
	if line, _ := got[0].Payload["line"].(string); !strings.Contains(line, "index out of range") {
		t.Fatalf("a plain-text panic must reach the user: %+v", got[0].Payload)
	}
}

func TestStderrIsCapturedAndLabelled(t *testing.T) {
	fakeCLI(t, "errcli", `
echo 'something went wrong' >&2
exit 0
`)
	var got []Event
	if _, err := Run(context.Background(), adapterFor("errcli"), Options{
		Dir: t.TempDir(), Prompt: "x", Secret: "s", Emit: func(e Event) { got = append(got, e) },
	}); err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 || got[0].Payload["stream"] != "stderr" {
		t.Fatalf("stderr should be captured and labelled: %+v", got)
	}
}

func TestMissingBinaryIsNamed(t *testing.T) {
	_, err := Run(context.Background(), adapterFor("definitely-not-installed-cli"), Options{Dir: t.TempDir(), Prompt: "x"})
	if !errors.Is(err, ErrBinaryMissing) {
		t.Fatalf("want ErrBinaryMissing, got %v", err)
	}
}

func TestTimeoutStopsTheCLI(t *testing.T) {
	fakeCLI(t, "slowcli", "sleep 30\n")
	start := time.Now()
	_, err := Run(context.Background(), adapterFor("slowcli"), Options{
		Dir: t.TempDir(), Prompt: "x", Secret: "s", Timeout: 300 * time.Millisecond,
	})
	if err == nil {
		t.Fatal("a CLI that overruns its limit must fail, not hang")
	}
	if time.Since(start) > 10*time.Second {
		t.Fatal("the timeout did not actually stop the process")
	}
}

func TestSecretReachesTheCLIThroughTheEnvironment(t *testing.T) {
	fakeCLI(t, "envcli", `
echo "{\"type\":\"result\",\"result\":\"$TEST_SECRET\"}"
exit 0
`)
	out, err := Run(context.Background(), adapterFor("envcli"), Options{Dir: t.TempDir(), Prompt: "x", Secret: "hunter2"})
	if err != nil {
		t.Fatal(err)
	}
	if out["result"] != "[redacted]" {
		t.Fatalf("the credential should arrive in the environment and be redacted from output: %+v", out)
	}
}

func TestStructuredCredentialIsIsolatedAndRemoved(t *testing.T) {
	fakeCLI(t, "structuredcli", `
test "$(cat "$CODEX_HOME/auth.json")" = '{"tokens":{"access_token":"file-secret"}}' || exit 8
test "$ACCOUNT_TOKEN" = 'env-secret' || exit 9
echo '{"type":"result","result":"file-secret env-secret"}'
exit 0
`)
	adapter := adapterFor("structuredcli")
	adapter.Provider = "codex"
	workdir := t.TempDir()
	out, err := Run(context.Background(), adapter, Options{
		Dir:             workdir,
		CredentialEnv:   map[string]string{"ACCOUNT_TOKEN": "env-secret"},
		CredentialFiles: map[string]string{"auth.json": `{"tokens":{"access_token":"file-secret"}}`},
	})
	if err != nil {
		t.Fatal(err)
	}
	if out["result"] != "[redacted] [redacted]" {
		t.Fatalf("structured secrets must be redacted: %+v", out)
	}
	if _, err := os.Stat(filepath.Join(workdir, ".botinc-credentials")); !os.IsNotExist(err) {
		t.Fatal("task credential directory was not removed")
	}
}

func TestStructuredCredentialCannotEscapeItsPrivateDirectory(t *testing.T) {
	fakeCLI(t, "structuredcli", "exit 0\n")
	adapter := adapterFor("structuredcli")
	adapter.Provider = "codex"
	_, err := Run(context.Background(), adapter, Options{
		Dir: t.TempDir(), CredentialFiles: map[string]string{"../../outside": "secret"},
	})
	if err == nil {
		t.Fatal("escaping credential path accepted")
	}
}

func TestClaudeReceivesPrivateMCPConfiguration(t *testing.T) {
	fakeCLI(t, "mcpcli", `
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--mcp-config" ]; then shift; mcp="$1"; fi
  if [ "$1" = "--allowedTools" ]; then shift; allowed="$1"; fi
  shift
done
test "$(cat "$mcp")" = '{"mcpServers":{"gmail":{"url":"https://example.test","headers":{"Authorization":"Bearer mcp-secret"}}}}' || exit 10
test "$allowed" = 'mcp__gmail__*' || exit 11
echo '{"type":"result","result":"mcp-secret"}'
`)
	adapter := adapterFor("mcpcli")
	adapter.Provider = "claude"
	workdir := t.TempDir()
	out, err := Run(context.Background(), adapter, Options{
		Dir:       workdir,
		MCPConfig: []byte(`{"mcpServers":{"gmail":{"url":"https://example.test","headers":{"Authorization":"Bearer mcp-secret"}}}}`),
	})
	if err != nil {
		t.Fatal(err)
	}
	if out["result"] != "[redacted]" {
		t.Fatalf("MCP token leaked through output: %+v", out)
	}
	if _, err := os.Stat(filepath.Join(workdir, ".botinc-mcp.json")); !os.IsNotExist(err) {
		t.Fatal("task MCP file was not removed")
	}
}

func TestCodexReceivesPrivateMCPConfiguration(t *testing.T) {
	fakeCLI(t, "mcpcli", `
test "$1" = '--profile' || exit 10
test "$2" = 'botinc-mcp' || exit 11
profile="$CODEX_HOME/botinc-mcp.config.toml"
grep -F '[mcp_servers.github]' "$profile" >/dev/null || exit 12
grep -F 'url = "https://example.test/mcp"' "$profile" >/dev/null || exit 13
grep -F 'http_headers = { "Authorization" = "Bearer mcp-secret" }' "$profile" >/dev/null || exit 14
echo '{"type":"result","result":"mcp-secret"}'
`)
	adapter := adapterFor("mcpcli")
	adapter.Provider = "codex"
	workdir := t.TempDir()
	out, err := Run(context.Background(), adapter, Options{
		Dir:             workdir,
		CredentialFiles: map[string]string{"auth.json": `{"tokens":{"access_token":"file-secret"}}`},
		MCPConfig:       []byte(`{"mcpServers":{"github":{"url":"https://example.test/mcp","headers":{"Authorization":"Bearer mcp-secret"}}}}`),
	})
	if err != nil {
		t.Fatal(err)
	}
	if out["result"] != "[redacted]" {
		t.Fatalf("the connector secret must be redacted: %+v", out)
	}
	if _, err := os.Stat(filepath.Join(workdir, ".botinc-credentials")); !os.IsNotExist(err) {
		t.Fatal("task MCP profile was not removed")
	}
}

func TestAllowedMCPToolsAreExactAndDeterministic(t *testing.T) {
	allowed, err := allowedMCPTools([]byte(`{"mcpServers":{"gmail":{},"braintrust-eu":{}}}`))
	if err != nil {
		t.Fatal(err)
	}
	if got := strings.Join(allowed, ","); got != "mcp__braintrust-eu__*,mcp__gmail__*" {
		t.Fatalf("unexpected MCP allowlist: %s", got)
	}
	if _, err := allowedMCPTools([]byte(`{"mcpServers":{"bad,*":{}}}`)); err == nil {
		t.Fatal("unsafe MCP server name accepted")
	}
}

func TestPickResolvesTheKnownProviders(t *testing.T) {
	for _, p := range []string{"claude", "codex", "deepseek", "openrouter"} {
		if a, err := Pick(p); err != nil || a.Provider != p {
			t.Fatalf("%s should resolve: %+v %v", p, a, err)
		}
	}
	if _, err := Pick("nonesuch"); err == nil {
		t.Fatal("an unknown provider must be an error, not a silent default")
	}
}

func TestDeepSeekHarnessModelAliases(t *testing.T) {
	for _, test := range []struct {
		model string
		wire  string
	}{
		{"DeepSeek V3", "deepseek/deepseek-chat"},
		{"DeepSeek R1", "deepseek/deepseek-r1"},
		{"DeepSeek V4.1 Flash", "deepseek/deepseek-v4.1-flash"},
	} {
		spec, err := dshModel(test.model)
		if err != nil {
			t.Fatal(err)
		}
		if spec.Wire != test.wire {
			t.Fatalf("%s resolved to %s, want %s", test.model, spec.Wire, test.wire)
		}
	}
	if _, err := dshModel("Claude Opus 5"); err == nil {
		t.Fatal("a non-DeepSeek model was accepted")
	}
}

func TestDeepSeekHarnessTranslatesSelectedMCPServers(t *testing.T) {
	plugins, err := dshMCPPlugins([]byte(`{"mcpServers":{"github":{"url":"https://example.test/mcp","headers":{"Authorization":"Bearer connector-secret"}},"local_tools":{"command":"node","args":["server.mjs"],"env":{"TOKEN":"stdio-secret"}}}}`))
	if err != nil {
		t.Fatal(err)
	}
	encoded, err := json.Marshal(plugins)
	if err != nil {
		t.Fatal(err)
	}
	profile := string(encoded)
	for _, expected := range []string{
		`"name":"@deepseek-ai/dsh-mcp-client"`,
		`"serverName":"github"`,
		`"transport":"streamable-http"`,
		`"serverName":"local_tools"`,
		`"transport":"stdio"`,
	} {
		if !strings.Contains(profile, expected) {
			t.Fatalf("DSH MCP profile lost %s: %s", expected, profile)
		}
	}
	if _, err := dshMCPPlugins([]byte(`{"mcpServers":{"bad.name":{"url":"https://example.test"}}}`)); err == nil {
		t.Fatal("a DSH-incompatible MCP server name was accepted")
	}
	if _, err := dshMCPPlugins([]byte(`{"mcpServers":{"missing_transport":{}}}`)); err == nil {
		t.Fatal("an MCP server without a transport was accepted")
	}
}

func TestProviderReasoningEffortArguments(t *testing.T) {
	claude, err := effortArgs("claude", "High")
	if err != nil || strings.Join(claude, " ") != "--effort high" {
		t.Fatalf("Claude effort arguments are wrong: %v %v", claude, err)
	}
	codex, err := effortArgs("codex", "XHigh")
	if err != nil || strings.Join(codex, " ") != `--config model_reasoning_effort="xhigh"` {
		t.Fatalf("Codex effort arguments are wrong: %v %v", codex, err)
	}
	if _, err := effortArgs("claude", "ultra"); err == nil {
		t.Fatal("an effort unsupported by Claude was accepted")
	}
	if _, err := effortArgs("codex", "invented"); err == nil {
		t.Fatal("an unknown effort was accepted")
	}
}

func TestRunDeepSeekHarnessProtocol(t *testing.T) {
	fakeCLI(t, "dsh", `
test -n "$OPENROUTER_API_KEY" || exit 9
read initialize
case "$initialize" in *'"reasoningEffort":"high"'*) ;; *) exit 8 ;; esac
echo '{"jsonrpc":"2.0","id":1,"result":{"version":1}}'
read prompt
echo '{"jsonrpc":"2.0","id":2,"result":{"messageId":"accepted"}}'
echo '{"jsonrpc":"2.0","method":"session.event","params":{"sessionId":"botinc-fixture","event":{"type":"tool/call","data":{"callId":"c1","name":"shell","arguments":"{\"command\":\"true\"}"}}}}'
echo '{"jsonrpc":"2.0","method":"session.event","params":{"sessionId":"botinc-fixture","event":{"type":"assistant/message","data":{"message":{"content":[{"type":"text","text":"DSH_OK"}]}}}}}'
echo '{"jsonrpc":"2.0","method":"session.event","params":{"sessionId":"botinc-fixture","event":{"type":"turn/end","data":{"reason":{"kind":"completed"}}}}}'
echo '{"jsonrpc":"2.0","method":"session.status","params":{"sessionId":"botinc-fixture","status":"idle"}}'
read shutdown
echo '{"jsonrpc":"2.0","id":3,"result":{}}'
`)

	previousNow := dshSessionID
	dshSessionID = func() string { return "botinc-fixture" }
	defer func() { dshSessionID = previousNow }()
	var events []Event
	adapter, err := Pick("deepseek")
	if err != nil {
		t.Fatal(err)
	}
	result, err := Run(context.Background(), adapter, Options{
		Dir: t.TempDir(), Prompt: "Return DSH_OK", Model: "DeepSeek V4.1 Flash", Effort: "High",
		CredentialEnv: map[string]string{"OPENROUTER_API_KEY": "fixture-key"},
		Emit:          func(event Event) { events = append(events, event) },
	})
	if err != nil {
		t.Fatal(err)
	}
	if result["result"] != "DSH_OK" {
		t.Fatalf("unexpected result: %+v", result)
	}
	if len(events) != 1 || events[0].Type != "tool" {
		t.Fatalf("tool event was not preserved: %+v", events)
	}
}

func TestAdapterArgumentsCarryTheModel(t *testing.T) {
	args := Adapters["claude"].Args("do the thing", "claude-opus-5")
	joined := strings.Join(args, " ")
	if !strings.Contains(joined, "--model claude-opus-5") {
		t.Fatalf("the model should be passed through: %v", args)
	}
	if strings.Contains(strings.Join(Adapters["claude"].Args("x", "auto"), " "), "--model") {
		t.Fatal("auto means let the CLI choose, so no --model flag")
	}
}

func TestAdapterArgumentsNormalizeDisplayModels(t *testing.T) {
	for _, test := range []struct {
		provider string
		display  string
		slug     string
	}{
		{provider: "claude", display: "Claude Opus 5", slug: "claude-opus-5"},
		{provider: "codex", display: "GPT-5.6 Sol", slug: "gpt-5.6-sol"},
		{provider: "codex", display: "GPT-6 Astra", slug: "gpt-6-astra"},
	} {
		joined := strings.Join(Adapters[test.provider].Args("do the thing", test.display), " ")
		if !strings.Contains(joined, "--model "+test.slug) {
			t.Fatalf("%s should map %q to %q: %s", test.provider, test.display, test.slug, joined)
		}
	}
}

func TestCodexAdapterUsesCurrentNonInteractiveSandboxFlag(t *testing.T) {
	args := Adapters["codex"].Args("do the thing", "auto")
	joined := strings.Join(args, " ")
	if strings.Contains(joined, "--full-auto") {
		t.Fatalf("Codex 0.154 removed --full-auto: %v", args)
	}
	if !strings.Contains(joined, "--dangerously-bypass-approvals-and-sandbox") {
		t.Fatalf("the externally isolated runtime must remain non-interactive: %v", args)
	}
}

// A coding CLI spawns children. Killing only the parent leaves them holding
// the output pipes, which used to keep the runtime blocked long past its
// deadline. The whole process group must go.
func TestTimeoutKillsGrandchildrenToo(t *testing.T) {
	fakeCLI(t, "spawncli", `
sleep 30 &
wait
`)
	start := time.Now()
	if _, err := Run(context.Background(), adapterFor("spawncli"), Options{
		Dir: t.TempDir(), Prompt: "x", Secret: "s", Timeout: 300 * time.Millisecond,
	}); err == nil {
		t.Fatal("the run must fail when it overruns")
	}
	if elapsed := time.Since(start); elapsed > 5*time.Second {
		t.Fatalf("a spawned child kept the runtime alive for %s", elapsed)
	}
}

func TestCodexAgentMessageBecomesTheAnswer(t *testing.T) {
	event, ok := jsonLine(`{"type":"item.completed","item":{"id":"i1","type":"agent_message","text":"The check passed."}}`)
	if !ok || event.Type != "result" || event.Payload["result"] != "The check passed." {
		t.Fatalf("Codex answer lost: %#v", event)
	}
}
func TestErrorResultDoesNotReportSuccess(t *testing.T) {
	fakeCLI(t, "errorresult", `echo '{"type":"result","is_error":true,"result":"authentication failed"}'`)
	if _, err := Run(t.Context(), adapterFor("errorresult"), Options{Dir: t.TempDir()}); err == nil {
		t.Fatal("error result accepted")
	}
}
func TestOpenRouterUsesGatewayAuthentication(t *testing.T) {
	environment := strings.Join(Adapters["openrouter"].Env("test-key"), "\n")
	if !strings.Contains(environment, "ANTHROPIC_AUTH_TOKEN=test-key") || !strings.Contains(environment, "ANTHROPIC_BASE_URL=https://openrouter.ai/api\n") && strings.HasSuffix(environment, "/v1") {
		t.Fatal("gateway authentication is wrong")
	}
}
