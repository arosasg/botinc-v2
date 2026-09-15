package api

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"html/template"
	"io"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/arosasg/botinc-v2/server/internal/auth"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
)

const (
	mcpAccessTTL  = time.Hour
	mcpRefreshTTL = 30 * 24 * time.Hour
	mcpCodeTTL    = 10 * time.Minute
)

func randomOAuthToken(prefix string) string {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		panic(err)
	}
	return prefix + base64.RawURLEncoding.EncodeToString(raw)
}

func oauthHash(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

func (s *Server) mcpResource() string {
	return strings.TrimRight(s.cfg.PublicAPIURL, "/") + "/api/mcp"
}

func (s *Server) isMCPResource(raw string) bool {
	resource, err := url.Parse(raw)
	if err != nil || !resource.IsAbs() || resource.User != nil || resource.Fragment != "" || resource.RawQuery != "" {
		return false
	}
	expected, err := url.Parse(s.mcpResource())
	if err != nil {
		return false
	}
	return strings.EqualFold(resource.Scheme, expected.Scheme) &&
		strings.EqualFold(resource.Host, expected.Host) &&
		strings.TrimRight(resource.EscapedPath(), "/") == strings.TrimRight(expected.EscapedPath(), "/")
}

func (s *Server) mcpAuthorizationServer() string {
	return strings.TrimRight(s.cfg.PublicAPIURL, "/")
}

func (s *Server) mcpProtectedResourceMetadata(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, map[string]any{
		"resource":                 s.mcpResource(),
		"authorization_servers":    []string{s.mcpAuthorizationServer()},
		"scopes_supported":         []string{"read", "write"},
		"bearer_methods_supported": []string{"header"},
	})
}

func (s *Server) mcpAuthorizationServerMetadata(w http.ResponseWriter, _ *http.Request) {
	base := s.mcpAuthorizationServer()
	httpx.JSON(w, http.StatusOK, map[string]any{
		"issuer":                                base,
		"authorization_endpoint":                base + "/oauth/authorize",
		"token_endpoint":                        base + "/oauth/token",
		"registration_endpoint":                 base + "/oauth/register",
		"response_types_supported":              []string{"code"},
		"grant_types_supported":                 []string{"authorization_code", "refresh_token"},
		"code_challenge_methods_supported":      []string{"S256"},
		"token_endpoint_auth_methods_supported": []string{"none"},
		"scopes_supported":                      []string{"read", "write"},
	})
}

type mcpClientRegistration struct {
	ClientName              string   `json:"client_name"`
	RedirectURIs            []string `json:"redirect_uris"`
	GrantTypes              []string `json:"grant_types"`
	ResponseTypes           []string `json:"response_types"`
	TokenEndpointAuthMethod string   `json:"token_endpoint_auth_method"`
}

func validOAuthRedirect(raw string) bool {
	u, err := url.Parse(raw)
	if err != nil || !u.IsAbs() || u.User != nil || u.Fragment != "" {
		return false
	}
	if u.Scheme == "https" {
		return u.Hostname() != ""
	}
	if u.Scheme != "http" {
		return false
	}
	host := strings.ToLower(u.Hostname())
	return host == "localhost" || host == "127.0.0.1" || host == "::1"
}

func onlyOAuthValues(values []string, required string, allowed ...string) bool {
	if len(values) == 0 {
		return true
	}
	seen := map[string]bool{}
	for _, value := range values {
		if seen[value] || !slices.Contains(allowed, value) {
			return false
		}
		seen[value] = true
	}
	return seen[required]
}

