create table oauth_clients (
  id text primary key,
  name text not null,
  redirect_uris jsonb not null,
  created_at timestamptz not null default now()
);

create table oauth_authorization_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  client_id text not null references oauth_clients(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  resource text not null,
  scopes jsonb not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  access_hash text not null unique,
  refresh_hash text not null unique,
  client_id text not null references oauth_clients(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  resource text not null,
  scopes jsonb not null,
  expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index oauth_tokens_access_idx on oauth_tokens(access_hash) where revoked_at is null;
create index oauth_tokens_refresh_idx on oauth_tokens(refresh_hash) where revoked_at is null;
