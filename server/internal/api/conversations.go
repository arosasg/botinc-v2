package api

import (
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

type Conversation struct {
	ID         uuid.UUID  `json:"id"`
	UserID     *uuid.UUID `json:"user_id"`
	IssueID    *uuid.UUID `json:"issue_id"`
	Title      string     `json:"title"`
	Model      string     `json:"model"`
	Shared     bool       `json:"shared"`
	ForkedFrom *uuid.UUID `json:"forked_from"`
	ArchivedAt *time.Time `json:"archived_at"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	LastRun    *runs.Run  `json:"last_run,omitempty"`
}

const convCols = `id, user_id, issue_id, title, model, shared, forked_from, archived_at, created_at, updated_at`

func (c *Conversation) scan() []any {
	return []any{&c.ID, &c.UserID, &c.IssueID, &c.Title, &c.Model, &c.Shared, &c.ForkedFrom, &c.ArchivedAt, &c.CreatedAt, &c.UpdatedAt}
}

type Message struct {
	ID             uuid.UUID       `json:"id"`
	ConversationID uuid.UUID       `json:"conversation_id"`
	Seq            int64           `json:"seq"`
	Role           string          `json:"role"`
	AuthorUserID   *uuid.UUID      `json:"author_user_id"`
	Body           string          `json:"body"`
	Meta           json.RawMessage `json:"meta"`
	RunID          *uuid.UUID      `json:"run_id"`
	CreatedAt      time.Time       `json:"created_at"`
}

const msgCols = `id, conversation_id, seq, role, author_user_id, body, meta, run_id, created_at`

func (m *Message) scan() []any {
	return []any{&m.ID, &m.ConversationID, &m.Seq, &m.Role, &m.AuthorUserID, &m.Body, &m.Meta, &m.RunID, &m.CreatedAt}
}

func (s *Server) listConversations(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	rows, err := s.pool.Query(r.Context(), `select `+convCols+` from conversations where workspace_id=$1 and (user_id=$2 or shared) and archived_at is null order by updated_at desc limit 200`, sc.WorkspaceID, sc.UserID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []Conversation{}
	for rows.Next() {
		var c Conversation
		if err := rows.Scan(c.scan()...); err != nil {
			s.fail(w, err)
			return
		}
		out = append(out, c)
	}
	httpx.JSON(w, 200, map[string]any{"conversations": out})
}

func (s *Server) createConversation(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	var in struct {
		Title         string      `json:"title"`
		Model         string      `json:"model"`
		IssueID       *uuid.UUID  `json:"issue_id"`
		Message       string      `json:"message"`
		AttachmentIDs []uuid.UUID `json:"attachment_ids"`
		PluginIDs     []uuid.UUID `json:"plugin_ids"`
		Effort        string      `json:"effort"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if !s.referencesAllowed(w, r, map[string]*uuid.UUID{"issue": in.IssueID}) {
		return
	}
	if in.Model == "" {
		in.Model = "auto"
	}
	if in.Title == "" && in.Message != "" {
		in.Title = titleFrom(in.Message)
	}
	var c Conversation
	if err := s.pool.QueryRow(r.Context(), `insert into conversations (workspace_id, user_id, issue_id, title, model) values ($1,$2,$3,$4,$5) returning `+convCols, sc.WorkspaceID, sc.UserID, in.IssueID, in.Title, in.Model).Scan(c.scan()...); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "conversation.created", c)
	var first *Message
	var run *runs.Run
	if strings.TrimSpace(in.Message) != "" {
		m, rn, err := s.postMessage(r, c, in.Message, in.AttachmentIDs, in.PluginIDs, in.Effort)
		if err != nil {
			s.fail(w, err)
			return
		}
		first, run = &m, rn
	}
	httpx.JSON(w, 201, map[string]any{"conversation": c, "message": first, "run": run})
}

func titleFrom(msg string) string {
	t := strings.TrimSpace(strings.Split(strings.TrimSpace(msg), "\n")[0])
	if len(t) > 72 {
		t = t[:72]
		if i := strings.LastIndex(t, " "); i > 30 {
			t = t[:i]
		}
	}
	return t
}

