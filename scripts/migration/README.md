# v1 migration rehearsal

Export each workspace with its authorized CLI credential:

```
python3 scripts/migration/export-v1.py --workspace-id UUID --output /private/export/UUID
```

The exporter reads every issue page, full comments, execution records, members,
projects and routine definitions. It aborts on denied access or an unconsumed
pagination cursor. The manifest hashes every exported file. Keep exports private:
source history and routine trigger definitions can contain sensitive data.

Run the importer against a separate v2 database:

```
DATABASE_URL=... go -C server run ./cmd/migrate-v1 --input /private/export/UUID --owner-email owner@example.com
```

The default rehearses all data inserts in a transaction and rolls them back.
Schema migrations run before that transaction. Add `--apply` to commit the import.
The source owner must be an exported owner/admin. Existing v2 users are matched
by email; memberships retain their source roles. Issues retain UUIDs, numbers,
timestamps, descriptions and parent links. Comments retain their IDs, authors,
source metadata and text. Other source fields and old execution records remain
in the private migration archive, never fabricated as new completed v2 runs.
GitHub repository URLs from the saved workspace are normalized and imported
idempotently. A repository becomes runnable only when the migrated workspace's
GitHub connection still authorizes that repository.

The importer creates a separate `v1-<workspace ID prefix>` workspace. Identical
snapshot replay is a no-op; a changed snapshot is refused so it cannot overwrite
new v2 edits. A separate delta migration is required before eventual cutover.
No source rows, source schedules or source agents are modified.

Routines retain prompts and schedule expressions/time zones. Multiple triggers
become separate v2 routine rows, with stable IDs. Every imported routine remains
paused and records its original status and complete definition. Webhook secrets
are not automatically activated or rotated. Recreate provider integrations,
check execution ownership and adapt v1-specific commands to the single v2 agent
before enabling any routine. There must be exactly one active scheduler at handoff.

Release work still required: other workspace exports with authorized access,
provider/account and attachment migration, execution-mode compatibility,
workflow/review behavior, final delta synchronization, source scheduler handoff,
backup restore and production-domain checks. An import is not proof that a
routine has run successfully.
