/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function PageModelAccounts({ v }: { v: Vals }) {
  return (
    v.accountsPage10 ? (
      <>
        <main
          className={`page10 account-page10 accounts14 settings-v7 ${v.accountPageClass14}`}
          data-screen-label="Model accounts"
        >
          <div className="s7-back-row">
            <button className="text-button" onClick={v.showSettings}>
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
              Settings
            </button>
          </div>
          <div className="settings-title pf-title16 has-cta16">
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
              {interp(v.pfScope16)}
            </span>
            <h2>Model accounts</h2>
            <p>Use your own subscriptions. Every limit stays visible and separate.</p>
            <span className="settings-cta16">
              <button className="small-button primary" onClick={v.addModelAccount10}>
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
            </span>
          </div>
          <nav className="w8-nav s14-nav" aria-label="Filter accounts by provider">
            {(v.accountTabs14 ?? []).map((t: any, i: number) => (
              <Fragment key={i}>
                <button className={t.cls} onClick={t.open}>
                  <span className="w8-nav-icon">
                    {t.hasLogo ? (
                      <>
                        <img className={`brand12 ${t.logoClass}`} src={t.logo} alt="" />
                      </>
                    ) : null}
                    {!t.hasLogo ? (
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
                          <use href={t.icon} />
                        </svg>
                      </>
                    ) : null}
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
              <span className="sr-only">Search accounts</span>
              <input placeholder="Search accounts" value={v.accountSearch14} onInput={v.editAccountSearch14} />
              {v.accountHasSearch14 ? (
                <>
                  <button className="icon-button" aria-label="Clear account search" onClick={v.clearAccountSearch14}>
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
                </>
              ) : null}
            </label>
            <button className={`small-button ${v.accountFilterCls14}`} onClick={v.toggleAccountAttention14}>
              {interp(v.accountFilterLabel14)}
            </button>
          </div>
          <div className="acc-split14">
            <div className="acc-list14" aria-label="Accounts">
              {(v.accountRows14 ?? []).map((a: any, i: number) => (
                <Fragment key={i}>
                  <button className={`acc-row14 ${a.cls}`} onClick={a.select}>
                    <span className="acc-mark14">
                      <img className={`brand12 ${a.brandClass12}`} src={a.brand12} alt="" />
                    </span>
                    <span className="acc-id14">
                      <span className="acc-title14">
                        <strong>{interp(a.label)}</strong>
                        <span className="acc-plan14">{interp(a.plan)}</span>
                      </span>
                      <small>{interp(a.identity)}</small>
                    </span>
                    <span className={`acc-left14 ${a.tone13}`}>
                      <strong>{interp(a.remaining13)}</strong>
                      <small>{interp(a.status)}</small>
                    </span>
                    <span className="windows14 acc-bars14">
                      <span className="acc-window-key14">
                        <span>Capacity left</span>
                        <span>Resets</span>
                      </span>
                      {(a.windows ?? []).map((w: any, i: number) => (
                        <Fragment key={i}>
                          <span className="window-row14">
                            <span className="window-name14">{interp(w.short14)}</span>
                            <span className="window-bar14">
                              <i className={w.tone14} style={css(w.style)} />
                            </span>
                            <span className={`window-left14 ${w.tone14}`}>{interp(w.leftLabel14)}</span>
                            <small className="window-when14">{interp(w.resetShort14)}</small>
                          </span>
                        </Fragment>
                      ))}
                      {a.noWindows14 ? (
                        <>
                          <span className="window-unknown14">
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
                              <use href="/i15.svg#circle-help" />
                            </svg>
                            <span>No window reported</span>
                          </span>
                        </>
                      ) : null}
                    </span>
                    <small className="acc-checked14">
                      {!a.routable14 ? (
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
                            <use href="/i15.svg#ban" />
                          </svg>
                        </>
                      ) : null}
                      {interp(a.checked14)}
                    </small>
                  </button>
                </Fragment>
              ))}
              {v.noAccountRows14 ? (
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
                      <use href="/i15.svg#key-round" />
                    </svg>
                    <strong>{interp(v.accountEmptyTitle14)}</strong>
                    <p>{interp(v.accountEmptyCopy14)}</p>
                    <button className="small-button" onClick={v.accountEmptyAction14}>
                      {interp(v.accountEmptyLabel14)}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
            <aside className="acc-detail14" aria-label="Account detail">
              <button className="text-button account-back14" onClick={v.backToAccountList14}>
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
                All accounts
              </button>
              {v.accountPicked14 ? (
                <>
                  <header className="accd-head14">
                    <img className={`brand12 ${v.accountBrandClass14}`} src={v.accountBrand14} alt="" />
                    <div>
                      <h2>{interp(v.accountLabel14)}</h2>
                      <p>{interp(v.accountIdentity14)}</p>
                    </div>
                  </header>
                  <div className="accd-facts14">
                    <span>
                      <small>Plan</small>
                      <strong>{interp(v.accountPlan14)}</strong>
                    </span>
                    <span>
                      <small>Access</small>
                      <strong>{interp(v.accountKind14)}</strong>
                    </span>
                    <span>
                      <small>Status</small>
                      <strong className={v.accountTone14}>{interp(v.accountStatus14)}</strong>
                    </span>
                    <span>
                      <small>Routing</small>
                      <strong className={v.accountRouteTone14}>{interp(v.accountRouteLabel14)}</strong>
                    </span>
                  </div>
                  <section className="accd-windows14">
                    <p className="capacity-label13">Capacity left</p>
                    <div className="windows14">
                      {(v.accountWindows14 ?? []).map((w: any, i: number) => (
                        <Fragment key={i}>
                          <div className="window-row14 window-wide14 window-stack16">
                            <span className="window-name14">{interp(w.label)}</span>
                            <span className={`window-left14 ${w.tone14}`}>{interp(w.pctLabel14)}</span>
                            <small className="window-reset14">{interp(w.reset)}</small>
                            <span className="window-bar14">
                              <i className={w.tone14} style={css(w.style)} />
                            </span>
                          </div>
                        </Fragment>
                      ))}
                      {v.accountNoWindows14 ? (
                        <>
                          <div className="window-unknown14">
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
                              <use href="/i15.svg#circle-help" />
                            </svg>
                            <span>
                              This account does not report a usage window. Nothing is estimated and no percentage is shown.
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                    {v.accountStale15 ? (
                      <>
                        <p className="accd-stale15">
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
                          {interp(v.accountStaleCopy15)}
                        </p>
                      </>
                    ) : null}
                    {v.accountFresh15 ? (
                      <>
                        <p className="account-fresh13">
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
                            <use href="/i15.svg#clock" />
                          </svg>
                          {interp(v.accountChecked14)}
                        </p>
                      </>
                    ) : null}
                  </section>
                  <section className="accd-actions14">
                    <p className="gside-title14">Connection and routing</p>
                    {(v.accountActions14 ?? []).map((x: any, i: number) => (
                      <Fragment key={i}>
                        <button className="accd-action14" onClick={x.run}>
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
                            <use href={x.icon} />
                          </svg>
                          <span>
                            <strong>{interp(x.title)}</strong>
                            <small>{interp(x.copy)}</small>
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
                            <use href="/i15.svg#chevron-right" />
                          </svg>
                        </button>
                      </Fragment>
                    ))}
                  </section>
                  <p className="fine">{interp(v.accountExplain14)}</p>
                </>
              ) : null}
              {!v.accountPicked14 ? (
                <>
                  <p className="gside-empty14">Choose an account to see its plan, capacity windows and routing.</p>
                </>
              ) : null}
            </aside>
          </div>
          <p className="page-foot10">
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
            </svg>{" "}
            {interp(v.accountPrivacy14)}
          </p>
        </main>
      </>
    ) : null
  );
}
