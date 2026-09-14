package commands

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/arosasg/botinc-v2/cli/internal/ui"
	"github.com/spf13/cobra"
	"os"
	"strings"
)

// knowledgeCmd uses the same workspace-scoped contracts as the browser.
func (a *App) knowledgeCmd(kind, resource string) *cobra.Command {
	cmd := &cobra.Command{Use: kind, Short: "Manage workspace " + resource}
	cmd.AddCommand(&cobra.Command{Use: "list", Args: cobra.NoArgs, RunE: func(cmd *cobra.Command, _ []string) error {
		if err := a.requireAuth(); err != nil {
			return err
		}
		var out map[string]json.RawMessage
		if err := a.api.GetW(cmd.Context(), "/"+resource, &out); err != nil {
			return err
		}
		if ui.Emit(out) {
			return nil
		}
		var rows []struct {
			ID    string `json:"id"`
			Name  string `json:"name"`
			Body  string `json:"body"`
			Scope string `json:"scope"`
		}
		if err := json.Unmarshal(out[resource], &rows); err != nil {
			return err
		}
		t := ui.NewTable("id", "name / scope", "body")
		for _, row := range rows {
			name := row.Name
			if name == "" {
				name = row.Scope
			}
			t.Row(row.ID, name, strings.Split(row.Body, "\n")[0])
		}
		t.Flush()
		return nil
	}})
	for _, verb := range []string{"add", "update"} {
		var name, body, file, scope, project string
		var pinned, enabled bool
		action := &cobra.Command{Use: verb, Args: cobra.NoArgs, RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			if file != "" {
				raw, err := os.ReadFile(file)
				if err != nil {
					return err
				}
				body = string(raw)
			}
			in := map[string]any{}
			if cmd.Flags().Changed("body") || file != "" {
				in["body"] = body
			}
			if kind == "skill" {
				if cmd.Flags().Changed("name") {
					in["name"] = name
				}
				if cmd.Flags().Changed("enabled") {
					in["enabled"] = enabled
				}
			} else {
				if cmd.Flags().Changed("scope") {
					in["scope"] = scope
				}
				if project != "" {
					in["project_id"] = project
				}
				if cmd.Flags().Changed("pinned") {
					in["pinned"] = pinned
				}
			}
			if verb == "add" && strings.TrimSpace(body) == "" {
				return errors.New("provide --body or --body-file")
			}
			if verb == "add" && kind == "skill" && strings.TrimSpace(name) == "" {
				return errors.New("provide --name")
			}
			var out map[string]any
			var err error
			if verb == "add" {
				err = a.api.PostW(cmd.Context(), "/"+resource, in, &out)
			} else {
				err = a.api.PatchW(cmd.Context(), "/"+resource+"/"+args[0], in, &out)
			}
			if err != nil {
				return err
			}
			if !ui.Emit(out) {
				ui.Say("%s saved.", kind)
			}
			return nil
		}}
		if verb == "update" {
			action.Use = "update <id>"
			action.Args = cobra.ExactArgs(1)
		}
		action.Flags().StringVar(&body, "body", "", "instruction or memory text")
		action.Flags().StringVar(&file, "body-file", "", "read text from a file")
		if kind == "skill" {
			action.Flags().StringVar(&name, "name", "", "skill name")
			action.Flags().BoolVar(&enabled, "enabled", true, "include this skill in runs")
		} else {
			action.Flags().StringVar(&scope, "scope", "personal", "personal, workspace or project")
			action.Flags().StringVar(&project, "project", "", "project ID for project scope")
			action.Flags().BoolVar(&pinned, "pinned", false, "pin this memory")
		}
		cmd.AddCommand(action)
	}
	cmd.AddCommand(&cobra.Command{Use: "remove <id>", Args: cobra.ExactArgs(1), RunE: func(cmd *cobra.Command, args []string) error {
		if err := a.requireAuth(); err != nil {
			return err
		}
		if err := a.api.DeleteW(cmd.Context(), "/"+resource+"/"+args[0], nil); err != nil {
			return err
		}
		if !ui.Emit(map[string]bool{"ok": true}) {
			ui.Say("Removed %s.", args[0])
		}
		return nil
	}})
	return cmd
}
func (a *App) teamCmd() *cobra.Command {
	cmd := &cobra.Command{Use: "team", Short: "Members and invitation links"}
	cmd.AddCommand(&cobra.Command{Use: "list", Args: cobra.NoArgs, RunE: func(cmd *cobra.Command, _ []string) error {
		if err := a.requireAuth(); err != nil {
			return err
		}
		var out map[string]any
		if err := a.api.GetW(cmd.Context(), "/members", &out); err != nil {
			return err
		}
		if !ui.Emit(out) {
			raw, _ := json.MarshalIndent(out, "", "  ")
			fmt.Fprintln(cmd.OutOrStdout(), string(raw))
		}
		return nil
	}})
	var role string
	invite := &cobra.Command{Use: "invite <email>", Args: cobra.ExactArgs(1), RunE: func(cmd *cobra.Command, args []string) error {
		if err := a.requireAuth(); err != nil {
			return err
		}
		var out struct {
			Link string `json:"link"`
		}
		if err := a.api.PostW(cmd.Context(), "/invitations", map[string]string{"email": args[0], "role": role}, &out); err != nil {
			return err
		}
		if !ui.Emit(out) {
			ui.Say("Invitation link: %s", out.Link)
		}
		return nil
	}}
	invite.Flags().StringVar(&role, "role", "member", "member or admin")
	cmd.AddCommand(invite)
	return cmd
}
