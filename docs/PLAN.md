# BotInc v2 - build plan

Status: living document. Owner: Code Implementer. Reviewed by Alejandro before the domain moves to botinc.ai.

## Goal

A from-scratch BotInc: the Landing v4 and Workspace v19 designs from Claude Design (project `3409ba65-04b6-44b3-af90-d9eac984e5ec`) implemented pixel-faithfully, a new API and runtime built remote-only (no local computers), a redesigned `botinc` CLI, deployed at `test.botinc.ai`, and verified end to end (chat, issues, workflows, autopilots, connections) before the domain switches to `botinc.ai`.

v1 (`arosasg/botinc`, ~436k lines Go, ~484k lines TS, 1,610 migrations) is reference only. Nothing is copied wholesale; patterns are borrowed where they were right (chi + pgx server, embedded SQL migrations, JWT sessions, WebSocket realtime, pnpm + turbo monorepo, proof screenshots in PRs).

## Principles

1. The design source is the spec. The `.dc.html` + `.css` files win over prose. The CSS ships verbatim (concatenated in import order) so the cascade is identical; markup is ported 1:1 to React. Dead rules are purged only after every screen is ported and screenshot-diffed.
2. Remote only. There is no daemon on a user's machine. Every run executes in a managed sandbox that the server provisions. The CLI talks to the API; it never hosts an agent.
3. One conversation is the product entry (Onboarding v3). Sign-in is optional until the user saves work.
4. Nothing merges itself. Approval is a step in a workflow, recorded against an immutable revision.
5. Every screen has visual proof (light, dark, 390px) checked into the PR before review.

## Repository layout

```
apps/web          Next.js 16 + React 19. Landing, onboarding, workspace.
packages/brand    Fonts, tokens, icon sprite, logos, connector/provider marks, design CSS chain.
packages/api      TypeScript contracts + fetch/WS client generated from server/openapi.yaml.
server            Go 1.26 API: chi, pgx, embedded migrations, JWT, WebSocket, scheduler.
runtime           Go worker image that runs inside a sandbox: claims a run, checks out the repo, drives the coding CLI, streams events back.
cli               Go `botinc` CLI (cobra). Noun-verb, --json everywhere, device-code login.
deploy            Dockerfiles, compose for local, infra notes for test.botinc.ai.
docs              This plan, architecture, visual-proof recipe, API reference.
design-ref        Frozen snapshot of the design sources used for this build (CSS chain, sprite, assets, notes, reference renders).
```

## Domain model (v2)

- `users`, `sessions`, `passkeys`, `login_codes`
- `workspaces`, `members` (role: owner, admin, member), `invitations`
- `projects`, `repositories` (GitHub App installation, setup profile, env names)
- `conversations`, `messages`, `message_queue` (edit / fork / steer / queue per V18)
- `issues` (identifier `BOT-n`, status: needs_you, todo, in_progress, in_review, blocked, done), `issue_relations`, `comments`
- `workflows`, `workflow_versions` (typed nodes + edges, validation per V14), `runs`, `run_steps`, `run_events`
- `autopilots` (schedule / webhook / manual), `autopilot_runs`
- `model_accounts` (provider, plan, quota windows), `routing_policy` (subscriptions first, then ask / credits / wait), `credit_ledger`
- `plugins` (connector installs, scopes, health), `skills`, `memories`
- `sandboxes` (provider, status, cost), `attachments`

## Phases

| # | Phase | Deliverable | Proof |
|---|---|---|---|
| 0 | Foundation | Monorepo scaffold, brand package with design CSS chain + assets, CI (typecheck, lint, test, proof-shot) | `pnpm build` green |
| 1 | Landing v4 | `/` pixel-faithful incl. hero demo loop, all bands, pricing, footer; `/onboarding` 5 steps wired to real auth | Screenshot diff vs design render at 1440 and 390, light + dark |
| 2 | Workspace shell | Sidebar, topbar, New chat, Conversations list, Conversation thread, side pane (Issue, Workflow, PRs, Runs, Files), composer with routing strip | Same |
| 3 | Work + Issue | Work list (groups, filters, import), Issue detail, relations, PR panel | Same |
| 4 | Schedule + Autopilots | Schedule, Autopilot details, Autopilot conversation | Same |
| 5 | Settings | Model accounts, Plugins, Profile (2-step, devices, API keys), Skills and preferences, Team, Billing, Repos, Projects, Automation, Design | Same |
| 6 | API | Auth (email code, Google, passkey), workspaces, conversations, issues, runs, workflows, autopilots, accounts, plugins, realtime WS | Go tests with real Postgres |
| 7 | Runtime | Sandbox provisioning, run claim, repo checkout, coding CLI drive, event streaming, PR open | Integration test against a throwaway repo |
| 8 | CLI | `botinc login`, `issue`, `chat`, `run`, `workflow`, `autopilot`, `account`, `workspace`, `--json` | CLI tests + smoke against test API |
| 9 | Deploy | `test.botinc.ai` web + `api.test.botinc.ai` API + Postgres + sandbox provider, env reused from v1 vault | Live URL, health checks |
| 10 | E2E | New chat -> run; new issue -> workflow -> PR -> approval; autopilot on schedule; plugin OAuth; remote-only invariants | Playwright suite on the deployed stack |

Phases 1-5 are web work against typed fixtures first (the same shapes the API will return), so the UI can be signed off on pixels before the API lands. Phase 6 replaces fixtures with the client.

## Design-to-code method

1. Reference renders are captured from the live Claude Design preview for every screen (`design-ref/shots`). These are the targets.
2. CSS: `packages/brand/styles/workspace.css` is the v6 -> v19 chain concatenated in import order, untouched. `landing.css` is Landing v4. Fonts come from `packages/brand/styles/fonts.css` (Instrument Sans, IBM Plex Mono).
3. Markup: each `data-screen-label` block becomes a React component under `apps/web/features/<screen>/`. `sc-if` becomes a conditional, `sc-for` a map, `{{ x }}` a prop. Class names are kept exactly.
4. The prototype's `renderVals()` becomes a typed view-model per screen, fed by the API client (fixtures in phases 1-5).
5. Proof: `pnpm proof` renders every screen at 1440 and 390 in light and dark and writes `proof/<screen>-<theme>-<width>.png`; a diff step compares against `design-ref/shots` and reports the pixel delta. A screen is done when its delta is noise-level.

## Deployment (test.botinc.ai)

- Web: Next.js standalone in a container behind the same CloudFront/ALB pattern as v1, or Amplify if it stays simpler. Hostname `test.botinc.ai`.
- API: `api.test.botinc.ai`, Go container on Fargate, Postgres 17 (separate database from v1), Redis for realtime fan-out.
- Env: the same variable names as v1 where the meaning is identical (`DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_*`, `RESEND_*`, `STRIPE_*`, `GITHUB_APP_*`, `OPENROUTER_API_KEY`, sandbox provider keys). New names are `BOTINC_*`. No `MULTICA_*` names survive.
- Cutover to `botinc.ai` is a DNS change plus `FRONTEND_ORIGIN`/`COOKIE_DOMAIN`; nothing else may depend on the hostname.

## Out of scope for the first cut

Desktop and mobile apps (the landing links to store pages), voice calls (the Call button opens a "coming with v2.1" sheet), Lark/Slack inbound channels, issue import from Jira/Linear (the Import dialog is present, the importers land after E2E).
