// Package client talks to the BotInc API. Every method returns a decoded
// value or an error whose message is the one the server wrote, so the CLI
// never invents an explanation for a failure it did not diagnose.
package client

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	BaseURL   string
	Token     string
	Workspace string
	HTTP      *http.Client
}

func New(baseURL, token, workspace string) *Client {
	return &Client{
		BaseURL:   strings.TrimRight(baseURL, "/"),
		Token:     token,
		Workspace: workspace,
		HTTP:      &http.Client{Timeout: 60 * time.Second},
	}
}

// APIError carries the server's own words plus its machine-readable code.
type APIError struct {
	Status  int
	Code    string
	Message string
}

func (e *APIError) Error() string {
	if e.Message == "" {
		return fmt.Sprintf("the server returned %d", e.Status)
	}
	return e.Message
}

// Unauthenticated reports whether this is a sign-in problem rather than a bug.
func (e *APIError) Unauthenticated() bool { return e.Status == http.StatusUnauthorized }

var ErrNoWorkspace = errors.New("no workspace selected: run `botinc workspace use <slug>`")

func (c *Client) Do(ctx context.Context, method, path string, in, out any) error {
	var body io.Reader
	if in != nil {
		b, err := json.Marshal(in)
		if err != nil {
			return err
		}
		body = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.BaseURL+path, body)
	if err != nil {
		return err
	}
	if c.Token != "" {
		req.Header.Set("Authorization", "Bearer "+c.Token)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	res, err := c.HTTP.Do(req)
	if err != nil {
		return fmt.Errorf("could not reach %s: %w", c.BaseURL, err)
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(res.Body, 16<<20))
	if res.StatusCode >= 300 {
		var e struct {
			Error string `json:"error"`
			Code  string `json:"code"`
		}
		_ = json.Unmarshal(raw, &e)
		return &APIError{Status: res.StatusCode, Code: e.Code, Message: e.Error}
	}
	if out != nil && len(raw) > 0 {
		return json.Unmarshal(raw, out)
	}
	return nil
}

// W builds a workspace-scoped path, refusing rather than guessing when no
// workspace has been chosen.
func (c *Client) W(suffix string) (string, error) {
	if c.Workspace == "" {
		return "", ErrNoWorkspace
	}
	return "/api/w/" + url.PathEscape(c.Workspace) + suffix, nil
}

func (c *Client) GetW(ctx context.Context, suffix string, out any) error {
	p, err := c.W(suffix)
	if err != nil {
		return err
	}
	return c.Do(ctx, http.MethodGet, p, nil, out)
}

func (c *Client) PostW(ctx context.Context, suffix string, in, out any) error {
	p, err := c.W(suffix)
	if err != nil {
		return err
	}
	return c.Do(ctx, http.MethodPost, p, in, out)
}

func (c *Client) PatchW(ctx context.Context, suffix string, in, out any) error {
	p, err := c.W(suffix)
	if err != nil {
		return err
	}
	return c.Do(ctx, http.MethodPatch, p, in, out)
}

func (c *Client) DeleteW(ctx context.Context, suffix string, out any) error {
	p, err := c.W(suffix)
	if err != nil {
		return err
	}
	return c.Do(ctx, http.MethodDelete, p, nil, out)
}

// --- device-code login ---

type DeviceStart struct {
	DeviceCode string `json:"device_code"`
	UserCode   string `json:"user_code"`
	ExpiresIn  int    `json:"expires_in"`
	Interval   int    `json:"interval"`
}

func (c *Client) StartDevice(ctx context.Context) (DeviceStart, error) {
	var out DeviceStart
	err := c.Do(ctx, http.MethodPost, "/api/auth/device/start", map[string]any{}, &out)
	return out, err
}

// PollDevice waits for the browser to approve, returning the session token.
// It respects the server's interval rather than hammering the endpoint.
func (c *Client) PollDevice(ctx context.Context, d DeviceStart) (string, error) {
	interval := time.Duration(d.Interval) * time.Second
	if interval < time.Second {
		interval = 2 * time.Second
	}
	deadline := time.Now().Add(time.Duration(max(d.ExpiresIn, 300)) * time.Second)
	for time.Now().Before(deadline) {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-time.After(interval):
		}
		var out struct {
			Token   string `json:"token"`
			Pending bool   `json:"pending"`
		}
		if err := c.Do(ctx, http.MethodPost, "/api/auth/device/poll", map[string]any{"device_code": d.DeviceCode}, &out); err != nil {
			var apiErr *APIError
			if errors.As(err, &apiErr) && apiErr.Status == http.StatusBadRequest {
				return "", err
			}
			continue // a transient failure: keep waiting rather than losing the login
		}
		if out.Token != "" {
			return out.Token, nil
		}
	}
	return "", errors.New("the sign-in request expired before it was approved")
}