func (s *Server) mcpRegisterClient(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	var in mcpClientRegistration
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&in); err != nil {
		oauthError(w, http.StatusBadRequest, "invalid_client_metadata", err.Error())
		return
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		oauthError(w, http.StatusBadRequest, "invalid_client_metadata", "request body must contain one JSON object")
		return
	}
	in.ClientName = strings.TrimSpace(in.ClientName)
	if in.ClientName == "" || len(in.ClientName) > 120 || len(in.RedirectURIs) == 0 || len(in.RedirectURIs) > 10 {
		oauthError(w, http.StatusBadRequest, "invalid_client_metadata", "client_name and redirect_uris are required")
		return
	}
	for _, redirect := range in.RedirectURIs {
		if !validOAuthRedirect(redirect) {
			oauthError(w, http.StatusBadRequest, "invalid_redirect_uri", "redirect URIs must use HTTPS or loopback HTTP")
			return
		}
	}
	if !onlyOAuthValues(in.GrantTypes, "authorization_code", "authorization_code", "refresh_token") {
		oauthError(w, http.StatusBadRequest, "invalid_client_metadata", "only authorization_code and refresh_token grants are supported")
		return
	}
	if !onlyOAuthValues(in.ResponseTypes, "code", "code") {
		oauthError(w, http.StatusBadRequest, "invalid_client_metadata", "only the code response type is supported")
		return
	}
	if in.TokenEndpointAuthMethod != "" && in.TokenEndpointAuthMethod != "none" {
		oauthError(w, http.StatusBadRequest, "invalid_client_metadata", "public clients must use token_endpoint_auth_method none")
		return
	}
	clientID := randomOAuthToken("bic_")
	redirects, _ := json.Marshal(in.RedirectURIs)
	if _, err := s.pool.Exec(r.Context(), `insert into oauth_clients(id,name,redirect_uris) values($1,$2,$3)`, clientID, in.ClientName, redirects); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]any{
		"client_id": clientID, "client_name": in.ClientName, "redirect_uris": in.RedirectURIs,
		"grant_types": []string{"authorization_code", "refresh_token"}, "response_types": []string{"code"},
		"token_endpoint_auth_method": "none",
	})
}

type mcpAuthorizationRequest struct {
	ClientID      string
	ClientName    string
	RedirectURI   string
	State         string
	Scope         string
	Scopes        []string
	Resource      string
	CodeChallenge string
	WorkspaceID   string
}

func parseMCPScope(raw string) ([]string, error) {
	if strings.TrimSpace(raw) == "" {
		return []string{"read"}, nil
	}
	seen := map[string]bool{}
	out := []string{}
	for _, scope := range strings.Fields(raw) {
		if scope != "read" && scope != "write" {
			return nil, errors.New("unsupported scope " + scope)
		}
		if !seen[scope] {
			seen[scope] = true
			out = append(out, scope)
		}
	}
	return out, nil
}

func (s *Server) readMCPAuthorizationRequest(ctx context.Context, values url.Values) (mcpAuthorizationRequest, error) {
	request := mcpAuthorizationRequest{
		ClientID: values.Get("client_id"), RedirectURI: values.Get("redirect_uri"), State: values.Get("state"),
		Scope: values.Get("scope"), Resource: values.Get("resource"), CodeChallenge: values.Get("code_challenge"),
		WorkspaceID: values.Get("workspace_id"),
	}
	if values.Get("response_type") != "code" {
		return request, errors.New("response_type must be code")
	}
	if values.Get("code_challenge_method") != "S256" || len(request.CodeChallenge) < 43 || len(request.CodeChallenge) > 128 {
		return request, errors.New("PKCE with code_challenge_method S256 is required")
	}
	if !s.isMCPResource(request.Resource) {
		return request, errors.New("resource must identify this MCP server")
	}
	request.Resource = s.mcpResource()
	var redirectsRaw []byte
	if err := s.pool.QueryRow(ctx, `select name,redirect_uris from oauth_clients where id=$1`, request.ClientID).Scan(&request.ClientName, &redirectsRaw); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return request, errors.New("unknown client_id")
		}
		return request, err
	}
	var redirects []string
	if err := json.Unmarshal(redirectsRaw, &redirects); err != nil || !slices.Contains(redirects, request.RedirectURI) {
		return request, errors.New("redirect_uri is not registered for this client")
	}
	var err error
	request.Scopes, err = parseMCPScope(request.Scope)
	if err != nil {
		return request, err
	}
	request.Scope = strings.Join(request.Scopes, " ")
	return request, nil
}

