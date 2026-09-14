package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func connectTestGitHub(t *testing.T, h *harness) {
	t.Helper()
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer authorized-test-token" {
			http.Error(w, "denied", 401)
			return
		}
		switch r.URL.Path {
		case "/user":
			w.Write([]byte(`{"login":"test-member","id":1}`))
		case "/repos/arosasg/botinc-v2":
			w.Write([]byte(`{"full_name":"arosasg/botinc-v2","default_branch":"main","permissions":{"push":true}}`))
		default:
			http.Error(w, "not found", 404)
		}
	}))
	t.Cleanup(upstream.Close)
	h.server.githubAPI = upstream.URL
	h.do("POST", h.w("/plugins"), map[string]any{"kind": "github", "secret": "authorized-test-token"}, 201)
}
func TestRepositoryRequiresAuthorizedWorkspaceConnection(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.do("POST", h.w("/repositories"), map[string]any{"full_name": "arosasg/botinc-v2", "installation_id": 123}, 400)
	connectTestGitHub(t, h)
	h.do("POST", h.w("/plugins"), map[string]any{"kind": "github", "secret": "invalid"}, 400)
	h.do("POST", h.w("/repositories"), map[string]any{"full_name": "other/private"}, 400)
	response := h.do("POST", h.w("/repositories"), map[string]any{"full_name": "arosasg/botinc-v2", "installation_id": 123}, 201)
	if strings.Contains(response.Body.String(), "authorized-test-token") || strings.Contains(response.Body.String(), `"installation_id":123`) {
		t.Fatal("credential or unverified installation returned")
	}
	other := newHarness(t)
	other.signIn(uniqueEmail(t))
	other.server.githubAPI = h.server.githubAPI
	other.do("POST", other.w("/repositories"), map[string]any{"full_name": "arosasg/botinc-v2"}, 400)
}
