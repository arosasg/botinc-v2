package api

import (
	"github.com/arosasg/botinc-v2/server/internal/runs"
	"sync"
	"testing"
)

func TestRunUsageChargedOnceAndBudgetReserved(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var out struct {
		Conversation Conversation
		Run          *runs.Run
	}
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "accounting check"}, 201), &out)
	r := *out.Run
	// The first run reserves the starter balance. Another caller cannot race it.
	_, err := h.server.runs.Create(t.Context(), runs.CreateParams{WorkspaceID: r.WorkspaceID, Purpose: "chat"})
	if err == nil {
		t.Fatal("concurrent run spent reserved credit")
	}
	var wg sync.WaitGroup
	errs := make(chan error, 8)
	for range 8 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			errs <- h.server.runs.UpdateStep(t.Context(), r, runs.StepUpdate{Key: "answer", Status: "done", CostCents: 18})
		}()
	}
	wg.Wait()
	close(errs)
	for err := range errs {
		if err != nil {
			t.Fatal(err)
		}
	}
	actual, err := h.server.runs.Get(t.Context(), r.ID)
	if err != nil {
		t.Fatal(err)
	}
	if actual.CostCents != 18 {
		t.Fatalf("replayed callback billed %d cents", actual.CostCents)
	}
	var balance int
	if err := testPool.QueryRow(t.Context(), `select sum(amount_cents) from credit_ledger where workspace_id=$1`, r.WorkspaceID).Scan(&balance); err != nil {
		t.Fatal(err)
	}
	if balance != 182 {
		t.Fatalf("balance=%d, want 182", balance)
	}
	if err := h.server.runs.UpdateStep(t.Context(), r, runs.StepUpdate{Key: "missing", Status: "done", CostCents: 40}); err == nil {
		t.Fatal("unknown step accepted")
	}
	if err := h.server.runs.Finish(t.Context(), r, runs.Finish{Status: "cancelled"}); err != nil {
		t.Fatal(err)
	}
	if err := h.server.runs.Finish(t.Context(), r, runs.Finish{Status: "done"}); err == nil {
		t.Fatal("late success replaced cancellation")
	}
	if err := h.server.runs.UpdateStep(t.Context(), r, runs.StepUpdate{Key: "answer", Status: "done", CostCents: 50}); err == nil {
		t.Fatal("late callback charged finished run")
	}
	next, err := h.server.runs.Create(t.Context(), runs.CreateParams{WorkspaceID: r.WorkspaceID, Purpose: "chat"})
	if err != nil {
		t.Fatal(err)
	}
	if next.TaskLimitCents != 182 {
		t.Fatalf("new budget=%d, want remaining 182", next.TaskLimitCents)
	}
}

func TestOwnAccountUsageDoesNotSpendWorkspaceCredits(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/accounts"), map[string]any{"provider": "claude", "kind": "api_key", "label": "Own key", "secret": "test-secret"}, 201)
	var out struct{ Run *runs.Run }
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"message": "own account"}, 201), &out)
	if err := h.server.runs.UpdateStep(t.Context(), *out.Run, runs.StepUpdate{Key: "answer", Status: "done", CostCents: 25}); err != nil {
		t.Fatal(err)
	}
	var balance int
	if err := testPool.QueryRow(t.Context(), `select sum(amount_cents) from credit_ledger where workspace_id=$1`, out.Run.WorkspaceID).Scan(&balance); err != nil {
		t.Fatal(err)
	}
	if balance != 200 {
		t.Fatalf("own account charged workspace: %d", balance)
	}
}

func TestAdditionalWorkspaceCannotMintStarterCredit(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	extra, err := h.server.createWorkspaceFor(t.Context(), h.userID, "Second workspace")
	if err != nil {
		t.Fatal(err)
	}
	var balance int
	if err := testPool.QueryRow(t.Context(), `select coalesce(sum(amount_cents),0) from credit_ledger where workspace_id=$1`, extra.ID).Scan(&balance); err != nil {
		t.Fatal(err)
	}
	if balance != 0 {
		t.Fatalf("additional workspace minted %d credits", balance)
	}
}
