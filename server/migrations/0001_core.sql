-- BotInc v2 core schema. One file per change; applied in order by cmd/server.
create extension if not exists pgcrypto;
create extension if not exists citext;

create table users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  name text not null default '',
  avatar_url text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table login_codes (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);
create index login_codes_email_idx on login_codes (email, created_at desc);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  user_agent text not null default '',
  ip text not null default '',
  location text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index sessions_user_idx on sessions (user_id);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  plan text not null default 'free',
  issue_prefix text not null default 'BOT',
  issue_counter int not null default 0,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email citext not null,
  role text not null default 'member',
  token_hash text not null unique,
  invited_by uuid references users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table repositories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  provider text not null default 'github',
  full_name text not null,
  default_branch text not null default 'main',
  installation_id bigint,
  setup jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, full_name)
);

create table model_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  provider text not null,              -- claude | codex | cursor | copilot | gemini | openrouter | api
  label text not null default '',
  plan text not null default '',
  kind text not null default 'subscription', -- subscription | api_key | credits
  status text not null default 'connected',  -- connected | limited | disconnected
  quota jsonb not null default '[]'::jsonb,  -- [{window,used,limit,resets_at,observed_at}]
  secret_ref text not null default '',       -- reference into the credential store, never the secret
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table routing_policies (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  order_json jsonb not null default '["subscription","api_key","credits"]'::jsonb,
  fallback text not null default 'ask',  -- ask | credits | wait
  default_task_limit_cents int not null default 200,
  updated_at timestamptz not null default now()
);

create table workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  key text not null,
  name text not null,
  description text not null default '',
  active_version_id uuid,
  created_at timestamptz not null default now(),
  unique (workspace_id, key)
);

create table workflow_versions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  version int not null,
  status text not null default 'draft', -- draft | active | retired
  graph jsonb not null,
  created_at timestamptz not null default now(),
  unique (workflow_id, version)
);
alter table workflows add constraint workflows_active_fk foreign key (active_version_id) references workflow_versions(id);

create table issues (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  number int not null,
  title text not null,
  description text not null default '',
  status text not null default 'todo', -- needs_you | todo | in_progress | in_review | blocked | done | cancelled
  priority text not null default 'normal', -- urgent | high | normal | low
  assignee_user_id uuid references users(id) on delete set null,
  parent_id uuid references issues(id) on delete set null,
  workflow_id uuid references workflows(id) on delete set null,
  source jsonb not null default '{}'::jsonb, -- {kind: manual|sentry|github|linear|chat, ref, url}
  needs_you jsonb, -- {kind: review|answer|funding, since}
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, number)
);
create index issues_ws_status_idx on issues (workspace_id, status, updated_at desc);

create table issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  author_user_id uuid references users(id),
  author_kind text not null default 'user', -- user | operator | system
  body text not null,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  issue_id uuid references issues(id) on delete cascade,
  title text not null default '',
  model text not null default 'auto',
  shared boolean not null default false,
  forked_from uuid references conversations(id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index conversations_ws_idx on conversations (workspace_id, updated_at desc);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  seq bigint not null,
  role text not null, -- user | operator | notice | work
  author_user_id uuid references users(id),
  body text not null default '',
  meta jsonb not null default '{}'::jsonb,
  run_id uuid,
  created_at timestamptz not null default now(),
  unique (conversation_id, seq)
);

create table message_queue (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  position int not null,
  body text not null,
  mode text not null default 'queue', -- queue | steer
  created_at timestamptz not null default now()
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  issue_id uuid references issues(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete cascade,
  workflow_version_id uuid references workflow_versions(id),
  purpose text not null default 'chat', -- chat | build | review | verify | autopilot
  status text not null default 'queued', -- queued | provisioning | running | waiting | done | failed | cancelled
  model text not null default 'auto',
  account_id uuid references model_accounts(id) on delete set null,
  funding text not null default 'subscription',
  task_limit_cents int not null default 200,
  cost_cents int not null default 0,
  prompt text not null default '',
  result jsonb not null default '{}'::jsonb,
  error text not null default '',
  run_token_hash text,
  sandbox_id uuid,
  parent_run_id uuid references runs(id),
  created_by uuid references users(id),
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  heartbeat_at timestamptz
);
create index runs_ws_status_idx on runs (workspace_id, status, queued_at);
create index runs_issue_idx on runs (issue_id);
create index runs_conv_idx on runs (conversation_id);

create table run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  idx int not null,
  key text not null,
  name text not null,
  kind text not null default 'task', -- task | condition | repeat | question | approval | start | finish
  status text not null default 'upcoming', -- upcoming | running | done | changes | waiting | stuck | skipped
  model text not null default '',
  account_id uuid,
  effort text not null default '',
  cost_cents int not null default 0,
  output jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  unique (run_id, idx)
);

create table run_events (
  id bigserial primary key,
  run_id uuid not null references runs(id) on delete cascade,
  seq int not null,
  type text not null, -- log | tool | file | step | notice | result | error
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (run_id, seq)
);

create table sandboxes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  run_id uuid references runs(id) on delete set null,
  provider text not null,
  external_id text not null default '',
  status text not null default 'provisioning', -- provisioning | ready | running | stopped | failed
  cost_cents int not null default 0,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table autopilots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  trigger jsonb not null, -- {kind: schedule, cron, tz} | {kind: webhook, secret_ref} | {kind: event, source} | {kind: manual}
  workflow_id uuid references workflows(id) on delete set null,
  prompt text not null default '',
  model text not null default 'auto',
  funding text not null default 'subscription',
  enabled boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table autopilot_runs (
  id uuid primary key default gen_random_uuid(),
  autopilot_id uuid not null references autopilots(id) on delete cascade,
  run_id uuid references runs(id) on delete set null,
  status text not null default 'queued',
  summary text not null default '',
  created_at timestamptz not null default now()
);

create table plugins (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kind text not null, -- github | slack | gmail | google-drive | sentry | posthog | linear | notion | figma | ...
  status text not null default 'connected', -- connected | needs_reauth | disconnected
  scopes jsonb not null default '[]'::jsonb,
  account jsonb not null default '{}'::jsonb,
  secret_ref text not null default '',
  connected_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, kind)
);

create table credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kind text not null, -- grant | topup | usage | adjustment
  amount_cents int not null,
  note text not null default '',
  run_id uuid references runs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  prefix text not null,
  token_hash text not null unique,
  scopes jsonb not null default '["read","write"]'::jsonb,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table device_codes (
  id uuid primary key default gen_random_uuid(),
  device_code_hash text not null unique,
  user_code text not null unique,
  user_id uuid references users(id),
  approved_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table secrets (
  ref text primary key,
  workspace_id uuid references workspaces(id) on delete cascade,
  ciphertext bytea not null,
  created_at timestamptz not null default now()
);
