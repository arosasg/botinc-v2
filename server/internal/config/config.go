// Package config reads the server's configuration from the environment.
// Names match v1 where the meaning is identical so the same vault entries
// apply; new names are BOTINC_*.
package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AllowedEmails  string
	Env            string // development | test | production
	Port           int
	DatabaseURL    string
	JWTSecret      string
	FrontendOrigin string
	CookieDomain   string
	PublicAPIURL   string

	SMTPHost, SMTPPort, SMTPUsername, SMTPPassword, SMTPFrom string
	ResendAPIKey                                             string
	ResendFromEmail                                          string
	DevLoginCode                                             string // when set (non-production), every login code is this

	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURI  string

	GitHubOAuthClientID, GitHubOAuthClientSecret string
	GitHubAppID                                  string
	GitHubAppPrivateKey                          string
	GitHubAppSlug                                string
	GitHubWebhookSecret                          string

	SandboxProvider string // local | e2b
	E2BAPIKey       string
	E2BTemplate     string
	RuntimeImage    string
	RunTTL          time.Duration

	SecretsKey string // 32-byte hex key for the credential store

	OpenRouterAPIKey string
	StripeSecretKey  string
	StripeWebhook    string
}

func env(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}

func first(def string, keys ...string) string {
	for _, k := range keys {
		if v := strings.TrimSpace(os.Getenv(k)); v != "" {
			return v
		}
	}
	return def
}

func Load() (Config, error) {
	port, _ := strconv.Atoi(env("PORT", env("BACKEND_PORT", "8080")))
	ttl, _ := time.ParseDuration(env("BOTINC_RUN_TTL", "45m"))
	c := Config{
		Env:            env("APP_ENV", "development"),
		Port:           port,
		DatabaseURL:    env("DATABASE_URL", ""),
		JWTSecret:      env("JWT_SECRET", ""),
		FrontendOrigin: env("FRONTEND_ORIGIN", "http://localhost:3100"),
		CookieDomain:   env("COOKIE_DOMAIN", ""),
		PublicAPIURL:   env("BOTINC_PUBLIC_API_URL", "http://localhost:8080"),
		SMTPHost:       env("SMTP_HOST", ""), SMTPPort: env("SMTP_PORT", "587"), SMTPUsername: env("SMTP_USERNAME", ""), SMTPPassword: env("SMTP_PASSWORD", ""), SMTPFrom: env("SMTP_FROM_EMAIL", "BotInc <hello@botinc.ai>"),
		ResendAPIKey:        env("RESEND_API_KEY", ""),
		ResendFromEmail:     env("RESEND_FROM_EMAIL", "BotInc <hello@botinc.ai>"),
		AllowedEmails:       env("BOTINC_ALLOWED_EMAILS", ""),
		DevLoginCode:        first("", "BOTINC_DEV_VERIFICATION_CODE", "MULTICA_DEV_VERIFICATION_CODE"),
		GoogleClientID:      env("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:  env("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURI:   env("GOOGLE_REDIRECT_URI", ""),
		GitHubOAuthClientID: env("GITHUB_OAUTH_CLIENT_ID", ""), GitHubOAuthClientSecret: env("GITHUB_OAUTH_CLIENT_SECRET", ""),
		GitHubAppID:         env("GITHUB_APP_ID", ""),
		GitHubAppPrivateKey: env("GITHUB_APP_PRIVATE_KEY", ""),
		GitHubAppSlug:       env("GITHUB_APP_SLUG", ""),
		GitHubWebhookSecret: env("GITHUB_WEBHOOK_SECRET", ""),
		SandboxProvider:     env("BOTINC_SANDBOX_PROVIDER", "local"),
		E2BAPIKey:           first("", "E2B_API_KEY", "PLATFORM_SANDBOX_API_KEY"),
		E2BTemplate:         first("", "BOTINC_E2B_TEMPLATE", "MULTICA_E2B_TEMPLATE"),
		RuntimeImage:        env("BOTINC_RUNTIME_IMAGE", "ghcr.io/arosasg/botinc-v2-runtime:latest"),
		RunTTL:              ttl,
		SecretsKey:          first("", "BOTINC_SECRETS_KEY", "MULTICA_SANDBOX_SECRET_KEY"),
		OpenRouterAPIKey:    env("OPENROUTER_API_KEY", ""),
		StripeSecretKey:     env("STRIPE_SECRET_KEY", ""),
		StripeWebhook:       env("STRIPE_WEBHOOK_SECRET", ""),
	}
	if c.DatabaseURL == "" {
		return c, fmt.Errorf("DATABASE_URL is required")
	}
	if c.JWTSecret == "" {
		if c.Env == "production" {
			return c, fmt.Errorf("JWT_SECRET is required in production")
		}
		c.JWTSecret = "dev-insecure-jwt-secret-change-me"
	}
	if c.DevLoginCode == "" && c.ResendAPIKey == "" && c.SMTPHost == "" && c.Env != "production" {
		c.DevLoginCode = "000000"
	}
	if c.Production() && c.ResendAPIKey == "" && c.SMTPHost == "" {
		return c, fmt.Errorf("SMTP_HOST or RESEND_API_KEY is required in production")
	}
	return c, nil
}

func (c Config) Production() bool { return c.Env == "production" }
