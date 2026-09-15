/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import { MessageText } from "../message-text";

export function PageConversationInspector({ v }: { v: Vals }) {
  return (
    v.inspectorShown16 ? (
      <>
        <aside
          className={`inspector10 inspector11 inspector12 inspector13 ${v.inspectorClass10}`}
          style={css(v.paneStyle11)}
          aria-label="Conversation inspector"
        >
          <div
            className="pane-divider11"
            role="separator"
            tabIndex={0}
            aria-label="Resize conversation pane"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={v.paneMax11}
            aria-valuenow={v.paneWidth11}
            onPointerDown={v.dragPane11}
            onKeyDown={v.resizeKey11}
            onDoubleClick={v.resetPane11}
          />
          <header>
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
                <use href="/i15.svg#panel-right" />
              </svg>
              {interp(v.inspectorScope10)}
            </span>
            <div className="pane-window11">
              <button className="icon-button" aria-label="Expand conversation pane" onClick={v.expandPane11}>
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
                  <use href="/i15.svg#maximize-2" />
                </svg>
              </button>
              <button className="icon-button" aria-label="Close conversation inspector" onClick={v.collapsePane11}>
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
                  <use href="/i15.svg#panel-right-close" />
                </svg>
              </button>
            </div>
          </header>
          <div className="itabs-wrap19">
            <nav className="inspector-tabs10 itabs19" aria-label="Conversation context tabs">
              {(v.inspectorTabs12 ?? []).map((t: any, i: number) => (
                <Fragment key={i}>
                  <button className={t.cls} onClick={t.pick}>
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
                      <use href={t.icon19} />
                    </svg>
                    <span>{interp(t.label)}</span>
                  </button>
                </Fragment>
              ))}
            </nav>
          </div>
          <div className="inspector-content10">
            {v.routineRunPane16 ? (
              <>
                <div className="rr16">
                  <div className="pane-eyebrow13">
                    <span>{interp(v.rrRoutine16)}</span>
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
                        <use href="/i15.svg#history" />
                      </svg>{" "}
                      Run {interp(v.rrNumber16)}
                    </span>
                  </div>
                  <div className="rr-head16">
                    <span className={`rt-runmark16 ${v.rrTone16}`}>
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
                        <use href={v.rrIcon16} />
                      </svg>
                    </span>
                    <div>
                      <h2>{interp(v.rrTitle16)}</h2>
                      <p>
                        {interp(v.rrWhen16)} · <span className={`rt-runstate16 ${v.rrTone16}`}>{interp(v.rrState16)}</span>
                      </p>
                    </div>
                  </div>
                  {v.rrRunTab16 ? (
                    <>
                      <p className="rr-detail16">{interp(v.rrDetail16)}</p>
                      {v.rrHasIssues16 ? (
                        <>
                          <div className="rr-issues16">
                            <span className="rr-issueslabel16">
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
                              {interp(v.rrIssuesLabel16)}
                            </span>
                            {(v.rrIssues16 ?? []).map((i: any, ix: number) => (
                              <Fragment key={ix}>
                                <button type="button" className="rr-issue16" onClick={i.open}>
                                  <span className="rr-issueid16">{interp(i.id)}</span>
                                  <span className="rr-issuetitle16">{interp(i.title)}</span>
                                  <em className={`rt-runstate16 ${i.tone}`}>{interp(i.state)}</em>
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
                              </Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                      <div className="rr-facts16">
                        {(v.rrFacts16 ?? []).map((f: any, i: number) => (
                          <Fragment key={i}>
                            <span className="rr-fact16">
                              <small>{interp(f.k)}</small>
                              <strong>{interp(f.v)}</strong>
                            </span>
                          </Fragment>
                        ))}
                      </div>
                      <h3 className="rr-h16">What happened</h3>
                      <ol className="rr-steps16">
                        {(v.rrSteps16 ?? []).map((s: any, i: number) => (
                          <Fragment key={i}>
                            <li className={`rr-step16 ${s.tone}`}>
                              <span className="rr-dot16">
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
                                  <use href={s.icon} />
                                </svg>
                              </span>
                              <span className="rr-stepbody16">
                                <strong>{interp(s.title)}</strong>
                                <small>{interp(s.copy)}</small>
                              </span>
                              <time>{interp(s.at)}</time>
                            </li>
                          </Fragment>
                        ))}
                      </ol>
                      {v.rrHasOutput16 ? (
                        <>
                          <h3 className="rr-h16">{interp(v.rrOutputTitle16)}</h3>
                          <blockquote className="rr-out16">
                            <img src="/assets/agents/operator.svg" alt="" />
                            <p>{interp(v.rrOutput16)}</p>
                          </blockquote>
                        </>
                      ) : null}
                      <div className="rr-acts16">
                        {v.rrHasIssue16 ? (
                          <>
                            <button className="small-button primary" onClick={v.rrOpenIssue16}>
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
                              Open {interp(v.rrIssue16)}
                            </button>
                          </>
                        ) : null}
                        {v.rrCanRetry16 ? (
                          <>
                            <button className="small-button primary" onClick={v.rrRetry16}>
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
                                <use href="/i15.svg#rotate-ccw" />
                              </svg>
                              {interp(v.rrRetryLabel16)}
                            </button>
                          </>
                        ) : null}
                        <button className="small-button" onClick={v.rrAsk16}>
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
                          Ask about this run
                        </button>
                      </div>
                    </>
                  ) : null}
                  {v.rrConvTab16 ? (
                    <>
                      <div className="rt-reading16 rr-thread16" aria-label="Full run transcript">
                        <div className="rt-readintro16">
                          <p>{interp(v.rrOutcome16)}</p>
                          <small>{interp(v.rrConvSub16)}</small>
                        </div>
                        <ol className="rt-thread16" aria-label="Run conversation">
                          {(v.rrEntries16 ?? []).map((e: any, i: number) => (
                            <Fragment key={i}>
                              <li className={`rt-entry16 ${e.cls}`}>
                                {e.isSay ? (
                                  <>
                                    <header className="rt-say16">
                                      {e.isOperator ? (
                                        <>
                                          <img src="/assets/logo/botinc-mark.svg" alt="" />
                                        </>
                                      ) : null}
                                      {e.isAgent ? (
                                        <>
                                          <img className="rr-agent16" src={e.avatar} alt="" />
                                        </>
                                      ) : null}
                                      {e.isHuman ? (
                                        <>
                                          <span className="rt-person16">{interp(e.initial)}</span>
                                        </>
                                      ) : null}
                                      <strong>{interp(e.who)}</strong>
                                      <time>{interp(e.time)}</time>
                                    </header>
                                    <p>{interp(e.text)}</p>
                                  </>
                                ) : null}
                                {e.isTools ? (
                                  <>
                                    <div className="tg16">
                                      <button
                                        type="button"
                                        className="tg-head16"
                                        aria-expanded={e.open}
                                        aria-label={e.aria}
                                        onClick={e.toggle}
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
                                          <use href={e.icon} />
                                        </svg>
                                        <span>{interp(e.label)}</span>
                                        <small>{interp(e.meta)}</small>
                                        <time>{interp(e.time)}</time>
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
                                      {e.open ? (
                                        <>
                                          <div className="tg-body16">
                                            <time>{interp(e.time)}</time>
                                            {(e.rows ?? []).map((t: any, i: number) => (
                                              <Fragment key={i}>
                                                <div className={`tg-row16 ${t.cls}`}>
                                                  <div className="tg-line16">
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
                                                    <code>{interp(t.title)}</code>
                                                    <small>{interp(t.meta)}</small>
                                                    {t.hasState ? (
                                                      <>
                                                        <em className={t.tone}>{interp(t.state)}</em>
                                                      </>
                                                    ) : null}
                                                  </div>
                                                  {t.hasOut ? (
                                                    <>
                                                      <pre className="tg-out16">{interp(t.out)}</pre>
                                                    </>
                                                  ) : null}
                                                </div>
                                              </Fragment>
                                            ))}
                                          </div>
                                        </>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                                {e.isResult ? (
                                  <>
                                    <div className="rs16">
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
                                          <use href={e.icon} />
                                        </svg>
                                        <strong>{interp(e.title)}</strong>
                                        <time>{interp(e.time)}</time>
                                      </header>
                                      <p>{interp(e.text)}</p>
                                      <div className="rs-facts16">
                                        {(e.facts ?? []).map((f: any, i: number) => (
                                          <Fragment key={i}>
                                            <div className="rs-fact16">
                                              <span>{interp(f.k)}</span>
                                              <b>{interp(f.v)}</b>
                                            </div>
                                          </Fragment>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                ) : null}
                              </li>
                            </Fragment>
                          ))}
                        </ol>
                      </div>
                      <div className="rt-details16">
                        <button
                          type="button"
                          className="rt-dhead16"
                          aria-expanded={v.rrDetailsOpen16}
                          aria-label="Run details, timestamps and cost"
                          onClick={v.rrToggleDetails16}
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
                            <use href="/i15.svg#info" />
                          </svg>
                          <span>Details</span>
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
                        {v.rrDetailsOpen16 ? (
                          <>
                            <div className="rt-dbody16">
                              <div className="rt-dl16">
                                {(v.rrDetails16 ?? []).map((d: any, i: number) => (
                                  <Fragment key={i}>
                                    <div className="rt-drow16">
                                      <span>{interp(d.k)}</span>
                                      <b>{interp(d.v)}</b>
                                    </div>
                                  </Fragment>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                      <button className="small-button rr-convask16" onClick={v.rrAsk16}>
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
                        Ask about this run
                      </button>
                    </>
                  ) : null}
                  {v.rrFilesTab16 ? (
                    <>
                      <p className="rr-detail16">{interp(v.rrFilesNote16)}</p>
                      <div className="rr-files16">
                        {(v.rrFiles16 ?? []).map((f: any, i: number) => (
                          <Fragment key={i}>
                            <button type="button" className="rr-file16" onClick={f.open}>
                              <span className="rr-filemark16">
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
                                  <use href={f.icon} />
                                </svg>
                              </span>
                              <span className="rr-filebody16">
                                <strong>{interp(f.name)}</strong>
                                <small>{interp(f.meta)}</small>
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
                      </div>
                      {v.rrNoFiles16 ? (
                        <>
                          <p className="fine">No files. The run stopped before producing anything.</p>
                        </>
                      ) : null}
                    </>
                  ) : null}
                  {v.rrUsageTab16 ? (
                    <>
                      <section className="receipt13">
                        <header>
                          <span>This run</span>
                          <span className="receipt-badge13">{interp(v.rrState16)}</span>
                        </header>
                        <strong>{interp(v.rrCost16)}</strong>
                        <div className="budget13">
                          <i style={css(v.rrBudgetStyle16)} />
                        </div>
                        <footer>
                          <span>{interp(v.rrLimit16)} per-run limit</span>
                          <span>{interp(v.rrBudgetLeft16)} under the limit</span>
                        </footer>
                      </section>
                      <div className="funding-breakdown13">
                        {(v.rrUsageRows16 ?? []).map((u: any, i: number) => (
                          <Fragment key={i}>
                            <div>
                              {u.hasLogo ? (
                                <>
                                  <img className="brand12" src={u.logo} alt="" />
                                </>
                              ) : null}
                              {!u.hasLogo ? (
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
                                    <use href={u.icon} />
                                  </svg>
                                </>
                              ) : null}
                              <span>
                                <strong>{interp(u.title)}</strong>
                                <small>{interp(u.copy)}</small>
                              </span>
                              <strong>{interp(u.amount)}</strong>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <dl className="rt-dl16 rr-usagedl16">
                        {(v.rrUsageFacts16 ?? []).map((d: any, i: number) => (
                          <Fragment key={i}>
                            <div className="rt-dlrow16">
                              <dt>{interp(d.k)}</dt>
                              <dd>
                                <strong>{interp(d.v)}</strong>
                              </dd>
                            </div>
                          </Fragment>
                        ))}
                      </dl>
                      <p className="fine">
                        Charged to {interp(v.rrFunded16)}. Subscription work is never converted into credit.
                      </p>
                    </>
                  ) : null}
                  <p className="fine">{interp(v.rrFoot16)}</p>
                </div>
              </>
            ) : null}
            {v.backToRun16 ? (
              <>
                <button type="button" className="rt-return16" onClick={v.backToRun16Go}>
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
                  </svg>
                  <span>Back to {interp(v.backToRunLabel16)}</span>
                </button>
              </>
            ) : null}
            {v.issuePane12 ? (
              <>
                <div className="issue-pane13">
                  <div className="pane-eyebrow13">
                    <span>{interp(v.inspectorId10)}</span>
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
                        <use href="/i15.svg#users" />
                      </svg>{" "}
                      Shared issue
                    </span>
                  </div>
                  <h2>{interp(v.inspectorTitle10)}</h2>
                  <div className="properties13">
                    <div>
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
                      <span>Status</span>
                      <button
                        type="button"
                        className={`sel14 ${v.m14_issueStatus12?.cls}`}
                        aria-haspopup="listbox"
                        aria-expanded={v.m14_issueStatus12?.expanded}
                        aria-label="Issue status"
                        onClick={v.m14_issueStatus12?.pick}
                      >
                        <svg
                          className="ui-icon use14 sticon16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href={v.m14_issueStatus12?.icon16} />
                        </svg>
                        <span>{interp(v.m14_issueStatus12?.label)}</span>
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
                    <div>
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
                        <use href="/i15.svg#users" />
                      </svg>
                      <span>Assignee</span>
                      <button
                        type="button"
                        className={`sel14 ${v.m14_issueAssignee12?.cls}`}
                        aria-haspopup="listbox"
                        aria-expanded={v.m14_issueAssignee12?.expanded}
                        aria-label="Issue assignee"
                        onClick={v.m14_issueAssignee12?.pick}
                      >
                        <span>{interp(v.m14_issueAssignee12?.label)}</span>
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
                    <div>
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
                      <span>Priority</span>
                      <button
                        type="button"
                        className={`sel14 ${v.m14_issuePriority12?.cls}`}
                        aria-haspopup="listbox"
                        aria-expanded={v.m14_issuePriority12?.expanded}
                        aria-label="Issue priority"
                        onClick={v.m14_issuePriority12?.pick}
                      >
                        <span>{interp(v.m14_issuePriority12?.label)}</span>
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
                    <div>
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
                        <use href="/i15.svg#folder" />
                      </svg>
                      <span>Project</span>
                      <strong>{interp(v.inspectorProject10)}</strong>
                    </div>
                    <div>
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
                      <span>Created</span>
                      <strong>{interp(v.created12)}</strong>
                    </div>
                    <div>
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
                        <use href="/i15.svg#history" />
                      </svg>
                      <span>Updated</span>
                      <strong>{interp(v.updated12)}</strong>
                    </div>
                  </div>
                  <section className="pane-section13">
                    <h3>About this work</h3>
                    <MessageText text={String(v.inspectorDescription10 ?? "")} />
                    <details className="criteria13">
                      <summary>
                        Acceptance criteria <span>{interp(v.criteriaCount13)}</span>
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
                      </summary>
                      {(v.criteria13 ?? []).map((c: any, i: number) => (
                        <Fragment key={i}>
                          <p>
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
                            {interp(c.text)}
                          </p>
                        </Fragment>
                      ))}
                    </details>
                  </section>
                  <section className="pane-section13 relations13">
                    <header>
                      <h3>Related work</h3>
                      <button className="icon-button" aria-label="Add subissue" onClick={v.addSubissue12}>
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
                    </header>
                    {v.hasParent12 ? (
                      <>
                        <button onClick={v.openParent12}>
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
                            <use href="/i15.svg#corner-up-left" />
                          </svg>
                          <span>
                            <small>Parent</small>
                            <strong>{interp(v.parentTitle12)}</strong>
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
                      </>
                    ) : null}
                    {(v.subissues12 ?? []).map((c: any, i: number) => (
                      <Fragment key={i}>
                        <button onClick={c.open}>
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
                            <use href={c.icon} />
                          </svg>
                          <span>
                            <small>
                              {interp(c.id)} · {interp(c.status)}
                            </small>
                            <strong>{interp(c.title)}</strong>
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
                    {v.noSubissues12 ? (
                      <>
                        <button className="subissue-empty13" onClick={v.addSubissue12}>
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
                            <use href="/i15.svg#list-tree" />
                          </svg>{" "}
                          Add a subissue
                        </button>
                      </>
                    ) : null}
                    {v.hasPR12 ? (
                      <>
                        <button onClick={v.prTab12}>
                          <img className="brand12 mono12" src="/assets/brands-v12/github.svg" alt="GitHub" />
                          <span>
                            <small>Pull request · {interp(v.prState12)}</small>
                            <strong>
                              {interp(v.issuePR13)} <i>·</i> {interp(v.prChecksSummary12)}
                            </strong>
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
                      </>
                    ) : null}
                  </section>
                  <section className="pane-section13 origin13">
                    <h3>Origin & ownership</h3>
                    <div className="origin-line13">
                      <img className={`brand12 ${v.sourceBrandClass12}`} src={v.sourceBrand12} alt="" />
                      <span>
                        <strong>{interp(v.source12)}</strong>
                        <small>{interp(v.sourceNote13)}</small>
                      </span>
                    </div>
                    <dl>
                      <dt>Runs as</dt>
                      <dd>
                        {interp(v.executionOwner12)} <span>· Personal accounts</span>
                      </dd>
                    </dl>
                  </section>
                  <section className="pane-section13">
                    <header>
                      <h3>Activity</h3>
                      <button className="text-button" onClick={v.toggleHistory13}>
                        {interp(v.historyToggle13)}
                      </button>
                    </header>
                    {(v.historyRows13 ?? []).map((e: any, i: number) => (
                      <Fragment key={i}>
                        <div className="history-line13">
                          <i />
                          <span>
                            {interp(e.text)}
                            <small>{interp(e.when)}</small>
                          </span>
                        </div>
                      </Fragment>
                    ))}
                  </section>
                </div>
              </>
            ) : null}
            {v.prListOpen16 ? (
              <>
                <div className="pane-title13">
                  <span className="n9-overline">
                    {interp(v.inspectorId10)} · {interp(v.prRepository12)}
                  </span>
                  <h2>Pull requests</h2>
                  <p>{interp(v.prListNote16)}</p>
                </div>
                <div className="prl16">
                  {(v.prRows16 ?? []).map((r: any, i: number) => (
                    <Fragment key={i}>
                      <button type="button" className="prl-row16" onClick={r.open}>
                        <span className="prl-top16">
                          <span className={`prl-badge16 ${r.stateTone16}`}>
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
                              <use href={r.stateIcon16} />
                            </svg>
                            {interp(r.stateWord16)}
                          </span>
                          <span className="prl-num16">{interp(r.number)}</span>
                        </span>
                        <strong className="prl-title16">{interp(r.title)}</strong>
                        <span className="prl-branch16">{interp(r.branch)}</span>
                        <span className="prl-facts16">
                          <span className={`prl-fact16 ${r.checksTone}`}>
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
                              <use href={r.checksIcon} />
                            </svg>
                            {interp(r.checks)}
                          </span>
                          <span className={`prl-fact16 ${r.reviewTone}`}>
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
                              <use href="/i15.svg#users" />
                            </svg>
                            {interp(r.review)}
                          </span>
                          <span className="prl-fact16">
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
                            {interp(r.comments)}
                          </span>
                          <span className="prl-fact16">
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
                              <use href="/i15.svg#file-code" />
                            </svg>
                            {interp(r.files)}
                          </span>
                          <span className="prl-fact16">{interp(r.lines16)}</span>
                          <span className="prl-diff16">
                            <b className="add16">{interp(r.add16)}</b>
                            <b className="del16">{interp(r.del16)}</b>
                          </span>
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <p className="fine">Nothing merges itself. A pull request is merged from its own page.</p>
              </>
            ) : null}
            {v.prPane12 ? (
              <>
                {v.livePrPane19 ? (
                  <div className="live-pr19">
                    <img className="brand12 mono12" src="/assets/brands-v12/github.svg" alt="GitHub" />
                    {v.livePrURL19 ? (
                      <>
                        <span className="n9-overline">{interp(v.livePrRepository19)}</span>
                        <h2>Pull request {interp(v.livePrNumber19)}</h2>
                        <p>This link was recovered from the migrated conversation. Open GitHub for its current checks, reviews, and merge state.</p>
                        <a className="small-button primary" href={v.livePrURL19} target="_blank" rel="noreferrer noopener">
                          Open in GitHub
                          <svg className="ui-icon use14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <use href="/i15.svg#arrow-up-right" />
                          </svg>
                        </a>
                      </>
                    ) : (
                      <>
                        <span className="n9-overline">GitHub</span>
                        <h2>No pull request linked</h2>
                        <p>No GitHub pull request URL was found in this work conversation. Links in migrated messages remain available in the timeline.</p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                <button type="button" className="text-button prl-back16" onClick={v.prCloseDetail16}>
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
                  Pull requests
                </button>
                <div className="pr-heading12">
                  <div>
                    <img className="brand12 mono12" src="/assets/brands-v12/github.svg" alt="GitHub" />
                    <span>{interp(v.prRepository12)}</span>
                    <span className={`pr-state12 ${v.prTone12}`}>{interp(v.prState12)}</span>
                  </div>
                  <h2>{interp(v.prTitle12)}</h2>
                  <p>{interp(v.prBranch12)}</p>
                </div>
                <nav className="pr-tabs12">
                  {(v.prTabs12 ?? []).map((t: any, i: number) => (
                    <Fragment key={i}>
                      <button className={t.cls} onClick={t.pick}>
                        {interp(t.label)}
                      </button>
                    </Fragment>
                  ))}
                </nav>
                {v.prOverview12 ? (
                  <>
                    <p>{interp(v.resultSummary10)}</p>
                    <div className="pr-facts12">
                      <button onClick={v.prChecks12}>
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
                        <span>
                          <strong>{interp(v.prChecksSummary12)}</strong>
                          <small>For {interp(v.prHead12)}</small>
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
                      <button onClick={v.prReviews12}>
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
                          <use href="/i15.svg#users" />
                        </svg>
                        <span>
                          <strong>{interp(v.prReviewSummary12)}</strong>
                          <small>Independent review attached</small>
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
                      <div>
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
                          <use href="/i15.svg#git-merge" />
                        </svg>
                        <span>
                          <strong>{interp(v.prMergeability12)}</strong>
                          <small>{interp(v.prMergeDetail12)}</small>
                        </span>
                      </div>
                    </div>
                    <div className="merge12">
                      {v.prMerged12 ? (
                        <>
                          <strong>
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
                              <use href="/i15.svg#git-merge" />
                            </svg>{" "}
                            Merged into development
                          </strong>
                          <p>Deployment is a separate step.</p>
                        </>
                      ) : null}
                      {!v.prMerged12 ? (
                        <>
                          <label>
                            Merge method
                            <button
                              type="button"
                              className={`sel14 ${v.m14_mergeMethod12?.cls}`}
                              aria-haspopup="listbox"
                              aria-expanded={v.m14_mergeMethod12?.expanded}
                              aria-label="Merge method"
                              onClick={v.m14_mergeMethod12?.pick}
                            >
                              <span>{interp(v.m14_mergeMethod12?.label)}</span>
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
                          <button className="small-button primary" disabled={!v.canMerge12} onClick={v.prepareMerge12}>
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
                              <use href="/i15.svg#git-merge" />
                            </svg>{" "}
                            Review merge
                          </button>
                          <p>{interp(v.mergeGate12)}</p>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                {v.prFiles12 ? (
                  <>
                    <p className="fine">
                      {interp(v.prHead12)} · {interp(v.prFileCount12)} changed files
                    </p>
                    {(v.resultFiles10 ?? []).map((f: any, i: number) => (
                      <Fragment key={i}>
                        <details className="diff10" open={v.true11}>
                          <summary>
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
                              <use href="/i15.svg#file-code" />
                            </svg>
                            {interp(f.name)}
                            <span className="diff-stat16">
                              <b className="add16">+{interp(f.add)}</b>
                              <b className="del16">&#8722;{interp(f.remove)}</b>
                            </span>
                          </summary>
                          <div className="dv16" aria-label="Diff">
                            {(f.diffLines16 ?? []).map((d: any, i: number) => (
                              <Fragment key={i}>
                                <span className={`dv-row16 ${d.cls}`}>
                                  <span className="dv-n16">{interp(d.n)}</span>
                                  <span className="dv-s16">{interp(d.sign)}</span>
                                  <code className="dv-t16">{interp(d.text)}</code>
                                </span>
                              </Fragment>
                            ))}
                          </div>
                          <button className="text-button diff-comment12" onClick={f.comment12}>
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
                            </svg>{" "}
                            Comment on this file
                          </button>
                        </details>
                      </Fragment>
                    ))}
                  </>
                ) : null}
                {v.prChecksPane12 ? (
                  <>
                    <p className="fine">
                      Checks for {interp(v.prHead12)} · {interp(v.prFresh12)}
                    </p>
                    {(v.prCheckRows12 ?? []).map((c: any, i: number) => (
                      <Fragment key={i}>
                        <details className="check12">
                          <summary>
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
                              <use href={c.icon} />
                            </svg>
                            <span>{interp(c.name)}</span>
                            <small>{interp(c.state)}</small>
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
                          </summary>
                          <pre>{interp(c.log)}</pre>
                        </details>
                      </Fragment>
                    ))}
                  </>
                ) : null}
                {v.prCommits12 ? (
                  <>
                    {(v.prCommitRows12 ?? []).map((c: any, i: number) => (
                      <Fragment key={i}>
                        <button className="commit12" onClick={c.open}>
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
                            <use href="/i15.svg#git-commit-horizontal" />
                          </svg>
                          <span>
                            <strong>{interp(c.title)}</strong>
                            <small>
                              {interp(c.author)} · {interp(c.when)}
                            </small>
                          </span>
                          <code>{interp(c.sha)}</code>
                        </button>
                      </Fragment>
                    ))}
                  </>
                ) : null}
                {v.prCommitDetail12 ? (
                  <>
                    <button className="text-button" onClick={v.backCommits12}>
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
                      All commits
                    </button>
                    <h3 className="commit-title12">{interp(v.prCommitTitle12)}</h3>
                    <p className="fine">
                      {interp(v.prCommitSha12)} · {interp(v.prCommitMeta12)}
                    </p>
                    {(v.prCommitFiles12 ?? []).map((f: any, i: number) => (
                      <Fragment key={i}>
                        <details className="diff10" open={v.true11}>
                          <summary>
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
                              <use href="/i15.svg#file-code" />
                            </svg>
                            {interp(f.name)}
                          </summary>
                          <pre>{interp(f.preview)}</pre>
                        </details>
                      </Fragment>
                    ))}
                  </>
                ) : null}
                {v.prReviewsPane12 ? (
                  <>
                    {(v.prReviewRows12 ?? []).map((r: any, i: number) => (
                      <Fragment key={i}>
                        <article className="review12">
                          <header>
                            <span>{interp(r.author)}</span>
                            <strong>{interp(r.state)}</strong>
                          </header>
                          <p>{interp(r.text)}</p>
                          <small>
                            {interp(r.head)} · {interp(r.when)}
                          </small>
                        </article>
                      </Fragment>
                    ))}
                    <button className="small-button" onClick={v.requestChanges9}>
                      Request changes
                    </button>
                  </>
                ) : null}
                <p className="preview-note12">Pull-request activity from the connected repository</p>
                  </>
                )}
              </>
            ) : null}
            {v.wfPane18 ? (
              <>
                <div className="wfp18">
                  <div className="pane-title13">
                    <span className="n9-overline">
                      {interp(v.inspectorId10)} · {interp(v.wfPaneVersion18)}
                    </span>
                    <h2>{interp(v.wfPaneName18)}</h2>
                    <p>{interp(v.wfPaneLede18)}</p>
                  </div>
                  <section className={`wfp-now18 ${v.wfLiveTone18}`} aria-live="polite">
                    <span className="wfp-nowdot18" />
                    <div>
                      <small>{interp(v.wfNowEyebrow18)}</small>
                      <strong>{interp(v.wfNowTitle18)}</strong>
                      <p>{interp(v.wfNowCopy18)}</p>
                    </div>
                    {v.wfNowHasAction18 ? (
                      <>
                        <button type="button" className="small-button primary" onClick={v.wfNowAction18}>
                          {interp(v.wfNowActionLabel18)}
                        </button>
                      </>
                    ) : null}
                  </section>
                  <ol className="wfp-steps18" aria-label="Workflow steps">
                    {(v.wfSteps18 ?? []).map((st: any, i: number) => (
                      <Fragment key={i}>
                        <li className={`wfp-step18 ${st.cls}`}>
                          <button type="button" className="wfp-stephead18" aria-expanded={st.open} onClick={st.toggle}>
                            <span className="wfp-mark18">
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
                                <use href={st.icon} />
                              </svg>
                            </span>
                            <span className="wfp-body18">
                              <strong>{interp(st.label)}</strong>
                              <small>{interp(st.detail)}</small>
                            </span>
                            <span className="wfp-state18">{interp(st.state)}</span>
                          </button>
                          {st.open ? (
                            <>
                              <div className="wfp-more18">
                                {(st.facts ?? []).map((f: any, i: number) => (
                                  <Fragment key={i}>
                                    <span className="wfp-fact18">
                                      <small>{interp(f.k)}</small>
                                      <b>{interp(f.v)}</b>
                                    </span>
                                  </Fragment>
                                ))}
                                {st.hasNote ? (
                                  <>
                                    <p className="wfp-note18">{interp(st.note)}</p>
                                  </>
                                ) : null}
                                {st.hasRun ? (
                                  <>
                                    <button type="button" className="text-button" onClick={st.openRun}>
                                      Open thread{" "}
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
                              </div>
                            </>
                          ) : null}
                        </li>
                      </Fragment>
                    ))}
                  </ol>
                  <div className="wfp-foot18">
                    <span>{interp(v.wfSpend18)}</span>
                    <button type="button" className="text-button" onClick={v.openIssueWorkflow17}>
                      Open in editor{" "}
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
                  </div>
                </div>
              </>
            ) : null}
            {v.runsPane12 ? (
              <>
                {v.livePrPane19 ? (
                  <div className="live-runs19">
                    <div className="pane-section-heading11">
                      <span className="n9-overline">{interp(v.inspectorId10)}</span>
                      <h2>Runs</h2>
                      <p>{interp(v.workflowRunSummary12)}</p>
                    </div>
                    {(v.liveRunRows19 ?? []).map((run: any) => (
                      <article className="live-run19" key={run.id}>
                        <header><strong>{interp(run.purpose)}</strong><span>{interp(run.status)}</span></header>
                        <p>{interp(run.model)} · {interp(run.cost)}</p>
                        <time>{interp(run.when)}</time>
                        {run.error ? <small>{interp(run.error)}</small> : null}
                      </article>
                    ))}
                    {!v.liveRunRows19?.length ? <p className="fine">No v2 execution has been recorded for this work yet.</p> : null}
                  </div>
                ) : (
                  <>
                {!v.runThreadOpen16 ? (
                  <>
                    <div className="rl16">
                      <div className="pane-section-heading11">
                        <span className="n9-overline">{interp(v.inspectorId10)}</span>
                        <h2>Runs &amp; reviews</h2>
                        <p>{interp(v.workflowRunSummary12)}</p>
                      </div>
                      {(v.runList16 ?? []).map((r: any, i: number) => (
                        <Fragment key={i}>
                          <div className={`rl-item16 ${r.cls}`}>
                            <div className="rl-row16">
                              <button type="button" className="rl-main16" aria-label={r.aria} onClick={r.open}>
                                <span className="rl-head16">
                                  <img className={`brand12 ${r.brandClass12}`} src={r.brand12} alt="" />
                                  <strong>{interp(r.stage)}</strong>
                                  <em className={r.tone}>{interp(r.status)}</em>
                                </span>
                                <span className="rl-outcome16">{interp(r.outcome)}</span>
                              </button>
                              <div className="rl-foot16">
                                <small>
                                  {interp(r.model)} · {interp(r.costLabel)}
                                </small>
                                <button type="button" className="rl-thread16" aria-label={r.aria} onClick={r.open}>
                                  Open thread{" "}
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
                              </div>
                            </div>
                            {r.hasChildren ? (
                              <>
                                <div className="rl-kids16">
                                  <button
                                    type="button"
                                    className="rl-kidhead16"
                                    aria-expanded={r.childOpen}
                                    aria-label={r.childAria}
                                    onClick={r.toggleChildren}
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
                                      <use href="/i15.svg#waypoints" />
                                    </svg>
                                    <span>{interp(r.childLabel)}</span>
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
                                  {r.childOpen ? (
                                    <>
                                      <div className="rl-kidlist16">
                                        {(r.children ?? []).map((c: any, i: number) => (
                                          <Fragment key={i}>
                                            <button type="button" className="rl-kid16" aria-label={c.aria} onClick={c.open}>
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
                                                <use href={c.icon} />
                                              </svg>
                                              <span>
                                                <strong>{interp(c.stage)}</strong>
                                                <small>
                                                  {interp(c.model)} · {interp(c.detail)}
                                                </small>
                                              </span>
                                              <em className={c.tone}>{interp(c.status)}</em>
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
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </>
                            ) : null}
                          </div>
                        </Fragment>
                      ))}
                      <div className="wfu16">
                        <span className="wfu-head16">
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
                            <use href="/i15.svg#git-branch" />
                          </svg>
                          <strong>{interp(v.wfuName16)}</strong>
                          <em>{interp(v.wfuStamp16)}</em>
                        </span>
                        <span className="wfu-rows16">
                          {(v.wfuRows16 ?? []).map((w: any, i: number) => (
                            <Fragment key={i}>
                              <span className="wfu-row16">
                                <span>{interp(w.k)}</span>
                                <b>{interp(w.v)}</b>
                              </span>
                            </Fragment>
                          ))}
                        </span>
                      </div>
                      <button className="text-button" onClick={v.workflowSettings12}>
                        Workflow settings{" "}
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
                {v.runThreadOpen16 ? (
                  <>
                    <div className="rt16">
                      <div className="rt-fixed16">
                        <nav className="rt-crumb16" aria-label="Run thread breadcrumb">
                          <button
                            type="button"
                            className="rt-back16"
                            aria-label={v.rtBackAria16}
                            onClick={v.rtBackAction16}
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
                              <use href="/i15.svg#arrow-left" />
                            </svg>
                            <span>{interp(v.rtBackText16)}</span>
                          </button>
                          <strong className="rt-navtitle16">{interp(v.rtTitle16)}</strong>
                          <span className={`rt-state16 ${v.rtTone16}`}>{interp(v.rtStatus16)}</span>
                        </nav>
                        <div className="rt-bar16">
                          {v.rtHasAttempts16 ? (
                            <>
                              <button
                                type="button"
                                className="sel14 rt-attempt16"
                                aria-haspopup="listbox"
                                aria-label="Run attempt"
                                onClick={v.rtAttemptPick16}
                              >
                                <span>{interp(v.rtAttemptLabel16)}</span>
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
                          <button
                            type="button"
                            className="text-button"
                            aria-label={v.rtToggleAllAria16}
                            onClick={v.rtToggleAll16}
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
                              <use href="/i15.svg#chevrons-up-down" />
                            </svg>
                            {interp(v.rtToggleAllLabel16)}
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label="Find in this thread"
                            aria-expanded={v.rtFindOpen16}
                            onClick={v.rtToggleFind16}
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
                              <use href="/i15.svg#search" />
                            </svg>
                          </button>
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
                          <button type="button" className="text-button" onClick={v.rtLatest16}>
                            Latest update{" "}
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
                              <use href="/i15.svg#arrow-down" />
                            </svg>
                          </button>
                        </div>
                        {v.rtFindOpen16 ? (
                          <>
                            <label className="rt-find16">
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
                                aria-label="Find in this run thread"
                                placeholder="Find in this thread"
                                value={v.rtFind16}
                                onInput={v.rtEditFind16}
                              />
                              <small>{interp(v.rtFindCount16)}</small>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Clear the search"
                                onClick={v.rtClearFind16}
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
                            </label>
                          </>
                        ) : null}
                      </div>
                      <div className="rt-reading16" aria-label="Full run transcript" tabIndex={0}>
                        <div className="rt-readintro16">
                          <p>{interp(v.rtOutcome16)}</p>
                          <small>
                            {interp(v.rtSub16)} · {interp(v.rtCountLabel16)}
                          </small>
                        </div>
                        {v.rtAttemptNote16 ? (
                          <>
                            <p className="rt-note16">
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
                                <use href="/i15.svg#info" />
                              </svg>
                              {interp(v.rtAttemptNote16)}
                            </p>
                          </>
                        ) : null}
                        <ol className="rt-thread16" aria-label="Run conversation">
                          {(v.rtEntries16 ?? []).map((e: any, i: number) => (
                            <Fragment key={i}>
                              <li className={`rt-entry16 ${e.cls}`}>
                                {e.isSay ? (
                                  <>
                                    {e.steer ? (
                                      <>
                                        <span className="rt-steer16">
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
                                          {interp(e.steerLabel)}
                                        </span>
                                      </>
                                    ) : null}
                                    <header className="rt-say16">
                                      {e.isOperator ? (
                                        <>
                                          <img src="/assets/logo/botinc-mark.svg" alt="" />
                                        </>
                                      ) : null}
                                      {e.isHuman ? (
                                        <>
                                          <span className="rt-person16">{interp(e.initial)}</span>
                                        </>
                                      ) : null}
                                      <strong>{interp(e.who)}</strong>
                                      <time>{interp(e.time)}</time>
                                    </header>
                                    <p>{interp(e.text)}</p>
                                  </>
                                ) : null}
                                {e.isTools ? (
                                  <>
                                    <div className="tg16">
                                      <button
                                        type="button"
                                        className="tg-head16"
                                        aria-expanded={e.open}
                                        aria-label={e.aria}
                                        onClick={e.toggle}
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
                                          <use href={e.icon} />
                                        </svg>
                                        <span>{interp(e.label)}</span>
                                        <small>{interp(e.meta)}</small>
                                        <time>{interp(e.time)}</time>
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
                                      {e.open ? (
                                        <>
                                          <div className="tg-body16">
                                            <time>{interp(e.time)}</time>
                                            {(e.rows ?? []).map((t: any, i: number) => (
                                              <Fragment key={i}>
                                                <div className={`tg-row16 ${t.cls}`}>
                                                  <div className="tg-line16">
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
                                                    <code>{interp(t.title)}</code>
                                                    <small>{interp(t.meta)}</small>
                                                    {t.hasState ? (
                                                      <>
                                                        <em className={t.tone}>{interp(t.state)}</em>
                                                      </>
                                                    ) : null}
                                                  </div>
                                                  {t.hasOut ? (
                                                    <>
                                                      <pre className={`tg-out16 ${t.outCls}`}>{interp(t.out)}</pre>
                                                    </>
                                                  ) : null}
                                                  {t.truncated ? (
                                                    <>
                                                      <button
                                                        type="button"
                                                        className="text-button tg-more16"
                                                        aria-label={t.expandAria}
                                                        onClick={t.expand}
                                                      >
                                                        {interp(t.expandLabel)}
                                                      </button>
                                                    </>
                                                  ) : null}
                                                </div>
                                              </Fragment>
                                            ))}
                                          </div>
                                        </>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                                {e.isFinding ? (
                                  <>
                                    <div className="fd16">
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
                                        <use href={e.icon} />
                                      </svg>
                                      <div>
                                        <span className="fd-sev16">{interp(e.sev)} finding</span>
                                        <strong>{interp(e.title)}</strong>
                                        <p>{interp(e.text)}</p>
                                        <code>{interp(e.where)}</code>
                                      </div>
                                      <time>{interp(e.time)}</time>
                                    </div>
                                  </>
                                ) : null}
                                {e.isChild ? (
                                  <>
                                    <div className="rc16">
                                      <button
                                        type="button"
                                        className="rc-head16"
                                        aria-expanded={e.open}
                                        aria-label={e.aria}
                                        onClick={e.toggle}
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
                                          <use href={e.icon} />
                                        </svg>
                                        <span>{interp(e.label)}</span>
                                        <small>{interp(e.meta)}</small>
                                        <time>{interp(e.time)}</time>
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
                                      {e.open ? (
                                        <>
                                          <div className="rc-list16">
                                            {(e.runs ?? []).map((c: any, i: number) => (
                                              <Fragment key={i}>
                                                <div className="rc-item16">
                                                  <button
                                                    type="button"
                                                    className="rc-open16"
                                                    aria-label={c.aria}
                                                    onClick={c.open}
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
                                                      <use href={c.icon} />
                                                    </svg>
                                                    <span>
                                                      <strong>{interp(c.stage)}</strong>
                                                      <small>
                                                        {interp(c.model)} · {interp(c.detail)}
                                                      </small>
                                                    </span>
                                                    <em className={c.tone}>{interp(c.status)}</em>
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
                                                  {c.answered ? (
                                                    <>
                                                      <p className="rc-answered16">
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
                                                        {interp(c.answeredCopy)}
                                                      </p>
                                                    </>
                                                  ) : null}
                                                </div>
                                              </Fragment>
                                            ))}
                                          </div>
                                        </>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                                {e.isResult ? (
                                  <>
                                    <div className="rs16">
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
                                          <use href={e.icon} />
                                        </svg>
                                        <strong>{interp(e.title)}</strong>
                                        <time>{interp(e.time)}</time>
                                      </header>
                                      <p>{interp(e.text)}</p>
                                      <div className="rs-facts16">
                                        {(e.facts ?? []).map((f: any, i: number) => (
                                          <Fragment key={i}>
                                            <div className="rs-fact16">
                                              <span>{interp(f.k)}</span>
                                              <b>{interp(f.v)}</b>
                                            </div>
                                          </Fragment>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                ) : null}
                                {e.isHandoff ? (
                                  <>
                                    <div className="hd16">
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
                                        <use href={e.icon} />
                                      </svg>
                                      <p>{interp(e.text)}</p>
                                      {e.hasNext ? (
                                        <>
                                          <button className="text-button" onClick={e.next}>
                                            {interp(e.nextLabel)}{" "}
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
                                        </>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                                {e.isLive ? (
                                  <>
                                    <div className="lv16">
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
                                        <use href={e.icon} />
                                      </svg>
                                      <span>{interp(e.text)}</span>
                                      <time>{interp(e.time)}</time>
                                    </div>
                                  </>
                                ) : null}
                              </li>
                            </Fragment>
                          ))}
                        </ol>
                        {v.rtNoMatch16 ? (
                          <>
                            <p className="rt-empty16">No entries in this thread match “{interp(v.rtFind16)}”.</p>
                          </>
                        ) : null}
                        {v.rtWaitingChild16 ? (
                          <>
                            <section className="rc-ask16" aria-label="Answer needed for this child run">
                              <p className="rc-q16">{interp(v.rtChildQuestion16)}</p>
                              <p className="rc-why16">{interp(v.rtChildWhy16)}</p>
                              <div className="rc-opts16">
                                {(v.rtChildOptions16 ?? []).map((o: any, i: number) => (
                                  <Fragment key={i}>
                                    <button type="button" className="small-button" onClick={o.pick}>
                                      {interp(o.label)}
                                    </button>
                                  </Fragment>
                                ))}
                              </div>
                            </section>
                          </>
                        ) : null}
                        <div className="rt-details16">
                          <button
                            type="button"
                            className="rt-dhead16"
                            aria-expanded={v.rtDetailsOpen16}
                            aria-label="Run details, timestamps and cost"
                            onClick={v.rtToggleDetails16}
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
                              <use href="/i15.svg#info" />
                            </svg>
                            <span>Details</span>
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
                          {v.rtDetailsOpen16 ? (
                            <>
                              <div className="rt-dbody16">
                                <div className="rt-dl16">
                                  {(v.rtDetails16 ?? []).map((d: any, i: number) => (
                                    <Fragment key={i}>
                                      <div className="rt-drow16">
                                        <span>{interp(d.k)}</span>
                                        <b>{interp(d.v)}</b>
                                      </div>
                                    </Fragment>
                                  ))}
                                </div>
                                <div className="rt-dlinks16">
                                  {(v.rtLinks16 ?? []).map((l: any, i: number) => (
                                    <Fragment key={i}>
                                      <button type="button" className="text-button" onClick={l.go}>
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
                                          <use href={l.icon} />
                                        </svg>
                                        {interp(l.label)}
                                      </button>
                                    </Fragment>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                        {v.rtHasDiscussion16 ? (
                          <>
                            <div className="rt-dlog16">
                              <small className="rt-dnote16">
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
                                  <use href="/i15.svg#lock" />
                                </svg>
                                {interp(v.rtDiscussNote16)}
                              </small>
                              {(v.rtDiscussion16 ?? []).map((d: any, i: number) => (
                                <Fragment key={i}>
                                  <article className={d.cls}>
                                    <strong>{interp(d.who)}</strong>
                                    <p>{interp(d.text)}</p>
                                  </article>
                                </Fragment>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>
                      {v.rtActive16 ? (
                        <>
                          <form className="rt-composer16 rt-live16" onSubmit={v.rtSendInstruction16}>
                            <span className="rt-clabel16">
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
                              Instruct this run while it is active
                            </span>
                            {v.rtHasAttachments16 ? (
                              <>
                                <div className="rt-attachments16">
                                  {(v.rtAttachments16 ?? []).map((a: any, i: number) => (
                                    <Fragment key={i}>
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
                                          <use href="/i15.svg#paperclip" />
                                        </svg>
                                        {interp(a.name)}
                                        <button
                                          type="button"
                                          className="icon-button"
                                          aria-label={a.removeLabel}
                                          onClick={a.remove}
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
                                    </Fragment>
                                  ))}
                                </div>
                              </>
                            ) : null}
                            <textarea
                              rows={2}
                              aria-label="Send an instruction to this active run"
                              placeholder={v.rtInstructPlaceholder16}
                              value={v.rtInstructDraft16}
                              onChange={v.rtEditInstruct16}
                              onKeyDown={v.rtComposerKey16}
                            />
                            <div className="rt-ctools16">
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Add files or context"
                                onClick={v.rtPlus16}
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
                                  <use href="/i15.svg#plus" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="composer10-choice model11"
                                aria-label="Choose model"
                                onClick={v.modelPicker11}
                              >
                                {v.modelHasLogo11 ? (
                                  <>
                                    <img className={v.modelLogoClass11} src={v.modelLogo11} alt="" />
                                  </>
                                ) : null}
                                {!v.modelHasLogo11 ? (
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
                                      <use href="/i15.svg#sparkles" />
                                    </svg>
                                  </>
                                ) : null}
                                <span>{interp(v.modelLabel11)}</span>
                                <em className="model-effort15">{interp(v.thinkingLabel)}</em>
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
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Dictate an instruction"
                                onClick={v.rtDictate16}
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
                                  <use href="/i15.svg#mic" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label={v.rtStopLabel16}
                                title={v.rtStopLabel16}
                                onClick={v.rtStop16}
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
                                  <use href="/i15.svg#square" />
                                </svg>
                              </button>
                              <button
                                className="send-button"
                                type="submit"
                                aria-label="Send this instruction"
                                disabled={v.rtInstructEmpty16}
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
                                  <use href="/i15.svg#arrow-up" />
                                </svg>
                              </button>
                            </div>
                          </form>
                        </>
                      ) : null}
                      {!v.rtActive16 ? (
                        <>
                          <div className="rt-discuss16">
                            <div className="rt-readonly16">
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
                                <use href="/i15.svg#lock" />
                              </svg>
                              <span>
                                <strong>This run is a finished record</strong>
                                <small>{interp(v.rtReadOnlyNote16)}</small>
                              </span>
                            </div>
                            <button type="button" className="rt-discussgo16" onClick={v.rtDiscussInThread16}>
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
                              <span>Discuss in the conversation</span>
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
                          </div>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                  </>
                )}
              </>
            ) : null}
            {v.filesPane12 ? (
              <>
                <div className="pane-title13">
                  <span className="n9-overline">
                    {interp(v.inspectorId10)} · {interp(v.prRepository12)}
                  </span>
                  <h2>{interp(v.attachTitle16)}</h2>
                  <p>{interp(v.attachNote16)}</p>
                </div>
                {v.workspaceFiles12 ? (
                  <>
                    {v.fileSelected13 ? (
                      <>
                        <div className="file-toolbar13">
                          <button className="text-button" onClick={v.closeFile13}>
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
                            All files
                          </button>
                          <button className="text-button" onClick={v.attachFile13}>
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
                            Add to chat
                          </button>
                        </div>
                        <h3 className="file-title13">{interp(v.fileName13)}</h3>
                        <div className="file-meta13">
                          <span>{interp(v.fileKind13)}</span>
                          <code>{interp(v.prHead12)}</code>
                          <span>{interp(v.fileStats13)}</span>
                        </div>
                        <div className="code-view13" aria-label="File preview">
                          {(v.fileLines13 ?? []).map((l: any, i: number) => (
                            <Fragment key={i}>
                              <div className={l.cls}>
                                <span>{interp(l.number)}</span>
                                <code>{interp(l.text)}</code>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                        <button className="small-button file-comment13" onClick={v.commentFile13}>
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
                          </svg>{" "}
                          Ask about this file
                        </button>
                      </>
                    ) : null}
                    {!v.fileSelected13 ? (
                      <>
                        <label className="file-search13">
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
                            aria-label="Search conversation files"
                            placeholder="Find a file…"
                            value={v.fileSearch13}
                            onInput={v.editFileSearch13}
                          />
                        </label>
                        <div className="file-section13">
                          <header>
                            <h3>In this conversation</h3>
                            <button className="icon-button" aria-label="Add source file" onClick={v.addSource13}>
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
                          </header>
                          {(v.sourceFiles13 ?? []).map((f: any, i: number) => (
                            <Fragment key={i}>
                              <button className="file-row13" onClick={f.open}>
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
                                  <use href="/i15.svg#file-text" />
                                </svg>
                                <span>
                                  <strong>{interp(f.name)}</strong>
                                  <small>{interp(f.meta)}</small>
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
                          <button className="file-row13" onClick={v.issueTab12}>
                            <img className={`brand12 ${v.sourceBrandClass12}`} src={v.sourceBrand12} alt="" />
                            <span>
                              <strong>Original request</strong>
                              <small>{interp(v.source12)}</small>
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
                        </div>
                        <p className="fine file-scope13">
                          Only what has been shared with this conversation is here. Changed files live with the pull
                          request.
                        </p>
                      </>
                    ) : null}
                  </>
                ) : null}
                {v.workspacePreview12 ? (
                  <>
                    <div className="bp-pane15">
                      <div className="bp15 bp-big15">
                        <header className="bp-head15">
                          <span className={`bp-dot15 ${v.bpTone15}`} />
                          <strong>{interp(v.bpTitle15)}</strong>
                          <button
                            className="sel14"
                            type="button"
                            aria-haspopup="listbox"
                            aria-label="Recorded action"
                            onClick={v.bpRunPick15}
                          >
                            <span>{interp(v.bpRunLabel15)}</span>
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
                        </header>
                        <div className="bp-stage15 bp-stage-big15">
                          <span className="bp-chrome15">
                            <i />
                            <i />
                            <i />
                            <span className="bp-url15">
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
                                <use href="/i15.svg#globe" />
                              </svg>
                              {interp(v.bpUrl15)}
                            </span>
                          </span>
                          <span className="bp-app15">
                            <span className="bp-rail15">
                              {(v.bpRail15 ?? []).map((r: any, i: number) => (
                                <Fragment key={i}>
                                  <i className={r.cls} />
                                </Fragment>
                              ))}
                            </span>
                            <span className="bp-view15">
                              <span className="bp-top15">
                                <b>{interp(v.bpRoute15)}</b>
                                <i className="bp-pill15">{interp(v.bpRouteMeta15)}</i>
                              </span>
                              {(v.bpRows15 ?? []).map((r: any, i: number) => (
                                <Fragment key={i}>
                                  <span className={`bp-row15 ${r.cls}`}>
                                    <i className={`bp-state15 ${r.tone}`} />
                                    <b>{interp(r.id)}</b>
                                    <span>{interp(r.title)}</span>
                                    <em>{interp(r.state)}</em>
                                  </span>
                                </Fragment>
                              ))}
                              {v.bpHasCard15 ? (
                                <>
                                  <span className="bp-card15">
                                    <b>{interp(v.bpCardTitle15)}</b>
                                    <span>{interp(v.bpCardCopy15)}</span>
                                    <i className="bp-btn15">{interp(v.bpCardAction15)}</i>
                                  </span>
                                </>
                              ) : null}
                            </span>
                            <span className={`bp-focus15 ${v.bpFocusTone15}`} style={css(v.bpFocusStyle15)} />
                            <span className="bp-cursor15" style={css(v.bpCursorStyle15)} />
                          </span>
                        </div>
                        <footer className="bp-foot15">
                          <button className="small-button" onClick={v.bpToggle15}>
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
                              <use href={v.bpToggleIcon15} />
                            </svg>{" "}
                            {interp(v.bpToggleLabel15)}
                          </button>
                          <button className="small-button" onClick={v.bpNext15} disabled={v.bpAtEnd15}>
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
                            </svg>{" "}
                            Next
                          </button>
                          <button className="small-button" onClick={v.bpReplay15}>
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
                              <use href="/i15.svg#rotate-ccw" />
                            </svg>{" "}
                            Replay
                          </button>
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
                          <span className="bp-count15">{interp(v.bpCount15)}</span>
                        </footer>
                      </div>
                      <ol className="bp-steps15">
                        {(v.bpSteps15 ?? []).map((s: any, i: number) => (
                          <Fragment key={i}>
                            <li className={s.cls}>
                              <button type="button" className="bp-stepbtn15" onClick={s.go}>
                                <span className="bp-num15">{interp(s.n)}</span>
                                <span>
                                  <strong>{interp(s.title)}</strong>
                                  <small>{interp(s.detail)}</small>
                                </span>
                              </button>
                            </li>
                          </Fragment>
                        ))}
                      </ol>
                      <div className="terminal12 term16">
                        <header>
                          <span>{interp(v.terminalTitle13)}</span>
                          <span>{interp(v.terminalStatus13)}</span>
                        </header>
                        <pre>{interp(v.terminalLog13)}</pre>
                      </div>
                      <button className="small-button" onClick={v.annotatePreview12}>
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
                          <use href="/i15.svg#send" />
                        </svg>
                        Add feedback to chat
                      </button>
                      <p className="fine">{interp(v.bpNote15)}</p>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
            {v.usagePane12 ? (
              <>
                <div className="pane-title13">
                  <span className="n9-overline">
                    {interp(v.inspectorId10)} · {interp(v.usageState13)}
                  </span>
                  <h2>Usage</h2>
                  <p>What this conversation used, and who paid.</p>
                </div>
                <section className="receipt13">
                  <header>
                    <span>BotInc credits used</span>
                    <span className="receipt-badge13">{interp(v.usageState13)}</span>
                  </header>
                  <strong>{interp(v.conversationCost10)}</strong>
                  <div className="budget13">
                    <i style={css(v.budgetStyle13)} />
                  </div>
                  <footer>
                    <span>{interp(v.taskLimit12)} task limit</span>
                    <span>{interp(v.budgetLeft13)} remaining</span>
                  </footer>
                </section>
                <div className="funding-breakdown13">
                  <div>
                    <img className="brand12" src="/assets/brands-v12/claude.svg" alt="Claude" />
                    <span>
                      <strong>Model work</strong>
                      <small>{interp(v.usageFunding13)}</small>
                    </span>
                    <strong>{interp(v.modelCharged13)}</strong>
                  </div>
                  <div>
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
                      <strong>Cloud compute</strong>
                      <small>Charged to BotInc credit</small>
                    </span>
                    <strong>{interp(v.cloudCost13)}</strong>
                  </div>
                  <div>
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
                    <span>
                      <strong>Voice</strong>
                      <small>No call recorded</small>
                    </span>
                    <strong>$0.00</strong>
                  </div>
                </div>
                <section className="pane-section13">
                  <header>
                    <h3>By run</h3>
                    <span className="fine">Credit charged</span>
                  </header>
                  {(v.usageRunRows13 ?? []).map((r: any, i: number) => (
                    <Fragment key={i}>
                      <button className="ledger-row13" onClick={r.open}>
                        <img className={`brand12 ${r.brandClass12}`} src={r.brand12} alt="" />
                        <span>
                          <strong>{interp(r.stage)}</strong>
                          <small>
                            {interp(r.model)} · {interp(r.duration)}
                          </small>
                        </span>
                        <strong>{interp(r.costLabel)}</strong>
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
                <section className="pane-section13 context-usage13">
                  <header>
                    <h3>Context</h3>
                    <span>{interp(v.contextShort12)}</span>
                  </header>
                  <p>{interp(v.contextMeter12)}</p>
                  <button className="text-button" onClick={v.contextInfo12}>
                    Manage context{" "}
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
                </section>
                <button className="account-link13" onClick={v.allUsage12}>
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
                    <use href="/i15.svg#chart-no-axes-combined" />
                  </svg>
                  <span>
                    <strong>Subscription capacity</strong>
                    <small>Account windows and reset times</small>
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
                <p className="fine">Quota is not a currency. Account limits stay separate from this receipt.</p>
              </>
            ) : null}
            {v.conversationPane12 ? (
              <>
                <div className="issue-pane13 chat-pane19">
                  <div className="pane-eyebrow13">
                    <span>{interp(v.inspectorId10)}</span>
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
                        <use href="/i15.svg#lock" />
                      </svg>{" "}
                      Only you
                    </span>
                  </div>
                  <h2>{interp(v.inspectorTitle10)}</h2>
                  <div className="properties13">
                    <div>
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
                      <span>Status</span>
                      <strong>{interp(v.chatStatus19)}</strong>
                    </div>
                    <div>
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
                        <use href="/i15.svg#user" />
                      </svg>
                      <span>Owner</span>
                      <strong>{interp(v.memberName)}</strong>
                    </div>
                    <div>
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
                        <use href="/i15.svg#bot" />
                      </svg>
                      <span>Agent</span>
                      <strong>{interp(v.chatAgent19)}</strong>
                    </div>
                    <div>
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
                      <span>Model</span>
                      <strong>{interp(v.chatModel19)}</strong>
                    </div>
                    <div>
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
                      <span>Created</span>
                      <strong>{interp(v.chatCreated19)}</strong>
                    </div>
                    <div>
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
                        <use href="/i15.svg#history" />
                      </svg>
                      <span>Updated</span>
                      <strong>{interp(v.chatUpdated19)}</strong>
                    </div>
                  </div>
                  <section className="pane-section13">
                    <h3>About this conversation</h3>
                    <p>{interp(v.chatAbout19)}</p>
                  </section>
                  <section className="pane-section13 relations13">
                    <header>
                      <h3>Related work</h3>
                      <button className="icon-button" aria-label="Create issue from chat" onClick={v.promoteChat12}>
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
                    </header>
                    <button className="subissue-empty13" onClick={v.promoteChat12}>
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
                      </svg>{" "}
                      Create issue from chat
                    </button>
                    <p className="fine">
                      Private to {interp(v.memberName)}. Turn this conversation into shared work when there is something to
                      track.
                    </p>
                  </section>
                  <section className="pane-section13 context-usage13">
                    <header>
                      <h3>Context</h3>
                      <span>{interp(v.contextShort12)}</span>
                    </header>
                    <p>{interp(v.contextMeter12)}</p>
                    <button className="text-button" onClick={v.compactContext12}>
                      Compact context{" "}
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
                  </section>
                </div>
              </>
            ) : null}
            {v.activityPane12 ? (
              <>
                <h2>Live activity</h2>
                {(v.actionRows10 ?? []).map((e: any, i: number) => (
                  <Fragment key={i}>
                    <div className="action10">
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
                          <use href={e.icon} />
                        </svg>
                      </span>
                      <div>
                        <strong>{interp(e.label)}</strong>
                        <p>{interp(e.detail)}</p>
                        <small>
                          {interp(e.when)} · {interp(e.state)}
                        </small>
                      </div>
                    </div>
                  </Fragment>
                ))}
                {(v.voiceLines10 ?? []).map((l: any, i: number) => (
                  <Fragment key={i}>
                    <article className="transcript10">
                      <strong>{interp(l.who)}</strong>
                      <p>{interp(l.text)}</p>
                    </article>
                  </Fragment>
                ))}
              </>
            ) : null}
            {v.outputPane12 ? (
              <>
                <h2>{interp(v.resultTitle10)}</h2>
                <p>{interp(v.resultSummary10)}</p>
                <div className="result-document10">{interp(v.resultBody10)}</div>
              </>
            ) : null}
          </div>
        </aside>
      </>
    ) : null
  );
}
