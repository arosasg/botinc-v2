package sandbox

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"time"
)

// E2B provisions a sandbox and launches its runtime through the official SDK.
type E2B struct {
	APIKey        string
	BaseURL       string
	Client        *http.Client
	Launcher      string
	NodeBinary    string
	LaunchTimeout time.Duration
}

func NewE2B(apiKey string) *E2B {
	return &E2B{
		APIKey: apiKey, BaseURL: "https://api.e2b.app", Client: &http.Client{Timeout: 45 * time.Second},
		Launcher: os.Getenv("BOTINC_E2B_LAUNCHER"), NodeBinary: "node", LaunchTimeout: 3 * time.Minute,
	}
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
	launcher := e.Launcher
	if launcher == "" {
		return nil, fmt.Errorf("%w: BOTINC_E2B_LAUNCHER is required", ErrUnavailable)
	}
	launchTimeout := e.LaunchTimeout
	if launchTimeout <= 0 {
		launchTimeout = 3 * time.Minute
	}
	launch, cancel := context.WithTimeout(ctx, launchTimeout)
	defer cancel()
	nodeBinary := e.NodeBinary
	if nodeBinary == "" {
		nodeBinary = "node"
	}
	cmd := exec.CommandContext(launch, nodeBinary, launcher)
	cmd.Env = append(os.Environ(), "E2B_API_KEY="+e.APIKey)
	cmd.Stdin = bytes.NewReader(b)
	var output, diagnostic bytes.Buffer
	cmd.Stdout = &output
	cmd.Stderr = &diagnostic
	if err := cmd.Run(); err != nil {
		if launch.Err() != nil {
			return nil, fmt.Errorf("e2b launch timed out after %s: %w", launchTimeout, launch.Err())
		}
		message := diagnostic.String()
		if len(message) > 1024 {
			message = message[:1024]
		}
		if message != "" {
			return nil, fmt.Errorf("e2b launch: %w: %s", err, message)
		}
		return nil, fmt.Errorf("e2b launch: %w", err)
	}
	raw := output.Bytes()
	var out struct {
		SandboxID string `json:"sandboxID"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, err
	}
	if out.SandboxID == "" {
		return nil, fmt.Errorf("e2b launch returned no sandbox id")
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
