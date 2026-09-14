// Package commands is the botinc command tree.
//
// The shape is noun then verb: `botinc issue list`, `botinc routine trigger`.
// Every command that returns data accepts --json and prints exactly what the
// API returned, so a script never has to parse a table.
package commands

import (
	"errors"
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/arosasg/botinc-v2/cli/internal/client"
	"github.com/arosasg/botinc-v2/cli/internal/config"
	"github.com/arosasg/botinc-v2/cli/internal/ui"
)

// Version is set at build time.
var Version = "dev"

type App struct {
	cfg config.Config
	api *client.Client
	// workspace overrides the stored default for one invocation.
	workspace string
}

func Execute() int {
	root, _ := newRoot()
	if err := root.Execute(); err != nil {
		report(err)
		return 1
	}
	return 0
}

func report(err error) {
	var apiErr *client.APIError
	if errors.As(err, &apiErr) {
		ui.Warn("%s", apiErr.Error())
		if apiErr.Unauthenticated() {
			ui.Warn("Run `botinc login`.")
		}
		return
	}
	if errors.Is(err, client.ErrNoWorkspace) {
		ui.Warn("%s", err.Error())
		return
	}
	ui.Warn("%s", err.Error())
}

func newRoot() (*cobra.Command, *App) {
	app := &App{}
	root := &cobra.Command{
		Use:   "botinc",
		Short: "The incorporated workforce",
		Long: `botinc is the command line for a BotInc workspace.

You post work, the company answers. Runs execute remotely: there is no local
agent and nothing to install on a machine of your own.`,
		Version:       Version,
		SilenceUsage:  true,
		SilenceErrors: true,
		PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
			cfg, err := config.Load()
			if err != nil {
				return err
			}
			app.cfg = cfg
			ws := cfg.Workspace
			if app.workspace != "" {
				ws = app.workspace
			}
			app.api = client.New(cfg.APIURL, cfg.Token, ws)
			return nil
		},
	}
	root.PersistentFlags().BoolVar(&ui.JSON, "json", false, "print the raw API response")
	root.PersistentFlags().StringVarP(&app.workspace, "workspace", "w", "", "act on this workspace instead of the default")

	root.AddCommand(
		app.loginCmd(), app.logoutCmd(), app.whoamiCmd(),
		app.workspaceCmd(),
		app.issueCmd(),
		app.chatCmd(),
		app.runCmd(),
		app.workflowCmd(),
		app.routineCmd(),
		app.accountCmd(),
		app.repoCmd(),
		app.projectCmd(),
		app.knowledgeCmd("skill", "skills"), app.knowledgeCmd("memory", "memories"), app.teamCmd(),
	)
	return root, app
}

// requireAuth fails early with a clear instruction rather than letting the
// server return a 401 the user has to interpret.
func (a *App) requireAuth() error {
	if a.cfg.Token == "" && os.Getenv("BOTINC_TOKEN") == "" {
		return errors.New("you are not signed in: run `botinc login`")
	}
	return nil
}

// dashIfEmpty keeps a table column aligned when a value is absent.
func dashIfEmpty(s string) string {
	if s == "" {
		return "-"
	}
	return s
}

func plural(n int, one, many string) string {
	if n == 1 {
		return fmt.Sprintf("%d %s", n, one)
	}
	return fmt.Sprintf("%d %s", n, many)
}
