"use client";

/* The landing's view-model. A faithful port of the Landing v4 prototype logic:
   the hero demo loop, the routing meter, the gate timeline, the five-step
   onboarding, the dialogs and the first-run workspace preview. Everything the
   markup binds to comes out of `vals`. */

import { Client } from "@botinc/api";
import { apiBaseURL } from "../workspace/live/use-live-workspace";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent } from "react";

type Screen = "landing" | "signin" | "goals" | "connect" | "models" | "autos" | "app";
type Dialog = null | "connect" | "account" | "plans" | "receipt" | "meters" | "apps" | "preview";
type Platform = "mac" | "win" | "ios" | "android";
export type Theme = "light" | "dark";

export type LandingState = {
  screen: Screen;
  theme: Theme;
  demoView: "thread" | "activity";
  appView: "thread" | "intro" | "activity";
  platform: Platform;
  copied: boolean;
  rt: number;
  wf: number;
  apiFallback: boolean;
  idx: number;
  typed: string;
  live: number;
  introN: number;
  goals: string[];
  connected: string[];
  models: string[];
  autos: string[];
  email: string;
  code: string;
  codeSent: boolean;
  authBusy: boolean;
  error: string;
  dialog: Dialog;
  dialogFor: string;
  method: "signin" | "api";
  scope: string;
  notice: string;
  merged: boolean;
  draft: string;
  msgs: Msg[];
  annual: boolean;
};

export type Msg = { cls: string; text: string; me?: boolean; op?: boolean; who: string; time: string };

const TEXT = "Approve and merge.";
const SEQ: [string, number][] = [
  ["start", 900], ["ev", 1600], ["ap", 1600], ["op", 1800], ["planR", 1800], ["planD", 500], ["implR", 1600], ["route", 1400],
  ["implD", 500], ["revR", 1500], ["revD", 500], ["verR", 1300], ["verD", 700], ["result", 3200], ["type", 0], ["sent", 1100], ["merged", 5600],
];
const at = (n: string) => SEQ.findIndex((x) => x[0] === n);

const INTRO: [string, string, string][] = [
  ["op", "Operator", "Welcome, Alex. Your workspace is open on 14 days of Team. Reading everything you connected…"],
  ["plug", "Plugins", "Sentry · acme-prod: 3 projects read. 3 new errors in the last 24 hours, 1 regression since release 4.12.0."],
  ["plug", "Plugins", "PostHog · acme.posthog.com: 12 session replays linked to the checkout error. GitHub · acme/storefront: 214 files indexed, CI green on main."],
  ["waypoints", "Smart routing", "Model accounts ready: Claude alex@ (14% left), Claude ops@ (62%), Codex (91%). Runs open on the account with the most capacity left and switch at the limit. Everything runs remotely."],
  ["zap", "Issue intake", "Filed BOT-42 · High (checkout total), BOT-41 · Medium (iOS replay), BOT-40 · High (p95 latency). Fix & review starts on BOT-42."],
  ["op", "Operator", "Starting BOT-42 on Claude alex@. Plan → Implement → Review → Verify, then the pull request waits for you here. You can close the laptop."],
];

const GOALS: [string, string, string, string, string[]][] = [
  ["route", "Never hit a subscription limit", "Route runs across Claude, Codex, Cursor, Copilot. Switch mid-task, no re-login.", "waypoints", ["claude", "codex"]],
  ["fix", "Fix errors as they arrive", "Sentry, PostHog, Grafana → pull requests, on their own", "bug", ["sentry", "posthog"]],
  ["backlog", "Work through my backlog", "Linear and GitHub issues → pull requests", "list-todo", ["linear", "github"]],
  ["uncensored", "Use unfiltered models", "DeepSeek 4.1 Flash, GLM 5.3 Flash and more, no provider filter", "eye", []],
  ["operator", "Just a personal Operator", "Chat and calls first. Automate later.", "phone", []],
];

const SRC: Record<string, [string, string, string, string]> = {
  sentry: ["Sentry", "Errors, releases, regressions", "acme-prod · all projects", "Read issues, events and releases. Comment on issues it files."],
  posthog: ["PostHog", "Events, session replays, flags", "acme.posthog.com", "Read events, replays and feature flags."],
  grafana: ["Grafana", "Alerts and dashboards", "grafana.acme.io · Alerting", "Read alert rules, firing alerts and dashboards."],
  datadog: ["Datadog", "APM traces, monitors", "acme · us1", "Read monitors, error tracking and traces."],
  newrelic: ["New Relic", "Errors inbox, alerts", "acme-web", "Read the errors inbox and alert conditions."],
  linear: ["Linear", "Issues, cycles, triage queue", "ACME team", "Read and update issues. Create issues it files."],
  github: ["GitHub", "Required for pull requests", "acme/storefront", "Read code and CI. Open pull requests. Never merge."],
};

const AUTOS: [string, string, string, string][] = [
  ["intake", "Issue intake", "Every new error or ticket becomes an issue with a priority, a release and an owner.", "zap"],
  ["fix", "Fix & review", "Plan → Implement → Review → Verify. A pull request waits for your approval.", "git-pull-request"],
  ["watch", "Regression watch", "After each merge, watch the error for 24 hours. Reopen the issue if it returns.", "eye"],
];

