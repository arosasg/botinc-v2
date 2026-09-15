package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/arosasg/botinc-v2/runtime/internal/protocol"
)

func TestChatRunPreparesGitAndGitHubAccessForConnectedRepositories(t *testing.T) {
	workdir := t.TempDir()
	repositories := []protocol.Repository{
		{FullName: "arosasg/botinc-v2", DefaultBranch: "main", Token: "ghp_test_token"},
		{FullName: "didit-protocol/fe-application-console", DefaultBranch: "development", Token: "ghp_test_token"},
	}
	access, err := prepareRepositoryAccess(workdir, repositories)
	if err != nil {
		t.Fatal(err)
	}
	credentials, err := os.ReadFile(filepath.Join(workdir, ".git-credentials"))
	if err != nil || string(credentials) != "https://x-access-token:ghp_test_token@github.com\n" {
		t.Fatalf("credential store = %q, %v", credentials, err)
	}
	info, err := os.Stat(filepath.Join(workdir, ".git-credentials"))
	if err != nil || info.Mode().Perm() != 0o600 {
		t.Fatalf("credential store must be private to the run: %v %v", info, err)
	}
	config, err := os.ReadFile(access.Env["GIT_CONFIG_GLOBAL"])
	if err != nil || !strings.Contains(string(config), "helper = store --file="+filepath.Join(workdir, ".git-credentials")) || !strings.Contains(string(config), "name = BotInc") {
		t.Fatalf("git config must point at the credential store and carry an identity: %q, %v", config, err)
	}
	if access.Env["GITHUB_TOKEN"] != "ghp_test_token" || access.Env["GH_TOKEN"] != "ghp_test_token" || access.Env["GIT_TERMINAL_PROMPT"] != "0" {
		t.Fatalf("GitHub API access must reach the CLI through the environment: %+v", access.Env)
	}
	if len(access.Secrets) != 1 || access.Secrets[0] != "ghp_test_token" {
		t.Fatalf("the token must be redacted from the transcript: %+v", access.Secrets)
	}
	access.Cleanup()
	for _, name := range []string{".git-credentials", ".gitconfig"} {
		if _, err := os.Stat(filepath.Join(workdir, name)); !os.IsNotExist(err) {
			t.Fatalf("%s must be removed after the run", name)
		}
	}
}

func TestChatRunWithoutGitHubPreparesNothing(t *testing.T) {
	workdir := t.TempDir()
	access, err := prepareRepositoryAccess(workdir, []protocol.Repository{{FullName: "arosasg/botinc-v2", DefaultBranch: "main"}})
	if err != nil {
		t.Fatal(err)
	}
	if len(access.Env) != 0 || len(access.Secrets) != 0 {
		t.Fatalf("no token means no credential: %+v", access)
	}
	if _, err := os.Stat(filepath.Join(workdir, ".git-credentials")); !os.IsNotExist(err) {
		t.Fatal("no credential store may be written without a token")
	}
}

func TestChatPromptNamesConnectedRepositoriesAndHowToReachThem(t *testing.T) {
	spec := protocol.Spec{
		Run: protocol.Run{Prompt: "Review the open pull requests on all my repositories."},
		Repositories: []protocol.Repository{
			{FullName: "arosasg/botinc-v2", DefaultBranch: "main", Token: "ghp_test_token"},
			{FullName: "didit-protocol/fe-application-console", DefaultBranch: "", Token: "ghp_test_token"},
		},
	}
	prompt := chatPrompt(spec)
	for _, want := range []string{
		"- arosasg/botinc-v2 (default branch main)",
		"- didit-protocol/fe-application-console (default branch main)",
		"Git is authenticated for github.com",
		"GITHUB_TOKEN and GH_TOKEN",
		"botinc-runtime checkout arosasg/botinc-v2",
		"encrypted environment as an ignored .env file",
		"Never print credentials or .env values.",
		"User: Review the open pull requests on all my repositories.",
	} {
		if !strings.Contains(prompt, want) {
			t.Fatalf("chat prompt missing %q:\n%s", want, prompt)
		}
	}
	if strings.Contains(prompt, "ghp_test_token") {
		t.Fatalf("the token must never be written into the prompt:\n%s", prompt)
	}

	spec.Repositories[0].Token = ""
	spec.Repositories[1].Token = ""
	prompt = chatPrompt(spec)
	if !strings.Contains(prompt, "GitHub is not connected to this workspace") || strings.Contains(prompt, "Git is authenticated") {
		t.Fatalf("without GitHub the prompt must say the repositories are out of reach:\n%s", prompt)
	}

	spec.Repositories = nil
	if prompt = chatPrompt(spec); strings.Contains(prompt, "Connected repositories") {
		t.Fatalf("a workspace without repositories gets no repository section:\n%s", prompt)
	}
}
