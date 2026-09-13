package api

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/robfig/cron/v3"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/arosasg/botinc-v2/server/internal/runs"
)

type Autopilot struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Trigger     json.RawMessage `json:"trigger"`
	WorkflowID  *uuid.UUID      `json:"workflow_id"`
	Prompt      string          `json:"prompt"`
	Model       string          `json:"model"`
	Funding     string          `json:"funding"`
	Enabled     bool            `json:"enabled"`
	LastRunAt   *time.Time      `json:"last_run_at"`
	NextRunAt   *time.Time      `json:"next_run_at"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	WebhookURL  string          `json:"webhook_url,omitempty"`
}

const autopilotCols = `id, name, description, trigger, workflow_id, prompt, model, funding, enabled, last_run_at, next_run_at, created_at, updated_at`

func (a *Autopilot) scan() []any {
	return []any{&a.ID, &a.Name, &a.Description, &a.Trigger, &a.WorkflowID, &a.Prompt, &a.Model, &a.Funding, &a.Enabled, &a.LastRunAt, &a.NextRunAt, &a.CreatedAt, &a.UpdatedAt}
}

type trigger struct {
	Kind      string `json:"kind"` // schedule | webhook | event | manual
	Cron      string `json:"cron,omitempty"`
	TZ        string `json:"tz,omitempty"`
	Source    string `json:"source,omitempty"`
	HasSecret bool   `json:"has_secret,omitempty"`
}

var cronParser = cron.NewParser(cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow | cron.Descriptor)

// parseTrigger validates the trigger and, for a schedule, returns when it next fires.
func parseTrigger(raw json.RawMessage) (trigger, *time.Time, error) {
	var t trigger
	if err := json.Unmarshal(raw, &t); err != nil {
		return t, nil, errors.New("trigger is not valid JSON")
	}
	switch t.Kind {
	case "schedule":
		if strings.TrimSpace(t.Cron) == "" {
			return t, nil, errors.New("a scheduled routine needs a cron expression")
		}
		sched, err := cronParser.Parse(t.Cron)
		if err != nil {
			return t, nil, errors.New("that cron expression is not valid: " + err.Error())
		}
		loc := time.UTC
		if t.TZ != "" {
			l, err := time.LoadLocation(t.TZ)
			if err != nil {
				return t, nil, errors.New("unknown time zone " + t.TZ)
			}
			loc = l
		}
		next := sched.Next(time.Now().In(loc)).UTC()
		return t, &next, nil
	case "webhook", "event", "manual":
		return t, nil, nil
	default:
		return t, nil, errors.New("trigger kind must be schedule, webhook, event or manual")
	}
}

func (s *Server) autopilotWebhookURL(id uuid.UUID) string {
	return strings.TrimRight(s.cfg.PublicAPIURL, "/") + "/api/hooks/autopilots/" + id.String()
}

func (s *Server) listAutopilots(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select `+autopilotCols+` from autopilots where workspace_id=$1 order by created_at`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Autopilot{}
	for rows.Next() {
		var a Autopilot
		if err := rows.Scan(a.scan()...); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, a)
	}
	httpx.JSON(w, 200, map[string]any{"autopilots": out})
}