type consentWorkspace struct {
	ID   string
	Name string
	Role string
}

var mcpConsentTemplate = template.Must(template.New("mcp-consent").Parse(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Authorize {{.Request.ClientName}} - BotInc</title><style>
:root{color-scheme:light dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#f6f6f3;color:#171717}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background-image:radial-gradient(#d7d7d2 1px,transparent 1px);background-size:20px 20px}.card{width:min(480px,100%);background:#fff;border:1px solid #d8d8d3;border-radius:18px;padding:28px;box-shadow:0 24px 70px rgba(0,0,0,.10)}.brand{display:flex;gap:10px;align-items:center;font-weight:700;margin-bottom:28px}.mark{width:26px;height:26px;border-radius:8px;background:#171717;color:#fff;display:grid;place-items:center}h1{font-size:24px;line-height:1.2;margin:0 0 10px}p{color:#666;line-height:1.5;margin:0 0 22px}.scope{border:1px solid #e2e2de;border-radius:12px;padding:14px;margin:16px 0;font-size:14px}.scope b{display:block;margin-bottom:4px}.scope span{color:#666}label{display:block;font-size:13px;font-weight:600;margin:18px 0 7px}select{width:100%;height:44px;border:1px solid #ccc;border-radius:10px;background:transparent;padding:0 12px;font:inherit}.actions{display:flex;gap:10px;margin-top:24px}.actions button{height:44px;border-radius:10px;padding:0 18px;font:600 14px inherit;cursor:pointer}.allow{flex:1;border:0;background:#171717;color:#fff}.deny{border:1px solid #ccc;background:transparent;color:#333}@media(prefers-color-scheme:dark){:root{background:#10110f;color:#f4f4f0}.card{background:#191a18;border-color:#30312e}.mark{background:#f4f4f0;color:#171717}p,.scope span{color:#aaa}.scope,select{border-color:#3b3c38}.deny{color:#eee;border-color:#444}}
</style></head><body><main class="card"><div class="brand"><span class="mark">B</span>BotInc</div><h1>Connect {{.Request.ClientName}}</h1><p>This MCP client is asking to use BotInc on your behalf.</p><div class="scope"><b>{{.ScopeTitle}}</b><span>{{.ScopeCopy}}</span></div><form method="post" action="/oauth/authorize">
<input type="hidden" name="client_id" value="{{.Request.ClientID}}"><input type="hidden" name="redirect_uri" value="{{.Request.RedirectURI}}"><input type="hidden" name="response_type" value="code"><input type="hidden" name="state" value="{{.Request.State}}"><input type="hidden" name="scope" value="{{.Request.Scope}}"><input type="hidden" name="resource" value="{{.Request.Resource}}"><input type="hidden" name="code_challenge" value="{{.Request.CodeChallenge}}"><input type="hidden" name="code_challenge_method" value="S256">
<label for="workspace_id">Workspace</label><select id="workspace_id" name="workspace_id" required>{{range .Workspaces}}<option value="{{.ID}}">{{.Name}} ({{.Role}})</option>{{end}}</select><div class="actions"><button class="deny" name="decision" value="deny">Cancel</button><button class="allow" name="decision" value="allow">Authorize</button></div></form></main></body></html>`))

func (s *Server) mcpAuthorize(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err != nil {
			oauthError(w, http.StatusBadRequest, "invalid_request", "could not parse authorization request")
			return
		}
	}
	principal := auth.FromContext(r.Context())
	if principal == nil || principal.SessionID == uuid.Nil {
		returnTo := r.URL.RequestURI()
		if r.Method == http.MethodPost {
			returnTo = "/oauth/authorize?" + r.Form.Encode()
		}
		target := strings.TrimRight(s.cfg.FrontendOrigin, "/") + "/?returnTo=" + url.QueryEscape(returnTo)
		http.Redirect(w, r, target, http.StatusFound)
		return
	}
	if err := r.ParseForm(); err != nil {
		oauthError(w, http.StatusBadRequest, "invalid_request", "could not parse authorization request")
		return
	}
	request, err := s.readMCPAuthorizationRequest(r.Context(), r.Form)
	if err != nil {
		oauthError(w, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}
	if r.Method == http.MethodPost {
		redirect, _ := url.Parse(request.RedirectURI)
		query := redirect.Query()
		if r.Form.Get("decision") != "allow" {
			query.Set("error", "access_denied")
			query.Set("error_description", "The user declined access.")
			if request.State != "" {
				query.Set("state", request.State)
			}
			redirect.RawQuery = query.Encode()
			http.Redirect(w, r, redirect.String(), http.StatusFound)
			return
		}
		workspaceID, parseErr := uuid.Parse(request.WorkspaceID)
		if parseErr != nil {
			oauthError(w, http.StatusBadRequest, "invalid_request", "choose a workspace")
			return
		}
		var member bool
		if err := s.pool.QueryRow(r.Context(), `select exists(select 1 from members where workspace_id=$1 and user_id=$2)`, workspaceID, principal.User.ID).Scan(&member); err != nil || !member {
			oauthError(w, http.StatusForbidden, "access_denied", "you are not a member of that workspace")
			return
		}
		code := randomOAuthToken("bio_")
		scopes, _ := json.Marshal(request.Scopes)
		if _, err := s.pool.Exec(r.Context(), `insert into oauth_authorization_codes(code_hash,client_id,user_id,workspace_id,redirect_uri,code_challenge,resource,scopes,expires_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`, oauthHash(code), request.ClientID, principal.User.ID, workspaceID, request.RedirectURI, request.CodeChallenge, request.Resource, scopes, time.Now().Add(mcpCodeTTL)); err != nil {
			s.fail(w, err)
			return
		}
		query.Set("code", code)
		if request.State != "" {
			query.Set("state", request.State)
		}
		redirect.RawQuery = query.Encode()
		w.Header().Set("Cache-Control", "no-store")
		http.Redirect(w, r, redirect.String(), http.StatusFound)
		return
	}
	rows, err := s.pool.Query(r.Context(), `select w.id,w.name,m.role from workspaces w join members m on m.workspace_id=w.id where m.user_id=$1 order by w.created_at`, principal.User.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	workspaces := []consentWorkspace{}
	for rows.Next() {
		var workspace consentWorkspace
		if err := rows.Scan(&workspace.ID, &workspace.Name, &workspace.Role); err != nil {
			s.fail(w, err)
			return
		}
		workspaces = append(workspaces, workspace)
	}
	if len(workspaces) == 0 {
		oauthError(w, http.StatusForbidden, "access_denied", "this account has no workspace")
		return
	}
	scopeTitle := "Read BotInc workspace data"
	scopeCopy := "View workspaces, issues and conversations."
	if slices.Contains(request.Scopes, "write") {
		scopeTitle = "Read and change BotInc workspace data"
		scopeCopy = "View workspaces, issues and conversations, create work, and send messages."
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if err := mcpConsentTemplate.Execute(w, map[string]any{"Request": request, "Workspaces": workspaces, "ScopeTitle": scopeTitle, "ScopeCopy": scopeCopy}); err != nil {
		s.log.Error("render MCP consent", "err", err)
	}
}

func (s *Server) mcpToken(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	if err := r.ParseForm(); err != nil {
		oauthError(w, http.StatusBadRequest, "invalid_request", "could not parse token request")
		return
	}
	if !s.isMCPResource(r.Form.Get("resource")) {
		oauthError(w, http.StatusBadRequest, "invalid_target", "resource must identify this MCP server")
		return
	}
	r.Form.Set("resource", s.mcpResource())
	switch r.Form.Get("grant_type") {
	case "authorization_code":
		s.exchangeMCPAuthorizationCode(w, r)
	case "refresh_token":
		s.refreshMCPToken(w, r)
	default:
		oauthError(w, http.StatusBadRequest, "unsupported_grant_type", "supported grants are authorization_code and refresh_token")
	}
}

func (s *Server) exchangeMCPAuthorizationCode(w http.ResponseWriter, r *http.Request) {
	tx, err := s.pool.Begin(r.Context())
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var clientID, redirectURI, challenge, resource string
	var userID, workspaceID uuid.UUID
	var scopesRaw []byte
	err = tx.QueryRow(r.Context(), `select client_id,user_id,workspace_id,redirect_uri,code_challenge,resource,scopes from oauth_authorization_codes where code_hash=$1 and used_at is null and expires_at>now() for update`, oauthHash(r.Form.Get("code"))).Scan(&clientID, &userID, &workspaceID, &redirectURI, &challenge, &resource, &scopesRaw)
	if errors.Is(err, pgx.ErrNoRows) {
		oauthError(w, http.StatusBadRequest, "invalid_grant", "authorization code is invalid or expired")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	verifier := r.Form.Get("code_verifier")
	verifierHash := sha256.Sum256([]byte(verifier))
	if clientID != r.Form.Get("client_id") || redirectURI != r.Form.Get("redirect_uri") || resource != r.Form.Get("resource") || challenge != base64.RawURLEncoding.EncodeToString(verifierHash[:]) {
		oauthError(w, http.StatusBadRequest, "invalid_grant", "authorization code binding or PKCE verification failed")
		return
	}
	if _, err := tx.Exec(r.Context(), `update oauth_authorization_codes set used_at=now() where code_hash=$1`, oauthHash(r.Form.Get("code"))); err != nil {
		s.fail(w, err)
		return
	}
	access, refresh := randomOAuthToken("bim_"), randomOAuthToken("bir_")
	if _, err := tx.Exec(r.Context(), `insert into oauth_tokens(access_hash,refresh_hash,client_id,user_id,workspace_id,resource,scopes,expires_at,refresh_expires_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`, oauthHash(access), oauthHash(refresh), clientID, userID, workspaceID, resource, scopesRaw, time.Now().Add(mcpAccessTTL), time.Now().Add(mcpRefreshTTL)); err != nil {
		s.fail(w, err)
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		s.fail(w, err)
		return
	}
	s.writeMCPToken(w, access, refresh, scopesRaw)
}

func (s *Server) refreshMCPToken(w http.ResponseWriter, r *http.Request) {
	tx, err := s.pool.Begin(r.Context())
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id uuid.UUID
	var scopesRaw []byte
	err = tx.QueryRow(r.Context(), `select id,scopes from oauth_tokens where refresh_hash=$1 and client_id=$2 and resource=$3 and revoked_at is null and refresh_expires_at>now() for update`, oauthHash(r.Form.Get("refresh_token")), r.Form.Get("client_id"), r.Form.Get("resource")).Scan(&id, &scopesRaw)
	if errors.Is(err, pgx.ErrNoRows) {
		oauthError(w, http.StatusBadRequest, "invalid_grant", "refresh token is invalid or expired")
		return
	}
	if err != nil {
		s.fail(w, err)
		return
	}
	access, refresh := randomOAuthToken("bim_"), randomOAuthToken("bir_")
	if _, err := tx.Exec(r.Context(), `update oauth_tokens set access_hash=$2,refresh_hash=$3,expires_at=$4,refresh_expires_at=$5,last_used_at=now() where id=$1`, id, oauthHash(access), oauthHash(refresh), time.Now().Add(mcpAccessTTL), time.Now().Add(mcpRefreshTTL)); err != nil {
		s.fail(w, err)
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		s.fail(w, err)
		return
	}
	s.writeMCPToken(w, access, refresh, scopesRaw)
}

func (s *Server) writeMCPToken(w http.ResponseWriter, access, refresh string, scopesRaw []byte) {
	var scopes []string
	_ = json.Unmarshal(scopesRaw, &scopes)
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")
	httpx.JSON(w, http.StatusOK, map[string]any{"access_token": access, "token_type": "Bearer", "expires_in": int(mcpAccessTTL.Seconds()), "refresh_token": refresh, "scope": strings.Join(scopes, " ")})
}

func oauthError(w http.ResponseWriter, status int, code, description string) {
	w.Header().Set("Cache-Control", "no-store")
	httpx.JSON(w, status, map[string]string{"error": code, "error_description": description})
}
