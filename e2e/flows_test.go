package e2e

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestCLISignsInAndSeesItsWorkspace(t *testing.T) {
	s := newStack(t)
	s.signIn("owner@example.test")

	out := s.botinc("whoami")
	if !strings.Contains(out, "owner@example.test") {
		t.Fatalf("whoami should name the signed-in user:\n%s", out)
	}
	var ws struct {
		Workspaces []struct {
			Slug string `json:"slug"`
			Role string `json:"role"`
		} `json:"workspaces"`
	}
	s.jsonOut(&ws, "workspace", "list")
	if len(ws.Workspaces) != 1 || ws.Workspaces[0].Role != "owner" {
		t.Fatalf("the first sign-in owns one workspace: %+v", ws.Workspaces)
	}
}

func TestCLIWithoutASessionSaysWhatToDo(t *testing.T) {
	s := newStack(t)
	// No sign-in: token and workspace are empty.
	out, err := s.try("issue", "list")
	if err == nil {
		t.Fatalf("listing issues unauthenticated should fail:\n%s", out)
	}
	if !strings.Contains(out, "botinc login") {
		t.Fatalf("the error should say how to fix it:\n%s", out)
	}
}

func TestIssueLifecycleThroughTheCLI(t *testing.T) {
	s := newStack(t)
	s.signIn("issues@example.test")

	var filed struct {
		Issue struct {
			Identifier string `json:"identifier"`
			Status     string `json:"status"`
			Priority   string `json:"priority"`
		} `json:"issue"`
	}
	s.jsonOut(&filed, "issue", "new", "The importer drops the last row", "-b", "Off-by-one in the loop.", "-p", "high")
	if filed.Issue.Identifier != "BOT-1" {
		t.Fatalf("first issue should be BOT-1, got %q", filed.Issue.Identifier)
	}
	if filed.Issue.Priority != "high" {
		t.Fatalf("the priority flag did not reach the API: %q", filed.Issue.Priority)
	}

	list := s.botinc("issue", "list")
	if !strings.Contains(list, "BOT-1") || !strings.Contains(list, "importer drops") {
		t.Fatalf("the issue should appear in the list:\n%s", list)
	}

	s.botinc("issue", "comment", "BOT-1", "Reproduced against staging.")
	show := s.botinc("issue", "show", "BOT-1")
	if !strings.Contains(show, "Reproduced against staging.") {
		t.Fatalf("the comment should appear on the issue:\n%s", show)
	}

	s.botinc("issue", "edit", "BOT-1", "--status", "blocked")
	if !strings.Contains(s.botinc("issue", "show", "BOT-1"), "blocked") {
		t.Fatal("the status change did not stick")
	}
	// The server's vocabulary is enforced, and the CLI reports its words.
	out, err := s.try("issue", "edit", "BOT-1", "--status", "nonsense")
	if err == nil {
		t.Fatal("an unknown status must fail")
	}
	if !strings.Contains(strings.ToLower(out), "status") {
		t.Fatalf("the failure should mention the status:\n%s", out)
	}
	// Editing nothing is refused locally rather than sent as an empty request.
	if out, err := s.try("issue", "edit", "BOT-1"); err == nil {
		t.Fatalf("an edit with no changes should be refused:\n%s", out)
	}
}

// The whole chain for a chat: CLI -> API -> sandbox -> the real runtime
// binary -> a coding CLI -> events and an answer back into the conversation.
func TestChatRunsEndToEndThroughTheRuntime(t *testing.T) {
	s := newStack(t)
	s.signIn("chat@example.test")
	// Give the workspace a credential so routing has something to pick.
	s.botinc("account", "add", "--provider", "claude", "--kind", "api_key", "--secret", "test-key")

	var started struct {
		Conversation struct {
			ID string `json:"id"`
		} `json:"conversation"`
		Run struct {
			ID string `json:"id"`
		} `json:"run"`
	}
	s.jsonOut(&started, "chat", "new", "Why is the deploy slow?")
	if started.Run.ID == "" {
		t.Fatal("a new chat should queue a run")
	}

	final := s.waitForRun(started.Run.ID, 90*time.Second)
	if final["status"] != "done" {
		t.Fatalf("the run should finish cleanly, got %v: %v", final["status"], final["error"])
	}

	// The runtime's answer landed in the conversation.
	read := s.botinc("chat", "show", started.Conversation.ID)
	if !strings.Contains(read, "Done.") {
		t.Fatalf("the operator's answer should be in the conversation:\n%s", read)
	}
	// Its events were recorded on the way through.
	var events struct {
		Events []struct {
			Type string `json:"type"`
		} `json:"events"`
	}
	s.jsonOut(&events, "run", "show", started.Run.ID)
	detail := s.botinc("run", "show", started.Run.ID)
	if !strings.Contains(detail, "done") {
		t.Fatalf("run show should report the outcome:\n%s", detail)
	}
	// The cost the CLI reported came from the coding CLI's own figure.
	if !strings.Contains(detail, "$0.04") {
		t.Fatalf("the run should carry the reported cost:\n%s", detail)
	}
}

