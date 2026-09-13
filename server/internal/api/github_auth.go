package api

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func oauthNonce() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(b)
}
func (s *Server) githubStart(w http.ResponseWriter, r *http.Request) {
	if s.cfg.GitHubOAuthClientID == "" || s.cfg.GitHubOAuthClientSecret == "" {
		httpx.Error(w, 503, "GitHub sign-in is not configured")
		return
	}
	state, verifier := oauthNonce(), oauthNonce()
	challenge := sha256.Sum256([]byte(verifier))
	for name, value := range map[string]string{"state": state, "verifier": verifier} {
		http.SetCookie(w, &http.Cookie{Name: "botinc_github_" + name, Value: value, Path: "/api/auth/github", HttpOnly: true, Secure: s.cfg.Production(), SameSite: http.SameSiteLaxMode, MaxAge: 600})
	}
	q := url.Values{"client_id": {s.cfg.GitHubOAuthClientID}, "redirect_uri": {s.githubRedirect()}, "scope": {"read:user user:email"}, "state": {state}, "code_challenge": {base64.RawURLEncoding.EncodeToString(challenge[:])}, "code_challenge_method": {"S256"}}
	http.Redirect(w, r, "https://github.com/login/oauth/authorize?"+q.Encode(), http.StatusFound)
}
func (s *Server) githubRedirect() string {
	return strings.TrimRight(s.cfg.PublicAPIURL, "/") + "/api/auth/github/callback"
}
func (s *Server) githubCallback(w http.ResponseWriter, r *http.Request) {
	state, err := r.Cookie("botinc_github_state")
	if err != nil || state.Value == "" || state.Value != r.URL.Query().Get("state") {
		httpx.Error(w, 400, "sign-in state mismatch; try again")
		return
	}
	verifier, err := r.Cookie("botinc_github_verifier")
	if err != nil || verifier.Value == "" {
		httpx.Error(w, 400, "sign-in expired; try again")
		return
	}
	for _, name := range []string{"state", "verifier"} {
		http.SetCookie(w, &http.Cookie{Name: "botinc_github_" + name, Path: "/api/auth/github", MaxAge: -1, HttpOnly: true, Secure: s.cfg.Production(), SameSite: http.SameSiteLaxMode})
	}
	code := r.URL.Query().Get("code")
	if code == "" {
		httpx.Error(w, 400, "GitHub sign-in was not completed")
		return
	}
	form := url.Values{"client_id": {s.cfg.GitHubOAuthClientID}, "client_secret": {s.cfg.GitHubOAuthClientSecret}, "code": {code}, "redirect_uri": {s.githubRedirect()}, "code_verifier": {verifier.Value}}
	req, err := http.NewRequestWithContext(r.Context(), "POST", "https://github.com/login/oauth/access_token", strings.NewReader(form.Encode()))
	if err != nil {
		s.fail(w, err)
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	var tok struct {
		AccessToken string `json:"access_token"`
	}
	if err := oauthJSON(req, &tok); err != nil || tok.AccessToken == "" {
		httpx.Error(w, 400, "GitHub did not authorize sign-in")
		return
	}
	get := func(path string, out any) error {
		req, err := http.NewRequestWithContext(r.Context(), "GET", "https://api.github.com"+path, nil)
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", "Bearer "+tok.AccessToken)
		return oauthJSON(req, out)
	}
	var info struct {
		Name   string `json:"name"`
		Login  string `json:"login"`
		Avatar string `json:"avatar_url"`
	}
	if err := get("/user", &info); err != nil {
		httpx.Error(w, 502, "GitHub identity could not be read")
		return
	}
	var emails []struct {
		Email    string `json:"email"`
		Verified bool   `json:"verified"`
		Primary  bool   `json:"primary"`
	}
	if err := get("/user/emails", &emails); err != nil {
		httpx.Error(w, 502, "GitHub email could not be verified")
		return
	}
	email := ""
	for _, e := range emails {
		if e.Verified && (email == "" || e.Primary) {
			email = e.Email
			if e.Primary {
				break
			}
		}
	}
	if email == "" {
		httpx.Error(w, 400, "GitHub account needs a verified email")
		return
	}
	if info.Name == "" {
		info.Name = info.Login
	}
	u, err := s.auth.UpsertOAuthUser(r.Context(), email, info.Name, info.Avatar)
	if err != nil {
		s.fail(w, err)
		return
	}
	if _, err := s.ensureWorkspace(r.Context(), u); err != nil {
		s.fail(w, err)
		return
	}
	if _, err := s.auth.CreateSession(r.Context(), w, r, u); err != nil {
		s.fail(w, err)
		return
	}
	http.Redirect(w, r, strings.TrimRight(s.cfg.FrontendOrigin, "/")+"/w", http.StatusFound)
}
func oauthJSON(req *http.Request, out any) error {
	req.Header.Set("Accept", "application/json")
	client := &http.Client{Timeout: 20 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("identity provider returned %d", res.StatusCode)
	}
	return json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(out)
}
