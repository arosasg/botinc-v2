package api

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/arosasg/botinc-v2/server/internal/auth"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
)

func (s *Server) emailStart(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if err := s.auth.StartEmail(r.Context(), in.Email); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	httpx.JSON(w, 200, map[string]any{"sent": true, "dev_code": s.cfg.DevLoginCode != "" && !s.cfg.Production()})
}

func (s *Server) emailVerify(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	u, err := s.auth.VerifyEmail(r.Context(), in.Email, in.Code)
	if err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	s.finishSignIn(w, r, u)
}

// finishSignIn creates the session and, for a first login, a personal workspace.
func (s *Server) finishSignIn(w http.ResponseWriter, r *http.Request, u auth.User) {
	token, err := s.auth.CreateSession(r.Context(), w, r, u)
	if err != nil {
		s.fail(w, err)
		return
	}
	ws, err := s.ensureWorkspace(r.Context(), u)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]any{"user": u, "token": token, "workspace": ws})
}

func (s *Server) ensureWorkspace(ctx context.Context, u auth.User) (Workspace, error) {
	var ws Workspace
	err := s.pool.QueryRow(ctx, `select `+workspaceCols+` from workspaces w join members m on m.workspace_id=w.id where m.user_id=$1 order by w.created_at limit 1`, u.ID).Scan(ws.scan()...)
	if err == nil {
		return ws, nil
	}
	name := strings.Split(u.Email, "@")[0]
	if u.Name != "" {
		name = u.Name
	}
	return s.createWorkspaceFor(ctx, u.ID, name+"'s workspace")
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	if p != nil {
		s.auth.ClearSession(r.Context(), w, p.SessionID)
	} else {
		s.auth.ClearSession(r.Context(), w, uuid.Nil)
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	httpx.JSON(w, 200, map[string]any{"user": p.User, "via": map[string]bool{"api_key": p.APIKeyID != uuid.Nil}})
}

func (s *Server) updateMe(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	var in struct {
		Name      *string `json:"name"`
		AvatarURL *string `json:"avatar_url"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if _, err := s.pool.Exec(r.Context(), `update users set name=coalesce($2,name), avatar_url=coalesce($3,avatar_url) where id=$1`, p.User.ID, in.Name, in.AvatarURL); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

type sessionRow struct {
	ID         uuid.UUID  `json:"id"`
	UserAgent  string     `json:"user_agent"`
	IP         string     `json:"ip"`
	Location   string     `json:"location"`
	CreatedAt  time.Time  `json:"created_at"`
	LastSeenAt time.Time  `json:"last_seen_at"`
	Current    bool       `json:"current"`
	RevokedAt  *time.Time `json:"revoked_at"`
}

func (s *Server) listSessions(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	rows, err := s.pool.Query(r.Context(), `select id, user_agent, ip, location, created_at, last_seen_at, revoked_at from sessions where user_id=$1 and revoked_at is null and expires_at>now() order by last_seen_at desc`, p.User.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []sessionRow{}
	for rows.Next() {
		var sr sessionRow
		if err := rows.Scan(&sr.ID, &sr.UserAgent, &sr.IP, &sr.Location, &sr.CreatedAt, &sr.LastSeenAt, &sr.RevokedAt); err != nil {
			s.fail(w, err)
			return
		}
		sr.Current = sr.ID == p.SessionID
		out = append(out, sr)
	}
	httpx.JSON(w, 200, map[string]any{"sessions": out})
}

func (s *Server) revokeSession(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		httpx.Error(w, 400, "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `update sessions set revoked_at=now() where id=$1 and user_id=$2`, id, p.User.ID); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

type keyRow struct {
	ID         uuid.UUID  `json:"id"`
	Name       string     `json:"name"`
	Prefix     string     `json:"prefix"`
	Scopes     []string   `json:"scopes"`
	CreatedAt  time.Time  `json:"created_at"`
	LastUsedAt *time.Time `json:"last_used_at"`
}

func (s *Server) listKeys(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	rows, err := s.pool.Query(r.Context(), `select id, name, prefix, scopes, created_at, last_used_at from api_keys where user_id=$1 and revoked_at is null order by created_at desc`, p.User.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer rows.Close()
	out := []keyRow{}
	for rows.Next() {
		var k keyRow
		var scopes []byte
		if err := rows.Scan(&k.ID, &k.Name, &k.Prefix, &scopes, &k.CreatedAt, &k.LastUsedAt); err != nil {
			s.fail(w, err)
			return
		}
		_ = json.Unmarshal(scopes, &k.Scopes)
		out = append(out, k)
	}
	httpx.JSON(w, 200, map[string]any{"keys": out})
}

func (s *Server) createKey(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	var in struct {
		Name string `json:"name"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if strings.TrimSpace(in.Name) == "" {
		in.Name = "API key"
	}
	token, err := s.auth.CreateAPIKey(r.Context(), p.User.ID, uuid.Nil, in.Name)
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 201, map[string]any{"token": token, "prefix": token[:12], "name": in.Name})
}

func (s *Server) revokeKey(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	id, ok := idParam(r, "id")
	if !ok {
		httpx.Error(w, 400, "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `update api_keys set revoked_at=now() where id=$1 and user_id=$2`, id, p.User.ID); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

// --- device code (CLI) ---

func (s *Server) deviceStart(w http.ResponseWriter, r *http.Request) {
	d, err := s.auth.StartDevice(r.Context())
	if err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 200, map[string]any{"device_code": d.DeviceCode, "user_code": d.UserCode, "expires_in": d.ExpiresIn, "interval": d.Interval,
		"verification_url": strings.TrimRight(s.cfg.FrontendOrigin, "/") + "/device?code=" + url.QueryEscape(d.UserCode)})
}

func (s *Server) devicePoll(w http.ResponseWriter, r *http.Request) {
	var in struct {
		DeviceCode string `json:"device_code"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	token, pending, err := s.auth.PollDevice(r.Context(), in.DeviceCode)
	if err != nil {
		httpx.ErrorCode(w, 400, "expired", err.Error())
		return
	}
	if pending {
		httpx.JSON(w, 200, map[string]any{"pending": true})
		return
	}
	httpx.JSON(w, 200, map[string]any{"token": token})
}

func (s *Server) deviceApprove(w http.ResponseWriter, r *http.Request) {
	p := auth.FromContext(r.Context())
	var in struct {
		UserCode string `json:"user_code"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if err := s.auth.ApproveDevice(r.Context(), in.UserCode, p.User.ID); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}

// --- Google OAuth (only when configured) ---

func (s *Server) googleStart(w http.ResponseWriter, r *http.Request) {
	if s.cfg.GoogleClientID == "" {
		httpx.Error(w, 404, "Google sign-in is not configured")
		return
	}
	raw := make([]byte, 16)
	_, _ = rand.Read(raw)
	state := base64.RawURLEncoding.EncodeToString(raw)
	http.SetCookie(w, &http.Cookie{Name: "botinc_oauth_state", Value: state, Path: "/api/auth/google", HttpOnly: true, Secure: s.cfg.Production(), SameSite: http.SameSiteLaxMode, MaxAge: 600})
	q := url.Values{
		"client_id":     {s.cfg.GoogleClientID},
		"redirect_uri":  {s.cfg.GoogleRedirectURI},
		"response_type": {"code"},
		"scope":         {"openid email profile"},
		"state":         {state},
		"prompt":        {"select_account"},
	}
	http.Redirect(w, r, "https://accounts.google.com/o/oauth2/v2/auth?"+q.Encode(), http.StatusFound)
}

func (s *Server) googleCallback(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("botinc_oauth_state")
	if err != nil || c.Value == "" || c.Value != r.URL.Query().Get("state") {
		httpx.Error(w, 400, "sign-in state mismatch; try again")
		return
	}
	code := r.URL.Query().Get("code")
	if code == "" {
		httpx.Error(w, 400, "missing code")
		return
	}
	form := url.Values{"code": {code}, "client_id": {s.cfg.GoogleClientID}, "client_secret": {s.cfg.GoogleClientSecret}, "redirect_uri": {s.cfg.GoogleRedirectURI}, "grant_type": {"authorization_code"}}
	res, err := http.PostForm("https://oauth2.googleapis.com/token", form)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer res.Body.Close()
	var tok struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(res.Body).Decode(&tok); err != nil || tok.AccessToken == "" {
		httpx.Error(w, 400, "Google did not return a token")
		return
	}
	req, _ := http.NewRequestWithContext(r.Context(), http.MethodGet, "https://www.googleapis.com/oauth2/v3/userinfo", nil)
	req.Header.Set("Authorization", "Bearer "+tok.AccessToken)
	ures, err := http.DefaultClient.Do(req)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer ures.Body.Close()
	var info struct {
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}
	if err := json.NewDecoder(ures.Body).Decode(&info); err != nil || !info.EmailVerified {
		httpx.Error(w, 400, "Google account email is not verified")
		return
	}
	u, err := s.auth.UpsertOAuthUser(r.Context(), info.Email, info.Name, info.Picture)
	if err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if _, err := s.auth.CreateSession(r.Context(), w, r, u); err != nil {
		s.fail(w, err)
		return
	}
	if _, err := s.ensureWorkspace(r.Context(), u); err != nil {
		s.fail(w, err)
		return
	}
	http.Redirect(w, r, strings.TrimRight(s.cfg.FrontendOrigin, "/")+"/w", http.StatusFound)
}

var errForbidden = errors.New("forbidden")
