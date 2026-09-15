import { describe, expect, it } from "vitest";
import type { Account, Attachment, Autopilot, Conversation, Issue, IssueComment, Message, Run, User, WorkflowVersion } from "@botinc/api";
import { clockLabel, dayLabel, mapAccount, mapAutopilot, mapConversation, mapIssue, mapIssueTimeline, mapWorkflowSteps, whenLabel, type PeopleIndex } from "./map";

/* The workspace logic does not treat status as free text: it groups the
   sidebar by comparing against a fixed set of sentences, and anything outside
   that set silently lands in the "Recent" bucket, which renders as "Done".
   These are the strings the design compares against; a rename here files every
   open issue under Done, which is exactly what happened once. */
const DESIGN_STATUSES = new Set([
  "Incoming", "Running", "Paused", "Ready for review",
  "Changes requested", "Merged dev", "Blocked", "Done", "Canceled",
]);

const people: PeopleIndex = new Map([["u1", { name: "Alejandro Rosas", email: "a@b.test" }]]);

function issue(over: Partial<Issue> = {}): Issue {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    identifier: "BOT-1",
    project_id: null,
    number: 1,
    title: "Checkout total wrong after quantity change",
    description: "The total lags a render behind.",
    status: "todo",
    priority: "urgent",
    assignee_user_id: null,
    parent_id: null,
    workflow_id: null,
    source: { kind: "manual" },
    needs_you: null,
    created_by: null,
    created_at: "2026-09-13T10:00:00Z",
    updated_at: "2026-09-13T10:00:00Z",
    ...over,
  };
}

