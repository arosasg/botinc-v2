/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function ShellAccountScrim13({ v }: { v: Vals }) {
  return (
    v.accountsOpen13 ? (
      <>
        <div className="account-scrim13" onClick={v.closeAccounts13} />
        <section
          className={`account-dialog13 ${v.accountDialogClass13}`}
          role="dialog"
          aria-modal="true"
          aria-label="Account usage"
          onKeyDown={v.accountKey13}
        >
          <header>
            <div>
              <h2>
                Account usage <span>{interp(v.accountCount13)}</span>
              </h2>
              <p>Your accounts. Independent usage windows.</p>
            </div>
            <button className="icon-button" aria-label="Close account usage" onClick={v.closeAccounts13}>
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
          </header>
          <div className="account-layout13">
            <nav aria-label="Account providers">
              {(v.providerGroups13 ?? []).map((p: any, i: number) => (
                <Fragment key={i}>
                  <button className={p.cls} onClick={p.pick}>
                    <img className={`brand12 ${p.brandClass12}`} src={p.brand12} alt="" />
                    <span>{interp(p.name)}</span>
                    <small>{interp(p.count)}</small>
                  </button>
                </Fragment>
              ))}
            </nav>
            <div className="account-list13">
              <label>
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
                <input
                  aria-label="Search model accounts"
                  placeholder="Search accounts…"
                  value={v.accountSearch13}
                  onInput={v.editAccountSearch13}
                />
              </label>
              <div className="account-list-header13">
                <span>
                  {interp(v.selectedProvider13)} <small>{interp(v.matchingCount13)}</small>
                </span>
                <button className="text-button" onClick={v.toggleLimited13}>
                  {interp(v.limitFilterLabel13)}
                </button>
              </div>
              <div className="account-rows13">
                {(v.accountRows13 ?? []).map((a: any, i: number) => (
                  <Fragment key={i}>
                    <button className={`account-row13 ${a.cls13}`} onClick={a.select13}>
                      <div>
                        <strong>{interp(a.label)}</strong>
                        <span className={a.tone13}>{interp(a.remaining13)}</span>
                      </div>
                      <small>{interp(a.identity)}</small>
                      <div className="account-row-bottom13">
                        <span>{interp(a.plan)}</span>
                        <span className={a.tone13}>{interp(a.status)}</span>
                      </div>
                    </button>
                  </Fragment>
                ))}
                {v.noAccounts13 ? (
                  <>
                    <p className="empty-inline13">No accounts match this search.</p>
                  </>
                ) : null}
              </div>
            </div>
            <div className="account-detail13">
              <button className="text-button mobile-account-back13" onClick={v.backToAccounts13}>
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
                  <use href="/i15.svg#arrow-left" />
                </svg>{" "}
                All {interp(v.selectedProvider13)} accounts
              </button>
              {v.hasAccount13 ? (
                <>
                  <header>
                    <img className={`brand12 ${v.accountBrandClass13}`} src={v.accountBrand13} alt="" />
                    <div>
                      <h3>{interp(v.accountLabel13)}</h3>
                      <p>{interp(v.accountIdentity13)}</p>
                    </div>
                  </header>
                  <div className="account-detail-meta13">
                    <span>{interp(v.accountPlan13)}</span>
                    <span className={v.accountTone13}>{interp(v.accountStatus13)}</span>
                  </div>
                  <div className="account-windows13">
                    <p className="capacity-label13">Remaining capacity</p>
                    {(v.accountWindows13 ?? []).map((w: any, i: number) => (
                      <Fragment key={i}>
                        <section>
                          <header>
                            <strong>{interp(w.label)}</strong>
                            <span>
                              {interp(w.remaining)} <small>left</small>
                            </span>
                          </header>
                          <div className="window-bar13">
                            <i style={css(w.style)} />
                          </div>
                          <footer>
                            <span>{interp(w.used)}</span>
                            <strong>{interp(w.reset)}</strong>
                          </footer>
                        </section>
                      </Fragment>
                    ))}
                    {v.noWindows13 ? (
                      <>
                        <div className="unknown-window13">
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
                          <strong>Usage not reported</strong>
                          <p>This account does not report a quota window. No percentage is estimated.</p>
                        </div>
                      </>
                    ) : null}
                  </div>
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
                    {interp(v.accountFreshness13)}
                  </p>
                  <p className="account-explain13">{interp(v.accountExplanation13)}</p>
                  <button className="small-button" onClick={v.accountSettings13}>
                    Manage this account{" "}
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
                </>
              ) : null}
              {!v.hasAccount13 ? (
                <>
                  <p className="empty-inline13">Choose an account to see its usage windows.</p>
                </>
              ) : null}
            </div>
          </div>
          <footer>
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
                <use href="/i15.svg#lock-keyhole" />
              </svg>{" "}
              <span>{interp(v.accountPrivateLabel13)}</span>
            </span>
            <button className="text-button" onClick={v.manageAccounts12}>
              Manage model accounts{" "}
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
          </footer>
        </section>
      </>
    ) : null
  );
}
