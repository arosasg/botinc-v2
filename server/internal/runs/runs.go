// Package runs owns the run lifecycle: create, route to a model account,
// dispatch to a sandbox, receive events from the runtime, finish, reconcile.
package runs

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/arosasg/botinc-v2/server/internal/realtime"
	"github.com/arosasg/botinc-v2/server/internal/sandbox"
)

type Service struct {
	pool     *pgxpool.Pool
	hub      *realtime.Hub
	provider sandbox.Provider
	log      *slog.Logger
	apiURL   string
	template string
	ttl      time.Duration
}

func New(pool *pgxpool.Pool, hub *realtime.Hub, provider sandbox.Provider, log *slog.Logger, apiURL, template string, ttl time.Duration) *Service {
	return &Service{pool: pool, hub: hub, provider: provider, log: log, apiURL: apiURL, template: template, ttl: ttl}
}

type Run struct {
	ID                uuid.UUID       `json:"id"`
	WorkspaceID       uuid.UUID       `json:"workspace_id"`
	IssueID           *uuid.UUID      `json:"issue_id"`
	ConversationID    *uuid.UUID      `json:"conversation_id"`
	WorkflowVersionID *uuid.UUID      `json:"workflow_version_id"`
	Purpose           string          `json:"purpose"`
	Status            string          `json:"status"`
	Model             string          `json:"model"`
	AccountID         *uuid.UUID      `json:"account_id"`
	Funding           string          `json:"funding"`
	TaskLimitCents    int             `json:"task_limit_cents"`
	CostCents         int             `json:"cost_cents"`
	Prompt            string          `json:"prompt,omitempty"`
	Result            json.RawMessage `json:"result"`
	Error             string          `json:"error"`
	SandboxID         *uuid.UUID      `json:"sandbox_id"`
	ParentRunID       *uuid.UUID      `json:"parent_run_id"`
	QueuedAt          time.Time       `json:"queued_at"`
	StartedAt         *time.Time      `json:"started_at"`
	FinishedAt        *time.Time      `json:"finished_at"`
}

const runCols = `id, workspace_id, issue_id, conversation_id, workflow_version_id, purpose, status, model, account_id, funding, task_limit_cents, cost_cents, prompt, result, error, sandbox_id, parent_run_id, queued_at, started_at, finished_at`

func scanRun(row pgx.Row) (Run, error) {
	var r Run
	err := row.Scan(&r.ID, &r.WorkspaceID, &r.IssueID, &r.ConversationID, &r.WorkflowVersionID, &r.Purpose, &r.Status, &r.Model, &r.AccountID, &r.Funding, &r.TaskLimitCents, &r.CostCents, &r.Prompt, &r.Result, &r.Error, &r.SandboxID, &r.ParentRunID, &r.QueuedAt, &r.StartedAt, &r.FinishedAt)
	return r, err
}

type CreateParams struct {
	WorkspaceID       uuid.UUID
	IssueID           *uuid.UUID
	ConversationID    *uuid.UUID
	WorkflowVersionID *uuid.UUID
	Purpose           string
	Model             string
	Prompt            string
	TaskLimitCents    int
	CreatedBy         *uuid.UUID
	Steps             []StepSpec
}

type StepSpec struct {
	Key   string `json:"key"`
	Name  string `json:"name"`
	Kind  string `json:"kind"`
	Model string `json:"model"`
}

func hashToken(t string) string {
	h := sha256.Sum256([]byte(t))
	return hex.EncodeToString(h[:])
}

