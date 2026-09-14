package api

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
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
	var sent struct {
		Message Message `json:"message"`
	}
	h.decode(h.do("POST", h.w("/conversations/"+conv.Conversation.ID.String()+"/messages"), map[string]any{
		"body":           "Review the attached proof.",
		"attachment_ids": []string{out.Attachment.ID.String()},
	}, 201), &sent)
	var detail struct {
		Attachments []attachmentRow `json:"attachments"`
	}
	h.decode(h.do("GET", h.w("/conversations/"+conv.Conversation.ID.String()), nil, 200), &detail)
	if len(detail.Attachments) != 1 || detail.Attachments[0].MessageID == nil || *detail.Attachments[0].MessageID != sent.Message.ID {
		t.Fatalf("attachment was not associated with the sent message: %+v", detail.Attachments)
	}
	if _, err := os.Stat(filepath.Join(h.server.cfg.AttachmentDir, out.Attachment.ID.String())); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(3 * time.Second)
	for len(h.box.seen()) == 0 && time.Now().Before(deadline) {
		time.Sleep(20 * time.Millisecond)
	}
	specs := h.box.seen()
	if len(specs) == 0 {
		t.Fatal("message did not queue a sandbox run")
	}
	runPath := "/api/runtime/runs/" + specs[0].RunID
	specRec := runtimeCall(h, "GET", runPath+"/spec", specs[0].RunToken, nil)
	if specRec.Code != 200 {
		t.Fatalf("runtime spec failed: %d %s", specRec.Code, specRec.Body.String())
	}
	var runtimeSpec struct {
		Attachments []attachmentRow `json:"attachments"`
	}
	h.decode(specRec, &runtimeSpec)
	if len(runtimeSpec.Attachments) != 1 || runtimeSpec.Attachments[0].ID != out.Attachment.ID {
		t.Fatalf("runtime did not receive the message attachment metadata: %+v", runtimeSpec.Attachments)
	}
	runtimeDownload := runtimeCall(h, "GET", runPath+"/attachments/"+out.Attachment.ID.String(), specs[0].RunToken, nil)
	if runtimeDownload.Code != 200 || runtimeDownload.Body.String() != "<script>alert('no inline html')</script>" {
		t.Fatalf("runtime attachment download failed: %d %s", runtimeDownload.Code, runtimeDownload.Body.String())
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
