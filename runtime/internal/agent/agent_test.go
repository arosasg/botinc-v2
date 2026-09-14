package agent

import (
	"context"
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

func TestPickResolvesTheKnownProviders(t *testing.T) {
	for _, p := range []string{"claude", "codex", "openrouter"} {
		if a, err := Pick(p); err != nil || a.Provider != p {
			t.Fatalf("%s should resolve: %+v %v", p, a, err)
		}
	}
	if _, err := Pick("nonesuch"); err == nil {
		t.Fatal("an unknown provider must be an error, not a silent default")
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
