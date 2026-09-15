package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"

	"github.com/arosasg/botinc-v2/server/internal/auth"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
)

const mcpProtocolVersion = "2025-11-25"

type mcpTokenPrincipal struct {
	Principal auth.Principal
	Scope     Scope
	Scopes    []string
}

func (p mcpTokenPrincipal) has(scope string) bool {
	for _, candidate := range p.Scopes {
		if candidate == scope || scope == "read" && candidate == "write" {
			return true
		}
	}
	return false
}

func (s *Server) resolveMCPToken(ctx context.Context, token string) (mcpTokenPrincipal, error) {
	var out mcpTokenPrincipal
	var scopesRaw []byte
	err := s.pool.QueryRow(ctx, `select u.id,u.email,u.name,u.avatar_url,u.created_at,t.workspace_id,w.slug,m.role,t.scopes
		from oauth_tokens t join users u on u.id=t.user_id join workspaces w on w.id=t.workspace_id
		join members m on m.workspace_id=t.workspace_id and m.user_id=t.user_id
		where t.access_hash=$1 and t.resource=$2 and t.revoked_at is null and t.expires_at>now()`, oauthHash(token), s.mcpResource()).
		Scan(&out.Principal.User.ID, &out.Principal.User.Email, &out.Principal.User.Name, &out.Principal.User.AvatarURL, &out.Principal.User.CreatedAt,
			&out.Scope.WorkspaceID, &out.Scope.Slug, &out.Scope.Role, &scopesRaw)
	if errors.Is(err, pgx.ErrNoRows) {
		return out, errors.New("invalid or expired MCP access token")
	}
	if err != nil {
		return out, err
	}
	out.Scope.UserID = out.Principal.User.ID
	if err := json.Unmarshal(scopesRaw, &out.Scopes); err != nil {
		return out, err
	}
	_, _ = s.pool.Exec(ctx, `update oauth_tokens set last_used_at=now() where access_hash=$1 and (last_used_at is null or last_used_at<now()-interval '5 minutes')`, oauthHash(token))
	return out, nil
}

type mcpRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
}

type mcpResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Result  any             `json:"result,omitempty"`
	Error   *mcpRPCError    `json:"error,omitempty"`
}

type mcpRPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func (s *Server) mcpEndpoint(w http.ResponseWriter, r *http.Request) {
	if origin := r.Header.Get("Origin"); origin != "" && origin != s.cfg.FrontendOrigin {
		httpx.Error(w, http.StatusForbidden, "origin is not allowed")
		return
	}
	token := ""
	if authorization := r.Header.Get("Authorization"); strings.HasPrefix(strings.ToLower(authorization), "bearer ") {
		token = strings.TrimSpace(authorization[7:])
	}
	if !strings.HasPrefix(token, "bim_") {
		s.mcpUnauthorized(w)
		return
	}
	principal, err := s.resolveMCPToken(r.Context(), token)
	if err != nil {
		s.mcpUnauthorized(w)
		return
	}
	if r.Method == http.MethodGet {
		w.Header().Set("Allow", "POST")
		httpx.Error(w, http.StatusMethodNotAllowed, "this stateless MCP server does not open an SSE stream")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
	var request mcpRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		s.writeMCPError(w, nil, -32700, "Parse error", nil)
		return
	}
	if request.JSONRPC != "2.0" || request.Method == "" {
		s.writeMCPError(w, request.ID, -32600, "Invalid Request", nil)
		return
	}
	if len(request.ID) == 0 {
		w.WriteHeader(http.StatusAccepted)
		return
	}
	w.Header().Set("MCP-Protocol-Version", mcpProtocolVersion)
	switch request.Method {
	case "initialize":
		s.writeMCPResult(w, request.ID, map[string]any{
			"protocolVersion": mcpProtocolVersion,
			"capabilities":    map[string]any{"tools": map[string]bool{"listChanged": false}},
			"serverInfo":      map[string]string{"name": "BotInc", "version": "2"},
			"instructions":    "Use these tools only inside the BotInc workspace the user authorized.",
		})
	case "ping":
		s.writeMCPResult(w, request.ID, map[string]any{})
	case "tools/list":
		if !principal.has("read") {
			s.writeMCPError(w, request.ID, -32001, "Insufficient scope", map[string]string{"required": "read"})
			return
		}
		s.writeMCPResult(w, request.ID, map[string]any{"tools": mcpTools(principal.has("write"))})
	case "tools/call":
		s.mcpCall(w, r, request, principal)
	default:
		s.writeMCPError(w, request.ID, -32601, "Method not found", nil)
	}
}

func (s *Server) mcpUnauthorized(w http.ResponseWriter) {
	metadata := strings.TrimRight(s.cfg.PublicAPIURL, "/") + "/.well-known/oauth-protected-resource"
	w.Header().Set("WWW-Authenticate", `Bearer resource_metadata="`+metadata+`", scope="read write"`)
	httpx.Error(w, http.StatusUnauthorized, "MCP authorization is required")
}

