package sandbox

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// E2B provisions a sandbox from a template whose entrypoint starts the
// botinc runtime. The runtime reads BOTINC_API_URL / BOTINC_RUN_ID /
// BOTINC_RUN_TOKEN from the sandbox environment and claims its run.
type E2B struct {
	APIKey  string
	BaseURL string
	Client  *http.Client
}

func NewE2B(apiKey string) *E2B {
	return &E2B{APIKey: apiKey, BaseURL: "https://api.e2b.app", Client: &http.Client{Timeout: 45 * time.Second}}
}

func (e *E2B) Name() string { return "e2b" }

func (e *E2B) Provision(ctx context.Context, spec Spec) (*Sandbox, error) {
	if e.APIKey == "" || spec.Template == "" {
		return nil, fmt.Errorf("%w: E2B key or template missing", ErrUnavailable)
	}
	env := map[string]string{
		"BOTINC_API_URL":   spec.APIURL,
		"BOTINC_RUN_ID":    spec.RunID,
		"BOTINC_RUN_TOKEN": spec.RunToken,
	}
	for k, v := range spec.Env {
		env[k] = v
	}
	body := map[string]any{
		"templateID":            spec.Template,
		"timeout":               int(spec.TTL.Seconds()),
		"autoPause":             false,
		"secure":                true,
		"allow_internet_access": true,
		"metadata":              spec.Metadata,
		"envVars":               env,
	}
	b, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, e.BaseURL+"/sandboxes", bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-API-Key", e.APIKey)
	req.Header.Set("Content-Type", "application/json")
	res, err := e.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if res.StatusCode >= 300 {
		return nil, fmt.Errorf("e2b create: %s: %s", res.Status, strings.TrimSpace(string(raw)))
	}
	var out struct {
		SandboxID string `json:"sandboxID"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, err
	}
	return &Sandbox{Provider: "e2b", ExternalID: out.SandboxID}, nil
}

func (e *E2B) Kill(ctx context.Context, externalID string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, e.BaseURL+"/sandboxes/"+externalID, nil)
	if err != nil {
		return err
	}
	req.Header.Set("X-API-Key", e.APIKey)
	res, err := e.Client.Do(req)
	if err != nil {
		return err
	}
	res.Body.Close()
	if res.StatusCode >= 300 && res.StatusCode != http.StatusNotFound {
		return fmt.Errorf("e2b kill: %s", res.Status)
	}
	return nil
}
