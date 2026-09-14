# BotInc v2 migration and verification

Status: staging rehearsal, incomplete production migration. Stripe test mode is
explicitly authorized. Production `botinc.ai` has not been switched.

## Source inventory and migration

The current Remote native credential can export BotInc, but requests for Didit,
Santé, Hi Doctor, Personal and Santé Labs are explicitly denied because the
credential is bound to a different workspace. Those five workspaces have not
been imported. On 2026-09-14 the owner explicitly authorized his Mac's existing
member CLI for this export. The bounded export is tracked in BOT-1340.

The exact owner Mac dispatch failed admission with 8.8 GiB free, below the
10 GiB floor. Its automatic Remote retry does not supply Mac filesystem access
or broaden the Remote token. Keep the disk floor enabled; resume on the owner
Mac when measured free space meets it and the authorized export route is
available. No new source import or scheduler handoff is claimed from dispatch.

BotInc staging import: 1,329 issues, 13,789 comments, six paused routines, two
projects and the original member roles. A private checksummed archive contains
2,665 source files, including 10,164 historical execution records. Historical
runs are archived, not represented as new v2 executions. Issue UUIDs, numbers,
parent links, comment IDs, original authors and source metadata are retained.

All 852 attachments (563,480,875 bytes) were imported. Import and replay verified
sizes and SHA-256 hashes; a separate check downloaded every file through the
staging API and verified the same bytes and hashes. Anonymous downloads returned
401, and downloads through another workspace returned 404.

The complete snapshot was rehearsed with rollback, applied to a separate staging
workspace, and replayed without duplicate records. A staging database backup was
restored into a task-specific database and asserted to contain the exact issue,
comment and paused-routine counts. That verification database was then removed.
An initial restore attempt ran before the backup existed; it failed and was not
counted as a pass. The corrected ordered restore passed.

Source v1 routines remain unchanged and active. The imported v2 copies remain
paused. Prompt and cron preservation does not prove execution compatibility.

## Functionality matrix

| Area | Evidence obtained | Remaining validation or implementation |
|---|---|---|
| Email sign-in | Real staging email delivered; code exchanged for a session; `/api/me` 200. Concurrent code consumption, rate and attempt limits passed against Postgres. | Full onboarding activation and recovery journeys. |
| Google sign-in | User added both callback URIs; earlier redirect mismatch no longer observed. | Complete account authorization and callback session, including main domain. |
| GitHub sign-in | State and PKCE server tests pass. | Complete external OAuth flow. |
| Workspace permissions | API/CLI workspace isolation and role tests pass. | Access to five source workspaces is denied; migration blocked. |
| Issue import | All 1,329 unique rows loaded through paginated staging API and browser. Original history and attachment links displayed. | Final delta synchronization before cutover; historical execution archive viewer. |
| Issue operations | API/CLI lifecycle, queue and request-changes tests pass. | Full remote repository build, independent review and approved-head merge path; remaining prototype issue controls. |
| Chat | Real server/runtime/CLI integration tests pass using a simulated coding CLI. Concurrent queue and response replay tests pass. | Complete deployed provider matrix, cancellation/recovery and source conversation migration. |
| Workflow editor | Graph validation, immutable versions and concurrent version allocation tests pass. | Every editor interaction and deployed conditional/human/merge execution. |
| Autopilots | Schedule/manual trigger/webhook signature tests pass. Six source definitions preserved with cron/time zone and paused import. | Adapt native v1 commands, execution modes and dependencies to v2; test each routine on one agent and Remote; hand off exactly one active scheduler. |
| Model accounts | Secret redaction, subscription preference and API-key routing tests pass. | Source account migration, subscription refresh and real provider fallback matrix. |
| Repository connections | Server tests require an authorized workspace GitHub connection. | Migrate source integrations and test actual remote repository execution. |
| Skills and memory | Isolation/persistence tests pass. | Source knowledge migration and complete browser editing/apply flows. |
| Team | Invitation identity and permission tests pass; imported source member roles preserved. | Complete invite acceptance and cross-workspace journeys. |
| Credits | Usage charged once; budget reservations and own-account isolation tests pass. | Complete hosted test-card checkout and actual provider webhook delivery. |
| Stripe | Staging creates an actual USD $5.00 sandbox checkout. Signed webhook concurrency/forgery/amount checks pass against Postgres. | Hosted Card controls did not open in the automated browser; no completed card payment claimed. Subscriptions/invoices/automatic recharge remain incomplete. |
| Security settings | API key defaults/revocation and private-run access tests pass. | Passkeys/TOTP and remaining prototype controls. |
| Attachments | All 852 staging downloads hash-match source; anonymous and wrong-workspace access denied. | Final delta attachments and restore of the complete post-transfer file set. |
| UI | Imported issue rendered in desktop light/dark and 390px mobile. Fixed sample execution text and long-content mobile overflow. | Full current design comparison and all-screen interaction matrix. No new pixel-perfect claim. |
| Deployment | Immutable staging image builds and SSM deployment succeed; database restore rehearsal passes. | Independent review, complete migrations, delta/scheduler handoff, apex-domain cutover, post-cutover checks and rollback rehearsal. |

## Executed suites

Latest named test execution, with original command exit status retained:

- Server: 50 top-level tests passed under `go test -race -v ./...`, no skips.
  API/migration suites used a task-private PostgreSQL 17 database.
- Runtime: 27 top-level tests passed, no skips; real git/subprocesses.
- CLI: six top-level tests passed, no skips.
- Integration: 11 top-level tests passed, no skips; real server/runtime/CLI
  binaries and Postgres, simulated coding CLI. This is not a live-model claim.
- Web/API package tests, typecheck and lint passed. Final issue-panel TypeScript
  check also passed. CSS correction checked at 390px with the actual staging UI.

Private exports, credentials, browser sessions and raw historical data are not
committed or attached. This matrix distinguishes completed checks from gaps;
passing suites do not establish that the entire product or migration is ready.


## CI follow-up, 2026-09-14

PR #2 is merged. The CI follow-up adds pull-request/main/manual checks for the
web packages, all four Go modules and all three deployable Docker images. See
`ci.md`. Local Go vet/build and uncached race tests passed: server 50 top-level
(57 including subtests), runtime 27, CLI 6, integration 11. Every intended test
ran with no skips against the task-private PostgreSQL 17 instance where needed.
Web typecheck, lint, package tests and production build passed. These automated
checks do not close the remaining live functionality/migration entries above.
