package api

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/google/uuid"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type attachmentRow struct {
	ID             uuid.UUID  `json:"id"`
	IssueID        *uuid.UUID `json:"issue_id"`
	ConversationID *uuid.UUID `json:"conversation_id"`
	CommentID      *uuid.UUID `json:"comment_id"`
	Filename       string     `json:"filename"`
	ContentType    string     `json:"content_type"`
	Size           int64      `json:"size_bytes"`
	URL            string     `json:"url"`
}

func (s *Server) uploadAttachment(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if s.cfg.AttachmentDir == "" {
		httpx.Error(w, 503, "attachment storage is not configured")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 65<<20)
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		httpx.Error(w, 400, "invalid upload or file exceeds 64 MB")
		return
	}
	defer r.MultipartForm.RemoveAll()
	issueText, convText := r.FormValue("issue_id"), r.FormValue("conversation_id")
	if (issueText == "") == (convText == "") {
		httpx.Error(w, 400, "choose one issue or conversation")
		return
	}
	a := attachmentRow{ID: uuid.New()}
	var allowed bool
	if issueText != "" {
		id, err := uuid.Parse(issueText)
		if err != nil {
			httpx.Error(w, 400, "invalid issue")
			return
		}
		a.IssueID = &id
		_ = s.pool.QueryRow(r.Context(), `select exists(select 1 from issues where id=$1 and workspace_id=$2)`, id, sc.WorkspaceID).Scan(&allowed)
	} else {
		id, err := uuid.Parse(convText)
		if err != nil {
			httpx.Error(w, 400, "invalid conversation")
			return
		}
		a.ConversationID = &id
		_ = s.pool.QueryRow(r.Context(), `select exists(select 1 from conversations where id=$1 and workspace_id=$2 and archived_at is null and (shared or user_id=$3))`, id, sc.WorkspaceID, sc.UserID).Scan(&allowed)
	}
	if !allowed {
		httpx.Error(w, 404, "upload destination not found")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		httpx.Error(w, 400, "file is required")
		return
	}
	defer file.Close()
	a.Filename = filepath.Base(strings.ReplaceAll(header.Filename, "\\", "/"))
	if a.Filename == "." || len(a.Filename) > 255 {
		httpx.Error(w, 400, "invalid filename")
		return
	}
	if err := os.MkdirAll(s.cfg.AttachmentDir, 0o700); err != nil {
		s.fail(w, err)
		return
	}
	path := filepath.Join(s.cfg.AttachmentDir, a.ID.String())
	out, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		s.fail(w, err)
		return
	}
	keep := false
	defer func() {
		out.Close()
		if !keep {
			os.Remove(path)
		}
	}()
	h := sha256.New()
	size, err := io.Copy(io.MultiWriter(out, h), io.LimitReader(file, (64<<20)+1))
	if err != nil || size > 64<<20 {
		httpx.Error(w, 400, "file exceeds 64 MB or could not be read")
		return
	}
	if err := out.Close(); err != nil {
		s.fail(w, err)
		return
	}
	a.Size = size
	a.ContentType = header.Header.Get("Content-Type")
	a.URL = fmt.Sprintf("/api/w/%s/attachments/%s", sc.Slug, a.ID)
	if _, err := s.pool.Exec(r.Context(), `insert into attachments(id,workspace_id,issue_id,conversation_id,filename,content_type,size_bytes,sha256,created_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`, a.ID, sc.WorkspaceID, a.IssueID, a.ConversationID, a.Filename, a.ContentType, size, hex.EncodeToString(h.Sum(nil)), sc.UserID); err != nil {
		s.fail(w, err)
		return
	}
	keep = true
	httpx.JSON(w, 201, map[string]any{"attachment": a})
}
func (s *Server) downloadAttachment(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		httpx.Error(w, 404, "attachment not found")
		return
	}
	var name string
	err := s.pool.QueryRow(r.Context(), `select filename from attachments a where a.id=$1 and a.workspace_id=$2 and (a.conversation_id is null or exists(select 1 from conversations c where c.id=a.conversation_id and (c.shared or c.user_id=$3)))`, id, sc.WorkspaceID, sc.UserID).Scan(&name)
	if err != nil {
		httpx.Error(w, 404, "attachment not found")
		return
	}
	f, err := os.Open(filepath.Join(s.cfg.AttachmentDir, id.String()))
	if err != nil {
		httpx.Error(w, 404, "attachment file is unavailable")
		return
	}
	defer f.Close()
	stat, err := f.Stat()
	if err != nil {
		s.fail(w, err)
		return
	}
	prefix := make([]byte, 512)
	n, _ := f.Read(prefix)
	f.Seek(0, 0)
	kind := http.DetectContentType(prefix[:n])
	disposition := "attachment"
	if kind == "image/png" || kind == "image/jpeg" || kind == "image/gif" || kind == "image/webp" {
		disposition = "inline"
	}
	w.Header().Set("Content-Type", kind)
	w.Header().Set("Content-Disposition", mime.FormatMediaType(disposition, map[string]string{"filename": name}))
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Security-Policy", "sandbox; default-src 'none'")
	w.Header().Set("Cache-Control", "private, no-store")
	http.ServeContent(w, r, name, stat.ModTime(), f)
}

func (s *Server) listAttachments(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	issue, conversation := r.URL.Query().Get("issue"), r.URL.Query().Get("conversation")
	if (issue == "") == (conversation == "") {
		httpx.Error(w, 400, "choose one issue or conversation")
		return
	}
	value := issue
	column := "issue_id"
	if conversation != "" {
		value = conversation
		column = "conversation_id"
	}
	id, err := uuid.Parse(value)
	if err != nil {
		httpx.Error(w, 400, "invalid attachment destination")
		return
	}
	rows, err := s.pool.Query(r.Context(), `select a.id,a.issue_id,a.conversation_id,a.comment_id,a.filename,a.content_type,a.size_bytes from attachments a where a.workspace_id=$1 and a.`+column+`=$2 and (a.conversation_id is null or exists(select 1 from conversations c where c.id=a.conversation_id and (c.shared or c.user_id=$3))) order by a.created_at,a.id`, sc.WorkspaceID, id, sc.UserID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []attachmentRow{}
	for rows.Next() {
		var a attachmentRow
		if err := rows.Scan(&a.ID, &a.IssueID, &a.ConversationID, &a.CommentID, &a.Filename, &a.ContentType, &a.Size); err != nil {
			s.fail(w, err)
			return
		}
		a.URL = fmt.Sprintf("/api/w/%s/attachments/%s", sc.Slug, a.ID)
		out = append(out, a)
	}
	if err := rows.Err(); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]any{"attachments": out})
}
