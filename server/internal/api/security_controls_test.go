package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
)

func TestAPIKeyDefaultsAndRevocation(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	session := h.token
	var created struct{ Token string }
	h.decode(h.do("POST", "/api/me/keys", map[string]any{"name": "Readonly"}, 201), &created)
	var keys struct{ Keys []keyRow }
	h.decode(h.do("GET", "/api/me/keys", nil, 200), &keys)
	if len(keys.Keys) != 1 || len(keys.Keys[0].Scopes) != 1 || keys.Keys[0].Scopes[0] != "read" {
		t.Fatal("key is not read-only")
	}
	id := keys.Keys[0].ID.String()
	h.token = created.Token
	h.do("POST", h.w("/issues"), map[string]any{"title": "Denied"}, 403)
	h.do("PATCH", "/api/me/keys/"+id, map[string]any{"scopes": []string{"read", "write"}}, 403)
	h.token = session
	h.do("PATCH", "/api/me/keys/"+id, map[string]any{"scopes": []string{"read", "write"}}, 200)
	h.token = created.Token
	h.do("POST", h.w("/issues"), map[string]any{"title": "Allowed"}, 201)
	h.token = session
	h.do("DELETE", "/api/me/keys/"+id, nil, 200)
	h.token = created.Token
	h.do("GET", h.w("/issues"), nil, 401)
}
func TestGitHubSignInStateAndPKCE(t *testing.T) {
	h := newHarness(t)
	h.server.cfg.GitHubOAuthClientID = "test-id"
	h.server.cfg.GitHubOAuthClientSecret = "test-secret"
	rec := httptest.NewRecorder()
	h.router.ServeHTTP(rec, httptest.NewRequest("GET", "/api/auth/github/start", nil))
	if rec.Code != 302 {
		t.Fatal(rec.Body.String())
	}
	location, err := url.Parse(rec.Header().Get("Location"))
	if err != nil {
		t.Fatal(err)
	}
	q := location.Query()
	if q.Get("code_challenge_method") != "S256" || len(q.Get("code_challenge")) != 43 || q.Get("state") == "" {
		t.Fatal("missing PKCE/state")
	}
	if strings.Contains(rec.Header().Get("Location"), "test-secret") {
		t.Fatal("client secret in browser redirect")
	}
	request := httptest.NewRequest("GET", "/api/auth/github/callback?state=wrong&code=bad", nil)
	for _, cookie := range rec.Result().Cookies() {
		if !cookie.HttpOnly {
			t.Fatal("readable OAuth cookie")
		}
		request.AddCookie(cookie)
	}
	response := httptest.NewRecorder()
	h.router.ServeHTTP(response, request)
	if response.Code != 400 {
		t.Fatal("mismatched state accepted")
	}
}
func TestWorkflowConcurrentVersions(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var initial struct{ Workflow Workflow }
	h.decode(h.do("POST", h.w("/workflows"), map[string]any{"name": "Concurrent workflow"}, 201), &initial)
	graph := `{"nodes":[{"key":"start","kind":"start"},{"key":"finish","kind":"finish"}],"edges":[["start","finish"]]}`
	body, _ := json.Marshal(map[string]any{"graph": json.RawMessage(graph), "activate": true})
	var wg sync.WaitGroup
	var success atomic.Int32
	for range 8 {
		wg.Go(func() {
			r := httptest.NewRequest(http.MethodPost, h.w("/workflows/"+initial.Workflow.ID.String()+"/versions"), strings.NewReader(string(body)))
			r.Header.Set("Authorization", "Bearer "+h.token)
			r.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			h.router.ServeHTTP(w, r)
			if w.Code == 201 {
				success.Add(1)
			}
		})
	}
	wg.Wait()
	if success.Load() != 8 {
		t.Fatalf("only %d versions saved", success.Load())
	}
	var active int
	if err := testPool.QueryRow(t.Context(), `select count(*) from workflow_versions where workflow_id=$1 and status='active'`, initial.Workflow.ID).Scan(&active); err != nil {
		t.Fatal(err)
	}
	if active != 1 {
		t.Fatalf("%d active versions", active)
	}
}