func (s *Server) loadConversation(r *http.Request) (Conversation, bool, error) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		return Conversation{}, false, nil
	}
	var c Conversation
	err := s.pool.QueryRow(r.Context(), `select `+convCols+` from conversations where id=$1 and workspace_id=$2 and (user_id=$3 or shared)`, id, sc.WorkspaceID, sc.UserID).Scan(c.scan()...)
	if errors.Is(err, pgx.ErrNoRows) {
		return Conversation{}, false, nil
	}
	return c, err == nil, err
}

func (s *Server) getConversation(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	c, found, err := s.loadConversation(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "conversation not found")
		return
	}
	rows, err := s.pool.Query(r.Context(), `select `+msgCols+` from messages where conversation_id=$1 order by seq`, c.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	msgs := []Message{}
	for rows.Next() {
		var m Message
		if err := rows.Scan(m.scan()...); err != nil {
			s.fail(w, err)
			return
		}
		msgs = append(msgs, m)
	}
	rrows, err := s.pool.Query(r.Context(), `select `+runColsPrefixed("")+` from runs where conversation_id=$1 order by queued_at`, c.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rrows.Close()
	rs := []runs.Run{}
	for rrows.Next() {
		rn, err := scanRunRows(rrows)
		if err != nil {
			s.fail(w, err)
			return
		}
		rs = append(rs, rn)
	}
	attachments := []attachmentRow{}
	attRows, err := s.pool.Query(r.Context(), `select id,issue_id,conversation_id,message_id,comment_id,filename,content_type,size_bytes from attachments where conversation_id=$1 order by created_at,id`, c.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer attRows.Close()
	for attRows.Next() {
		var a attachmentRow
		if err := attRows.Scan(&a.ID, &a.IssueID, &a.ConversationID, &a.MessageID, &a.CommentID, &a.Filename, &a.ContentType, &a.Size); err != nil {
			s.fail(w, err)
			return
		}
		a.URL = fmt.Sprintf("/api/w/%s/attachments/%s", sc.Slug, a.ID)
		attachments = append(attachments, a)
	}
	if err := attRows.Err(); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]any{"conversation": c, "messages": msgs, "runs": rs, "attachments": attachments})
}

