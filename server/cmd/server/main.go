// Command server is the BotInc v2 API. One process: HTTP, WebSocket fan-out
// and the scheduler. It applies its own migrations at boot and refuses to
// start on a database it cannot reach.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/arosasg/botinc-v2/server/internal/api"
	"github.com/arosasg/botinc-v2/server/internal/auth"
	"github.com/arosasg/botinc-v2/server/internal/config"
	"github.com/arosasg/botinc-v2/server/internal/db"
	"github.com/arosasg/botinc-v2/server/internal/mail"
	"github.com/arosasg/botinc-v2/server/internal/realtime"
	"github.com/arosasg/botinc-v2/server/internal/runs"
	"github.com/arosasg/botinc-v2/server/internal/sandbox"
	"github.com/arosasg/botinc-v2/server/internal/scheduler"
	"github.com/arosasg/botinc-v2/server/migrations"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	if err := run(log); err != nil {
		log.Error("server stopped", "err", err)
		os.Exit(1)
	}
}

func run(log *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	boot, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	database, err := db.Open(boot, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer database.Close()
	if err := db.Migrate(boot, database, migrations.FS, log); err != nil {
		return err
	}

	mailer := mail.New(cfg.ResendAPIKey, cfg.ResendFromEmail, log)
	if cfg.SMTPHost != "" {
		mailer = mail.NewSMTP(mail.SMTPConfig{Host: cfg.SMTPHost, Port: cfg.SMTPPort, Username: cfg.SMTPUsername, Password: cfg.SMTPPassword, From: cfg.SMTPFrom}, log)
	}
	authSvc := auth.New(database.Pool, cfg.DevLoginCode, cfg.CookieDomain, cfg.Production())
	authSvc.SendCode = mailer.SendCode
	if cfg.AllowedEmails != "" {
		authSvc.AllowedEmails = map[string]bool{}
		for _, email := range strings.Split(cfg.AllowedEmails, ",") {
			authSvc.AllowedEmails[strings.ToLower(strings.TrimSpace(email))] = true
		}
	}

	hub := realtime.New(log, cfg.FrontendOrigin)
	provider, err := pickSandbox(cfg, log)
	if err != nil {
		return err
	}
	log.Info("sandbox provider", "name", provider.Name())

	runSvc := runs.New(database.Pool, hub, provider, log, cfg.PublicAPIURL, cfg.E2BTemplate, cfg.RunTTL)
	server := api.New(cfg, database.Pool, authSvc, hub, runSvc, log)

	sched := scheduler.New(database.Pool, server, log)
	go sched.Run(ctx)

	srv := &http.Server{
		Addr:              ":" + strconv.Itoa(cfg.Port),
		Handler:           server.Router(),
		ReadHeaderTimeout: 10 * time.Second,
		// No WriteTimeout: the WebSocket route holds its connection open.
		IdleTimeout: 120 * time.Second,
	}
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdown)
	}()
	log.Info("listening", "port", cfg.Port, "env", cfg.Env, "frontend", cfg.FrontendOrigin)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

// pickSandbox resolves the configured provider. There is no local daemon in
// v2; the "local" provider is a development subprocess, never a user machine.
func pickSandbox(cfg config.Config, log *slog.Logger) (sandbox.Provider, error) {
	switch cfg.SandboxProvider {
	case "e2b":
		if cfg.E2BAPIKey == "" {
			return nil, errors.New("BOTINC_SANDBOX_PROVIDER=e2b needs E2B_API_KEY")
		}
		return sandbox.NewE2B(cfg.E2BAPIKey), nil
	case "local", "":
		if cfg.Production() {
			return nil, errors.New("the local sandbox provider is not allowed in production")
		}
		bin := os.Getenv("BOTINC_RUNTIME_BINARY")
		work := os.Getenv("BOTINC_RUNTIME_WORKDIR")
		if work == "" {
			work = filepath.Join(os.TempDir(), "botinc-runs")
		}
		return sandbox.NewLocal(bin, work, log), nil
	default:
		return nil, errors.New("unknown BOTINC_SANDBOX_PROVIDER: " + cfg.SandboxProvider)
	}
}
