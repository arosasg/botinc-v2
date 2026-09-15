package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/arosasg/botinc-v2/runtime/internal/protocol"
)

// repositoryAccess is what a conversation run hands the coding CLI so the
// Operator can clone, inspect and push the workspace's connected repositories
// itself. Repository work goes through repo.Clone instead and never uses this.
type repositoryAccess struct {
	// Env is added to the CLI's process environment: git reads its
	// credential helper and identity from a private global config, and the
	// GitHub REST API takes the same token from GITHUB_TOKEN / GH_TOKEN.
	Env map[string]string
	// Secrets never reach the transcript.
	Secrets []string
	files   []string
}

// prepareRepositoryAccess writes the credential store and git config the
// Operator's git commands read. Without a token there is nothing to prepare:
// the prompt tells the Operator that GitHub is not connected instead.
func prepareRepositoryAccess(root string, repositories []protocol.Repository) (*repositoryAccess, error) {
	token := ""
	for _, repository := range repositories {
		if repository.Token != "" {
			token = repository.Token
			break
		}
	}
	if token == "" {
		return &repositoryAccess{}, nil
	}
	credentials := filepath.Join(root, ".git-credentials")
	if err := os.WriteFile(credentials, []byte("https://x-access-token:"+token+"@github.com\n"), 0o600); err != nil {
		return nil, err
	}
	config := filepath.Join(root, ".gitconfig")
	body := fmt.Sprintf("[credential]\n\thelper = store --file=%s\n[user]\n\tname = BotInc\n\temail = runtime@botinc.ai\n", credentials)
	if err := os.WriteFile(config, []byte(body), 0o600); err != nil {
		_ = os.Remove(credentials)
		return nil, err
	}
	return &repositoryAccess{
		Env: map[string]string{
			"GIT_CONFIG_GLOBAL":   config,
			"GIT_TERMINAL_PROMPT": "0",
			"GITHUB_TOKEN":        token,
			"GH_TOKEN":            token,
		},
		Secrets: []string{token},
		files:   []string{credentials, config},
	}, nil
}

// Cleanup removes the credential files once the CLI has exited.
func (a *repositoryAccess) Cleanup() {
	for _, path := range a.files {
		_ = os.Remove(path)
	}
}

// repositoriesPrompt tells the Operator which repositories the workspace
// connected and whether this run can reach them.
func repositoriesPrompt(spec protocol.Spec) string {
	if len(spec.Repositories) == 0 {
		return ""
	}
	var b strings.Builder
	b.WriteString("\nConnected repositories (GitHub):\n")
	authenticated := false
	for _, repository := range spec.Repositories {
		branch := repository.DefaultBranch
		if branch == "" {
			branch = "main"
		}
		fmt.Fprintf(&b, "- %s (default branch %s)\n", repository.FullName, branch)
		if repository.Token != "" {
			authenticated = true
		}
	}
	if authenticated {
		b.WriteString("Git is authenticated for github.com in this sandbox, and GITHUB_TOKEN and GH_TOKEN hold the same token for the GitHub REST API. Nothing is checked out yet: clone the repositories the request is about into the working directory (git clone https://github.com/OWNER/NAME.git), work on branches, and push or open pull requests when the user asked for changes. Never print the token.\n\n")
	} else {
		b.WriteString("GitHub is not connected to this workspace, so this run cannot read or change these repositories. Say so instead of guessing.\n\n")
	}
	return b.String()
}
