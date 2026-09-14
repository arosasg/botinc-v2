# Deployment

Production runs at `https://botinc.ai`, and the same deployment remains available at `https://test.botinc.ai` for compatibility checks.
Caddy routes `/api/*` and `/healthz` to the API and other requests to Next.js.
Both domains use the same-origin API.
Keep `COOKIE_DOMAIN` unset so cookies remain host scoped.
Legacy `/<workspace>/chat?session=<uuid>` routes for all six imported workspace slugs redirect to `/w` with the matching v2 workspace and stable conversation ID.

The isolated CloudFormation stack `botinc-v2-staging` owns its EC2 instance,
Elastic IP, ECR repositories, CodeBuild project, source bucket and IAM roles.
`staging-stack.json` defines infrastructure; `buildspec.yml` builds immutable
server/web image tags. `staging-compose.yml` runs Postgres 17, API, web and Caddy.
The runtime runs only in a dedicated E2B template built with
`server/scripts/build-template.mjs` and launched through the official E2B SDK.

## Secrets and configuration

The API reads `DATABASE_URL`, `BOTINC_SECRETS_KEY`, `JWT_SECRET`,
`FRONTEND_ORIGIN`, `BOTINC_PUBLIC_API_URL`, `E2B_API_KEY`,
`BOTINC_E2B_TEMPLATE` and `BOTINC_E2B_LAUNCHER`. The server image supplies the
launcher path. `BOTINC_API_URL=/` configures the browser's same-origin API.
Production refuses `BOTINC_SANDBOX_PROVIDER=local`.

Email requires either `RESEND_API_KEY` or SMTP configuration. Reusing v1's
Postmark credentials requires `SMTP_HOST=smtp.postmarkapp.com`, `SMTP_PORT=587`,
`SMTP_USERNAME`, `SMTP_PASSWORD` and `SMTP_FROM_EMAIL`. SMTP requires TLS.
Missing mail configuration is an error; production never logs sign-in codes.

Google and GitHub sign-in require their respective OAuth client ID/secret
and registered callbacks at `/api/auth/google/callback` and
`/api/auth/github/callback` under the public API origin. Model credit runs
require `OPENROUTER_API_KEY`. Other provider keys are encrypted in the database.
The legacy `BOTINC_PLATFORM_SANDBOX_API_KEY` is not an E2B key and must not
be used as one. The v1 E2B fallback is `PLATFORM_SANDBOX_API_KEY`.

The AWS secret `botinc-v2/staging` contains separate `api` and `postgres`
configuration objects. `prepare-staging.py` writes owner-only raw environment
files on the host. Never commit, print or attach these files. Do not overwrite
existing database passwords or encryption keys during redeployment.

Staging currently restricts sign-in with `BOTINC_ALLOWED_EMAILS` to the owner's
address while release checks remain incomplete.

## Cutover and rollback

Read `docs/FUNCTIONALITY-MATRIX.md` for the evidence captured before and after the 2026-09-14 cutover.
The v2 database backup and Route 53 zone snapshot are stored in the encrypted migration prefix before any production switch.
Rollback restores the previous Route 53 records and the pre-migration v2 database backup.
Never apply v2 schema migrations to the v1 database.
