# BotInc v2 verification matrix

This matrix records the evidence used for the 2026-09-14 v2 production cutover.
A passing fixture or mock is not recorded as a live-provider pass.
Remaining product work stays explicit even when it is not a blocker for preserving and serving migrated data.

| Area | Verified evidence | Remaining release work |
|---|---|---|
| Design | Foundation comparisons; current live memory screenshots at 1440 light/dark and 390 light inspected | Full live screen and interaction sweep, including onboarding and responsive dialogs |
| Email sign-in | Real browser start, invalid code, verify and cookie; PostgreSQL attempt/replay race tests; Postmark TLS/authentication; staging inbox delivery and received-code browser sign-in passed | Concurrent rate limit tested (15 requests, 5 accepted); recovery sweep remains |
| Google sign-in | Google accepted the callback and a real owner session reached the v2 workspace UI | Repeat the visual sign-in sweep from the production origin when a browser is available |
| GitHub sign-in | OAuth state and PKCE tests; verified-email enforcement implemented | Registered callback and real provider/browser verification |
| Onboarding | Email gate is live | Persist goals, connect providers, save models and autopilots; remove simulated connect results |
| Sessions and API keys | Server-backed list/revoke/scope controls; read-only default and escalation/revocation regression tests | Browser security dialog matrix; second-factor and passkey implementation |
| Workspace access | Signed-out browser gate; owner/member/invitation identity regressions; real owner menu showed all six migrated workspaces | Complete the wider member and permission matrix |
| Chats | Real browser persistence; staging E2B/OpenRouter answer completed (run 3aaddec6-b657-4274-8fc6-1e3432d930c1, provider cost 18 cents); 968 v1 conversations and 23,179 messages preserved with stable IDs | Complete the wider live follow-up, queue, cancellation, sharing, retry and reconnection matrix |
| Issues | Browser create; API lifecycle tests exist | Cloud build/review/verify/approval/merge and recovery with actual repository |
| Skills and memory | CRUD, personal privacy, reload persistence; runtime context added | Runtime privacy regression and actual model consumption |
| Team | Invite identity, roles and last-owner protections tested | Browser invite accept, role changes and session boundaries |
| Model accounts | Encrypted storage and routing tests | Real subscription login/refresh, quotas, fallback and budget enforcement |
| Plugins and repositories | Storage endpoints exist | Actual OAuth/token validation, permission-scoped runtime repository credentials and disconnection |
| Workflows | Graph save/load; concurrent immutable version creation/activation tested | Actual graph branching, repeat limits, questions, independent review and resume |
| Autopilots | Schedule validation, manual/webhook trigger API tests exist | Live scheduled executions, trigger idempotency, limits and recovery |
| Billing | Credit/usage reads; atomic debit, duplicate-callback, reservation and own-key accounting tests pass | Stripe checkout and signed payment processing implemented; concurrent webhook/amount/signature tests pass. Actual Stripe test checkout, subscription lifecycle and invoices remain |
| CLI | Existing commands plus skill/memory/team commands; unit tests pass | Full real-server CLI matrix, packaging and installation proof |
| Cloud runtime | Dedicated E2B template and installed binaries verified; actual run-token launch and provider answer passed | Heartbeat/cancellation, interrupted-work preservation |
| Staging | Isolated stack, immutable image builds, DNS/TLS, public health checks, and a real provider answer passed | Continue the broader product matrix on the production-equivalent stack |
| Migration | Six workspaces; 5,465 issues; 45,725 comments; 60 paused routines; 67,301 archived historical runs; 968 conversations; 23,179 messages; all source IDs and raw migration records preserved | Adapt and validate each paused routine before activation; convert the legacy webhook to the v2 signed-hook protocol |
| Production | `botinc.ai` and `api.botinc.ai` resolve directly to v2; TLS and public health pass; the legacy BotInc chat URL redirects to its stable v2 conversation ID | Continue post-cutover monitoring and the remaining non-migration product checks above |

The production v2 infrastructure is owned by CloudFormation stack `botinc-v2-staging` in `eu-west-1`.
It uses a separate database volume, ECR repositories, source bucket, and secret.
The v1 database was read only during migration and was not altered by v2 schema migrations.
