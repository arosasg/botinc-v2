package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/arosasg/botinc-v2/server/internal/runs"
)

func runColsPrefixed(p string) string {
	cols := []string{"id", "workspace_id", "issue_id", "conversation_id", "workflow_version_id", "purpose", "status", "model", "account_id", "funding", "task_limit_cents", "cost_cents", "prompt", "result", "error", "sandbox_id", "parent_run_id", "queued_at", "started_at", "finished_at"}
	if p != "" {
		for i := range cols {
			cols[i] = p + "." + cols[i]
		}
	}
	return strings.Join(cols, ", ")
}

func scanRunRows(rows pgx.Rows) (runs.Run, error) {
	var r runs.Run
	err := rows.Scan(&r.ID, &r.WorkspaceID, &r.IssueID, &r.ConversationID, &r.WorkflowVersionID, &r.Purpose, &r.Status, &r.Model, &r.AccountID, &r.Funding, &r.TaskLimitCents, &r.CostCents, &r.Prompt, &r.Result, &r.Error, &r.SandboxID, &r.ParentRunID, &r.QueuedAt, &r.StartedAt, &r.FinishedAt)
	return r, err
}

type StepRow struct {
	Idx        int             `json:"idx"`
	Key        string          `json:"key"`
	Name       string          `json:"name"`
	Kind       string          `json:"kind"`
	Status     string          `json:"status"`
	Model      string          `json:"model"`
	AccountID  *uuid.UUID      `json:"account_id"`
	Effort     string          `json:"effort"`
	CostCents  int             `json:"cost_cents"`
	Output     json.RawMessage `json:"output"`
	StartedAt  *time.Time      `json:"started_at"`
	FinishedAt *time.Time      `json:"finished_at"`
}

func (s *Server) loadSteps(ctx context.Context, runID uuid.UUID) ([]StepRow, error) {
	rows, err := s.pool.Query(ctx, `select idx, key, name, kind, status, model, account_id, effort, cost_cents, output, started_at, finished_at from run_steps where run_id=$1 order by idx`, runID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []StepRow{}
	for rows.Next() {
		var st StepRow
		if err := rows.Scan(&st.Idx, &st.Key, &st.Name, &st.Kind, &st.Status, &st.Model, &st.AccountID, &st.Effort, &st.CostCents, &st.Output, &st.StartedAt, &st.FinishedAt); err != nil {
			return nil, err
		}
		out = append(out, st)
	}
	return out, nil
}

func (s *Server) listRuns(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	q := `select ` + runColsPrefixed("r") + ` from runs r where workspace_id=$1 and (conversation_id is null or exists(select 1 from conversations c where c.id=r.conversation_id and (c.user_id=$2 or c.shared)))`
	args := []any{sc.WorkspaceID, sc.UserID}
	if v := r.URL.Query().Get("issue"); v != "" {
		if id, err := uuid.Parse(v); err == nil {
			q += ` and issue_id=$3`
			args = append(args, id)
		}
	} else if v := r.URL.Query().Get("conversation"); v != "" {
		if id, err := uuid.Parse(v); err == nil {
			q += ` and conversation_id=$3`
			args = append(args, id)
		}
	}
	q += ` order by queued_at desc limit 200`
	rows, err := s.pool.Query(r.Context(), q, args...)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []runs.Run{}
	for rows.Next() {
		rn, err := scanRunRows(rows)
		if err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, rn)
	}
	httpx.JSON(w, 200, map[string]any{"runs": out})
}

func (s *Server) loadRun(r *http.Request) (runs.Run, bool, error) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		return runs.Run{}, false, nil
	}
	rn, err := s.runs.Get(r.Context(), id)
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && rn.WorkspaceID != sc.WorkspaceID) {
		return runs.Run{}, false, nil
	}
	if err == nil && rn.ConversationID != nil {
		var allowed bool
		err = s.pool.QueryRow(r.Context(), `select exists(select 1 from conversations where id=$1 and workspace_id=$2 and (user_id=$3 or shared))`, rn.ConversationID, sc.WorkspaceID, sc.UserID).Scan(&allowed)
		if err != nil || !allowed {
			return runs.Run{}, false, err
		}
	}
	return rn, err == nil, err
}

func (s *Server) getRun(w http.ResponseWriter, r *http.Request) {
	rn, found, err := s.loadRun(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "run not found")
		return
	}
	steps, err := s.loadSteps(r.Context(), rn.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]any{"run": rn, "steps": steps})
}

