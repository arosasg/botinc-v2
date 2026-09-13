package api

import (
	"github.com/arosasg/botinc-v2/server/internal/runs"
	"testing"
)

func TestRunQuestionRequiresWaitingStepAndAuthorizedAnswer(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	other := newHarness(t)
	other.signIn(uniqueEmail(t))
	var out struct{ Run *runs.Run }
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "question test"}, 201), &out)
	rn := *out.Run
	if _, err := testPool.Exec(t.Context(), `insert into run_steps(run_id,idx,key,name,kind) values($1,1,'question','Question','question')`, rn.ID); err != nil {
		t.Fatal(err)
	}
	path := h.w("/runs/" + rn.ID.String() + "/input")
	h.do("POST", path, map[string]any{"key": "question", "answer": "before waiting"}, 409)
	if err := h.server.runs.UpdateStep(t.Context(), rn, runs.StepUpdate{Key: "question", Status: "waiting"}); err != nil {
		t.Fatal(err)
	}
	other.do("POST", path, map[string]any{"key": "question", "answer": "foreign"}, 404)
	h.do("POST", path, map[string]any{"key": "answer", "answer": "not a question"}, 409)
	h.do("POST", path, map[string]any{"key": "question", "answer": "approved direction"}, 200)
	h.do("POST", path, map[string]any{"key": "question", "answer": "overwrite"}, 409)
	var answer string
	if err := testPool.QueryRow(t.Context(), `select output->>'answer' from run_steps where run_id=$1 and key='question'`, rn.ID).Scan(&answer); err != nil {
		t.Fatal(err)
	}
	if answer != "approved direction" {
		t.Fatal("answer was overwritten")
	}
}
