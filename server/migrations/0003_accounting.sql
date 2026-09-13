-- Starter credit belongs to a person, not to each workspace they create.
create table starter_credit_claims (
 user_id uuid primary key references users(id) on delete cascade,
 workspace_id uuid references workspaces(id) on delete set null,
 claimed_at timestamptz not null default now()
);
insert into starter_credit_claims(user_id,workspace_id,claimed_at)
select distinct on(w.created_by) w.created_by,w.id,l.created_at
from workspaces w join credit_ledger l on l.workspace_id=w.id
where w.created_by is not null and l.kind='grant' and l.note='Starter credit'
order by w.created_by,l.created_at;

-- Reconcile completed pre-accounting runs from provider-reported costs.
-- Existing usage entries are subtracted; own account costs are never debited.
insert into credit_ledger(workspace_id,kind,amount_cents,note,run_id)
select r.workspace_id,'usage',-(r.cost_cents+coalesce(l.amount,0)),
 'Reconciled provider-reported run usage',r.id
from runs r left join (
 select run_id,sum(amount_cents) amount from credit_ledger where kind='usage' group by run_id
) l on l.run_id=r.id
where r.funding='credits' and r.finished_at is not null
 and r.cost_cents+coalesce(l.amount,0)>0;
