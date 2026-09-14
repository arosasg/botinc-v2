/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import { MessageText } from "../message-text";

export function PageSettings({ v }: { v: Vals }) {
  return (
    v.settingsPage ? (
      <>
        <main className="settings-page settings-v7" data-screen-label="Settings">
          <section className="settings-content">
            <div className="s7-back-row">
              <button className="text-button" onClick={v.settingsBackAction16}>
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
                </svg>{" "}
                {interp(v.settingsBackLabel16)}
              </button>
            </div>
            <div className="settings-title">
              <div className="settings-page-icon">
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
                  <use href={v.settingsIconHref} />
                </svg>
              </div>
              <span className="settings-scope">
                <svg
                  className="ui-icon "
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <use href="/i15.svg#lock" />
                </svg>
                {interp(v.settingsScope)}
              </span>
              <h2>{interp(v.settingsTitle)}</h2>
              <p>{interp(v.settingsDescription)}</p>
            </div>
            {v.connectionsSettings ? (
              <>
                <div className="s7-connection-intro">
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
                      <use href="/i15.svg#plug" />
                    </svg>
                  </span>
                  <p>
                    Your Operator use the tools you allow.
                    <br />
                    Teammates connect their own accounts.
                  </p>
                </div>
                {v.hasConnected7 ? (
                  <>
                    <div className="s7-section-heading">
                      <h3>Connected</h3>
                      <span>{interp(v.connectedCount)} tools</span>
                    </div>
                    <div className="s7-connected">
                      {(v.connectedTools7 ?? []).map((c: any, i: number) => (
                        <Fragment key={i}>
                          <div className="s7-connection-row">
                            <span className="s7-tool-icon">
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
                                <use href={c.iconHref} />
                              </svg>
                            </span>
                            <div>
                              <h3>{interp(c.name)}</h3>
                              <p>{interp(c.description)}</p>
                            </div>
                            <span className="s7-connected-state">
                              <i />
                              Connected
                            </span>
                            <button className="small-button" onClick={c.action}>
                              Manage
                            </button>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </>
                ) : null}
                <div className="s7-section-heading">
                  <h3>Connect a tool</h3>
                  <span>When you need it</span>
                </div>
                <div className="s7-tool-grid">
                  {(v.availableTools7 ?? []).map((c: any, i: number) => (
                    <Fragment key={i}>
                      <button className="s7-tool-card" onClick={c.action}>
                        <span className="s7-tool-icon">
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
                            <use href={c.iconHref} />
                          </svg>
                        </span>
                        <span>
                          <strong>{interp(c.name)}</strong>
                          <small>{interp(c.description)}</small>
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
                          <use href="/i15.svg#plus" />
                        </svg>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <p className="settings-footnote">
                  These are the tools your Operator may use. Model provider subscriptions live in{" "}
                  <button className="text-button" onClick={v.openModelAccounts8}>
                    Model accounts
                  </button>
                  . Both are optional: BotInc credits cover your first task.
                </p>
              </>
            ) : null}
            {v.accountsSettings ? (
              <>
                <div className="a8-intro">
                  <span className="a8-intro-icon">
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
                      <use href="/i15.svg#key-round" />
                    </svg>
                  </span>
                  <p>
                    Connect a subscription or API account. <br />
                    Only your Operator can use these accounts.
                  </p>
                  <button className="small-button primary" onClick={v.addAccount8}>
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
                    Add account
                  </button>
                </div>
                <div className="a8-routing a8-compact">
                  <div className="a8-routing-choice">
                    <label className="field-label" htmlFor="funding-default">
                      Default funding
                    </label>
                    <button
                      type="button"
                      className={`sel14 field ${v.m14_a8FundingMode?.cls}`}
                      aria-haspopup="listbox"
                      aria-expanded={v.m14_a8FundingMode?.expanded}
                      id="funding-default"
                      onClick={v.m14_a8FundingMode?.pick}
                    >
                      <span>{interp(v.m14_a8FundingMode?.label)}</span>
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
                  <div className="a8-routing-preview">
                    <span className="a8-next-label">NEXT TASK</span>
                    <strong>{interp(v.a8NextRun)}</strong>
                    <span>BotInc asks before switching to credits.</span>
                  </div>
                </div>
                {v.a8HasAccounts ? (
                  <>
                    {(v.a8Groups ?? []).map((g: any, i: number) => (
                      <Fragment key={i}>
                        <section className="a8-group">
                          <header className="a8-group-head">
                            <span className="s7-tool-icon">
                              {g.logo ? (
                                <>
                                  <img className={`a8-provider-logo ${g.logoClass}`} src={g.logoSrc} alt="" />
                                </>
                              ) : null}
                              {!g.logo ? (
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
                                    <use href={g.iconHref} />
                                  </svg>
                                </>
                              ) : null}
                            </span>
                            <div>
                              <h3>{interp(g.name)}</h3>
                              <p>{interp(g.summary)}</p>
                            </div>
                            <button className="small-button" onClick={g.add}>
                              Add another
                            </button>
                          </header>
                          <div className="a8-accounts">
                            {(g.rows ?? []).map((a: any, i: number) => (
                              <Fragment key={i}>
                                <article className={`a8-account ${a.cls}`}>
                                  <div className="a8-account-main">
                                    <div className="a8-identity">
                                      <strong>{interp(a.identity)}</strong>
                                      {(a.badges ?? []).map((b: any, i: number) => (
                                        <Fragment key={i}>
                                          <span className={`a8-badge ${b.cls}`}>{interp(b.label)}</span>
                                        </Fragment>
                                      ))}
                                    </div>
                                    <p className="a8-meta">{interp(a.meta)}</p>
                                  </div>
                                  <div className="a8-usage">
                                    {(a.windows ?? []).map((u: any, i: number) => (
                                      <Fragment key={i}>
                                        <div className="a8-window">
                                          <span className="a8-window-label">{interp(u.label)}</span>
                                          <span className="a8-bar">
                                            <i className={u.tone} style={css(u.style)} />
                                          </span>
                                          <span className="a8-pct">{interp(u.pct)}</span>
                                          <span className="a8-reset">{interp(u.reset)}</span>
                                        </div>
                                      </Fragment>
                                    ))}
                                    {a.noWindows ? (
                                      <>
                                        <p className="a8-nowindow">{interp(a.noWindowCopy)}</p>
                                      </>
                                    ) : null}
                                    <p className={`a8-fresh ${a.freshCls}`}>{interp(a.freshLabel)}</p>
                                  </div>
                                  <div className="a8-account-actions">
                                    {a.routable ? (
                                      <>
                                        <label className="a8-switch">
                                          <input type="checkbox" checked={a.enabled} onChange={a.toggle} />
                                          <span className="a8-track" />
                                          <small>{interp(a.switchLabel)}</small>
                                        </label>
                                      </>
                                    ) : null}
                                    {a.notRoutable ? (
                                      <>
                                        <span className="a8-routing-note">{interp(a.routingNote)}</span>
                                      </>
                                    ) : null}
                                    <button className="small-button" onClick={a.open}>
                                      Details
                                    </button>
                                  </div>
                                </article>
                              </Fragment>
                            ))}
                          </div>
                        </section>
                      </Fragment>
                    ))}
                  </>
                ) : null}
                {v.a8NoAccounts ? (
                  <>
                    <div className="a8-empty">
                      <h3>No provider accounts yet.</h3>
                      <p>
                        BotInc credits already cover model work, so you can finish a first task without connecting anything.
                        Add a subscription when you want your own capacity used first.
                      </p>
                      <button className="small-button primary" onClick={v.addAccount8}>
                        Add your first account{" "}
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
                          <use href="/i15.svg#arrow-right" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : null}
                {v.a8HasAvailable ? (
                  <>
                    <div className="s7-section-heading">
                      <h3>Available to connect</h3>
                      <span>{interp(v.a8AvailableNote)}</span>
                    </div>
                    <div className="s7-tool-grid">
                      {(v.a8Available ?? []).map((p: any, i: number) => (
                        <Fragment key={i}>
                          <button className="s7-tool-card" onClick={p.add}>
                            <span className="s7-tool-icon">
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
                                <use href={p.iconHref} />
                              </svg>
                            </span>
                            <span>
                              <strong>{interp(p.name)}</strong>
                              <small>{interp(p.methodLabel)}</small>
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
                              <use href="/i15.svg#plus" />
                            </svg>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </>
                ) : null}
                <p className="settings-footnote">
                  {interp(v.accountsNote15)}
                </p>
              </>
            ) : null}
            {v.agentsSettings ? (
              <>
                <div className="settings-list">
                  {(v.agentRows ?? []).map((a: any, i: number) => (
                    <Fragment key={i}>
                      <button className="setting-row agent-setting" onClick={a.open}>
                        <img src={a.avatar} alt="" />
                        <div>
                          <h3>{interp(a.name)}</h3>
                          <p>{interp(a.description)}</p>
                        </div>
                        <span className="agent-configuration">
                          <small>{interp(a.configuration)}</small>
                          <svg
                            className="ui-icon "
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
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div className="info-box">
                  <h3>One Operator, configured for you.</h3>
                  <p>
                    Everyone has their own Operator. Your conversations, memory, model choices, and connection permissions
                    belong to you.
                  </p>
                </div>
              </>
            ) : null}
            {v.projectsSettings ? (
              <>
                <div className="settings-list">
                  <div className="setting-row">
                    <span className="app-logo">
                      <svg
                        className="ui-icon "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#folder-git-2" />
                      </svg>
                    </span>
                    <div>
                      <h3>botinc/app</h3>
                      <p>
                        {interp(v.repoBranch)} · {interp(v.repoComputer)} · Shared workspace repository
                      </p>
                    </div>
                    <button className="small-button" onClick={v.repoDetails}>
                      Configure
                    </button>
                  </div>
                  <div className="setting-row">
                    <span className="app-logo">
                      <svg
                        className="ui-icon "
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
                    <div>
                      <h3>BotInc Design System</h3>
                      <p>Claude Design · v7 · Shared design guidelines</p>
                    </div>
                    <button className="small-button" onClick={v.designDetails}>
                      Open
                    </button>
                  </div>
                </div>
                <button className="small-button add-setting" onClick={v.addRepository}>
                  + Add repository
                </button>
              </>
            ) : null}
            {v.teamSettings ? (
              <>
                <nav className="w8-nav s14-nav" aria-label="Team views">
                  {(v.teamTabs14 ?? []).map((t: any, i: number) => (
                    <Fragment key={i}>
                      <button className={t.cls} onClick={t.open}>
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
                            <use href={t.icon} />
                          </svg>
                        </span>
                        {interp(t.label)}
                        <span className="w8-nav-count">{interp(t.count)}</span>
                      </button>
                    </Fragment>
                  ))}
                </nav>
                {v.teamHeadCta15 ? (
                  <>
                    <div className="team-head15">
                      <div>
                        <h2>{interp(v.teamHeadTitle15)}</h2>
                        <p>{interp(v.teamHeadCopy15)}</p>
                      </div>
                      <button className="small-button primary" onClick={v.teamHeadAction15} disabled={v.teamHeadDisabled15}>
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
                        {interp(v.teamHeadLabel15)}
                      </button>
                    </div>
                  </>
                ) : null}
                {v.membersTab14 ? (
                  <>
                    <div className="settings-list mem-list14">
                      {(v.memberRows14 ?? []).map((m: any, i: number) => (
                        <Fragment key={i}>
                          <div className="setting-row mem-row14">
                            <span className="person-avatar">{interp(m.initial)}</span>
                            <div>
                              <h3>
                                {interp(m.name)}
                                {m.isYou ? (
                                  <>
                                    <span className="mem-you14">You</span>
                                  </>
                                ) : null}
                              </h3>
                              <p>{interp(m.meta)}</p>
                            </div>
                            {m.hasScope ? (
                              <>
                                <span className="mem-scope14">
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
                                    <use href="/i15.svg#folder-git-2" />
                                  </svg>
                                  {interp(m.scope)}
                                </span>
                              </>
                            ) : null}
                            <button
                              className="sel14 mem-role14"
                              type="button"
                              aria-haspopup="listbox"
                              aria-expanded={m.expanded}
                              aria-label={`Role for ${m.name}`}
                              onClick={m.pickRole}
                              disabled={m.locked}
                            >
                              <span>{interp(m.role)}</span>
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
                            <button
                              className="icon-button"
                              aria-label={`Member actions for ${m.name}`}
                              onClick={m.actions}
                              disabled={m.locked}
                            >
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
                        </Fragment>
                      ))}
                    </div>
                    <div className="info-box">
                      <h3>Shared work. Your own Operator.</h3>
                      <p>
                        Workspace membership shares issues and team conversations. It never shares personal credentials,
                        model accounts or private memory.
                      </p>
                    </div>
                  </>
                ) : null}
                {v.invitesTab14 ? (
                  <>
                    <div className="settings-list mem-list14">
                      {(v.inviteRows14 ?? []).map((v: any, i: number) => (
                        <Fragment key={i}>
                          <div className="setting-row mem-row14">
                            <span className="person-avatar invite-avatar14">
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
                                <use href="/i15.svg#mail" />
                              </svg>
                            </span>
                            <div>
                              <h3>{interp(v.email)}</h3>
                              <p>{interp(v.meta)}</p>
                            </div>
                            <span className={`mem-state14 ${v.tone}`}>{interp(v.state)}</span>
                            {v.canResend ? (
                              <>
                                <button className="small-button" onClick={v.resend}>
                                  Resend
                                </button>
                              </>
                            ) : null}
                            {v.canRevoke ? (
                              <>
                                <button className="text-button" onClick={v.revoke}>
                                  Revoke
                                </button>
                              </>
                            ) : null}
                          </div>
                        </Fragment>
                      ))}
                      {v.noInvites14 ? (
                        <>
                          <p className="fine ledger-empty">No invitations are pending.</p>
                        </>
                      ) : null}
                    </div>
                    <p className="fine">Invitations are emailed after you confirm them.</p>
                  </>
                ) : null}
                {v.rolesTab14 ? (
                  <>
                    <div className="role-grid14">
                      {(v.roleRows14 ?? []).map((r: any, i: number) => (
                        <Fragment key={i}>
                          <article className={`role-card14 ${r.cls}`}>
                            <header>
                              <span className="role-mark14">
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
                                  <use href={r.icon} />
                                </svg>
                              </span>
                              <div>
                                <strong>{interp(r.name)}</strong>
                                <small>{interp(r.copy)}</small>
                              </div>
                              {r.custom ? (
                                <>
                                  <span className="mem-state14">Custom</span>
                                </>
                              ) : null}
                            </header>
                            <ul className="role-perms14">
                              {(r.summary ?? []).map((p: any, i: number) => (
                                <Fragment key={i}>
                                  <li className={p.tone}>
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
                                      <use href={p.icon} />
                                    </svg>
                                    {interp(p.label)}
                                  </li>
                                </Fragment>
                              ))}
                            </ul>
                            <footer>
                              <span>{interp(r.usage)}</span>
                              <button className="text-button" onClick={r.edit}>
                                {interp(r.editLabel)}
                              </button>
                            </footer>
                          </article>
                        </Fragment>
                      ))}
                    </div>
                    <p className="fine">
                      Owner-only capabilities such as deleting the workspace or transferring ownership cannot be granted
                      through a custom role.
                    </p>
                  </>
                ) : null}
              </>
            ) : null}
            {v.billingSettings ? (
              <>
                <div className="balance-card">
                  <span className="eyebrow">AVAILABLE CREDIT</span>
                  <h3>{interp(v.balanceText)}</h3>
                  <p>{interp(v.monthlyText)}</p>
                  <div className="credit-bar">
                    <span style={css(v.creditStyle)} />
                  </div>
                  <div className="credit-split">
                    <span>{interp(v.monthlyBalance)} monthly</span>
                    <span>{interp(v.purchasedBalance)} purchased</span>
                  </div>
                  <button className="small-button primary" onClick={v.topup}>
                    Add credits
                  </button>
                </div>
                <div className="settings-list">
                  <div className="setting-row">
                    <div>
                      <h3>{interp(v.plan)} plan</h3>
                      <p>{interp(v.planDescription)}</p>
                    </div>
                    <button className="small-button" onClick={v.comparePlans}>
                      Compare plans
                    </button>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h3>Auto top-up</h3>
                      <p>{interp(v.rechargeCopy)}</p>
                    </div>
                    <button className="small-button" onClick={v.rechargeSettings}>
                      Configure
                    </button>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h3>Usage & invoices</h3>
                      <p>Costs by task, model, member, and call</p>
                    </div>
                    <button className="small-button" onClick={v.usageDetails}>
                      View
                    </button>
                  </div>
                </div>
              </>
            ) : null}
            {v.skillsSettings ? (
              <>
                <div className="settings-toolbar">
                  <div className="tabs">
                    <button className={v.skillsTabClass} onClick={v.showSkillLibrary}>
                      Skills
                    </button>
                    <button className={v.memoryTabClass} onClick={v.showMemoryLibrary}>
                      Private memory
                    </button>
                  </div>
                  {v.skillLibrary ? (
                    <>
                      <button className="icon-button" aria-label="Search skills" onClick={v.toggleSkillSearch7}>
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
                      </button>
                      <button className="small-button primary" onClick={v.addSkill}>
                        + Add skill
                      </button>
                    </>
                  ) : null}
                </div>
                {v.skillLibrary ? (
                  <>
                    <label className="sr-only" htmlFor="skill-search">
                      Search skills
                    </label>
                    {v.skill7SearchVisible ? (
                      <>
                        <input
                          id="skill-search"
                          className="field skill-search"
                          placeholder="Search skills…"
                          value={v.skillQuery}
                          onChange={v.editSkillQuery}
                        />
                      </>
                    ) : null}
                    <div className="skill-library">
                      {(v.skillRows ?? []).map((k: any, i: number) => (
                        <Fragment key={i}>
                          <button className="skill-row" onClick={k.open}>
                            <span className="skill-symbol">
                              <svg
                                className="ui-icon "
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href="/i15.svg#book-open" />
                              </svg>
                            </span>
                            <div>
                              <h3>{interp(k.name)}</h3>
                              <p>{interp(k.description)}</p>
                              <small>
                                {interp(k.source)} · {interp(k.version)}
                              </small>
                              <span className="skill-mobile-grants">{interp(k.grantLabel)}</span>
                            </div>
                            <span className="skill-carriers">
                              <svg
                                className="ui-icon "
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href="/i15.svg#users" />
                              </svg>
                              {interp(k.carriers)}
                            </span>
                            <span>
                              <svg
                                className="ui-icon "
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href="/i15.svg#arrow-right" />
                              </svg>
                            </span>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    {v.noSkills ? (
                      <>
                        <div className="empty-work">
                          <h3>No matching skills.</h3>
                          <p>Try another name or add your own instructions.</p>
                        </div>
                      </>
                    ) : null}
                    <div className="info-box">
                      <h3>
                        <svg
                          className="ui-icon "
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href="/i15.svg#shield-check" />
                        </svg>
                        Your Operator, your permissions
                      </h3>
                      <p>
                        Workspace skills are available to everyone. Enabling a skill affects only your Operator. A skill
                        never grants access to a teammate’s accounts.
                      </p>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
            {v.newBilling ? (
              <>
                <nav className="w8-nav s14-nav" aria-label="Billing views">
                  {(v.billingTabs14 ?? []).map((t: any, i: number) => (
                    <Fragment key={i}>
                      <button className={t.cls} onClick={t.open}>
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
                            <use href={t.icon} />
                          </svg>
                        </span>
                        {interp(t.label)}
                        {t.hasCount ? (
                          <>
                            <span className="w8-nav-count">{interp(t.count)}</span>
                          </>
                        ) : null}
                      </button>
                    </Fragment>
                  ))}
                </nav>
                {v.planTab14 ? (
                  <>
                    <div className="b7-wallet">
                      <div className="b7-wallet-main">
                        <span>Available credit</span>
                        <h3>{interp(v.balanceText)}</h3>
                        <p>{interp(v.monthlyText)}</p>
                        <button className="small-button primary" onClick={v.topup}>
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
                          Add credits
                        </button>
                      </div>
                      <div className="b7-wallet-breakdown">
                        <div>
                          <span>{interp(v.allowanceName)} credit</span>
                          <strong>{interp(v.monthlyBalance)}</strong>
                        </div>
                        <div>
                          <span>Purchased credit</span>
                          <strong>{interp(v.purchasedBalance)}</strong>
                        </div>
                        <div className="credit-bar">
                          <span style={css(v.creditStyle)} />
                        </div>
                        <p>
                          Included credit is used first.
                          <br />
                          Purchased credit carries forward.
                        </p>
                      </div>
                    </div>
                    <section className="planc19" aria-label="Your plan">
                      <header className="planc-head19">
                        <div className="planc-id19">
                          <span className="planc-eyebrow19">YOUR PLAN</span>
                          <h3>{interp(v.plan)}</h3>
                        </div>
                        <p className="planc-price19">
                          <strong>{interp(v.planAmount19)}</strong>
                          <span>{interp(v.planCadence19)}</span>
                        </p>
                      </header>
                      <ul className="planc-feats19">
                        {(v.planFeatures19 ?? []).map((f: any, i: number) => (
                          <Fragment key={i}>
                            <li>
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
                              {interp(f.text)}
                            </li>
                          </Fragment>
                        ))}
                      </ul>
                      <footer className="planc-foot19">
                        <span className="planc-renew19">{interp(v.billingRenewal)}</span>
                        <button className="small-button" onClick={v.comparePlans}>
                          Change plan{" "}
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
                      </footer>
                    </section>
                    {v.hasScheduledPlan ? (
                      <>
                        <div className="inline-banner">
                          <span>{interp(v.scheduledPlanCopy)}</span>
                          <button className="text-button" onClick={v.cancelScheduledPlan}>
                            Undo change
                          </button>
                        </div>
                      </>
                    ) : null}
                    <div className="b7-topup-row">
                      <div>
                        <h3>Auto top-up</h3>
                        <p>{interp(v.rechargeCopy)}</p>
                      </div>
                      <button className="text-button" onClick={v.rechargeSettings}>
                        Configure{" "}
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
                    <div className="b7-topup-row">
                      <div>
                        <h3>Model accounts</h3>
                        <p>{interp(v.accountsBillingCopy)}</p>
                      </div>
                      <button className="text-button" onClick={v.openModelAccounts8}>
                        Manage{" "}
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
                    <div className="b7-topup-row">
                      <div>
                        <h3>Recent usage</h3>
                        <p>{interp(v.usageSummary14)}</p>
                      </div>
                      <button className="text-button" onClick={v.usageDetails}>
                        View usage{" "}
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
                    <details className="b7-terms">
                      <summary>How credit is used and when it expires</summary>
                      <p>{interp(v.creditTerms)}</p>
                    </details>
                  </>
                ) : null}
                {v.usageTab19 ? (
                  <>
                    <div className="b7-history-head">
                      <h3>Where the credit went.</h3>
                      <p>{interp(v.usageMonthNote19)}</p>
                    </div>
                    <section className="ug19">
                      <header className="ug-head19">
                        <div>
                          <span className="planc-eyebrow19">THIS MONTH</span>
                          <strong className="ug-total19">{interp(v.ugTotal19)}</strong>
                        </div>
                        <span className="ug-of19">{interp(v.ugOfNote19)}</span>
                      </header>
                      <div className="ug-bar19">
                        {(v.ugSlices19 ?? []).map((s: any, i: number) => (
                          <Fragment key={i}>
                            <i className={s.cls} style={css(s.style)} title={s.title} />
                          </Fragment>
                        ))}
                      </div>
                      <ul className="ug-legend19">
                        {(v.ugSlices19 ?? []).map((s: any, i: number) => (
                          <Fragment key={i}>
                            <li>
                              <i className={s.cls} />
                              <span>{interp(s.name)}</span>
                              <b>{interp(s.amount)}</b>
                              <small>{interp(s.share)}</small>
                            </li>
                          </Fragment>
                        ))}
                      </ul>
                    </section>
                    <section className="ug-block19">
                      <h4>By person</h4>
                      {(v.ugPeople19 ?? []).map((p: any, i: number) => (
                        <Fragment key={i}>
                          <div className="ug-row19">
                            <span className="person-avatar">{interp(p.initial)}</span>
                            <span>
                              <strong>{interp(p.name)}</strong>
                              <small>{interp(p.meta)}</small>
                            </span>
                            <b>{interp(p.amount)}</b>
                          </div>
                        </Fragment>
                      ))}
                    </section>
                    <section className="ug-block19">
                      <h4>Most expensive work</h4>
                      {(v.ugTasks19 ?? []).map((t: any, i: number) => (
                        <Fragment key={i}>
                          <button type="button" className="ug-row19 ug-task19" onClick={t.open}>
                            <span className="ug-id19">{interp(t.id)}</span>
                            <span>
                              <strong>{interp(t.title)}</strong>
                              <small>{interp(t.meta)}</small>
                            </span>
                            <b>{interp(t.amount)}</b>
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
                        </Fragment>
                      ))}
                    </section>
                    <div className="ug-foot19">
                      <p className="fine">{interp(v.ugFootNote19)}</p>
                      <button className="small-button" onClick={v.ugInvoices19}>
                        Invoices{" "}
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
                  </>
                ) : null}
                {v.ledgerTab14 ? (
                  <>
                    <div className="b7-history-head">
                      <h3>{interp(v.ledgerHeading14)}</h3>
                      <p>{interp(v.ledgerSub14)}</p>
                    </div>
                    <div className="ledger">
                      <div className="ledger-heading">
                        <span>{interp(v.ledgerColumn)}</span>
                        <span>Amount</span>
                      </div>
                      {(v.ledgerRows ?? []).map((r: any, i: number) => (
                        <Fragment key={i}>
                          <button className="ledger-row" onClick={r.open}>
                            <span>
                              <strong>{interp(r.title)}</strong>
                              <small>{interp(r.meta)}</small>
                            </span>
                            <span className={r.cls}>{interp(r.amount)}</span>
                          </button>
                        </Fragment>
                      ))}
                      {v.emptyLedger ? (
                        <>
                          <p className="fine ledger-empty">Nothing here yet. Entries appear as you use BotInc.</p>
                        </>
                      ) : null}
                    </div>
                    <p className="fine">Usage entries come from completed workspace runs.</p>
                  </>
                ) : null}
                {v.invoiceTab14 ? (
                  <>
                    <div className="b7-history-head">
                      <h3>Invoices</h3>
                      <p>Every payment, with a readable receipt.</p>
                    </div>
                    <div className="inv-list14">
                      {(v.invoiceRows14 ?? []).map((v: any, i: number) => (
                        <Fragment key={i}>
                          <article className="inv-row14">
                            <span className={`inv-mark14 ${v.tone}`}>
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
                                <use href={v.icon} />
                              </svg>
                            </span>
                            <span className="inv-body14">
                              <strong>{interp(v.title)}</strong>
                              <small>{interp(v.meta)}</small>
                            </span>
                            <span className={`inv-state14 ${v.tone}`}>{interp(v.state)}</span>
                            <span className="inv-amount14">{interp(v.amount)}</span>
                            <button className="text-button" onClick={v.open}>
                              Receipt
                            </button>
                          </article>
                        </Fragment>
                      ))}
                      {v.noInvoices14 ? (
                        <>
                          <p className="fine ledger-empty">No invoices yet. Subscribing or topping up creates one.</p>
                        </>
                      ) : null}
                    </div>
                    <p className="fine">Invoices appear after a completed payment.</p>
                  </>
                ) : null}
              </>
            ) : null}
            {v.generalSettings14 ? (
              <>
                <section className="gen-block14">
                  <h3>Appearance</h3>
                  <div className="settings-list">
                    <div className="setting-row">
                      <div>
                        <h3>Theme</h3>
                        <p>{interp(v.themeCopy14)}</p>
                      </div>
                      <div className="seg14" role="group" aria-label="Theme">
                        {(v.themeOptions14 ?? []).map((o: any, i: number) => (
                          <Fragment key={i}>
                            <button className={o.cls} onClick={o.pick} aria-pressed={o.on}>
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
                                <use href={o.icon} />
                              </svg>
                              {interp(o.label)}
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>Density</h3>
                        <p>{interp(v.densityCopy14)}</p>
                      </div>
                      <div className="seg14" role="group" aria-label="Density">
                        {(v.densityOptions14 ?? []).map((o: any, i: number) => (
                          <Fragment key={i}>
                            <button className={o.cls} onClick={o.pick} aria-pressed={o.on}>
                              {interp(o.label)}
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
                <section className="gen-block14">
                  <h3>Notifications</h3>
                  <div className="settings-list">
                    {(v.notifyRows14 ?? []).map((n: any, i: number) => (
                      <Fragment key={i}>
                        <div className="setting-row">
                          <div>
                            <h3>{interp(n.title)}</h3>
                            <p>{interp(n.copy)}</p>
                          </div>
                          <label className="s9-switch">
                            <input type="checkbox" checked={n.on} onChange={n.toggle} aria-label={n.title} />
                            <span />
                          </label>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </section>
                <section className="gen-block14">
                  <h3>Keyboard shortcuts</h3>
                  <div className="short-rows14">
                    {(v.shortcutRows14 ?? []).map((k: any, i: number) => (
                      <Fragment key={i}>
                        <div className="short-row14">
                          <span>{interp(k.label)}</span>
                          <kbd>{interp(k.keys)}</kbd>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <p className="fine">
                    Keyboard shortcuts are available throughout the workspace.
                  </p>
                </section>
              </>
            ) : null}
            {v.reposSettings14 ? (
              <>
                {!v.repoDetail16 ? (
                  <>
                    <div className="repo-head16">
                      <span className="repo-headtitle16">
                        Connected repositories<em>{interp(v.repoCount16)}</em>
                      </span>
                      <button className="small-button" onClick={v.repoFromGithub16}>
                        <img className="repo-gh16" src="/assets/providers/c-github.svg" alt="" />
                        Choose from GitHub
                      </button>
                    </div>
                    <div className="repo-list15" role="tablist" aria-label="Repositories">
                      {(v.repoTabs14 ?? []).map((r: any, i: number) => (
                        <Fragment key={i}>
                          <button role="tab" aria-selected={r.on} className={`repo-item15 ${r.cls}`} onClick={r.open}>
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
                              <use href={r.icon} />
                            </svg>
                            <span className="repo-name15">{interp(r.name)}</span>
                            <span className="repo-sub15">{interp(r.sub)}</span>
                            <span className={`repo-ready15 ${r.tone}`}>
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
                                <use href={r.readyIcon} />
                              </svg>
                              {interp(r.ready)}
                            </span>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <p className="fine">Choose a repository to see its connection, sandbox startup and variables.</p>
                  </>
                ) : null}
                {v.repoDetail16 ? (
                  <>
                    <section className="repo-card14">
                      <header>
                        <span className="app-logo">
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
                            <use href={v.repoIcon14} />
                          </svg>
                        </span>
                        <div>
                          <h3>{interp(v.repoName14)}</h3>
                          <p>{interp(v.repoMeta14)}</p>
                        </div>
                        <span className={`repo-state14 ${v.repoTone14}`}>{interp(v.repoState14)}</span>
                        <button className="small-button" onClick={v.repoConnect14}>
                          {interp(v.repoConnectLabel14)}
                        </button>
                      </header>
                      <div className="repo-health14">
                        {(v.repoHealth14 ?? []).map((h: any, i: number) => (
                          <Fragment key={i}>
                            <div className={`rhealth14 ${h.tone}`}>
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
                                <use href={h.icon} />
                              </svg>
                              <span>
                                <strong>{interp(h.title)}</strong>
                                <small>{interp(h.detail)}</small>
                              </span>
                              <time>{interp(h.when)}</time>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      {v.repoConfigAvailable14 ? (
                        <>
                          <div className="repo-actions14">
                            <button className="small-button primary" onClick={v.optimizeStartup14}>
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
                                <use href="/i15.svg#sparkles" />
                              </svg>{" "}
                              Optimize startup with AI
                            </button>
                            <button className="small-button" onClick={v.runStartupCheck14}>
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
                                <use href="/i15.svg#play" />
                              </svg>{" "}
                              Run startup check
                            </button>
                          </div>
                        </>
                      ) : null}
                      {v.repoConnected14 && !v.repoConfigAvailable14 ? (
                        <p className="fine">Repository access and the default branch are live. Sandbox startup settings are not stored by this deployment.</p>
                      ) : null}
                      {!v.repoConnected14 ? (
                        <>
                          <div className="repo-revoked14">
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
                              <use href="/i15.svg#circle-alert" />
                            </svg>
                            <p>{interp(v.repoRevokedCopy14)}</p>
                            <button className="small-button primary" onClick={v.repoConnect14}>
                              Reconnect this repository
                            </button>
                          </div>
                        </>
                      ) : null}
                    </section>
                    {v.repoConfigAvailable14 ? (
                      <>
                        <section className="repo-block14">
                          <header className="repo-block-head14">
                            <div>
                              <h3>Sandbox startup</h3>
                              <p>These files prepare a fresh remote sandbox before work begins.</p>
                            </div>
                          </header>
                          {(v.repoScripts14 ?? []).map((s: any, i: number) => (
                            <Fragment key={i}>
                              <label className="field-label repo-script14">
                                {interp(s.label)}
                                <textarea
                                  className="field code-field"
                                  rows={4}
                                  value={s.value}
                                  onChange={s.edit}
                                  aria-label={s.label}
                                />
                                <small className={s.tone}>{interp(s.note)}</small>
                              </label>
                            </Fragment>
                          ))}
                        </section>
                        <section className="repo-block14">
                          <header className="repo-block-head14">
                            <div>
                              <h3>Environment variables</h3>
                              <p>Values stay masked. Secret values are excluded from repository context given to chat.</p>
                            </div>
                            <button className="small-button" onClick={v.addEnv14}>
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
                              Add variable
                            </button>
                          </header>
                          <div className="env-rows14">
                            {(v.envRows14 ?? []).map((e: any, i: number) => (
                              <Fragment key={i}>
                                <article className={`env-row14 ${e.cls}`}>
                                  {!e.editing ? (
                                    <>
                                      <span className="env-key14">{interp(e.key)}</span>
                                      <span className="env-val14">{interp(e.display)}</span>
                                      <span className="env-scope14">{interp(e.scope)}</span>
                                      {e.secret ? (
                                        <>
                                          <span className="env-secret14">
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
                                              <use href="/i15.svg#lock-keyhole" />
                                            </svg>
                                            Secret
                                          </span>
                                        </>
                                      ) : null}
                                      {!e.secret ? (
                                        <>
                                          <span className="env-secret14 plain14">Plain</span>
                                        </>
                                      ) : null}
                                      <button className="text-button" onClick={e.edit}>
                                        Edit
                                      </button>
                                      <button className="icon-button" aria-label={`Delete ${e.key}`} onClick={e.remove}>
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
                                          <use href="/i15.svg#trash-2" />
                                        </svg>
                                      </button>
                                    </>
                                  ) : null}
                                  {e.editing ? (
                                    <>
                                      <div className="env-form14">
                                        <div className="form-pair">
                                          <label className="field-label">
                                            Name
                                            <input
                                              className="field"
                                              value={v.envDraftKey14}
                                              onChange={v.editEnvKey14}
                                              placeholder="DATABASE_URL"
                                            />
                                          </label>
                                          <label className="field-label">
                                            Value
                                            <input
                                              className="field"
                                              value={v.envDraftValue14}
                                              onChange={v.editEnvValue14}
                                              placeholder={v.envValuePlaceholder14}
                                            />
                                          </label>
                                        </div>
                                        <div className="form-pair">
                                          <label className="field-label">
                                            Sandbox scope
                                            <button
                                              type="button"
                                              className={`sel14 field ${v.m14_envDraftScope14?.cls}`}
                                              aria-haspopup="listbox"
                                              aria-expanded={v.m14_envDraftScope14?.expanded}
                                              aria-label="Sandbox scope"
                                              onClick={v.m14_envDraftScope14?.pick}
                                            >
                                              <span>{interp(v.m14_envDraftScope14?.label)}</span>
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
                                          </label>
                                          <label className="check-row env-check14">
                                            <input
                                              type="checkbox"
                                              checked={v.envDraftSecret14}
                                              onChange={v.toggleEnvSecret14}
                                            />
                                            <span>
                                              Secret value<small>Masked everywhere and never placed in chat context.</small>
                                            </span>
                                          </label>
                                        </div>
                                        {v.hasEnvError14 ? (
                                          <>
                                            <p className="error" role="alert">
                                              {interp(v.envError14)}
                                            </p>
                                          </>
                                        ) : null}
                                        <div className="dialog-actions">
                                          <button className="small-button" onClick={v.cancelEnv14}>
                                            Cancel
                                          </button>
                                          <button className="small-button primary" onClick={v.saveEnv14}>
                                            Save variable
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  ) : null}
                                </article>
                              </Fragment>
                            ))}
                            {v.noEnv14 ? (
                              <>
                                <p className="fine">
                                  No variables yet for this repository. Add the names its sandbox needs. Values are masked
                                  as soon as they are saved.
                                </p>
                              </>
                            ) : null}
                          </div>
                        </section>
                      </>
                    ) : null}
                    <p className="fine">
                      Startup files and variables belong to the selected repository. Each run uses a fresh remote sandbox on
                      the branch selected for that work.
                    </p>
                  </>
                ) : null}
              </>
            ) : null}
            {v.designSettings14 ? (
              <>
                <section className="ds-spec15" aria-label="Design system specimen">
                  <header className="pf-head15">
                    <div>
                      <h2>{interp(v.dsName15)}</h2>
                      <p>{interp(v.dsMeta15)}</p>
                    </div>
                    <button className="small-button" onClick={v.dsOpen15}>
                      <img className="ds-btnlogo16" src="/assets/brands-v12/claude.svg" alt="" />
                      Open in Claude Design
                    </button>
                  </header>
                  <div className="ds-swatches15">
                    {(v.dsColors15 ?? []).map((c: any, i: number) => (
                      <Fragment key={i}>
                        <span className="ds-swatch15">
                          <i style={css(c.style)} />
                          <b>{interp(c.name)}</b>
                          <small>{interp(c.value)}</small>
                        </span>
                      </Fragment>
                    ))}
                  </div>
                  <div className="ds-type15">
                    {(v.dsType15 ?? []).map((y: any, i: number) => (
                      <Fragment key={i}>
                        <span className="ds-line15">
                          <b style={css(y.style)}>{interp(y.sample)}</b>
                          <small>
                            {interp(y.name)} · {interp(y.spec)}
                          </small>
                        </span>
                      </Fragment>
                    ))}
                  </div>
                  <div className="ds-shape15">
                    {(v.dsShape15 ?? []).map((k: any, i: number) => (
                      <Fragment key={i}>
                        <span className="ds-chip15">
                          <i style={css(k.style)} />
                          <small>{interp(k.name)}</small>
                        </span>
                      </Fragment>
                    ))}
                  </div>
                  <p className="fine">{interp(v.dsSpecNote15)}</p>
                </section>
                <section className="ds-block15">
                  <header className="pf-head15">
                    <div>
                      <h2>Design sources</h2>
                      <p>What Operator reads when work touches an interface.</p>
                    </div>
                    <button className="small-button" onClick={v.dsAdd15}>
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
                      Add a source
                    </button>
                  </header>
                  <div className="ds-table16" role="table" aria-label="Design sources">
                    <div className="ds-th16" role="row">
                      <span>Source</span>
                      <span>Kind</span>
                      <span>Updated</span>
                      <span>Status</span>
                      <span />
                    </div>
                    {(v.designRows16 ?? []).map((d: any, i: number) => (
                      <Fragment key={i}>
                        <article className="ds-tr16" role="row">
                          <span className="ds-src16">
                            <span className={`ds-logo16 ${d.logoCls16}`}>
                              {d.hasLogo16 ? (
                                <>
                                  <img src={d.logo16} alt="" />
                                </>
                              ) : null}
                              {!d.hasLogo16 ? (
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
                                    <use href={d.icon} />
                                  </svg>
                                </>
                              ) : null}
                            </span>
                            <span className="ds-srcbody16">
                              <strong>{interp(d.title)}</strong>
                              <small>{interp(d.copy)}</small>
                            </span>
                          </span>
                          <span className="ds-kind16">{interp(d.kind16)}</span>
                          <span className="ds-upd16">{interp(d.updated16)}</span>
                          <span className={`ds-st16 ${d.tone}`}>
                            <i />
                            {interp(d.state)}
                          </span>
                          <span className="ds-acts16">
                            <button className="text-button" onClick={d.edit}>
                              {interp(d.editLabel)}
                            </button>
                            <button className="small-button" onClick={d.open}>
                              {interp(d.action)}
                            </button>
                          </span>
                        </article>
                      </Fragment>
                    ))}
                  </div>
                </section>
                <div className="info-box">
                  <h3>Design context, kept separate from code.</h3>
                  <p>
                    Design guidance is versioned on its own and never changes repository setup. Editing a source here does
                    not publish anything.
                  </p>
                </div>
              </>
            ) : null}
            {v.workflowsSettings16 ? (
              <>
                <div className="repo-head16">
                  <span className="repo-headtitle16">
                    Workflows<em>{interp(v.wfCount16)}</em>
                  </span>
                  <button className="small-button primary" onClick={v.newWorkflow14}>
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
                    New workflow
                  </button>
                </div>
                <div className="wf-rows14 wf-page16">
                  {(v.workflowRows14 ?? []).map((w: any, i: number) => (
                    <Fragment key={i}>
                      <article className={`wf-row14 ${w.cls}`}>
                        <button className="wf-open14" onClick={w.open}>
                          <span className="wf-mark14">
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
                              <use href={w.icon} />
                            </svg>
                          </span>
                          <span>
                            <strong>{interp(w.name)}</strong>
                            <small>{interp(w.meta)}</small>
                          </span>
                        </button>
                        <span className={`wf-state14 ${w.tone}`}>{interp(w.state)}</span>
                        <button className="small-button" onClick={w.open}>
                          {interp(w.action)}
                        </button>
                      </article>
                    </Fragment>
                  ))}
                </div>
                <div className="info-box">
                  <h3>A workflow is the ordered set of steps behind complex work.</h3>
                  <p>Saving a version changes future runs only; recorded runs keep the version they executed.</p>
                </div>
              </>
            ) : null}
            {v.memorySettings14 ? (
              <>
                <nav className="w8-nav s14-nav" aria-label="Memory scopes">
                  {(v.memoryScopes14 ?? []).map((t: any, i: number) => (
                    <Fragment key={i}>
                      <button className={t.cls} onClick={t.open}>
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
                            <use href={t.icon} />
                          </svg>
                        </span>
                        {interp(t.label)}
                        <span className="w8-nav-count">{interp(t.count)}</span>
                      </button>
                    </Fragment>
                  ))}
                </nav>
                <div className="acc-controls14">
                  <label className="w8-search">
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
                    <span className="sr-only">Search memories</span>
                    <input
                      placeholder="Search what BotInc remembers"
                      value={v.memorySearch14}
                      onInput={v.editMemorySearch14}
                    />
                  </label>
                  {v.memoryProjectPicker14 ? (
                    <>
                      <button
                        className="sel14"
                        type="button"
                        aria-haspopup="listbox"
                        aria-label="Project scope"
                        onClick={v.pickMemoryProject14}
                      >
                        <span>{interp(v.memoryProject14)}</span>
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
                    </>
                  ) : null}
                  <button className="small-button" onClick={v.addMemory14}>
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
                    Add memory
                  </button>
                </div>
                <p className="mem-scope-note14">
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
                    <use href={v.memoryScopeIcon14} />
                  </svg>
                  {interp(v.memoryScopeNote14)}
                </p>
                {v.hasSuggested14 ? (
                  <>
                    <section className="mem-suggest14">
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
                          <use href="/i15.svg#sparkles" />
                        </svg>
                        <div>
                          <strong>{interp(v.suggestTitle14)}</strong>
                          <small>Drawn from recent work. Nothing is remembered until you accept it.</small>
                        </div>
                      </header>
                      {(v.suggestedRows14 ?? []).map((m: any, i: number) => (
                        <Fragment key={i}>
                          <article className="memsug14">
                            <div className="memsug-body14">
                              <span className={`mem-type14 ${m.typeTone}`}>{interp(m.type)}</span>
                              <MessageText text={String(m.text ?? "")} />
                              <small>{interp(m.provenance)}</small>
                              {m.conflicts ? (
                                <>
                                  <p className="mem-conflict14">
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
                                      <use href="/i15.svg#triangle-alert" />
                                    </svg>
                                    {interp(m.conflictText)}
                                  </p>
                                </>
                              ) : null}
                            </div>
                            <div className="memsug-actions14">
                              {m.conflicts ? (
                                <>
                                  <button className="small-button primary" onClick={m.replace}>
                                    Replace the old one
                                  </button>
                                  <button className="small-button" onClick={m.keepBoth}>
                                    Keep both
                                  </button>
                                </>
                              ) : null}
                              {!m.conflicts ? (
                                <>
                                  <button className="small-button primary" onClick={m.accept}>
                                    Remember this
                                  </button>
                                </>
                              ) : null}
                              <button className="text-button" onClick={m.reject}>
                                Dismiss
                              </button>
                            </div>
                          </article>
                        </Fragment>
                      ))}
                    </section>
                  </>
                ) : null}
                <div className="mem-rows14">
                  {(v.memoryRows14 ?? []).map((m: any, i: number) => (
                    <Fragment key={i}>
                      <article className={`mem14 ${m.cls}`}>
                        <header className="mem-head14">
                          <span className={`mem-type14 ${m.typeTone}`}>{interp(m.type)}</span>
                          {m.pinned ? (
                            <>
                              <span className="mem-pin14">
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
                                  <use href="/i15.svg#pin" />
                                </svg>
                                Pinned
                              </span>
                            </>
                          ) : null}
                          <span className="mem-scopetag14">{interp(m.scope)}</span>
                          <time>{interp(m.updated)}</time>
                        </header>
                        {!m.editing ? (
                          <>
                            <p className="mem-text14">{interp(m.text)}</p>
                          </>
                        ) : null}
                        {m.editing ? (
                          <>
                            <textarea
                              className="field"
                              rows={3}
                              value={v.memoryDraft14}
                              onChange={v.editMemoryDraft14}
                              aria-label="Memory text"
                            />
                            <div className="dialog-actions">
                              <button className="small-button" onClick={v.cancelMemory14}>
                                Cancel
                              </button>
                              <button className="small-button primary" onClick={v.saveMemory14}>
                                Save memory
                              </button>
                            </div>
                          </>
                        ) : null}
                        <footer className="mem-foot14">
                          <button className="text-button" onClick={m.source}>
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
                              <use href={m.sourceIcon} />
                            </svg>
                            {interp(m.provenance)}
                          </button>
                          <span className="mem-used14">{interp(m.lastUsed)}</span>
                          {v.goalChip16 ? (
                            <>
                              <span className="cbar-chip16 goal16">
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
                                  <use href="/i15.svg#flag" />
                                </svg>
                                {v.goalEditing16 ? (
                                  <>
                                    <input
                                      className="cbar-goalin16"
                                      placeholder="What should come of this?"
                                      value={v.goalDraft16}
                                      onInput={v.goalEdit16}
                                      onKeyDown={v.goalKey16}
                                      onBlur={v.goalCommit16}
                                      aria-label="Goal for this conversation"
                                    />
                                  </>
                                ) : null}
                                {!v.goalEditing16 ? (
                                  <>
                                    <button
                                      type="button"
                                      className="cbar-chiptext16"
                                      onClick={v.goalOpen16}
                                      title={v.goalFull16}
                                    >
                                      {interp(v.goalShort16)}
                                    </button>
                                  </>
                                ) : null}
                                <button
                                  type="button"
                                  className="cbar-chipx16"
                                  aria-label="Remove goal"
                                  onClick={v.goalClear16}
                                >
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
                                    <use href="/i15.svg#x" />
                                  </svg>
                                </button>
                              </span>
                            </>
                          ) : null}
                          {v.planChip16 ? (
                            <>
                              <span className="cbar-chip16 plan16">
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
                                  <use href="/i15.svg#lightbulb" />
                                </svg>
                                <span className="cbar-chiptext16">Plan</span>
                                <button
                                  type="button"
                                  className="cbar-chipx16"
                                  aria-label="Turn plan mode off"
                                  onClick={v.planClear16}
                                >
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
                                    <use href="/i15.svg#x" />
                                  </svg>
                                </button>
                              </span>
                            </>
                          ) : null}
                          <span className="composer-spacer" />
                          <button className="text-button" onClick={m.why}>
                            Why it was used
                          </button>
                          <button className="text-button" onClick={m.pin}>
                            {interp(m.pinLabel)}
                          </button>
                          <button className="text-button" onClick={m.edit}>
                            Edit
                          </button>
                          <button className="text-button danger14" onClick={m.forget}>
                            Forget
                          </button>
                        </footer>
                      </article>
                    </Fragment>
                  ))}
                  {v.noMemories14 ? (
                    <>
                      <div className="s14-empty">
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
                          <use href="/i15.svg#brain" />
                        </svg>
                        <strong>{interp(v.memoryEmptyTitle14)}</strong>
                        <p>{interp(v.memoryEmptyCopy14)}</p>
                        <button className="small-button" onClick={v.addMemory14}>
                          Add a memory
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
                <p className="fine">
                  Forgetting removes a memory from future retrieval and from this list. The conversation it came from is
                  deleted separately.
                </p>
              </>
            ) : null}
            {v.computersV6 ? (
              <>
                <div className="computer-cards">
                  {(v.computerCards ?? []).map((c: any, i: number) => (
                    <Fragment key={i}>
                      <button className="computer-card" onClick={c.open}>
                        <span className="computer-icon">
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
                            <use href={c.iconHref} />
                          </svg>
                        </span>
                        <div className="computer-card-title">
                          <h3>{interp(c.name)}</h3>
                          <span className="connection-state">
                            <i />
                            {interp(c.status)}
                          </span>
                        </div>
                        <p>{interp(c.copy)}</p>
                        <div className="computer-card-meta">
                          <span>{interp(c.meta)}</span>
                          <svg
                            className="ui-icon "
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
                        </div>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div className="settings-section-label">How new tasks run</div>
                <div className="settings-list">
                  <div className="setting-row">
                    <span className="app-logo">
                      <svg
                        className="ui-icon "
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
                    </span>
                    <div>
                      <h3>Default computer</h3>
                      <p>You can change this for each conversation or automation.</p>
                    </div>
                    <button className="small-button" onClick={v.chooseComputer}>
                      {interp(v.composerComputer)}{" "}
                      <svg
                        className="ui-icon "
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
                  <div className="setting-row">
                    <span className="app-logo">
                      <svg
                        className="ui-icon "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#shield-check" />
                      </svg>
                    </span>
                    <div>
                      <h3>Execution permissions</h3>
                      <p>Review changes before merge, send, or publish.</p>
                    </div>
                    <button className="text-button" onClick={v.computerPermissions}>
                      Review{" "}
                      <svg
                        className="ui-icon "
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
                </div>
                <p className="settings-footnote">
                  Cloud tasks keep working when you close BotInc. Your computer needs to stay online for local tasks.
                </p>
              </>
            ) : null}
            {v.graphsV6 ? (
              <>
                <div className="workflow-card">
                  <div className="workflow-card-head">
                    <span className="app-logo">
                      <svg
                        className="ui-icon "
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
                    </span>
                    <div>
                      <h3>Fix and review</h3>
                      <p>A shared process. Each step uses the task owner’s agents.</p>
                    </div>
                    <button className="small-button" onClick={v.editWorkflowV6}>
                      Edit workflow
                    </button>
                  </div>
                  <div className="workflow-steps">
                    {(v.workflowSteps ?? []).map((n: any, i: number) => (
                      <Fragment key={i}>
                        <div className="workflow-node">
                          <span>{interp(n.number)}</span>
                          <strong>{interp(n.name)}</strong>
                          <small>{interp(n.copy)}</small>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div className="workflow-card-foot">
                    <span>
                      <svg
                        className="ui-icon "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#shield-check" />
                      </svg>{" "}
                      Stops for your approval
                    </span>
                    <span>4 steps · {interp(v.workflowBudgetLabel)}</span>
                  </div>
                </div>
                <div className="info-box">
                  <h3>Start simple. Open the details when you need them.</h3>
                  <p>
                    Chat and imported issues can use this workflow. Change the instructions or limits here without creating
                    more agents.
                  </p>
                </div>
              </>
            ) : null}
            {v.activityV6 ? (
              <>
                <div className="settings-toolbar">
                  <div className="tabs">
                    <button className={v.auditAllClass} onClick={v.showAllAudit}>
                      All activity
                    </button>
                    <button className={v.auditAccessClass} onClick={v.showAccessAudit}>
                      Access changes
                    </button>
                  </div>
                  <button className="small-button" onClick={v.exportAuditV6}>
                    <svg
                      className="ui-icon "
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <use href="/i15.svg#download" />
                    </svg>{" "}
                    Export
                  </button>
                </div>
                <div className="audit-list">
                  {(v.auditRows ?? []).map((a: any, i: number) => (
                    <Fragment key={i}>
                      <button className="audit-row" onClick={a.open}>
                        <span className="audit-symbol">
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
                            <use href={a.iconHref} />
                          </svg>
                        </span>
                        <div>
                          <strong>{interp(a.title)}</strong>
                          <p>{interp(a.copy)}</p>
                        </div>
                        <time>{interp(a.time)}</time>
                        <svg
                          className="ui-icon "
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
                    </Fragment>
                  ))}
                </div>
                <p className="settings-footnote">
                  Workspace actions and permission changes are recorded here. Personal conversation content is visible only
                  to its owner.
                </p>
              </>
            ) : null}
          </section>
        </main>
      </>
    ) : null
  );
}
