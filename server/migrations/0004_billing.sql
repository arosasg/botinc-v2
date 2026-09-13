-- Credit is granted only after a signed, paid Stripe checkout event.
create table billing_orders (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 created_by uuid not null references users(id),
 amount_cents integer not null check(amount_cents in (500,1000,2500,5000)),
 stripe_session_id text unique,
 checkout_url text not null default '',
 status text not null default 'pending' check(status in ('pending','paid','expired')),
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 ledger_id uuid unique references credit_ledger(id)
);
create index billing_orders_workspace on billing_orders(workspace_id,created_at desc);
create table billing_events (
 event_id text primary key,
 processed_at timestamptz not null default now()
);
