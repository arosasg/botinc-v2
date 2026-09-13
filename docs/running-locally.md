# Running the whole thing locally

Four processes: Postgres, the API, the web app, and a sandbox that runs the
runtime. Nothing here needs a cloud account.

```sh
docker run -d --name botinc-v2-pg \
  -e POSTGRES_PASSWORD=botinc -e POSTGRES_USER=botinc -e POSTGRES_DB=botinc \
  -p 55432:5432 postgres:17-alpine

# The API. It applies its own migrations at boot.
cd server && go build -o /tmp/botinc-server ./cmd/server
cd ../runtime && go build -o /tmp/botinc-runtime ./cmd/botinc-runtime

DATABASE_URL='postgres://botinc:botinc@127.0.0.1:55432/botinc?sslmode=disable' \
PORT=8080 APP_ENV=development JWT_SECRET=dev FRONTEND_ORIGIN=http://localhost:3100 \
BOTINC_PUBLIC_API_URL=http://localhost:8080 BOTINC_DEV_VERIFICATION_CODE=000000 \
BOTINC_SECRETS_KEY=$(openssl rand -hex 32) \
BOTINC_SANDBOX_PROVIDER=local BOTINC_RUNTIME_BINARY=/tmp/botinc-runtime \
  /tmp/botinc-server

# The web app, pointed at that API.
pnpm build
BOTINC_API_URL=http://localhost:8080 pnpm --filter @botinc/web start
```

`BOTINC_API_URL` is read per request, not baked into the build, so one image
serves every environment. Leave it unset and the design's fixtures drive the
screens, which is what the pixel proof runs against.

The local sandbox provider runs the runtime as a child process. It is for
development only and the server refuses it in production: v2 is remote-only
and there is no daemon on anybody's machine.

## Signing in

With `BOTINC_DEV_VERIFICATION_CODE` set, every login code is that value, so no
mail provider is needed:

```sh
cd cli && go build -o /tmp/botinc ./cmd/botinc
BOTINC_API_URL=http://localhost:8080 /tmp/botinc login
```

## A coding CLI, without calling a model

The runtime drives a real coding CLI. To exercise the loop without spending
anything, put a script named `claude` on the server's PATH that prints the
same stream-json shape:

```sh
cat > /tmp/bin/claude <<'SH'
#!/bin/sh
echo '{"type":"assistant","text":"reading the repository"}'
echo '{"type":"result","result":"Done.","total_cost_usd":0.0312}'
SH
chmod +x /tmp/bin/claude
```

This is what the end-to-end suite does. A test must not call a model.
