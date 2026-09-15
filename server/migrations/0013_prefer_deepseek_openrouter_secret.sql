-- Some workspaces have more than one OpenRouter account. The legacy DeepSeek
-- harness used its explicitly named OpenRouter - DeepSeek account, not the
-- oldest generic Personal account. Correct only accounts which still share an
-- OpenRouter secret, preserving every independently reconnected harness.
with preferred as (
  select distinct on (workspace_id) workspace_id, secret_ref
  from model_accounts
  where provider = 'openrouter'
    and status = 'connected'
    and secret_ref <> ''
  order by workspace_id,
    case when lower(label) like '%deepseek%' then 0 else 1 end,
    created_at
), shared_harness as (
  select deepseek.id
  from model_accounts as deepseek
  where deepseek.provider = 'deepseek'
    and exists (
      select 1
      from model_accounts as openrouter
      where openrouter.workspace_id = deepseek.workspace_id
        and openrouter.provider = 'openrouter'
        and openrouter.secret_ref = deepseek.secret_ref
    )
)
update model_accounts as deepseek
set secret_ref = preferred.secret_ref,
    updated_at = now()
from preferred
where deepseek.workspace_id = preferred.workspace_id
  and deepseek.id in (select id from shared_harness)
  and deepseek.secret_ref <> preferred.secret_ref;
