import { describe, expect, it } from "vitest";
import type { Account, Autopilot, Conversation, Issue, Message, User } from "@botinc/api";
import { mapAccount, mapAutopilot, mapConversation, mapIssue, type PeopleIndex } from "./map";

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
      id: "a1", provider: "claude", label: "Team key", plan: "max",
      kind: "subscription", status: "connected", quota: [], has_secret: true, ...over,
    };
  }

  it("draws no capacity meter when the provider reported no quota", () => {
    expect(mapAccount(account({ quota: [] })).limits).toEqual([]);
  });

  it("turns a reported window into a percentage", () => {
    const row = mapAccount(account({ quota: [{ window: "week", used: 63, limit: 100, resets_at: "Mon 00:00" }] }));
    expect(row.limits).toEqual([{ label: "WEEK", percent: 63, resets: "Mon 00:00" }]);
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
});

describe("mapAutopilot", () => {
  it("carries the trigger the design shows", () => {
    const a: Autopilot = {
      id: "r1", name: "Morning triage", description: "", prompt: "Triage.",
      trigger: { kind: "schedule", cron: "0 9 * * *", tz: "Europe/Madrid" },
      workflow_id: null, model: "auto", enabled: true,
      last_run_at: null, next_run_at: "2026-09-14T07:00:00Z",
    };
    const row = mapAutopilot(a);
    expect(row.trigger).toBe("schedule");
    expect(row.cron).toBe("0 9 * * *");
    expect(row.model).toBe("Auto");
    expect(row.enabled).toBe(true);
  });
});
