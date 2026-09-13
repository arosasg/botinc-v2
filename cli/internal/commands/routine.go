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

type routine struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Trigger     json.RawMessage `json:"trigger"`
	Prompt      string          `json:"prompt"`
	Model       string          `json:"model"`
	Enabled     bool            `json:"enabled"`
	LastRunAt   *time.Time      `json:"last_run_at"`
	NextRunAt   *time.Time      `json:"next_run_at"`
	WebhookURL  string          `json:"webhook_url"`
}

func (r routine) triggerLabel() string {
	var t struct {
		Kind   string `json:"kind"`
		Cron   string `json:"cron"`
		TZ     string `json:"tz"`
		Source string `json:"source"`
	}
	_ = json.Unmarshal(r.Trigger, &t)
	switch t.Kind {
	case "schedule":
		if t.TZ != "" {
			return t.Cron + " " + t.TZ
		}
		return t.Cron
	case "event":
		return "event " + t.Source
	default:
		return t.Kind
	}
}

// routineCmd is the scheduled, webhook and manual automation the workspace
// calls a routine. `autopilot` is kept as an alias for the older name.
func (a *App) routineCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "routine",
		Aliases: []string{"routines", "autopilot", "autopilots"},
		Short:   "Work that runs on a schedule, a webhook or a word from you",
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "list",
			Short: "List routines",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Autopilots []routine `json:"autopilots"`
				}
				if err := a.api.GetW(cmd.Context(), "/autopilots", &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				if len(out.Autopilots) == 0 {
					ui.Say("No routines.")
					return nil
				}
				t := ui.NewTable("id", "name", "trigger", "state", "last run", "next run")
				for _, r := range out.Autopilots {
					state := "on"
					if !r.Enabled {
						state = "paused"
					}
					next := "-"
					if r.NextRunAt != nil {
						next = r.NextRunAt.Format("2006-01-02 15:04")
					}
					t.Row(r.ID, ui.Truncate(r.Name, 28), r.triggerLabel(), state, ui.Ago(r.LastRunAt), next)
				}
				t.Flush()
				return nil
			},
		},
		a.routineNewCmd(),
		&cobra.Command{
			Use:   "show <id>",
			Short: "Show a routine and its runs",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Autopilot routine `json:"autopilot"`
					Runs      []struct {
						RunID     *string   `json:"run_id"`
						Status    string    `json:"status"`
						Summary   string    `json:"summary"`
						CreatedAt time.Time `json:"created_at"`
					} `json:"runs"`
				}
				if err := a.api.GetW(cmd.Context(), "/autopilots/"+args[0], &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				ui.Field("Routine", out.Autopilot.Name)
				ui.Field("Trigger", out.Autopilot.triggerLabel())
				ui.Field("Model", dashIfEmpty(out.Autopilot.Model))
				if out.Autopilot.WebhookURL != "" {
					ui.Field("Webhook", out.Autopilot.WebhookURL)
				}
				if strings.TrimSpace(out.Autopilot.Prompt) != "" {
					ui.Say("")
					ui.Say("%s", strings.TrimSpace(out.Autopilot.Prompt))
				}
				if len(out.Runs) > 0 {
					ui.Say("")
					t := ui.NewTable("run", "status", "when")
					for _, r := range out.Runs {
						id := "-"
						if r.RunID != nil {
							id = *r.RunID
						}
						created := r.CreatedAt
						t.Row(id, r.Status, ui.Ago(&created))
					}
					t.Flush()
				}
				return nil
			},
		},
		&cobra.Command{
			Use:   "trigger <id>",
			Short: "Run a routine now",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Run struct {
						ID string `json:"id"`
					} `json:"run"`
				}
				if err := a.api.PostW(cmd.Context(), "/autopilots/"+args[0]+"/trigger", map[string]any{}, &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				ui.Say("Started run %s.", out.Run.ID)
				return nil
			},
		},
		a.routineToggleCmd("pause", false),
		a.routineToggleCmd("resume", true),
		&cobra.Command{
			Use:   "delete <id>",
			Short: "Remove a routine",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				if err := a.api.DeleteW(cmd.Context(), "/autopilots/"+args[0], nil); err != nil {
					return err
				}
				ui.Say("Removed %s.", args[0])
				return nil
			},
		},
	)
	return cmd
}

func (a *App) routineToggleCmd(verb string, enabled bool) *cobra.Command {
	return &cobra.Command{
		Use:   verb + " <id>",
		Short: strings.ToUpper(verb[:1]) + verb[1:] + " a routine",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			if err := a.api.PatchW(cmd.Context(), "/autopilots/"+args[0], map[string]any{"enabled": enabled}, nil); err != nil {
				return err
			}
			if enabled {
				ui.Say("Resumed %s.", args[0])
			} else {
				ui.Say("Paused %s.", args[0])
			}
			return nil
		},
	}
}

func (a *App) routineNewCmd() *cobra.Command {
	var name, prompt, promptFile, cron, tz, model string
	var webhook bool
	cmd := &cobra.Command{
		Use:   "new",
		Short: "Add a routine",
		Long: `Add a routine.

Pass --cron for a schedule, --webhook for one triggered by an HTTP call, or
neither for one you start by hand. A webhook routine prints its secret once:
store it then, because it is not shown again.`,
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			if promptFile != "" {
				raw, err := os.ReadFile(promptFile)
				if err != nil {
					return err
				}
				prompt = string(raw)
			}
			if strings.TrimSpace(name) == "" || strings.TrimSpace(prompt) == "" {
				return errors.New("a routine needs --name and --prompt")
			}
			trigger := map[string]any{"kind": "manual"}
			switch {
			case cron != "":
				trigger = map[string]any{"kind": "schedule", "cron": cron, "tz": tz}
			case webhook:
				trigger = map[string]any{"kind": "webhook"}
			}
			in := map[string]any{"name": name, "prompt": prompt, "trigger": trigger}
			if model != "" {
				in["model"] = model
			}
			var out struct {
				Autopilot routine `json:"autopilot"`
				Secret    string  `json:"secret"`
				URL       string  `json:"webhook_url"`
			}
			if err := a.api.PostW(cmd.Context(), "/autopilots", in, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Added %s.", out.Autopilot.Name)
			if out.Autopilot.NextRunAt != nil {
				ui.Say("Next run %s.", out.Autopilot.NextRunAt.Format("2006-01-02 15:04 MST"))
			}
			if out.Secret != "" {
				ui.Say("")
				ui.Say("Webhook %s", out.URL)
				ui.Say("Secret   %s", out.Secret)
				ui.Say("")
				ui.Say("Sign the request body with that secret and send it as X-BotInc-Signature. It is not shown again.")
			}
			return nil
		},
	}
	cmd.Flags().StringVar(&name, "name", "", "what to call it")
	cmd.Flags().StringVar(&prompt, "prompt", "", "what it should do")
	cmd.Flags().StringVar(&promptFile, "prompt-file", "", "read the prompt from a file")
	cmd.Flags().StringVar(&cron, "cron", "", "a cron expression, for a schedule")
	cmd.Flags().StringVar(&tz, "tz", "", "time zone for the schedule")
	cmd.Flags().StringVar(&model, "model", "", "the model to use")
	cmd.Flags().BoolVar(&webhook, "webhook", false, "trigger this routine by a signed HTTP call")
	return cmd
}
