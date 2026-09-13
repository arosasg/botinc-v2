package commands

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/arosasg/botinc-v2/cli/internal/ui"
)

type run struct {
	ID         string     `json:"id"`
	Purpose    string     `json:"purpose"`
	Status     string     `json:"status"`
	Model      string     `json:"model"`
	Funding    string     `json:"funding"`
	CostCents  int        `json:"cost_cents"`
	Error      string     `json:"error"`
	QueuedAt   time.Time  `json:"queued_at"`
	StartedAt  *time.Time `json:"started_at"`
	FinishedAt *time.Time `json:"finished_at"`
}

func (r run) done() bool {
	switch r.Status {
	case "done", "failed", "cancelled":
		return true
	}
	return false
}

func (a *App) runCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "run",
		Aliases: []string{"runs"},
		Short:   "Work the company has executed",
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "list",
			Short: "List recent runs",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Runs []run `json:"runs"`
				}
				if err := a.api.GetW(cmd.Context(), "/runs", &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				if len(out.Runs) == 0 {
					ui.Say("No runs.")
					return nil
				}
				t := ui.NewTable("run", "purpose", "status", "model", "cost", "queued")
				for _, r := range out.Runs {
					queued := r.QueuedAt
					t.Row(r.ID, r.Purpose, r.Status, dashIfEmpty(r.Model), ui.Money(r.CostCents), ui.Ago(&queued))
				}
				t.Flush()
				return nil
			},
		},
		&cobra.Command{
			Use:   "show <id>",
			Short: "Show one run",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				out, err := a.fetchRun(cmd, args[0])
				if err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				ui.Field("Run", out.Run.ID)
				ui.Field("Purpose", out.Run.Purpose)
				ui.Field("Status", out.Run.Status)
				ui.Field("Model", dashIfEmpty(out.Run.Model))
				ui.Field("Funding", out.Run.Funding)
				ui.Field("Cost", ui.Money(out.Run.CostCents))
				if out.Run.Error != "" {
					ui.Field("Error", out.Run.Error)
				}
				if len(out.Steps) > 0 {
					ui.Say("")
					t := ui.NewTable("step", "kind", "status", "cost")
					for _, s := range out.Steps {
						t.Row(s.Name, s.Kind, s.Status, ui.Money(s.CostCents))
					}
					t.Flush()
				}
				return nil
			},
		},
		a.runWatchCmd(),
		&cobra.Command{
			Use:   "cancel <id>",
			Short: "Stop a run",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				if err := a.api.PostW(cmd.Context(), "/runs/"+args[0]+"/cancel", map[string]any{}, nil); err != nil {
					return err
				}
				ui.Say("Cancelled run %s.", args[0])
				return nil
			},
		},
	)
	return cmd
}

type runDetail struct {
	Run   run `json:"run"`
	Steps []struct {
		Key       string `json:"key"`
		Name      string `json:"name"`
		Kind      string `json:"kind"`
		Status    string `json:"status"`
		CostCents int    `json:"cost_cents"`
	} `json:"steps"`
}

func (a *App) fetchRun(cmd *cobra.Command, id string) (runDetail, error) {
	var out runDetail
	err := a.api.GetW(cmd.Context(), "/runs/"+id, &out)
	return out, err
}

func (a *App) runWatchCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "watch <id>",
		Short: "Follow a run until it finishes",
		Long: `Print each event as the run produces it, then exit with the run's outcome.

The exit code is 0 only when the run finished successfully, so this is safe
to use as a gate in a script.`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			return a.watchRun(cmd, args[0])
		},
	}
}

// watchRun polls the run's events and prints them in order. Polling rather
// than a socket keeps this usable from anywhere a plain HTTP request works.
func (a *App) watchRun(cmd *cobra.Command, id string) error {
	seen := 0
	lastStatus := ""
	for {
		var evs struct {
			Events []struct {
				Seq     int             `json:"seq"`
				Type    string          `json:"type"`
				Payload json.RawMessage `json:"payload"`
			} `json:"events"`
		}
		if err := a.api.GetW(cmd.Context(), fmt.Sprintf("/runs/%s/events?after=%d", id, seen), &evs); err != nil {
			return err
		}
		for _, e := range evs.Events {
			if e.Seq <= seen {
				continue
			}
			seen = e.Seq
			if line := eventLine(e.Type, e.Payload); line != "" {
				ui.Say("%s", line)
			}
		}
		detail, err := a.fetchRun(cmd, id)
		if err != nil {
			return err
		}
		if detail.Run.Status != lastStatus {
			lastStatus = detail.Run.Status
			ui.Say("[%s]", detail.Run.Status)
		}
		if detail.Run.done() {
			if ui.Emit(detail) {
				return nil
			}
			ui.Say("")
			ui.Field("Status", detail.Run.Status)
			ui.Field("Cost", ui.Money(detail.Run.CostCents))
			if detail.Run.Error != "" {
				ui.Field("Error", detail.Run.Error)
			}
			if detail.Run.Status != "done" {
				return fmt.Errorf("the run %s", detail.Run.Status)
			}
			return nil
		}
		select {
		case <-cmd.Context().Done():
			return cmd.Context().Err()
		case <-time.After(2 * time.Second):
		}
	}
}

// eventLine renders one run event as a single readable line.
func eventLine(typ string, payload json.RawMessage) string {
	var p map[string]any
	_ = json.Unmarshal(payload, &p)
	get := func(keys ...string) string {
		for _, k := range keys {
			if v, ok := p[k].(string); ok && strings.TrimSpace(v) != "" {
				return strings.TrimSpace(v)
			}
		}
		return ""
	}
	switch typ {
	case "notice":
		return get("text")
	case "tool":
		name := get("name", "tool", "tool_name")
		if name == "" {
			return ""
		}
		if target := get("file", "path", "command"); target != "" {
			return name + "  " + ui.Truncate(target, 72)
		}
		return name
	case "error":
		if msg := get("message", "error", "line"); msg != "" {
			return "error: " + msg
		}
		return "error"
	case "result":
		return get("result", "text")
	default:
		return ui.Truncate(get("line", "text", "message"), 120)
	}
}
