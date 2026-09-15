package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/arosasg/botinc-v2/server/internal/runs"
)

type Issue struct {
	ID          uuid.UUID       `json:"id"`
	Identifier  string          `json:"identifier"`
	ProjectID   *uuid.UUID      `json:"project_id"`
	Number      int             `json:"number"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Status      string          `json:"status"`
	Priority    string          `json:"priority"`
	AssigneeID  *uuid.UUID      `json:"assignee_user_id"`
	ParentID    *uuid.UUID      `json:"parent_id"`
	WorkflowID  *uuid.UUID      `json:"workflow_id"`
	Source      json.RawMessage `json:"source"`
	NeedsYou    json.RawMessage `json:"needs_you"`
	CreatedBy   *uuid.UUID      `json:"created_by"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`

	prefix string
}

const issueCols = `i.id, i.project_id, i.number, i.title, i.description, i.status, i.priority, i.assignee_user_id, i.parent_id, i.workflow_id, i.source, i.needs_you, i.created_by, i.created_at, i.updated_at`
const issueListCols = `i.id, i.project_id, i.number, i.title, ''::text as description, i.status, i.priority, i.assignee_user_id, i.parent_id, i.workflow_id, i.source, i.needs_you, i.created_by, i.created_at, i.updated_at`

func (i *Issue) scan() []any {
	return []any{&i.ID, &i.ProjectID, &i.Number, &i.Title, &i.Description, &i.Status, &i.Priority, &i.AssigneeID, &i.ParentID, &i.WorkflowID, &i.Source, &i.NeedsYou, &i.CreatedBy, &i.CreatedAt, &i.UpdatedAt}
}

// stamp fills the human identifier (BOT-14) once the prefix is known.
func (i *Issue) stamp(prefix string) {
	i.prefix = prefix
	i.Identifier = prefix + "-" + itoa(i.Number)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [12]byte
	p := len(b)
	for n > 0 {
		p--
		b[p] = byte('0' + n%10)
		n /= 10
	}
	return string(b[p:])
}

var issueStatuses = map[string]bool{
	"needs_you": true, "todo": true, "in_progress": true,
	"in_review": true, "blocked": true, "done": true, "cancelled": true,
}

var issuePriorities = map[string]bool{"urgent": true, "high": true, "normal": true, "low": true}

func (s *Server) issuePrefix(ctx context.Context, ws uuid.UUID) string {
	var p string
	if err := s.pool.QueryRow(ctx, `select issue_prefix from workspaces where id=$1`, ws).Scan(&p); err != nil || p == "" {
		return "BOT"
	}
	return p
}

func (s *Server) listIssues(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	q := r.URL.Query()
	// List screens only need row metadata. Imported issue descriptions can be
	// several megabytes per workspace and are returned by the detail endpoint,
	// so do not repeatedly send or parse them during navigation and refreshes.
	sql := `select ` + issueListCols + ` from issues i where i.workspace_id=$1`
	args := []any{sc.WorkspaceID}
	if st := q.Get("status"); st != "" {
		list := strings.Split(st, ",")
		args = append(args, list)
		sql += ` and i.status = any($2)`
	}
	if q.Get("assignee") == "me" {
		args = append(args, sc.UserID)
		sql += ` and i.assignee_user_id = $` + itoa(len(args))
	}
	if pid := q.Get("project"); pid != "" {
		if id, err := uuid.Parse(pid); err == nil {
			args = append(args, id)
			sql += ` and i.project_id = $` + itoa(len(args))
		}
	}
	limit, offset := 500, 0
	if text := q.Get("limit"); text != "" {
		n, err := strconv.Atoi(text)
		if err != nil || n < 1 || n > 500 {
			httpx.Error(w, 400, "limit must be between 1 and 500")
			return
		}
		limit = n
	}
	if text := q.Get("offset"); text != "" {
		n, err := strconv.Atoi(text)
		if err != nil || n < 0 {
			httpx.Error(w, 400, "offset must be nonnegative")
			return
		}
		offset = n
	}
	args = append(args, limit+1, offset)
	sql += ` order by case i.status when 'needs_you' then 0 when 'in_progress' then 1 when 'in_review' then 2 when 'todo' then 3 when 'blocked' then 4 else 5 end, i.updated_at desc, i.id limit $` + itoa(len(args)-1) + ` offset $` + itoa(len(args))
	rows, err := s.pool.Query(r.Context(), sql, args...)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	prefix := s.issuePrefix(r.Context(), sc.WorkspaceID)
	out := []Issue{}
	for rows.Next() {
		var i Issue
		if err := rows.Scan(i.scan()...); err != nil {
			s.fail(w, err)
			return
		}
		i.stamp(prefix)
		out = append(out, i)
	}
	if err := rows.Err(); err != nil {
		s.fail(w, err)
		return
	}
	hasMore := len(out) > limit
	if hasMore {
		out = out[:limit]
	}
	httpx.JSON(w, 200, map[string]any{"issues": out, "has_more": hasMore, "next_offset": offset + len(out)})
}

func (s *Server) createIssue(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var in struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		Priority    string     `json:"priority"`
		Status      string     `json:"status"`
		ProjectID   *uuid.UUID `json:"project_id"`
		ParentID    *uuid.UUID `json:"parent_id"`
		AssigneeID  *uuid.UUID `json:"assignee_user_id"`
		WorkflowKey string     `json:"workflow"`
		Start       bool       `json:"start"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if !s.referencesAllowed(w, r, map[string]*uuid.UUID{"project": in.ProjectID, "issue": in.ParentID, "member": in.AssigneeID}) {
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	if in.Title == "" {
		httpx.ErrorCode(w, 400, "title_required", "an issue needs a title")
		return
	}
	if !issuePriorities[in.Priority] {
		in.Priority = "normal"
	}
	if !issueStatuses[in.Status] {
		in.Status = "todo"
	}
	ctx := r.Context()
	workflowID, err := s.workflowIDFor(ctx, sc.WorkspaceID, in.WorkflowKey, "fix-review")
	if err != nil {
		s.fail(w, err)
		return
	}
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(ctx) //nolint:errcheck // rollback after commit is a no-op

	var number int
	if err := tx.QueryRow(ctx, `update workspaces set issue_counter = issue_counter + 1 where id=$1 returning issue_counter`, sc.WorkspaceID).Scan(&number); err != nil {
		s.fail(w, err)
		return
	}
	src, _ := json.Marshal(map[string]any{"kind": "manual"})
	var is Issue
	err = tx.QueryRow(ctx, `insert into issues (workspace_id, project_id, number, title, description, status, priority, assignee_user_id, parent_id, workflow_id, source, created_by)
		values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning `+strings.ReplaceAll(issueCols, "i.", ""),
		sc.WorkspaceID, in.ProjectID, number, in.Title, in.Description, in.Status, in.Priority, in.AssigneeID, in.ParentID, workflowID, src, sc.UserID).Scan(is.scan()...)
	if err != nil {
		s.fail(w, err)
		return
	}
	if err := tx.Commit(ctx); err != nil {
		s.fail(w, err)
		return
	}
	is.stamp(s.issuePrefix(ctx, sc.WorkspaceID))
	s.hub.Publish(sc.WorkspaceID, "issue.created", is)

	var run *runs.Run
	if in.Start {
		rn, err := s.startIssueRun(ctx, sc, is, "")
		if err != nil {
			s.log.Error("start issue run", "err", err)
		} else {
			run = &rn
		}
	}
	httpx.JSON(w, 201, map[string]any{"issue": is, "run": run})
}

func (s *Server) loadIssue(r *http.Request) (Issue, bool, error) {
	sc := scopeOf(r.Context())
	key := strings.TrimSpace(chiParam(r, "id"))
	var is Issue
	var err error
	if id, perr := uuid.Parse(key); perr == nil {
		err = s.pool.QueryRow(r.Context(), `select `+issueCols+` from issues i where i.id=$1 and i.workspace_id=$2`, id, sc.WorkspaceID).Scan(is.scan()...)
	} else {
		// Accept the human identifier too, so BOT-14 works everywhere an id does.
		n := key
		if i := strings.LastIndex(key, "-"); i >= 0 {
			n = key[i+1:]
		}
		err = s.pool.QueryRow(r.Context(), `select `+issueCols+` from issues i where i.workspace_id=$1 and i.number=$2::int`, sc.WorkspaceID, n).Scan(is.scan()...)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return Issue{}, false, nil
	}
	if err != nil {
		return Issue{}, false, err
	}
	is.stamp(s.issuePrefix(r.Context(), sc.WorkspaceID))
	return is, true, nil
}

type issueComment struct {
	ID         uuid.UUID  `json:"id"`
	AuthorID   *uuid.UUID `json:"author_user_id"`
	AuthorKind string     `json:"author_kind"`
	Body       string     `json:"body"`
	CreatedAt  time.Time  `json:"created_at"`
}

func (s *Server) getIssue(w http.ResponseWriter, r *http.Request) {
	is, found, err := s.loadIssue(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "issue_not_found", "issue not found")
		return
	}
	ctx := r.Context()
	comments := []issueComment{}
	if rows, err := s.pool.Query(ctx, `select id, author_user_id, author_kind, body, created_at from issue_comments where issue_id=$1 order by created_at`, is.ID); err == nil {
		for rows.Next() {
			var c issueComment
			if err := rows.Scan(&c.ID, &c.AuthorID, &c.AuthorKind, &c.Body, &c.CreatedAt); err == nil {
				comments = append(comments, c)
			}
		}
		rows.Close()
	}
	runList := []runs.Run{}
	if rows, err := s.pool.Query(ctx, `select `+runColsPrefixed("r")+` from runs r where r.issue_id=$1 order by r.queued_at desc limit 20`, is.ID); err == nil {
		for rows.Next() {
			if rn, err := scanRunRows(rows); err == nil {
				runList = append(runList, rn)
			}
		}
		rows.Close()
	}
	var steps []StepRow
	if len(runList) > 0 {
		steps, _ = s.loadSteps(ctx, runList[0].ID)
	}
	children := []Issue{}
	if rows, err := s.pool.Query(ctx, `select `+issueCols+` from issues i where i.parent_id=$1 order by i.number`, is.ID); err == nil {
		for rows.Next() {
			var c Issue
			if err := rows.Scan(c.scan()...); err == nil {
				c.stamp(is.prefix)
				children = append(children, c)
			}
		}
		rows.Close()
	}
	var conversationID *uuid.UUID
	_ = s.pool.QueryRow(ctx, `select id from conversations where issue_id=$1 order by created_at limit 1`, is.ID).Scan(&conversationID)

	httpx.JSON(w, 200, map[string]any{
		"issue": is, "comments": comments, "runs": runList, "steps": steps,
		"children": children, "conversation_id": conversationID,
	})
}

