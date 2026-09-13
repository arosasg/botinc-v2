package api

import (
	"encoding/json"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/go-chi/chi/v5"
	"net/http"
	"strings"
)

func (s *Server) answerRun(w http.ResponseWriter, r *http.Request) {
	rn, found, err := s.loadRun(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "run not found")
		return
	}
	var in struct {
		Key    string `json:"key"`
		Answer string `json:"answer"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if strings.TrimSpace(in.Answer) == "" || len(in.Answer) > 20000 {
		httpx.Error(w, 400, "enter an answer of at most 20000 bytes")
		return
	}
	output, _ := json.Marshal(map[string]any{"answer": in.Answer, "answered_by": scopeOf(r.Context()).UserID})
	tx, err := s.pool.Begin(r.Context())
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var active bool
	if err := tx.QueryRow(r.Context(), `select finished_at is null from runs where id=$1 for update`, rn.ID).Scan(&active); err != nil {
		s.fail(w, err)
		return
	}
	if !active {
		httpx.Error(w, 409, "run has finished")
		return
	}
	tag, err := tx.Exec(r.Context(), `update run_steps set output=output||$3::jsonb where run_id=$1 and key=$2 and kind='question' and status='waiting' and not(output ? 'answer')`, rn.ID, in.Key, output)
	if err != nil {
		s.fail(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		httpx.Error(w, 409, "this step is not waiting for an answer")
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(rn.WorkspaceID, "run.input", map[string]any{"id": rn.ID})
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}
func (s *Server) runtimeInput(w http.ResponseWriter, r *http.Request) {
	var output json.RawMessage
	if err := s.pool.QueryRow(r.Context(), `select output from run_steps where run_id=$1 and key=$2 and kind='question'`, runOf(r).ID, chi.URLParam(r, "key")).Scan(&output); err != nil {
		httpx.Error(w, 404, "question not found")
		return
	}
	httpx.JSON(w, 200, output)
}
