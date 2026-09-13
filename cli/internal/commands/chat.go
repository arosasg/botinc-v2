package commands

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/arosasg/botinc-v2/cli/internal/ui"
)

type conversation struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Model     string    `json:"model"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (a *App) chatCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "chat",
		Aliases: []string{"chats"},
		Short:   "Conversations with the Operator",
	}
	cmd.AddCommand(a.chatNewCmd(), a.chatListCmd(), a.chatShowCmd(), a.chatSendCmd())
	return cmd
}

func (a *App) chatNewCmd() *cobra.Command {
	var model string
	var watch bool
	cmd := &cobra.Command{
		Use:   "new <message>",
		Short: "Start a conversation",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			in := map[string]any{"message": strings.Join(args, " ")}
			if model != "" {
				in["model"] = model
			}
			var out struct {
				Conversation conversation `json:"conversation"`
				Run          *struct {
					ID string `json:"id"`
				} `json:"run"`
			}
			if err := a.api.PostW(cmd.Context(), "/conversations", in, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Say("Started %s.", out.Conversation.ID)
			if out.Run != nil && watch {
				return a.watchRun(cmd, out.Run.ID)
			}
			if out.Run != nil {
				ui.Say("Follow it with `botinc run watch %s`.", out.Run.ID)
			}
			return nil
		},
	}
	cmd.Flags().StringVar(&model, "model", "", "the model to answer with")
	cmd.Flags().BoolVar(&watch, "watch", false, "follow the answer as it arrives")
	return cmd
}

func (a *App) chatListCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "list",
		Short: "List conversations",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			var out struct {
				Conversations []conversation `json:"conversations"`
			}
			if err := a.api.GetW(cmd.Context(), "/conversations", &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			if len(out.Conversations) == 0 {
				ui.Say("No conversations.")
				return nil
			}
			t := ui.NewTable("id", "title", "model", "updated")
			for _, c := range out.Conversations {
				updated := c.UpdatedAt
				t.Row(c.ID, ui.Truncate(c.Title, 56), dashIfEmpty(c.Model), ui.Ago(&updated))
			}
			t.Flush()
			return nil
		},
	}
}

func (a *App) chatShowCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "show <id>",
		Short: "Read a conversation",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := a.requireAuth(); err != nil {
				return err
			}
			var out struct {
				Conversation conversation `json:"conversation"`
				Messages     []struct {
					Role      string    `json:"role"`
					Body      string    `json:"body"`
					CreatedAt time.Time `json:"created_at"`
				} `json:"messages"`
			}
			if err := a.api.GetW(cmd.Context(), "/conversations/"+args[0], &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			ui.Field("Title", out.Conversation.Title)
			for _, m := range out.Messages {
				ui.Say("")
				created := m.CreatedAt
				ui.Say("%s, %s", m.Role, ui.Ago(&created))
				ui.Say("%s", strings.TrimSpace(m.Body))
			}
			return nil
		},
	}
}

func (a *App) chatSendCmd() *cobra.Command {
	var bodyFile string
	var queue, watch bool
	cmd := &cobra.Command{
		Use:   "send <id> [message]",
		Short: "Send a message to a conversation",
		Long: `Send a message.

If a run is already answering, --queue holds the message until it finishes
rather than interrupting it.`,
		Args: cobra.MinimumNArgs(1),
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
				return errors.New("say something: pass a message or --body-file")
			}
			path := "/conversations/" + args[0] + "/messages"
			if queue {
				path = "/conversations/" + args[0] + "/queue"
			}
			var out struct {
				Run *struct {
					ID string `json:"id"`
				} `json:"run"`
			}
			if err := a.api.PostW(cmd.Context(), path, map[string]any{"body": body}, &out); err != nil {
				return err
			}
			if ui.Emit(out) {
				return nil
			}
			if queue {
				ui.Say("Queued.")
				return nil
			}
			if out.Run != nil && watch {
				return a.watchRun(cmd, out.Run.ID)
			}
			ui.Say("Sent.")
			return nil
		},
	}
	cmd.Flags().StringVarP(&bodyFile, "body-file", "F", "", "read the message from a file")
	cmd.Flags().BoolVar(&queue, "queue", false, "queue behind the run in flight")
	cmd.Flags().BoolVar(&watch, "watch", false, "follow the answer")
	return cmd
}
