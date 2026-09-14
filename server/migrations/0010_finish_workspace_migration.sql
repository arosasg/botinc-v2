create table workspace_slug_aliases (
  slug text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table runs add column effort text not null default '';
alter table message_queue add column effort text not null default '';

update runs run
set effort = (
  select step.effort from run_steps step
  where step.run_id = run.id and step.effort <> ''
  order by step.idx desc limit 1
)
where run.effort = '' and exists (
  select 1 from run_steps step where step.run_id = run.id and step.effort <> ''
);

insert into workspace_slug_aliases (slug, workspace_id)
select slug, id from workspaces where slug like 'v1-%'
on conflict (slug) do nothing;

update workspaces set slug = case slug
  when 'v1-44148312' then 'botinc'
  when 'v1-27722ac2' then 'didit'
  when 'v1-bd5914e9' then 'hi-doctor'
  when 'v1-1836dd37' then 'personal'
  when 'v1-fd6a672c' then 'sante'
  when 'v1-a2ee8b89' then 'sante-labs'
  else slug
end
where slug in ('v1-44148312','v1-27722ac2','v1-bd5914e9','v1-1836dd37','v1-fd6a672c','v1-a2ee8b89');

-- V1 exposed every connected workspace MCP to every routine. Preserve that
-- access explicitly so V2 can keep runtime connector scope least-privileged.
insert into autopilot_plugins (autopilot_id, plugin_id)
select autopilot.id, plugin.id
from autopilots autopilot
join plugins plugin on plugin.workspace_id = autopilot.workspace_id
where plugin.status = 'connected' and plugin.kind like 'mcp:%'
on conflict do nothing;

-- Imports were held while the destination runtime was being verified. The
-- scheduler initializes a fresh next_run_at before any schedule can fire.
update autopilots set enabled = true, next_run_at = null;

-- The v1 daemon called the DeepSeek harness "dsh". V2 uses the product name
-- everywhere, while retaining the stable account key and encrypted secret.
update model_accounts set provider = 'deepseek' where provider = 'dsh';
