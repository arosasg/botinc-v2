package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	claudeTokenURL = "https://platform.claude.com/v1/oauth/token"
	claudeClientID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e"
)

type storedCredential struct {
	Env   map[string]string `json:"env,omitempty"`
	Files map[string]string `json:"files,omitempty"`
}

type oauthTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

// resolveAccountCredential refreshes short-lived subscription credentials
// before they leave the API. A runtime should never start with a token that is
// already expired or is likely to expire during startup.
func (s *Server) resolveAccountCredential(ctx context.Context, accountID, workspaceID uuid.UUID) (string, string, string, error) {
	var provider, kind, credentialKind, secretRef, refreshRef string
	var expiresAt *time.Time
	err := s.pool.QueryRow(ctx, `select provider, kind, credential_kind, secret_ref, refresh_ref, expires_at
		from model_accounts where id=$1 and workspace_id=$2`, accountID, workspaceID).
		Scan(&provider, &kind, &credentialKind, &secretRef, &refreshRef, &expiresAt)
	if err != nil {
		return "", "", "", err
	}
	if credentialKind == "oauth" && provider == "claude" && expiresAt != nil && expiresAt.Before(time.Now().Add(5*time.Minute)) {
		if refreshRef == "" {
			return "", "", "", errors.New("this Claude account needs to be reconnected")
		}
		if err := s.refreshClaudeAccount(ctx, accountID, workspaceID, secretRef, refreshRef); err != nil {
			_, _ = s.pool.Exec(ctx, `update model_accounts set status='limited', refresh_error=$2, updated_at=now() where id=$1`, accountID, "The provider rejected the saved session. Reconnect this account.")
			return "", "", "", err
		}
		if err := s.pool.QueryRow(ctx, `select secret_ref from model_accounts where id=$1 and workspace_id=$2`, accountID, workspaceID).Scan(&secretRef); err != nil {
			return "", "", "", err
		}
	}
	plaintext, err := s.readSecret(ctx, secretRef)
	if err != nil {
		return "", "", "", err
	}
	return provider, kind, plaintext, nil
}

func (s *Server) refreshClaudeAccount(ctx context.Context, accountID, workspaceID uuid.UUID, credentialRef, refreshRef string) error {
	credentialJSON, err := s.readSecret(ctx, credentialRef)
	if err != nil {
		return err
	}
	refreshToken, err := s.readSecret(ctx, refreshRef)
	if err != nil {
		return err
	}
	var credential storedCredential
	if err := json.Unmarshal([]byte(credentialJSON), &credential); err != nil {
		return fmt.Errorf("decode Claude credential: %w", err)
	}
	requestBody, _ := json.Marshal(map[string]string{
		"grant_type": "refresh_token", "refresh_token": refreshToken, "client_id": claudeClientID,
	})
	requestContext, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(requestContext, http.MethodPost, claudeTokenURL, bytes.NewReader(requestBody))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	payload, _ := io.ReadAll(io.LimitReader(res.Body, 64<<10))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("Claude refresh failed with status %d", res.StatusCode)
	}
	var tokens oauthTokenResponse
	if err := json.Unmarshal(payload, &tokens); err != nil || strings.TrimSpace(tokens.AccessToken) == "" {
		return errors.New("Claude refresh returned no access token")
	}
	if credential.Env == nil {
		credential.Env = map[string]string{}
	}
	credential.Env["CLAUDE_CODE_OAUTH_TOKEN"] = tokens.AccessToken
	encoded, err := json.Marshal(credential)
	if err != nil {
		return err
	}
	newCredentialRef, err := s.writeSecret(ctx, workspaceID, string(encoded))
	if err != nil {
		return err
	}
	newRefreshRef := refreshRef
	if strings.TrimSpace(tokens.RefreshToken) != "" && tokens.RefreshToken != refreshToken {
		newRefreshRef, err = s.writeSecret(ctx, workspaceID, tokens.RefreshToken)
		if err != nil {
			s.deleteSecret(ctx, newCredentialRef)
			return err
		}
	}
	var expires *time.Time
	if tokens.ExpiresIn > 0 {
		value := time.Now().Add(time.Duration(tokens.ExpiresIn) * time.Second)
		expires = &value
	}
	if _, err := s.pool.Exec(ctx, `update model_accounts set secret_ref=$2, refresh_ref=$3, expires_at=$4,
		status='connected', refresh_error='', updated_at=now() where id=$1 and workspace_id=$5`,
		accountID, newCredentialRef, newRefreshRef, expires, workspaceID); err != nil {
		s.deleteSecret(ctx, newCredentialRef)
		if newRefreshRef != refreshRef {
			s.deleteSecret(ctx, newRefreshRef)
		}
		return err
	}
	s.deleteSecret(ctx, credentialRef)
	if newRefreshRef != refreshRef {
		s.deleteSecret(ctx, refreshRef)
	}
	return nil
}
