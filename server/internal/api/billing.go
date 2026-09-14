package api

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
)

type ledgerEntry struct {
	ID        uuid.UUID  `json:"id"`
	Kind      string     `json:"kind"`
	Amount    int        `json:"amount_cents"`
	Note      string     `json:"note"`
	RunID     *uuid.UUID `json:"run_id"`
	CreatedAt time.Time  `json:"created_at"`
}

// credits is the ledger and its balance. Every figure is a real sum over rows,
// never a cached counter, so the number the user reads has a receipt.
func (s *Server) credits(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	ctx := r.Context()
	var balance int
	if err := s.pool.QueryRow(ctx, `select coalesce(sum(amount_cents),0) from credit_ledger where workspace_id=$1`, sc.WorkspaceID).Scan(&balance); err != nil {
		s.fail(w, err)
		return
	}
	rows, err := s.pool.Query(ctx, `select id, kind, amount_cents, note, run_id, created_at from credit_ledger where workspace_id=$1 order by created_at desc limit 100`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	entries := []ledgerEntry{}
	for rows.Next() {
		var e ledgerEntry
		if err := rows.Scan(&e.ID, &e.Kind, &e.Amount, &e.Note, &e.RunID, &e.CreatedAt); err != nil {
			s.fail(w, err)
			return
		}
		entries = append(entries, e)
	}
	httpx.JSON(w, 200, map[string]any{"balance_cents": balance, "entries": entries, "payments_enabled": s.cfg.StripeSecretKey != "" && s.cfg.StripeWebhook != "", "payments_test_mode": strings.HasPrefix(s.cfg.StripeSecretKey, "sk_test_")})
}

type usageDay struct {
	Day       time.Time `json:"day"`
	Runs      int       `json:"runs"`
	CostCents int       `json:"cost_cents"`
}

type usageProvider struct {
	Provider  string `json:"provider"`
	Runs      int    `json:"runs"`
	CostCents int    `json:"cost_cents"`
}

func (s *Server) usage(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	ctx := r.Context()
	days := []usageDay{}
	rows, err := s.pool.Query(ctx, `select date_trunc('day', queued_at) as d, count(*), coalesce(sum(cost_cents),0)
		from runs where workspace_id=$1 and queued_at > now() - interval '30 days' group by d order by d`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	for rows.Next() {
		var d usageDay
		if err := rows.Scan(&d.Day, &d.Runs, &d.CostCents); err == nil {
			days = append(days, d)
		}
	}
	rows.Close()

	byProvider := []usageProvider{}
	prows, err := s.pool.Query(ctx, `select coalesce(a.provider, r.funding), count(*), coalesce(sum(r.cost_cents),0)
		from runs r left join model_accounts a on a.id = r.account_id
		where r.workspace_id=$1 and r.queued_at > now() - interval '30 days'
		group by 1 order by 3 desc`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	for prows.Next() {
		var p usageProvider
		if err := prows.Scan(&p.Provider, &p.Runs, &p.CostCents); err == nil {
			byProvider = append(byProvider, p)
		}
	}
	prows.Close()

	var total, runCount int
	_ = s.pool.QueryRow(ctx, `select coalesce(sum(cost_cents),0), count(*) from runs where workspace_id=$1 and queued_at > now() - interval '30 days'`, sc.WorkspaceID).Scan(&total, &runCount)
	httpx.JSON(w, 200, map[string]any{"days": days, "providers": byProvider, "total_cost_cents": total, "runs": runCount})
}
