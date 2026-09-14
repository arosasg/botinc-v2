alter table model_accounts add column if not exists account_key text not null default '';
alter table model_accounts add column if not exists email text not null default '';
alter table model_accounts add column if not exists credential_kind text not null default 'token';
alter table model_accounts add column if not exists refresh_ref text not null default '';
alter table model_accounts add column if not exists expires_at timestamptz;
alter table model_accounts add column if not exists refresh_error text not null default '';

create unique index if not exists model_accounts_identity_idx
  on model_accounts (workspace_id, user_id, provider, account_key)
  where account_key <> '';
