/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageIssueDetail({ v }: { v: Vals }) {
  return (
    v.issuePage ? (
      <>
        <main className="issue-page issue-v8" data-screen-label="Issue detail">
          <section className="i8-main">
            <div className="i8-top">
              <button className="text-button back-link" onClick={v.showWork}>
                <svg
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
                Work
              </button>
              <span className="i8-id">{interp(v.issue?.id)}</span>
              <button className="i8-source-chip" onClick={v.sourceDetail}>
                <svg
                  className="ui-icon use14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <use href={v.i8SourceIcon} />
                </svg>
                <span>{interp(v.i8SourceLabel)}</span>
                <svg
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
              <span className="i8-top-gap" />
              {v.i8HasParent ? (
                <>
                  <button className="text-button" onClick={v.i8OpenParent}>
                    <svg
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
                    {interp(v.i8ParentLabel)}
                  </button>
                </>
              ) : null}
              <button className="icon-button" aria-label="Issue options" onClick={v.i8Menu}>
                <svg
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
            {v.i8TitleStatic ? (
              <>
                <div className="i8-heading">
                  <h1>{interp(v.issue?.title)}</h1>
                  <button className="icon-button" aria-label="Edit title" onClick={v.startI8Title}>
                    <svg
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
                  </button>
                </div>
              </>
            ) : null}
            {v.i8TitleEditing ? (
              <>
                <div className="i8-title-edit">
                  <label className="sr-only" htmlFor="i8-title">
                    Issue title
                  </label>
                  <textarea id="i8-title" rows={2} value={v.i8TitleDraft} onChange={v.editI8Title} />
                  <div>
                    <button className="small-button" onClick={v.cancelI8Title}>
                      Cancel
                    </button>
                    <button className="small-button primary" onClick={v.saveI8Title}>
                      Save title
                    </button>
                  </div>
                </div>
              </>
            ) : null}
            <div className="i8-props">
              <label className="i8-prop">
                <span>Status</span>
                <button
                  type="button"
                  className={`sel14 ${v.m14_i8Status?.cls}`}
                  aria-haspopup="listbox"
                  aria-expanded={v.m14_i8Status?.expanded}
                  onClick={v.m14_i8Status?.pick}
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
                    <use href={v.m14_i8Status?.icon16} />
                  </svg>
                  <span>{interp(v.m14_i8Status?.label)}</span>
                  <svg
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
              <label className="i8-prop">
                <span>Priority</span>
                <button
                  type="button"
                  className={`sel14 ${v.m14_i8Priority?.cls}`}
                  aria-haspopup="listbox"
                  aria-expanded={v.m14_i8Priority?.expanded}
                  onClick={v.m14_i8Priority?.pick}
                >
                  <span>{interp(v.m14_i8Priority?.label)}</span>
                  <svg
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
              <label className="i8-prop">
                <span>Assignee</span>
                <button
                  type="button"
                  className={`sel14 ${v.m14_i8Owner?.cls}`}
                  aria-haspopup="listbox"
                  aria-expanded={v.m14_i8Owner?.expanded}
                  onClick={v.m14_i8Owner?.pick}
                >
                  <span>{interp(v.m14_i8Owner?.label)}</span>
                  <svg
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
              <label className="i8-prop">
                <span>Project</span>
                <button
                  type="button"
                  className={`sel14 ${v.m14_i8Project?.cls}`}
                  aria-haspopup="listbox"
                  aria-expanded={v.m14_i8Project?.expanded}
                  onClick={v.m14_i8Project?.pick}
                >
                  <span>{interp(v.m14_i8Project?.label)}</span>
                  <svg
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
            </div>
            <div className="i8-dates">
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
                  <use href="/i15.svg#calendar" />
                </svg>{" "}
                Created {interp(v.i8Created)}
              </span>
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
                  <use href="/i15.svg#clock" />
                </svg>{" "}
                Updated {interp(v.i8Updated)}
              </span>
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
                  <use href="/i15.svg#user" />
                </svg>{" "}
                Reported by {interp(v.i8Reporter)}
              </span>
              {v.i8HasLabels ? (
                <>
                  <span>{interp(v.i8Labels)}</span>
                </>
              ) : null}
            </div>
            <section className={`i8-action ${v.i8ActionTone}`}>
              <div className="i8-action-copy">
                <span className="i8-action-state">{interp(v.i8ActionState)}</span>
                <h2>{interp(v.i8ActionTitle)}</h2>
                <p>{interp(v.i8ActionCopy)}</p>
              </div>
              <div className="i8-action-buttons">
                {v.i8HasSecondary ? (
                  <>
                    <button className="small-button" onClick={v.i8Secondary}>
                      {interp(v.i8SecondaryLabel)}
                    </button>
                  </>
                ) : null}
                <button className="small-button primary" onClick={v.i8Primary}>
                  {interp(v.i8PrimaryLabel)}{" "}
                  <svg
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
            </section>
            {v.i8Canceled ? (
              <>
                <div className="i8-canceled-note">
                  <svg
                    className="ui-icon use14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <use href="/i15.svg#archive" />
                  </svg>
                  <div>
                    <strong>{interp(v.i8CancelTitle)}</strong>
                    <p>{interp(v.i8CancelCopy)}</p>
                  </div>
                </div>
              </>
            ) : null}
            <section className="i8-block">
              <h3>Description</h3>
              <p className="i8-prose">{interp(v.issue?.description)}</p>
            </section>
            <section className="i8-block">
              <h3>Acceptance criteria</h3>
              {v.i8HasCriteria ? (
                <>
                  <ul className="i8-criteria">
                    {(v.i8Criteria ?? []).map((c: any, i: number) => (
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
                          <span>{interp(c)}</span>
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                </>
              ) : null}
              {v.i8NoCriteria ? (
                <>
                  <p className="fine">No acceptance criteria were recorded on this issue.</p>
                </>
              ) : null}
            </section>
            <section className="i8-block">
              <div className="i8-block-head">
                <h3>Linked work</h3>
                <button className="text-button" onClick={v.i8AddSub}>
                  <svg
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
                  Add sub-issue
                </button>
              </div>
              {v.i8HasLinks ? (
                <>
                  <div className="i8-links">
                    {(v.i8Links ?? []).map((l: any, i: number) => (
                      <Fragment key={i}>
                        <button className="i8-link" onClick={l.open}>
                          <span className="i8-link-kind">{interp(l.kind)}</span>
                          <span className="i8-link-id">{interp(l.id)}</span>
                          <span className="i8-link-title">{interp(l.title)}</span>
                          <span className={`i8-link-state ${l.tone}`}>{interp(l.state)}</span>
                          <svg
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
              {v.i8NoLinks ? (
                <>
                  <p className="fine">Nothing linked yet. Sub-issues and the output pull request appear here.</p>
                </>
              ) : null}
            </section>
            <section className="i8-block">
              <div className="tabs i8-tabs">
                <button className={v.i8ConversationClass} onClick={v.showI8Conversation}>
                  Conversation
                </button>
                <button className={v.i8ActivityClass} onClick={v.showI8Activity}>
                  Activity
                </button>
                <span className="i8-tab-note">{interp(v.i8TabNote)}</span>
              </div>
              {v.i8ConversationView ? (
                <>
                  <div className="i8-thread">
                    {(v.issueThread ?? []).map((a: any, i: number) => (
                      <Fragment key={i}>
                        <article className="issue-thread-message">
                          <div className="message-author">
                            <img src={a.avatar} alt="" />
                            <span>{interp(a.who)}</span>
                            <small>{interp(a.model)}</small>
                          </div>
                          <p>{interp(a.text)}</p>
                          {a.hasEvidence ? (
                            <>
                              <button className="text-button" onClick={v.runActivity}>
                                {interp(a.evidence)}
                              </button>
                            </>
                          ) : null}
                        </article>
                      </Fragment>
                    ))}
                  </div>
                  {v.i8EmptyThread ? (
                    <>
                      <p className="fine">No messages yet. Start the task or leave a comment for your Operator.</p>
                    </>
                  ) : null}
                </>
              ) : null}
              {v.i8ActivityView ? (
                <>
                  <ol className="i8-activity">
                    {(v.i8Activity ?? []).map((e: any, i: number) => (
                      <Fragment key={i}>
                        <li>
                          <span className={`i8-act-mark ${e.tone}`}>
                            <svg
                              className="ui-icon use14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <use href={e.iconHref} />
                            </svg>
                          </span>
                          <div>
                            <strong>{interp(e.title)}</strong>
                            <small>{interp(e.meta)}</small>
                            {e.hasBody ? (
                              <>
                                <p>{interp(e.body)}</p>
                              </>
                            ) : null}
                          </div>
                        </li>
                      </Fragment>
                    ))}
                  </ol>
                </>
              ) : null}
            </section>
            <form className="i8-composer" onSubmit={v.commentIssue}>
              <label className="sr-only" htmlFor="issue-comment">
                Comment on this issue
              </label>
              <textarea
                id="issue-comment"
                rows={2}
                placeholder={v.i8CommentPlaceholder}
                value={v.issueComment}
                onChange={v.editIssueComment}
              />
              <div>
                <span>Shared with BotInc · Talk to Operator</span>
                <button className="small-button" type="submit" disabled={v.noIssueComment}>
                  Comment
                </button>
              </div>
            </form>
          </section>
          {v.i8Rail ? (
            <>
              <aside className="i8-rail" aria-label="Execution and links">
                <section className="i8-card">
                  <header>
                    <h3>Execution</h3>
                    <span className={`i8-run ${v.i8RunTone}`}>{interp(v.i8RunState)}</span>
                  </header>
                  <dl className="i8-dl">
                    <dt>Agent</dt>
                    <dd>
                      <button className="text-button" onClick={v.i8OpenAgent}>
                        {interp(v.i8Agent)}
                      </button>
                    </dd>
                    <dt>Model</dt>
                    <dd>
                      <button className="text-button" onClick={v.selectModel}>
                        {interp(v.i8Model)}
                      </button>
                    </dd>
                    <dt>Paid with</dt>
                    <dd>
                      <button className="text-button" onClick={v.i8ChooseFunding}>
                        {interp(v.i8Funding)}
                      </button>
                    </dd>
                    <dt>Computer</dt>
                    <dd>
                      <button className="text-button" onClick={v.chooseComputer}>
                        {interp(v.i8Computer)}
                      </button>
                    </dd>
                    <dt>Effort</dt>
                    <dd>
                      <button className="text-button" onClick={v.chooseThinking}>
                        {interp(v.thinkingLabel)}
                      </button>
                    </dd>
                    <dt>BotInc credit</dt>
                    <dd>{interp(v.i8Credit)}</dd>
                  </dl>
                  {v.i8FundingWarn ? (
                    <>
                      <p className="i8-warn">
                        <svg
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
                        <span>{interp(v.i8FundingWarnText)}</span>
                      </p>
                    </>
                  ) : null}
                  <button className="i8-card-link" onClick={v.runActivity}>
                    <span>Open run activity</span>
                    <svg
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
                </section>
                <section className="i8-card">
                  <header>
                    <h3>Source and output</h3>
                  </header>
                  <button className="i8-card-link" onClick={v.sourceDetail}>
                    <span className="i8-kind">SOURCE</span>
                    <span>{interp(v.i8SourceLabel)}</span>
                    <svg
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
                  {v.i8HasPr ? (
                    <>
                      <button className="i8-card-link" onClick={v.i8OpenChanges}>
                        <span className="i8-kind">OUTPUT</span>
                        <span>{interp(v.i8PrLabel)}</span>
                        <svg
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
                  {v.i8HasArtifacts ? (
                    <>
                      <div className="i8-artifact-buttons">{v.liveIssueFiles ? v.liveIssueFiles.map((file: any) => <a key={file.id} className="small-button" href={file.url} target="_blank" rel="noopener noreferrer">{file.filename}</a>) : <>
                        <button className="small-button" onClick={v.i8OpenChanges}>
                          Changes
                        </button>
                        <button className="small-button" onClick={v.i8OpenChecks}>
                          Checks
                        </button>
                        <button className="small-button" onClick={v.openReceipt}>
                          Usage
                        </button>
                      </>}</div>
                    </>
                  ) : null}
                  {v.i8NoArtifacts ? (
                    <>
                      <p className="fine">{interp(v.i8NoArtifactCopy)}</p>
                      <button className="small-button" onClick={v.openReceipt}>
                        Usage receipt
                      </button>
                    </>
                  ) : null}
                </section>
                {v.i8HasDeploy ? (
                  <>
                    <section className="i8-card">
                      <header>
                        <h3>Deployment</h3>
                      </header>
                      <p className="i8-deploy">{interp(v.i8DeployCopy)}</p>
                      <p className="fine">{interp(v.i8DeployNote)}</p>
                    </section>
                  </>
                ) : null}
                <section className="i8-card">
                  <header>
                    <h3>People</h3>
                  </header>
                  <div className="i8-people">
                    <span className="person-avatar">{interp(v.i8OwnerInitial)}</span>
                    <div>
                      <strong>{interp(v.i8Owner)}</strong>
                      <small>Execution owner · their agents and accounts</small>
                    </div>
                  </div>
                  <p className="fine">{interp(v.i8PeopleNote)}</p>
                </section>
              </aside>
            </>
          ) : null}
        </main>
      </>
    ) : null
  );
}
