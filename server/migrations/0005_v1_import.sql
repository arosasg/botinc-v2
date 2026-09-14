-- Read-only source records retain fields that have no v2 execution equivalent.
create table migration_workspaces (
 source_workspace_id uuid primary key,
 workspace_id uuid not null unique references workspaces(id),
 snapshot_sha256 text not null,
 source_issue_count int not null,
 source_routine_count int not null,
 imported_at timestamptz not null default now(),
 activated_at timestamptz
);
create table migration_records (
 workspace_id uuid not null references workspaces(id),
 source_path text not null,
 sha256 text not null,
 payload jsonb not null,
 primary key(workspace_id,source_path)
);
alter table issue_comments add column source jsonb not null default '{}'::jsonb;
alter table autopilots add column source jsonb not null default '{}'::jsonb;
