package commands

import (
	"time"

	"github.com/spf13/cobra"

	"github.com/arosasg/botinc-v2/cli/internal/client"
	"github.com/arosasg/botinc-v2/cli/internal/config"
	"github.com/arosasg/botinc-v2/cli/internal/ui"
)

// loginCmd runs the device-code flow: the CLI never asks for a password and
// never handles one. You approve it in a browser that is already signed in.
func (a *App) loginCmd() *cobra.Command {
	var apiURL string
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Sign in to BotInc",
		Long: `Sign in with a device code.

botinc shows a short code and a URL. You open the URL in a browser, confirm
the code, and this command finishes. No password is typed here.`,
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			cfg := a.cfg
			if apiURL != "" {
				cfg.APIURL = apiURL
			}
			api := client.New(cfg.APIURL, "", "")
			start, err := api.StartDevice(cmd.Context())
			if err != nil {
				return err
			}
			ui.Say("Open %s and enter this code:", cfg.APIURL+"/device")
			ui.Say("")
			ui.Say("    %s", start.UserCode)
			ui.Say("")
			ui.Say("Waiting for approval.")

			token, err := api.PollDevice(cmd.Context(), start)
			if err != nil {
				return err
			}
			cfg.Token = token

			// Pick up who we are and, if there is exactly one workspace, use it.
			me := client.New(cfg.APIURL, token, "")
			var who struct {
				User struct {
					Email string `json:"email"`
				} `json:"user"`
			}
			if err := me.Do(cmd.Context(), "GET", "/api/me", nil, &who); err == nil {
				cfg.Email = who.User.Email
			}
			var list struct {
				Workspaces []struct {
					Slug string `json:"slug"`
					Name string `json:"name"`
				} `json:"workspaces"`
			}
			if err := me.Do(cmd.Context(), "GET", "/api/workspaces", nil, &list); err == nil && len(list.Workspaces) > 0 {
				cfg.Workspace = list.Workspaces[0].Slug
			}
			if err := config.Save(cfg); err != nil {
				return err
			}
			if ui.Emit(map[string]any{"email": cfg.Email, "workspace": cfg.Workspace}) {
				return nil
			}
			ui.Say("Signed in as %s.", dashIfEmpty(cfg.Email))
			if cfg.Workspace != "" {
				ui.Say("Workspace %s.", cfg.Workspace)
			}
			if len(list.Workspaces) > 1 {
				ui.Say("You are in %s. Switch with `botinc workspace use <slug>`.", plural(len(list.Workspaces), "workspace", "workspaces"))
			}
			return nil
		},
	}
	cmd.Flags().StringVar(&apiURL, "api", "", "sign in to a different deployment")
	return cmd
}

func (a *App) logoutCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "logout",
		Short: "Forget the stored credentials",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if err := config.Clear(); err != nil {
				return err
			}
			ui.Say("Signed out.")
			return nil
		},
	}
}

func (a *App) whoamiCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "whoami",
		Short: "Show who you are signed in as",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			var out struct {
				User struct {
					Email      string     `json:"email"`
					Name       string     `json:"name"`
					CreatedAt  time.Time  `json:"created_at"`
					LastSeenAt *time.Time `json:"last_seen_at"`
				} `json:"user"`
			}
			if err := a.api.Do(cmd.Context(), "GET", "/api/me", nil, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Field("Email", out.User.Email)
			ui.Field("Name", out.User.Name)
			ui.Field("Workspace", dashIfEmpty(a.api.Workspace))
			ui.Field("API", a.cfg.APIURL)
			return nil
		},
	}
}

func (a *App) workspaceCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "workspace",
		Aliases: []string{"ws"},
		Short:   "Workspaces you belong to",
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "list",
			Short: "List your workspaces",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Workspaces []struct {
						Slug string `json:"slug"`
						Name string `json:"name"`
						Role string `json:"role"`
						Plan string `json:"plan"`
					} `json:"workspaces"`
				}
				if err := a.api.Do(cmd.Context(), "GET", "/api/workspaces", nil, &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				t := ui.NewTable("slug", "name", "role", "plan", "")
				for _, w := range out.Workspaces {
					marker := ""
					if w.Slug == a.api.Workspace {
						marker = "current"
					}
					t.Row(w.Slug, w.Name, w.Role, w.Plan, marker)
				}
				t.Flush()
				return nil
			},
		},
		&cobra.Command{
			Use:   "use <slug>",
			Short: "Set the default workspace",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				// Confirm membership before storing it, so a typo fails now
				// rather than on every later command.
				probe := client.New(a.cfg.APIURL, a.cfg.Token, args[0])
				if err := probe.GetW(cmd.Context(), "", nil); err != nil {
					return err
				}
				cfg := a.cfg
				cfg.Workspace = args[0]
				if err := config.Save(cfg); err != nil {
					return err
				}
				ui.Say("Workspace %s.", args[0])
				return nil
			},
		},
		&cobra.Command{
			Use:   "show",
			Short: "Show the current workspace",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Workspace struct {
						Slug string `json:"slug"`
						Name string `json:"name"`
						Plan string `json:"plan"`
						Role string `json:"role"`
					} `json:"workspace"`
					IssueCounts map[string]int `json:"issue_counts"`
					CreditCents int            `json:"credit_cents"`
					RunningRuns int            `json:"running_runs"`
				}
				if err := a.api.GetW(cmd.Context(), "/overview", &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				ui.Field("Workspace", out.Workspace.Name)
				ui.Field("Slug", out.Workspace.Slug)
				ui.Field("Plan", out.Workspace.Plan)
				ui.Field("Credit", ui.Money(out.CreditCents))
				ui.Field("Running", plural(out.RunningRuns, "run", "runs"))
				if len(out.IssueCounts) > 0 {
					t := ui.NewTable("status", "issues")
					for _, st := range []string{"needs_you", "todo", "in_progress", "in_review", "blocked", "done"} {
						if n, ok := out.IssueCounts[st]; ok {
							t.Row(st, itoa(n))
						}
					}
					t.Flush()
				}
				return nil
			},
		},
	)
	return cmd
}
