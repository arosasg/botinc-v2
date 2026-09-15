/* Performance guards for the design logic on a real workspace.

   The prototype re-derives its whole view-model on every state change, which
   is fine for a fixture of a few dozen rows and quadratic on a workspace with
   thousands of issues: `decision9(id)` scans every issue, `conversationsV9()`
   calls it for every issue, and `conversations9()` is asked for by several
   consumers within one render. Measured on production with 3,566 issues:
   ~360 ms per renderVals(), paid on every keystroke and every pointer move.

   These overrides keep the design's semantics and only change the cost:
   an indexed issue lookup, and single-entry memoisation of the zero-argument
   derivations keyed on the identity of the state slices they read (setState
   replaces slices immutably, so identity is the change signal). */

import type { Vals } from "../vals";

export type LogicLike = Vals & { state: Vals };

const same = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((value, i) => Object.is(value, b[i]));

/* Memoise a zero-argument method on `keyOf(state)`. Calls with arguments are
   passed straight through. */
export function memoiseMethod(logic: LogicLike, name: string, keyOf: (state: Vals, logic: LogicLike) => unknown[]): void {
  const original = logic[name];
  if (typeof original !== "function") return;
  let lastKey: unknown[] | undefined;
  let lastValue: unknown;
  logic[name] = function (this: LogicLike, ...args: unknown[]) {
    if (args.length) return original.apply(this, args);
    const key = keyOf(this.state, this);
    if (lastKey && same(key, lastKey)) return lastValue;
    lastValue = original.apply(this, args);
    lastKey = key;
    return lastValue;
  };
}

/* An id -> issue index rebuilt only when `state.issues` is a new array. */
export function issueIndex(): (state: Vals) => Map<unknown, Vals> {
  let source: unknown;
  let index = new Map<unknown, Vals>();
  return (state: Vals) => {
    const issues: Vals[] = state.issues || [];
    if (issues !== source) {
      source = issues;
      index = new Map();
      for (const issue of issues) index.set(issue.id, issue);
    }
    return index;
  };
}

/* The design's decision9 with the linear issue scan replaced by the index. */
export function decisionFor(state: Vals, index: Map<unknown, Vals>, id: unknown): Vals | null {
  const pending = (state.decisions9 || {})[id as string] || null;
  const issue = index.get(id);
  if (pending && !pending.resolved && ["connection", "funding"].includes(pending.kind) && issue?.status === "Running") return { ...pending, resolved: true };
  if (issue?.status === "Ready for review" && (!pending || pending.resolved)) {
    return { kind: "review", owner: issue.owner, reason: "Review the new result and confirm the next step.", questions: [], answers: [], resolved: false };
  }
  return pending;
}

export function installPerformanceGuards(logic: LogicLike): void {
  const index = issueIndex();
  if (typeof logic.decision9 === "function") {
    logic.decision9 = function (this: LogicLike, id: unknown) {
      return decisionFor(this.state, index(this.state), id);
    };
  }
  // conversationsV9 reads issues, chats[member], member, activeIssue, activeChat, view and, through
  // decision9/needs9, decisions9; conversations9 adds threadMessages9.
  memoiseMethod(logic, "conversations9", (s) => [s.issues, s.chats, s.member, s.activeIssue, s.activeChat, s.view, s.decisions9, s.threadMessages9]);
  memoiseMethod(logic, "attention9", (s) => [s.issues, s.decisions9, s.member]);
  memoiseMethod(logic, "groups12", (s, l) => [l.conversations9(), s.pinned12, s.expandedGroups12]);
  memoiseMethod(logic, "searchIssueRows14", (s) => [s.issues]);
  memoiseMethod(logic, "searchChatRows14", (_s, l) => [l.conversations9()]);
  memoiseMethod(logic, "searchRoutineRows14", (s) => [s.autopilots9]);
  installSidebarDrag(logic);
}

/* The design's sidebar divider re-renders the workspace on every pointer move
   (setSidebar12 -> setState). Mirror the conversation pane: paint the width
   straight onto the element once per frame and commit the state on release. */
export function installSidebarDrag(logic: LogicLike): void {
  const original = logic.dragSidebar12;
  if (typeof original !== "function" || typeof document === "undefined") return;
  const clamp = (width: number) => Math.min(380, Math.max(200, Math.round(width)));
  logic.dragSidebar12 = function (this: LogicLike, event: PointerEvent) {
    if (event.button !== undefined && event.button !== 0) return;
    const aside = document.querySelector<HTMLElement>(".app-v19 aside.sidebar12") || document.querySelector<HTMLElement>("aside.sidebar12");
    if (!aside) return original.call(this, event);
    event.preventDefault();
    const app = aside.closest<HTMLElement>(".app-v19");
    const startX = event.clientX;
    const startWidth = Number(this.state.sidebarWidth12) || 252;
    let pending = startWidth;
    let frame: number | undefined;
    const paint = () => {
      frame = undefined;
      aside.style.width = `${pending}px`;
      aside.style.flexBasis = `${pending}px`;
    };
    const move = (moveEvent: PointerEvent) => {
      pending = clamp(startWidth + moveEvent.clientX - startX);
      if (frame === undefined) frame = requestAnimationFrame(paint);
    };
    const finish = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", finish);
      document.removeEventListener("pointercancel", finish);
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
        frame = undefined;
      }
      app?.classList.remove("sb-dragging19");
      paint();
      if (typeof this.setSidebar12 === "function") this.setSidebar12(pending);
      else this.setState({ sidebarWidth12: pending });
    };
    app?.classList.add("sb-dragging19");
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", finish);
    document.addEventListener("pointercancel", finish);
  };
}
