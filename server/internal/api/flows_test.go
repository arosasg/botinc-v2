package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestSignInCreatesWorkspaceAndSession(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	var me struct {
		User struct {
			Email string `json:"email"`
		} `json:"user"`
	}
	h.decode(h.do("GET", "/api/me", nil, 200), &me)
	if me.User.Email == "" {
		t.Fatal("signed-in caller has no email")
	}
	var list struct {
		Workspaces []struct {
			Slug string `json:"slug"`
			Role string `json:"role"`
		} `json:"workspaces"`
	}
	h.decode(h.do("GET", "/api/workspaces", nil, 200), &list)
	if len(list.Workspaces) != 1 || list.Workspaces[0].Role != "owner" {
		t.Fatalf("first sign-in should own exactly one workspace, got %+v", list.Workspaces)
	}
	// Three built-in workflows ship with every workspace.
	var wfs struct {
		Workflows []Workflow `json:"workflows"`
	}
	h.decode(h.do("GET", h.w("/workflows"), nil, 200), &wfs)
	if len(wfs.Workflows) != 3 {
		t.Fatalf("want 3 seeded workflows, got %d", len(wfs.Workflows))
	}
	for _, wf := range wfs.Workflows {
		if wf.ActiveID == nil {
			t.Fatalf("seeded workflow %s has no active version", wf.Key)
		}
	}
}

func TestUnauthenticatedIsRejected(t *testing.T) {
	h := newHarness(t)
	if rec := h.request("GET", "/api/me", nil); rec.Code != 401 {
		t.Fatalf("want 401 without a session, got %d", rec.Code)
	}
	if rec := h.request("GET", "/api/w/anything/issues", nil); rec.Code != 401 {
		t.Fatalf("want 401 for a scoped route without a session, got %d", rec.Code)
	}
}

func TestWorkspaceIsolation(t *testing.T) {
	owner := newHarness(t)
	owner.signIn(uniqueEmail(t))
	var created struct {
		Issue Issue `json:"issue"`
	}
	owner.decode(owner.do("POST", owner.w("/issues"), map[string]any{"title": "Private work"}, 201), &created)

	stranger := newHarness(t)
	stranger.signIn(uniqueEmail(t))
	// The stranger's own slug resolves; the owner's must not.
	if rec := stranger.request("GET", "/api/w/"+owner.ws+"/issues", nil); rec.Code != 404 {
		t.Fatalf("a non-member must not reach another workspace: got %d", rec.Code)
	}
}

func TestIssueLifecycle(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	var first struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("POST", h.w("/issues"), map[string]any{
		"title": "Search returns stale results", "description": "Cache is not invalidated.", "priority": "high",
	}, 201), &first)
	if first.Issue.Identifier != "BOT-1" {
		t.Fatalf("first issue should be BOT-1, got %q", first.Issue.Identifier)
	}
	if first.Issue.Status != "todo" || first.Issue.Priority != "high" {
		t.Fatalf("unexpected issue state: %+v", first.Issue)
	}
	if first.Issue.WorkflowID == nil {
		t.Fatal("a new issue should carry the default workflow")
	}

	var second struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("POST", h.w("/issues"), map[string]any{"title": "Second"}, 201), &second)
	if second.Issue.Identifier != "BOT-2" {
		t.Fatalf("numbers must increment per workspace, got %q", second.Issue.Identifier)
	}

	// The human identifier addresses the issue as well as the uuid does.
	var byName struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("GET", h.w("/issues/BOT-1"), nil, 200), &byName)
	if byName.Issue.ID != first.Issue.ID {
		t.Fatal("BOT-1 should resolve to the first issue")
	}

	h.do("POST", h.w("/issues/BOT-1/comments"), map[string]any{"body": "Reproduced on staging."}, 201)
	var detail struct {
		Comments []issueComment `json:"comments"`
	}
	h.decode(h.do("GET", h.w("/issues/BOT-1"), nil, 200), &detail)
	if len(detail.Comments) != 1 || detail.Comments[0].Body != "Reproduced on staging." {
		t.Fatalf("comment did not land: %+v", detail.Comments)
	}

	h.do("PATCH", h.w("/issues/BOT-1"), map[string]any{"status": "blocked"}, 200)
	var after struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("GET", h.w("/issues/BOT-1"), nil, 200), &after)
	if after.Issue.Status != "blocked" {
		t.Fatalf("status did not stick: %q", after.Issue.Status)
	}
	if rec := h.request("PATCH", h.w("/issues/BOT-1"), map[string]any{"status": "nonsense"}); rec.Code != 400 {
		t.Fatalf("an unknown status must be rejected, got %d", rec.Code)
	}
	h.do("GET", h.w("/issues?status=blocked"), nil, 200)
	if rec := h.request("GET", h.w("/issues/BOT-99"), nil); rec.Code != 404 {
		t.Fatalf("want 404 for an issue that does not exist, got %d", rec.Code)
	}
}

