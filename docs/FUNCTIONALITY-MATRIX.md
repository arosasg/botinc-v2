# BotInc v2 verification matrix

This is a release gate. A passing fixture or mock is not a live-provider pass.
Production promotion is authorized only after the remaining rows are implemented,
verified on staging, and independently reviewed. The production domain still serves v1.

| Area | Verified evidence | Remaining release work |
|---|---|---|
| Design | Foundation comparisons; current live memory screenshots at 1440 light/dark and 390 light inspected | Full live screen and interaction sweep, including onboarding and responsive dialogs |
| Email sign-in | Real browser start, invalid code, verify and cookie; PostgreSQL attempt/replay race tests; Postmark TLS/authentication; staging inbox delivery and received-code browser sign-in passed | Email rate limits and recovery sweep |
| Google sign-in | API implementation exists | Registered staging callback and real provider/browser verification |
| GitHub sign-in | OAuth state and PKCE tests; verified-email enforcement implemented | Registered callback and real provider/browser verification |
| Onboarding | Email gate is live | Persist goals, connect providers, save models and autopilots; remove simulated connect results |
| Sessions and API keys | Server-backed list/revoke/scope controls; read-only default and escalation/revocation regression tests | Browser security dialog matrix; second-factor and passkey implementation |
| Workspace access | Signed-out browser gate; owner/member/invitation identity regressions | Full multi-workspace browser selection and permission matrix |
| Chats | Real browser persistence; staging E2B/OpenRouter answer completed (run 3aaddec6-b657-4274-8fc6-1e3432d930c1, provider cost 18 cents) | Follow-up, queue, cancellation, attachments, sharing, retry and reconnection |
| Issues | Browser create; API lifecycle tests exist | Cloud build/review/verify/approval/merge and recovery with actual repository |
| Skills and memory | CRUD, personal privacy, reload persistence; runtime context added | Runtime privacy regression and actual model consumption |
| Team | Invite identity, roles and last-owner protections tested | Browser invite accept, role changes and session boundaries |
| Model accounts | Encrypted storage and routing tests | Real subscription login/refresh, quotas, fallback and budget enforcement |
| Plugins and repositories | Storage endpoints exist | Actual OAuth/token validation, permission-scoped runtime repository credentials and disconnection |
| Workflows | Graph save/load; concurrent immutable version creation/activation tested | Actual graph branching, repeat limits, questions, independent review and resume |
| Autopilots | Schedule validation, manual/webhook trigger API tests exist | Live scheduled executions, trigger idempotency, limits and recovery |
| Billing | Credit/usage reads; atomic debit, duplicate-callback, reservation and own-key accounting tests pass | Checkout, subscription lifecycle, signed idempotent webhooks, invoices and reconciled usage |
| CLI | Existing commands plus skill/memory/team commands; unit tests pass | Full real-server CLI matrix, packaging and installation proof |
| Cloud runtime | Dedicated E2B template and installed binaries verified; actual run-token launch and provider answer passed | Heartbeat/cancellation, interrupted-work preservation |
| Staging | Isolated stack, immutable image builds, DNS/TLS and public health checks passed | Complete live matrix and backup/restore verification |
| Production | No cutover performed | Data migration/compatibility, independent review, rollback proof and post-cutover checks |

Current staging infrastructure is owned by CloudFormation stack `botinc-v2-staging`
in `eu-west-1`. It uses a separate database volume, ECR repositories and secret.
No v1 database migrations or production DNS changes have been performed.