// Create records the run and dispatches it asynchronously.
func (s *Service) Create(ctx context.Context, p CreateParams) (Run, error) {
	if p.Model == "" {
		p.Model = "auto"
	}
	if p.TaskLimitCents == 0 {
		p.TaskLimitCents = 200
	}
	accountID, funding, err := s.route(ctx, p.WorkspaceID, p.Model)
	if err != nil {
		return Run{}, err
	}
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Run{}, err
	}
	defer tx.Rollback(ctx)
	// Serialize reservations against the workspace ledger. Outstanding runs hold
	// their unspent budget so simultaneous chats cannot spend the same credit.
	var locked uuid.UUID
	if err := tx.QueryRow(ctx, `select id from workspaces where id=$1 for update`, p.WorkspaceID).Scan(&locked); err != nil {
		return Run{}, err
	}
	if p.TaskLimitCents < 1 {
		return Run{}, errors.New("task budget must be positive")
	}
	if funding == "credits" {
		var available int
		err := tx.QueryRow(ctx, `select coalesce((select sum(amount_cents) from credit_ledger where workspace_id=$1),0) - coalesce((select sum(greatest(task_limit_cents-cost_cents,0)) from runs where workspace_id=$1 and funding='credits' and finished_at is null),0)`, p.WorkspaceID).Scan(&available)
		if err != nil {
			return Run{}, err
		}
		if available < 1 {
			return Run{}, errors.New("no unreserved credit available")
		}
		if p.TaskLimitCents > available {
			p.TaskLimitCents = available
		}
	}
	row := tx.QueryRow(ctx, `insert into runs (workspace_id, issue_id, conversation_id, workflow_version_id, purpose, model, account_id, funding, task_limit_cents, prompt, created_by)
		values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning `+runCols,
		p.WorkspaceID, p.IssueID, p.ConversationID, p.WorkflowVersionID, p.Purpose, p.Model, accountID, funding, p.TaskLimitCents, p.Prompt, p.CreatedBy)
	r, err := scanRun(row)
	if err != nil {
		return Run{}, err
	}
	if len(p.Steps) == 0 {
		p.Steps = defaultSteps(p.Purpose)
	}
	for i, st := range p.Steps {
		if _, err := tx.Exec(ctx, `insert into run_steps (run_id, idx, key, name, kind, model) values ($1,$2,$3,$4,$5,$6)`, r.ID, i, st.Key, st.Name, st.Kind, st.Model); err != nil {
			return Run{}, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return Run{}, err
	}
	s.hub.Publish(r.WorkspaceID, "run.created", r)
	go s.dispatch(context.WithoutCancel(ctx), r)
	return r, nil
}

func defaultSteps(purpose string) []StepSpec {
	switch purpose {
	case "build":
		return []StepSpec{{Key: "plan", Name: "Plan", Kind: "task"}, {Key: "implement", Name: "Implement", Kind: "task"}, {Key: "review", Name: "Review", Kind: "task"}, {Key: "verify", Name: "Verify", Kind: "task"}, {Key: "approval", Name: "Your approval", Kind: "approval"}}
	default:
		return []StepSpec{{Key: "answer", Name: "Answer", Kind: "task"}}
	}
}

// route picks the model account with the most capacity left among connected
// subscription accounts for the requested provider; falls back per policy.
func (s *Service) route(ctx context.Context, ws uuid.UUID, model string) (*uuid.UUID, string, error) {
	provider := providerFor(model)
	rows, err := s.pool.Query(ctx, `select id, kind, quota from model_accounts where workspace_id=$1 and status='connected' and ($2='' or provider=$2) order by created_at`, ws, provider)
	if err != nil {
		return nil, "", err
	}
	defer rows.Close()
	// Preference is ordered on two keys: a subscription is always chosen over
	// a key, and within a tier the account with the most capacity left wins.
	// Comparing on one blended number is how a lone API-key account used to
	// score below the starting sentinel and be skipped entirely.
	var best *uuid.UUID
	var bestKind string
	bestTier, bestLeft := -1, -1.0
	for rows.Next() {
		var id uuid.UUID
		var kind string
		var quota []byte
		if err := rows.Scan(&id, &kind, &quota); err != nil {
			return nil, "", err
		}
		tier := 0
		if kind == "subscription" {
			tier = 1
		}
		left := capacityLeft(quota)
		if tier > bestTier || (tier == bestTier && left > bestLeft) {
			id := id
			best, bestTier, bestLeft, bestKind = &id, tier, left, kind
		}
	}
	if best == nil {
		var fallback string
		_ = s.pool.QueryRow(ctx, `select fallback from routing_policies where workspace_id=$1`, ws).Scan(&fallback)
		if fallback == "" {
			fallback = "credits"
		}
		if fallback == "wait" {
			return nil, "wait", nil
		}
		return nil, "credits", nil
	}
	funding := "subscription"
	if bestKind == "api_key" {
		funding = "api_key"
	}
	return best, funding, nil
}