func TestWorkOnIssueQueuesARemoteRun(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var created struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("POST", h.w("/issues"), map[string]any{"title": "Add a health check"}, 201), &created)

	var started struct {
		Run struct {
			ID      uuid.UUID `json:"id"`
			Purpose string    `json:"purpose"`
			Status  string    `json:"status"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/issues/"+created.Issue.ID.String()+"/work"), map[string]any{}, 202), &started)
	if started.Run.Purpose != "build" {
		t.Fatalf("work should queue a build run, got %q", started.Run.Purpose)
	}

	// The issue moves to in_progress immediately, before the sandbox exists.
	var detail struct {
		Issue Issue     `json:"issue"`
		Steps []StepRow `json:"steps"`
	}
	h.decode(h.do("GET", h.w("/issues/BOT-1"), nil, 200), &detail)
	if detail.Issue.Status != "in_progress" {
		t.Fatalf("issue should be in_progress, got %q", detail.Issue.Status)
	}
	// Steps come from the seeded fix-review graph: plan, implement, review,
	// verify, approval. start and finish are bookkeeping, not steps.
	keys := make([]string, 0, len(detail.Steps))
	for _, s := range detail.Steps {
		keys = append(keys, s.Key)
	}
	want := "plan,implement,review,verify,approval"
	if strings.Join(keys, ",") != want {
		t.Fatalf("steps from the workflow graph: got %v want %s", keys, want)
	}

	// A second run while the first is live is refused.
	if rec := h.request("POST", h.w("/issues/BOT-1/work"), map[string]any{}); rec.Code != 409 {
		t.Fatalf("a concurrent run must be refused, got %d", rec.Code)
	}

	// The run was handed to the sandbox provider, with a token it can use.
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) && len(h.box.seen()) == 0 {
		time.Sleep(20 * time.Millisecond)
	}
	specs := h.box.seen()
	if len(specs) == 0 {
		t.Fatal("the run was never dispatched to a sandbox")
	}
	if specs[0].RunToken == "" || specs[0].APIURL == "" {
		t.Fatalf("the sandbox spec must carry a run token and the API URL: %+v", specs[0])
	}
	if specs[0].RunID != started.Run.ID.String() {
		t.Fatalf("sandbox spec is for the wrong run: %s", specs[0].RunID)
	}
}

func TestRuntimeProtocolDrivesTheRun(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var created struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("POST", h.w("/issues"), map[string]any{"title": "Ship the runtime"}, 201), &created)
	var started struct {
		Run struct {
			ID uuid.UUID `json:"id"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/issues/BOT-1/work"), map[string]any{}, 202), &started)

	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) && len(h.box.seen()) == 0 {
		time.Sleep(20 * time.Millisecond)
	}
	specs := h.box.seen()
	if len(specs) == 0 {
		t.Fatal("no sandbox spec")
	}
	token := specs[0].RunToken
	runPath := "/api/runtime/runs/" + started.Run.ID.String()

	// A wrong token is refused before anything else happens.
	rec := runtimeCall(h, "POST", runPath+"/claim", "nope", nil)
	if rec.Code != 401 {
		t.Fatalf("a bad run token must be refused, got %d", rec.Code)
	}
	if rec := runtimeCall(h, "POST", runPath+"/claim", token, nil); rec.Code != 200 {
		t.Fatalf("claim failed: %d %s", rec.Code, rec.Body.String())
	}
	// The spec carries the issue the run is for.
	specRec := runtimeCall(h, "GET", runPath+"/spec", token, nil)
	if specRec.Code != 200 {
		t.Fatalf("spec failed: %d %s", specRec.Code, specRec.Body.String())
	}
	var spec struct {
		Issue Issue     `json:"issue"`
		Steps []StepRow `json:"steps"`
	}
	h.decode(specRec, &spec)
	if spec.Issue.Title != "Ship the runtime" || len(spec.Steps) != 5 {
		t.Fatalf("unexpected spec: %+v", spec)
	}

	runtimeCall(h, "POST", runPath+"/events", token, map[string]any{
		"events": []map[string]any{{"seq": 1, "type": "log", "payload": map[string]any{"line": "cloning"}}},
	})
	if rec := runtimeCall(h, "POST", runPath+"/steps", token, map[string]any{"key": "plan", "status": "done", "cost_cents": 7}); rec.Code != 200 {
		t.Fatalf("step update failed: %d %s", rec.Code, rec.Body.String())
	}
	if rec := runtimeCall(h, "POST", runPath+"/finish", token, map[string]any{
		"status": "done",
		"result": map[string]any{"pull_request": map[string]any{"url": "https://github.com/a/b/pull/1", "number": 1}},
	}); rec.Code != 200 {
		t.Fatalf("finish failed: %d %s", rec.Code, rec.Body.String())
	}

	// Finishing a build moves the issue to review and asks the human.
	var detail struct {
		Issue Issue `json:"issue"`
		Runs  []struct {
			Status    string `json:"status"`
			CostCents int    `json:"cost_cents"`
		} `json:"runs"`
	}
	h.decode(h.do("GET", h.w("/issues/BOT-1"), nil, 200), &detail)
	if detail.Issue.Status != "in_review" {
		t.Fatalf("a finished build should wait for review, got %q", detail.Issue.Status)
	}
	if len(detail.Issue.NeedsYou) == 0 || string(detail.Issue.NeedsYou) == "null" {
		t.Fatal("the issue should record that it needs the human")
	}
	if detail.Runs[0].Status != "done" || detail.Runs[0].CostCents != 7 {
		t.Fatalf("run should be done and carry its cost: %+v", detail.Runs[0])
	}
}

