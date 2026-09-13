# github.md

repo: arosasg/botinc
branch: main
path: (whole repo — views, apps/web routes, core packages)

## Last sync

date: 2026-08-27T09:49:37Z

### Updated in this project
- **Settings split into two sets on one screen**, following `packages/views/settings/components/settings-page.tsx`: an eyebrow-labelled **You** row (Profile, Preferences, Notifications, Sign-in) and a **Didit Factory** row (General, Members, Runtimes & limits, Data & audit). The lead sentence swaps with the scope so it always says whose settings you are reading.
- **Personal settings that were missing are in**: photo, editable name, verified email, and an **About you** note the roster reads before it asks a question (grounded in `account-tab.tsx` + migration `096_user_profile_description`); theme, language and personal time zone moved out of Workspace into Preferences.
- **GitHub login is no longer a text field.** `preferences-tab.tsx` still asks the user to type it; the console now shows it read from the connection (`@arosasg`, Reconnect / Disconnect) under "Your connected identity".
- **19 repo tabs cut to 8.** Billing, Usage and Connectors dropped as tabs (they own rail screens — linked instead); experiments, exports-as-tab and the retire/unpair danger rows dropped; roles folded into Members, personal sessions moved under Sign-in.
- **Home Activity grew to four charts**, all sharing one geometry (170px plot, 24px y-gutter): runs per day, tokens by model, plus new **Pull requests** (opened per day, stacked merged / still open / closed unmerged) and **Where runs come from** (origin split by implementer vs reviewer). All four carry the cursor-tracked hover bloom and structured tooltips with colour bullets.
- **Run origins grounded in the repo's own vocabulary** — `packages/core/api` calls them autopilots, not routines, and an escalation is a run outcome rather than something that asks for a run. The card now reports three origins (Issues, Autopilots, Chat) summing to the same 2,920 the band header and the runs-per-day legend report; the origin count derives from the array instead of being hardcoded.

## Screen map

| Screen | Built from |
| --- | --- |
| Home | `app/[workspaceSlug]/(dashboard)/home` |
| Inbox / Issues / Issue detail | `inbox`, `issues`, `issues/[id]` |
| Chat | `chat`, `channels`, `channels/[channelId]` |
| Agents / Agent desk / Hire | `agents`, `agents/[id]`, `agents/new` |
| Squads | `squads/[id]` |
| Computers | `computers`, `computers/[id]` |
| Accounts / Account detail | `packages/views/accounts/accounts-page.tsx` (+ test), `connectors/agent-accounts-section` |
| Routines / Routine detail | `routines`, `routines/[id]` |
| Runs / Run detail | run records surfaced from issue detail, computers and usage |
| Memory | `packages/views/memory/*` (memory-page, memory-sidebar, views) |
| Skills / Skill detail | `skills`, `skills/[id]`, `skills.json` |
| Projects / Repositories / Repo detail | `projects/[id]`, `repositories`, `repositories/[...repository]` |
| Connectors | `core/connectors/catalog.ts`, `connector-logo.tsx` |
| Artifacts | `artifacts` |
| Design system | `design-system` |
| Usage / Settings | `usage`, `settings`, `billing`, `members/[id]`, `packages/views/settings/components/*` (settings-page, settings-layout, account-tab, preferences-tab) |

## Sync history

- 2026-08-27 — Settings regrounded and split: personal (You) vs workspace, GitHub login read from the connection.
- 2026-08-25 — Surface tiers unified across console, onboarding and marketing; chart alignment fixed at the root.
- 2026-08-25 — Chart hover cards, composer dropdowns, compact accounts dock.
- 2026-08-25 — Cursor-tracked hover bloom across cards, rows and modal pickers; modals reskinned to the design system.
- 2026-08-24 — Azure brand primary; Connectors regrouped by provider; native phone shell.
- 2026-08-24 — Responsive breakpoints applied (hooks had been missing); Models tab priority queues.
- 2026-08-24 — Manual/agentic issue composer, computer pickers, per-message execution metadata, Fable usage meters.
- 2026-08-24 — Models tab priority queues, connect-account panel, search palette and routine editing.
- 2026-08-24 — Channels folded into Chat; Slack threads, Models tab and Home charts added.
- 2026-08-24 — Accounts regrounded; routine detail, hire, Home, Artifacts and Design system added.
- 2026-08-24 — icon sprite inlined; Memory views, agent tabs, connectors and skills regrounded.
- 2026-08-24 — console first built from the dashboard route list.

