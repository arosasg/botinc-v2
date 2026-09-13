# Deploying

Two images and a database. The web image is identical in every environment:
it reads `BOTINC_API_URL` per request, so promoting `test.botinc.ai` to
`botinc.ai` is a DNS change plus three variables, not a rebuild.

```
web   test.botinc.ai       -> BOTINC_API_URL=https://api.test.botinc.ai
api   api.test.botinc.ai   -> FRONTEND_ORIGIN=https://test.botinc.ai
                              COOKIE_DOMAIN=.botinc.ai
                              BOTINC_PUBLIC_API_URL=https://api.test.botinc.ai
```

`COOKIE_DOMAIN=.botinc.ai` is what lets the session cookie reach the API from
the web origin. Both hosts sit under the same registrable domain, so the
cookie stays `SameSite=Lax` and no third-party cookie is involved.

## The variables the API needs

Required, and the server refuses to start without them:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres 17. The binary applies its own migrations at boot. |
| `JWT_SECRET` | Required in production. |
| `BOTINC_SECRETS_KEY` | 32 bytes of hex. Encrypts provider credentials at rest; without it the API refuses to store one rather than writing something it cannot protect. |
| `FRONTEND_ORIGIN` | The exact web origin. CORS and the WebSocket check against it. |
| `BOTINC_PUBLIC_API_URL` | The API's own address, used in the webhook URLs a routine hands out. |

Remote only. `BOTINC_SANDBOX_PROVIDER=local` is a development path that runs
the runtime as a child process, and the server refuses it when `APP_ENV` is
production. There is no daemon on anybody's machine.

Optional, and each one degrades honestly when absent: `RESEND_API_KEY` (no key
means sign-in codes are logged, not sent), `GOOGLE_CLIENT_*`, `GITHUB_APP_*`,
`OPENROUTER_API_KEY`, `STRIPE_*`, `E2B_API_KEY` and `BOTINC_E2B_TEMPLATE`.

Names match v1 where the meaning is identical, so the same vault entries
apply. New names are `BOTINC_*`. No `MULTICA_*` name survives, though the
config still reads a couple of them as a fallback so an existing vault works
unchanged.

## One machine

```sh
cd deploy
cp .env.example .env   # fill it in
docker compose up -d --build
```

## Before the domain moves

`botinc.ai` is live on v1. v2 uses a separate database and its own stack;
nothing in this directory writes to v1's infrastructure. Point `test.botinc.ai`
at v2 first, exercise it, and only then move the apex.