func (s *Server) updateConversation(w http.ResponseWriter, r *http.Request) {
	c, found, err := s.loadConversation(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "conversation not found")
		return
	}
	var in struct {
		Title    *string `json:"title"`
		Model    *string `json:"model"`
		Shared   *bool   `json:"shared"`
		Archived *bool   `json:"archived"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if _, err := s.pool.Exec(r.Context(), `update conversations set title=coalesce($2,title), model=coalesce($3,model), shared=coalesce($4,shared),
		archived_at=case when $5::bool is null then archived_at when $5 then coalesce(archived_at, now()) else null end, updated_at=now() where id=$1`, c.ID, in.Title, in.Model, in.Shared, in.Archived); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(c.workspace(r), "conversation.updated", map[string]any{"id": c.ID})
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

func (c Conversation) workspace(r *http.Request) uuid.UUID { return scopeOf(r.Context()).WorkspaceID }

// postMessage appends a user message and starts a run to answer it.
func (s *Server) postMessage(r *http.Request, c Conversation, body string, attachmentIDs, pluginIDs []uuid.UUID, effort string) (Message, *runs.Run, error) {
	sc := scopeOf(r.Context())
	ctx := r.Context()
	pluginIDs = uniquePluginIDs(pluginIDs)
	var m Message
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return m, nil, err
	}
	defer tx.Rollback(ctx)
	var archived bool
	if err := tx.QueryRow(ctx, `select archived_at is not null from conversations where id=$1 for update`, c.ID).Scan(&archived); err != nil {
		return m, nil, err
	}
	if archived {
		return m, nil, errors.New("this conversation is archived")
	}
	if err := tx.QueryRow(ctx, `insert into messages(conversation_id,seq,role,author_user_id,body) values($1,(select coalesce(max(seq),0)+1 from messages where conversation_id=$1),'user',$2,$3) returning `+msgCols, c.ID, sc.UserID, body).Scan(m.scan()...); err != nil {
		return m, nil, err
	}
	if len(attachmentIDs) > 0 {
		tag, err := tx.Exec(ctx, `update attachments set message_id=$1 where id=any($2) and workspace_id=$3 and conversation_id=$4 and message_id is null`, m.ID, attachmentIDs, sc.WorkspaceID, c.ID)
		if err != nil {
			return m, nil, err
		}
		if tag.RowsAffected() != int64(len(attachmentIDs)) {
			return m, nil, errors.New("one or more attachments are unavailable")
		}
	}
	if _, err := tx.Exec(ctx, `update conversations set updated_at=now() where id=$1`, c.ID); err != nil {
		return m, nil, err
	}
	var active bool
	if err := tx.QueryRow(ctx, `select exists(select 1 from runs where conversation_id=$1 and finished_at is null)`, c.ID).Scan(&active); err != nil {
		return m, nil, err
	}
	var started *runs.Run
	if active {
		if _, err := tx.Exec(ctx, `insert into message_queue(conversation_id,position,body,plugin_ids,effort) values($1,(select coalesce(max(position),0)+1 from message_queue where conversation_id=$1),$2,$3,$4)`, c.ID, body, pluginIDs, effort); err != nil {
			return m, nil, err
		}
	} else {
		rn, err := s.runs.CreateInTx(ctx, tx, runs.CreateParams{WorkspaceID: sc.WorkspaceID, ConversationID: &c.ID, IssueID: c.IssueID, Purpose: "chat", Model: c.Model, Effort: effort, Prompt: body, CreatedBy: &sc.UserID, PluginIDs: pluginIDs})
		if err != nil {
			return m, nil, err
		}
		started = &rn
		m.RunID = &rn.ID
		if _, err := tx.Exec(ctx, `update messages set run_id=$2 where id=$1`, m.ID, rn.ID); err != nil {
			return m, nil, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return m, nil, err
	}
	s.hub.Publish(sc.WorkspaceID, "message.created", m)
	if started != nil {
		s.runs.Dispatch(ctx, *started)
	}
	return m, started, nil
}

func (s *Server) sendMessage(w http.ResponseWriter, r *http.Request) {
	c, found, err := s.loadConversation(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "conversation not found")
		return
	}
	var in struct {
		Body          string      `json:"body"`
		AttachmentIDs []uuid.UUID `json:"attachment_ids"`
		PluginIDs     []uuid.UUID `json:"plugin_ids"`
		Effort        string      `json:"effort"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if strings.TrimSpace(in.Body) == "" {
		httpx.Error(w, 400, "message is empty")
		return
	}
	m, rn, err := s.postMessage(r, c, in.Body, in.AttachmentIDs, in.PluginIDs, in.Effort)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 201, map[string]any{"message": m, "run": rn})
}

