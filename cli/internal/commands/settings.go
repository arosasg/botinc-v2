package commands

import (
	"encoding/json"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/arosasg/botinc-v2/cli/internal/ui"
)

// accountCmd manages the subscriptions and keys work is charged against.
// A secret is written once and never read back: the CLI can add one and
// remove one, and that is all anybody needs.
func (a *App) accountCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "account",
		Aliases: []string{"accounts"},
		Short:   "The subscriptions and keys work runs on",
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "list",
			Short: "List connected accounts",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Accounts []struct {
						ID        string          `json:"id"`
						Provider  string          `json:"provider"`
						Label     string          `json:"label"`
						Plan      string          `json:"plan"`
						Kind      string          `json:"kind"`
						Status    string          `json:"status"`
						Quota     json.RawMessage `json:"quota"`
						HasSecret bool            `json:"has_secret"`
					} `json:"accounts"`
				}
				if err := a.api.GetW(cmd.Context(), "/accounts", &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				if len(out.Accounts) == 0 {
					ui.Say("No accounts. Work will fall back to credits.")
					return nil
				}
				t := ui.NewTable("id", "provider", "label", "kind", "plan", "status", "left")
				for _, ac := range out.Accounts {
					t.Row(ac.ID, ac.Provider, dashIfEmpty(ac.Label), ac.Kind, dashIfEmpty(ac.Plan), ac.Status, quotaLeft(ac.Quota))
				}
				t.Flush()
				return nil
			},
		},
		a.accountAddCmd(),
		&cobra.Command{
			Use:   "remove <id>",
			Short: "Disconnect an account",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				if err := a.api.DeleteW(cmd.Context(), "/accounts/"+args[0], nil); err != nil {
					return err
				}
				ui.Say("Disconnected %s.", args[0])
				return nil
			},
		},
	)
	return cmd
}

// quotaLeft renders the tightest remaining window as a percentage.
func quotaLeft(raw json.RawMessage) string {
	var windows []struct {
		Used  float64 `json:"used"`
		Limit float64 `json:"limit"`
	}
	if err := json.Unmarshal(raw, &windows); err != nil || len(windows) == 0 {
		return "-"
	}
	left := 1.0
	for _, w := range windows {
		if w.Limit <= 0 {
			continue
		}
		if l := 1 - w.Used/w.Limit; l < left {
			left = l
		}
	}
	return itoa(int(left*100)) + "%"
}

func (a *App) accountAddCmd() *cobra.Command {
	var provider, label, plan, kind, secret, secretFile string
	cmd := &cobra.Command{
		Use:   "add",
		Short: "Connect a subscription or an API key",
		Long: `Connect an account.

A key is sent once and stored encrypted. It is never returned by the API and
never printed here. Prefer --secret-file over --secret so the value does not
land in your shell history.`,
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			if provider == "" {
				return errors.New("pass --provider (claude, codex, cursor, copilot, gemini, openrouter or api)")
			}
			if secretFile != "" {
				raw, err := os.ReadFile(secretFile)
				if err != nil {
					return err
				}
				secret = strings.TrimSpace(string(raw))
			}
			in := map[string]any{"provider": provider, "label": label, "plan": plan, "kind": kind}
			if secret != "" {
				in["secret"] = secret
			}
			var out struct {
				Account struct {
					ID string `json:"id"`
				} `json:"account"`
			}
			if err := a.api.PostW(cmd.Context(), "/accounts", in, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Connected %s as %s.", provider, out.Account.ID)
			return nil
		},
	}
	cmd.Flags().StringVar(&provider, "provider", "", "claude, codex, cursor, copilot, gemini, openrouter or api")
	cmd.Flags().StringVar(&label, "label", "", "what to call it")
	cmd.Flags().StringVar(&plan, "plan", "", "the plan, for a subscription")
	cmd.Flags().StringVar(&kind, "kind", "subscription", "subscription, api_key or credits")
	cmd.Flags().StringVar(&secret, "secret", "", "the key (prefer --secret-file)")
	cmd.Flags().StringVar(&secretFile, "secret-file", "", "read the key from a file")
	return cmd
}

func (a *App) repoCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "repo",
		Aliases: []string{"repos", "repository"},
		Short:   "Repositories the company can change",
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "list",
			Short: "List connected repositories",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Repositories []struct {
						ID            string    `json:"id"`
						FullName      string    `json:"full_name"`
						DefaultBranch string    `json:"default_branch"`
						CreatedAt     time.Time `json:"created_at"`
					} `json:"repositories"`
				}
				if err := a.api.GetW(cmd.Context(), "/repositories", &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				if len(out.Repositories) == 0 {
					ui.Say("No repositories.")
					return nil
				}
				t := ui.NewTable("repository", "branch", "connected")
				for _, r := range out.Repositories {
					created := r.CreatedAt
					t.Row(r.FullName, r.DefaultBranch, ui.Ago(&created))
				}
				t.Flush()
				return nil
			},
		},
		func() *cobra.Command {
			var branch, project string
			c := &cobra.Command{
				Use:   "add <owner/name>",
				Short: "Connect a repository",
				Args:  cobra.ExactArgs(1),
				RunE: func(cmd *cobra.Command, args []string) error {
					if err := a.requireAuth(); err != nil {
						return err
					}
					in := map[string]any{"full_name": args[0]}
					if branch != "" {
						in["default_branch"] = branch
					}
					if project != "" {
						in["project_id"] = project
					}
					if err := a.api.PostW(cmd.Context(), "/repositories", in, nil); err != nil {
						return err
					}
					ui.Say("Connected %s.", args[0])
					return nil
				},
			}
			c.Flags().StringVar(&branch, "branch", "", "the default branch")
			c.Flags().StringVar(&project, "project", "", "project id")
			return c
		}(),
	)
	return cmd
}

func (a *App) projectCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "project",
		Aliases: []string{"projects"},
		Short:   "Groupings of work and repositories",
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "list",
			Short: "List projects",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Projects []struct {
						ID       string `json:"id"`
						Name     string `json:"name"`
						Repos    int    `json:"repositories"`
						OpenWork int    `json:"open_issues"`
					} `json:"projects"`
				}
				if err := a.api.GetW(cmd.Context(), "/projects", &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				if len(out.Projects) == 0 {
					ui.Say("No projects.")
					return nil
				}
				t := ui.NewTable("id", "name", "repositories", "open issues")
				for _, p := range out.Projects {
					t.Row(p.ID, p.Name, itoa(p.Repos), itoa(p.OpenWork))
				}
				t.Flush()
				return nil
			},
		},
		&cobra.Command{
			Use:   "new <name>",
			Short: "Add a project",
			Args:  cobra.MinimumNArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Project struct {
						ID   string `json:"id"`
						Name string `json:"name"`
					} `json:"project"`
				}
				if err := a.api.PostW(cmd.Context(), "/projects", map[string]any{"name": strings.Join(args, " ")}, &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				ui.Say("Added %s.", out.Project.Name)
				return nil
			},
		},
	)
	return cmd
}
