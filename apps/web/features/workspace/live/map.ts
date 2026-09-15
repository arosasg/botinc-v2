/* Server rows into the shapes the design's logic renders.
 *
 * The prototype's fixtures carry more than the API returns: a fixture issue
 * has diff hunks, check names and a review summary, because it was written to
 * show a finished screen. Those come from a run's result, not from the issue
 * row, so a field with no source is left out rather than invented. A screen
 * that has nothing real to show should look empty, not plausible. */

import type { Account, Attachment, Autopilot, Conversation, Issue, IssueComment, Message, Run, User, WorkflowVersion } from "@botinc/api";

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

export interface IssueTimelineRow {
  id: string;
  sortAt: string;
  plain17?: boolean;
  route17?: boolean;
  operator?: boolean;
  human?: boolean;
  initial?: string;
  who?: string;
  time: string;
  text: string;
  cls: string;
  routeTone?: string;
  hasLogo?: boolean;
  logo?: string;
  logoClass?: string;
  hasLeft?: boolean;
}

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

function timelineTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
}

function modelBrand(model: string): { logo: string; logoClass: string } {
  const normalized = model.toLowerCase();
  if (normalized.includes("gpt") || normalized.includes("codex") || normalized.includes("openai")) {
    return { logo: "/assets/brands-v12/codex.svg", logoClass: "mono12" };
  }
  if (normalized.includes("openrouter")) {
    return { logo: "/assets/brands-v12/openrouter.svg", logoClass: "" };
  }
  return { logo: "/assets/brands-v12/claude.svg", logoClass: "" };
}

/**
 * Translate the durable issue record into the rich Workspace v19 timeline.
 * The Design sample used its own scenario fixtures. Production must never
 * depend on those IDs, so this mapper only emits rows backed by API data.
 */
export function mapIssueTimeline(
  issue: Issue,
  comments: IssueComment[],
  runs: Run[],
  people: PeopleIndex,
  currentMember: string,
): IssueTimelineRow[] {
  const rows: IssueTimelineRow[] = [];

  if (issue.description.trim()) {
    const author = people.get(issue.created_by ?? "")?.name || "Original request";
    rows.push({
      id: `issue:${issue.id}`,
      sortAt: issue.created_at,
      plain17: true,
      human: true,
      initial: initial(author),
      who: author,
      time: timelineTime(issue.created_at),
      text: issue.description,
      cls: "human13",
    });
  }

  for (const run of runs) {
    const status = run.status.replaceAll("_", " ");
    const isActive = ["queued", "provisioning", "running"].includes(run.status);
    const brand = modelBrand(run.model);
    rows.push({
      id: `run:${run.id}`,
      sortAt: run.queued_at,
      route17: true,
      routeTone: isActive ? "tone-midrun17" : run.status === "failed" ? "tone-warn17" : "tone-credit17",
      hasLogo: true,
      logo: brand.logo,
      logoClass: brand.logoClass,
      hasLeft: false,
      time: timelineTime(run.queued_at),
      text: `${run.model || "Auto"} - ${run.purpose || "Work"} - ${status}`,
      cls: "route-entry17",
    });
  }

  for (const comment of comments) {
    const isHuman = comment.author_kind === "user";
    const author = isHuman
      ? people.get(comment.author_user_id ?? "")?.name || currentMember || "Workspace member"
      : "Operator";
    rows.push({
      id: `comment:${comment.id}`,
      sortAt: comment.created_at,
      plain17: true,
      operator: !isHuman,
      human: isHuman,
      initial: initial(author),
      who: author,
      time: timelineTime(comment.created_at),
      text: comment.body,
      cls: isHuman ? "human13" : "",
    });
  }

  return rows.sort((left, right) => left.sortAt.localeCompare(right.sortAt));
}

