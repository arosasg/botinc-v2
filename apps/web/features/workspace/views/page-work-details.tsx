/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageWorkDetails({ v }: { v: Vals }) {
  return (
    v.panelOpen ? (
      <>
        <aside className="detail-panel" aria-label="Work details">
          <header className="panel-header">
            <div>
              <span className="eyebrow">{interp(v.panelEyebrow)}</span>
              <h2>{interp(v.panelTitle)}</h2>
            </div>
            <button className="icon-button" aria-label="Close work details" onClick={v.closePanel}>
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
                <use href="/i15.svg#x" />
              </svg>
            </button>
          </header>
          <div className="panel-tabs">
            {(v.panelTabs ?? []).map((t: any, i: number) => (
              <Fragment key={i}>
                <button className={t.cls} onClick={t.open}>
                  {interp(t.label)}
                </button>
              </Fragment>
            ))}
          </div>
          <div className="panel-scroll">
            {v.sourcePanel ? (
              <>
                <div className="source-card">
                  <span className="source-tag">{interp(v.origin?.app)}</span>
                  <h3>{interp(v.origin?.key)}</h3>
                  <p>{interp(v.issue?.title)}</p>
                  <p className="fine">
                    Illustrative source record · Source links open the original item in the connected app.
                  </p>
                </div>
                <dl className="detail-grid">
                  <dt>Source scope</dt>
                  <dd>{interp(v.origin?.scope)}</dd>
                  <dt>Brought in by</dt>
                  <dd>{interp(v.origin?.author)}</dd>
                  <dt>Intake</dt>
                  <dd>{interp(v.origin?.intake)}</dd>
                  <dt>Last synced</dt>
                  <dd>{interp(v.origin?.synced)}</dd>
                  <dt>Execution owner</dt>
                  <dd>{interp(v.issue?.owner)}</dd>
                  <dt>Visible to</dt>
                  <dd>BotInc workspace</dd>
                </dl>
                <h3 className="subheading">Original request</h3>
                <p className="prose">{interp(v.issue?.description)}</p>
                <div className="info-box">
                  <h3>One issue, one history.</h3>
                  <p>{interp(v.origin?.mapping)}</p>
                </div>
                <button className="text-button" onClick={v.sourceSync}>
                  Refresh source
                </button>
                {v.sourceSyncError ? (
                  <>
                    <p className="error">The source is disconnected. This saved issue is still available.</p>
                    <button className="small-button" onClick={v.reconnectOrigin}>
                      Reconnect {interp(v.origin?.app)}
                    </button>
                  </>
                ) : null}
              </>
            ) : null}
            {v.resultPanel ? (
              <>
                <article className="artifact-document">
                  <span className="eyebrow">{interp(v.artifactLabel)}</span>
                  <h1>{interp(v.resultTitle)}</h1>
                  <p className="artifact-lead">{interp(v.resultSummary)}</p>
                  {(v.artifactSections ?? []).map((a: any, i: number) => (
                    <Fragment key={i}>
                      <section>
                        <h3>{interp(a.title)}</h3>
                        <p>{interp(a.body)}</p>
                      </section>
                    </Fragment>
                  ))}
                  <div className="artifact-foot">
                    <img src={v.artifactAvatar} alt="" />
                    <span>
                      {interp(v.artifactAuthor)} · Version 1<br />
                      <small>Saved in this conversation · {interp(v.chatPrivacy)}</small>
                    </span>
                  </div>
                </article>
              </>
            ) : null}
            {v.changesPanel ? (
              <>
                <div className="panel-review-summary">
                  <span className="status-pill">{interp(v.reviewState)}</span>
                  <span className="fine">
                    Output: {interp(v.issue?.pr)} · {interp(v.issue?.head)}
                  </span>
                  <details className="review-explanation">
                    <summary>Change summary</summary>
                    <p>{interp(v.issue?.changeSummary)}</p>
                  </details>
                </div>
                <details className="changed-files">
                  <summary>{interp(v.issue?.files?.length)} changed files</summary>
                  <div className="file-list">
                    {(v.changedFiles ?? []).map((f: any, i: number) => (
                      <Fragment key={i}>
                        <button className={f.cls} onClick={f.open}>
                          <span>{interp(f.name)}</span>
                          <span className="diff-add">{interp(f.stats)}</span>
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </details>
                <div className="diff-file">
                  <span>{interp(v.selectedFileName)}</span>
                  <span>Unified diff</span>
                </div>
                <pre className="code-diff panel-diff">
                  {(v.diffLines ?? []).map((l: any, i: number) => (
                    <Fragment key={i}>
                      <span className={l.cls}>{interp(l.text)}</span>
                    </Fragment>
                  ))}
                </pre>
                <button className="text-button" onClick={v.addLineFeedback}>
                  + Leave feedback on this file
                </button>
                {v.hasInlineFeedback ? (
                  <>
                    <div className="inline-review-note">
                      <strong>Your feedback · {interp(v.feedbackFile)}</strong>
                      <p>{interp(v.inlineFeedback)}</p>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
            {v.activityPanel ? (
              <>
                <div className="run-summary">
                  <span className="status-pill">{interp(v.activityStatus)}</span>
                  <p>{interp(v.activityContext)}</p>
                </div>
                <div className="trace">
                  {(v.traceRows ?? []).map((r: any, i: number) => (
                    <Fragment key={i}>
                      <details>
                        <summary>
                          <span className="trace-status">
                            <svg
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
                          <span>
                            <strong>{interp(r.title)}</strong>
                            <small>{interp(r.subtitle)}</small>
                          </span>
                          <span className="fine">{interp(r.time)}</span>
                        </summary>
                        <pre>{interp(r.output)}</pre>
                      </details>
                    </Fragment>
                  ))}
                </div>
                <div className="info-box">
                  <h3>Attached to this task</h3>
                  <p>{interp(v.executionSkills)}</p>
                  <button className="text-button" onClick={v.openUsedSkills}>
                    View skills{" "}
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
                  </button>
                </div>
              </>
            ) : null}
            {v.checksPanel ? (
              <>
                <div className="panel-review-summary">
                  <h3>{interp(v.checksTitle)}</h3>
                  <p>
                    Reviewed {interp(v.issue?.head)} · {interp(v.issue?.pr)}
                  </p>
                </div>
                <div className="check-list">
                  {(v.taskChecks ?? []).map((c: any, i: number) => (
                    <Fragment key={i}>
                      <p>
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
                            <use href="/i15.svg#check" />
                          </svg>
                        </span>
                        {interp(c)}
                      </p>
                    </Fragment>
                  ))}
                </div>
                <div className="info-box">
                  <h3>{interp(v.issue?.owner)}’s Code Reviewer</h3>
                  <p>{interp(v.issue?.reviewSummary)}</p>
                  <small>Review applies to this commit. Any new change requires another review.</small>
                </div>
              </>
            ) : null}
            {v.usagePanel ? (
              <>
                <h3 className="subheading">{interp(v.receiptTitle)}</h3>
                <dl className="receipt-rows">
                  <dt>Models</dt>
                  <dd>{interp(v.receiptModels)}</dd>
                  <dt>Cloud compute</dt>
                  <dd>{interp(v.receiptCompute)}</dd>
                  <dt className="receipt-total">BotInc credit used</dt>
                  <dd className="receipt-total">{interp(v.receiptTotal)}</dd>
                  <dt>Limit</dt>
                  <dd>{interp(v.receiptLimit)}</dd>
                  <dt>Funding</dt>
                  <dd>{interp(v.receiptFunding)}</dd>
                  <dt>Member</dt>
                  <dd>{interp(v.receiptMember8)}</dd>
                </dl>
                {v.hasProviderBill ? (
                  <>
                    <div className="info-box">
                      <h3>{interp(v.providerBillTitle)}</h3>
                      <p>{interp(v.providerBillCopy)}</p>
                    </div>
                  </>
                ) : null}
                {v.hasSubscriptionUsage ? (
                  <>
                    <div className="info-box">
                      <h3>{interp(v.subscriptionUsageTitle)}</h3>
                      <p>{interp(v.subscriptionUsageCopy)}</p>
                    </div>
                  </>
                ) : null}
                {v.receiptHasRuns8 ? (
                  <>
                    <h3 className="subheading">By run</h3>
                    {(v.receiptRuns8 ?? []).map((r: any, i: number) => (
                      <Fragment key={i}>
                        <div className="info-box">
                          <h3>
                            {interp(r.title)} · {interp(r.cost)}
                          </h3>
                          <p>{interp(r.funding)}</p>
                          <p>{interp(r.copy)}</p>
                        </div>
                      </Fragment>
                    ))}
                  </>
                ) : null}
                <p className="fine">{interp(v.receiptExplanation)}</p>
                <button className="text-button" onClick={v.usageDetails}>
                  All usage & invoices{" "}
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
                </button>
              </>
            ) : null}
          </div>
          <footer className="panel-footer">
            {v.panelIsReview ? (
              <>
                <button className="small-button" onClick={v.requestChanges}>
                  Request changes
                </button>
                <button className="small-button primary" onClick={v.mergePrompt} disabled={v.alreadyDone}>
                  {interp(v.mergeButtonLabel)}
                </button>
              </>
            ) : null}
            {v.resultPanel ? (
              <>
                <button className="small-button" onClick={v.downloadArtifact}>
                  Download .md
                </button>
                <button className="small-button primary" onClick={v.discussArtifact}>
                  Discuss in chat
                </button>
              </>
            ) : null}
            {v.sourcePanel ? (
              <>
                <button className="small-button" onClick={v.issueProperties}>
                  Edit work details
                </button>
                <button className="text-button" onClick={v.closePanel}>
                  Back to work
                </button>
              </>
            ) : null}
          </footer>
        </aside>
      </>
    ) : null
  );
}