// A coding CLI that exits non-zero must fail the run, and the failure must
// name a cause. The fake CLI is told to fail through the server's environment,
// which the local sandbox passes down to the runtime.
func TestARunThatFailsIsReportedAsFailed(t *testing.T) {
	s := newStack(t, "BOTINC_FAKE_FAIL=1")
	s.signIn("failure@example.test")
	s.botinc("account", "add", "--provider", "claude", "--kind", "api_key", "--secret", "test-key")

	var started struct {
		Run struct {
			ID string `json:"id"`
		} `json:"run"`
	}
	s.jsonOut(&started, "chat", "new", "This one breaks.")
	final := s.waitForRun(started.Run.ID, 90*time.Second)
	if final["status"] != "failed" {
		t.Fatalf("a non-zero coding CLI must fail the run, got %v", final["status"])
	}
	msg, _ := final["error"].(string)
	if msg == "" {
		t.Fatal("a failed run must say why")
	}
	// The cause must be the CLI's exit, not a missing credential or some
	// other setup problem standing in for a real failure.
	if !strings.Contains(msg, "exited non-zero") {
		t.Fatalf("the recorded cause should be the CLI's exit, got %q", msg)
	}
	// `botinc run watch` exits non-zero on a failed run, so it gates a script.
	if out, err := s.try("run", "watch", started.Run.ID); err == nil {
		t.Fatalf("watch should exit non-zero for a failed run:\n%s", out)
	}
}

func TestRoutineScheduleAndManualTrigger(t *testing.T) {
	s := newStack(t)
	s.signIn("routine@example.test")
	s.botinc("account", "add", "--provider", "claude", "--kind", "api_key", "--secret", "test-key")

	// An invalid cron is refused before anything is stored.
	if out, err := s.try("routine", "new", "--name", "Bad", "--prompt", "x", "--cron", "not a cron"); err == nil {
		t.Fatalf("an invalid cron must be refused:\n%s", out)
	}

	var made struct {
		Autopilot struct {
			ID        string `json:"id"`
			Name      string `json:"name"`
			NextRunAt string `json:"next_run_at"`
		} `json:"autopilot"`
	}
	s.jsonOut(&made, "routine", "new", "--name", "Morning triage", "--prompt", "Triage overnight work.", "--cron", "0 9 * * *", "--tz", "Europe/Madrid")
	if made.Autopilot.NextRunAt == "" {
		t.Fatal("a scheduled routine must know when it next fires")
	}

	list := s.botinc("routine", "list")
	if !strings.Contains(list, "Morning triage") || !strings.Contains(list, "0 9 * * *") {
		t.Fatalf("the routine and its schedule should be listed:\n%s", list)
	}

	var fired struct {
		Run struct {
			ID string `json:"id"`
		} `json:"run"`
	}
	s.jsonOut(&fired, "routine", "trigger", made.Autopilot.ID)
	if fired.Run.ID == "" {
		t.Fatal("triggering should start a run")
	}
	s.waitForRun(fired.Run.ID, 90*time.Second)

	s.botinc("routine", "pause", made.Autopilot.ID)
	if !strings.Contains(s.botinc("routine", "list"), "paused") {
		t.Fatal("pause should show in the list")
	}
	s.botinc("routine", "resume", made.Autopilot.ID)
	s.botinc("routine", "delete", made.Autopilot.ID)
	if strings.Contains(s.botinc("routine", "list"), made.Autopilot.ID) {
		t.Fatal("a deleted routine should be gone")
	}
}

func TestRoutineWebhookPrintsItsSecretOnce(t *testing.T) {
	s := newStack(t)
	s.signIn("hook@example.test")
	out := s.botinc("routine", "new", "--name", "On deploy", "--prompt", "Check the release.", "--webhook")
	if !strings.Contains(out, "/api/hooks/autopilots/") {
		t.Fatalf("a webhook routine should print its URL:\n%s", out)
	}
	if !strings.Contains(out, "whs_") {
		t.Fatalf("a webhook routine should print its secret once:\n%s", out)
	}
	if !strings.Contains(out, "not shown again") {
		t.Fatalf("the CLI should say the secret will not be shown again:\n%s", out)
	}
	// Reading it back must not disclose the secret.
	var list struct {
		Autopilots []struct {
			ID string `json:"id"`
		} `json:"autopilots"`
	}
	s.jsonOut(&list, "routine", "list")
	if len(list.Autopilots) != 1 {
		t.Fatalf("want one routine, got %d", len(list.Autopilots))
	}
	shown := s.botinc("routine", "show", list.Autopilots[0].ID)
	if strings.Contains(shown, "whs_") {
		t.Fatalf("the secret must not come back on a later read:\n%s", shown)
	}
}

