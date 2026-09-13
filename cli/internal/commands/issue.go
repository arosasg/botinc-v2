package commands

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/arosasg/botinc-v2/cli/internal/ui"
)

type issue struct {
	ID          string    `json:"id"`
	Identifier  string    `json:"identifier"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	Priority    string    `json:"priority"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	NeedsYou    any       `json:"needs_you"`
}

type issueComment struct {
	AuthorKind string    `json:"author_kind"`
	Body       string    `json:"body"`
	CreatedAt  time.Time `json:"created_at"`
}

func itoa(n int) string { return strconv.Itoa(n) }

func (a *App) issueCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "issue",
		Aliases: []string{"issues"},
		Short:   "The work register",
	}
	cmd.AddCommand(
		a.issueListCmd(), a.issueNewCmd(), a.issueShowCmd(), a.issueEditCmd(),
		a.issueCommentCmd(), a.issueWorkCmd(), a.issueApproveCmd(), a.issueChangesCmd(),
	)
	return cmd
}

func (a *App) issueListCmd() *cobra.Command {
	var status string
	var mine bool
	cmd := &cobra.Command{
		Use:   "list",
		Short: "List issues",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			q := "/issues"
			params := []string{}
			if status != "" {
				params = append(params, "status="+status)
			}
			if mine {
				params = append(params, "assignee=me")
			}
			if len(params) > 0 {
				q += "?" + strings.Join(params, "&")
			}
			var out struct {
				Issues []issue `json:"issues"`
			}
			if err := a.api.GetW(cmd.Context(), q, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			if len(out.Issues) == 0 {
				ui.Say("No issues.")
				return nil
			}
			t := ui.NewTable("id", "status", "priority", "title", "updated")
			for _, i := range out.Issues {
				updated := i.UpdatedAt
				t.Row(i.Identifier, i.Status, i.Priority, ui.Truncate(i.Title, 56), ui.Ago(&updated))
			}
			t.Flush()
			return nil
		},
	}
	cmd.Flags().StringVarP(&status, "status", "s", "", "filter by status, comma separated")
	cmd.Flags().BoolVar(&mine, "mine", false, "only issues assigned to you")
	return cmd
}

func (a *App) issueNewCmd() *cobra.Command {
	var body, bodyFile, priority, project, workflow string
	var start bool
	cmd := &cobra.Command{
		Use:   "new <title>",
		Short: "File an issue",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			description := body
			if bodyFile != "" {
				// A long description belongs in a file: a heredoc on the
				// command line swallows trailing flags.
				raw, err := os.ReadFile(bodyFile)
				if err != nil {
					return err
				}
				description = string(raw)
			}
			in := map[string]any{
				"title": strings.Join(args, " "), "description": description, "start": start,
			}
			if priority != "" {
				in["priority"] = priority
			}
			if workflow != "" {
				in["workflow"] = workflow
			}
			if project != "" {
				in["project_id"] = project
			}
			var out struct {
				Issue issue `json:"issue"`
				Run   *struct {
					ID string `json:"id"`
				} `json:"run"`
			}
			if err := a.api.PostW(cmd.Context(), "/issues", in, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Filed %s.", out.Issue.Identifier)
			if out.Run != nil {
				ui.Say("Working on it. Follow with `botinc run watch %s`.", out.Run.ID)
			}
			return nil
		},
	}
	cmd.Flags().StringVarP(&body, "body", "b", "", "the description")
	cmd.Flags().StringVarP(&bodyFile, "body-file", "F", "", "read the description from a file")
	cmd.Flags().StringVarP(&priority, "priority", "p", "", "urgent, high, normal or low")
	cmd.Flags().StringVar(&project, "project", "", "project id")
	cmd.Flags().StringVar(&workflow, "workflow", "", "workflow key")
	cmd.Flags().BoolVar(&start, "start", false, "start work immediately")
	return cmd
}

func (a *App) issueShowCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "show <id>",
		Short: "Show one issue",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			var out struct {
				Issue    issue          `json:"issue"`
				Comments []issueComment `json:"comments"`
				Runs     []struct {
					ID        string `json:"id"`
					Status    string `json:"status"`
					Purpose   string `json:"purpose"`
					CostCents int    `json:"cost_cents"`
				} `json:"runs"`
				Steps []struct {
					Key    string `json:"key"`
					Name   string `json:"name"`
					Status string `json:"status"`
				} `json:"steps"`
			}
			if err := a.api.GetW(cmd.Context(), "/issues/"+args[0], &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Field("Issue", out.Issue.Identifier)
			ui.Field("Title", out.Issue.Title)
			ui.Field("Status", out.Issue.Status)
			ui.Field("Priority", out.Issue.Priority)
			if strings.TrimSpace(out.Issue.Description) != "" {
				ui.Say("")
				ui.Say("%s", strings.TrimSpace(out.Issue.Description))
			}
			if len(out.Steps) > 0 {
				ui.Say("")
				t := ui.NewTable("step", "status")
				for _, s := range out.Steps {
					t.Row(s.Name, s.Status)
				}
				t.Flush()
			}
			if len(out.Runs) > 0 {
				ui.Say("")
				t := ui.NewTable("run", "purpose", "status", "cost")
				for _, r := range out.Runs {
					t.Row(r.ID, r.Purpose, r.Status, ui.Money(r.CostCents))
				}
				t.Flush()
			}
			for _, c := range out.Comments {
				ui.Say("")
				created := c.CreatedAt
				ui.Say("%s, %s", c.AuthorKind, ui.Ago(&created))
				ui.Say("%s", strings.TrimSpace(c.Body))
			}
			return nil
		},
	}
}

