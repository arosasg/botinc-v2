// Package api is the HTTP surface. Routes are workspace-scoped under
// /api/w/{workspace}/... ; auth and account routes sit under /api/auth and /api/me.
package api

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/arosasg/botinc-v2/server/internal/auth"
	"github.com/arosasg/botinc-v2/server/internal/config"
	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/arosasg/botinc-v2/server/internal/realtime"
	"github.com/arosasg/botinc-v2/server/internal/runs"
)

type Server struct {
	cfg  config.Config
	pool *pgxpool.Pool
	auth *auth.Service
	hub  *realtime.Hub
	runs *runs.Service
	log  *slog.Logger
}

func New(cfg config.Config, pool *pgxpool.Pool, a *auth.Service, hub *realtime.Hub, r *runs.Service, log *slog.Logger) *Server {
	return &Server{cfg: cfg, pool: pool, auth: a, hub: hub, runs: r, log: log}
}

func (s *Server) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RealIP, middleware.RequestID, middleware.Recoverer, middleware.Timeout(60*time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{s.cfg.FrontendOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: true,
		MaxAge:           600,
	}))
	r.Use(s.auth.Middleware)

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) { httpx.JSON(w, 200, map[string]string{"status": "ok"}) })
	r.Get("/api/config", s.publicConfig)

	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/email/start", s.emailStart)
		r.Post("/email/verify", s.emailVerify)
		r.Post("/logout", s.logout)
		r.Post("/device/start", s.deviceStart)
		r.Post("/device/poll", s.devicePoll)
		r.With(auth.Require).Post("/device/approve", s.deviceApprove)
		r.Get("/google/start", s.googleStart)
		r.Get("/google/callback", s.googleCallback)
	})

	r.Route("/api/me", func(r chi.Router) {
		r.Use(auth.Require)
		r.Get("/", s.me)
		r.Patch("/", s.updateMe)
		r.Get("/sessions", s.listSessions)
		r.Delete("/sessions/{id}", s.revokeSession)
		r.Get("/keys", s.listKeys)
		r.Post("/keys", s.createKey)
		r.Delete("/keys/{id}", s.revokeKey)
	})

	r.Route("/api/workspaces", func(r chi.Router) {
		r.Use(auth.Require)
		r.Get("/", s.listWorkspaces)
		r.Post("/", s.createWorkspace)
		r.Post("/accept-invite", s.acceptInvite)
	})

	r.Route("/api/w/{workspace}", func(r chi.Router) {
		r.Use(auth.Require, s.workspaceScope)
		r.Get("/", s.getWorkspace)
		r.Patch("/", s.updateWorkspace)
		r.Get("/overview", s.overview)
		r.Get("/ws", s.websocket)
		r.Get("/members", s.listMembers)
		r.Patch("/members/{user}", s.updateMember)
		r.Delete("/members/{user}", s.removeMember)
		r.Get("/invitations", s.listInvitations)
		r.Post("/invitations", s.createInvitation)
		r.Delete("/invitations/{id}", s.revokeInvitation)
		r.Get("/routing", s.getRouting)
		r.Put("/routing", s.putRouting)

		r.Get("/conversations", s.listConversations)
		r.Post("/conversations", s.createConversation)
		r.Get("/conversations/{id}", s.getConversation)
		r.Patch("/conversations/{id}", s.updateConversation)
		r.Post("/conversations/{id}/messages", s.sendMessage)
		r.Post("/conversations/{id}/fork", s.forkConversation)
		r.Get("/conversations/{id}/queue", s.listQueue)
		r.Post("/conversations/{id}/queue", s.enqueueMessage)
		r.Delete("/conversations/{id}/queue/{qid}", s.dequeueMessage)

		r.Get("/issues", s.listIssues)
		r.Post("/issues", s.createIssue)
		r.Get("/issues/{id}", s.getIssue)
		r.Patch("/issues/{id}", s.updateIssue)
		r.Post("/issues/{id}/comments", s.addComment)
		r.Post("/issues/{id}/work", s.workOnIssue)
		r.Post("/issues/{id}/approve", s.approveIssue)
		r.Post("/issues/{id}/changes", s.requestChanges)

		r.Get("/projects", s.listProjects)
		r.Post("/projects", s.createProject)
		r.Get("/repositories", s.listRepositories)
		r.Post("/repositories", s.addRepository)

		r.Get("/runs", s.listRuns)
		r.Get("/runs/{id}", s.getRun)
		r.Get("/runs/{id}/events", s.runEvents)
		r.Post("/runs/{id}/cancel", s.cancelRun)

		r.Get("/workflows", s.listWorkflows)
		r.Post("/workflows", s.createWorkflow)
		r.Get("/workflows/{id}", s.getWorkflow)
		r.Post("/workflows/{id}/versions", s.createWorkflowVersion)
		r.Post("/workflows/{id}/versions/{version}/activate", s.activateWorkflowVersion)

		r.Get("/autopilots", s.listAutopilots)
		r.Post("/autopilots", s.createAutopilot)
		r.Get("/autopilots/{id}", s.getAutopilot)
		r.Patch("/autopilots/{id}", s.updateAutopilot)
		r.Delete("/autopilots/{id}", s.deleteAutopilot)
		r.Post("/autopilots/{id}/trigger", s.triggerAutopilot)
		r.Get("/autopilots/{id}/runs", s.autopilotRuns)

		r.Get("/accounts", s.listAccounts)
		r.Post("/accounts", s.connectAccount)
		r.Patch("/accounts/{id}", s.updateAccount)
		r.Delete("/accounts/{id}", s.disconnectAccount)

		r.Get("/plugins", s.listPlugins)
		r.Post("/plugins", s.connectPlugin)
		r.Delete("/plugins/{id}", s.disconnectPlugin)

		r.Get("/credits", s.credits)
		r.Get("/usage", s.usage)
	})

	// Runtime protocol: authenticated by run token, not by user.
	r.Route("/api/runtime/runs/{run}", func(r chi.Router) {
		r.Use(s.runtimeScope)
		r.Post("/claim", s.runtimeClaim)
		r.Get("/spec", s.runtimeSpec)
		r.Post("/events", s.runtimeEvents)
		r.Post("/steps", s.runtimeStep)
		r.Post("/messages", s.runtimeMessage)
		r.Post("/finish", s.runtimeFinish)
	})

	// Autopilot webhooks: authenticated by the autopilot's secret.
	r.Post("/api/hooks/autopilots/{id}", s.autopilotWebhook)

	return r
}