func providerFor(model string) string {
	switch {
	case model == "auto" || model == "":
		return ""
	case len(model) >= 6 && model[:6] == "claude":
		return "claude"
	case strings.HasPrefix(model, "gpt") || strings.HasPrefix(model, "codex"):
		return "codex"
	}
	return ""
}

type quotaWindow struct {
	Used  float64 `json:"used"`
	Limit float64 `json:"limit"`
}

// capacityLeft is the tightest window's remaining fraction (0..1); unknown quota counts as 0.5.
func capacityLeft(raw []byte) float64 {
	var ws []quotaWindow
	if err := json.Unmarshal(raw, &ws); err != nil || len(ws) == 0 {
		return 0.5
	}
	left := 1.0
	for _, w := range ws {
		if w.Limit <= 0 {
			continue
		}
		if l := 1 - w.Used/w.Limit; l < left {
			left = l
		}
	}
	return left
}

func (s *Service) dispatch(ctx context.Context, r Run) {
	if r.Funding == "wait" {
		s.setStatus(ctx, r.ID, r.WorkspaceID, "waiting", "waiting for a subscription window to reset")
		return
	}
	raw := make([]byte, 32)
	_, _ = rand.Read(raw)
	token := "brt_" + base64.RawURLEncoding.EncodeToString(raw)
	tag, err := s.pool.Exec(ctx, `update runs set run_token_hash=$2, status='provisioning' where id=$1 and finished_at is null and status='queued'`, r.ID, hashToken(token))
	if err != nil {
		s.log.Error("run token", "err", err)
		return
	}
	if tag.RowsAffected() == 0 {
		return
	}
	s.hub.Publish(r.WorkspaceID, "run.updated", map[string]any{"id": r.ID, "status": "provisioning"})
	var sbID uuid.UUID
	if err := s.pool.QueryRow(ctx, `insert into sandboxes (workspace_id, run_id, provider) values ($1,$2,$3) returning id`, r.WorkspaceID, r.ID, s.provider.Name()).Scan(&sbID); err != nil {
		s.log.Error("sandbox row", "err", err)
		return
	}
	sb, err := s.provider.Provision(ctx, sandbox.Spec{
		RunID: r.ID.String(), Workspace: r.WorkspaceID.String(), APIURL: s.apiURL, RunToken: token, Template: s.template, TTL: s.ttl,
		Metadata: map[string]string{"run": r.ID.String(), "workspace": r.WorkspaceID.String()},
	})
	if err != nil {
		_, _ = s.pool.Exec(ctx, `update sandboxes set status='failed', ended_at=now() where id=$1`, sbID)
		s.setStatus(ctx, r.ID, r.WorkspaceID, "failed", "could not start a sandbox: "+err.Error())
		return
	}
	_, _ = s.pool.Exec(ctx, `update sandboxes set external_id=$2, status='ready' where id=$1`, sbID, sb.ExternalID)
	_, _ = s.pool.Exec(ctx, `update runs set sandbox_id=$2 where id=$1`, r.ID, sbID)
	// Cancellation may win while the provider is starting the sandbox.
	current, getErr := s.Get(ctx, r.ID)
	if getErr == nil && current.FinishedAt != nil {
		_ = s.provider.Kill(ctx, sb.ExternalID)
	}
}

