//go:build !unix

package agent

import "os/exec"

// isolate is a no-op where process groups are not available; the default
// cancellation behaviour applies.
func isolate(cmd *exec.Cmd) {}
