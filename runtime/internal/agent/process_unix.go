//go:build unix

package agent

import (
	"os/exec"
	"syscall"
)

// isolate puts the CLI in its own process group and makes cancellation kill
// that whole group. A coding CLI spawns children (git, a test runner, a
// language server); killing only the parent leaves them holding the pipes
// open, so the runtime would block past its own deadline and overrun the
// sandbox instead of failing cleanly.
func isolate(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error {
		if cmd.Process == nil {
			return nil
		}
		return syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
	}
}