describe("mapIssue", () => {
  it("only ever produces a status the design groups on", () => {
    const statuses: Issue["status"][] = [
      "needs_you", "todo", "in_progress", "in_review", "blocked", "done", "cancelled",
    ];
    for (const status of statuses) {
      const row = mapIssue(issue({ status }), people);
      expect(DESIGN_STATUSES, `status ${status} produced ${row.status}`).toContain(row.status);
    }
  });

  it("maps each API status to the design's own sentence", () => {
    const pairs: Array<[Issue["status"], string]> = [
      ["todo", "Incoming"],
      ["in_progress", "Running"],
      ["in_review", "Ready for review"],
      ["needs_you", "Ready for review"],
      ["blocked", "Blocked"],
      ["done", "Done"],
      ["cancelled", "Canceled"],
    ];
    for (const [api, design] of pairs) {
      expect(mapIssue(issue({ status: api }), people).status).toBe(design);
    }
  });

  it("carries the identifier the human uses, and the uuid the API needs", () => {
    const row = mapIssue(issue(), people);
    expect(row.id).toBe("BOT-1");
    expect(row.uuid).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("resolves an assignee to a name and an initial", () => {
    const row = mapIssue(issue({ assignee_user_id: "u1" }), people);
    expect(row.owner).toBe("Alejandro Rosas");
    expect(row.ownerInitial).toBe("A");
  });

  it("leaves the owner empty rather than guessing one", () => {
    const row = mapIssue(issue({ assignee_user_id: null }), people);
    expect(row.owner).toBe("");
    expect(row.ownerInitial).toBe("");
  });

  it("does not invent the fields that only a run can report", () => {
    const row = mapIssue(issue(), people) as Record<string, unknown>;
    for (const invented of ["files", "checks", "pr", "head", "changeSummary", "reviewSummary", "cost"]) {
      expect(row[invented], `${invented} must not be fabricated`).toBeUndefined();
    }
  });

  it("labels known sources and titlecases the rest", () => {
    expect(mapIssue(issue({ source: { kind: "github" } }), people).source).toBe("GitHub");
    expect(mapIssue(issue({ source: { kind: "sentry" } }), people).source).toBe("Sentry");
    expect(mapIssue(issue({ source: {} }), people).source).toBe("Manual");
  });
});

describe("mapAccount", () => {
  function account(over: Partial<Account> = {}): Account {
    return {
      id: "a1", provider: "claude", label: "Team key", email: "owner@example.test", plan: "max",
      kind: "subscription", status: "connected", quota: [], has_secret: true, ...over,
    };
  }

  it("draws no capacity meter when the provider reported no quota", () => {
    const row = mapAccount(account({ quota: [] }));
    expect(row.limits).toEqual([]);
    expect(row.capturedAgo).toBeNull();
    expect(row.runtimeRoutable).toBe(true);
    expect(row.identity).toBe("owner@example.test");
  });

  it("turns a reported window into a percentage", () => {
    const row = mapAccount(account({ quota: [{ window: "week", used: 63, limit: 100, resets_at: "Mon 00:00" }] }));
    expect(row.limits).toEqual([{ label: "WEEK", percent: 63, resets: "Mon 00:00" }]);
  });

  it("keeps the provider observation age instead of presenting stale usage as fresh", () => {
    const observed = new Date(Date.now() - 17 * 60_000).toISOString();
    const row = mapAccount(account({ quota: [{ window: "session", used: 25, limit: 100, observed_at: observed }] }));
    expect(row.capturedAgo).toBeGreaterThanOrEqual(17);
  });

  it("ignores a window with no limit rather than dividing by zero", () => {
    const row = mapAccount(account({ quota: [{ window: "session", used: 5, limit: 0 }] }));
    expect(row.limits).toEqual([]);
  });

  it("reports a disconnected account as inactive", () => {
    const row = mapAccount(account({ status: "disconnected" }));
    expect(row.enabled).toBe(false);
    expect(row.active).toBe(false);
  });
});

describe("mapIssueTimeline", () => {
  const comments: IssueComment[] = [
    { id: "c2", author_user_id: null, author_kind: "system", body: "Fixed in [PR #42](https://github.com/acme/app/pull/42).", created_at: "2026-09-13T10:03:00Z" },
    { id: "c1", author_user_id: "u1", author_kind: "user", body: "Please verify the exact failure.", created_at: "2026-09-13T10:01:00Z" },
  ];
  const runs: Run[] = [{
    id: "r1", workspace_id: "w1", issue_id: issue().id, conversation_id: null,
    purpose: "implementation", status: "done", model: "GPT-6 Astra", effort: "high", funding: "subscription",
    task_limit_cents: 200, cost_cents: 16, error: "", queued_at: "2026-09-13T10:02:00Z",
    started_at: "2026-09-13T10:02:01Z", finished_at: "2026-09-13T10:02:30Z",
  }];

  it("turns real issue history into the rich design timeline in chronological order", () => {
    const rows = mapIssueTimeline(issue(), comments, runs, people, "Alejandro Rosas");

    expect(rows.map((row) => row.id)).toEqual([
      `issue:${issue().id}`, "comment:c1", "run:r1", "comment:c2",
    ]);
    expect(rows[0]).toMatchObject({ plain17: true, human: true, who: "Original request", text: issue().description });
    expect(rows[1]).toMatchObject({ plain17: true, human: true, who: "Alejandro Rosas" });
    expect(rows[2]).toMatchObject({ route17: true, cls: "route-entry17", logo: "/assets/brands-v12/codex.svg" });
    expect(rows[3]).toMatchObject({ plain17: true, operator: true, who: "Operator" });
  });

  it("shows no designed history when the API has no history", () => {
    expect(mapIssueTimeline(issue({ description: "" }), [], [], people, "Alejandro Rosas")).toEqual([]);
  });
});

describe("mapConversation", () => {
  const me: User = { id: "u1", email: "a@b.test", name: "Alejandro Rosas", avatar_url: "", created_at: "" };

  function conversation(over: Partial<Conversation> = {}): Conversation {
    return {
      id: "c1", user_id: "u1", issue_id: null, title: "Why is the deploy slow?",
      model: "auto", shared: false, archived_at: null,
      created_at: "", updated_at: "", ...over,
    };
  }
  function message(over: Partial<Message> = {}): Message {
    return {
      id: "m1", conversation_id: "c1", seq: 1, role: "user", body: "Why?",
      meta: {}, run_id: null, created_at: "", ...over,
    };
  }

  it("shows auto as the design writes it", () => {
    expect(mapConversation(conversation(), [], me, people).model).toBe("Auto");
  });

  it("falls back to a title rather than an empty row", () => {
    expect(mapConversation(conversation({ title: "" }), [], me, people).title).toBe("Untitled");
  });

  it("marks the reader's own messages and the operator's differently", () => {
    const rows = mapConversation(conversation(), [
      message({ role: "user", body: "Why?" }),
      message({ id: "m2", role: "operator", body: "Because the image rebuilds." }),
    ], me, people).messages;
    expect(rows[0]!.cls).toBe("message user-message");
    expect(rows[0]!.hasAvatar).toBe(false);
    expect(rows[1]!.cls).toBe("message assistant-message");
    expect(rows[1]!.author).toBe("Operator");
  });

  it("stamps each row with the design's clock and carries the conversation's dates", () => {
    const at = new Date(2026, 8, 14, 9, 41).toISOString();
    const mapped = mapConversation(conversation({ created_at: at, updated_at: at }), [message({ created_at: at })], me, people);
    expect(mapped.messages[0]!.time).toBe("9:41");
    expect(mapped.createdAt).toBe(at);
    expect(mapped.updatedAt).toBe(at);
    expect(mapConversation(conversation(), [message()], me, people).messages[0]!.time).toBe("");
  });

  it("renders only the attachments linked to each message", () => {
    const attachments: Attachment[] = [
      {
        id: "a1", issue_id: null, conversation_id: "c1", message_id: "m1", comment_id: null,
        filename: "evidence.png", content_type: "image/png", size_bytes: 1025, url: "/attachments/a1",
      },
      {
        id: "a2", issue_id: null, conversation_id: "c1", message_id: "m2", comment_id: null,
        filename: "later.txt", content_type: "text/plain", size_bytes: 20, url: "/attachments/a2",
      },
    ];

    const row = mapConversation(conversation(), [message()], me, people, attachments).messages[0]!;

    expect(row.hasAttachments11).toBe(true);
    expect(row.attachments11).toEqual([
      {
        id: "a1", name: "evidence.png", image: true, url: "/attachments/a1", size: 1025,
        meta: "2 KB · Image",
      },
    ]);
  });
});

describe("conversation time labels", () => {
  const morning = new Date(2026, 8, 14, 9, 5).toISOString();

  it("writes the clock without a leading zero and the day as the pane does", () => {
    expect(clockLabel(morning)).toBe("9:05");
    expect(dayLabel(morning)).toBe("Sep 14");
  });

  it("says Today for the current day and dates everything else", () => {
    expect(whenLabel(morning, new Date(2026, 8, 14, 18, 0))).toBe("Today 9:05");
    expect(whenLabel(morning, new Date(2026, 8, 15, 8, 0))).toBe("Sep 14 · 9:05");
  });

  it("leaves a missing or invalid stamp blank instead of inventing one", () => {
    expect(clockLabel("")).toBe("");
    expect(dayLabel("not a date")).toBe("");
    expect(whenLabel("")).toBe("");
  });
});

describe("mapAutopilot", () => {
  it("carries the trigger the design shows", () => {
    const a: Autopilot = {
      id: "r1", name: "Morning triage", description: "", prompt: "Triage.",
      trigger: { kind: "schedule", cron: "0 9 * * *", tz: "Europe/Madrid" },
      workflow_id: null, plugin_ids: [], model: "auto", enabled: true,
      last_run_at: null, next_run_at: "2026-09-14T07:00:00Z",
    };
    const row = mapAutopilot(a);
    expect(row.trigger).toBe("schedule");
    expect(row.cron).toBe("0 9 * * *");
    expect(row.kind).toBe("schedule");
    expect(row.cadence).toBe("daily");
    expect(row.time).toBe("09:00");
    expect(row.zone).toBe("Europe/Madrid");
    expect(row.source).toBe("BotInc");
    expect(row.workflowId).toBeNull();
    expect(row.triggerText).toBe("Every day at 09:00 · Europe/Madrid");
    expect(row.nextText).toMatch(/^Next /);
    expect(row.model).toBe("Auto");
    expect(row.enabled).toBe(true);
  });

  it("describes migrated interval schedules without undefined fields", () => {
    const a: Autopilot = {
      id: "r2", name: "Merge Warden", description: "", prompt: "Merge.",
      trigger: { kind: "schedule", cron: "*/10 * * * *", tz: "Europe/Madrid" },
      workflow_id: null, plugin_ids: [], model: "auto", enabled: false,
      last_run_at: null, next_run_at: null,
    };

    const row = mapAutopilot(a);

    expect(row.triggerText).toBe("Every 10 minutes · Europe/Madrid");
    expect(row.nextText).toBe("Paused");
    expect(row.source).toBe("BotInc");
  });

  it("describes migrated hourly and monthly cron schedules as schedules", () => {
    const base: Autopilot = {
      id: "r3", name: "Cleanup", description: "", prompt: "Clean up.",
      trigger: { kind: "schedule", cron: "0 */4 * * *", tz: "UTC" },
      workflow_id: null, plugin_ids: [], model: "auto", enabled: true,
      last_run_at: null, next_run_at: "2026-09-15T16:00:00Z",
    };

    expect(mapAutopilot(base).triggerText).toBe("Every 4 hours at :00 · UTC");
    expect(mapAutopilot({ ...base, trigger: { kind: "schedule", cron: "55 2-23/3 * * *", tz: "UTC" } }).triggerText)
      .toBe("Every 3 hours from 02:55 to 23:55 · UTC");
    expect(mapAutopilot({ ...base, trigger: { kind: "schedule", cron: "0 8 8,22 * *", tz: "UTC" } }).triggerText)
      .toBe("Monthly on days 8 and 22 at 08:00 · UTC");
  });
});

describe("mapWorkflowSteps", () => {
  it("uses the active API graph instead of the design's sample workflow", () => {
    const version: WorkflowVersion = {
      id: "v1", version: 3, status: "active", created_at: "",
      graph: { nodes: [{ key: "verify", name: "Verify production", kind: "task", model: "gpt-6-astra", prompt: "Check the live route." }], edges: [] },
    };
    let opened = -1;

    const steps = mapWorkflowSteps(version, 0, (index) => { opened = index; });

    expect(steps[0]).toMatchObject({ label: "Verify production", state: "READY", open: true, hasNote: true });
    steps[0]!.toggle();
    expect(opened).toBe(0);
  });
});