func (a *App) issueEditCmd() *cobra.Command {
	var title, status, priority string
	cmd := &cobra.Command{
		Use:   "edit <id>",
		Short: "Change an issue",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			in := map[string]any{}
			if title != "" {
				in["title"] = title
			}
			if status != "" {
				in["status"] = status
			}
			if priority != "" {
				in["priority"] = priority
			}
			if len(in) == 0 {
				return errors.New("nothing to change: pass --title, --status or --priority")
			}
			var out struct {
				Issue issue `json:"issue"`
			}
			if err := a.api.PatchW(cmd.Context(), "/issues/"+args[0], in, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Updated %s.", out.Issue.Identifier)
			return nil
		},
	}
	cmd.Flags().StringVar(&title, "title", "", "new title")
	cmd.Flags().StringVarP(&status, "status", "s", "", "new status")
	cmd.Flags().StringVarP(&priority, "priority", "p", "", "new priority")
	return cmd
}

func (a *App) issueCommentCmd() *cobra.Command {
	var bodyFile string
	cmd := &cobra.Command{
		Use:   "comment <id> [text]",
		Short: "Comment on an issue",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			body := strings.Join(args[1:], " ")
			if bodyFile != "" {
				raw, err := os.ReadFile(bodyFile)
				if err != nil {
					return err
				}
				body = string(raw)
			}
			if strings.TrimSpace(body) == "" {
				return errors.New("say something: pass text or --body-file")
			}
			if err := a.api.PostW(cmd.Context(), "/issues/"+args[0]+"/comments", map[string]any{"body": body}, nil); err != nil {
				return err
			}
			ui.Say("Commented on %s.", args[0])
			return nil
		},
	}
	cmd.Flags().StringVarP(&bodyFile, "body-file", "F", "", "read the comment from a file")
	return cmd
}

func (a *App) issueWorkCmd() *cobra.Command {
	var instructions string
	var watch bool
	cmd := &cobra.Command{
		Use:   "work <id>",
		Short: "Put the company to work on an issue",
		Long: `Queue a run against this issue.

The run executes remotely in a sandbox. It opens a draft pull request and
stops for your approval: nothing merges itself.`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			var out struct {
				Run struct {
					ID string `json:"id"`
				} `json:"run"`
			}
			if err := a.api.PostW(cmd.Context(), "/issues/"+args[0]+"/work", map[string]any{"instructions": instructions}, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Started run %s on %s.", out.Run.ID, args[0])
			if watch {
				return a.watchRun(cmd, out.Run.ID)
			}
			ui.Say("Follow it with `botinc run watch %s`.", out.Run.ID)
			return nil
		},
	}
	cmd.Flags().StringVarP(&instructions, "say", "m", "", "extra instructions for this run")
	cmd.Flags().BoolVar(&watch, "watch", false, "follow the run until it finishes")
	return cmd
}

func (a *App) issueApproveCmd() *cobra.Command {
	var note string
	var merge bool
	cmd := &cobra.Command{
		Use:   "approve <id>",
		Short: "Approve the change on an issue",
		Long: `Record your approval.

Approval alone closes the issue. Pass --merge to also queue a merge run;
the merge is recorded work, not a silent database change.`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			var out struct {
				Status string `json:"status"`
				Run    *struct {
					ID string `json:"id"`
				} `json:"run"`
			}
			if err := a.api.PostW(cmd.Context(), "/issues/"+args[0]+"/approve", map[string]any{"note": note, "merge": merge}, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Approved %s.", args[0])
			if out.Run != nil {
				ui.Say("Merging in run %s.", out.Run.ID)
			}
			return nil
		},
	}
	cmd.Flags().StringVarP(&note, "note", "m", "", "a note for the record")
	cmd.Flags().BoolVar(&merge, "merge", false, "also queue the merge")
	return cmd
}

func (a *App) issueChangesCmd() *cobra.Command {
	var note string
	cmd := &cobra.Command{
		Use:   "changes <id>",
		Short: "Ask for changes and send it back",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			if strings.TrimSpace(note) == "" {
				return errors.New("say what should change: pass --note")
			}
			var out struct {
				Run struct {
					ID string `json:"id"`
				} `json:"run"`
			}
			if err := a.api.PostW(cmd.Context(), "/issues/"+args[0]+"/changes", map[string]any{"note": note}, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Sent %s back. Run %s.", args[0], out.Run.ID)
			return nil
		},
	}
	cmd.Flags().StringVarP(&note, "note", "m", "", "what should change")
	return cmd
}
