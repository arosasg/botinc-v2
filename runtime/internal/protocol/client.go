// Package protocol is the runtime's side of the run API. Every call carries
// the run token the sandbox was booted with; the runtime has no user
// credentials and can only touch its own run.
package protocol

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
	"sync"
	"time"
)

type Client struct {
	BaseURL string
	RunID   string
	Token   string
	HTTP    *http.Client

	mu  sync.Mutex
	seq int
}

func New(baseURL, runID, token string) *Client {
	return &Client{
		BaseURL: strings.TrimRight(baseURL, "/"),
		RunID:   runID,
		Token:   token,
		HTTP:    &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) path(suffix string) string {
	return c.BaseURL + "/api/runtime/runs/" + c.RunID + suffix
}

// call sends one request, retrying a few times on a transport error or a 5xx.
// The server is the only place run state lives, so giving up early would lose
// work the sandbox has already done.
func (c *Client) call(ctx context.Context, method, suffix string, in, out any) error {
	var body []byte
	if in != nil {
		var err error
		if body, err = json.Marshal(in); err != nil {
			return err
		}
	}
	var lastErr error
	for attempt := 0; attempt < 4; attempt++ {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(time.Duration(attempt*attempt) * time.Second):
			}
		}
		req, err := http.NewRequestWithContext(ctx, method, c.path(suffix), bytes.NewReader(body))
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", "Bearer "+c.Token)
		req.Header.Set("Content-Type", "application/json")
		res, err := c.HTTP.Do(req)
		if err != nil {
			lastErr = err
			continue
		}
		raw, _ := io.ReadAll(io.LimitReader(res.Body, 8<<20))
		res.Body.Close()
		if res.StatusCode >= 500 {
			lastErr = fmt.Errorf("%s %s: %s", method, suffix, res.Status)
			continue
		}
		if res.StatusCode == http.StatusUnauthorized || res.StatusCode == http.StatusForbidden {
			// A rejected token will never be accepted; retrying is pointless.
			return fmt.Errorf("%w: %s", ErrUnauthorized, strings.TrimSpace(string(raw)))
		}
		if res.StatusCode >= 300 {
			return fmt.Errorf("%s %s: %s: %s", method, suffix, res.Status, strings.TrimSpace(string(raw)))
		}
		if out != nil && len(raw) > 0 {
			return json.Unmarshal(raw, out)
		}
		return nil
	}
	return lastErr
}

var ErrUnauthorized = errors.New("the server rejected this run token")

type Run struct {
	ID             string `json:"id"`
	Purpose        string `json:"purpose"`
	Status         string `json:"status"`
	Model          string `json:"model"`
	Funding        string `json:"funding"`
	TaskLimitCents int    `json:"task_limit_cents"`
	Prompt         string `json:"prompt"`
}

type Step struct {
	Key    string `json:"key"`
	Name   string `json:"name"`
	Kind   string `json:"kind"`
	Status string `json:"status"`
	Model  string `json:"model"`
}

