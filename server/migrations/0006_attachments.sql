create table attachments (
 id uuid primary key,
 workspace_id uuid not null references workspaces(id),
 issue_id uuid references issues(id),
 conversation_id uuid references conversations(id),
 comment_id uuid references issue_comments(id),
 filename text not null,
 content_type text not null,
 size_bytes bigint not null check(size_bytes>=0),
 sha256 text not null,
 created_by uuid references users(id),
 created_at timestamptz not null default now(),
 check(num_nonnulls(issue_id,conversation_id)=1)
);
create index attachments_issue on attachments(issue_id);
create index attachments_conversation on attachments(conversation_id);