func (s *Server) runEvents(w http.ResponseWriter, r *http.Request) {
	rn, found, err := s.loadRun(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "run not found")
		return
	}
	// ?after=<seq> is how a follower tails a run: without it every poll would
	// re-send the whole log and grow with the run.
	after, _ := strconv.Atoi(r.URL.Query().Get("after"))
	limit := 500
	if n, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && n > 0 && n <= 2000 {
		limit = n
	}
	rows, err := s.pool.Query(r.Context(), `select seq, type, payload, created_at from run_events where run_id=$1 and seq > $2 order by seq limit $3`, rn.ID, after, limit)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	type ev struct {
		Seq       int             `json:"seq"`
		Type      string          `json:"type"`
		Payload   json.RawMessage `json:"payload"`
		CreatedAt time.Time       `json:"created_at"`
	}
	out := []ev{}
	for rows.Next() {
		var e ev
		if err := rows.Scan(&e.Seq, &e.Type, &e.Payload, &e.CreatedAt); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, e)
	}
	next := after
	if len(out) > 0 {
		next = out[len(out)-1].Seq
	}
	httpx.JSON(w, 200, map[string]any{"events": out, "next": next})
}

func (s *Server) cancelRun(w http.ResponseWriter, r *http.Request) {
	rn, found, err := s.loadRun(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "run not found")
		return
	}
	if err := s.runs.Cancel(r.Context(), rn.ID); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

// --- runtime protocol ---

type runtimeKey int

const runtimeRunKey runtimeKey = 1

func (s *Server) runtimeScope(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "run"))
		if err != nil {
			httpx.Error(w, 400, "bad run id")
			return
		}
		h := r.Header.Get("Authorization")
		if !strings.HasPrefix(strings.ToLower(h), "bearer ") {
			httpx.Error(w, 401, "run token required")
			return
		}
		rn, err := s.runs.Authenticate(r.Context(), id, strings.TrimSpace(h[7:]))
		if err != nil {
			httpx.Error(w, 401, "invalid run token")
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), runtimeRunKey, rn)))
	})
}

func runOf(r *http.Request) runs.Run { return r.Context().Value(runtimeRunKey).(runs.Run) }

func (s *Server) runtimeClaim(w http.ResponseWriter, r *http.Request) {
	rn := runOf(r)
	h := r.Header.Get("Authorization")
	claimed, err := s.runs.Claim(r.Context(), rn.ID, strings.TrimSpace(h[7:]))
	if err != nil {
		httpx.Error(w, 409, "run cannot be claimed: "+err.Error())
		return
	}
	httpx.JSON(w, 200, map[string]any{"run": claimed})
}