type Issue struct {
	Identifier  string `json:"identifier"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

type Message struct {
	ID   string `json:"id"`
	Role string `json:"role"`
	Body string `json:"body"`
}

type Attachment struct {
	ID          string `json:"id"`
	MessageID   string `json:"message_id"`
	CommentID   string `json:"comment_id"`
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	SizeBytes   int64  `json:"size_bytes"`
	Path        string `json:"-"`
}

type Repository struct {
	Token          string `json:"token,omitempty"`
	FullName       string `json:"full_name"`
	DefaultBranch  string `json:"default_branch"`
	InstallationID *int64 `json:"installation_id"`
}

type Credential struct {
	Provider string `json:"provider"`
	Kind     string `json:"kind"`
	// Secret is retained for API-key accounts created before structured
	// credentials were introduced. Subscription logins use Env and Files so
	// the CLI receives the exact credential shape it created.
	Secret string            `json:"secret,omitempty"`
	Env    map[string]string `json:"env,omitempty"`
	Files  map[string]string `json:"files,omitempty"`
}

type Knowledge struct {
	Kind string `json:"kind"`
	Name string `json:"name"`
	Body string `json:"body"`
}

type Spec struct {
	Graph        json.RawMessage `json:"graph"`
	MCPConfig    json.RawMessage `json:"mcp_config"`
	Knowledge    []Knowledge     `json:"knowledge"`
	Run          Run             `json:"run"`
	Steps        []Step          `json:"steps"`
	Issue        *Issue          `json:"issue"`
	Messages     []Message       `json:"messages"`
	Attachments  []Attachment    `json:"attachments"`
	Repositories []Repository    `json:"repositories"`
	Credential   *Credential     `json:"credential"`
}

// Heartbeat uses an empty event batch, which advances liveness without
// inventing an activity event or racing the sequence counter.
func (c *Client) Heartbeat(ctx context.Context) error {
	return c.call(ctx, http.MethodPost, "/events", map[string]any{"events": []any{}}, nil)
}

func (c *Client) Claim(ctx context.Context) (Run, error) {
	var out struct {
		Run Run `json:"run"`
	}
	if err := c.call(ctx, http.MethodPost, "/claim", map[string]any{}, &out); err != nil {
		return Run{}, err
	}
	return out.Run, nil
}

func (c *Client) Spec(ctx context.Context) (Spec, error) {
	var s Spec
	err := c.call(ctx, http.MethodGet, "/spec", nil, &s)
	return s, err
}

func (c *Client) DownloadAttachment(ctx context.Context, id string, dst io.Writer) (int64, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.path("/attachments/"+url.PathEscape(id)), nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("Authorization", "Bearer "+c.Token)
	res, err := c.HTTP.Do(req)
	if err != nil {
		return 0, err
	}
	defer res.Body.Close()
	if res.StatusCode == http.StatusUnauthorized || res.StatusCode == http.StatusForbidden {
		return 0, fmt.Errorf("%w: attachment download", ErrUnauthorized)
	}
	if res.StatusCode >= 300 {
		raw, _ := io.ReadAll(io.LimitReader(res.Body, 4096))
		return 0, fmt.Errorf("GET attachment: %s: %s", res.Status, strings.TrimSpace(string(raw)))
	}
	written, err := io.Copy(dst, io.LimitReader(res.Body, (64<<20)+1))
	if err == nil && written > 64<<20 {
		err = errors.New("attachment exceeds 64 MB")
	}
	return written, err
}

type Event struct {
	Seq     int            `json:"seq"`
	Type    string         `json:"type"`
	Payload map[string]any `json:"payload"`
}

// Emit sends one event. Sequence numbers are assigned here so the server can
// order and de-duplicate what it receives.
func (c *Client) Emit(ctx context.Context, typ string, payload map[string]any) error {
	c.mu.Lock()
	c.seq++
	ev := Event{Seq: c.seq, Type: typ, Payload: payload}
	c.mu.Unlock()
	return c.call(ctx, http.MethodPost, "/events", map[string]any{"events": []Event{ev}}, nil)
}

type StepUpdate struct {
	Key       string         `json:"key"`
	Status    string         `json:"status"`
	Model     string         `json:"model,omitempty"`
	Effort    string         `json:"effort,omitempty"`
	CostCents int            `json:"cost_cents,omitempty"`
	Output    map[string]any `json:"output,omitempty"`
}

func (c *Client) Step(ctx context.Context, u StepUpdate) error {
	return c.call(ctx, http.MethodPost, "/steps", u, nil)
}

func (c *Client) Say(ctx context.Context, body string) error {
	return c.call(ctx, http.MethodPost, "/messages", map[string]any{"body": body}, nil)
}

type Finish struct {
	Status string         `json:"status"`
	Error  string         `json:"error,omitempty"`
	Result map[string]any `json:"result,omitempty"`
}

func (c *Client) Finish(ctx context.Context, f Finish) error {
	return c.call(ctx, http.MethodPost, "/finish", f, nil)
}

func (c *Client) Input(ctx context.Context, key string) (string, error) {
	var out struct {
		Answer string `json:"answer"`
	}
	err := c.call(ctx, http.MethodGet, "/inputs/"+url.PathEscape(key), nil, &out)
	return out.Answer, err
}
