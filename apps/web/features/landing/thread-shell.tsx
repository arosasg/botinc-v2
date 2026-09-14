"use client";

/* The miniature workspace shown in the landing hero and on the first-run
   screen. Ported from the design's ThreadShell component. It is a demo
   surface: everything it shows comes from the landing's demo timeline. */

import type { CSSProperties } from "react";
import { Fragment, useEffect, useState } from "react";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import type { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent } from "react";
import type { Demo, DemoStep, Msg, Theme } from "./use-landing";

type ShellView = "thread" | "chat" | "intro" | "work" | "schedule" | "plugins";

export type ThreadShellProps = {
  d: Demo;
  steps: DemoStep[];
  theme: Theme;
  msgs?: Msg[];
  introRows?: { cls: string; op: boolean; auto: boolean; href: string; who: string; text: string; time: string }[];
  view?: string;
  setView?: (v: never) => void;
  value?: string;
  readOnly?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  send?: (e?: FormEvent | MouseEvent) => void;
  sendDisabled?: boolean;
  approve?: () => void;
  openReceipt?: () => void;
  getApps?: () => void;
  openPlans?: () => void;
  toggleTheme?: () => void;
  autosCount?: number;
  balance?: string;
  showAppsNote?: boolean;
  loading?: boolean;
};

const noop = () => {};

