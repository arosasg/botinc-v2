package api

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"io"
	"net/http"
	"strings"
	"time"
)

// GitHub credentials belong to a workspace connection. Platform app credentials
// are never used to grant access to an arbitrary repository name supplied by a user.
func (s *Server) githubGet(ctx context.Context, token, path string, out any) error {
	base := s.githubAPI
	if base == "" {
		base = "https://api.github.com"
	}
	req, err := http.NewRequestWithContext(ctx, "GET", base+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	client := &http.Client{Timeout: 20 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	res, err := client.Do(req)
	if err != nil {
		return errors.New("GitHub could not be reached")
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return errors.New("GitHub denied access; check the token and repository permissions")
	}
	return json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(out)
}
func (s *Server) githubToken(ctx context.Context, ws uuid.UUID) (string, error) {
	var ref string
	if err := s.pool.QueryRow(ctx, `select secret_ref from plugins where workspace_id=$1 and kind='github' and status='connected'`, ws).Scan(&ref); err != nil {
		return "", errors.New("connect GitHub before adding a repository")
	}
	return s.readSecret(ctx, ref)
}

type githubRepo struct {
	FullName      string `json:"full_name"`
	DefaultBranch string `json:"default_branch"`
	Archived      bool   `json:"archived"`
	Permissions   struct {
		Push bool `json:"push"`
	} `json:"permissions"`
}

func (s *Server) authorizedRepository(ctx context.Context, token, name string) (githubRepo, error) {
	var rp githubRepo
	err := s.githubGet(ctx, token, "/repos/"+name, &rp)
	if err != nil {
		return rp, err
	}
	if !strings.EqualFold(name, rp.FullName) || !rp.Permissions.Push || rp.Archived {
		return rp, errors.New("GitHub write access to an active repository is required")
	}
	return rp, nil
}
