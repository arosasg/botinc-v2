/* The shapes the API returns. Hand-written against server/internal/api so the
   field names are exactly the JSON tags; the contract test in the server suite
   is what keeps them honest. */

export type UUID = string;

export type User = {
  id: UUID;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
};

export type Workspace = {
  id: UUID;
  slug: string;
  name: string;
  plan: string;
  issue_prefix: string;
  role?: string;
  aliases?: string[];
  created_at: string;
};

export type IssueStatus =
  | "needs_you" | "todo" | "in_progress" | "in_review" | "blocked" | "done" | "cancelled";

export type Priority = "urgent" | "high" | "normal" | "low";

export type Issue = {
  id: UUID;
  identifier: string;
  project_id: UUID | null;
  number: number;
  title: string;
  description: string;
  status: IssueStatus;
  priority: Priority;
  assignee_user_id: UUID | null;
  parent_id: UUID | null;
  workflow_id: UUID | null;
  source: { kind?: string; ref?: string; url?: string };
  needs_you: { kind?: string; since?: string } | null;
  created_by: UUID | null;
  created_at: string;
  updated_at: string;
};

export type IssueComment = {
  id: UUID;
  author_user_id: UUID | null;
  author_kind: "user" | "operator" | "system";
  body: string;
  created_at: string;
};

export type RunStatus =
  | "queued" | "provisioning" | "running" | "waiting" | "done" | "failed" | "cancelled";

export type Run = {
  id: UUID;
  workspace_id: UUID;
  issue_id: UUID | null;
  conversation_id: UUID | null;
  purpose: string;
  status: RunStatus;
  model: string;
  effort: string;
  funding: string;
  task_limit_cents: number;
  cost_cents: number;
  error: string;
  queued_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type RunStep = {
  key: string;
  name: string;
  kind: string;
  status: string;
  model: string;
  effort: string;
  cost_cents: number;
};

export type RunEvent = {
  seq: number;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type Conversation = {
  id: UUID;
  user_id: UUID | null;
  issue_id: UUID | null;
  title: string;
  model: string;
  shared: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: UUID;
  conversation_id: UUID;
  seq: number;
  role: "user" | "operator" | "notice" | "work";
  body: string;
  meta: Record<string, unknown>;
  run_id: UUID | null;
  created_at: string;
};

export type Attachment = {
  id: UUID;
  issue_id: UUID | null;
  conversation_id: UUID | null;
  message_id: UUID | null;
  comment_id: UUID | null;
  filename: string;
  content_type: string;
  size_bytes: number;
  url: string;
};

export type Workflow = {
  id: UUID;
  key: string;
  name: string;
  description: string;
  active_version_id: UUID | null;
  created_at: string;
};

export type Autopilot = {
  id: UUID;
  name: string;
  description: string;
  trigger: { kind: string; cron?: string; tz?: string; source?: string };
  workflow_id: UUID | null;
  prompt: string;
  model: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  webhook_url?: string;
  plugin_ids: UUID[];
};

export type Account = {
  id: UUID;
  provider: string;
  label: string;
  email: string;
  plan: string;
  kind: "subscription" | "api_key" | "credits";
  status: "connected" | "limited" | "disconnected";
  quota: Array<{ window?: string; used: number; limit: number; resets_at?: string; observed_at?: string }>;
  has_secret: boolean;
};

export type Plugin = {
  id: UUID;
  kind: string;
  status: "connected" | "needs_reauth" | "disconnected";
  scopes: string[];
  account: Record<string, unknown>;
};

export type Project = {
  id: UUID;
  name: string;
  repositories: number;
  open_issues: number;
};

export type Repository = {
  id: UUID;
  project_id: UUID | null;
  full_name: string;
  default_branch: string;
};

export type Overview = {
  workspace: Workspace;
  issue_counts: Partial<Record<IssueStatus, number>>;
  credit_cents: number;
  running_runs: number;
};

/* Realtime envelopes. The hub sends {type, workspace_id, payload, at}. */
export type WSEvent = { type: string; workspace_id: UUID; at: string };

export type Skill = { id: UUID; name: string; body: string; enabled: boolean; created_by: UUID; updated_at: string };
export type Memory = { id: UUID; user_id: UUID; scope: "personal" | "workspace" | "project"; project_id: UUID | null; body: string; pinned: boolean; updated_at: string };
export type Member = { user_id: UUID; name: string; email: string; role: "owner" | "admin" | "member"; joined_at: string };
export type Invitation = { id: UUID; email: string; role: string; expires_at: string; created_at: string };
export type WorkflowGraph = { nodes: Array<{ key: string; name: string; kind: string; model?: string; effort?: string; prompt?: string; x?: number; y?: number }>; edges: string[][]; limits?: Record<string, number> };
export type WorkflowVersion = { id: UUID; version: number; status: string; graph: WorkflowGraph; created_at: string };