func TestWorkflowsShipSeededAndValidateOnWrite(t *testing.T) {
	s := newStack(t)
	s.signIn("wf@example.test")

	list := s.botinc("workflow", "list")
	for _, key := range []string{"fix-review", "answer", "code-review"} {
		if !strings.Contains(list, key) {
			t.Fatalf("every workspace ships with %s:\n%s", key, list)
		}
	}
	show := s.botinc("workflow", "show", "fix-review")
	if !strings.Contains(show, "Fix & review") {
		t.Fatalf("workflow show should render the workflow:\n%s", show)
	}

	// A graph the runner could not execute is refused.
	bad := filepath.Join(s.home, "bad.json")
	writeFile(t, bad, `{"nodes":[{"key":"a","name":"A","kind":"task"}],"edges":[]}`)
	if out, err := s.try("workflow", "apply", "--name", "Broken", "--file", bad); err == nil {
		t.Fatalf("a graph with no start must be refused:\n%s", out)
	}

	good := filepath.Join(s.home, "good.json")
	writeFile(t, good, `{"nodes":[{"key":"start","name":"Start","kind":"start"},{"key":"triage","name":"Triage","kind":"task"},{"key":"finish","name":"Finish","kind":"finish"}],"edges":[["start","triage"],["triage","finish"]]}`)
	s.botinc("workflow", "apply", "--name", "Triage", "--file", good)
	if !strings.Contains(s.botinc("workflow", "list"), "triage") {
		t.Fatal("the new workflow should be listed")
	}

	// A version is immutable: applying again adds one and leaves v1 alone.
	next := filepath.Join(s.home, "next.json")
	writeFile(t, next, `{"nodes":[{"key":"start","name":"Start","kind":"start"},{"key":"triage","name":"Triage","kind":"task"},{"key":"ask","name":"Ask","kind":"question"},{"key":"finish","name":"Finish","kind":"finish"}],"edges":[["start","triage"],["triage","ask"],["ask","finish"]]}`)
	s.botinc("workflow", "apply", "triage", "--file", next)
	shown := s.botinc("workflow", "show", "triage")
	if !strings.Contains(shown, "draft") || !strings.Contains(shown, "active") {
		t.Fatalf("v2 should be a draft while v1 stays active:\n%s", shown)
	}
	s.botinc("workflow", "activate", "triage", "2")
	if !strings.Contains(s.botinc("workflow", "show", "triage"), "retired") {
		t.Fatal("activating v2 should retire v1")
	}
}

func TestAccountSecretsAreNeverPrintedBack(t *testing.T) {
	s := newStack(t)
	s.signIn("acct@example.test")

	const secret = "sk-ant-never-print-me"
	added := s.botinc("account", "add", "--provider", "claude", "--kind", "api_key", "--label", "Team key", "--secret", secret)
	if strings.Contains(added, secret) {
		t.Fatalf("the CLI echoed the secret back:\n%s", added)
	}
	list := s.botinc("account", "list")
	if strings.Contains(list, secret) {
		t.Fatalf("the account list leaked the secret:\n%s", list)
	}
	if !strings.Contains(list, "Team key") {
		t.Fatalf("the account should be listed:\n%s", list)
	}
	raw := s.botinc("account", "list", "--json")
	if strings.Contains(raw, secret) {
		t.Fatalf("the JSON output leaked the secret:\n%s", raw)
	}
}

func TestWorkspaceIsolationThroughTheCLI(t *testing.T) {
	s := newStack(t)
	s.signIn("first@example.test")
	s.botinc("issue", "new", "Private work")
	ownerWorkspace := s.workspace

	// A second person on the same deployment cannot read the first's work.
	s.signIn("second@example.test")
	if s.workspace == ownerWorkspace {
		t.Fatal("the second user should get their own workspace")
	}
	out, err := s.try("-w", ownerWorkspace, "issue", "list")
	if err == nil {
		t.Fatalf("a non-member must not read another workspace:\n%s", out)
	}
}

func TestJSONOutputIsExactlyTheAPIResponse(t *testing.T) {
	s := newStack(t)
	s.signIn("json@example.test")
	s.botinc("issue", "new", "Machine readable")

	var out struct {
		Issues []struct {
			ID         string `json:"id"`
			Identifier string `json:"identifier"`
			Title      string `json:"title"`
			Status     string `json:"status"`
		} `json:"issues"`
	}
	s.jsonOut(&out, "issue", "list")
	if len(out.Issues) != 1 {
		t.Fatalf("want one issue, got %d", len(out.Issues))
	}
	i := out.Issues[0]
	if i.ID == "" || i.Identifier != "BOT-1" || i.Title != "Machine readable" || i.Status != "todo" {
		t.Fatalf("the JSON should be the API's own shape: %+v", i)
	}
}

func writeFile(t *testing.T, path, body string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
}