func (s *Server) updateIssue(w http.ResponseWriter, r *http.Request) {
	is, found, err := s.loadIssue(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "issue_not_found", "issue not found")
		return
	}
	var in struct {
		Title       *string    `json:"title"`
		Description *string    `json:"description"`
		Status      *string    `json:"status"`
		Priority    *string    `json:"priority"`
		AssigneeID  *uuid.UUID `json:"assignee_user_id"`
		ProjectID   *uuid.UUID `json:"project_id"`
		ParentID    *uuid.UUID `json:"parent_id"`
		WorkflowID  *uuid.UUID `json:"workflow_id"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if !s.referencesAllowed(w, r, map[string]*uuid.UUID{"project": in.ProjectID, "issue": in.ParentID, "member": in.AssigneeID, "workflow": in.WorkflowID}) {
		return
	}
	if in.Status != nil && !issueStatuses[*in.Status] {
		httpx.ErrorCode(w, 400, "bad_status", "unknown status")
		return
	}
	if in.Priority != nil && !issuePriorities[*in.Priority] {
		httpx.ErrorCode(w, 400, "bad_priority", "unknown priority")
		return
	}
	// Clearing needs_you is implicit: any status the user picks answers the ask.
	clearNeeds := in.Status != nil
	err = s.pool.QueryRow(r.Context(), `update issues i set
		title=coalesce($2,title), description=coalesce($3,description), status=coalesce($4,status),
		priority=coalesce($5,priority), assignee_user_id=coalesce($6,assignee_user_id),
		project_id=coalesce($7,project_id), parent_id=coalesce($8,parent_id), workflow_id=coalesce($9,workflow_id),
		needs_you=case when $10 then null else needs_you end, updated_at=now()
		where i.id=$1 returning `+issueCols,
		is.ID, in.Title, in.Description, in.Status, in.Priority, in.AssigneeID, in.ProjectID, in.ParentID, in.WorkflowID, clearNeeds).Scan(is.scan()...)
	if err != nil {
		s.fail(w, err)
		return
	}
	is.stamp(s.issuePrefix(r.Context(), scopeOf(r.Context()).WorkspaceID))
	s.hub.Publish(scopeOf(r.Context()).WorkspaceID, "issue.updated", is)
	httpx.JSON(w, 200, map[string]any{"issue": is})
}

func (s *Server) addComment(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	is, found, err := s.loadIssue(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "issue_not_found", "issue not found")
		return
	}
	var in struct {
		Body string `json:"body"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if strings.TrimSpace(in.Body) == "" {
		httpx.ErrorCode(w, 400, "body_required", "a comment needs a body")
		return
	}
	var c issueComment
	if err := s.pool.QueryRow(r.Context(), `insert into issue_comments (issue_id, author_user_id, author_kind, body) values ($1,$2,'user',$3)
		returning id, author_user_id, author_kind, body, created_at`, is.ID, sc.UserID, in.Body).Scan(&c.ID, &c.AuthorID, &c.AuthorKind, &c.Body, &c.CreatedAt); err != nil {
		s.fail(w, err)
		return
	}
	_, _ = s.pool.Exec(r.Context(), `update issues set updated_at=now() where id=$1`, is.ID)
	s.hub.Publish(sc.WorkspaceID, "issue.comment", map[string]any{"issue_id": is.ID, "comment": c})
	httpx.JSON(w, 201, map[string]any{"comment": c})
}

