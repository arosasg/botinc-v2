import { describe, expect, it, vi } from "vitest";
import { decisionFor, installPerformanceGuards, issueIndex, memoiseMethod, type LogicLike } from "./perf";
import type { Vals } from "../vals";

/* The design's decision9, verbatim, as the oracle for the indexed version. */
function designDecision9(state: Vals, id: string): Vals | null {
  const t = (state.decisions9 || {})[id] || null;
  const i = (state.issues || []).find((o: Vals) => o.id === id);
  return t && !t.resolved && ["connection", "funding"].includes(t.kind) && i?.status === "Running"
    ? { ...t, resolved: true }
    : i?.status === "Ready for review" && (!t || t.resolved)
      ? { kind: "review", owner: i.owner, reason: "Review the new result and confirm the next step.", questions: [], answers: [], resolved: false }
      : t;
}

const issues = [
  { id: "BOT-1", status: "Running", owner: "Alex" },
  { id: "BOT-2", status: "Ready for review", owner: "Mika" },
  { id: "BOT-3", status: "Done", owner: "Alex" },
  { id: "BOT-4", status: "Ready for review", owner: "Sam" },
];
const decisions9 = {
  "BOT-1": { kind: "funding", owner: "Alex", resolved: false },
  "BOT-3": { kind: "answer", owner: "Alex", resolved: false },
  "BOT-4": { kind: "review", owner: "Sam", resolved: true },
};

describe("decisionFor", () => {
  it("matches the design's decision9 for every issue and for unknown ids", () => {
    const state = { issues, decisions9 };
    const index = issueIndex()(state);
    for (const id of [...issues.map((i) => i.id), "BOT-404"]) {
      expect(decisionFor(state, index, id)).toEqual(designDecision9(state, id));
    }
  });
});

describe("issueIndex", () => {
  it("rebuilds only when the issues array is replaced", () => {
    const index = issueIndex();
    const state = { issues };
    const first = index(state);
    expect(index(state)).toBe(first);
    const next = { issues: [...issues, { id: "BOT-5", status: "Incoming" }] };
    expect(index(next)).not.toBe(first);
    expect(index(next).get("BOT-5")?.status).toBe("Incoming");
  });
});

describe("memoiseMethod", () => {
  it("reuses the result while the keyed slices keep their identity and recomputes when one changes", () => {
    const compute = vi.fn(function (this: Vals) { return this.state.issues.map((i: Vals) => i.id); });
    const logic: LogicLike = { state: { issues, member: "Alex" }, rows: compute };
    memoiseMethod(logic, "rows", (s) => [s.issues, s.member]);
    const first = logic.rows();
    expect(logic.rows()).toBe(first);
    logic.state = { ...logic.state, view: "chat" };
    expect(logic.rows()).toBe(first);
    expect(compute).toHaveBeenCalledTimes(1);
    logic.state = { ...logic.state, issues: [...issues] };
    expect(logic.rows()).not.toBe(first);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it("passes calls with arguments straight through", () => {
    const compute = vi.fn((n?: number) => n ?? "all");
    const logic: LogicLike = { state: {}, rows: compute };
    memoiseMethod(logic, "rows", () => []);
    expect(logic.rows(3)).toBe(3);
    expect(logic.rows(4)).toBe(4);
    expect(compute).toHaveBeenCalledTimes(2);
  });
});

describe("installPerformanceGuards", () => {
  it("indexes decision9 and memoises the list derivations without changing their results", () => {
    const calls = { conversations: 0 };
    const logic: LogicLike = {
      state: { issues, decisions9, member: "Alex", chats: {}, pinned12: [], expandedGroups12: {} },
      decision9(this: Vals, id: string) { return designDecision9(this.state, id); },
      conversations9(this: Vals) { calls.conversations++; return this.state.issues.map((i: Vals) => ({ id: "issue:" + i.id, group: "Recent", decision: this.decision9(i.id) })); },
      groups12(this: Vals) { return [{ title: "Recent", rows: this.conversations9() }]; },
      searchChatRows14(this: Vals) { return this.conversations9().map((r: Vals) => r.id); },
    };
    const before = logic.conversations9();
    installPerformanceGuards(logic);
    expect(logic.conversations9()).toEqual(before);
    expect(logic.decision9("BOT-2")).toEqual(designDecision9(logic.state, "BOT-2"));
    const rows = logic.conversations9();
    logic.groups12();
    logic.searchChatRows14();
    expect(logic.conversations9()).toBe(rows);
    expect(calls.conversations).toBe(2);
    logic.state = { ...logic.state, activeIssue: "BOT-1" };
    expect(logic.conversations9()).not.toBe(rows);
    expect(calls.conversations).toBe(3);
  });
});
