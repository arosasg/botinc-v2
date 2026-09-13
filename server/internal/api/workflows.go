package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/arosasg/botinc-v2/server/internal/runs"
)

type Workflow struct {
	ID          uuid.UUID  `json:"id"`
	Key         string     `json:"key"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	ActiveID    *uuid.UUID `json:"active_version_id"`
	CreatedAt   time.Time  `json:"created_at"`
}

const workflowCols = `id, key, name, description, active_version_id, created_at`

func (wf *Workflow) scan() []any {
	return []any{&wf.ID, &wf.Key, &wf.Name, &wf.Description, &wf.ActiveID, &wf.CreatedAt}
}

type WorkflowVersion struct {
	ID        uuid.UUID       `json:"id"`
	Version   int             `json:"version"`
	Status    string          `json:"status"`
	Graph     json.RawMessage `json:"graph"`
	CreatedAt time.Time       `json:"created_at"`
}

// --- graph ---

type graphNode struct {
	Key   string `json:"key"`
	Name  string `json:"name"`
	Kind  string `json:"kind"`
	Model string `json:"model,omitempty"`
}

type graphDoc struct {
	Nodes  []graphNode    `json:"nodes"`
	Edges  [][]string     `json:"edges"`
	Limits map[string]int `json:"limits,omitempty"`
}

var nodeKinds = map[string]bool{
	"start": true, "task": true, "condition": true, "repeat": true,
	"question": true, "approval": true, "finish": true,
}

// validateGraph rejects a graph the runner could not execute: it must have one
// start and one finish, unique keys, known kinds, edges between real nodes, and
// every node reachable from start.
func validateGraph(raw json.RawMessage) (graphDoc, error) {
	var g graphDoc
	if err := json.Unmarshal(raw, &g); err != nil {
		return g, fmt.Errorf("graph is not valid JSON: %w", err)
	}
	if len(g.Nodes) == 0 {
		return g, errors.New("a workflow needs at least one node")
	}
	seen := map[string]bool{}
	starts, finishes := 0, 0
	for _, n := range g.Nodes {
		if strings.TrimSpace(n.Key) == "" {
			return g, errors.New("every node needs a key")
		}
		if seen[n.Key] {
			return g, fmt.Errorf("duplicate node key %q", n.Key)
		}
		seen[n.Key] = true
		if !nodeKinds[n.Kind] {
			return g, fmt.Errorf("node %q has unknown kind %q", n.Key, n.Kind)
		}
		switch n.Kind {
		case "start":
			starts++
		case "finish":
			finishes++
		}
	}
	if starts != 1 {
		return g, errors.New("a workflow needs exactly one start node")
	}
	if finishes != 1 {
		return g, errors.New("a workflow needs exactly one finish node")
	}
	adj := map[string][]string{}
	for _, e := range g.Edges {
		if len(e) != 2 {
			return g, errors.New("every edge is a [from, to] pair")
		}
		if !seen[e[0]] || !seen[e[1]] {
			return g, fmt.Errorf("edge %v points at a node that does not exist", e)
		}
		adj[e[0]] = append(adj[e[0]], e[1])
	}
	var start string
	for _, n := range g.Nodes {
		if n.Kind == "start" {
			start = n.Key
		}
	}
	reached := map[string]bool{start: true}
	queue := []string{start}
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		for _, next := range adj[cur] {
			if !reached[next] {
				reached[next] = true
				queue = append(queue, next)
			}
		}
	}
	for _, n := range g.Nodes {
		if !reached[n.Key] {
			return g, fmt.Errorf("node %q cannot be reached from start", n.Key)
		}
	}
	return g, nil
}

// stepsFromGraph flattens the graph into the ordered run steps the runtime
// executes. start and finish are bookkeeping, so they do not become steps.
func stepsFromGraph(raw []byte) ([]runs.StepSpec, int) {
	g, err := validateGraph(raw)
	if err != nil {
		return nil, 0
	}
	adj := map[string][]string{}
	for _, e := range g.Edges {
		adj[e[0]] = append(adj[e[0]], e[1])
	}
	byKey := map[string]graphNode{}
	start := ""
	for _, n := range g.Nodes {
		byKey[n.Key] = n
		if n.Kind == "start" {
			start = n.Key
		}
	}
	var out []runs.StepSpec
	seen := map[string]bool{start: true}
	queue := append([]string{}, adj[start]...)
	for len(queue) > 0 {
		key := queue[0]
		queue = queue[1:]
		if seen[key] {
			continue
		}
		seen[key] = true
		n := byKey[key]
		if n.Kind != "finish" {
			out = append(out, runs.StepSpec{Key: n.Key, Name: n.Name, Kind: n.Kind, Model: n.Model})
		}
		queue = append(queue, adj[key]...)
	}
	return out, g.Limits["task_limit_cents"]
}

// workflowIDFor resolves a workflow key to its id, falling back to a default key.
func (s *Server) workflowIDFor(ctx context.Context, ws uuid.UUID, key, fallback string) (*uuid.UUID, error) {
	if strings.TrimSpace(key) == "" {
		key = fallback
	}
	var id uuid.UUID
	err := s.pool.QueryRow(ctx, `select id from workflows where workspace_id=$1 and key=$2`, ws, key).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &id, nil
}

// --- handlers ---

func (s *Server) listWorkflows(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select `+workflowCols+` from workflows where workspace_id=$1 order by created_at`, sc.WorkspaceID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Workflow{}
	for rows.Next() {
		var wf Workflow
		if err := rows.Scan(wf.scan()...); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, wf)
	}
	httpx.JSON(w, 200, map[string]any{"workflows": out})
}