func (s *Server) writeMCPResult(w http.ResponseWriter, id json.RawMessage, result any) {
	w.Header().Set("Content-Type", "application/json")
	httpx.JSON(w, http.StatusOK, mcpResponse{JSONRPC: "2.0", ID: id, Result: result})
}

func (s *Server) writeMCPError(w http.ResponseWriter, id json.RawMessage, code int, message string, data any) {
	w.Header().Set("Content-Type", "application/json")
	httpx.JSON(w, http.StatusOK, mcpResponse{JSONRPC: "2.0", ID: id, Error: &mcpRPCError{Code: code, Message: message, Data: data}})
}

func objectSchema(properties map[string]any, required ...string) map[string]any {
	schema := map[string]any{"type": "object", "properties": properties, "additionalProperties": false}
	if len(required) > 0 {
		schema["required"] = required
	}
	return schema
}

func mcpTools(canWrite bool) []map[string]any {
	stringField := func(description string) map[string]any {
		return map[string]any{"type": "string", "description": description}
	}
	tools := []map[string]any{
		{"name": "get_workspace", "description": "Get the authorized BotInc workspace and the caller's role.", "inputSchema": objectSchema(map[string]any{})},
		{"name": "list_issues", "description": "List issues in the authorized BotInc workspace.", "inputSchema": objectSchema(map[string]any{"status": stringField("Optional comma-separated status filter."), "limit": map[string]any{"type": "integer", "minimum": 1, "maximum": 100}})},
		{"name": "get_issue", "description": "Get an issue, its comments, and recorded runs by UUID or human identifier.", "inputSchema": objectSchema(map[string]any{"id": stringField("Issue UUID or identifier such as BOT-1340.")}, "id")},
		{"name": "list_conversations", "description": "List visible conversations in the authorized BotInc workspace.", "inputSchema": objectSchema(map[string]any{})},
		{"name": "get_conversation", "description": "Get a visible conversation with messages and runs.", "inputSchema": objectSchema(map[string]any{"id": stringField("Conversation UUID.")}, "id")},
	}
	if !canWrite {
		return tools
	}
	return append(tools,
		map[string]any{"name": "create_issue", "description": "Create an issue in the authorized BotInc workspace. Set start=true only when the user explicitly wants work to begin.", "inputSchema": objectSchema(map[string]any{"title": stringField("Issue title."), "description": stringField("Issue context."), "priority": stringField("urgent, high, normal, or low."), "start": map[string]any{"type": "boolean", "description": "Start the issue workflow immediately."}}, "title")},
		map[string]any{"name": "add_issue_comment", "description": "Add a user-authored comment to an issue.", "inputSchema": objectSchema(map[string]any{"id": stringField("Issue UUID or identifier."), "body": stringField("Comment text.")}, "id", "body")},
		map[string]any{"name": "create_conversation", "description": "Create a private conversation. Supplying message starts a model run.", "inputSchema": objectSchema(map[string]any{"title": stringField("Conversation title."), "model": stringField("Model name or auto."), "message": stringField("Optional first message, which starts a run."), "effort": stringField("Optional reasoning effort.")})},
		map[string]any{"name": "send_message", "description": "Send a message to a conversation and start its next model run.", "inputSchema": objectSchema(map[string]any{"id": stringField("Conversation UUID."), "body": stringField("Message text."), "effort": stringField("Optional reasoning effort.")}, "id", "body")},
	)
}

type mcpToolCall struct {
	Name      string         `json:"name"`
	Arguments map[string]any `json:"arguments"`
}