func (s *Service) setStatus(ctx context.Context, id, ws uuid.UUID, status, errText string) {
	_, err := s.pool.Exec(ctx, `update runs set status=$2, error=$3, finished_at=case when $2 in ('done','failed','cancelled') then now() else finished_at end where id=$1 and finished_at is null`, id, status, errText)
	if err != nil {
		s.log.Error("run status", "err", err)
	}
	s.hub.Publish(ws, "run.updated", map[string]any{"id": id, "status": status, "error": errText})
}

// --- runtime protocol ---

var ErrBadToken = errors.New("invalid run token")

// Claim authenticates the runtime by run token and marks the run running.
func (s *Service) Claim(ctx context.Context, runID uuid.UUID, token string) (Run, error) {
	row := s.pool.QueryRow(ctx, `update runs set status='running', started_at=coalesce(started_at, now()), heartbeat_at=now() where id=$1 and run_token_hash=$2 and status in ('provisioning','running','waiting') returning `+runCols, runID, hashToken(token))
	r, err := scanRun(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return Run{}, ErrBadToken
	}
	if err != nil {
		return Run{}, err
	}
	_, _ = s.pool.Exec(ctx, `update sandboxes set status='running' where run_id=$1`, r.ID)
	s.hub.Publish(r.WorkspaceID, "run.updated", map[string]any{"id": r.ID, "status": "running"})
	return r, nil
}

func (s *Service) Authenticate(ctx context.Context, runID uuid.UUID, token string) (Run, error) {
	r, err := scanRun(s.pool.QueryRow(ctx, `select `+runCols+` from runs where id=$1 and run_token_hash=$2`, runID, hashToken(token)))
	if errors.Is(err, pgx.ErrNoRows) {
		return Run{}, ErrBadToken
	}
	if err == nil && r.FinishedAt != nil {
		return Run{}, ErrBadToken
	}
	return r, err
}

