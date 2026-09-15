-- A legacy dsh record identifies a harness, not a separate provider secret.
-- The harness used the workspace's OpenRouter key. Restore that relationship
-- only for untouched migration placeholders and leave manually reconnected
-- DeepSeek accounts unchanged.
with replacement as (
  select distinct on (workspace_id) workspace_id, secret_ref
  from model_accounts
  where provider = 'openrouter'
    and status = 'connected'
    and secret_ref <> ''
  order by workspace_id, created_at
)
update model_accounts as deepseek
set secret_ref = replacement.secret_ref,
    kind = 'api_key',
    credential_kind = 'api_key',
    status = 'connected',
    refresh_error = '',
    updated_at = now()
from replacement
where deepseek.workspace_id = replacement.workspace_id
  and deepseek.provider = 'deepseek'
  and deepseek.refresh_error = 'Legacy shared-credential profile requires reconnection';