func (s *Server) createAutopilot(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var in struct {
		Name        string          `json:"name"`
		Description string          `json:"description"`
		Trigger     json.RawMessage `json:"trigger"`
		WorkflowID  *uuid.UUID      `json:"workflow_id"`
		Prompt      string          `json:"prompt"`
		Model       string          `json:"model"`
		Enabled     *bool           `json:"enabled"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	in.Name = strings.TrimSpace(in.Name)
	if in.Name == "" {
		httpx.ErrorCode(w, 400, "name_required", "a routine needs a name")
		return
	}
	if strings.TrimSpace(in.Prompt) == "" {
		httpx.ErrorCode(w, 400, "prompt_required", "say what the routine should do")
		return
	}
	if len(in.Trigger) == 0 {
		in.Trigger = json.RawMessage(`{"kind":"manual"}`)
	}
	t, next, err := parseTrigger(in.Trigger)
	if err != nil {
		httpx.ErrorCode(w, 400, "invalid_trigger", err.Error())
		return
	}
	if in.Model == "" {
		in.Model = "auto"
	}
	enabled := true
	if in.Enabled != nil {
		enabled = *in.Enabled
	}
	ctx := r.Context()
	var a Autopilot
	if err := s.pool.QueryRow(ctx, `insert into autopilots (workspace_id, name, description, trigger, workflow_id, prompt, model, enabled, next_run_at, created_by)
		values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning `+autopilotCols,
		sc.WorkspaceID, in.Name, in.Description, in.Trigger, in.WorkflowID, in.Prompt, in.Model, enabled, next, sc.UserID).Scan(a.scan()...); err != nil {
		s.fail(w, err)
		return
	}
	if t.Kind == "webhook" {
		// The secret is shown once, here, and only its hash is kept.
		secret, err := s.rotateWebhookSecret(ctx, sc.WorkspaceID, a.ID)
		if err == nil {
			a.WebhookURL = s.autopilotWebhookURL(a.ID)
			s.hub.Publish(sc.WorkspaceID, "autopilot.created", a)
			httpx.JSON(w, 201, map[string]any{"autopilot": a, "webhook_url": a.WebhookURL, "secret": secret})
			return
		}
	}
	s.hub.Publish(sc.WorkspaceID, "autopilot.created", a)
	httpx.JSON(w, 201, map[string]any{"autopilot": a})
}

func (s *Server) rotateWebhookSecret(ctx context.Context, ws, id uuid.UUID) (string, error) {
	secret := "whs_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	ref, err := s.writeSecret(ctx, ws, secret)
	if err != nil {
		return "", err
	}
	if _, err := s.pool.Exec(ctx, `update autopilots set trigger = jsonb_set(trigger, '{secret_ref}', to_jsonb($2::text)) where id=$1`, id, ref); err != nil {
		return "", err
	}
	return secret, nil
}

func (s *Server) loadAutopilot(r *http.Request) (Autopilot, bool, error) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		return Autopilot{}, false, nil
	}
	var a Autopilot
	err := s.pool.QueryRow(r.Context(), `select `+autopilotCols+` from autopilots where id=$1 and workspace_id=$2`, id, sc.WorkspaceID).Scan(a.scan()...)
	if errors.Is(err, pgx.ErrNoRows) {
		return Autopilot{}, false, nil
	}
	return a, err == nil, err
}

func (s *Server) getAutopilot(w http.ResponseWriter, r *http.Request) {
	a, found, err := s.loadAutopilot(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	var t trigger
	_ = json.Unmarshal(a.Trigger, &t)
	if t.Kind == "webhook" {
		a.WebhookURL = s.autopilotWebhookURL(a.ID)
	}
	httpx.JSON(w, 200, map[string]any{"autopilot": a, "runs": s.autopilotRunRows(r, a.ID)})
}

func (s *Server) updateAutopilot(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	a, found, err := s.loadAutopilot(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	var in struct {
		Name        *string         `json:"name"`
		Description *string         `json:"description"`
		Trigger     json.RawMessage `json:"trigger"`
		WorkflowID  *uuid.UUID      `json:"workflow_id"`
		Prompt      *string         `json:"prompt"`
		Model       *string         `json:"model"`
		Enabled     *bool           `json:"enabled"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	var next *time.Time
	if len(in.Trigger) > 0 {
		if _, n, err := parseTrigger(in.Trigger); err != nil {
			httpx.ErrorCode(w, 400, "invalid_trigger", err.Error())
			return
		} else {
			next = n
		}
	}
	err = s.pool.QueryRow(r.Context(), `update autopilots set name=coalesce($3,name), description=coalesce($4,description),
		trigger=coalesce($5,trigger), workflow_id=coalesce($6,workflow_id), prompt=coalesce($7,prompt), model=coalesce($8,model),
		enabled=coalesce($9,enabled), next_run_at=case when $5 is not null then $10 else next_run_at end, updated_at=now()
		where id=$1 and workspace_id=$2 returning `+autopilotCols,
		a.ID, sc.WorkspaceID, in.Name, in.Description, in.Trigger, in.WorkflowID, in.Prompt, in.Model, in.Enabled, next).Scan(a.scan()...)
	if err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "autopilot.updated", a)
	httpx.JSON(w, 200, map[string]any{"autopilot": a})
}