// runtimeSpec is everything the runtime needs: prompt, context, steps, repo,
// model credentials (decrypted just for this call, never stored in the run).
func (s *Server) runtimeSpec(w http.ResponseWriter, r *http.Request) {
	rn := runOf(r)
	ctx := r.Context()
	steps, err := s.loadSteps(ctx, rn.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	spec := map[string]any{"run": rn, "steps": steps}
	if mcpConfig, err := s.runtimeMCPConfig(ctx, rn.WorkspaceID); err != nil {
		s.fail(w, err)
		return
	} else if len(mcpConfig) > 0 {
		spec["mcp_config"] = mcpConfig
	}
	if rn.WorkflowVersionID != nil {
		var graph json.RawMessage
		if err := s.pool.QueryRow(ctx, `select v.graph from workflow_versions v join workflows w on w.id=v.workflow_id where v.id=$1 and w.workspace_id=$2`, rn.WorkflowVersionID, rn.WorkspaceID).Scan(&graph); err != nil {
			s.fail(w, err)
			return
		}
		spec["graph"] = graph
	}
	if rn.ConversationID != nil {
		rows, err := s.pool.Query(ctx, `select `+msgCols+` from messages where conversation_id=$1 order by seq desc limit 40`, *rn.ConversationID)
		if err == nil {
			msgs := []Message{}
			for rows.Next() {
				var m Message
				if err := rows.Scan(m.scan()...); err == nil {
					msgs = append([]Message{m}, msgs...)
				}
			}
			rows.Close()
			spec["messages"] = msgs
		}
	}
	if rn.IssueID != nil {
		var is Issue
		if err := s.pool.QueryRow(ctx, `select `+issueCols+` from issues i where i.id=$1 and i.workspace_id=$2`, *rn.IssueID, rn.WorkspaceID).Scan(is.scan()...); err == nil {
			spec["issue"] = is
		}
	}
	// A project run only receives that project's repositories and knowledge.
	var projectID *uuid.UUID
	if rn.IssueID != nil {
		if err := s.pool.QueryRow(ctx, `select project_id from issues where id=$1 and workspace_id=$2`, *rn.IssueID, rn.WorkspaceID).Scan(&projectID); err != nil {
			s.fail(w, err)
			return
		}
	}
	type knowledge struct {
		Kind string `json:"kind"`
		Name string `json:"name"`
		Body string `json:"body"`
	}
	contextRows := []knowledge{}
	skillRows, err := s.pool.Query(ctx, `select name,body from skills where workspace_id=$1 and enabled=true order by name limit 100`, rn.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	for skillRows.Next() {
		var k knowledge
		k.Kind = "skill"
		if err := skillRows.Scan(&k.Name, &k.Body); err != nil {
			skillRows.Close()
			s.fail(w, err)
			return
		}
		contextRows = append(contextRows, k)
	}
	skillRows.Close()
	// Personal memory never enters shared issue work or a shared conversation.
	var privateUser *uuid.UUID
	if rn.ConversationID != nil {
		if err := s.pool.QueryRow(ctx, `select case when shared=false then user_id end from conversations where id=$1`, *rn.ConversationID).Scan(&privateUser); err != nil {
			s.fail(w, err)
			return
		}
	}
	memoryRows, err := s.pool.Query(ctx, `select scope,body from memories where workspace_id=$1 and (scope='workspace' or (scope='project' and project_id=$2) or (scope='personal' and user_id=$3)) order by pinned desc,updated_at desc limit 100`, rn.WorkspaceID, projectID, privateUser)
	if err != nil {
		s.fail(w, err)
		return
	}
	for memoryRows.Next() {
		var k knowledge
		k.Kind = "memory"
		if err := memoryRows.Scan(&k.Name, &k.Body); err != nil {
			memoryRows.Close()
			s.fail(w, err)
			return
		}
		contextRows = append(contextRows, k)
	}
	memoryRows.Close()
	spec["knowledge"] = contextRows
	// Repositories the run may touch.
	rrows, err := s.pool.Query(ctx, `select full_name, default_branch, installation_id from repositories where workspace_id=$1 and ($2::uuid is null or project_id=$2) order by created_at limit 5`, rn.WorkspaceID, projectID)
	if err == nil {
		type repo struct {
			FullName       string `json:"full_name"`
			DefaultBranch  string `json:"default_branch"`
			InstallationID *int64 `json:"installation_id"`
			Token          string `json:"token,omitempty"`
		}
		repos := []repo{}
		for rrows.Next() {
			var rp repo
			if err := rrows.Scan(&rp.FullName, &rp.DefaultBranch, &rp.InstallationID); err == nil {
				repos = append(repos, rp)
			}
		}
		rrows.Close()
		if rn.IssueID != nil && len(repos) > 0 {
			token, err := s.githubToken(ctx, rn.WorkspaceID)
			if err != nil {
				httpx.Error(w, 400, err.Error())
				return
			}
			for i := range repos {
				if _, err := s.authorizedRepository(ctx, token, repos[i].FullName); err != nil {
					httpx.Error(w, 400, err.Error())
					return
				}
				repos[i].Token = token
			}
		}
		spec["repositories"] = repos
	}
	if rn.AccountID != nil {
		provider, kind, value, credentialErr := s.resolveAccountCredential(ctx, *rn.AccountID, rn.WorkspaceID)
		if credentialErr == nil {
			cred := map[string]any{"provider": provider, "kind": kind}
			var structured struct {
				Env   map[string]string `json:"env"`
				Files map[string]string `json:"files"`
			}
			if json.Unmarshal([]byte(value), &structured) == nil && (len(structured.Env) > 0 || len(structured.Files) > 0) {
				cred["env"] = structured.Env
				cred["files"] = structured.Files
			} else {
				cred["secret"] = value
			}
			spec["credential"] = cred
		} else {
			httpx.ErrorCode(w, 409, "account_needs_reconnect", credentialErr.Error())
			return
		}
	} else if rn.Funding == "credits" && s.cfg.OpenRouterAPIKey != "" {
		spec["credential"] = map[string]any{"provider": "openrouter", "kind": "credits", "secret": s.cfg.OpenRouterAPIKey}
	}
	httpx.JSON(w, 200, spec)
}

func (s *Server) runtimeEvents(w http.ResponseWriter, r *http.Request) {
	rn := runOf(r)
	var in struct {
		Events []runs.Event `json:"events"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if err := s.runs.AppendEvents(r.Context(), rn, in.Events); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

func (s *Server) runtimeStep(w http.ResponseWriter, r *http.Request) {
	rn := runOf(r)
	var in runs.StepUpdate
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if err := s.runs.UpdateStep(r.Context(), rn, in); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

// runtimeMessage lets the runtime post operator messages into the conversation.
func (s *Server) runtimeMessage(w http.ResponseWriter, r *http.Request) {
	rn := runOf(r)
	if rn.ConversationID == nil {
		httpx.Error(w, 400, "run has no conversation")
		return
	}
	var in struct {
		Role string          `json:"role"`
		Body string          `json:"body"`
		Meta json.RawMessage `json:"meta"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if in.Role == "" {
		in.Role = "operator"
	}
	if in.Role != "operator" {
		httpx.Error(w, 400, "runtime messages must use the operator role")
		return
	}
	if len(in.Meta) == 0 {
		in.Meta = json.RawMessage(`{}`)
	}
	tx, err := s.pool.Begin(r.Context())
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var locked uuid.UUID
	if err := tx.QueryRow(r.Context(), `select id from conversations where id=$1 for update`, *rn.ConversationID).Scan(&locked); err != nil {
		s.fail(w, err)
		return
	}
	var m Message
	previous := tx.QueryRow(r.Context(), `select `+msgCols+` from messages where run_id=$1 and role='operator' limit 1`, rn.ID).Scan(m.scan()...)
	if previous == nil {
		if m.Body != in.Body {
			httpx.Error(w, 409, "this run already posted a different answer")
			return
		}
		httpx.JSON(w, 201, m)
		return
	}
	if !errors.Is(previous, pgx.ErrNoRows) {
		s.fail(w, previous)
		return
	}
	if err := tx.QueryRow(r.Context(), `insert into messages (conversation_id, seq, role, body, meta, run_id) values ($1,(select coalesce(max(seq),0)+1 from messages where conversation_id=$1),$2,$3,$4,$5) returning `+msgCols, *rn.ConversationID, in.Role, in.Body, in.Meta, rn.ID).Scan(m.scan()...); err != nil {
		s.fail(w, err)
		return
	}
	if _, err := tx.Exec(r.Context(), `update conversations set updated_at=now() where id=$1`, *rn.ConversationID); err != nil {
		s.fail(w, err)
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(rn.WorkspaceID, "message.created", m)
	httpx.JSON(w, 201, m)
}

func (s *Server) runtimeFinish(w http.ResponseWriter, r *http.Request) {
	rn := runOf(r)
	var in runs.Finish
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if err := s.runs.Finish(r.Context(), rn, in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	s.afterRun(r, rn, in)
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

// afterRun applies the run's outcome to the issue and drains the message queue.
func (s *Server) afterRun(r *http.Request, rn runs.Run, f runs.Finish) {
	ctx := r.Context()
	if rn.IssueID != nil && rn.Purpose == "build" {
		switch f.Status {
		case "done":
			var res struct {
				PR *struct {
					URL    string `json:"url"`
					Number int    `json:"number"`
				} `json:"pull_request"`
			}
			_ = json.Unmarshal(f.Result, &res)
			needs := map[string]any{"kind": "review", "since": time.Now()}
			nb, _ := json.Marshal(needs)
			_, _ = s.pool.Exec(ctx, `update issues set status='in_review', needs_you=$2, updated_at=now() where id=$1`, *rn.IssueID, nb)
		case "failed":
			_, _ = s.pool.Exec(ctx, `update issues set status='blocked', updated_at=now() where id=$1`, *rn.IssueID)
		}
		s.hub.Publish(rn.WorkspaceID, "issue.updated", map[string]any{"id": *rn.IssueID})
	}
	if rn.ConversationID != nil {
		s.drainQueue(r, *rn.ConversationID)
	}
}