type Event struct {
	Seq     int             `json:"seq"`
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// AppendEvents stores runtime events and forwards them to subscribers.
func (s *Service) AppendEvents(ctx context.Context, r Run, events []Event) error {
	for _, ev := range events {
		if len(ev.Payload) == 0 {
			ev.Payload = json.RawMessage(`{}`)
		}
		if _, err := s.pool.Exec(ctx, `insert into run_events (run_id, seq, type, payload) values ($1,$2,$3,$4) on conflict do nothing`, r.ID, ev.Seq, ev.Type, ev.Payload); err != nil {
			return err
		}
		s.hub.Publish(r.WorkspaceID, "run.event", map[string]any{"run_id": r.ID, "seq": ev.Seq, "type": ev.Type, "payload": ev.Payload})
	}
	_, _ = s.pool.Exec(ctx, `update runs set heartbeat_at=now() where id=$1`, r.ID)
	return nil
}

type StepUpdate struct {
	Key       string          `json:"key"`
	Status    string          `json:"status"`
	Model     string          `json:"model,omitempty"`
	Effort    string          `json:"effort,omitempty"`
	CostCents int             `json:"cost_cents,omitempty"`
	Output    json.RawMessage `json:"output,omitempty"`
}

// CostCents is the cumulative provider-reported cost for this step. Replayed
// callbacks cannot charge twice, and accounting commits with the step itself.
func (s *Service) UpdateStep(ctx context.Context, r Run, u StepUpdate) error {
	if u.CostCents < 0 {
		return errors.New("cost cannot be negative")
	}
	if len(u.Output) == 0 {
		u.Output = json.RawMessage(`{}`)
	}
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var finished *time.Time
	var funding string
	if err := tx.QueryRow(ctx, `select finished_at, funding from runs where id=$1 for update`, r.ID).Scan(&finished, &funding); err != nil {
		return err
	}
	if finished != nil {
		return errors.New("run has already finished")
	}
	var previous int
	if err := tx.QueryRow(ctx, `select cost_cents from run_steps where run_id=$1 and key=$2`, r.ID, u.Key).Scan(&previous); err != nil {
		return err
	}
	cost := max(previous, u.CostCents)
	delta := cost - previous
	_, err = tx.Exec(ctx, `update run_steps set status=$3, model=case when $4<>'' then $4 else model end, effort=case when $5<>'' then $5 else effort end,
		cost_cents=$6, output=output||$7::jsonb,
		started_at=case when $3='running' and started_at is null then now() else started_at end,
		finished_at=case when $3 in ('done','changes','skipped','stuck') then coalesce(finished_at,now()) else finished_at end
		where run_id=$1 and key=$2`, r.ID, u.Key, u.Status, u.Model, u.Effort, cost, u.Output)
	if err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `update runs set cost_cents=cost_cents+$2, status=case when $3='waiting' then 'waiting' when $3='running' then 'running' else status end where id=$1`, r.ID, delta, u.Status); err != nil {
		return err
	}
	if funding == "credits" && delta > 0 {
		if _, err = tx.Exec(ctx, `insert into credit_ledger(workspace_id,kind,amount_cents,note,run_id) values($1,'usage',$2,$3,$4)`, r.WorkspaceID, -delta, "Run usage: "+u.Key, r.ID); err != nil {
			return err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}
	s.hub.Publish(r.WorkspaceID, "run.step", map[string]any{"run_id": r.ID, "key": u.Key, "status": u.Status, "model": u.Model, "cost_cents": cost})
	return nil
}

type Finish struct {
	Status string          `json:"status"` // done | failed | cancelled
	Error  string          `json:"error"`
	Result json.RawMessage `json:"result"`
}

func (s *Service) Finish(ctx context.Context, r Run, f Finish) error {
	if f.Status != "done" && f.Status != "failed" && f.Status != "cancelled" {
		return errors.New("status must be done, failed or cancelled")
	}
	if len(f.Result) == 0 {
		f.Result = json.RawMessage(`{}`)
	}
	tag, err := s.pool.Exec(ctx, `update runs set status=$2, error=$3, result=$4, finished_at=now() where id=$1 and finished_at is null`, r.ID, f.Status, f.Error, f.Result)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("run has already finished")
	}
	_, _ = s.pool.Exec(ctx, `update sandboxes set status='stopped', ended_at=now() where run_id=$1`, r.ID)
	if r.SandboxID != nil {
		var ext string
		if err := s.pool.QueryRow(ctx, `select external_id from sandboxes where id=$1`, *r.SandboxID).Scan(&ext); err == nil && ext != "" {
			go func() { _ = s.provider.Kill(context.Background(), ext) }()
		}
	}
	s.hub.Publish(r.WorkspaceID, "run.updated", map[string]any{"id": r.ID, "status": f.Status, "error": f.Error, "result": f.Result})
	return nil
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (Run, error) {
	return scanRun(s.pool.QueryRow(ctx, `select `+runCols+` from runs where id=$1`, id))
}

func (s *Service) Cancel(ctx context.Context, id uuid.UUID) error {
	r, err := s.Get(ctx, id)
	if err != nil {
		return err
	}
	if r.FinishedAt != nil {
		return nil
	}
	return s.Finish(ctx, r, Finish{Status: "cancelled"})
}

// Reconcile fails runs whose runtime stopped reporting, and times out runs
// that never claimed their sandbox.
func (s *Service) Reconcile(ctx context.Context) {
	rows, err := s.pool.Query(ctx, `select `+runCols+` from runs where status in ('provisioning','running') and (
		(status='running' and heartbeat_at < now() - interval '3 minutes') or
		(status='provisioning' and queued_at < now() - interval '10 minutes'))`)
	if err != nil {
		return
	}
	var stale []Run
	for rows.Next() {
		r, err := scanRun(rows)
		if err == nil {
			stale = append(stale, r)
		}
	}
	rows.Close()
	for _, r := range stale {
		msg := "the runtime stopped reporting"
		if r.Status == "provisioning" {
			msg = "the sandbox never started"
		}
		s.log.Warn("run reconciled", "run", r.ID, "reason", msg)
		_ = s.Finish(ctx, r, Finish{Status: "failed", Error: msg})
	}
}

func (s *Service) String() string { return fmt.Sprintf("runs(provider=%s)", s.provider.Name()) }