const STORAGE_KEY = "botinc-landing-v4";

const initial: LandingState = {
  screen: "landing", theme: "light", demoView: "thread", appView: "thread", platform: "mac", copied: false, rt: 0, wf: 0, apiFallback: false,
  idx: 0, typed: "", live: -1, introN: 0, goals: ["route", "fix"], connected: [], models: [], autos: ["intake", "fix", "watch"], email: "", code: "", codeSent: false, authBusy: false, error: "",
  dialog: null, dialogFor: "", method: "signin", scope: "", notice: "", merged: false, draft: "", msgs: [], annual: false,
};

export type DemoStep = { cls: string; who: string; model: string; out: string; outCls: string; badge: string; stateCls: string; isClaude: boolean; isCodex: boolean; isOp: boolean };

function demo(idx: number, typed: string, typing: boolean, mergedLive: boolean) {
  const ge = (n: string) => idx >= at(n);
  const vis = (n: string) => "entry13 " + (ge(n) ? "l4-in" : "l4-hid");
  const S: [string, string, string, string, string, string, string][] = [
    ["planR", "planD", "Plan", "Claude Opus 5 · your subscription", "Reading checkout/summary.ts and the release diff…", "Cause: discount computed once at add-to-cart; totals read a stale subtotal.", "claude"],
    ["implR", "implD", "Implement", ge("route") ? "Claude Sonnet 5 · alex@ → ops@ · switched mid-run" : "Claude Sonnet 5 · alex@ · your subscription", "Editing useCartTotals.ts · running pnpm test…", "3 files changed · +41 −9 · 2 tests added · commit 8c42e1a", "claude"],
    ["revR", "revD", "Review", "GPT-6 Astra · Codex", "Reading the diff against BOT-42…", "Approved · 1 suggestion, applied", "codex"],
    ["verR", "verD", "Verify", "12 checks · BotInc Cloud", "Running the checkout suite on 8c42e1a…", "All 12 checks passed", "op"],
  ];
  const steps: DemoStep[] = S.map(([r, d, who, model, running, done, brand]) => {
    const isD = ge(d);
    return { cls: vis(r), who, model, out: isD ? done : running, outCls: "wb-outcome16" + (isD ? "" : " l4-dim"), badge: isD ? (who === "Review" ? "Approved" : "Completed") : "Running", stateCls: "wb-state16" + (isD ? "" : " running"), isClaude: brand === "claude", isCodex: brand === "codex", isOp: brand === "op" };
  });
  const merged = mergedLive || ge("merged");
  const result = ge("result");
  const sent = ge("sent");
  const cur = !ge("planR") ? "Triage" : !ge("planD") ? "Plan" : !ge("implD") ? "Implement" : !ge("revD") ? "Review" : !ge("verD") ? "Verify" : !merged ? "Your approval" : "Finished";
  const dots = ["Plan", "Implement", "Review", "Verify", "Approval"].map((n, i) => {
    const doneIdx = ["planD", "implD", "revD", "verD"][i]!;
    const done = i < 4 ? ge(doneIdx) : merged;
    const now = n === cur || (i === 4 && cur === "Your approval");
    return { cls: done ? "done" : now ? (i === 4 ? "needs" : "now l4-run") : "" };
  });
  return {
    evCls: vis("ev"), apCls: vis("ap") + " l4-auto", routeCls: vis("route") + " l4-auto", routed: ge("route"),
    routeAcct: ge("route") ? "Claude · ops@ · 2nd account" : "Claude · alex@ · your subscription", routeLeft: ge("route") ? "38% used" : "97% used",
    routeBar: { width: ge("route") ? "62%" : "3%" }, opCls: vis("op"), resultCls: result ? "l4-in" : "l4-hid",
    youCls: "entry13 human13 " + (sent || mergedLive ? "l4-in" : "l4-hid"), youText: typed && sent ? typed : "Approve and merge.",
    mergedCls: vis("merged") + (mergedLive ? " l4-in" : ""), showApprove: result && !merged && !sent, needsYou: result && !merged && !sent,
    status: merged ? "Done" : result ? "Needs you" : ge("ap") ? "In progress" : "Todo", wfTone: merged ? "done18" : result ? "needs18" : "", wfStep: cur,
    wfMeta: merged ? "Fix & review · 6m 40s · $0.02" : result ? "Fix & review · waiting since 09:47" : ge("ap") ? "Fix & review · running" : "Issue intake",
    dots, cost: result ? "$0.02" : ge("planR") ? "$0.01" : "$0.00", typed: sent ? "" : typed, focus: typing && idx === at("type"), pressed: idx === at("sent"),
    caption: merged ? "Merged. Regression watch is on for 24 hours." : result ? "PR #842 is waiting for approval." : ge("planR") ? "Fix & review is running on your Claude subscription." : ge("ap") ? "Issue intake filed BOT-42." : ge("ev") ? "A new Sentry error just came in." : "Watching Sentry for acme/storefront…",
    step1: "step" + (!ge("ap") ? " on" : " done"), step2: "step" + (ge("ap") && !ge("planR") ? " on" : ge("planR") ? " done" : ""),
    step3: "step" + (ge("planR") && !result ? " on" : result ? " done" : ""), step4: "step" + (result && !merged ? " on" : merged ? " done" : ""),
    railStyle: { width: (merged ? 100 : result ? 87 : ge("planR") ? 62 : ge("ap") ? 37 : 12) + "%" },
    live1: "Sentry · acme-prod · read-only · GitHub · acme/storefront", live2: ge("ap") ? "BOT-42 · High · release 4.12.0 · 09:41" : "Waiting for the next event…",
    live3: merged || result ? "Plan → Implement → Review → Verify · 6m 40s · $0.02" : ge("verR") ? "Verify · 12 checks running" : ge("revR") ? "Review · GPT-6 Astra" : ge("implR") ? "Implement · Claude Sonnet 5" : ge("planR") ? "Plan · Claude Opus 5" : "Not started",
    live4: merged ? "PR #842 merged · 09:49 · Regression watch on" : result ? "PR #842 waiting for your approval" : "Nothing to approve yet", steps,
  };
}
export type Demo = ReturnType<typeof demo>;