// startIssueRun queues a build run for the issue on its workflow's active version.
func (s *Server) startIssueRun(ctx context.Context, sc Scope, is Issue, extra string) (runs.Run, error) {
	var versionID *uuid.UUID
	var steps []runs.StepSpec
	var limit int
	if is.WorkflowID != nil {
		var graph []byte
		var vid uuid.UUID
		err := s.pool.QueryRow(ctx, `select v.id, v.graph from workflows w join workflow_versions v on v.id=w.active_version_id where w.id=$1`, *is.WorkflowID).Scan(&vid, &graph)
		if err == nil {
			versionID = &vid
			steps, limit = stepsFromGraph(graph)
		}
	}
	prompt := "Issue " + is.Identifier + ": " + is.Title
	if strings.TrimSpace(is.Description) != "" {
		prompt += "\n\n" + is.Description
	}
	if strings.TrimSpace(extra) != "" {
		prompt += "\n\n" + extra
	}
	id := is.ID
	rn, err := s.runs.Create(ctx, runs.CreateParams{
		WorkspaceID: sc.WorkspaceID, IssueID: &id, WorkflowVersionID: versionID,
		Purpose: "build", Prompt: prompt, TaskLimitCents: limit, CreatedBy: &sc.UserID, Steps: steps,
	})
	if err != nil {
		return runs.Run{}, err
	}
	_, _ = s.pool.Exec(ctx, `update issues set status='in_progress', needs_you=null, updated_at=now() where id=$1`, is.ID)
	s.hub.Publish(sc.WorkspaceID, "issue.updated", map[string]any{"id": is.ID, "status": "in_progress"})
	return rn, nil
}

