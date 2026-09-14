package sandbox

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func writeLauncher(t *testing.T, body string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "launcher.sh")
	if err := os.WriteFile(path, []byte(body), 0o700); err != nil {
		t.Fatal(err)
	}
	return path
}

func TestE2BProvisionReportsLauncherDiagnostic(t *testing.T) {
	e := &E2B{APIKey: "test", Launcher: writeLauncher(t, "echo 'provider rejected template' >&2\nexit 7\n"), NodeBinary: "/bin/sh", LaunchTimeout: time.Second}
	_, err := e.Provision(context.Background(), Spec{Template: "template", TTL: time.Minute})
	if err == nil || !strings.Contains(err.Error(), "provider rejected template") {
		t.Fatalf("expected provider diagnostic, got %v", err)
	}
}

func TestE2BProvisionHasBoundedColdStart(t *testing.T) {
	e := &E2B{APIKey: "test", Launcher: writeLauncher(t, "sleep 1\n"), NodeBinary: "/bin/sh", LaunchTimeout: 20 * time.Millisecond}
	_, err := e.Provision(context.Background(), Spec{Template: "template", TTL: time.Minute})
	if err == nil || !strings.Contains(err.Error(), "timed out after 20ms") {
		t.Fatalf("expected bounded timeout, got %v", err)
	}
}