export function mapMessage(m: Message, me: User | null, people: PeopleIndex, attachments: Attachment[] = []) {
  const mine = m.role === "user";
  const messageAttachments = attachments.filter((attachment) => attachment.message_id === m.id).map((attachment) => ({
    id: attachment.id,
    name: attachment.filename,
    image: attachment.content_type.startsWith("image/"),
    url: attachment.url,
    size: attachment.size_bytes,
    meta: `${Math.max(1, Math.ceil(attachment.size_bytes / 1024))} KB · ${attachment.content_type.startsWith("image/") ? "Image" : "File"}`,
  }));
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
    hasAttachments11: messageAttachments.length > 0,
    attachments11: messageAttachments,
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

export function mapWorkflowSteps(version: WorkflowVersion, openIndex: number, onToggle: (index: number) => void) {
  const icons: Record<string, string> = {
    start: "play",
    finish: "circle-check",
    condition: "git-branch",
    repeat: "repeat-2",
    approval: "badge-check",
    question: "circle-help",
  };
  return version.graph.nodes.map((node, index) => ({
    id: node.key,
    label: node.name,
    detail: [node.model && node.model !== "auto" ? node.model : "Auto", node.prompt].filter(Boolean).join(" · "),
    state: "READY",
    cls: "",
    icon: `/i15.svg#${icons[node.kind] ?? "bot"}`,
    open: index === openIndex,
    toggle: () => onToggle(index),
    facts: [
      { k: "Kind", v: node.kind[0]?.toUpperCase() + node.kind.slice(1) },
      { k: "Model", v: node.model && node.model !== "auto" ? node.model : "Auto" },
    ],
    hasNote: Boolean(node.prompt),
    note: node.prompt ?? "",
    hasRun: false,
  }));
}

export function mapAutopilot(a: Autopilot) {
  const kind = a.trigger?.kind ?? "manual";
  const zone = a.trigger?.tz || "UTC";
  const schedule = describeSchedule(a.trigger?.cron ?? "", zone);
  return {
    id: a.id,
    name: a.name,
    title: a.name,
    description: a.description,
    prompt: a.prompt,
    enabled: a.enabled,
    trigger: kind,
    kind,
    cron: a.trigger?.cron ?? "",
    tz: zone,
    zone,
    source: a.trigger?.source || (kind === "schedule" ? "BotInc" : "Manual"),
    cadence: schedule.cadence,
    time: schedule.time,
    triggerText: kind === "schedule" ? schedule.label : kind === "manual" ? "Started manually" : "",
    nextText: describeNextRun(a.enabled, a.next_run_at, zone),
    workflowId: a.workflow_id,
    lastRun: a.last_run_at,
    nextRun: a.next_run_at,
    model: a.model === "auto" ? "Auto" : a.model,
    pluginIds: a.plugin_ids ?? [],
  };
}

function describeSchedule(cron: string, zone: string): { cadence: string; time: string; label: string } {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cron.trim().split(/\s+/);
  const clock = /^\d+$/.test(minute ?? "") && /^\d+$/.test(hour ?? "")
    ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    : "";
  let cadence = cron || "Schedule";
  let timing = cron || "Schedule configured";

  if (/^\*\/\d+$/.test(minute ?? "") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const interval = minute!.slice(2);
    cadence = `Every ${interval} minutes`;
    timing = cadence;
  } else if (/^\d+(,\d+)+$/.test(minute ?? "") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const minutes = minute!.split(",");
    cadence = "Hourly";
    timing = `Every hour at ${minutes.map(value => `:${value.padStart(2, "0")}`).join(" and ")}`;
  } else if (/^\d+$/.test(minute ?? "") && /^\*\/\d+$/.test(hour ?? "") && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const interval = hour!.slice(2);
    const minuteLabel = `:${minute!.padStart(2, "0")}`;
    cadence = `Every ${interval} hours`;
    timing = `${cadence} at ${minuteLabel}`;
  } else if (/^\d+$/.test(minute ?? "") && /^\d+-\d+\/\d+$/.test(hour ?? "") && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const [range, interval] = hour!.split("/");
    const [start, end] = range!.split("-");
    const minuteLabel = minute!.padStart(2, "0");
    cadence = `Every ${interval} hours`;
    timing = `${cadence} from ${start!.padStart(2, "0")}:${minuteLabel} to ${end!.padStart(2, "0")}:${minuteLabel}`;
  } else if (clock && /^\d+(,\d+)*$/.test(dayOfMonth ?? "") && month === "*" && dayOfWeek === "*") {
    const days = dayOfMonth!.split(",");
    cadence = "monthly";
    timing = days.length === 1
      ? `Monthly on day ${days[0]} at ${clock}`
      : `Monthly on days ${days.slice(0, -1).join(", ")} and ${days.at(-1)} at ${clock}`;
  } else if (clock && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    cadence = "daily";
    timing = `Every day at ${clock}`;
  } else if (clock && dayOfMonth === "*" && month === "*" && /^\d$/.test(dayOfWeek ?? "")) {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    cadence = "weekly";
    timing = `Every ${weekdays[Number(dayOfWeek)]} at ${clock}`;
  } else if (clock && /^\*\/\d+$/.test(dayOfMonth ?? "") && month === "*" && dayOfWeek === "*") {
    const interval = dayOfMonth!.slice(2);
    cadence = `Every ${interval} days`;
    timing = `${cadence} at ${clock}`;
  }

  return { cadence, time: clock || (/^\d+$/.test(minute ?? "") ? `00:${minute!.padStart(2, "0")}` : ""), label: `${timing} · ${zone}` };
}

function describeNextRun(enabled: boolean, nextRun: string | null, zone: string): string {
  if (!enabled) return "Paused";
  if (!nextRun) return "Ready";
  try {
    const formatted = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: zone,
    }).format(new Date(nextRun));
    return `Next ${formatted}`;
  } catch {
    return "Next run scheduled";
  }
}

/* The design's model-account row. `limits` drives the capacity meters, so it
   stays empty when the provider has not reported a quota: a meter drawn from
   nothing is a made-up figure, and the design says a figure with no receipt
   does not ship. */
export function mapAccount(a: Account) {
	const observedTimes=(a.quota??[]).map((window)=>window.observed_at?Date.parse(window.observed_at):NaN).filter(Number.isFinite);
	const capturedAgo=observedTimes.length?Math.max(0,Math.floor((Date.now()-Math.max(...observedTimes))/60000)):null;
  return {
    id: a.id,
    provider: a.provider,
    label: a.label || a.provider,
    plan: a.plan,
    kind: a.kind,
    identity: a.email || a.label || a.provider,
    where: "BotInc Cloud",
    added: "",
    enabled: a.status === "connected",
    active: a.status === "connected",
    status: a.status === "connected" ? "ok" : a.status,
    runtimeRoutable: a.status === "connected" && ["claude", "codex", "openrouter", "deepseek"].includes(a.provider),
    limits: (a.quota ?? [])
      .filter((w) => w && w.limit > 0)
      .map((w) => ({
        label: (w.window ?? "").toUpperCase(),
        percent: Math.round((w.used / w.limit) * 100),
        resets: w.resets_at ?? "",
      })),
    capturedAgo,
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