func TestApprovalIsRequiredAndNothingMergesItself(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/issues"), map[string]any{"title": "Guarded merge"}, 201)

	// Approving before review is refused.
	if rec := h.request("POST", h.w("/issues/BOT-1/approve"), map[string]any{}); rec.Code != 409 {
		t.Fatalf("approval before review must be refused, got %d", rec.Code)
	}
	if _, err := testPool.Exec(t.Context(), `update issues set status='in_review' where number=1`); err != nil {
		t.Fatal(err)
	}
	var approved struct {
		Status string `json:"status"`
		Run    *struct {
			Purpose string `json:"purpose"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/issues/BOT-1/approve"), map[string]any{"note": "Reads well."}, 200), &approved)
	if approved.Status != "done" {
		t.Fatalf("plain approval closes the issue, got %q", approved.Status)
	}
	if approved.Run != nil {
		t.Fatal("approval alone must not start a merge")
	}

	// Asking for a merge makes it a run with its own record, not a flip.
	if _, err := testPool.Exec(t.Context(), `update issues set status='in_review' where number=1`); err != nil {
		t.Fatal(err)
	}
	var merged struct {
		Status string `json:"status"`
		Run    *struct {
			Purpose string `json:"purpose"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/issues/BOT-1/approve"), map[string]any{"merge": true}, 200), &merged)
	if merged.Run == nil || merged.Run.Purpose != "merge" {
		t.Fatalf("a merge must be a recorded run, got %+v", merged.Run)
	}
	if merged.Status != "in_progress" {
		t.Fatalf("the issue stays open until the merge run reports, got %q", merged.Status)
	}
}

func TestRequestChangesRestartsTheWork(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/issues"), map[string]any{"title": "Needs another pass"}, 201)
	if _, err := testPool.Exec(t.Context(), `update issues set status='in_review' where number=1`); err != nil {
		t.Fatal(err)
	}
	if rec := h.request("POST", h.w("/issues/BOT-1/changes"), map[string]any{}); rec.Code != 400 {
		t.Fatalf("changes without a note must be refused, got %d", rec.Code)
	}
	var out struct {
		Run struct {
			Prompt string `json:"prompt"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/issues/BOT-1/changes"), map[string]any{"note": "Handle the empty case."}, 202), &out)
	if !strings.Contains(out.Run.Prompt, "Handle the empty case.") {
		t.Fatalf("the new run must carry the reviewer's note: %q", out.Run.Prompt)
	}
	var detail struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("GET", h.w("/issues/BOT-1"), nil, 200), &detail)
	if detail.Issue.Status != "in_progress" {
		t.Fatalf("requesting changes reopens the work, got %q", detail.Issue.Status)
	}
}

func TestConversationCarriesAMessageAndARun(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var out struct {
		Conversation Conversation `json:"conversation"`
		Message      *Message     `json:"message"`
		Run          *struct {
			Purpose string `json:"purpose"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "Why is the deploy slow?"}, 201), &out)
	if out.Conversation.Title != "Why is the deploy slow?" {
		t.Fatalf("the title comes from the first message, got %q", out.Conversation.Title)
	}
	if out.Message == nil || out.Message.Role != "user" {
		t.Fatalf("the first message should be recorded: %+v", out.Message)
	}
	if out.Run == nil || out.Run.Purpose != "chat" {
		t.Fatalf("a message should queue a chat run, got %+v", out.Run)
	}

	var list struct {
		Conversations []Conversation `json:"conversations"`
	}
	h.decode(h.do("GET", h.w("/conversations"), nil, 200), &list)
	if len(list.Conversations) != 1 {
		t.Fatalf("want one conversation, got %d", len(list.Conversations))
	}

	// A second message while a run is live is queued, not dropped.
	path := h.w("/conversations/" + out.Conversation.ID.String())
	h.do("POST", path+"/queue", map[string]any{"body": "Also check the cache."}, 201)
	var queue struct {
		Queue []struct {
			Body string `json:"body"`
		} `json:"queue"`
	}
	h.decode(h.do("GET", path+"/queue", nil, 200), &queue)
	if len(queue.Queue) != 1 || queue.Queue[0].Body != "Also check the cache." {
		t.Fatalf("queue did not hold the message: %+v", queue.Queue)
	}
}

func TestWorkflowGraphValidation(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	bad := []struct {
		name  string
		graph string
	}{
		{"no start", `{"nodes":[{"key":"a","name":"A","kind":"task"},{"key":"f","name":"F","kind":"finish"}],"edges":[["a","f"]]}`},
		{"two starts", `{"nodes":[{"key":"s","name":"S","kind":"start"},{"key":"s2","name":"S2","kind":"start"},{"key":"f","name":"F","kind":"finish"}],"edges":[["s","f"]]}`},
		{"no finish", `{"nodes":[{"key":"s","name":"S","kind":"start"},{"key":"a","name":"A","kind":"task"}],"edges":[["s","a"]]}`},
		{"duplicate key", `{"nodes":[{"key":"s","name":"S","kind":"start"},{"key":"s","name":"S","kind":"task"},{"key":"f","name":"F","kind":"finish"}],"edges":[["s","f"]]}`},
		{"unknown kind", `{"nodes":[{"key":"s","name":"S","kind":"start"},{"key":"a","name":"A","kind":"teleport"},{"key":"f","name":"F","kind":"finish"}],"edges":[["s","a"],["a","f"]]}`},
		{"dangling edge", `{"nodes":[{"key":"s","name":"S","kind":"start"},{"key":"f","name":"F","kind":"finish"}],"edges":[["s","ghost"]]}`},
		{"unreachable node", `{"nodes":[{"key":"s","name":"S","kind":"start"},{"key":"orphan","name":"O","kind":"task"},{"key":"f","name":"F","kind":"finish"}],"edges":[["s","f"]]}`},
	}
	for _, c := range bad {
		t.Run(c.name, func(t *testing.T) {
			rec := h.request("POST", h.w("/workflows"), map[string]any{"name": "Bad " + c.name, "graph": json.RawMessage(c.graph)})
			if rec.Code != 400 {
				t.Fatalf("%s should be rejected, got %d %s", c.name, rec.Code, rec.Body.String())
			}
		})
	}

	good := `{"nodes":[{"key":"start","name":"Start","kind":"start"},{"key":"triage","name":"Triage","kind":"task","model":"auto"},{"key":"ask","name":"Ask","kind":"question"},{"key":"finish","name":"Finish","kind":"finish"}],"edges":[["start","triage"],["triage","ask"],["ask","finish"]],"limits":{"task_limit_cents":150}}`
	var made struct {
		Workflow Workflow `json:"workflow"`
	}
	h.decode(h.do("POST", h.w("/workflows"), map[string]any{"name": "Triage", "graph": json.RawMessage(good)}, 201), &made)
	if made.Workflow.Key != "triage" || made.Workflow.ActiveID == nil {
		t.Fatalf("a new workflow is slugged and active: %+v", made.Workflow)
	}
	// A repeated key is a conflict, not a silent overwrite.
	if rec := h.request("POST", h.w("/workflows"), map[string]any{"key": "triage", "name": "Triage again", "graph": json.RawMessage(good)}); rec.Code != 409 {
		t.Fatalf("duplicate key should conflict, got %d", rec.Code)
	}

	// Steps flatten in graph order, without start and finish.
	steps, limit := stepsFromGraph([]byte(good))
	if len(steps) != 2 || steps[0].Key != "triage" || steps[1].Key != "ask" {
		t.Fatalf("unexpected flattening: %+v", steps)
	}
	if limit != 150 {
		t.Fatalf("the graph's task limit should carry, got %d", limit)
	}
}

func TestWorkflowVersionsAreImmutable(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	base := `{"nodes":[{"key":"start","name":"Start","kind":"start"},{"key":"a","name":"A","kind":"task"},{"key":"finish","name":"Finish","kind":"finish"}],"edges":[["start","a"],["a","finish"]]}`
	var made struct {
		Workflow Workflow `json:"workflow"`
	}
	h.decode(h.do("POST", h.w("/workflows"), map[string]any{"name": "Versioned", "graph": json.RawMessage(base)}, 201), &made)
	path := h.w("/workflows/" + made.Workflow.ID.String())

	next := `{"nodes":[{"key":"start","name":"Start","kind":"start"},{"key":"a","name":"A","kind":"task"},{"key":"b","name":"B","kind":"task"},{"key":"finish","name":"Finish","kind":"finish"}],"edges":[["start","a"],["a","b"],["b","finish"]]}`
	var v2 struct {
		Version WorkflowVersion `json:"version"`
	}
	h.decode(h.do("POST", path+"/versions", map[string]any{"graph": json.RawMessage(next)}, 201), &v2)
	if v2.Version.Version != 2 || v2.Version.Status != "draft" {
		t.Fatalf("a new version starts as draft v2: %+v", v2.Version)
	}
	// v1 is still the active one until the draft is activated.
	var detail struct {
		Workflow Workflow          `json:"workflow"`
		Versions []WorkflowVersion `json:"versions"`
	}
	h.decode(h.do("GET", path, nil, 200), &detail)
	if len(detail.Versions) != 2 || *detail.Workflow.ActiveID == v2.Version.ID {
		t.Fatal("a draft must not become active on its own")
	}
	h.do("POST", path+"/versions/2/activate", nil, 200)
	h.decode(h.do("GET", path, nil, 200), &detail)
	if *detail.Workflow.ActiveID != v2.Version.ID {
		t.Fatal("activation did not take")
	}
	for _, v := range detail.Versions {
		if v.Version == 1 && v.Status != "retired" {
			t.Fatalf("v1 should be retired, got %q", v.Status)
		}
	}
	if rec := h.request("POST", path+"/versions/9/activate", nil); rec.Code != 404 {
		t.Fatalf("activating a version that does not exist should 404, got %d", rec.Code)
	}
}

func TestAutopilotSchedule(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	if rec := h.request("POST", h.w("/autopilots"), map[string]any{
		"name": "Broken", "prompt": "x", "trigger": map[string]any{"kind": "schedule", "cron": "not a cron"},
	}); rec.Code != 400 {
		t.Fatalf("an invalid cron must be refused at write time, got %d", rec.Code)
	}
	if rec := h.request("POST", h.w("/autopilots"), map[string]any{
		"name": "No prompt", "trigger": map[string]any{"kind": "manual"},
	}); rec.Code != 400 {
		t.Fatalf("a routine without a prompt must be refused, got %d", rec.Code)
	}

	var made struct {
		Autopilot Autopilot `json:"autopilot"`
	}
	h.decode(h.do("POST", h.w("/autopilots"), map[string]any{
		"name": "Morning triage", "prompt": "Triage everything filed overnight.",
		"trigger": map[string]any{"kind": "schedule", "cron": "0 9 * * *", "tz": "Europe/Madrid"},
	}, 201), &made)
	if made.Autopilot.NextRunAt == nil || !made.Autopilot.NextRunAt.After(time.Now()) {
		t.Fatalf("a scheduled routine must know when it next fires: %+v", made.Autopilot.NextRunAt)
	}
	if !made.Autopilot.Enabled {
		t.Fatal("a new routine is enabled")
	}

	// Firing it by hand records a run against the routine.
	var fired struct {
		Run struct {
			ID      uuid.UUID `json:"id"`
			Purpose string    `json:"purpose"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/autopilots/"+made.Autopilot.ID.String()+"/trigger"), map[string]any{}, 202), &fired)
	if fired.Run.Purpose != "autopilot" {
		t.Fatalf("want an autopilot run, got %q", fired.Run.Purpose)
	}
	var listed struct {
		Runs []autopilotRunRow `json:"runs"`
	}
	h.decode(h.do("GET", h.w("/autopilots/"+made.Autopilot.ID.String()+"/runs"), nil, 200), &listed)
	if len(listed.Runs) != 1 || listed.Runs[0].RunID == nil || *listed.Runs[0].RunID != fired.Run.ID {
		t.Fatalf("the run should be recorded against the routine: %+v", listed.Runs)
	}

	// Pausing it stops the scheduler from firing it.
	h.do("PATCH", h.w("/autopilots/"+made.Autopilot.ID.String()), map[string]any{"enabled": false}, 200)
	if err := h.server.FireDue(t.Context(), mustWorkspaceID(t, h), made.Autopilot.ID); err != nil {
		t.Fatal(err)
	}
	h.decode(h.do("GET", h.w("/autopilots/"+made.Autopilot.ID.String()+"/runs"), nil, 200), &listed)
	if len(listed.Runs) != 1 {
		t.Fatalf("a paused routine must not fire, got %d runs", len(listed.Runs))
	}

	h.do("DELETE", h.w("/autopilots/"+made.Autopilot.ID.String()), nil, 200)
	if rec := h.request("GET", h.w("/autopilots/"+made.Autopilot.ID.String()), nil); rec.Code != 404 {
		t.Fatalf("a deleted routine is gone, got %d", rec.Code)
	}
}

func TestAutopilotWebhookNeedsItsSignature(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var made struct {
		Autopilot Autopilot `json:"autopilot"`
		Secret    string    `json:"secret"`
		URL       string    `json:"webhook_url"`
	}
	h.decode(h.do("POST", h.w("/autopilots"), map[string]any{
		"name": "On deploy", "prompt": "Check the release.", "trigger": map[string]any{"kind": "webhook"},
	}, 201), &made)
	if made.Secret == "" || made.URL == "" {
		t.Fatalf("a webhook routine hands back its URL and secret once: %+v", made)
	}

	path := "/api/hooks/autopilots/" + made.Autopilot.ID.String()
	body := `{"event":"deploy","sha":"abc123"}`

	// No signature, and a wrong one, are both refused.
	if rec := hookCall(h, path, body, ""); rec.Code != 401 {
		t.Fatalf("an unsigned webhook must be refused, got %d", rec.Code)
	}
	if rec := hookCall(h, path, body, "sha256=deadbeef"); rec.Code != 401 {
		t.Fatalf("a wrong signature must be refused, got %d", rec.Code)
	}
	mac := hmac.New(sha256.New, []byte(made.Secret))
	mac.Write([]byte(body))
	sig := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	// The signature covers the body, so tampering invalidates it.
	if rec := hookCall(h, path, `{"event":"deploy","sha":"tampered"}`, sig); rec.Code != 401 {
		t.Fatalf("a tampered body must be refused, got %d", rec.Code)
	}
	if rec := hookCall(h, path, body, sig); rec.Code != 202 {
		t.Fatalf("a correctly signed webhook should fire: %d %s", rec.Code, rec.Body.String())
	}
	var listed struct {
		Runs []autopilotRunRow `json:"runs"`
	}
	h.decode(h.do("GET", h.w("/autopilots/"+made.Autopilot.ID.String()+"/runs"), nil, 200), &listed)
	if len(listed.Runs) != 1 {
		t.Fatalf("the webhook should have produced exactly one run, got %d", len(listed.Runs))
	}
}

func TestModelAccountSecretsNeverComeBack(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	if rec := h.request("POST", h.w("/accounts"), map[string]any{"provider": "wat", "kind": "subscription"}); rec.Code != 400 {
		t.Fatalf("an unknown provider must be refused, got %d", rec.Code)
	}
	if rec := h.request("POST", h.w("/accounts"), map[string]any{"provider": "claude", "kind": "api_key"}); rec.Code != 400 {
		t.Fatalf("an API-key account needs a key, got %d", rec.Code)
	}

	const secret = "sk-ant-super-secret-value"
	rec := h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "claude", "kind": "api_key", "label": "Team key", "secret": secret,
	}, 201)
	if strings.Contains(rec.Body.String(), secret) {
		t.Fatal("the API response leaked the secret")
	}
	var made struct {
		Account Account `json:"account"`
	}
	h.decode(rec, &made)
	if !made.Account.HasSecret {
		t.Fatal("the account should report that it holds a secret")
	}

	listRec := h.do("GET", h.w("/accounts"), nil, 200)
	if strings.Contains(listRec.Body.String(), secret) {
		t.Fatal("the account list leaked the secret")
	}
	// The stored ciphertext is not the plaintext.
	var stored []byte
	if err := testPool.QueryRow(t.Context(), `select s.ciphertext from secrets s join model_accounts a on a.secret_ref = s.ref where a.id=$1`, made.Account.ID).Scan(&stored); err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(stored), secret) {
		t.Fatal("the secret is stored in the clear")
	}
	// It round-trips for the runtime, and only there.
	got, err := h.server.readSecret(t.Context(), refOf(t, made.Account.ID))
	if err != nil || got != secret {
		t.Fatalf("the runtime must be able to read it back: %q %v", got, err)
	}

	h.do("DELETE", h.w("/accounts/"+made.Account.ID.String()), nil, 200)
	var left int
	if err := testPool.QueryRow(t.Context(), `select count(*) from model_accounts where id=$1`, made.Account.ID).Scan(&left); err != nil {
		t.Fatal(err)
	}
	if left != 0 {
		t.Fatal("disconnect should remove the account")
	}
}

func TestRoutingPrefersASubscription(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/accounts"), map[string]any{"provider": "claude", "kind": "api_key", "secret": "k"}, 201)
	subRec := h.do("POST", h.w("/accounts"), map[string]any{"provider": "claude", "kind": "subscription", "plan": "max"}, 201)
	var sub struct {
		Account Account `json:"account"`
	}
	h.decode(subRec, &sub)

	h.do("POST", h.w("/conversations"), map[string]any{"message": "Route me."}, 201)
	var accountID *uuid.UUID
	var funding string
	if err := testPool.QueryRow(t.Context(), `select account_id, funding from runs order by queued_at desc limit 1`).Scan(&accountID, &funding); err != nil {
		t.Fatal(err)
	}
	if accountID == nil || *accountID != sub.Account.ID {
		t.Fatalf("the subscription should win over the key: %v", accountID)
	}
	if funding != "subscription" {
		t.Fatalf("funding should be the subscription, got %q", funding)
	}
}

func TestRoutingFallsBackToCreditsWithNoAccount(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/conversations"), map[string]any{"message": "No accounts here."}, 201)
	var accountID *uuid.UUID
	var funding string
	if err := testPool.QueryRow(t.Context(), `select account_id, funding from runs order by queued_at desc limit 1`).Scan(&accountID, &funding); err != nil {
		t.Fatal(err)
	}
	if accountID != nil || funding != "credits" {
		t.Fatalf("with nothing connected the run falls back to credits, got %v/%q", accountID, funding)
	}
}

func TestPluginsAndProjects(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	connectTestGitHub(t, h)

	var proj struct {
		Project Project `json:"project"`
	}
	h.decode(h.do("POST", h.w("/projects"), map[string]any{"name": "Platform"}, 201), &proj)
	var repo struct {
		Repository Repository `json:"repository"`
	}
	h.decode(h.do("POST", h.w("/repositories"), map[string]any{"full_name": "arosasg/botinc-v2", "project_id": proj.Project.ID}, 201), &repo)
	if repo.Repository.DefaultBranch != "main" {
		t.Fatalf("default branch should default to main, got %q", repo.Repository.DefaultBranch)
	}
	if rec := h.request("POST", h.w("/repositories"), map[string]any{"full_name": "notaslug"}); rec.Code != 400 {
		t.Fatalf("a repository needs owner/name, got %d", rec.Code)
	}
	// Connecting the same repository again updates it rather than duplicating.
	h.do("POST", h.w("/repositories"), map[string]any{"full_name": "arosasg/botinc-v2", "default_branch": "trunk"}, 201)
	var repos struct {
		Repositories []Repository `json:"repositories"`
	}
	h.decode(h.do("GET", h.w("/repositories"), nil, 200), &repos)
	if len(repos.Repositories) != 1 || repos.Repositories[0].DefaultBranch != "trunk" {
		t.Fatalf("reconnecting should update in place: %+v", repos.Repositories)
	}
	var projects struct {
		Projects []Project `json:"projects"`
	}
	h.decode(h.do("GET", h.w("/projects"), nil, 200), &projects)
	if len(projects.Projects) != 1 || projects.Projects[0].Repos != 1 {
		t.Fatalf("the project should count its repository: %+v", projects.Projects)
	}

	h.do("POST", h.w("/plugins"), map[string]any{"kind": "slack", "scopes": []string{"chat:write"}, "secret": "xoxb-1"}, 201)
	pluginsRec := h.do("GET", h.w("/plugins"), nil, 200)
	if strings.Contains(pluginsRec.Body.String(), "xoxb-1") {
		t.Fatal("the plugin list leaked its token")
	}
	var plugins struct {
		Plugins []Plugin `json:"plugins"`
	}
	h.decode(pluginsRec, &plugins)
	if len(plugins.Plugins) != 2 {
		t.Fatalf("unexpected plugins: %+v", plugins.Plugins)
	}
	for _, plugin := range plugins.Plugins {
		if plugin.Kind == "slack" {
			h.do("DELETE", h.w("/plugins/"+plugin.ID.String()), nil, 200)
		}
	}
}

func TestMemberRolesAreEnforced(t *testing.T) {
	owner := newHarness(t)
	owner.signIn(uniqueEmail(t))

	// Invite a second person and accept as them.
	memberEmail := uniqueEmail(t)
	var invite struct {
		Link string `json:"link"`
	}
	owner.decode(owner.do("POST", owner.w("/invitations"), map[string]any{"email": memberEmail, "role": "member"}, 201), &invite)
	if !strings.Contains(invite.Link, "/invite/") {
		t.Fatalf("an invitation hands back a link to share: %q", invite.Link)
	}
	token := invite.Link[strings.LastIndex(invite.Link, "/")+1:]
	member := newHarness(t)
	member.signIn(memberEmail)
	member.do("POST", "/api/workspaces/accept-invite", map[string]any{"token": token}, 200)
	member.ws = owner.ws

	// A member can file work but cannot rewire the workspace.
	member.do("POST", member.w("/issues"), map[string]any{"title": "From a member"}, 201)
	if rec := member.request("POST", member.w("/repositories"), map[string]any{"full_name": "a/b"}); rec.Code != 403 {
		t.Fatalf("a member must not connect a repository, got %d", rec.Code)
	}
	if rec := member.request("POST", member.w("/workflows"), map[string]any{"name": "Sneaky"}); rec.Code != 403 {
		t.Fatalf("a member must not add a workflow, got %d", rec.Code)
	}
}

func TestUsageAndCredits(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/conversations"), map[string]any{"message": "Spend something."}, 201)

	var usage struct {
		Runs      int             `json:"runs"`
		Providers []usageProvider `json:"providers"`
		Days      []usageDay      `json:"days"`
	}
	h.decode(h.do("GET", h.w("/usage"), nil, 200), &usage)
	if usage.Runs != 1 || len(usage.Days) != 1 {
		t.Fatalf("usage should see the one run: %+v", usage)
	}
	// Every workspace opens with the $2.00 starter credit the landing promises,
	// and it is a ledger row, not a number stored on the workspace.
	var credits struct {
		Balance int           `json:"balance_cents"`
		Entries []ledgerEntry `json:"entries"`
	}
	h.decode(h.do("GET", h.w("/credits"), nil, 200), &credits)
	if credits.Balance != 200 {
		t.Fatalf("a new workspace opens with the 200c starter credit, got %d", credits.Balance)
	}
	if len(credits.Entries) != 1 || credits.Entries[0].Kind != "grant" || credits.Entries[0].Amount != 200 {
		t.Fatalf("the balance must have a receipt: %+v", credits.Entries)
	}
}

func TestDeviceCodeLoginForTheCLI(t *testing.T) {
	h := newHarness(t)
	var start struct {
		DeviceCode string `json:"device_code"`
		UserCode   string `json:"user_code"`
	}
	h.decode(h.do("POST", "/api/auth/device/start", map[string]any{}, 200), &start)
	if start.DeviceCode == "" || start.UserCode == "" {
		t.Fatalf("device start should hand back both codes: %+v", start)
	}
	// Before approval the poll is pending, not an error.
	rec := h.request("POST", "/api/auth/device/poll", map[string]any{"device_code": start.DeviceCode})
	if rec.Code != 202 && rec.Code != 200 {
		t.Fatalf("polling an unapproved code should be pending, got %d %s", rec.Code, rec.Body.String())
	}
	if strings.Contains(rec.Body.String(), `"token"`) && !strings.Contains(rec.Body.String(), `"token":""`) {
		t.Fatal("an unapproved device must not receive a token")
	}

	// A signed-in browser approves it, then the poll returns a token.
	browser := newHarness(t)
	browser.signIn(uniqueEmail(t))
	browser.do("POST", "/api/auth/device/approve", map[string]any{"user_code": start.UserCode}, 200)

	var polled struct {
		Token string `json:"token"`
	}
	h.decode(h.do("POST", "/api/auth/device/poll", map[string]any{"device_code": start.DeviceCode}, 200), &polled)
	if polled.Token == "" {
		t.Fatal("an approved device should receive a token")
	}
	// That token authenticates as the approving user.
	h.token = polled.Token
	h.do("GET", "/api/me", nil, 200)
}

func TestPublicConfigDoesNotLeakSecrets(t *testing.T) {
	h := newHarness(t)
	rec := h.do("GET", "/api/config", nil, 200)
	body := rec.Body.String()
	for _, forbidden := range []string{"a3f1c07d", "secret", "jwt"} {
		if strings.Contains(strings.ToLower(body), forbidden) {
			t.Fatalf("public config leaked %q: %s", forbidden, body)
		}
	}
	h.do("GET", "/healthz", nil, 200)
}

// --- helpers ---

func runtimeCall(h *harness, method, path, token string, body any) *httptest.ResponseRecorder {
	h.t.Helper()
	var rdr strings.Reader
	payload := ""
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			h.t.Fatal(err)
		}
		payload = string(b)
	}
	rdr = *strings.NewReader(payload)
	req := httptest.NewRequest(method, path, &rdr)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()
	h.router.ServeHTTP(rec, req)
	return rec
}

func hookCall(h *harness, path, body, sig string) *httptest.ResponseRecorder {
	h.t.Helper()
	req := httptest.NewRequest("POST", path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if sig != "" {
		req.Header.Set("X-BotInc-Signature", sig)
	}
	rec := httptest.NewRecorder()
	h.router.ServeHTTP(rec, req)
	return rec
}

func mustWorkspaceID(t *testing.T, h *harness) uuid.UUID {
	t.Helper()
	var id uuid.UUID
	if err := testPool.QueryRow(t.Context(), `select id from workspaces where slug=$1`, h.ws).Scan(&id); err != nil {
		t.Fatal(err)
	}
	return id
}

func refOf(t *testing.T, accountID uuid.UUID) string {
	t.Helper()
	var ref string
	if err := testPool.QueryRow(t.Context(), `select secret_ref from model_accounts where id=$1`, accountID).Scan(&ref); err != nil {
		t.Fatal(err)
	}
	return ref
}

// A follower tails a run with ?after=<seq>. Without the cursor every poll
// would re-send the whole log, so this is load-bearing, not a nicety.
func TestRunEventsTailFromACursor(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/issues"), map[string]any{"title": "Tail me"}, 201)
	var started struct {
		Run struct {
			ID uuid.UUID `json:"id"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/issues/BOT-1/work"), map[string]any{}, 202), &started)

	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) && len(h.box.seen()) == 0 {
		time.Sleep(20 * time.Millisecond)
	}
	specs := h.box.seen()
	if len(specs) == 0 {
		t.Fatal("no sandbox spec")
	}
	token := specs[0].RunToken
	runPath := "/api/runtime/runs/" + started.Run.ID.String()
	runtimeCall(h, "POST", runPath+"/claim", token, nil)
	runtimeCall(h, "POST", runPath+"/events", token, map[string]any{"events": []map[string]any{
		{"seq": 1, "type": "log", "payload": map[string]any{"line": "one"}},
		{"seq": 2, "type": "log", "payload": map[string]any{"line": "two"}},
		{"seq": 3, "type": "log", "payload": map[string]any{"line": "three"}},
	}})

	type evs struct {
		Events []struct {
			Seq  int    `json:"seq"`
			Type string `json:"type"`
		} `json:"events"`
		Next int `json:"next"`
	}
	var all evs
	h.decode(h.do("GET", h.w("/runs/"+started.Run.ID.String()+"/events"), nil, 200), &all)
	if len(all.Events) != 3 || all.Next != 3 {
		t.Fatalf("want all three events and a cursor of 3: %+v", all)
	}
	var tail evs
	h.decode(h.do("GET", h.w("/runs/"+started.Run.ID.String()+"/events?after=2"), nil, 200), &tail)
	if len(tail.Events) != 1 || tail.Events[0].Seq != 3 {
		t.Fatalf("after=2 should return only event 3: %+v", tail.Events)
	}
	// A cursor past the end is empty and keeps its position rather than rewinding.
	var none evs
	h.decode(h.do("GET", h.w("/runs/"+started.Run.ID.String()+"/events?after=9"), nil, 200), &none)
	if len(none.Events) != 0 || none.Next != 9 {
		t.Fatalf("a cursor past the end returns nothing and holds: %+v", none)
	}
}

// A workspace whose only account is an API key must route to that key. It
// used to fall through to credits, so a paid key sat unused and any run
// without an OpenRouter key on the server failed for want of a credential.
func TestRoutingUsesAnAPIKeyWhenThatIsAllThereIs(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var added struct {
		Account Account `json:"account"`
	}
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{"provider": "claude", "kind": "api_key", "secret": "k"}, 201), &added)

	h.do("POST", h.w("/conversations"), map[string]any{"message": "Route me to the key."}, 201)
	var accountID *uuid.UUID
	var funding string
	if err := testPool.QueryRow(t.Context(), `select account_id, funding from runs order by queued_at desc limit 1`).Scan(&accountID, &funding); err != nil {
		t.Fatal(err)
	}
	if accountID == nil || *accountID != added.Account.ID {
		t.Fatalf("the only connected account should be used, got %v", accountID)
	}
	if funding != "api_key" {
		t.Fatalf("funding should be the key, got %q", funding)
	}
}

