// Package mail sends the few transactional messages the product needs.
// Without a Resend key the sender is a no-op that logs, so development never
// depends on a third party being reachable.
package mail

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/resend/resend-go/v2"
)

type Sender struct {
	client *resend.Client
	from   string
	log    *slog.Logger
}

func New(apiKey, from string, log *slog.Logger) *Sender {
	s := &Sender{from: from, log: log}
	if apiKey != "" {
		s.client = resend.NewClient(apiKey)
	}
	return s
}

func (s *Sender) Enabled() bool { return s.client != nil }

func (s *Sender) send(ctx context.Context, to, subject, html, text string) error {
	if s.client == nil {
		s.log.Info("mail not configured; message dropped", "to", to, "subject", subject)
		return nil
	}
	_, err := s.client.Emails.SendWithContext(ctx, &resend.SendEmailRequest{
		From: s.from, To: []string{to}, Subject: subject, Html: html, Text: text,
	})
	return err
}

// SendCode delivers a sign-in code. The copy states what happened and stops.
func (s *Sender) SendCode(ctx context.Context, to, code string) error {
	text := fmt.Sprintf("Your BotInc sign-in code is %s. It expires in 10 minutes.", code)
	html := fmt.Sprintf(`<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0c0a08">
<p style="font-size:16px;line-height:1.5">Your BotInc sign-in code.</p>
<p style="font-family:ui-monospace,Menlo,monospace;font-size:28px;letter-spacing:0.12em;margin:24px 0">%s</p>
<p style="font-size:14px;color:#6b7280">It expires in 10 minutes. If you did not ask for it, ignore this message.</p>
</div>`, code)
	return s.send(ctx, to, "Your BotInc sign-in code", html, text)
}

// SendInvite tells someone they have been added to a workspace.
func (s *Sender) SendInvite(ctx context.Context, to, workspace, url string) error {
	text := fmt.Sprintf("You have been added to the %s workspace on BotInc. Accept: %s", workspace, url)
	html := fmt.Sprintf(`<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0c0a08">
<p style="font-size:16px;line-height:1.5">You have been added to the <b style="font-weight:400">%s</b> workspace on BotInc.</p>
<p><a href="%s" style="display:inline-block;background:#007fff;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;font-size:14px">Accept the invitation</a></p>
</div>`, workspace, url)
	return s.send(ctx, to, "You have been added to "+workspace, html, text)
}
