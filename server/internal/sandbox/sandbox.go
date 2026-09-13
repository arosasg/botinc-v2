// Package sandbox provisions the remote machines runs execute on. There is
// no local daemon in v2: every run gets a sandbox from a provider. The
// "local" provider runs the runtime binary as a child process and exists for
// development and tests only.
package sandbox

import (
	"context"
	"errors"
	"time"
)

// Spec is everything a sandbox needs to boot the runtime and phone home.
type Spec struct {
	RunID      string
	Workspace  string
	APIURL     string
	RunToken   string
	Image      string
	Template   string
	TTL        time.Duration
	Env        map[string]string
	Metadata   map[string]string
}

type Sandbox struct {
	Provider   string
	ExternalID string
}

type Provider interface {
	Name() string
	Provision(ctx context.Context, spec Spec) (*Sandbox, error)
	Kill(ctx context.Context, externalID string) error
}

var ErrUnavailable = errors.New("sandbox provider unavailable")