func TestAutoRoutingSkipsAccountsWithoutARuntimeAdapter(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "cursor", "kind": "subscription", "secret": "legacy-profile",
	}, 201)
	var runnable struct {
		Account Account `json:"account"`
	}
	h.decode(h.do("POST", h.w("/accounts"), map[string]any{
		"provider": "claude", "kind": "subscription", "secret": "claude-token",
	}, 201), &runnable)

	h.do("POST", h.w("/conversations"), map[string]any{"message": "Use a runnable account."}, 201)
	var accountID *uuid.UUID
	if err := testPool.QueryRow(t.Context(), `select account_id from runs order by queued_at desc limit 1`).Scan(&accountID); err != nil {
		t.Fatal(err)
	}
	if accountID == nil || *accountID != runnable.Account.ID {
		t.Fatalf("auto must skip a provider without a runtime adapter, got %v", accountID)
	}
}

// The runtime spec must carry the credential, or the run cannot do anything.
func TestRuntimeSpecCarriesTheCredential(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/accounts"), map[string]any{"provider": "claude", "kind": "api_key", "secret": "sk-the-key"}, 201)
	var conv struct {
		Run struct {
			ID uuid.UUID `json:"id"`
		} `json:"run"`
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "Need a credential."}, 201), &conv)

	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) && len(h.box.seen()) == 0 {
		time.Sleep(20 * time.Millisecond)
	}
	specs := h.box.seen()
	if len(specs) == 0 {
		t.Fatal("the run was never dispatched")
	}
	token := specs[0].RunToken
	runPath := "/api/runtime/runs/" + conv.Run.ID.String()
	runtimeCall(h, "POST", runPath+"/claim", token, nil)
	rec := runtimeCall(h, "GET", runPath+"/spec", token, nil)
	var spec struct {
		Credential *struct {
			Provider string `json:"provider"`
			Kind     string `json:"kind"`
			Secret   string `json:"secret"`
		} `json:"credential"`
	}
	h.decode(rec, &spec)
	if spec.Credential == nil {
		t.Fatal("the runtime spec must carry a credential when an account is connected")
	}
	if spec.Credential.Secret != "sk-the-key" || spec.Credential.Provider != "claude" {
		t.Fatalf("the credential did not round-trip: %+v", spec.Credential)
	}
}