function useShellVals(p: ThreadShellProps) {
  const [local, setLocal] = useState<ShellView>("thread");
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const view = (p.view as ShellView | undefined) || local;
  const set = (v: ShellView) => () => {
    if (p.setView) (p.setView as unknown as (v: ShellView) => void)(v);
    else setLocal(v);
  };
  const d = p.d;
  const merged = d.status === "Done";
  const needs = d.status === "Needs you";
  const bot42 = { srcSentry: true, srcPosthog: false, srcGrafana: false, srcGithub: false, id: "BOT-42", title: "Checkout total wrong after quantity change", meta: merged ? "Fixed by PR #842 · 6m 40s · $0.02" : needs ? "PR #842 waiting for your approval" : "Fix & review running on your Claude subscription", priority: "High", prioCls: "w8-prio is-high", stateCls: "w8-state " + (merged ? "is-merged" : needs ? "is-review" : "is-progress"), iconHref: "/i15.svg#" + (merged ? "circle-check" : needs ? "hand" : "circle-dot"), srcHref: "/i15.svg#bug", source: "Sentry", ownerInitial: "O", owner: "Operator", updated: merged ? "09:49" : "now", open: set("thread") };
  const rows = [
    { srcSentry: false, srcPosthog: true, srcGrafana: false, srcGithub: false, id: "BOT-41", title: "Session replay missing on iOS Safari", meta: "Queued behind BOT-42 · Free runs 1 fix at a time", priority: "Medium", prioCls: "w8-prio is-medium", stateCls: "w8-state", iconHref: "/i15.svg#circle", srcHref: "/i15.svg#activity", source: "PostHog", ownerInitial: "O", owner: "Operator", updated: "09:12", open: set("thread") },
    { srcSentry: false, srcPosthog: false, srcGrafana: true, srcGithub: false, id: "BOT-40", title: "p95 latency over 800ms on /api/cart", meta: "PR #839 merged yesterday · Regression watch clear", priority: "High", prioCls: "w8-prio is-high", stateCls: "w8-state is-merged", iconHref: "/i15.svg#circle-check", srcHref: "/i15.svg#activity", source: "Grafana", ownerInitial: "A", owner: "Alex", updated: "Yesterday", open: set("thread") },
  ];
  type Row = typeof bot42;
  const groups: { label: string; count: number; iconCls: string; iconHref: string; rows: Row[] }[] = [];
  if (merged) {
    groups.push({ label: "Done", count: 2, iconCls: "w8-group-icon", iconHref: "/i15.svg#circle-check", rows: [bot42, rows[1]!] });
    groups.unshift({ label: "Todo", count: 1, iconCls: "w8-group-icon", iconHref: "/i15.svg#circle", rows: [rows[0]!] });
  } else {
    groups.push(
      { label: needs ? "Needs you" : "In progress", count: 1, iconCls: "w8-group-icon " + (needs ? "is-review" : "is-progress"), iconHref: "/i15.svg#" + (needs ? "hand" : "circle-dot"), rows: [bot42] },
      { label: "Todo", count: 1, iconCls: "w8-group-icon", iconHref: "/i15.svg#circle", rows: [rows[0]!] },
      { label: "Done", count: 1, iconCls: "w8-group-icon", iconHref: "/i15.svg#circle-check", rows: [rows[1]!] },
    );
  }
  const routines = [
    { srcSentry: true, srcGithub: false, srcPosthog: false, srcGrafana: false, id: "AP-1", title: "Issue intake", meta: "New error → issue with priority, release and owner", trigger: "On event", stateCls: "w8-state is-progress", iconHref: "/i15.svg#zap", srcHref: "/i15.svg#bug", source: "Sentry", last: "09:41" },
    { srcSentry: false, srcGithub: true, srcPosthog: false, srcGrafana: false, id: "AP-2", title: "Fix & review", meta: "Plan → Implement → Review → Verify → your approval", trigger: "On issue", stateCls: "w8-state " + (merged ? "is-merged" : "is-progress"), iconHref: "/i15.svg#git-pull-request", srcHref: "/i15.svg#git-pull-request", source: "GitHub", last: merged ? "09:49" : "running" },
    { srcSentry: true, srcGithub: false, srcPosthog: false, srcGrafana: false, id: "AP-3", title: "Regression watch", meta: "24 hours after each merge · reopens the issue if the error returns", trigger: "After merge", stateCls: "w8-state" + (merged ? " is-progress" : ""), iconHref: "/i15.svg#eye", srcHref: "/i15.svg#bug", source: "Sentry", last: merged ? "watching" : "—" },
  ];
  const plugins = ([["sentry", "Sentry", "acme-prod · 3 projects", "Live", "live"], ["posthog", "PostHog", "acme.posthog.com", "Live", "live"], ["grafana", "Grafana", "grafana.acme.io · Alerting", "Live", "live"], ["github", "GitHub", "acme/storefront · read + PRs", "Live", "live"], ["claude", "Claude", "Max · 12% left", "Limit · 14:00", "warn"], ["codex", "Codex", "ChatGPT Pro · 91% left", "Running", "live"]] as [string, string, string, string, string][]).map(([k, name, sub, st, tone]) => ({ name, sub, st, stCls: "l4-st " + tone, isSentry: k === "sentry", isPosthog: k === "posthog", isGrafana: k === "grafana", isGithub: k === "github", isClaude: k === "claude", isCodex: k === "codex", isCursor: k === "cursor", isCopilot: k === "copilot", open: set("thread") }));
  return {
    d, routeCls: d.routeCls || "l4-hid", routed: !!d.routed, notRouted: !d.routed, routeAcct: d.routeAcct || "Claude · your subscription", routeBar: d.routeBar || { width: "63%" }, routeLeft: d.routeLeft || "37% used",
    steps: (p.steps || []).map((x, i) => ({ ...x, afterRoute: i === 2 })), msgs: p.msgs || [], theme: p.theme || "light", autosCount: p.autosCount ?? 3, balance: p.balance || "$2.00", showAppsNote: !!p.showAppsNote,
    composerCls: "composer10 composer11" + (d.focus ? " l4-focus" : ""), sendCls: "send-button" + (d.pressed ? " l4-pressed" : ""), value: p.value ?? "", readOnly: !!p.readOnly,
    onChange: p.onChange || noop, onKeyDown: p.onKeyDown || noop, send: p.send || ((e?: FormEvent | MouseEvent) => e?.preventDefault()), sendDisabled: p.readOnly ? true : !!p.sendDisabled,
    approve: p.approve || noop, openReceipt: p.openReceipt || noop, getApps: p.getApps || noop, openPlans: p.openPlans || noop, toggleTheme: p.toggleTheme || noop,
    isThread: view === "thread", isChat: view === "chat", isIntro: view === "intro", introRows: p.introRows || [], introWorking: view === "intro", isConvo: view === "thread" || view === "chat" || view === "intro", isWork: view === "work", isSchedule: view === "schedule", isPlugins: view === "plugins",
    viewThread: set("thread"), viewWork: set("work"), viewSchedule: set("schedule"), viewChat: set("chat"), viewPlugins: set("plugins"),
    workNavCls: "nav-row" + (view === "work" ? " active" : ""), schedNavCls: "nav-row" + (view === "schedule" ? " active" : ""), chatNavCls: "nav-row" + (view === "chat" ? " active" : ""), plugNavCls: "nav-row" + (view === "plugins" ? " active" : ""),
    threadRowCls: "c9-row" + (view === "thread" ? " active" : ""), threadCurrent: (view === "thread" ? "page" : "false") as "page" | "false", chat1Cls: "c9-row",
    crumbA: view === "schedule" ? "Schedule" : view === "plugins" ? "Plugins" : view === "chat" ? "New chat" : view === "intro" ? "Getting to work" : "Work",
    pluginCount: 6, plugins, needsCount: needs ? 1 : 0, doneCount: merged ? 2 : 1, workGroups: groups, routines,
    loadState:p.loading?"loading":"ready",loading:!!p.loading,fullLoading:false,crumbThread:view==="thread",
    wsOpen:isWorkspaceMenuOpen,toggleWs:()=>setIsWorkspaceMenuOpen((open)=>!open),closeWs:()=>setIsWorkspaceMenuOpen(false),
    wsInitial:"B",wsName:"BotInc",workspaces:[
      {initial:"B",name:"BotInc",sub:"Current workspace",cls:"on",on:true,pick:()=>setIsWorkspaceMenuOpen(false)},
      {initial:"D",name:"Didit",sub:"3 tasks need you",cls:"",on:false,pick:()=>setIsWorkspaceMenuOpen(false)},
    ],
  };
}

