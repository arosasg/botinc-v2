# Testing

## The API suite

`server/internal/api` is tested against a real PostgreSQL 17. There is no
in-memory substitute and no skip path: without `TEST_DATABASE_URL` the suite
exits non-zero and says why. A suite that passes silently without its database
proves nothing, so this is deliberate.

```sh
docker run -d --name botinc-v2-pg \
  -e POSTGRES_PASSWORD=botinc -e POSTGRES_USER=botinc -e POSTGRES_DB=botinc \
  -p 55432:5432 postgres:17-alpine

cd server
TEST_DATABASE_URL='postgres://botinc:botinc@127.0.0.1:55432/botinc?sslmode=disable' \
  go test ./... -v -count=1
```

`TestMain` creates a throwaway database per run, applies the embedded
migrations, and drops it afterwards, so the suite never collides with another
checkout on the same server.

Read the whole log, not a filtered tail. A pipeline ending in `grep`, `head` or
`tail` can hide a non-zero exit, so write the output to a file and check the
original command's status:

```sh
go test ./... -v -count=1 > /tmp/api.log 2>&1; echo "exit=$?"
```

## What the suite covers

Sign-in and session resolution, workspace isolation between members, the issue
lifecycle and its `BOT-n` identifiers, the workflow graph validator, immutable
workflow versions, run dispatch and the runtime protocol, the approval gate,
routine schedules and HMAC-signed webhooks, credential storage, model routing,
and the device-code login the CLI uses.
