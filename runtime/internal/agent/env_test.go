package agent

import (
	"context"
	"testing"
)

func TestRunScopedEnvironmentReachesTheCLIAndItsSecretsAreRedacted(t *testing.T) {
	fakeCLI(t, "gitenvcli", `
test "$GIT_CONFIG_GLOBAL" = '/run/.gitconfig' || exit 7
echo "{\"type\":\"result\",\"result\":\"token=$GITHUB_TOKEN secret=$TEST_SECRET\"}"
exit 0
`)
	out, err := Run(context.Background(), adapterFor("gitenvcli"), Options{
		Dir: t.TempDir(), Prompt: "x", Secret: "hunter2",
		Env:     map[string]string{"GITHUB_TOKEN": "ghp_run_token", "GIT_CONFIG_GLOBAL": "/run/.gitconfig"},
		Secrets: []string{"ghp_run_token"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if out["result"] != "token=[redacted] secret=[redacted]" {
		t.Fatalf("run-scoped environment must reach the CLI and be redacted from output: %+v", out)
	}
}
