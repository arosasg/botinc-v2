package api

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func doMCPRequest(t *testing.T, h *harness, method, path, bearer, contentType, body string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	if bearer != "" {
		request.Header.Set("Authorization", "Bearer "+bearer)
	}
	if contentType != "" {
		request.Header.Set("Content-Type", contentType)
	}
	recorder := httptest.NewRecorder()
	h.router.ServeHTTP(recorder, request)
	return recorder
}

func decodeObject(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode %q: %v", recorder.Body.String(), err)
	}
	return out
}

func TestMCPOAuthAuthorizationAndTools(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	resource := "http://api.test/api/mcp"

	unauthorized := doMCPRequest(t, h, http.MethodPost, "/api/mcp", "", "application/json", `{"jsonrpc":"2.0","id":1,"method":"initialize"}`)
	if unauthorized.Code != http.StatusUnauthorized || !strings.Contains(unauthorized.Header().Get("WWW-Authenticate"), "/.well-known/oauth-protected-resource") {
		t.Fatalf("MCP challenge: status=%d header=%q body=%s", unauthorized.Code, unauthorized.Header().Get("WWW-Authenticate"), unauthorized.Body.String())
	}

	metadata := h.do(http.MethodGet, "/.well-known/oauth-protected-resource", nil, http.StatusOK)
	if !strings.Contains(metadata.Body.String(), resource) {
		t.Fatalf("protected resource metadata did not advertise %s: %s", resource, metadata.Body.String())
	}

	registration := doMCPRequest(t, h, http.MethodPost, "/oauth/register", "", "application/json", `{"client_name":"Codex test","redirect_uris":["http://127.0.0.1:43119/callback"],"grant_types":["authorization_code","refresh_token"],"response_types":["code"],"token_endpoint_auth_method":"none","scope":"read write","client_uri":"https://developers.openai.com/codex"}`)
	if registration.Code != http.StatusCreated {
		t.Fatalf("register: %d %s", registration.Code, registration.Body.String())
	}
	clientID, _ := decodeObject(t, registration)["client_id"].(string)
	if !strings.HasPrefix(clientID, "bic_") {
		t.Fatalf("unexpected client id %q", clientID)
	}

	verifier := strings.Repeat("v", 64)
	digest := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(digest[:])
	authorize := url.Values{
		"client_id":             {clientID},
		"redirect_uri":          {"http://127.0.0.1:43119/callback"},
		"response_type":         {"code"},
		"state":                 {"state-123"},
		"scope":                 {"read write"},
		"resource":              {resource},
		"code_challenge":        {challenge},
		"code_challenge_method": {"S256"},
	}
	consent := doMCPRequest(t, h, http.MethodGet, "/oauth/authorize?"+authorize.Encode(), h.token, "", "")
	if consent.Code != http.StatusOK || !strings.Contains(consent.Body.String(), "Connect Codex test") || !strings.Contains(consent.Body.String(), h.ws) {
		t.Fatalf("consent: %d %s", consent.Code, consent.Body.String())
	}

	var workspaceID string
	if err := testPool.QueryRow(t.Context(), `select id from workspaces where slug=$1`, h.ws).Scan(&workspaceID); err != nil {
		t.Fatal(err)
	}
	authorize.Set("workspace_id", workspaceID)
	authorize.Set("decision", "allow")
	approved := doMCPRequest(t, h, http.MethodPost, "/oauth/authorize", h.token, "application/x-www-form-urlencoded", authorize.Encode())
	if approved.Code != http.StatusFound {
		t.Fatalf("approve: %d %s", approved.Code, approved.Body.String())
	}
	redirect, err := url.Parse(approved.Header().Get("Location"))
	if err != nil || redirect.Query().Get("state") != "state-123" || redirect.Query().Get("code") == "" {
		t.Fatalf("bad authorization redirect: %q", approved.Header().Get("Location"))
	}

	tokenForm := url.Values{
		"grant_type":    {"authorization_code"},
		"client_id":     {clientID},
		"code":          {redirect.Query().Get("code")},
		"redirect_uri":  {"http://127.0.0.1:43119/callback"},
		"code_verifier": {verifier},
		"resource":      {resource},
	}
	tokenResponse := doMCPRequest(t, h, http.MethodPost, "/oauth/token", "", "application/x-www-form-urlencoded", tokenForm.Encode())
	if tokenResponse.Code != http.StatusOK {
		t.Fatalf("token: %d %s", tokenResponse.Code, tokenResponse.Body.String())
	}
	tokens := decodeObject(t, tokenResponse)
	access, _ := tokens["access_token"].(string)
	refresh, _ := tokens["refresh_token"].(string)
	if !strings.HasPrefix(access, "bim_") || !strings.HasPrefix(refresh, "bir_") {
		t.Fatalf("unexpected token response: %+v", tokens)
	}

	initialize := doMCPRequest(t, h, http.MethodPost, "/api/mcp", access, "application/json", `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}`)
	if initialize.Code != http.StatusOK || !strings.Contains(initialize.Body.String(), `"protocolVersion":"2025-11-25"`) {
		t.Fatalf("initialize: %d %s", initialize.Code, initialize.Body.String())
	}

	tools := doMCPRequest(t, h, http.MethodPost, "/api/mcp", access, "application/json", `{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}`)
	if tools.Code != http.StatusOK || !strings.Contains(tools.Body.String(), `"create_issue"`) || !strings.Contains(tools.Body.String(), `"send_message"`) {
		t.Fatalf("tools/list: %d %s", tools.Code, tools.Body.String())
	}

	create := doMCPRequest(t, h, http.MethodPost, "/api/mcp", access, "application/json", `{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"create_issue","arguments":{"title":"Created through MCP","description":"OAuth-scoped write","priority":"high"}}}`)
	if create.Code != http.StatusOK || !strings.Contains(create.Body.String(), "Created through MCP") || strings.Contains(create.Body.String(), `"isError":true`) {
		t.Fatalf("tools/call: %d %s", create.Code, create.Body.String())
	}

	refreshForm := url.Values{"grant_type": {"refresh_token"}, "client_id": {clientID}, "refresh_token": {refresh}, "resource": {resource}}
	refreshed := doMCPRequest(t, h, http.MethodPost, "/oauth/token", "", "application/x-www-form-urlencoded", refreshForm.Encode())
	if refreshed.Code != http.StatusOK {
		t.Fatalf("refresh: %d %s", refreshed.Code, refreshed.Body.String())
	}
	newAccess, _ := decodeObject(t, refreshed)["access_token"].(string)
	if newAccess == access || !strings.HasPrefix(newAccess, "bim_") {
		t.Fatalf("access token was not rotated")
	}
	oldAccess := doMCPRequest(t, h, http.MethodPost, "/api/mcp", access, "application/json", `{"jsonrpc":"2.0","id":4,"method":"ping"}`)
	if oldAccess.Code != http.StatusUnauthorized {
		t.Fatalf("rotated access token remained valid: %d %s", oldAccess.Code, oldAccess.Body.String())
	}
	ping := doMCPRequest(t, h, http.MethodPost, "/api/mcp", newAccess, "application/json", `{"jsonrpc":"2.0","id":5,"method":"ping"}`)
	if ping.Code != http.StatusOK {
		t.Fatalf("refreshed access token failed: %d %s", ping.Code, ping.Body.String())
	}
}

