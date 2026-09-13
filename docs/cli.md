# The botinc CLI

`botinc` is noun then verb. Every command that returns data takes `--json` and
prints exactly what the API returned, so a script never parses a table.

Runs execute remotely. There is no local agent and nothing to install beyond
this one binary.

## Signing in

```sh
botinc login          # device code: approve it in a browser
botinc whoami
botinc workspace list
botinc workspace use acme
```

No password is ever typed into the CLI. The session token is written to
`~/.config/botinc/config.json` with 0600 permissions.

`BOTINC_API_URL`, `BOTINC_TOKEN` and `BOTINC_WORKSPACE` override the file, so
CI points at a deployment without touching a config.

## Work

```sh
botinc issue new "The importer drops the last row" -b "Off-by-one in the loop." -p high
botinc issue list --status needs_you,in_review
botinc issue show BOT-14
botinc issue comment BOT-14 "Reproduced against staging."
botinc issue work BOT-14 --watch
botinc issue approve BOT-14 --merge
botinc issue changes BOT-14 --note "Handle the empty case."
```

An issue is addressed by its identifier or its uuid; `BOT-14` works anywhere
an id does.

`issue work` opens a draft pull request and stops. Approval is a person's
step: nothing merges itself, and `--merge` queues a recorded merge run rather
than flipping a row.

## Chat

```sh
botinc chat new "Why is the deploy slow?" --watch
botinc chat list
botinc chat show <id>
botinc chat send <id> "Also check the cache." --queue
```

## Runs

```sh
botinc run list
botinc run show <id>
botinc run watch <id>     # exits non-zero unless the run succeeded
botinc run cancel <id>
```

`run watch` is safe as a gate in a script: its exit code is 0 only when the
run finished successfully.

## Routines

Scheduled, webhook-triggered or manual automation.

```sh
botinc routine new --name "Morning triage" --prompt "Triage overnight work." \
  --cron "0 9 * * *" --tz Europe/Madrid
botinc routine new --name "On deploy" --prompt "Check the release." --webhook
botinc routine list
botinc routine trigger <id>
botinc routine pause <id>
botinc routine resume <id>
```

A webhook routine prints its URL and secret once. Sign the request body with
that secret and send it as `X-BotInc-Signature: sha256=<hex>`. A leaked URL
alone cannot start work.

## Workflows

A version is immutable. Applying a graph always writes a new version, so the
history of how work was done stays readable.

```sh
botinc workflow list
botinc workflow show fix-review
botinc workflow apply --name Triage --file graph.json
botinc workflow apply triage --file graph.json --activate
botinc workflow activate triage 2
```

A graph is validated before it is stored: exactly one start and one finish,
unique keys, known node kinds, edges between real nodes, and every node
reachable from start.

## Accounts, repositories, projects

```sh
botinc account add --provider claude --kind api_key --secret-file ./key.txt
botinc account list
botinc repo add arosasg/botinc-v2
botinc project new Platform
```

A key is sent once and stored encrypted. It is never returned by the API and
never printed. Prefer `--secret-file` so the value stays out of shell history.
