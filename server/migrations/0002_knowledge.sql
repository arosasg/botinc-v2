create table skills (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 name text not null,
 body text not null,
 enabled boolean not null default true,
 created_by uuid not null references users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index skills_workspace_idx on skills(workspace_id);
create table memories (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 user_id uuid not null references users(id),
 scope text not null check(scope in ('personal','workspace','project')),
 project_id uuid references projects(id) on delete cascade,
 body text not null,
 pinned boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check((scope='project') = (project_id is not null))
);
create index memories_workspace_idx on memories(workspace_id,user_id);
