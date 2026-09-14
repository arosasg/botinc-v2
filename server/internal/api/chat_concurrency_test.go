package api

import (
	"github.com/arosasg/botinc-v2/server/internal/runs"
	"net/http/httptest"
	"sync"
	"testing"
	"time"
)

func TestConcurrentMessagesHaveOneRunAndOrderedQueue(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var out struct{ Conversation Conversation }
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"title": "concurrency"}, 201), &out)
	var wg sync.WaitGroup
	responses := make(chan *httptest.ResponseRecorder, 10)
	for range 10 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			responses <- h.request("POST", h.w("/conversations/"+out.Conversation.ID.String()+"/messages"), map[string]any{"body": "simultaneous message"})
		}()
	}
	wg.Wait()
	close(responses)
	for rec := range responses {
		if rec.Code != 201 {
			t.Fatalf("message failed: %d %s", rec.Code, rec.Body.String())
		}
	}
	var msgs, active, queued int
	if err := testPool.QueryRow(t.Context(), `select (select count(*) from messages where conversation_id=$1),(select count(*) from runs where conversation_id=$1),(select count(*) from message_queue where conversation_id=$1)`, out.Conversation.ID).Scan(&msgs, &active, &queued); err != nil {
		t.Fatal(err)
	}
	if msgs != 10 || active != 1 || queued != 9 {
		t.Fatalf("messages=%d runs=%d queue=%d", msgs, active, queued)
	}
}
func TestQueueIsRetainedWhenCreditCannotStartNextRun(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var out struct {
		Conversation Conversation
		Run          *runs.Run
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "first"}, 201), &out)
	h.do("POST", h.w("/conversations/"+out.Conversation.ID.String()+"/messages"), map[string]any{"body": "queued"}, 201)
	if err := h.server.runs.UpdateStep(t.Context(), *out.Run, runs.StepUpdate{Key: "answer", Status: "done", CostCents: 200}); err != nil {
		t.Fatal(err)
	}
	if err := h.server.runs.Finish(t.Context(), *out.Run, runs.Finish{Status: "done"}); err != nil {
		t.Fatal(err)
	}
	h.server.drainQueue(httptest.NewRequest("POST", "/", nil), out.Conversation.ID)
	var count int
	if err := testPool.QueryRow(t.Context(), `select count(*) from message_queue where conversation_id=$1`, out.Conversation.ID).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatal("queue item lost when credit exhausted")
	}
}

func TestRuntimeAnswerReplayIsIdempotent(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var out struct {
		Conversation Conversation
		Run          *runs.Run
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "answer once"}, 201), &out)
	deadline := time.Now().Add(3 * time.Second)
	for len(h.box.seen()) == 0 && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	specs := h.box.seen()
	if len(specs) == 0 {
		t.Fatal("run was not dispatched")
	}
	path := "/api/runtime/runs/" + out.Run.ID.String()
	if rec := runtimeCall(h, "POST", path+"/claim", specs[0].RunToken, nil); rec.Code != 200 {
		t.Fatal(rec.Body.String())
	}
	var wg sync.WaitGroup
	responses := make(chan *httptest.ResponseRecorder, 10)
	for range 10 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			responses <- runtimeCall(h, "POST", path+"/messages", specs[0].RunToken, map[string]any{"body": "one answer"})
		}()
	}
	wg.Wait()
	close(responses)
	for rec := range responses {
		if rec.Code != 201 {
			t.Fatalf("replay: %d %s", rec.Code, rec.Body.String())
		}
	}
	var count int
	if err := testPool.QueryRow(t.Context(), `select count(*) from messages where run_id=$1 and role='operator'`, out.Run.ID).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatalf("posted %d answers", count)
	}
	if rec := runtimeCall(h, "POST", path+"/messages", specs[0].RunToken, map[string]any{"body": "different"}); rec.Code != 409 {
		t.Fatalf("conflicting replay accepted: %d", rec.Code)
	}
	if rec := runtimeCall(h, "POST", path+"/messages", specs[0].RunToken, map[string]any{"body": "spoof", "role": "user"}); rec.Code != 400 {
		t.Fatalf("user spoof accepted: %d", rec.Code)
	}
}