func (s *Server) createWorkflow(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.ErrorCode(w, 403, "forbidden", "only an owner or admin can add a workflow")
		return
	}
	var in struct {
		Key         string          `json:"key"`
		Name        string          `json:"name"`
		Description string          `json:"description"`
		Graph       json.RawMessage `json:"graph"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	in.Key, in.Name = strings.TrimSpace(in.Key), strings.TrimSpace(in.Name)
	if in.Name == "" {
		httpx.ErrorCode(w, 400, "name_required", "a workflow needs a name")
		return
	}
	if in.Key == "" {
		in.Key = slugify(in.Name)
	}
	if len(in.Graph) == 0 {
		in.Graph = json.RawMessage(`{"nodes":[{"key":"start","name":"Start","kind":"start"},{"key":"finish","name":"Finish","kind":"finish"}],"edges":[["start","finish"]]}`)
	}
	if _, err := validateGraph(in.Graph); err != nil {
		httpx.ErrorCode(w, 400, "invalid_graph", err.Error())
		return
	}
	ctx := r.Context()
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(ctx) //nolint:errcheck // rollback after commit is a no-op
	var wf Workflow
	if err := tx.QueryRow(ctx, `insert into workflows (workspace_id, key, name, description) values ($1,$2,$3,$4) returning `+workflowCols, sc.WorkspaceID, in.Key, in.Name, in.Description).Scan(wf.scan()...); err != nil {
		httpx.ErrorCode(w, 409, "key_taken", "a workflow with that key already exists")
		return
	}
	var vid uuid.UUID
	if err := tx.QueryRow(ctx, `insert into workflow_versions (workflow_id, version, status, graph) values ($1,1,'active',$2) returning id`, wf.ID, in.Graph).Scan(&vid); err != nil {
		s.fail(w, err)
		return
	}
	if _, err := tx.Exec(ctx, `update workflows set active_version_id=$2 where id=$1`, wf.ID, vid); err != nil {
		s.fail(w, err)
		return
	}
	if err := tx.Commit(ctx); err != nil {
		s.fail(w, err)
		return
	}
	wf.ActiveID = &vid
	s.hub.Publish(sc.WorkspaceID, "workflow.created", wf)
	httpx.JSON(w, 201, map[string]any{"workflow": wf})
}

func (s *Server) loadWorkflow(r *http.Request) (Workflow, bool, error) {
	sc := scopeOf(r.Context())
	key := chiParam(r, "id")
	var wf Workflow
	var err error
	if id, perr := uuid.Parse(key); perr == nil {
		err = s.pool.QueryRow(r.Context(), `select `+workflowCols+` from workflows where id=$1 and workspace_id=$2`, id, sc.WorkspaceID).Scan(wf.scan()...)
	} else {
		err = s.pool.QueryRow(r.Context(), `select `+workflowCols+` from workflows where key=$1 and workspace_id=$2`, key, sc.WorkspaceID).Scan(wf.scan()...)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return Workflow{}, false, nil
	}
	return wf, err == nil, err
}

func (s *Server) getWorkflow(w http.ResponseWriter, r *http.Request) {
	wf, found, err := s.loadWorkflow(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "workflow_not_found", "workflow not found")
		return
	}
	rows, err := s.pool.Query(r.Context(), `select id, version, status, graph, created_at from workflow_versions where workflow_id=$1 order by version desc`, wf.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	versions := []WorkflowVersion{}
	for rows.Next() {
		var v WorkflowVersion
		if err := rows.Scan(&v.ID, &v.Version, &v.Status, &v.Graph, &v.CreatedAt); err != nil {
			s.fail(w, err)
			return
		}
		versions = append(versions, v)
	}
	httpx.JSON(w, 200, map[string]any{"workflow": wf, "versions": versions})
}

// createWorkflowVersion records a new draft. A version is immutable once
// written, so a change is always a new row and history stays readable.
func (s *Server) createWorkflowVersion(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.ErrorCode(w, 403, "forbidden", "only an owner or admin can change a workflow")
		return
	}
	wf, found, err := s.loadWorkflow(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "workflow_not_found", "workflow not found")
		return
	}
	var in struct {
		Graph    json.RawMessage `json:"graph"`
		Activate bool            `json:"activate"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if _, err := validateGraph(in.Graph); err != nil {
		httpx.ErrorCode(w, 400, "invalid_graph", err.Error())
		return
	}
	ctx := r.Context()
	var next int
	_ = s.pool.QueryRow(ctx, `select coalesce(max(version),0)+1 from workflow_versions where workflow_id=$1`, wf.ID).Scan(&next)
	status := "draft"
	if in.Activate {
		status = "active"
	}
	var v WorkflowVersion
	if err := s.pool.QueryRow(ctx, `insert into workflow_versions (workflow_id, version, status, graph) values ($1,$2,$3,$4) returning id, version, status, graph, created_at`, wf.ID, next, status, in.Graph).Scan(&v.ID, &v.Version, &v.Status, &v.Graph, &v.CreatedAt); err != nil {
		s.fail(w, err)
		return
	}
	if in.Activate {
		_, _ = s.pool.Exec(ctx, `update workflow_versions set status='retired' where workflow_id=$1 and id<>$2 and status='active'`, wf.ID, v.ID)
		_, _ = s.pool.Exec(ctx, `update workflows set active_version_id=$2 where id=$1`, wf.ID, v.ID)
		wf.ActiveID = &v.ID
	}
	s.hub.Publish(sc.WorkspaceID, "workflow.updated", wf)
	httpx.JSON(w, 201, map[string]any{"workflow": wf, "version": v})
}

func (s *Server) activateWorkflowVersion(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.ErrorCode(w, 403, "forbidden", "only an owner or admin can change a workflow")
		return
	}
	wf, found, err := s.loadWorkflow(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.ErrorCode(w, 404, "workflow_not_found", "workflow not found")
		return
	}
	ctx := r.Context()
	var vid uuid.UUID
	err = s.pool.QueryRow(ctx, `select id from workflow_versions where workflow_id=$1 and version=$2::int`, wf.ID, chiParam(r, "version")).Scan(&vid)
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.ErrorCode(w, 404, "version_not_found", "that version does not exist")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	_, _ = s.pool.Exec(ctx, `update workflow_versions set status='retired' where workflow_id=$1 and status='active'`, wf.ID)
	_, _ = s.pool.Exec(ctx, `update workflow_versions set status='active' where id=$1`, vid)
	if _, err := s.pool.Exec(ctx, `update workflows set active_version_id=$2 where id=$1`, wf.ID, vid); err != nil {
		s.fail(w, err)
		return
	}
	wf.ActiveID = &vid
	s.hub.Publish(sc.WorkspaceID, "workflow.updated", wf)
	httpx.JSON(w, 200, map[string]any{"workflow": wf})
}