func (s *Server) forkConversation(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	c, found, err := s.loadConversation(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "conversation not found")
		return
	}
	var in struct {
		UpToSeq int64 `json:"up_to_seq"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	var f Conversation
	if err := s.pool.QueryRow(r.Context(), `insert into conversations (workspace_id, user_id, issue_id, title, model, forked_from) values ($1,$2,$3,$4,$5,$6) returning `+convCols, sc.WorkspaceID, sc.UserID, c.IssueID, "Fork · "+c.Title, c.Model, c.ID).Scan(f.scan()...); err != nil {
		s.fail(w, err)
		return
	}
	if _, err := s.pool.Exec(r.Context(), `insert into messages (conversation_id, seq, role, author_user_id, body, meta, created_at) select $2, seq, role, author_user_id, body, meta, created_at from messages where conversation_id=$1 and seq<=$3`, c.ID, f.ID, in.UpToSeq); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(sc.WorkspaceID, "conversation.created", f)
	httpx.JSON(w, 201, map[string]any{"conversation": f})
}

type queueRow struct {
	ID       uuid.UUID `json:"id"`
	Position int       `json:"position"`
	Body     string    `json:"body"`
	Mode     string    `json:"mode"`
}

func (s *Server) listQueue(w http.ResponseWriter, r *http.Request) {
	c, found, err := s.loadConversation(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "conversation not found")
		return
	}
	rows, err := s.pool.Query(r.Context(), `select id, position, body, mode from message_queue where conversation_id=$1 order by position`, c.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []queueRow{}
	for rows.Next() {
		var q queueRow
		_ = rows.Scan(&q.ID, &q.Position, &q.Body, &q.Mode)
		out = append(out, q)
	}
	httpx.JSON(w, 200, map[string]any{"queue": out})
}

func (s *Server) enqueueMessage(w http.ResponseWriter, r *http.Request) {
	c, found, err := s.loadConversation(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "conversation not found")
		return
	}
	var in struct {
		Body      string      `json:"body"`
		Mode      string      `json:"mode"`
		PluginIDs []uuid.UUID `json:"plugin_ids"`
		Effort    string      `json:"effort"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if strings.TrimSpace(in.Body) == "" || (in.Mode != "" && in.Mode != "queue") {
		httpx.Error(w, 400, "a nonempty message and queue mode are required")
		return
	}
	in.Mode = "queue"
	in.PluginIDs = uniquePluginIDs(in.PluginIDs)
	tx, err := s.pool.Begin(r.Context())
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var archived bool
	if err := tx.QueryRow(r.Context(), `select archived_at is not null from conversations where id=$1 for update`, c.ID).Scan(&archived); err != nil {
		s.fail(w, err)
		return
	}
	if archived {
		httpx.Error(w, 409, "conversation is archived")
		return
	}
	var q queueRow
	if err := tx.QueryRow(r.Context(), `insert into message_queue (conversation_id, position, body, mode, plugin_ids, effort) values ($1,(select coalesce(max(position),0)+1 from message_queue where conversation_id=$1),$2,$3,$4,$5) returning id, position, body, mode`, c.ID, in.Body, in.Mode, in.PluginIDs, in.Effort).Scan(&q.ID, &q.Position, &q.Body, &q.Mode); err != nil {
		s.fail(w, err)
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 201, q)
}

func (s *Server) dequeueMessage(w http.ResponseWriter, r *http.Request) {
	c, found, err := s.loadConversation(r)
	if err != nil {
		s.fail(w, err)
		return
	}
	if !found {
		httpx.Error(w, 404, "conversation not found")
		return
	}
	qid, ok := idParam(r, "qid")
	if !ok {
		httpx.Error(w, 400, "bad id")
		return
	}
	_, _ = s.pool.Exec(r.Context(), `delete from message_queue where id=$1 and conversation_id=$2`, qid, c.ID)
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

// drainQueue sends the next queued message once a run finishes.
func (s *Server) drainQueue(r *http.Request, convID uuid.UUID) {
	ctx := r.Context()
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return
	}
	defer tx.Rollback(ctx)
	var c Conversation
	var wsID uuid.UUID
	if err := tx.QueryRow(ctx, `select `+convCols+`,workspace_id from conversations where id=$1 for update`, convID).Scan(append(c.scan(), &wsID)...); err != nil || c.ArchivedAt != nil {
		return
	}
	var active bool
	if err := tx.QueryRow(ctx, `select exists(select 1 from runs where conversation_id=$1 and finished_at is null)`, convID).Scan(&active); err != nil || active {
		return
	}
	var qid uuid.UUID
	var body string
	var pluginIDs []uuid.UUID
	var effort string
	if err := tx.QueryRow(ctx, `select id,body,plugin_ids,effort from message_queue where conversation_id=$1 order by position limit 1`, convID).Scan(&qid, &body, &pluginIDs, &effort); err != nil {
		return
	}
	rn, err := s.runs.CreateInTx(ctx, tx, runs.CreateParams{WorkspaceID: wsID, ConversationID: &c.ID, IssueID: c.IssueID, Purpose: "chat", Model: c.Model, Effort: effort, Prompt: body, CreatedBy: c.UserID, PluginIDs: pluginIDs})
	if err != nil {
		s.log.Error("drain queue retained message", "err", err)
		return
	}
	if _, err := tx.Exec(ctx, `delete from message_queue where id=$1`, qid); err != nil {
		return
	}
	if err := tx.Commit(ctx); err != nil {
		return
	}
	s.runs.Dispatch(ctx, rn)
}
