package commands

import (
	"encoding/json"
	"errors"
	"os"
	"time"

	"github.com/spf13/cobra"

	"github.com/arosasg/botinc-v2/cli/internal/ui"
)

func (a *App) workflowCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "workflow",
		Aliases: []string{"workflows"},
		Short:   "How work moves from filed to merged",
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "list",
			Short: "List workflows",
			Args:  cobra.NoArgs,
			RunE: func(cmd *cobra.Command, _ []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Workflows []struct {
						ID          string  `json:"id"`
						Key         string  `json:"key"`
						Name        string  `json:"name"`
						Description string  `json:"description"`
						ActiveID    *string `json:"active_version_id"`
					} `json:"workflows"`
				}
				if err := a.api.GetW(cmd.Context(), "/workflows", &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				t := ui.NewTable("key", "name", "active", "description")
				for _, w := range out.Workflows {
					active := "no"
					if w.ActiveID != nil {
						active = "yes"
					}
					t.Row(w.Key, w.Name, active, ui.Truncate(w.Description, 60))
				}
				t.Flush()
				return nil
			},
		},
		&cobra.Command{
			Use:   "show <key>",
			Short: "Show a workflow and its versions",
			Args:  cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				var out struct {
					Workflow struct {
						Key         string  `json:"key"`
						Name        string  `json:"name"`
						Description string  `json:"description"`
						ActiveID    *string `json:"active_version_id"`
					} `json:"workflow"`
					Versions []struct {
						ID        string          `json:"id"`
						Version   int             `json:"version"`
						Status    string          `json:"status"`
						Graph     json.RawMessage `json:"graph"`
						CreatedAt time.Time       `json:"created_at"`
					} `json:"versions"`
				}
				if err := a.api.GetW(cmd.Context(), "/workflows/"+args[0], &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				ui.Field("Workflow", out.Workflow.Name)
				ui.Field("Key", out.Workflow.Key)
				ui.Field("About", out.Workflow.Description)
				ui.Say("")
				t := ui.NewTable("version", "status", "steps", "created")
				for _, v := range out.Versions {
					var g struct {
						Nodes []struct {
							Kind string `json:"kind"`
						} `json:"nodes"`
					}
					_ = json.Unmarshal(v.Graph, &g)
					steps := 0
					for _, n := range g.Nodes {
						if n.Kind != "start" && n.Kind != "finish" {
							steps++
						}
					}
					created := v.CreatedAt
					t.Row(itoa(v.Version), v.Status, itoa(steps), ui.Ago(&created))
				}
				t.Flush()
				return nil
			},
		},
		a.workflowApplyCmd(),
		&cobra.Command{
			Use:   "activate <key> <version>",
			Short: "Make a version the active one",
			Args:  cobra.ExactArgs(2),
			RunE: func(cmd *cobra.Command, args []string) error {
				if err := a.requireAuth(); err != nil {
					return err
				}
				if err := a.api.PostW(cmd.Context(), "/workflows/"+args[0]+"/versions/"+args[1]+"/activate", map[string]any{}, nil); err != nil {
					return err
				}
				ui.Say("Version %s of %s is active.", args[1], args[0])
				return nil
			},
		},
	)
	return cmd
}

// workflowApplyCmd writes a graph from a file. A version is immutable, so
// applying always creates a new one rather than editing history.
func (a *App) workflowApplyCmd() *cobra.Command {
	var file, name string
	var activate bool
	cmd := &cobra.Command{
		Use:   "apply [key]",
		Short: "Create a workflow, or a new version of one, from a graph file",
		Long: `Read a graph from a JSON file and store it.

With a key, this adds a version to that workflow. Without one, it creates a
new workflow. Versions are immutable: applying never rewrites an old one.`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			if file == "" {
				return errors.New("pass --file with the graph")
			}
			raw, err := os.ReadFile(file)
			if err != nil {
				return err
			}
			if !json.Valid(raw) {
				return errors.New(file + " is not valid JSON")
			}
			if len(args) == 1 {
				var out struct {
					Version struct {
						Version int    `json:"version"`
						Status  string `json:"status"`
					} `json:"version"`
				}
				if err := a.api.PostW(cmd.Context(), "/workflows/"+args[0]+"/versions", map[string]any{
					"graph": json.RawMessage(raw), "activate": activate,
				}, &out); err != nil {
					return err
				}
				if ui.Emit(out) {
					return nil
				}
				ui.Say("Wrote version %d of %s as %s.", out.Version.Version, args[0], out.Version.Status)
				return nil
			}
			if name == "" {
				return errors.New("a new workflow needs --name")
			}
			var out struct {
				Workflow struct {
					Key string `json:"key"`
				} `json:"workflow"`
			}
			if err := a.api.PostW(cmd.Context(), "/workflows", map[string]any{
				"name": name, "graph": json.RawMessage(raw),
			}, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Created workflow %s.", out.Workflow.Key)
			return nil
		},
	}
	cmd.Flags().StringVarP(&file, "file", "f", "", "the graph, as JSON")
	cmd.Flags().StringVar(&name, "name", "", "name for a new workflow")
	cmd.Flags().BoolVar(&activate, "activate", false, "make the new version active")
	return cmd
}
