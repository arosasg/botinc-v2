// Package mail sends the few transactional messages the product needs.
// Delivery fails explicitly when no provider is configured.
package mail

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"html"
	"log/slog"
	"net"
	stdmail "net/mail"
	"net/smtp"
	"strings"
	"time"

	"github.com/resend/resend-go/v2"
)

type Sender struct {
	smtp   SMTPConfig
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

type SMTPConfig struct{ Host, Port, Username, Password, From string }

func NewSMTP(cfg SMTPConfig, log *slog.Logger) *Sender {
	return &Sender{smtp: cfg, from: cfg.From, log: log}
}

func (s *Sender) Enabled() bool { return s.client != nil || s.smtp.Host != "" }

// SMTP requires TLS before authentication and bounds the entire conversation.
func (s *Sender) sendSMTP(ctx context.Context, to, subject, body string) error {
	from, err := stdmail.ParseAddress(s.from)
	if err != nil {
		return fmt.Errorf("invalid sender: %w", err)
	}
	recipient, err := stdmail.ParseAddress(to)
	if err != nil {
		return fmt.Errorf("invalid recipient: %w", err)
	}
	if strings.ContainsAny(subject, "\r\n") {
		return errors.New("invalid subject")
	}
	port := s.smtp.Port
	if port == "" {
		port = "587"
	}
	conn, err := (&net.Dialer{Timeout: 15 * time.Second}).DialContext(ctx, "tcp", net.JoinHostPort(s.smtp.Host, port))
	if err != nil {
		return err
	}
	defer conn.Close()
	deadline := time.Now().Add(30 * time.Second)
	if d, ok := ctx.Deadline(); ok && d.Before(deadline) {
		deadline = d
	}
	_ = conn.SetDeadline(deadline)
	stop := context.AfterFunc(ctx, func() { _ = conn.Close() })
	defer stop()
	tlsConfig := &tls.Config{ServerName: s.smtp.Host, MinVersion: tls.VersionTLS12}
	if port == "465" {
		secure := tls.Client(conn, tlsConfig)
		if err := secure.HandshakeContext(ctx); err != nil {
			return err
		}
		conn = secure
	}
	client, err := smtp.NewClient(conn, s.smtp.Host)
	if err != nil {
		return err
	}
	defer client.Close()
	if port != "465" {
		if err := client.StartTLS(tlsConfig); err != nil {
			return fmt.Errorf("SMTP requires STARTTLS: %w", err)
		}
	}
	if s.smtp.Username != "" {
		if err := client.Auth(smtp.PlainAuth("", s.smtp.Username, s.smtp.Password, s.smtp.Host)); err != nil {
			return err
		}
	}
	if err := client.Mail(from.Address); err != nil {
		return err
	}
	if err := client.Rcpt(recipient.Address); err != nil {
		return err
	}
	writer, err := client.Data()
	if err != nil {
		return err
	}
	message := "From: " + from.String() + "\r\nTo: " + recipient.String() + "\r\nSubject: " + subject + "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" + strings.ReplaceAll(strings.ReplaceAll(body, "\r\n", "\n"), "\n", "\r\n") + "\r\n"
	if _, err := writer.Write([]byte(message)); err != nil {
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}
	// DATA acceptance is the delivery receipt; a later QUIT failure must not
	// invite a duplicate send of a message the relay already accepted.
	_ = client.Quit()
	return nil
}

func (s *Sender) send(ctx context.Context, to, subject, html, text string) error {
	if s.smtp.Host != "" {
		return s.sendSMTP(ctx, to, subject, text)
	}
	if s.client == nil {
		return errors.New("email delivery is not configured")
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
</div>`, html.EscapeString(workspace), html.EscapeString(url))
	return s.send(ctx, to, "You have been added to "+workspace, html, text)
}