function gate(k: number) {
  const S: [string, string, string, string, string, string][] = [
    ["PLAN", "Read before writing.", "The cause, the files, the tests to add. A plan you can read and reject before a line changes.", "Claude Opus 5 · alex@", "plan must name cause + tests", "claude"],
    ["IMPLEMENT", "Small diff, tests included.", "The change and the tests that prove it, on a branch, in a clean sandbox.", "Claude Sonnet 5 · auto", "tests required · diff ≤ 400 lines", "claude"],
    ["REVIEW", "A different model reviews.", "The reviewer is never the author. It reads the diff against the issue and requests changes until it is right.", "GPT-6 Astra · Codex", "reviewer ≠ author · ≤ 3 rounds", "codex"],
    ["VERIFY", "Checks on a clean checkout.", "The full suite runs on the final commit. Red goes back, not forward.", "BotInc Cloud · 12 checks", "all checks green", "bot"],
    ["YOU", "Nothing merges itself.", "The pull request waits with the receipt. Approve from chat, the call, or your phone.", "Alex", "human approval", "you"],
  ];
  const TL: [number, number, number[], string][] = [
    [0, -1, [], "Plan · reading the repo"], [1, -1, [0], "Implement · writing the fix"], [2, -1, [0, 1], "Review · reading the diff"], [1, 2, [0], "Back to Implement · 1 change requested"],
    [2, -1, [0, 1], "Review · round 2"], [3, -1, [0, 1, 2], "Verify · 12 checks"], [4, -1, [0, 1, 2, 3], "Waiting for you"], [4, -1, [0, 1, 2, 3], "Approved · merging"],
    [5, -1, [0, 1, 2, 3, 4], "Merged · 4.12.1"], [5, -1, [0, 1, 2, 3, 4], "Regression watch on"], [0, -1, [], "Next issue"],
  ];
  const [act, back, done, note] = TL[k % TL.length]!;
  const OUT: Record<number, [string, string, string]> = {
    0: ["Waiting", "Reading checkout/summary.ts…", "Cause found · 2 tests to add"], 1: ["Waiting", "Editing useCartTotals.ts · pnpm test…", "+41 −9 · 2 tests · 8c42e1a"],
    2: ["Waiting", "Reading the diff against BOT-42…", "Approved · round 2"], 3: ["Waiting", "Running the suite on 8c42e1a…", "12 / 12 passed"], 4: ["Waiting", "PR #842 waiting for Alex", "Approved · merged"],
  };
  const steps = S.map(([n, title, copy, model, gateRule, brand], i) => {
    const isDone = done.includes(i) || act > 4;
    const isNow = act === i && act < 5;
    const isBack = back === i;
    const state = isBack ? "Changes requested" : isDone ? (i === 4 ? "Approved" : "Passed") : isNow ? (i === 4 ? "Needs you" : "Running") : "Waiting";
    const out = k === 3 && i === 1 ? "Review asked for a discount-removal test" : k === 3 && i === 2 ? "1 change requested · missing test" : isDone ? OUT[i]![2] : isNow ? OUT[i]![1] : OUT[i]![0];
    return { n, title, copy, model, gate: gateRule, out, state, cls: "gate-step" + (isNow ? " now" : "") + (isDone ? " done" : "") + (isBack ? " back" : "") + (i === 4 ? " you" : ""), stCls: "gs-state" + (isBack ? " back" : isDone ? " done" : isNow ? " now" : ""), isClaude: brand === "claude", isCodex: brand === "codex", isBot: brand === "bot", isYou: brand === "you" };
  });
  const pos = Math.min(act, 4);
  const tokenStyle = { left: "calc(" + ((pos + 0.5) / 5) * 100 + "% - 52px)" };
  const tokenCls = "gate-token" + (back >= 0 ? " back" : "") + (act > 4 ? " merged" : "");
  const LOG: [number, string, string][] = [
    [0, "09:42:10", "Plan opened on Claude alex@. Cause: discount computed once at add-to-cart."], [1, "09:43:02", "Implement started. Branch fix/bot-42 · sandbox clean."],
    [2, "09:45:20", "Review opened on Codex. Reviewer is not the author, by rule."], [3, "09:45:58", "Review requested changes: no test for discount removal. Back to Implement."],
    [4, "09:46:40", "Implement pushed the test. Review round 2."], [5, "09:47:05", "Review approved. Verify runs the full suite on a clean checkout."],
    [6, "09:47:31", "12 / 12 checks passed. PR #842 waits for Alex."], [7, "09:48:40", "Alex approved from the phone."], [8, "09:49:02", "Merged as 4.12.1. Regression watch on for 24 hours."],
  ];
  const log = LOG.filter(([i]) => i <= k).slice(-3).map(([i, t, text]) => ({ t, text, cls: i === k ? "hi" : "" }));
  return { steps, tokenStyle, tokenCls, tokenNote: note, log };
}

