/* Server rows into the shapes the design's logic renders.
 *
 * The prototype's fixtures carry more than the API returns: a fixture issue
 * has diff hunks, check names and a review summary, because it was written to
 * show a finished screen. Those come from a run's result, not from the issue
 * row, so a field with no source is left out rather than invented. A screen
 * that has nothing real to show should look empty, not plausible. */

import type { Account, Attachment, Autopilot, Conversation, Issue, Message, Run, User } from "@botinc/api";

/* The design writes status as a sentence, the API as a token, and the sentence
   is not free text: the workspace logic groups the sidebar by comparing it
   against a fixed set ("Incoming", "Running", "Paused", "Ready for review",
   "Merged dev", "Done", "Canceled"). A value outside that set falls through to
   the "Recent" bucket, which the sidebar renames "Done" - so inventing labels
   here files every open issue under Done. These are the design's own strings. */
const ISSUE_STATUS_LABEL: Record<string, string> = {
  needs_you: "Ready for review",
  todo: "Incoming",
  in_progress: "Running",
  in_review: "Ready for review",
  blocked: "Blocked",
  done: "Done",
  cancelled: "Canceled",
};

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

export function initial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0]!.toUpperCase() : "?";
}

export type PeopleIndex = Map<string, { name: string; email: string }>;

function owner(people: PeopleIndex, id: string | null): { owner: string; ownerInitial: string } {
  if (!id) return { owner: "", ownerInitial: "" };
  const person = people.get(id);
  const name = person?.name || person?.email || "";
  return { owner: name, ownerInitial: name ? initial(name) : "" };
}

export function mapIssue(issue: Issue, people: PeopleIndex) {
  const source = issue.source ?? {};
  return {
    id: issue.identifier,
    uuid: issue.id,
    title: issue.title,
    description: issue.description,
    status: ISSUE_STATUS_LABEL[issue.status] ?? issue.status,
    statusKey: issue.status,
    priority: PRIORITY_LABEL[issue.priority] ?? issue.priority,
    source: typeof source.kind === "string" ? sourceLabel(source.kind) : "Manual",
    url: typeof source.url === "string" ? source.url : "",
    updated: issue.updated_at,
    created: issue.created_at,
    needsYou: Boolean(issue.needs_you),
    ...owner(people, issue.assignee_user_id),
    /* Deliberately absent until a run reports them: files, checks, pr, head,
       changeSummary, reviewSummary, cost. */
    events: [] as unknown[],
  };
}

function sourceLabel(kind: string): string {
  switch (kind) {
    case "github": return "GitHub";
    case "sentry": return "Sentry";
    case "linear": return "Linear";
    case "chat": return "Chat";
    case "manual": return "Manual";
    default: return kind ? kind[0]!.toUpperCase() + kind.slice(1) : "Manual";
  }
}

export function mapMessage(m: Message, me: User | null, people: PeopleIndex, attachments: Attachment[] = []) {
  const mine = m.role === "user";
  const author = mine
    ? (people.get(m.meta?.["author_user_id"] as string)?.name ?? me?.name ?? me?.email ?? "You")
    : m.role === "operator" ? "Operator" : "BotInc";
  return {
    id: m.id,
    author,
    model: typeof m.meta?.["model"] === "string" ? (m.meta["model"] as string) : "",
    hasAvatar: !mine,
    ...(mine ? {} : { avatar: "assets/agents/operator.svg" }),
    cls: mine ? "message user-message" : "message assistant-message",
    text: m.body,
    createdAt: m.created_at,
    attachments11: attachments.filter((a) => a.message_id === m.id).map((a) => ({
      id: a.id,
      name: a.filename,
      image: a.content_type.startsWith("image/"),
      url: a.url,
      size: a.size_bytes,
      meta: `${Math.max(1, Math.ceil(a.size_bytes / 1024))} KB · ${a.content_type.startsWith("image/") ? "Image" : "File"}`,
    })),
  };
}

export function mapConversation(c: Conversation, messages: Message[], me: User | null, people: PeopleIndex, attachments: Attachment[] = []) {
  return {
    id: c.id,
    title: c.title || "Untitled",
    agent: "operator",
    model: c.model === "auto" ? "Auto" : c.model,
    phase: "done",
    result: false,
    messages: messages.map((m) => mapMessage(m, me, people, attachments)),
  };
}

export function mapAutopilot(a: Autopilot) {
  return {
    id: a.id,
    name: a.name,
    title: a.name,
    description: a.description,
    prompt: a.prompt,
    enabled: a.enabled,
    trigger: a.trigger?.kind ?? "manual",
    cron: a.trigger?.cron ?? "",
    tz: a.trigger?.tz ?? "",
    lastRun: a.last_run_at,
    nextRun: a.next_run_at,
    model: a.model === "auto" ? "Auto" : a.model,
  };
}

/* The design's model-account row. `limits` drives the capacity meters, so it
   stays empty when the provider has not reported a quota: a meter drawn from
   nothing is a made-up figure, and the design says a figure with no receipt
   does not ship. */
export function mapAccount(a: Account) {
  return {
    id: a.id,
    provider: a.provider,
    label: a.label || a.provider,
    plan: a.plan,
    kind: a.kind,
    identity: "",
    where: "BotInc Cloud",
    added: "",
    enabled: a.status === "connected",
    active: a.status === "connected",
    status: a.status === "connected" ? "ok" : a.status,
    limits: (a.quota ?? [])
      .filter((w) => w && w.limit > 0)
      .map((w) => ({
        label: (w.window ?? "").toUpperCase(),
        percent: Math.round((w.used / w.limit) * 100),
        resets: w.resets_at ?? "",
      })),
    capturedAgo: 0,
    limitReason: "",
    limitedUntil: "",
  };
}

export function mapRun(r: Run) {
  return {
    id: r.id,
    purpose: r.purpose,
    status: r.status,
    model: r.model,
    funding: r.funding,
    cost: r.cost_cents / 100,
    error: r.error,
    queuedAt: r.queued_at,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
  };
}