func (s *Server) publicConfig(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, 200, map[string]any{
		"google_sign_in": s.cfg.GoogleClientID != "",
		"dev_login_code": s.cfg.DevLoginCode != "" && !s.cfg.Production(),
		"sandbox":        s.cfg.SandboxProvider,
		"env":            s.cfg.Env,
	})
}

// --- workspace scoping ---

type wsKey int

const scopeKey wsKey = 1

type Scope struct {
	WorkspaceID uuid.UUID
	Slug        string
	Role        string
	UserID      uuid.UUID
}

func scopeOf(ctx context.Context) Scope {
	sc, _ := ctx.Value(scopeKey).(Scope)
	return sc
}

func (s *Server) workspaceScope(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := auth.FromContext(r.Context())
		key := chi.URLParam(r, "workspace")
		var sc Scope
		var err error
		if id, perr := uuid.Parse(key); perr == nil {
			err = s.pool.QueryRow(r.Context(), `select w.id, w.slug, m.role from workspaces w join members m on m.workspace_id=w.id where w.id=$1 and m.user_id=$2`, id, p.User.ID).Scan(&sc.WorkspaceID, &sc.Slug, &sc.Role)
		} else {
			err = s.pool.QueryRow(r.Context(), `select w.id, w.slug, m.role from workspaces w join members m on m.workspace_id=w.id where w.slug=$1 and m.user_id=$2`, key, p.User.ID).Scan(&sc.WorkspaceID, &sc.Slug, &sc.Role)
		}
		if errors.Is(err, pgx.ErrNoRows) {
			httpx.ErrorCode(w, 404, "workspace_not_found", "workspace not found")
			return
		}
		if err != nil {
			s.fail(w, err)
			return
		}
		sc.UserID = p.User.ID
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), scopeKey, sc)))
	})
}

func (s *Server) fail(w http.ResponseWriter, err error) {
	s.log.Error("request failed", "err", err)
	httpx.Error(w, 500, "something went wrong")
}

func chiParam(r *http.Request, name string) string { return chi.URLParam(r, name) }

func idParam(r *http.Request, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(strings.TrimSpace(chi.URLParam(r, name)))
	return id, err == nil
}

func requireRole(sc Scope, roles ...string) bool {
	for _, r := range roles {
		if sc.Role == r {
			return true
		}
	}
	return false
}
