create table autopilot_plugins (
  autopilot_id uuid not null references autopilots(id) on delete cascade,
  plugin_id uuid not null references plugins(id) on delete cascade,
  primary key (autopilot_id, plugin_id)
);

create table run_plugins (
  run_id uuid not null references runs(id) on delete cascade,
  plugin_id uuid not null references plugins(id) on delete cascade,
  primary key (run_id, plugin_id)
);

alter table message_queue add column plugin_ids uuid[] not null default '{}';

create index autopilot_plugins_plugin_idx on autopilot_plugins(plugin_id);
create index run_plugins_plugin_idx on run_plugins(plugin_id);
