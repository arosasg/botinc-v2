alter table attachments
  add column message_id uuid references messages(id) on delete cascade;

create index attachments_message on attachments(message_id);
