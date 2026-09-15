/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import { ComposerTextarea } from "../composer-textarea";
import { MessageText } from "../message-text";

export function PageConversation({ v }: { v: Vals }) {
  return (
    v.chatPage ? (
      <>
        <main className={`chat10 ${v.chatClass10}`} data-screen-label="Conversation">
          {v.welcome ? (
            <>
              <section className="welcome10">
                <img src="/assets/logo/botinc-mark.svg" alt="" />
                <h1>
                  What can I take
                  <br />
                  off your plate?
                </h1>
                <p>One conversation. From idea to done.</p>
              </section>
            </>
          ) : null}
          {v.conversation ? (
            <>
              <header className="chat10-heading">
                <div>
                  <span>{interp(v.chatPrivacy)}</span>
                  <h1>{interp(v.chatTitle)}</h1>
                </div>
                <button className="icon-button" aria-label="Conversation actions" onClick={v.chatActions12}>
                  <svg
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
                <button className="icon-button" aria-label="Conversation details" onClick={v.details10}>
                  <svg
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
                </button>
              </header>
              <div className="chat10-scroll">
                <div className="t9-cols15">
                  <div className="chat10-col15">
                    {(v.messages ?? []).map((m: any, i: number) => (
                      <Fragment key={i}>
                        <article className={`message10 ${m.cls}`}>
                          <div className="message-author">
                            {m.hasAvatar ? (
                              <>
                                <img src={m.avatar} alt="" />
                              </>
                            ) : null}
                            <strong>{interp(m.author)}</strong>
                            <small>{interp(m.model)}</small>
                          </div>
                          <MessageText text={String(m.text ?? "")} />
                          {m.hasAttachments11 ? (
                            <>
                              <div className="message-attachments11">
                                {(m.attachments11 ?? []).map((a: any, i: number) => (
                                  <Fragment key={i}>
                                    <button onClick={a.open}>
                                      {a.image ? (
                                        <>
                                          <img src={a.url} alt={a.name} />
                                        </>
                                      ) : null}
                                      {!a.image ? (
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
                                            <use href="/i15.svg#file-text" />
                                          </svg>
                                        </>
                                      ) : null}
                                      <span>{interp(a.name)}</span>
                                    </button>
                                  </Fragment>
                                ))}
                              </div>
                            </>
                          ) : null}
                          {m.canEdit12 ? (
                            <>
                              <div className="message-actions11">
                                <button className="text-button" onClick={m.edit12}>
                                  Edit prompt
                                </button>
                                <button className="text-button" onClick={m.fork12}>
                                  Fork from here
                                </button>
                              </div>
                            </>
                          ) : null}
                          {m.isOperator11 ? (
                            <>
                              <div className="message-actions11">
                                <button
                                  className="icon-button"
                                  aria-label="Copy response"
                                  title="Copy response"
                                  onClick={m.copy11}
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
                                    <use href="/i15.svg#copy" />
                                  </svg>
                                </button>
                                <button
                                  className="icon-button"
                                  aria-label="Use response as draft"
                                  title="Use as draft"
                                  onClick={m.quote11}
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
                                    <use href="/i15.svg#corner-up-left" />
                                  </svg>
                                </button>
                              </div>
                            </>
                          ) : null}
                        </article>
                      </Fragment>
                    ))}
                    {v.chatting ? (
                      <>
                        <div className="activity-inline10">
                          <i className="pulse-dot" />
                          <span>{interp(v.workingText)}</span>
                          <button className="text-button" onClick={v.live10}>
                            Watch work{" "}
                            <svg
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
                          </button>
                        </div>
                      </>
                    ) : null}
                    {v.chatQueued ? (
                      <>
                        <div className="activity-inline10">
                          <svg
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
                          <span>Queued. Your request is saved.</span>
                          <button className="text-button" onClick={v.details10}>
                            Details
                          </button>
                        </div>
                      </>
                    ) : null}
                    {v.chatPaused ? (
                      <>
                        <div className="activity-inline10">
                          <svg
                            className="ui-icon use14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <use href="/i15.svg#pause" />
                          </svg>
                          <span>Work is paused.</span>
                          <button className="text-button" onClick={v.resumeChat}>
                            Continue
                          </button>
                        </div>
                      </>
                    ) : null}
                    {v.chatResult ? (
                      <>
                        <button className="result10" onClick={v.result10}>
                          <svg
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
                            <strong>{interp(v.resultTitle)}</strong>
                            <small>{interp(v.resultSummary)}</small>
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
                    {v.chatNeedsCredits ? (
                      <>
                        <div className="t9-waiting">
                          <div>
                            <strong>Your work is saved</strong>
                            <p>More credit is needed for the next step.</p>
                          </div>
                          <button className="small-button" onClick={v.topup}>
                            Add credits
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                  {v.contextPeek11 ? (
                    <>
                      <div className="side-col15">
                        <aside className="context-peek11 peek13" aria-label="Conversation context">
                          {v.issueLinked12 ? (
                            <>
                              <button className="peek-issue13" onClick={v.issueTab12}>
                                <svg
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
                                <strong>{interp(v.inspectorId10)}</strong>
                                <span>{interp(v.inspectorStatus10)}</span>
                                <svg
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
                              </button>
                            </>
                          ) : null}
                          <section>
                            <header>
                              <h3>Outputs</h3>
                              <button className="icon-button" aria-label="Open output files" onClick={v.filesTab12}>
                                <svg
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
                            {v.hasPR12 ? (
                              <>
                                <button className="peek-row11" onClick={v.prTab12}>
                                  <img className="brand12 mono12" src="/assets/brands-v12/github.svg" alt="GitHub" />
                                  <span>{interp(v.issuePR13)}</span>
                                  <small>{interp(v.prState12)}</small>
                                </button>
                              </>
                            ) : null}
                            {v.noPeekOutputs14 ? (
                              <>
                                <p className="peek-empty13">Outputs appear as work finishes</p>
                              </>
                            ) : null}
                            <button className="peek-row11" onClick={v.filesTab12}>
                              <svg
                                className="ui-icon use14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href="/i15.svg#files" />
                              </svg>
                              <span>{interp(v.outputCount13)} files</span>
                              <svg
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
                          </section>
                          <section>
                            <header>
                              <h3>In this conversation</h3>
                              <button className="icon-button" aria-label="Add source" onClick={v.addSource13}>
                                <svg
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
                            <button className="peek-row11" onClick={v.issueTab12}>
                              <img className={`brand12 ${v.sourceBrandClass12}`} src={v.sourceBrand12} alt="" />
                              <span>{interp(v.source12)}</span>
                            </button>
                            {(v.peekSources13 ?? []).map((f: any, i: number) => (
                              <Fragment key={i}>
                                <button className="peek-row11" onClick={f.open}>
                                  <svg
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
                                  <span>{interp(f.name)}</span>
                                </button>
                              </Fragment>
                            ))}
                            <button className="text-button" onClick={v.filesTab12}>
                              <svg
                                className="ui-icon use14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href="/i15.svg#link" />
                              </svg>{" "}
                              View all
                            </button>
                          </section>
                        </aside>
                        {v.previewCard15 ? (
                          <>
                            <section className="bp15" aria-label="Live browser preview">
                              <header className="bp-head15">
                                <span className={`bp-dot15 ${v.bpTone15}`} />
                                <strong>{interp(v.bpTitle15)}</strong>
                                <button
                                  className="icon-button"
                                  aria-label="Open the full preview in the right pane"
                                  onClick={v.bpExpand15}
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
                                    <use href="/i15.svg#maximize-2" />
                                  </svg>
                                </button>
                              </header>
                              <button
                                type="button"
                                className="bp-stage15"
                                onClick={v.bpExpand15}
                                aria-label={v.bpStageAria15}
                              >
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
                              </button>
                              <div className="bp-now15">
                                <span className="bp-num15">{interp(v.bpStepNo15)}</span>
                                <span>
                                  <strong>{interp(v.bpStepTitle15)}</strong>
                                  <small>{interp(v.bpStepDetail15)}</small>
                                </span>
                              </div>
                              <footer className="bp-foot15">
                                <button className="icon-button" aria-label={v.bpToggleLabel15} onClick={v.bpToggle15}>
                                  <svg
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
                                  </svg>
                                </button>
                                <button
                                  className="icon-button"
                                  aria-label="Next step"
                                  onClick={v.bpNext15}
                                  disabled={v.bpAtEnd15}
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
                                    <use href="/i15.svg#chevron-right" />
                                  </svg>
                                </button>
                                <button
                                  className="icon-button"
                                  aria-label="Replay from the first step"
                                  onClick={v.bpReplay15}
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
                                    <use href="/i15.svg#rotate-ccw" />
                                  </svg>
                                </button>
                                <span className="bp-count15">{interp(v.bpCount15)}</span>
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
                                <button className="text-button" onClick={v.bpExpand15}>
                                  All steps
                                </button>
                              </footer>
                            </section>
                          </>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          <div className="composer10-wrap composer11-wrap">
            {v.replyThread12 ? (
              <>
                <div className="reply-context12">
                  <svg
                    className="ui-icon use14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <use href="/i15.svg#corner-down-right" />
                  </svg>
                  <span>{interp(v.replyLabel12)}</span>
                  <button className="icon-button" aria-label="Cancel thread reply" onClick={v.cancelReply12}>
                    <svg
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
                </div>
              </>
            ) : null}
            {v.hasQueue12 ? (
              <>
                <div className="queue18" aria-label="Queued messages">
                  <div className="queue-head18">
                    <svg
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
                    <strong>{interp(v.queueCount12)} queued</strong>
                    <small>{interp(v.queueHint18)}</small>
                    {v.queueMany18 ? (
                      <>
                        <button type="button" className="text-button" onClick={v.queueClear18}>
                          Clear all
                        </button>
                      </>
                    ) : null}
                  </div>
                  <ol className="queue-list18">
                    {(v.queueRows18 ?? []).map((q: any, i: number) => (
                      <Fragment key={i}>
                        <li className="queue-row18">
                          <span className="queue-n18">{interp(q.n)}</span>
                          <span className="queue-text18">{interp(q.text)}</span>
                          <span className="queue-acts18">
                            <button
                              type="button"
                              className="icon-button"
                              aria-label="Send earlier"
                              title="Send earlier"
                              disabled={q.first}
                              onClick={q.up}
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
                            <button
                              type="button"
                              className="icon-button"
                              aria-label="Send later"
                              title="Send later"
                              disabled={q.last}
                              onClick={q.down}
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
                                <use href="/i15.svg#arrow-down" />
                              </svg>
                            </button>
                            <button type="button" className="text-button" onClick={q.edit}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-button steer-text18"
                              title="Interrupt the current turn with this message"
                              onClick={q.steer}
                            >
                              Send now
                            </button>
                            <button
                              type="button"
                              className="icon-button"
                              aria-label="Remove from the queue"
                              onClick={q.remove}
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
                        </li>
                      </Fragment>
                    ))}
                  </ol>
                </div>
              </>
            ) : null}
            {v.showMentions12 ? (
              <>
                <div className="mention-menu12">
                  <small>MENTION IN THIS CONVERSATION</small>
                  {(v.mentions12 ?? []).map((m: any, i: number) => (
                    <Fragment key={i}>
                      <button onClick={m.pick}>
                        <span className="mention-avatar12">{interp(m.initial)}</span>
                        <span>
                          <strong>{interp(m.name)}</strong>
                          <small>{interp(m.copy)}</small>
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.planActive15 ? (
              <>
                <div className="plan-strip15">
                  <svg
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
                  <span>{interp(v.planCopy15)}</span>
                  <button className="text-button" onClick={v.togglePlan15}>
                    Turn plan mode off
                  </button>
                </div>
              </>
            ) : null}
            {v.goalActive12 ? (
              <>
                <div className="goal-strip12">
                  <svg
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
                  <span>{interp(v.goalText12)}</span>
                  <button className="text-button" onClick={v.toggleGoal12}>
                    {interp(v.goalAction12)}
                  </button>
                </div>
              </>
            ) : null}
            {v.hasTools15 ? (
              <>
                <div className="tool-chips15">
                  {(v.toolChips15 ?? []).map((c: any, i: number) => (
                    <Fragment key={i}>
                      <span className="tool-chip15">
                        {c.hasLogo ? (
                          <>
                            <img className={c.logoClass} src={c.logo} alt="" />
                          </>
                        ) : null}
                        {interp(c.name)}
                        <button type="button" className="icon-button" aria-label={c.removeLabel} onClick={c.remove}>
                          <svg
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
            <form className="composer10 composer11" onSubmit={v.sendComposer11}>
              {v.hasAttachments11 ? (
                <>
                  <div className="attachments11">
                    {(v.attachments11 ?? []).map((a: any, i: number) => (
                      <Fragment key={i}>
                        <div className="attachment11">
                          <button type="button" className="attachment-preview11" onClick={a.open}>
                            {a.image ? (
                              <>
                                <img src={a.url} alt={a.name} />
                              </>
                            ) : null}
                            {!a.image ? (
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
                                  <use href="/i15.svg#file-text" />
                                </svg>
                              </>
                            ) : null}
                            <span>
                              <strong>{interp(a.name)}</strong>
                              <small>{interp(a.meta)}</small>
                            </span>
                          </button>
                          <button className="icon-button" type="button" aria-label={a.removeLabel} onClick={a.remove}>
                            <svg
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
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </>
              ) : null}
              <div className={`route-head17 ${v.routeTone17}`}>
                <button
                  type="button"
                  className="rh-main17"
                  onClick={v.routePicker17}
                  title={v.routeTitle17}
                  aria-label="Routing for the next message"
                  aria-expanded={v.routePopover17}
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
                  {v.routeHasLogo17 ? (
                    <>
                      <img className={`brand12 rh-logo17 ${v.routeLogoClass17}`} src={v.routeLogo17} alt="" />
                    </>
                  ) : null}
                  <span className="rh-model17">{interp(v.routeModel17)}</span>
                  <span className="rh-sep17">·</span>
                  <span className="rh-acct17">{interp(v.routeAccount17)}</span>
                  <em className={`route-kind17 ${v.routeKindCls17}`}>{interp(v.routeKind17)}</em>
                  {v.routeHasBar17 ? (
                    <>
                      <span className="route-bar17">
                        <i style={css(v.routeBarStyle17)} />
                      </span>
                      <span className="route-left17">{interp(v.routeLeft17)}</span>
                    </>
                  ) : null}
                </button>
                {v.hasConversation10 ? (
                  <>
                    <button
                      type="button"
                      className="rh-cost17"
                      onClick={v.editTaskLimit17}
                      title="Task limit for this conversation. Click to edit."
                    >
                      <span className="rh-cost-long17">
                        {interp(v.conversationCost10)} of {interp(v.routeLimit17)}
                      </span>
                      <span className="rh-cost-short17">{interp(v.routeCostShort17)}</span>
                    </button>
                  </>
                ) : null}
              </div>
              <ComposerTextarea
                id="unified-composer"
                rows={2}
                aria-label="Message your Operator"
                placeholder={v.composerPlaceholder10}
                value={v.composerDraft10}
                onChange={v.editComposer10}
                onKeyDown={v.composerKey12} onPaste={v.composerPaste}
              />
              <div className="composer10-tools">
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Add files or context"
                  onClick={v.plusMenu15}
                  aria-expanded={v.plusOpen15}
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
                  className="composer10-choice model11"
                  type="button"
                  onClick={v.modelPicker11}
                  aria-label="Choose model"
                  aria-expanded={v.modelPopover10}
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
                          <button type="button" className="cbar-chiptext16" onClick={v.goalOpen16} title={v.goalFull16}>
                            {interp(v.goalShort16)}
                          </button>
                        </>
                      ) : null}
                      <button type="button" className="cbar-chipx16" aria-label="Remove goal" onClick={v.goalClear16}>
                        <svg
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
                {v.running12 ? (
                  <>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Stop current run"
                      title="Stop current run"
                      onClick={v.stopRun12}
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
                      type="button"
                      className="steer-btn18"
                      title="Interrupt the current turn with this message"
                      disabled={v.composerEmpty11}
                      onClick={v.steerNow18}
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
                        <use href="/i15.svg#zap" />
                      </svg>
                      <span>Steer now</span>
                    </button>
                  </>
                ) : null}
                <button
                  className={`icon-button mic11 ${v.micClass16}`}
                  type="button"
                  aria-label={v.micLabel16}
                  title={v.micLabel16}
                  aria-pressed={v.micOnStr16}
                  onClick={v.dictate10}
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
                  className="icon-button call10-button"
                  type="button"
                  aria-label="Start voice call"
                  onClick={v.startVoice10}
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
                    <use href="/i15.svg#audio-lines" />
                  </svg>
                </button>
                <button
                  className={`send-button ${v.sendCls18}`}
                  type="submit"
                  aria-label={v.sendLabel18}
                  title={v.sendLabel18}
                  disabled={v.composerEmpty11} onClick={v.sendComposer11}
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
                    <use href={v.sendIcon18} />
                  </svg>
                </button>
              </div>
            </form>
            <div className="composer10-foot">
              <button className="text-button mobile-account-usage13" aria-label="Account usage" onClick={v.allUsage12}>
                <img className="brand12" src="/assets/brands-v12/claude.svg" alt="" />
                <img className="brand12 mono12" src="/assets/brands-v12/codex.svg" alt="" />
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
                        <button type="button" className="cbar-chiptext16" onClick={v.goalOpen16} title={v.goalFull16}>
                          {interp(v.goalShort16)}
                        </button>
                      </>
                    ) : null}
                    <button type="button" className="cbar-chipx16" aria-label="Remove goal" onClick={v.goalClear16}>
                      <svg
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
                    <button type="button" className="cbar-chipx16" aria-label="Turn plan mode off" onClick={v.planClear16}>
                      <svg
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
            </div>
            {v.composerError10 ? (
              <>
                <p className="d9-error" role="alert">
                  {interp(v.composerError10)}
                </p>
              </>
            ) : null}
          </div>
          {v.welcome ? (
            <>
              <div className="welcome-actions10">
                <button onClick={v.startTriage10}>
                  <svg
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
                  Clear what needs me<span>{interp(v.attentionCount)}</span>
                </button>
                <button onClick={v.draftBuild10}>
                  <svg
                    className="ui-icon use14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <use href="/i15.svg#code" />
                  </svg>
                  Build something
                </button>
                <button onClick={v.draftResearch10}>
                  <svg
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
                  Research an idea
                </button>
              </div>
              <div className="welcome-plugins10">
                <span>Connected tools</span>
                {(v.featuredPlugins10 ?? []).map((p: any, i: number) => (
                  <Fragment key={i}>
                    <span className="welcome-plugin-tile16" aria-label={p.name} title={p.name}>
                      {p.brand12 ? (
                        <>
                          <img className={`brand12 ${p.brandClass12}`} src={p.brand12} alt="" />
                        </>
                      ) : null}
                      {!p.brand12 ? (
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
                            <use href={p.icon} />
                          </svg>
                        </>
                      ) : null}
                    </span>
                  </Fragment>
                ))}
                <button className="text-button" onClick={v.plugins10}>
                  Browse plugins{" "}
                  <svg
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
        </main>
      </>
    ) : null
  );
}