func (s *Server) workOnIssue(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	is, found, err := s.loadIssue(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "issue_not_found", "issue not found")
		return
	}
	var in struct {
		Instructions string     `json:"instructions"`
		WorkflowID   *uuid.UUID `json:"workflow_id"`
	}
	_ = httpx.Decode(r, &in)
	if in.WorkflowID != nil {
		if _, err := s.pool.Exec(r.Context(), `update issues set workflow_id=$2 where id=$1`, is.ID, *in.WorkflowID); err == nil {
			is.WorkflowID = in.WorkflowID
		}
	}
	var busy int
	_ = s.pool.QueryRow(r.Context(), `select count(*) from runs where issue_id=$1 and status in ('queued','provisioning','running')`, is.ID).Scan(&busy)
	if busy > 0 {
		httpx.ErrorCode(w, 409, "already_running", "a run is already working on this issue")
		return
	}
	rn, err := s.startIssueRun(r.Context(), sc, is, in.Instructions)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 202, map[string]any{"run": rn})
}

// approveIssue is the human gate. Nothing merges itself: approval is recorded
// against the issue and the run that produced the change, and the merge is the
// runtime's next step, never a side effect of reading this endpoint.
func (s *Server) approveIssue(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	is, found, err := s.loadIssue(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "issue_not_found", "issue not found")
		return
	}
	if is.Status != "in_review" {
		httpx.ErrorCode(w, 409, "not_in_review", "this issue is not waiting for approval")
		return
	}
	var in struct {
		Note  string `json:"note"`
		Merge bool   `json:"merge"`
	}
	_ = httpx.Decode(r, &in)
	ctx := r.Context()
	body := "Approved."
	if strings.TrimSpace(in.Note) != "" {
		body = "Approved. " + in.Note
	}
	_, _ = s.pool.Exec(ctx, `insert into issue_comments (issue_id, author_user_id, author_kind, body) values ($1,$2,'user',$3)`, is.ID, sc.UserID, body)
	_, _ = s.pool.Exec(ctx, `update run_steps set status='done', finished_at=now() where kind='approval' and run_id in (select id from runs where issue_id=$1)`, is.ID)

	status := "done"
	var run *runs.Run
	if in.Merge {
		// Merging is work, so it is a run with its own record, not a database flip.
		id := is.ID
		rn, err := s.runs.Create(ctx, runs.CreateParams{
			WorkspaceID: sc.WorkspaceID, IssueID: &id, Purpose: "merge",
			Prompt:    "The change for " + is.Identifier + " is approved. Merge its pull request and report the merge commit.",
			CreatedBy: &sc.UserID, Steps: []runs.StepSpec{{Key: "merge", Name: "Merge", Kind: "task"}},
		})
		if err != nil {
			s.fail(w, err)
			return
		}
		run, status = &rn, "in_progress"
	}
	_, _ = s.pool.Exec(ctx, `update issues set status=$2, needs_you=null, updated_at=now() where id=$1`, is.ID, status)
	s.hub.Publish(sc.WorkspaceID, "issue.updated", map[string]any{"id": is.ID, "status": status})
	httpx.JSON(w, 200, map[string]any{"issue_id": is.ID, "status": status, "run": run})
}

func (s *Server) requestChanges(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	is, found, err := s.loadIssue(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "issue_not_found", "issue not found")
		return
	}
	var in struct {
		Note string `json:"note"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if strings.TrimSpace(in.Note) == "" {
		httpx.ErrorCode(w, 400, "note_required", "say what should change")
		return
	}
	ctx := r.Context()
	_, _ = s.pool.Exec(ctx, `insert into issue_comments (issue_id, author_user_id, author_kind, body) values ($1,$2,'user',$3)`, is.ID, sc.UserID, "Changes requested. "+in.Note)
	_, _ = s.pool.Exec(ctx, `update run_steps set status='changes', finished_at=now() where kind='approval' and run_id in (select id from runs where issue_id=$1)`, is.ID)
	rn, err := s.startIssueRun(ctx, sc, is, "The reviewer asked for changes:\n\n"+in.Note)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 202, map[string]any{"run": rn})
}