func (s *Server) deleteAutopilot(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	tag, err := s.pool.Exec(r.Context(), `delete from autopilots where id=$1 and workspace_id=$2`, id, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	s.hub.Publish(sc.WorkspaceID, "autopilot.deleted", map[string]any{"id": id})
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

// FireAutopilot queues the routine's run and records it. Shared by the manual
// trigger, the webhook and the scheduler.
func (s *Server) FireAutopilot(ctx context.Context, ws uuid.UUID, a Autopilot, by *uuid.UUID, note string) (runs.Run, error) {
	var versionID *uuid.UUID
	var steps []runs.StepSpec
	var limit int
	if a.WorkflowID != nil {
		var vid uuid.UUID
		var graph []byte
		if err := s.pool.QueryRow(ctx, `select v.id, v.graph from workflows w join workflow_versions v on v.id=w.active_version_id where w.id=$1`, *a.WorkflowID).Scan(&vid, &graph); err == nil {
			versionID = &vid
			steps, limit = stepsFromGraph(graph)
		}
	}
	prompt := a.Prompt
	if strings.TrimSpace(note) != "" {
		prompt += "\n\nTrigger payload:\n" + note
	}
	rn, err := s.runs.Create(ctx, runs.CreateParams{
		WorkspaceID: ws, WorkflowVersionID: versionID, Purpose: "autopilot",
		Model: a.Model, Prompt: prompt, TaskLimitCents: limit, CreatedBy: by, Steps: steps,
	})
	if err != nil {
		return runs.Run{}, err
	}
	_, _ = s.pool.Exec(ctx, `insert into autopilot_runs (autopilot_id, run_id, status) values ($1,$2,'running')`, a.ID, rn.ID)
	_, _ = s.pool.Exec(ctx, `update autopilots set last_run_at=now() where id=$1`, a.ID)
	s.hub.Publish(ws, "autopilot.fired", map[string]any{"autopilot_id": a.ID, "run_id": rn.ID})
	return rn, nil
}

func (s *Server) triggerAutopilot(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	a, found, err := s.loadAutopilot(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	var in struct {
		Note string `json:"note"`
	}
	_ = httpx.Decode(r, &in)
	rn, err := s.FireAutopilot(r.Context(), sc.WorkspaceID, a, &sc.UserID, in.Note)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 202, map[string]any{"run": rn})
}

type autopilotRunRow struct {
	ID        uuid.UUID  `json:"id"`
	RunID     *uuid.UUID `json:"run_id"`
	Status    string     `json:"status"`
	Summary   string     `json:"summary"`
	CreatedAt time.Time  `json:"created_at"`
}

func (s *Server) autopilotRunRows(r *http.Request, id uuid.UUID) []autopilotRunRow {
	out := []autopilotRunRow{}
	rows, err := s.pool.Query(r.Context(), `select ar.id, ar.run_id, coalesce(rn.status, ar.status), ar.summary, ar.created_at
		from autopilot_runs ar left join runs rn on rn.id=ar.run_id where ar.autopilot_id=$1 order by ar.created_at desc limit 50`, id)
	if err != nil {
		return out
	}
	defer rows.Close()
	for rows.Next() {
		var a autopilotRunRow
		if err := rows.Scan(&a.ID, &a.RunID, &a.Status, &a.Summary, &a.CreatedAt); err == nil {
			out = append(out, a)
		}
	}
	return out
}

func (s *Server) autopilotRuns(w http.ResponseWriter, r *http.Request) {
	a, found, err := s.loadAutopilot(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	httpx.JSON(w, 200, map[string]any{"runs": s.autopilotRunRows(r, a.ID)})
}

// autopilotWebhook authenticates with the routine's own secret over an HMAC of
// the body, so a leaked URL alone cannot start work.
func (s *Server) autopilotWebhook(w http.ResponseWriter, r *http.Request) {
	id, ok := idParam(r, "id")
	if !ok {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	ctx := r.Context()
	var a Autopilot
	var ws uuid.UUID
	err := s.pool.QueryRow(ctx, `select `+autopilotCols+`, workspace_id from autopilots where id=$1`, id).Scan(append(a.scan(), &ws)...)
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.ErrorCode(w, 404, "autopilot_not_found", "routine not found")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	var t struct {
		Kind      string `json:"kind"`
		SecretRef string `json:"secret_ref"`
	}
	_ = json.Unmarshal(a.Trigger, &t)
	if t.Kind != "webhook" {
		httpx.ErrorCode(w, 400, "not_a_webhook", "this routine is not webhook triggered")
		return
	}
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
	if err != nil {
		httpx.Error(w, 400, "body too large")
		return
	}
	secret, err := s.readSecret(ctx, t.SecretRef)
	if err != nil {
		httpx.ErrorCode(w, 503, "no_secret", "this routine has no usable secret")
		return
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	want := hex.EncodeToString(mac.Sum(nil))
	got := strings.TrimPrefix(strings.TrimSpace(r.Header.Get("X-BotInc-Signature")), "sha256=")
	if !hmac.Equal([]byte(want), []byte(got)) {
		httpx.ErrorCode(w, 401, "bad_signature", "signature does not match")
		return
	}
	if !a.Enabled {
		httpx.ErrorCode(w, 409, "disabled", "this routine is paused")
		return
	}
	rn, err := s.FireAutopilot(ctx, ws, a, nil, string(body))
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 202, map[string]any{"run_id": rn.ID})
}

// --- scheduler.Firer ---

// FireDue is the scheduler's entry point: load the routine and queue its run.
func (s *Server) FireDue(ctx context.Context, ws, id uuid.UUID) error {
	var a Autopilot
	if err := s.pool.QueryRow(ctx, `select `+autopilotCols+` from autopilots where id=$1 and workspace_id=$2`, id, ws).Scan(a.scan()...); err != nil {
		return err
	}
	if !a.Enabled {
		return nil
	}
	_, err := s.FireAutopilot(ctx, ws, a, nil, "")
	return err
}

// Reconcile hands the scheduler's tick to the run service.
func (s *Server) Reconcile(ctx context.Context) { s.runs.Reconcile(ctx) }
