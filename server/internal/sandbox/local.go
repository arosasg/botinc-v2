package sandbox

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
)

// Local runs the runtime binary as a subprocess with a private working
// directory. Development and tests only; production uses a cloud provider.
type Local struct {
	Binary  string // path to the botinc-runtime binary
	WorkDir string
	log     *slog.Logger
	mu      sync.Mutex
	procs   map[string]*exec.Cmd
}

func NewLocal(binary, workDir string, log *slog.Logger) *Local {
	return &Local{Binary: binary, WorkDir: workDir, log: log, procs: map[string]*exec.Cmd{}}
}

func (l *Local) Name() string { return "local" }

func (l *Local) Provision(ctx context.Context, spec Spec) (*Sandbox, error) {
	if l.Binary == "" {
		return nil, fmt.Errorf("%w: BOTINC_RUNTIME_BINARY is not set", ErrUnavailable)
	}
	dir := filepath.Join(l.WorkDir, spec.RunID)
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return nil, err
	}
	cmd := exec.Command(l.Binary, "run")
	cmd.Dir = dir
	cmd.Env = append(os.Environ(),
		"BOTINC_API_URL="+spec.APIURL,
		"BOTINC_RUN_ID="+spec.RunID,
		"BOTINC_RUN_TOKEN="+spec.RunToken,
		"BOTINC_WORKDIR="+dir,
	)
	for k, v := range spec.Env {
		cmd.Env = append(cmd.Env, k+"="+v)
	}
	logf, err := os.Create(filepath.Join(dir, "runtime.log"))
	if err != nil {
		return nil, err
	}
	cmd.Stdout = logf
	cmd.Stderr = logf
	if err := cmd.Start(); err != nil {
		return nil, err
	}
	l.mu.Lock()
	l.procs[spec.RunID] = cmd
	l.mu.Unlock()
	go func() {
		_ = cmd.Wait()
		_ = logf.Close()
		l.mu.Lock()
		delete(l.procs, spec.RunID)
		l.mu.Unlock()
	}()
	return &Sandbox{Provider: "local", ExternalID: fmt.Sprintf("pid:%d", cmd.Process.Pid)}, nil
}

func (l *Local) Kill(ctx context.Context, externalID string) error {
	l.mu.Lock()
	defer l.mu.Unlock()
	for id, cmd := range l.procs {
		if fmt.Sprintf("pid:%d", cmd.Process.Pid) == externalID {
			delete(l.procs, id)
			return cmd.Process.Kill()
		}
	}
	return nil
}