function router(t: number, apiFallback: boolean) {
  const T = t / 140;
  const pct = Math.min(100, Math.round(T * 100));
  const cl = Math.max(0, 14 - Math.round(T * 100 * 0.42));
  const switched = T > 0.33;
  const cd = switched ? Math.max(0, 62 - Math.round((T - 0.33) * 100 * 0.3)) : 62;
  const acc = (k: string, name: string, plan: string, left: number | null, state: string, cls: string) => ({
    isClaude: k === "claude", isClaude2: k === "claude2", isCodex: k === "codex", isCursor: k === "cursor", isCopilot: k === "copilot", isApi: k === "api",
    name, plan, left: left === null ? "—" : left + "% left",
    capStyle: { width: (left === null ? 0 : left) + "%", ...(left !== null && left < 15 ? { background: "#ad6818" } : {}) },
    state, cls: "acc" + (cls ? " " + cls : ""), chipCls: "hr-chip" + (cls ? " " + cls : ""), chip: left === null ? (apiFallback ? "fallback" : "off") : left + "%",
  });
  const accounts = [
    acc("claude", "Claude · alex@", "Max · Opus 5 / Sonnet 5", cl, switched ? "Limit · resets 14:00" : "Running", switched ? "out" : "live"),
    acc("claude2", "Claude · ops@", "Pro · second account", cd, switched ? "Running" : "Next", switched ? "live" : ""),
    acc("codex", "Codex", "ChatGPT Pro · GPT-6 Astra", 91, "Standby", ""), acc("cursor", "Cursor", "Pro", 48, "Standby", ""),
    acc("copilot", "Copilot", "Business", 77, "Standby", ""), acc("api", "API fallback", "DeepSeek · OpenRouter · list +10%", null, apiFallback ? "Allowed" : "Off", apiFallback ? "" : "off"),
  ];
  const log = [{ t: "09:43:02", text: "Implement needs Claude. Opened on alex@ (Max), the Claude account with the most capacity left.", cls: "" }];
  if (switched) log.push({ t: "09:44:41", text: "alex@ hit its 5-hour limit at 33% of the run. Handed off to your second Claude account, ops@ (62% left). Same branch, same context. 0s lost.", cls: "hi" });
  if (T > 0.9) log.push({ t: "09:47:10", text: "Implement finished on ops@. Review opens on Codex: a different model, by rule.", cls: "" });
  return {
    note: switched ? "alex@ hit its 5-hour limit at 33% of the run → continued on your second Claude account. 0s lost, nothing to log into." : "Implement is running on Claude alex@, the Claude account with the most capacity left. ops@ is next; Codex, Cursor and Copilot stand by.",
    elapsed: switched ? "4m 08s" : "1m 39s", pct: pct + "%", runStyle: { width: pct + "%" }, accounts, log,
  };
}

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function useLanding(opts: { onEnterWorkspace?: () => void } = {}) {
  const [s, setS] = useState<LandingState>(initial);
  const sRef = useRef(s);
  useEffect(() => { sRef.current = s; }, [s]);
  const patch = useCallback((p: Partial<LandingState> | ((prev: LandingState) => Partial<LandingState>)) => {
    setS((prev) => ({ ...prev, ...(typeof p === "function" ? p(prev) : p) }));
  }, []);
  const timers = useRef<{ t?: number; ti?: number; tl?: number }>({});

  const persist = useCallback((p: Partial<LandingState>) => {
    setS((prev) => {
      const next = { ...prev, ...p };
      try {
        const { screen, goals, connected, models, autos, theme } = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, goals, connected, models, autos, theme }));
      } catch {}
      return next;
    });
  }, []);

  // The hero demo loop.
  const run = useCallback(function run(i: number) {
    window.clearTimeout(timers.current.t);
    window.clearInterval(timers.current.ti);
    if (sRef.current.screen !== "landing") {
      timers.current.t = window.setTimeout(() => run(0), 1500);
      return;
    }
    if (i >= SEQ.length) i = 0;
    patch({ idx: i, typed: i > at("type") ? TEXT : "" });
    if (SEQ[i]![0] === "type") {
      let n = 0;
      timers.current.ti = window.setInterval(() => {
        n++;
        if (n > TEXT.length) {
          window.clearInterval(timers.current.ti);
          timers.current.t = window.setTimeout(() => run(i + 1), 700);
          return;
        }
        patch({ typed: TEXT.slice(0, n) });
      }, 55);
      return;
    }
    timers.current.t = window.setTimeout(() => run(i + 1), SEQ[i]![1]);
  }, [patch]);

  const startLive = useCallback(() => {
    window.clearTimeout(timers.current.tl);
    patch({ live: 1, merged: false, msgs: [] });
    const go = (i: number) => {
      if (SEQ[i]![0] === "type") return;
      patch({ live: i });
      timers.current.tl = window.setTimeout(() => go(i + 1), SEQ[i]![1]);
    };
    go(1);
  }, [patch]);

  const startIntro = useCallback(() => {
    window.clearTimeout(timers.current.tl);
    patch({ appView: "intro", introN: 0, live: -1, merged: false, msgs: [] });
    const step = (i: number) => {
      patch({ introN: i });
      if (i >= INTRO.length) {
        timers.current.tl = window.setTimeout(() => {
          patch({ appView: "thread" });
          startLive();
        }, 1600);
        return;
      }
      timers.current.tl = window.setTimeout(() => step(i + 1), i === 1 ? 1400 : 1250);
    };
    timers.current.tl = window.setTimeout(() => step(1), 500);
  }, [patch, startLive]);

  useEffect(() => {
    document.documentElement.classList.add("l4-page");
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") patch({ dialog: null });
    };
    document.addEventListener("keydown", key);
    let resume = false;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && saved.screen) {
        patch({ screen: apiBaseURL() ? "landing" : saved.screen, goals: saved.goals || ["fix"], connected: saved.connected || [], models: saved.models || [], autos: saved.autos || ["intake", "fix", "watch"], theme: saved.theme || "light" });
        resume = !apiBaseURL() && saved.screen === "app";
      }
    } catch {}
    // Proof harness: `?demo=idx,wf,rt` freezes the demo loops at one frame so a
    // screenshot can be compared against the design render.
    const frozen = new URLSearchParams(window.location.search).get("demo");
    if (frozen) {
      const [idx = 0, wf = 0, rt = 0] = frozen.split(",").map(Number);
      const theme = new URLSearchParams(window.location.search).get("theme") === "dark" ? "dark" : "light";
      const screen = (new URLSearchParams(window.location.search).get("screen") || "landing") as Screen;
      const introN = Number(new URLSearchParams(window.location.search).get("intro") || 0);
      patch({ idx, wf, rt, theme, screen, introN, live: screen === "app" ? idx : -1, appView: introN ? "intro" : "thread", typed: idx > at("type") ? TEXT : "" });
      return () => {
        document.documentElement.classList.remove("l4-page");
        document.removeEventListener("keydown", key);
      };
    }
    if (resume) startLive();
    run(0);
    const rti = window.setInterval(() => patch((p) => ({ rt: (p.rt + 1) % 140 })), 100);
    const wfi = window.setInterval(() => patch((p) => ({ wf: (p.wf + 1) % 11 })), 1500);
    const t = timers.current;
    return () => {
      document.documentElement.classList.remove("l4-page");
      document.removeEventListener("keydown", key);
      window.clearInterval(rti);
      window.clearInterval(wfi);
      window.clearTimeout(t.t);
      window.clearInterval(t.ti);
      window.clearTimeout(t.tl);
    };
  }, [patch, run, startLive]);

  // The hover bloom: a delegated pointermove writes --gx/--gy on [data-glow].
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-glow]") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", e.clientX - r.left + "px");
      el.style.setProperty("--gy", e.clientY - r.top + "px");
    };
    document.addEventListener("pointermove", move);
    return () => document.removeEventListener("pointermove", move);
  }, []);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: "smooth" });
  }, []);

  const toggle = useCallback((key: "goals" | "models" | "autos", v: string) => {
    const cur = sRef.current[key];
    persist({ [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } as Partial<LandingState>);
  }, [persist]);

  const send = useCallback(() => {
    const t = sRef.current.draft.trim();
    if (!t) return;
    patch({
      msgs: [...sRef.current.msgs, { cls: "entry13 human13 l4-in", text: t, me: true, who: "Alex", time: "now" }, { cls: "entry13 l4-in", text: "On it. I’ll bring the result back to this conversation.", op: true, who: "Operator", time: "now" }],
      draft: "",
    });
  }, [patch]);

  const copy = useCallback((t: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {});
    patch({ copied: true });
    window.setTimeout(() => patch({ copied: false }), 1600);
  }, [patch]);

  return useMemo(() => {
    const theme = s.theme;
    const onLanding = s.screen === "landing";
    const d = demo(s.idx, s.typed, true, false);
    const l = demo(Math.max(s.live, 0), "", false, s.merged);
    const hasLive = s.live > 0;
    const has = (k: string) => s.goals.includes(k);
    const fix = has("fix") || !s.goals.length;
    const backlog = has("backlog");
    const conn = (k: string) => s.connected.includes(k);
    const order = [...(fix ? ["sentry", "posthog", "grafana", "datadog", "newrelic"] : []), ...(backlog ? ["linear"] : []), "github"];
    const sources = order.map((k, i) => ({
      k, name: SRC[k]![0], sub: SRC[k]![1], isSentry: k === "sentry", isPosthog: k === "posthog", isLinear: k === "linear", isGithub: k === "github", isDatadog: k === "datadog", isGrafana: k === "grafana", isNewrelic: k === "newrelic",
      required: k === "github", cls: "card d" + Math.min(i + 1, 6) + (conn(k) ? " done" : ""), done: conn(k), pending: !conn(k),
      connect: () => patch({ dialog: "connect", dialogFor: k, scope: SRC[k]![2], error: "" }),
    }));
    const signedIn = () => persist({ screen: "goals", dialog: null, error: "" });
    const emailSignIn = async () => {
      if (s.authBusy) return;
      if (!emailOk(s.email)) { patch({error:"Enter a valid email address."}); return; }
      const baseURL=apiBaseURL();if(!baseURL){signedIn();return;}
      patch({authBusy:true,error:""});
      try {
        const api=new Client({baseURL});
        if(s.codeSent){ await api.verifyEmail(s.email,s.code); signedIn(); }
        else {await api.startEmail(s.email);patch({codeSent:true});}
      } catch(err) {patch({error:err instanceof Error?err.message:"Sign-in failed. Try again."});}
      finally {patch({authBusy:false});}
    };
    const googleSignIn=()=>{const base=apiBaseURL();if(!base){signedIn();return;}window.location.assign(base.replace(/\/$/,"")+"/api/auth/google/start");};
    const githubSignIn=()=>{const base=apiBaseURL();if(!base){signedIn();return;}window.location.assign(base.replace(/\/$/,"")+"/api/auth/github/start");};
    const cur = SRC[s.dialogFor] || SRC.github!;
    const plans = [
      { name: "Free", m: 0, a: 0, conc: "1", runs: "100", storage: "1 GB", note: "No credit card required", cta: "Start free", tag: "" },
      { name: "Pro", m: 75, a: 62.5, conc: "5", runs: "10,000", storage: "10 GB", note: "Cancel anytime", tag: "MOST POPULAR", cta: "Start with Pro" },
      { name: "Team", m: 150, a: 125, conc: "Unlimited", runs: "100,000", storage: "50 GB", note: "Cancel anytime", cta: "Start with Team", tag: "" },
    ].map((p) => ({
      ...p, cls: "plan" + (p.name === "Pro" ? " hi" : ""), btnCls: "btn full" + (p.name === "Pro" ? " accent" : ""),
      price: "$" + (s.annual ? p.a : p.m).toFixed(2).replace(".00", ""), unit: p.m ? "/ mo" : "forever",
      sub: p.m ? (s.annual ? "$" + (p.a * 12).toLocaleString() + " billed yearly" : "per workspace, billed monthly") : "per workspace",
      pick: () => persist({ screen: "signin", dialog: null }),
    }));
    const p = s.platform;
    const P = "/assets/icons/platforms.svg#";
    const ios = p === "ios", and = p === "android", mac = p === "mac", win = p === "win";
    const storeUrl = ios ? "https://apps.apple.com/app/botinc/id6740000000" : "https://play.google.com/store/apps/details?id=ai.botinc.console";
    const enterWorkspace = () => {
      if (apiBaseURL()) window.location.assign("/w");
      else if (opts.onEnterWorkspace) opts.onEnterWorkspace();
      else persist({ screen: "app", draft: "" });
    };

    return {
      rootClass: "l4" + (theme === "dark" ? " dark" : ""), theme, onLanding, d, r: router(s.rt, s.apiFallback), g: gate(s.wf),
      goRouting: () => go("routing"), apiFallback: s.apiFallback, apiCls: "switch" + (s.apiFallback ? "" : " off"), toggleApi: () => persist({ apiFallback: !s.apiFallback }),
      dSteps: d.steps, autosCount: s.autos.length, demoView: s.demoView, setDemoView: (v: LandingState["demoView"]) => patch({ demoView: v }),
      appView: s.appView, setAppView: (v: LandingState["appView"]) => patch({ appView: v }),
      goTop: () => go("top"), goHow: () => go("how"), goAutos: () => go("autos"), goConn: () => go("connectors"), goModels: () => go("models"), goApps: () => go("apps"), goPlans: () => go("plans"),
      startFree: () => persist({ screen: "signin" }), replay: () => { run(0); go("top"); },
      annual: s.annual, setMonthly: () => patch({ annual: false }), setAnnual: () => patch({ annual: true }), monthlyCls: s.annual ? "" : "on", annualCls: s.annual ? "on" : "", plans,
      onSignin: s.screen === "signin", onGoals: s.screen === "goals", onConnect: s.screen === "connect", onModels: s.screen === "models", onAutos: s.screen === "autos", inApp: s.screen === "app",
      back: () => persist({ screen: "landing" }),
      googleSignIn, githubSignIn, email: s.email, editEmail: (e: ChangeEvent<HTMLInputElement>) => patch({ email: e.target.value, codeSent:false, code:"", error: "" }),
      emailSignIn, code:s.code, codeSent:s.codeSent, authBusy:s.authBusy, editCode:(e:ChangeEvent<HTMLInputElement>)=>patch({code:e.target.value,error:""}), error: s.error,
      goals: GOALS.map(([k, t, sub, icon, logos], i) => ({ t, sub, href: "/i15.svg#" + icon, cls: "goal d" + (i + 1) + (has(k) ? " on" : ""), on: has(k), hasSentry: logos.includes("sentry"), hasPosthog: logos.includes("posthog"), hasLinear: logos.includes("linear"), hasGithub: logos.includes("github"), hasClaude: logos.includes("claude"), hasCodex: logos.includes("codex"), toggle: () => toggle("goals", k) })),
      toConnect: () => persist({ screen: "connect" }),
      sources, connectedCount: s.connected.length, connectHint: s.connected.length ? s.connected.length + " connected" : "One source is enough to start", toModels: () => persist({ screen: "models" }), backGoals: () => persist({ screen: "goals" }),
      claudeOn: s.models.includes("claude"), codexOn: s.models.includes("codex"), cursorOn: s.models.includes("cursor"), copilotOn: s.models.includes("copilot"),
      connectCursor: () => patch({ dialog: "account", dialogFor: "cursor", method: "signin" }), connectCopilot: () => patch({ dialog: "account", dialogFor: "copilot", method: "signin" }),
      apiCopy: s.apiFallback ? "Spill over to Anthropic, OpenAI, DeepSeek or OpenRouter at list price + 10%, from credit." : "Wait for the next window to reset. Nothing is charged.",
      claudeLabel: s.models.includes("claude") ? "Connected" : "Connect", codexLabel: s.models.includes("codex") ? "Connected" : "Connect",
      connectClaude: () => patch({ dialog: "account", dialogFor: "claude", method: "signin" }), connectCodex: () => patch({ dialog: "account", dialogFor: "codex", method: "signin" }),
      uncCls: "switch" + (s.models.includes("nounc") ? " off" : ""), toggleUnc: () => toggle("models", "nounc"), toAutos: () => persist({ screen: "autos" }), backConnect: () => persist({ screen: "connect" }),
      autos: AUTOS.map(([k, t, sub, icon], i) => ({ t, sub, href: "/i15.svg#" + icon, isIntake: k === "intake", isFix: k === "fix", isWatch: k === "watch", rowCls: "autorow d" + (i + 1) + (s.autos.includes(k) ? "" : " off"), cls: "switch" + (s.autos.includes(k) ? "" : " off"), toggle: () => toggle("autos", k) })),
      autosPlural: s.autos.length + (s.autos.length === 1 ? " autopilot" : " autopilots"),
      finish: () => { enterWorkspace(); if (!opts.onEnterWorkspace) startIntro(); },
      introRows: INTRO.slice(0, s.introN).map(([k, who, text], i) => ({ cls: "entry13 l4-in" + (k === "op" ? "" : " l4-auto"), op: k === "op", auto: k !== "op", href: "/i15.svg#" + k, who, text, time: "09:4" + Math.min(9, i) })),
      backModels: () => persist({ screen: "models" }), repoLabel: conn("github") ? "acme/storefront" : "your repository",
      hasLive, l, lSteps: l.steps, merged: s.merged, approve: () => patch({ merged: true }), draft: s.draft, editDraft: (e: ChangeEvent<HTMLTextAreaElement>) => patch({ draft: e.target.value }),
      keyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } },
      send: (e?: FormEvent | MouseEvent) => { e?.preventDefault(); send(); }, cannotSend: !s.draft.trim(), msgs: s.msgs, balanceLabel: "$2.00",
      dialogOpen: !!s.dialog, closeDialog: () => patch({ dialog: null }),
      backdrop: (e: MouseEvent<HTMLElement>) => { if ((e.target as HTMLElement).classList.contains("modal-shade")) patch({ dialog: null }); },
      dialogCls: "dialog" + (s.dialog === "connect" || s.dialog === "account" ? " l4-product" : " l4-own") + (s.dialog === "meters" ? " wide" : ""),
      connectDialog: s.dialog === "connect", connectApp: (cur[0] || "").toUpperCase(), connectTitle: "Connect " + cur[0] + ".",
      connectCopy: cur[0] === "GitHub" ? "Read-only until you approve a pull request. BotInc opens pull requests; it never merges them." : "Read-only. " + cur[0] + " events become issues only when Issue intake is on.",
      scopeLabel: cur[0] === "GitHub" ? "Repository" : cur[0] === "Linear" ? "Team" : "Project or organisation", scope: s.scope, editScope: (e: ChangeEvent<HTMLInputElement>) => patch({ scope: e.target.value }),
      permissions: cur[3], isIssueSource: s.dialogFor === "linear" || s.dialogFor === "sentry" || s.dialogFor === "github", connectButton: "Authorize " + cur[0],
      finishConnect: () => persist({ connected: [...new Set([...s.connected, s.dialogFor])], dialog: null }),
      accountDialog: s.dialog === "account",
      providers: ([["claude", "Claude", "Claude Max or Pro · Opus 5 and Sonnet 5"], ["codex", "Codex", "ChatGPT Pro · Codex included"], ["cursor", "Cursor", "Cursor Pro · Agent mode"], ["copilot", "Copilot", "GitHub Copilot Business · Copilot CLI"], ["gemini", "Gemini CLI", "Google AI Pro"], ["openrouter", "OpenRouter", "Any model · metered"]] as [string, string, string][]).map(([k, name, copyText]) => ({ name, copy: copyText, isClaude: k === "claude", isCodex: k === "codex", isCursor: k === "cursor", isCopilot: k === "copilot", isGemini: k === "gemini", isOpenrouter: k === "openrouter", pick: () => persist({ models: [...new Set([...s.models, k])], dialog: null }) })),
      accountApp: ({ codex: "Codex", cursor: "Cursor", copilot: "Copilot" } as Record<string, string>)[s.dialogFor] || "Claude", accountIsCursor: s.dialogFor === "cursor", accountIsCopilot: s.dialogFor === "copilot",
      signinCls: "small-button" + (s.method === "signin" ? " primary" : ""), apiClsBtn: "small-button" + (s.method === "api" ? " primary" : ""), setSignin: () => patch({ method: "signin" }), setApi: () => patch({ method: "api" }), isSignin: s.method === "signin", isApi: s.method === "api",
      accountIsClaude: !["codex", "cursor", "copilot"].includes(s.dialogFor), accountIsCodex: s.dialogFor === "codex",
      accountPlanCopy: ({ codex: "ChatGPT Pro · Codex included · GPT-6 Astra", cursor: "Cursor Pro · Agent mode", copilot: "GitHub Copilot Business · Copilot CLI" } as Record<string, string>)[s.dialogFor] || "Claude Max · Opus 5 and Sonnet 5",
      finishAccount: () => persist({ models: [...new Set([...s.models, s.dialogFor])], dialog: null }),
      plansDialog: s.dialog === "plans", openPlans: () => patch({ dialog: "plans" }), receiptDialog: s.dialog === "receipt", openReceipt: () => patch({ dialog: "receipt" }), metersDialog: s.dialog === "meters", openMeters: () => patch({ dialog: "meters" }),
      appsDialog: s.dialog === "apps", openApps: () => patch({ dialog: "apps", platform: "mac", copied: false }), openMac: () => patch({ dialog: "apps", platform: "mac", copied: false }), openWin: () => patch({ dialog: "apps", platform: "win", copied: false }), openIos: () => patch({ dialog: "apps", platform: "ios", copied: false }), openAndroid: () => patch({ dialog: "apps", platform: "android", copied: false }),
      appTitle: mac ? "BotInc for Mac." : win ? "BotInc for Windows." : ios ? "BotInc for iPhone." : "BotInc for Android.",
      appCopy: mac || win ? "The workspace as a desktop app, with the daemon that runs your coding CLIs." : "The workspace in your pocket. Approve pull requests, take the call, dictate a task.",
      tabMac: "plat-tab" + (mac ? " on" : ""), tabWin: "plat-tab" + (win ? " on" : ""), tabIos: "plat-tab" + (ios ? " on" : ""), tabAndroid: "plat-tab" + (and ? " on" : ""),
      appIsDesktop: mac || win, appIsMobile: ios || and, appIsIos: ios, appIsAndroid: and, appIsMac: mac, appIsWin: win, appMarkHref: P + (and ? "google-play" : win ? "windows" : "apple"),
      appFile: mac ? "BotInc-1.4.0-arm64.dmg" : "BotInc-1.4.0-x64.msi", appReq: mac ? "macOS 14 or later · Apple silicon and Intel · 84 MB" : "Windows 11 · x64 · 92 MB",
      storeName: ios ? "App Store" : "Google Play", storeKicker: ios ? "Download on the" : "Get it on", storeUrl,
      qrSrc: "https://api.qrserver.com/v1/create-qr-code/?size=336x336&margin=0&data=" + encodeURIComponent(storeUrl), copyLabel: s.copied ? "Copied" : "Copy link",
      copyStore: () => copy(storeUrl), copyInstall: () => copy(mac ? "curl -fsSL https://botinc.ai/install | bash" : "winget install BotInc.Daemon"),
      fakeDownload: () => patch({ dialog: null, notice: "Preview only. No download starts." }),
      setPlatform: (v: Platform) => patch({ platform: v, copied: false }),
      previewDialog: s.dialog === "preview", openPreview: () => patch({ dialog: "preview" }),
      footCls: "preview-foot" + (s.screen === "app" ? " fixed" : ""),
      restart: () => { window.clearTimeout(timers.current.tl); persist({ screen: "landing", live: -1, dialog: null, goals: ["fix"], connected: [], models: [], autos: ["intake", "fix", "watch"], merged: false, msgs: [] }); run(0); },
      toSignin: () => persist({ screen: "signin", dialog: null }), toGoals: () => persist({ screen: "goals", dialog: null }), toConnectS: () => persist({ screen: "connect", dialog: null }), toModelsS: () => persist({ screen: "models", dialog: null }), toAutosS: () => persist({ screen: "autos", dialog: null }),
      toApp: () => { persist({ screen: "app", dialog: null, connected: ["sentry", "posthog", "github"], models: ["claude", "codex"] }); startIntro(); },
      toggleTheme: () => persist({ theme: theme === "dark" ? "light" : "dark" }), appearance: theme === "dark" ? "Dark" : "Light",
      notice: s.notice,
    };
  }, [s, patch, persist, go, run, toggle, send, copy, startIntro, opts]);
}

export type LandingVals = ReturnType<typeof useLanding>;