func TestMCPRejectsUnsafeRedirectAndMissingPKCE(t *testing.T) {
	h := newHarness(t)
	unsafe := doMCPRequest(t, h, http.MethodPost, "/oauth/register", "", "application/json", `{"client_name":"Unsafe","redirect_uris":["http://attacker.example/callback"]}`)
	if unsafe.Code != http.StatusBadRequest || !strings.Contains(unsafe.Body.String(), "invalid_redirect_uri") {
		t.Fatalf("unsafe redirect accepted: %d %s", unsafe.Code, unsafe.Body.String())
	}

	registration := doMCPRequest(t, h, http.MethodPost, "/oauth/register", "", "application/json", `{"client_name":"Safe","redirect_uris":["http://localhost:43119/callback"]}`)
	clientID, _ := decodeObject(t, registration)["client_id"].(string)
	h.signIn(uniqueEmail(t))
	query := url.Values{"client_id": {clientID}, "redirect_uri": {"http://localhost:43119/callback"}, "response_type": {"code"}, "resource": {"http://api.test/api/mcp"}}
	authorize := doMCPRequest(t, h, http.MethodGet, "/oauth/authorize?"+query.Encode(), h.token, "", "")
	if authorize.Code != http.StatusBadRequest || !strings.Contains(authorize.Body.String(), "PKCE") {
		t.Fatalf("missing PKCE accepted: %d %s", authorize.Code, authorize.Body.String())
	}
}

func TestMCPReadOnlyToolsExcludeWrites(t *testing.T) {
	encoded, err := json.Marshal(mcpTools(false))
	if err != nil {
		t.Fatal(err)
	}
	tools := string(encoded)
	for _, name := range []string{"get_workspace", "list_issues", "get_issue", "list_conversations", "get_conversation"} {
		if !strings.Contains(tools, `"name":"`+name+`"`) {
			t.Fatalf("read tool %s is missing: %s", name, tools)
		}
	}
	for _, name := range []string{"create_issue", "add_issue_comment", "create_conversation", "send_message"} {
		if strings.Contains(tools, `"name":"`+name+`"`) {
			t.Fatalf("write tool %s leaked into read-only scope: %s", name, tools)
		}
	}
}