func (s *Server) mcpCall(w http.ResponseWriter, r *http.Request, request mcpRequest, principal mcpTokenPrincipal) {
	var call mcpToolCall
	if err := json.Unmarshal(request.Params, &call); err != nil || call.Name == "" {
		s.writeMCPError(w, request.ID, -32602, "Invalid params", nil)
		return
	}
	writeTools := map[string]bool{"create_issue": true, "add_issue_comment": true, "create_conversation": true, "send_message": true}
	if writeTools[call.Name] && !principal.has("write") {
		s.writeMCPError(w, request.ID, -32001, "Insufficient scope", map[string]string{"required": "write"})
		return
	}
	if !writeTools[call.Name] && !principal.has("read") {
		s.writeMCPError(w, request.ID, -32001, "Insufficient scope", map[string]string{"required": "read"})
		return
	}
	var result any
	var status int
	switch call.Name {
	case "get_workspace":
		status, result = s.invokeMCPHandler(r.Context(), principal, s.getWorkspace, http.MethodGet, "/api/w/"+principal.Scope.Slug, nil, nil)
	case "list_issues":
		query := url.Values{}
		if value, ok := call.Arguments["status"].(string); ok && value != "" {
			query.Set("status", value)
		}
		if value, ok := call.Arguments["limit"].(float64); ok {
			if value < 1 || value > 100 || value != float64(int(value)) {
				s.writeMCPError(w, request.ID, -32602, "limit must be an integer from 1 to 100", nil)
				return
			}
			query.Set("limit", strconv.Itoa(int(value)))
		}
		path := "/api/w/" + principal.Scope.Slug + "/issues"
		if len(query) > 0 {
			path += "?" + query.Encode()
		}
		status, result = s.invokeMCPHandler(r.Context(), principal, s.listIssues, http.MethodGet, path, nil, nil)
	case "get_issue":
		id, ok := requiredMCPString(call.Arguments, "id")
		if !ok {
			s.writeMCPError(w, request.ID, -32602, "id is required", nil)
			return
		}
		status, result = s.invokeMCPHandler(r.Context(), principal, s.getIssue, http.MethodGet, "/api/w/"+principal.Scope.Slug+"/issues/"+url.PathEscape(id), nil, map[string]string{"id": id})
	case "list_conversations":
		status, result = s.invokeMCPHandler(r.Context(), principal, s.listConversations, http.MethodGet, "/api/w/"+principal.Scope.Slug+"/conversations", nil, nil)
	case "get_conversation":
		id, ok := requiredMCPString(call.Arguments, "id")
		if !ok {
			s.writeMCPError(w, request.ID, -32602, "id is required", nil)
			return
		}
		status, result = s.invokeMCPHandler(r.Context(), principal, s.getConversation, http.MethodGet, "/api/w/"+principal.Scope.Slug+"/conversations/"+url.PathEscape(id), nil, map[string]string{"id": id})
	case "create_issue":
		status, result = s.invokeMCPHandler(r.Context(), principal, s.createIssue, http.MethodPost, "/api/w/"+principal.Scope.Slug+"/issues", call.Arguments, nil)
	case "add_issue_comment":
		id, ok := requiredMCPString(call.Arguments, "id")
		if !ok {
			s.writeMCPError(w, request.ID, -32602, "id is required", nil)
			return
		}
		status, result = s.invokeMCPHandler(r.Context(), principal, s.addComment, http.MethodPost, "/api/w/"+principal.Scope.Slug+"/issues/"+url.PathEscape(id)+"/comments", map[string]any{"body": call.Arguments["body"]}, map[string]string{"id": id})
	case "create_conversation":
		status, result = s.invokeMCPHandler(r.Context(), principal, s.createConversation, http.MethodPost, "/api/w/"+principal.Scope.Slug+"/conversations", call.Arguments, nil)
	case "send_message":
		id, ok := requiredMCPString(call.Arguments, "id")
		if !ok {
			s.writeMCPError(w, request.ID, -32602, "id is required", nil)
			return
		}
		status, result = s.invokeMCPHandler(r.Context(), principal, s.sendMessage, http.MethodPost, "/api/w/"+principal.Scope.Slug+"/conversations/"+url.PathEscape(id)+"/messages", map[string]any{"body": call.Arguments["body"], "effort": call.Arguments["effort"]}, map[string]string{"id": id})
	default:
		s.writeMCPError(w, request.ID, -32602, "Unknown tool", map[string]string{"name": call.Name})
		return
	}
	payload, _ := json.MarshalIndent(result, "", "  ")
	s.writeMCPResult(w, request.ID, map[string]any{
		"content":           []map[string]string{{"type": "text", "text": string(payload)}},
		"structuredContent": result,
		"isError":           status >= 400,
	})
}

func requiredMCPString(arguments map[string]any, key string) (string, bool) {
	value, ok := arguments[key].(string)
	value = strings.TrimSpace(value)
	return value, ok && value != ""
}

func (s *Server) invokeMCPHandler(ctx context.Context, principal mcpTokenPrincipal, handler http.HandlerFunc, method, path string, body any, params map[string]string) (int, any) {
	var reader io.Reader
	if body != nil {
		raw, _ := json.Marshal(body)
		reader = bytes.NewReader(raw)
	}
	request := httptest.NewRequestWithContext(ctx, method, path, reader)
	request.Header.Set("Content-Type", "application/json")
	routeContext := chi.NewRouteContext()
	for key, value := range params {
		routeContext.URLParams.Add(key, value)
	}
	ctx = context.WithValue(request.Context(), chi.RouteCtxKey, routeContext)
	ctx = context.WithValue(ctx, scopeKey, principal.Scope)
	ctx = auth.WithPrincipal(ctx, &principal.Principal)
	request = request.WithContext(ctx)
	recorder := httptest.NewRecorder()
	handler(recorder, request)
	var result any
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		result = map[string]string{"error": strings.TrimSpace(recorder.Body.String())}
	}
	return recorder.Code, result
}
