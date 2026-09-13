package api

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestAttachmentsPersistAndRespectConversationPrivacy(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.server.cfg.AttachmentDir = t.TempDir()
	var conv struct{ Conversation Conversation }
	h.decode(h.do("POST", h.w("/conversations"), map[string]any{"title": "private files"}, 201), &conv)
	body := new(bytes.Buffer)
	form := multipart.NewWriter(body)
	form.WriteField("conversation_id", conv.Conversation.ID.String())
	file, _ := form.CreateFormFile("file", "proof.html")
	io.WriteString(file, "<script>alert('no inline html')</script>")
	form.Close()
	req := httptest.NewRequest("POST", h.w("/attachments"), body)
	req.Header.Set("Content-Type", form.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+h.token)
	rec := httptest.NewRecorder()
	h.router.ServeHTTP(rec, req)
	if rec.Code != 201 {
		t.Fatal(rec.Code, rec.Body.String())
	}
	var out struct{ Attachment attachmentRow }
	h.decode(rec, &out)
	if _, err := os.Stat(filepath.Join(h.server.cfg.AttachmentDir, out.Attachment.ID.String())); err != nil {
		t.Fatal(err)
	}
	downloaded := h.do("GET", out.Attachment.URL, nil, 200)
	if downloaded.Header().Get("Content-Disposition") != "attachment; filename=proof.html" {
		t.Fatal("active content served inline")
	}
	if downloaded.Body.String() != "<script>alert('no inline html')</script>" {
		t.Fatal("bytes changed")
	}
	other := newHarness(t)
	other.signIn(uniqueEmail(t))
	other.server.cfg.AttachmentDir = h.server.cfg.AttachmentDir
	other.do("GET", other.w("/attachments/"+out.Attachment.ID.String()), nil, 404)
	if _, err := testPool.Exec(t.Context(), `insert into members(workspace_id,user_id,role) select id,$2,'member' from workspaces where slug=$1`, h.ws, other.userID); err != nil {
		t.Fatal(err)
	}
	other.do("GET", out.Attachment.URL, nil, 404)
	h.do("PATCH", h.w("/conversations/"+conv.Conversation.ID.String()), map[string]any{"shared": true}, 200)
	other.do("GET", out.Attachment.URL, nil, 200)
}