export function ThreadShell(p: ThreadShellProps) {
  const v = useShellVals(p);
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".l4shell .t9-scroll").forEach((s) => (s.scrollTop = s.scrollHeight));
    });
  });
  return (
    <div
      className="app app-v9 app-v10 app-v11 app-v12 app-v13 app-v14 app-v19 conversation-open9 has-conversation l4shell"
      data-theme={v.theme}
      data-load={v.loadState}
    >
      <aside className="sidebar sidebar9 sidebar12" aria-label="Workspace navigation">
        <div className="l4-ws">
          <button className="workspace-button" onClick={v.toggleWs} aria-expanded={v.wsOpen} aria-haspopup="menu">
            <span className="l4-wsglyph">{interp(v.wsInitial)}</span>
            <span>{interp(v.wsName)}</span>
            <svg
              className="ui-icon use14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <use href="/i15.svg#chevrons-up-down" />
            </svg>
          </button>
          {v.wsOpen ? (
            <>
              <button className="l4-wsscrim" onClick={v.closeWs} aria-label="Close workspace menu" />
              <div className="menu14 l4-wsmenu" role="menu" aria-label="Workspaces">
                <p className="menu-title14">Workspaces</p>
                <div className="menu-rows14">
                  {(v.workspaces ?? []).map((w: any, i: number) => (
                    <Fragment key={i}>
                      <button className={w.cls} role="menuitemradio" aria-checked={w.on} onClick={w.pick}>
                        <span className="l4-wsglyph">{interp(w.initial)}</span>
                        <span className="l4-wscopy">
                          <strong>{interp(w.name)}</strong>
                          <small>{interp(w.sub)}</small>
                        </span>
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#check" />
                        </svg>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <button className="menu-cta15" role="menuitem" onClick={v.closeWs}>
                  <svg
                    className="ui-icon use14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <use href="/i15.svg#plus" />
                  </svg>
                  <span>New workspace</span>
                </button>
              </div>
            </>
          ) : null}
        </div>
        <div className="nav-main">
          <button className={v.chatNavCls} onClick={v.viewChat}>
            <span className="nav-icon">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#square-pen" />
              </svg>
            </span>
            New chat<span className="shortcut">⌘ N</span>
          </button>
          <button className={v.workNavCls} onClick={v.viewWork}>
            <span className="nav-icon">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#list-todo" />
              </svg>
            </span>
            Work<span className="count">3</span>
          </button>
          <button className={v.schedNavCls} onClick={v.viewSchedule}>
            <span className="nav-icon">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#calendar" />
              </svg>
            </span>
            Schedule<span className="count">{interp(v.autosCount)}</span>
          </button>
          <button className={v.plugNavCls} onClick={v.viewPlugins}>
            <span className="nav-icon">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#plug" />
              </svg>
            </span>
            Plugins<span className="count">{interp(v.pluginCount)}</span>
          </button>
          <button className="nav-row">
            <span className="nav-icon">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#search" />
              </svg>
            </span>
            Search<span className="shortcut">⌘ K</span>
          </button>
        </div>
        <div className="recents c9-recents recents12">
          <div className="sidebar-separator12" />
          <div className="c9-scroll16">
            <section className="c9-group">
              <h3>
                <span className="c9-gicon16 st-chat17">
                  <svg
                    className="ui-icon use14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <use href="/i15.svg#message-square" />
                  </svg>
                </span>
                <b>Chats</b>
                <span>2</span>
              </h3>
              <div className="sidebar-item12">
                <button className={v.chat1Cls} onClick={v.viewChat}>
                  <span className="c9-status">
                    <svg
                      className="ui-icon use14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <use href="/i15.svg#message-square" />
                    </svg>
                  </span>
                  <span className="c9-row-copy fade16">
                    <strong>What changed in release 4.12.0?</strong>
                  </span>
                </button>
              </div>
              <div className="sidebar-item12">
                <button className="c9-row" onClick={v.viewChat}>
                  <span className="c9-status">
                    <svg
                      className="ui-icon use14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <use href="/i15.svg#message-square" />
                    </svg>
                  </span>
                  <span className="c9-row-copy fade16">
                    <strong>Morning digest · Sep 13</strong>
                  </span>
                </button>
              </div>
            </section>
            <section className="c9-group">
              <h3>
                <span className="c9-gicon16 st-progress16">
                  <svg
                    className="ui-icon use14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <use href="/i15.svg#circle-dot" />
                  </svg>
                </span>
                <b>In progress</b>
                <span>1</span>
              </h3>
              <div className="sidebar-item12">
                <button className={v.threadRowCls} aria-current={v.threadCurrent} onClick={v.viewThread}>
                  <span className="c9-status running">
                    <svg
                      className="ui-icon use14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <use href="/i15.svg#circle-dot" />
                    </svg>
                  </span>
                  <span className="c9-row-copy fade16">
                    <strong>Checkout total wrong after quantity change</strong>
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="provider-strip13 provider-strip14 l4-strip" aria-label="Provider capacity index">
            <div className="provider-group13">
              <button
                className="provider-button13"
                aria-label="Claude · 63% capacity left"
                title="Claude · 63% capacity left"
              >
                <span className="provider-orbit13 orbit14 ok14" style={{ "--remaining": "227deg" } as CSSProperties}>
                  <img className="brand12" src="/assets/brands-v12/claude.svg" alt="" />
                </span>
                <small className="orbit-index14 ok14">63%</small>
              </button>
            </div>
            <div className="provider-group13">
              <button
                className="provider-button13"
                aria-label="Codex · 91% capacity left"
                title="Codex · 91% capacity left"
              >
                <span className="provider-orbit13 orbit14 ok14" style={{ "--remaining": "328deg" } as CSSProperties}>
                  <img className="brand12 mono12" src="/assets/brands-v12/codex.svg" alt="" />
                </span>
                <small className="orbit-index14 ok14">91%</small>
              </button>
            </div>
            <div className="provider-group13">
              <button
                className="provider-button13"
                aria-label="Cursor · 48% capacity left"
                title="Cursor · 48% capacity left"
              >
                <span className="provider-orbit13 orbit14 ok14" style={{ "--remaining": "173deg" } as CSSProperties}>
                  <img className="brand12 mono12" src="/assets/coding-accounts/cursor.svg" alt="" />
                </span>
                <small className="orbit-index14 ok14">48%</small>
              </button>
            </div>
            <div className="provider-group13">
              <button
                className="provider-button13"
                aria-label="Copilot · 77% capacity left"
                title="Copilot · 77% capacity left"
              >
                <span className="provider-orbit13 orbit14 ok14" style={{ "--remaining": "277deg" } as CSSProperties}>
                  <img className="brand12 mono12" src="/assets/coding-accounts/copilot.svg" alt="" />
                </span>
                <small className="orbit-index14 ok14">77%</small>
              </button>
            </div>
            <div className="provider-group13">
              <button
                className="provider-button13"
                aria-label="Gemini · 82% capacity left"
                title="Gemini · 82% capacity left"
              >
                <span className="provider-orbit13 orbit14 ok14" style={{ "--remaining": "295deg" } as CSSProperties}>
                  <img className="brand12" src="/assets/coding-accounts/gemini.svg" alt="" />
                </span>
                <small className="orbit-index14 ok14">82%</small>
              </button>
            </div>
            <div className="provider-group13">
              <button
                className="provider-button13"
                aria-label="Hermes · 22% capacity left"
                title="Hermes · 22% capacity left"
              >
                <span className="provider-orbit13 orbit14 warn14" style={{ "--remaining": "79deg" } as CSSProperties}>
                  <img className="brand12" src="/assets/coding-accounts/hermes.webp" alt="" />
                </span>
                <small className="orbit-index14 warn14">22%</small>
              </button>
            </div>
            <button className="icon-button" aria-label="View all model account usage">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#ellipsis" />
              </svg>
            </button>
          </div>
          <button className="nav-row" onClick={v.getApps}>
            <span className="nav-icon">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#download" />
              </svg>
            </span>
            Desktop &amp; mobile apps
          </button>
          <button className="nav-row">
            <span className="nav-icon">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#settings" />
              </svg>
            </span>
            Settings
          </button>
          <button className="profile-button" onClick={v.openPlans}>
            <span className="person-avatar">A</span>
            <span>
              <strong>Alex</strong>
              <small>Team trial · {interp(v.balance)} left</small>
            </span>
            <svg
              className="ui-icon use14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <use href="/i15.svg#chevrons-up-down" />
            </svg>
          </button>
        </div>
      </aside>
      <div className="app-main">
        {v.fullLoading ? (
          <>
            <i className="l4-progress" aria-hidden="true" />
          </>
        ) : null}
        <header className="topbar">
          <div className="breadcrumb">
            <span>{interp(v.crumbA)}</span>
            {v.crumbThread ? (
              <>
                <span className="muted">/</span>
                <strong>BOT-42</strong>
              </>
            ) : null}
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Conversation options">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#ellipsis" />
              </svg>
            </button>
            <button className="call-top call-btn16" aria-label="Call your Operator" title="Call your Operator">
              <span className="call-btn-mark16">
                <svg
                  className="ui-icon use14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <use href="/i15.svg#phone" />
                </svg>
              </span>
              <span>Call</span>
            </button>
            <button className="icon-button" aria-label="Change appearance" onClick={v.toggleTheme}>
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#sun-moon" />
              </svg>
            </button>
          </div>
        </header>
        <div className="workspace-body">
          {v.loading ? (
            <>
              <div className="l4-skel" aria-busy="true" aria-label="Loading">
                <div className="l4-skel-head">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="l4-skel-log">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="l4-skel-composer" />
              </div>
            </>
          ) : null}
          {v.isConvo ? (
            <>
              <main className="thread9" data-screen-label="BOT-42 conversation">
                {v.isThread ? (
                  <>
                    <header className="t9-heading">
                      <button className="icon-button t9-back" aria-label="Back to conversations">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#chevron-left" />
                        </svg>
                      </button>
                      <div>
                        <span className="t9-meta">
                          BOT-42 <span>·</span> {interp(v.d?.status)} <span>·</span>{" "}
                          <span className="thread-privacy12">Autopilot · Issue intake</span>
                        </span>
                        <h1>Checkout total wrong after quantity change</h1>
                        <button type="button" className={`wf-line18 ${v.d?.wfTone}`}>
                          <span className="wf-dots18" aria-hidden="true">
                            {(v.d?.dots ?? []).map((x: any, i: number) => (
                              <Fragment key={i}>
                                <i className={x.cls} />
                              </Fragment>
                            ))}
                          </span>
                          <strong>{interp(v.d?.wfStep)}</strong>
                          <small>{interp(v.d?.wfMeta)}</small>
                          <svg
                            className="ui-icon use14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <use href="/i15.svg#chevron-right" />
                          </svg>
                        </button>
                      </div>
                      {v.d?.needsYou ? (
                        <>
                          <button className="head-need15 review15">
                            <svg
                              className="ui-icon use14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <use href="/i15.svg#hand" />
                            </svg>
                            <span>Your approval</span>
                          </button>
                        </>
                      ) : null}
                      <button className="small-button" aria-label="Task details">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#panel-right" />
                        </svg>
                        <span>Issue</span>
                      </button>
                    </header>
                  </>
                ) : null}
                <div className="t9-scroll">
                  <div className="t9-cols15">
                    <div className="t9-inner">
                      {v.isIntro ? (
                        <>
                          <div className="conversation-log13" aria-label="Getting to work">
                            {(v.introRows ?? []).map((m: any, i: number) => (
                              <Fragment key={i}>
                                <article className={m.cls}>
                                  <header>
                                    {m.op ? (
                                      <>
                                        <img src="/assets/logo/botinc-mark.svg" alt="" />
                                      </>
                                    ) : null}
                                    {m.auto ? (
                                      <>
                                        <svg
                                          className="ui-icon use14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden="true"
                                        >
                                          <use href={m.href} />
                                        </svg>
                                      </>
                                    ) : null}
                                    <strong>{interp(m.who)}</strong>
                                    <time>{interp(m.time)}</time>
                                  </header>
                                  <p>{interp(m.text)}</p>
                                </article>
                              </Fragment>
                            ))}
                            {v.introWorking ? (
                              <>
                                <p className="l4-working">
                                  <i />
                                  Working…
                                </p>
                              </>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                      {v.isChat ? (
                        <>
                          <section className="l4-welcome">
                            <img src="/assets/logo/botinc-mark.svg" alt="" />
                            <h1>What can I take off your plate, Alex?</h1>
                            <p>
                              Ask anything, paste an issue, or say what to change. Runs route across your subscriptions and
                              never stop at a limit.
                            </p>
                            <div className="l4-suggest">
                              <button className="small-button" onClick={v.viewThread}>
                                Why did BOT-42 happen?
                              </button>
                              <button className="small-button" onClick={v.viewSchedule}>
                                Add a weekly dependency-bump routine
                              </button>
                              <button className="small-button" onClick={v.viewWork}>
                                What is waiting for me?
                              </button>
                            </div>
                          </section>
                        </>
                      ) : null}
                      {v.isThread ? (
                        <>
                          {v.showAppsNote ? (
                            <>
                              <div className="l4-apps">
                                <svg
                                  className="ui-icon use14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <use href="/i15.svg#monitor" />
                                </svg>
                                <span>
                                  <b>BotInc for macOS, Windows, iPhone and Android.</b> Get told when a pull request is
                                  waiting. Approve from anywhere.
                                </span>
                                <button className="text-button" onClick={v.getApps}>
                                  Get the apps
                                </button>
                              </div>
                            </>
                          ) : null}
                          <div className="conversation-log13" aria-label="Conversation history">
                            <article className={v.d?.evCls}>
                              <header>
                                <img className="l4-src" src="/assets/connectors/sentry.png" alt="" />
                                <strong>Sentry</strong>
                                <time>09:41</time>
                              </header>
                              <p>
                                New error in acme/storefront · release 4.12.0 · 312 users in 14 minutes. TypeError: cannot
                                read &apos;workspaceId&apos; — checkout/summary.ts:88
                              </p>
                            </article>
                            <article className={v.d?.apCls}>
                              <header>
                                <svg
                                  className="ui-icon use14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <use href="/i15.svg#zap" />
                                </svg>
                                <strong>Issue intake · autopilot</strong>
                                <time>09:41</time>
                              </header>
                              <p>
                                Filed <b>BOT-42 · High</b>. Linked to release 4.12.0. Handed to the <b>Fix &amp; review</b>{" "}
                                workflow.
                              </p>
                            </article>
                            <article className={v.d?.opCls}>
                              <header>
                                <img src="/assets/logo/botinc-mark.svg" alt="" />
                                <strong>Operator</strong>
                                <time>09:42</time>
                              </header>
                              <p>
                                Sentry reported a new checkout error hitting 312 users. It started with release 4.12.0. Fix
                                &amp; review is running on your Claude subscription; the pull request will land here for
                                your approval.
                              </p>
                            </article>
                            {(v.steps ?? []).map((s: any, i: number) => (
                              <Fragment key={i}>
                                {s.afterRoute ? (
                                  <>
                                    <article className={v.routeCls}>
                                      <header>
                                        <svg
                                          className="ui-icon use14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden="true"
                                        >
                                          <use href="/i15.svg#waypoints" />
                                        </svg>
                                        <strong>Smart routing</strong>
                                        <time>09:44</time>
                                      </header>
                                      <p>
                                        Claude alex@ hit its 5-hour limit at 33% of the run. Continued on your second Claude
                                        account, <b>ops@</b> (62% left). Same branch, same context, <b>0s lost</b>. Nothing
                                        to log into.
                                      </p>
                                    </article>
                                  </>
                                ) : null}
                                <article className={s.cls}>
                                  <div className="wb16">
                                    <div className="wb-head16">
                                      <button type="button" className="wb-toggle16" aria-expanded="false">
                                        {s.isClaude ? (
                                          <>
                                            <img className="brand12" src="/assets/brands-v12/claude.svg" alt="" />
                                          </>
                                        ) : null}
                                        {s.isCodex ? (
                                          <>
                                            <img className="brand12 mono12" src="/assets/brands-v12/codex.svg" alt="" />
                                          </>
                                        ) : null}
                                        {s.isOp ? (
                                          <>
                                            <img className="brand12" src="/assets/logo/botinc-mark.svg" alt="" />
                                          </>
                                        ) : null}
                                        <span className="wb-name16">
                                          <strong>{interp(s.who)}</strong>
                                          <small>{interp(s.model)}</small>
                                        </span>
                                        <span className={s.outCls}>{interp(s.out)}</span>
                                        <span className={s.stateCls}>{interp(s.badge)}</span>
                                        <svg
                                          className="ui-icon use14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden="true"
                                        >
                                          <use href="/i15.svg#chevron-down" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </article>
                              </Fragment>
                            ))}
                            <div className={v.d?.resultCls}>
                              <button className="t9-artifact" onClick={v.openReceipt}>
                                <span className="t9-artifact-icon">
                                  <svg
                                    className="ui-icon use14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <use href="/i15.svg#git-pull-request" />
                                  </svg>
                                </span>
                                <span>
                                  <strong>PR #842 · Recompute discount and tax on every quantity change</strong>
                                  <small>3 files · +41 −9 · 12 checks passed · 2 reviews · $0.02 of cloud time</small>
                                </span>
                                <svg
                                  className="ui-icon use14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <use href="/i15.svg#arrow-up-right" />
                                </svg>
                              </button>
                              {v.d?.showApprove ? (
                                <>
                                  <section className="d9-card review13" aria-label="Decision needed">
                                    <div className="d9-card-top">
                                      <span>
                                        <svg
                                          className="ui-icon use14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden="true"
                                        >
                                          <use href="/i15.svg#hand" />
                                        </svg>{" "}
                                        Your approval
                                      </span>
                                      <small>Step 5 of 5</small>
                                    </div>
                                    <h2>Merge PR #842 into main?</h2>
                                    <p>
                                      Review approved by GPT-6 Astra. 12 checks passed on 8c42e1a. Nothing merges until you
                                      say so.
                                    </p>
                                    <div className="d9-options">
                                      <button className="small-button primary" onClick={v.approve}>
                                        Approve and merge
                                      </button>
                                      <button className="small-button">Ask for changes</button>
                                    </div>
                                    <p className="d9-answer-hint">Or answer in the conversation below.</p>
                                    <footer>
                                      <span>Waiting for Alex</span>
                                      <button className="text-button">
                                        <svg
                                          className="ui-icon use14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden="true"
                                        >
                                          <use href="/i15.svg#phone" />
                                        </svg>{" "}
                                        Talk it through
                                      </button>
                                    </footer>
                                  </section>
                                </>
                              ) : null}
                            </div>
                            <article className={v.d?.youCls}>
                              <header>
                                <span className="person13">A</span>
                                <strong>Alex</strong>
                                <time>09:48</time>
                              </header>
                              <p>{interp(v.d?.youText)}</p>
                            </article>
                            <article className={v.d?.mergedCls}>
                              <header>
                                <img src="/assets/logo/botinc-mark.svg" alt="" />
                                <strong>Operator</strong>
                                <time>09:49</time>
                              </header>
                              <p>
                                Merged and deployed as 4.12.1. Regression watch has the error for 24 hours; Sentry shows 0
                                new events since the deploy. BOT-42 is done.
                              </p>
                            </article>
                            {(v.msgs ?? []).map((m: any, i: number) => (
                              <Fragment key={i}>
                                <article className={m.cls}>
                                  <header>
                                    {m.op ? (
                                      <>
                                        <img src="/assets/logo/botinc-mark.svg" alt="" />
                                      </>
                                    ) : null}
                                    {m.me ? (
                                      <>
                                        <span className="person13">A</span>
                                      </>
                                    ) : null}
                                    <strong>{interp(m.who)}</strong>
                                    <time>{interp(m.time)}</time>
                                  </header>
                                  <p>{interp(m.text)}</p>
                                </article>
                              </Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="composer10-wrap composer11-wrap">
                  <form className={v.composerCls} onSubmit={v.send}>
                    <div className="route-head17 ok17">
                      <button
                        type="button"
                        className="rh-main17"
                        title="Routing for the next message"
                        aria-label="Routing for the next message"
                      >
                        <i className="route-dot17" />
                        <svg
                          className="ui-icon use14 rh-route17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#waypoints" />
                        </svg>
                        {v.notRouted ? (
                          <>
                            <img className="brand12 rh-logo17" src="/assets/brands-v12/claude.svg" alt="" />
                          </>
                        ) : null}
                        {v.routed ? (
                          <>
                            <img className="brand12 rh-logo17" src="/assets/brands-v12/claude.svg" alt="" />
                          </>
                        ) : null}
                        <span className="rh-model17">Auto</span>
                        <span className="rh-sep17">·</span>
                        <span className="rh-acct17">{interp(v.routeAcct)}</span>
                        <em className="route-kind17 sub17">SUB</em>
                        <span className="route-bar17">
                          <i style={css(v.routeBar)} />
                        </span>
                        <span className="route-left17">{interp(v.routeLeft)}</span>
                      </button>
                      <button type="button" className="rh-cost17" title="Task limit for this conversation">
                        <span className="rh-cost-long17">{interp(v.d?.cost)} of $1.00</span>
                        <span className="rh-cost-short17">{interp(v.d?.cost)}</span>
                      </button>
                    </div>
                    <textarea
                      id="unified-composer"
                      rows={2}
                      aria-label="Message your Operator"
                      placeholder="Reply, give feedback, or ask a question…"
                      value={v.value}
                      readOnly={v.readOnly}
                      onChange={v.onChange}
                      onKeyDown={v.onKeyDown}
                    />
                    <div className="composer10-tools">
                      <button type="button" className="icon-button" aria-label="Add files or context">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#plus" />
                        </svg>
                      </button>
                      <button className="composer10-choice model11" type="button" aria-label="Choose model">
                        <img src="/assets/brands-v12/claude.svg" alt="" />
                        <span>Claude Sonnet 5</span>
                        <em className="model-effort15">Auto</em>
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#chevron-down" />
                        </svg>
                      </button>
                      <span className="composer-spacer" />
                      <button className="icon-button mic11" type="button" aria-label="Dictate">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#mic" />
                        </svg>
                      </button>
                      <button className="icon-button call10-button" type="button" aria-label="Start voice call">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#audio-lines" />
                        </svg>
                      </button>
                      <button className={v.sendCls} type="submit" aria-label="Send" disabled={v.sendDisabled}>
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#arrow-up" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </main>
            </>
          ) : null}
          {v.isWork ? (
            <>
              <main className="work-v8 work-v9 l4-page9" data-screen-label="Work">
                <div className="v7-page-heading l4-show">
                  <div>
                    <h1>Work</h1>
                    <p>Every issue the company is working on. Nothing merges itself.</p>
                  </div>
                  <div className="head-actions14">
                    <button className="small-button primary">
                      <svg
                        className="ui-icon use14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#plus" />
                      </svg>{" "}
                      New issue
                    </button>
                  </div>
                </div>
                <div className="w8-bar16">
                  <nav className="w8-nav w8-nav16" aria-label="Filter work by status">
                    <button className="active">
                      <span className="w8-nav-icon">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#list-todo" />
                        </svg>
                      </span>
                      All<span className="w8-nav-count">3</span>
                    </button>
                    <button>
                      <span className="w8-nav-icon">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#circle-dot" />
                        </svg>
                      </span>
                      In progress<span className="w8-nav-count">1</span>
                    </button>
                    <button>
                      <span className="w8-nav-icon">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#hand" />
                        </svg>
                      </span>
                      Needs you<span className="w8-nav-count">{interp(v.needsCount)}</span>
                    </button>
                    <button>
                      <span className="w8-nav-icon">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#circle-check" />
                        </svg>
                      </span>
                      Done<span className="w8-nav-count">{interp(v.doneCount)}</span>
                    </button>
                  </nav>
                </div>
                <div className="w8-groups">
                  {(v.workGroups ?? []).map((g: any, i: number) => (
                    <Fragment key={i}>
                      <section className="w8-group">
                        <header className="w8-group-head">
                          <span className={g.iconCls}>
                            <svg
                              className="ui-icon use14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <use href={g.iconHref} />
                            </svg>
                          </span>
                          <span className="w8-gname16">
                            <h2>{interp(g.label)}</h2>
                            <span className="w8-group-count">{interp(g.count)}</span>
                          </span>
                          <span className="w8-collabel16 col-prio16" aria-hidden="true">
                            Priority
                          </span>
                          <span className="w8-collabel16 col-project16" aria-hidden="true">
                            Project
                          </span>
                          <span className="w8-collabel16 col-source16" aria-hidden="true">
                            Source
                          </span>
                          <span className="w8-collabel16 col-owner16" aria-hidden="true">
                            Owner
                          </span>
                          <span className="w8-collabel16 col-updated16" aria-hidden="true">
                            Updated
                          </span>
                        </header>
                        <div className="w8-rows">
                          {(g.rows ?? []).map((w: any, i: number) => (
                            <Fragment key={i}>
                              <button className="w8-row" onClick={w.open}>
                                <span className={w.stateCls}>
                                  <svg
                                    className="ui-icon use14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <use href={w.iconHref} />
                                  </svg>
                                </span>
                                <span className="w8-id">{interp(w.id)}</span>
                                <span className="w8-title">
                                  <strong>{interp(w.title)}</strong>
                                  <small className="w8-inline-meta">{interp(w.meta)}</small>
                                </span>
                                <span className={w.prioCls}>
                                  <span className="w8-bars16" aria-hidden="true">
                                    <i />
                                    <i />
                                    <i />
                                  </span>
                                  <span className="w8-prio-label16">{interp(w.priority)}</span>
                                </span>
                                <span className="w8-project">storefront</span>
                                <span className="w8-source l4-src16">
                                  {w.srcSentry ? (
                                    <>
                                      <img src="/assets/connectors/sentry.png" alt="" />
                                    </>
                                  ) : null}
                                  {w.srcPosthog ? (
                                    <>
                                      <img src="/assets/connectors/posthog.png" alt="" />
                                    </>
                                  ) : null}
                                  {w.srcGrafana ? (
                                    <>
                                      <img src="/assets/connectors/si/grafana.svg" alt="" />
                                    </>
                                  ) : null}
                                  {w.srcGithub ? (
                                    <>
                                      <img src="/assets/connectors/github.png" alt="" />
                                    </>
                                  ) : null}
                                  <span>{interp(w.source)}</span>
                                </span>
                                <span className="w8-ownercell16">
                                  <span className="w8-owner">{interp(w.ownerInitial)}</span>
                                  <span className="w8-ownername16">{interp(w.owner)}</span>
                                </span>
                                <time className="w8-updated">{interp(w.updated)}</time>
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </section>
                    </Fragment>
                  ))}
                </div>
                <div className="w8-foot">
                  <p>3 issues · 1 running · nothing merges itself</p>
                </div>
              </main>
            </>
          ) : null}
          {v.isPlugins ? (
            <>
              <main className="work-v8 work-v9 l4-page9" data-screen-label="Plugins">
                <div className="v7-page-heading l4-show">
                  <div>
                    <h1>Plugins</h1>
                    <p>
                      Sources, repositories and model accounts this workspace can reach. Read-only until you approve a
                      change.
                    </p>
                  </div>
                  <div className="head-actions14">
                    <button className="small-button primary">
                      <svg
                        className="ui-icon use14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#plus" />
                      </svg>{" "}
                      Add plugin
                    </button>
                  </div>
                </div>
                <div className="l4-pgroups">
                  <section className="l4-psec">
                    <header className="l4-phead">
                      <h2>Connected</h2>
                      <span>{interp(v.pluginCount)}</span>
                    </header>
                    <div className="l4-plugs">
                      {(v.plugins ?? []).map((p: any, i: number) => (
                        <Fragment key={i}>
                          <button className="l4-plug" onClick={p.open}>
                            {p.isSentry ? (
                              <>
                                <img src="/assets/connectors/sentry.png" alt="" />
                              </>
                            ) : null}
                            {p.isPosthog ? (
                              <>
                                <img src="/assets/connectors/posthog.png" alt="" />
                              </>
                            ) : null}
                            {p.isGrafana ? (
                              <>
                                <img src="/assets/connectors/si/grafana.svg" alt="" />
                              </>
                            ) : null}
                            {p.isGithub ? (
                              <>
                                <img src="/assets/connectors/github.png" alt="" />
                              </>
                            ) : null}
                            {p.isClaude ? (
                              <>
                                <img src="/assets/brands-v12/claude.svg" alt="" />
                              </>
                            ) : null}
                            {p.isCodex ? (
                              <>
                                <img src="/assets/brands-v12/codex.svg" alt="" />
                              </>
                            ) : null}
                            {p.isCursor ? (
                              <>
                                <img src="/assets/coding-accounts/cursor.svg" alt="" />
                              </>
                            ) : null}
                            {p.isCopilot ? (
                              <>
                                <img src="/assets/coding-accounts/copilot.svg" alt="" />
                              </>
                            ) : null}
                            <span>
                              <strong>{interp(p.name)}</strong>
                              <small>{interp(p.sub)}</small>
                            </span>
                            <em className={p.stCls}>{interp(p.st)}</em>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </section>
                  <section className="l4-psec">
                    <header className="l4-phead">
                      <h2>Available</h2>
                      <span>6</span>
                    </header>
                    <div className="l4-plugs">
                      <button className="l4-plug dim">
                        <img src="/assets/connectors/linear.png" alt="" />
                        <span>
                          <strong>Linear</strong>
                          <small>Issues, cycles</small>
                        </span>
                        <em>Connect</em>
                      </button>
                      <button className="l4-plug dim">
                        <img src="/assets/connectors/datadog.png" alt="" />
                        <span>
                          <strong>Datadog</strong>
                          <small>APM, monitors</small>
                        </span>
                        <em>Connect</em>
                      </button>
                      <button className="l4-plug dim">
                        <img src="/assets/connectors/si/newrelic.svg" alt="" />
                        <span>
                          <strong>New Relic</strong>
                          <small>Errors inbox</small>
                        </span>
                        <em>Connect</em>
                      </button>
                      <button className="l4-plug dim">
                        <img src="/assets/connectors/slack.png" alt="" />
                        <span>
                          <strong>Slack</strong>
                          <small>Alerts, digests</small>
                        </span>
                        <em>Connect</em>
                      </button>
                      <button className="l4-plug dim">
                        <img src="/assets/connectors/vercel.png" alt="" />
                        <span>
                          <strong>Vercel</strong>
                          <small>Deploys, logs</small>
                        </span>
                        <em>Connect</em>
                      </button>
                      <button className="l4-plug dim">
                        <img src="/assets/coding-accounts/gemini.svg" alt="" />
                        <span>
                          <strong>Gemini CLI</strong>
                          <small>Joins the rotation</small>
                        </span>
                        <em>Connect</em>
                      </button>
                    </div>
                  </section>
                </div>
              </main>
            </>
          ) : null}
          {v.isSchedule ? (
            <>
              <main className="schedule9 schedule14 l4-page9" data-screen-label="Schedule">
                <div className="v7-page-heading l4-show">
                  <div>
                    <h1>Schedule</h1>
                    <p>{interp(v.autosCount)} autopilots on. They run without you; results wait for you.</p>
                  </div>
                  <div className="head-actions14">
                    <button className="small-button primary">
                      <svg
                        className="ui-icon use14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#plus" />
                      </svg>{" "}
                      New routine
                    </button>
                  </div>
                </div>
                <div className="w8-groups">
                  <section className="w8-group">
                    <header className="w8-group-head">
                      <span className="w8-group-icon is-progress">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#zap" />
                        </svg>
                      </span>
                      <span className="w8-gname16">
                        <h2>Autopilots</h2>
                        <span className="w8-group-count">{interp(v.autosCount)}</span>
                      </span>
                      <span className="w8-collabel16 col-prio16" aria-hidden="true">
                        Trigger
                      </span>
                      <span className="w8-collabel16 col-project16" aria-hidden="true">
                        Project
                      </span>
                      <span className="w8-collabel16 col-source16" aria-hidden="true">
                        Source
                      </span>
                      <span className="w8-collabel16 col-owner16" aria-hidden="true">
                        Owner
                      </span>
                      <span className="w8-collabel16 col-updated16" aria-hidden="true">
                        Last run
                      </span>
                    </header>
                    <div className="w8-rows">
                      {(v.routines ?? []).map((r: any, i: number) => (
                        <Fragment key={i}>
                          <button className="w8-row" onClick={v.viewThread}>
                            <span className={r.stateCls}>
                              <svg
                                className="ui-icon use14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href={r.iconHref} />
                              </svg>
                            </span>
                            <span className="w8-id">{interp(r.id)}</span>
                            <span className="w8-title">
                              <strong>{interp(r.title)}</strong>
                              <small className="w8-inline-meta">{interp(r.meta)}</small>
                            </span>
                            <span className="w8-prio is-trigger">
                              <span className="w8-prio-label16">{interp(r.trigger)}</span>
                            </span>
                            <span className="w8-project">storefront</span>
                            <span className="w8-source l4-src16">
                              {r.srcSentry ? (
                                <>
                                  <img src="/assets/connectors/sentry.png" alt="" />
                                </>
                              ) : null}
                              {r.srcPosthog ? (
                                <>
                                  <img src="/assets/connectors/posthog.png" alt="" />
                                </>
                              ) : null}
                              {r.srcGrafana ? (
                                <>
                                  <img src="/assets/connectors/si/grafana.svg" alt="" />
                                </>
                              ) : null}
                              {r.srcGithub ? (
                                <>
                                  <img src="/assets/connectors/github.png" alt="" />
                                </>
                              ) : null}
                              <span>{interp(r.source)}</span>
                            </span>
                            <span className="w8-ownercell16">
                              <span className="w8-owner">O</span>
                              <span className="w8-ownername16">Operator</span>
                            </span>
                            <time className="w8-updated">{interp(r.last)}</time>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </section>
                </div>
                <p className="fine" style={{ padding: "14px 4px" }}>
                  Nothing merges itself. Every result comes back for your approval.
                </p>
              </main>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
