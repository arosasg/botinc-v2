/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import { ComposerTextarea } from "../composer-textarea";
import { MessageText } from "../message-text";

export function PageWorkConversation({ v }: { v: Vals }) {
  return (
    v.threadPage9 ? (
      <>
        <main className="thread9" data-screen-label="Work conversation">
          <header className="t9-heading">
            <button className="icon-button t9-back" aria-label="Back to conversations" onClick={v.allConversations9}>
              <svg
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
                {interp(v.issue?.id)} <span>·</span> {interp(v.threadStatus9)} <span>·</span>{" "}
                <span className="thread-privacy12">Shared with BotInc</span>
              </span>
              <h1>{interp(v.threadTitle10)}</h1>
              {v.wfLive18 ? (
                <>
                  <button
                    type="button"
                    className={`wf-line18 ${v.wfLiveTone18}`}
                    onClick={v.openWorkflowPane18}
                    title={v.wfLiveTitle18}
                  >
                    <span className="wf-dots18" aria-hidden="true">
                      {(v.wfDots18 ?? []).map((d: any, i: number) => (
                        <Fragment key={i}>
                          <i className={d.cls} />
                        </Fragment>
                      ))}
                    </span>
                    <strong>{interp(v.wfLiveStep18)}</strong>
                    <small>{interp(v.wfLiveMeta18)}</small>
                    <svg
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
            </div>
            {v.headNeeds15 ? (
              <>
                <button
                  className={`head-need15 ${v.headNeedTone15}`}
                  onClick={v.headNeedGo15}
                  aria-label={v.headNeedAria15}
                  title={v.headNeedTitle15}
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
                    <use href={v.headNeedIcon15} />
                  </svg>
                  <span>{interp(v.headNeedLabel15)}</span>
                </button>
              </>
            ) : null}
            <button className="small-button" onClick={v.openTaskDetails9} aria-label="Task details">
              <svg
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
          </header>
          <div className="t9-scroll">
            <div className="t9-cols15">
              <div className="t9-inner">
                {v.hasScenario13 ? (
                  <>
                    <div className="history-nav13">
                      <span>
                        {interp(v.scenarioCount13)} messages <i>·</i> {interp(v.workflowRunSummary12)}
                      </span>
                      <button className="text-button" onClick={v.showStart13}>
                        Read from start{" "}
                        <svg
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
                    {v.hasEarlier13 ? (
                      <>
                        <button className="earlier13" onClick={v.showEarlier13}>
                          <svg
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
                          {interp(v.earlierCount13)} earlier messages{" "}
                          <span className="earlier-copy13">Plan, implementation & two reviews</span>
                          <svg
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
                    <div className="conversation-log13" aria-label="Conversation history">
                      {(v.scenarioRows13 ?? []).map((m: any, i: number) => (
                        <Fragment key={i}>
                          <article className={`entry13 ${m.cls}`}>
                            {m.isWork ? (
                              <>
                                <div className={`wb16 ${m.openCls16}`}>
                                  <div className="wb-head16">
                                    <button
                                      type="button"
                                      className="wb-toggle16"
                                      aria-expanded={m.expanded16}
                                      aria-label={m.toggleAria16}
                                      onClick={m.toggle16}
                                    >
                                      <img className={`brand12 ${m.brandClass12}`} src={m.brand12} alt="" />
                                      <span className="wb-name16">
                                        <strong>{interp(m.who)}</strong>
                                        <small>{interp(m.model)}</small>
                                      </span>
                                      <span className="wb-outcome16">{interp(m.text)}</span>
                                      <span className={`wb-state16 ${m.tone16}`}>{interp(m.badge)}</span>
                                      <svg
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
                                  {m.expanded16 ? (
                                    <>
                                      <div className="wb-body16">
                                        <p className="wb-detail16">{interp(m.detail)}</p>
                                        {(m.progress16 ?? []).map((p: any, i: number) => (
                                          <Fragment key={i}>
                                            <div className="wb-line16">
                                              <time>{interp(p.time)}</time>
                                              <span>{interp(p.text)}</span>
                                            </div>
                                          </Fragment>
                                        ))}
                                        {m.hasTools16 ? (
                                          <>
                                            <div className="wb-tools16">
                                              <button
                                                type="button"
                                                className="wb-toolhead16"
                                                aria-expanded={m.toolsOpen16}
                                                onClick={m.toggleTools16}
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
                                                  <use href="/i15.svg#terminal" />
                                                </svg>
                                                <span>{interp(m.toolSummary16)}</span>
                                                <svg
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
                                              {m.toolsOpen16 ? (
                                                <>
                                                  <div className="wb-toollist16">
                                                    {(m.toolRows16 ?? []).map((t: any, i: number) => (
                                                      <Fragment key={i}>
                                                        <div className={`wb-tool16 ${t.tone}`}>
                                                          <svg
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
                                                        </div>
                                                      </Fragment>
                                                    ))}
                                                  </div>
                                                </>
                                              ) : null}
                                            </div>
                                          </>
                                        ) : null}
                                        {m.hasChildren16 ? (
                                          <>
                                            <div className="wb-kids16">
                                              <span className="wb-kidlabel16">
                                                <svg
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
                                                {interp(m.childLabel16)}
                                              </span>
                                              {(m.children16 ?? []).map((c: any, i: number) => (
                                                <Fragment key={i}>
                                                  <button type="button" className="wb-kid16" onClick={c.open}>
                                                    <svg
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
                                                      <small>{interp(c.model)}</small>
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
                                        <footer className="wb-foot16">
                                          <button className="text-button" onClick={m.openThread16}>
                                            Open full thread{" "}
                                            <svg
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
                                          <button className="text-button" onClick={m.reply}>
                                            Reply in thread{" "}
                                            <svg
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
                                          <small>{interp(m.entryCount16)}</small>
                                        </footer>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </>
                            ) : null}
                            {m.route17 ? (
                              <>
                                <div className={`route-note17 ${m.routeTone}`}>
                                  <i className="route-dot17" />
                                  {m.hasLogo ? (
                                    <>
                                      <img className={`brand12 ${m.logoClass}`} src={m.logo} alt="" />
                                    </>
                                  ) : null}
                                  <span className="route-note-text17">{interp(m.text)}</span>
                                  {m.hasLeft ? (
                                    <>
                                      <span className="route-bar17">
                                        <i style={css(m.barStyle)} />
                                      </span>
                                      <span className="route-left17">{interp(m.left)}</span>
                                    </>
                                  ) : null}
                                  <time>{interp(m.time)}</time>
                                </div>
                              </>
                            ) : null}
                            {m.plain17 ? (
                              <>
                                <header>
                                  {m.operator ? (
                                    <>
                                      <img src="/assets/logo/botinc-mark.svg" alt="" />
                                    </>
                                  ) : null}
                                  {m.human ? (
                                    <>
                                      <span className="person13">{interp(m.initial)}</span>
                                    </>
                                  ) : null}
                                  <strong>{interp(m.who)}</strong>
                                  <time>{interp(m.time)}</time>
                                </header>
                                <MessageText text={String(m.text ?? "")} />
                                {m.hasOptions ? (
                                  <>
                                    <div className="answered13">
                                      {(m.options ?? []).map((o: any, i: number) => (
                                        <Fragment key={i}>
                                          <span>{interp(o.label)}</span>
                                        </Fragment>
                                      ))}
                                      <small>Answered below</small>
                                    </div>
                                  </>
                                ) : null}
                                {m.artifact ? (
                                  <>
                                    <button className="chat-artifact13" onClick={m.openArtifact}>
                                      <svg
                                        className="ui-icon use14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.75"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <use href={m.artifactIcon} />
                                      </svg>
                                      <span>
                                        <strong>{interp(m.artifactTitle)}</strong>
                                        <small>{interp(m.artifactMeta)}</small>
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
                                <footer className="entry-actions13">
                                  <button aria-label="Quote message" onClick={m.quote}>
                                    <svg
                                      className="ui-icon use14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.75"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <use href="/i15.svg#quote" />
                                    </svg>
                                  </button>
                                  <button aria-label="Copy message" onClick={m.copy}>
                                    <svg
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
                                  <button aria-label="Fork a new conversation from this message" onClick={m.fork14}>
                                    <svg
                                      className="ui-icon use14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.75"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <use href="/i15.svg#git-fork" />
                                    </svg>
                                  </button>
                                  {m.human ? (
                                    <>
                                      <button aria-label="Edit this message as a branch" onClick={m.branch14}>
                                        <svg
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
                                    </>
                                  ) : null}
                                  <button aria-label="More actions for this message" onClick={m.more14}>
                                    <svg
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
                                </footer>
                              </>
                            ) : null}
                          </article>
                        </Fragment>
                      ))}
                    </div>
                  </>
                ) : null}
                {!v.hasScenario13 ? (
                  <>
                    <button className="t9-origin" onClick={v.sourceDetail}>
                      <img className={`brand12 ${v.sourceBrandClass12}`} src={v.sourceBrand12} alt="" />
                      <span>{interp(v.threadSource9)}</span>
                      <svg
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
                    <details className="t9-request">
                      <summary>
                        Original request{" "}
                        <svg
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
                      <MessageText text={String(v.issue?.description ?? "")} />
                    </details>
                    <article className="t9-message">
                      <div className="message-author">
                        <img src="/assets/agents/operator.svg" alt="" />
                        <span>Operator</span>
                        <small>Your work, coordinated</small>
                      </div>
                      <p>{interp(v.threadSummary9)}</p>
                    </article>
                  </>
                ) : null}
                {v.threadHasArtifact9 ? (
                  <>
                    <button className="t9-artifact" onClick={v.openThreadResult9}>
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
                        <strong>{interp(v.threadArtifactTitle9)}</strong>
                        <small>{interp(v.threadArtifactMeta9)}</small>
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
                {v.threadNeeds9 ? (
                  <>
                    <section className={`d9-card ${v.reviewClass13}`} id="decision13" aria-label="Decision needed">
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
                          {interp(v.decisionType9)}
                        </span>
                        <small>{interp(v.decisionProgress9)}</small>
                      </div>
                      <h2>{interp(v.decisionQuestion9)}</h2>
                      <p>{interp(v.decisionContext9)}</p>
                      {v.decisionHasAnswers9 ? (
                        <>
                          <div className="d9-answers">
                            {(v.decisionAnswers9 ?? []).map((a: any, i: number) => (
                              <Fragment key={i}>
                                <p>
                                  <span>{interp(a.question)}</span>
                                  <strong>{interp(a.answer)}</strong>
                                </p>
                              </Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {v.decisionAsking9 ? (
                        <>
                          <div className="d9-options">
                            {(v.decisionOptions9 ?? []).map((o: any, i: number) => (
                              <Fragment key={i}>
                                <button className="small-button" onClick={o.pick}>
                                  {interp(o.label)}
                                </button>
                              </Fragment>
                            ))}
                          </div>
                          <p className="d9-answer-hint">Or answer in the conversation below.</p>
                        </>
                      ) : null}
                      {v.decisionExternal9 ? (
                        <>
                          <button className="small-button primary" onClick={v.resolveExternal9}>
                            {interp(v.decisionExternalLabel9)}{" "}
                            <svg
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
                      {v.decisionConfirm9 ? (
                        <>
                          <div className="d9-options">
                            <button className="small-button" onClick={v.editAnswers9}>
                              Edit answers
                            </button>
                            <button className="small-button primary" onClick={v.continueDecision9}>
                              Confirm & continue{" "}
                              <svg
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
                          <p className="fine">{interp(v.decisionContinueCopy9)}</p>
                        </>
                      ) : null}
                      {v.decisionError9 ? (
                        <>
                          <p className="d9-error" role="alert">
                            {interp(v.decisionError9)}
                          </p>
                        </>
                      ) : null}
                      <footer>
                        <span>{interp(v.decisionOwner9)}</span>
                        <button className="text-button" onClick={v.callThisDecision9}>
                          <svg
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
                {v.threadWaiting9 ? (
                  <>
                    <div className="t9-waiting">
                      <svg
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
                      <div>
                        <strong>{interp(v.threadWaitingTitle9)}</strong>
                        <p>{interp(v.threadWaitingCopy9)}</p>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.threadResumed9 ? (
                  <>
                    <div className="t9-resumed">
                      <svg
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
                      <div>
                        <strong>Your decisions are saved.</strong>
                        <p>{interp(v.resumedCopy9)}</p>
                      </div>
                      {v.hasNextDecision9 ? (
                        <>
                          <button className="small-button" onClick={v.unblockNext9}>
                            Next item{" "}
                            <svg
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
                {!v.hasScenario13 ? (
                  <>
                    {v.hasStages12 ? (
                      <>
                        <details className="run-stack12" aria-label="Workflow threads">
                          <summary className="run-stack-summary12">
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
                                <use href="/i15.svg#git-branch" />
                              </svg>{" "}
                              Implementation & review
                            </span>
                            <small>{interp(v.workflowRunSummary12)}</small>
                            <svg
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
                          {(v.stageRows12 ?? []).map((r: any, i: number) => (
                            <Fragment key={i}>
                              <details className="stage-thread12">
                                <summary>
                                  <img className={`brand12 ${r.brandClass12}`} src={r.brand12} alt="" />
                                  <span>
                                    <strong>{interp(r.stage)}</strong>
                                    <small>{interp(r.summary)}</small>
                                  </span>
                                  <span className={`stage-state12 ${r.tone}`}>{interp(r.status)}</span>
                                  <svg
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
                                <div className="stage-messages12">
                                  <p className="stage-provenance12">
                                    {interp(r.id)} · {interp(r.model)} · {interp(r.when)} · {interp(r.costLabel)}
                                  </p>
                                  {(r.messages ?? []).map((m: any, i: number) => (
                                    <Fragment key={i}>
                                      <article>
                                        <strong>{interp(m.who)}</strong>
                                        <MessageText text={String(m.text ?? "")} />
                                      </article>
                                    </Fragment>
                                  ))}
                                  <footer>
                                    <button className="text-button" onClick={r.reply}>
                                      <svg
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
                                      </svg>{" "}
                                      Reply in thread
                                    </button>
                                    <button className="text-button" onClick={r.open}>
                                      Inspect run{" "}
                                      <svg
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
                                </div>
                              </details>
                            </Fragment>
                          ))}
                          <footer className="run-stack-footer12">
                            <button className="text-button" onClick={v.allRuns12}>
                              Inspect all runs{" "}
                              <svg
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
                        </details>
                      </>
                    ) : null}
                  </>
                ) : null}
                {(v.threadMessages9 ?? []).map((m: any, i: number) => (
                  <Fragment key={i}>
                    {m.route17 ? (
                      <>
                        <div className={`route-note17 ${m.routeTone}`}>
                          <i className="route-dot17" />
                          {m.hasLogo ? (
                            <>
                              <img className={`brand12 ${m.logoClass}`} src={m.logo} alt="" />
                            </>
                          ) : null}
                          <span className="route-note-text17">{interp(m.text)}</span>
                          {m.hasLeft ? (
                            <>
                              <span className="route-bar17">
                                <i style={css(m.barStyle)} />
                              </span>
                              <span className="route-left17">{interp(m.left)}</span>
                            </>
                          ) : null}
                          <time>{interp(m.time)}</time>
                        </div>
                      </>
                    ) : null}
                    {!m.route17 ? (
                      <>
                        <article className={`t9-message ${m.cls18}`}>
                          <div className="message-author">
                            <span>{interp(m.who)}</span>
                            <small>{interp(m.when)}</small>
                            {m.mine18 ? (
                              <>
                                <span className="msg-tools18">
                                  <button
                                    type="button"
                                    className="icon-button"
                                    aria-label="Edit message"
                                    title="Edit"
                                    onClick={m.edit18}
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
                                      <use href="/i15.svg#square-pen" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="icon-button"
                                    aria-label="Fork the conversation from here"
                                    title="Fork from here"
                                    onClick={m.fork18}
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
                                      <use href="/i15.svg#git-fork" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="icon-button"
                                    aria-label="Copy message"
                                    title="Copy"
                                    onClick={m.copy18}
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
                                </span>
                              </>
                            ) : null}
                          </div>
                          {!m.editing18 ? (
                            <>
                              <MessageText text={String(m.text ?? "")} />
                            </>
                          ) : null}
                          {m.editing18 ? (
                            <>
                              <div className="msg-edit18">
                                <textarea
                                  rows={3}
                                  aria-label="Edit message"
                                  value={v.editDraft18}
                                  onChange={v.editDraftEdit18}
                                  onKeyDown={v.editKey18}
                                />
                                <div className="msg-editrow18">
                                  <small>{interp(v.editHint18)}</small>
                                  <button type="button" className="text-button" onClick={v.editCancel18}>
                                    Cancel
                                  </button>
                                  {v.running12 ? (
                                    <>
                                      <button type="button" className="small-button" onClick={v.editQueue18}>
                                        Queue
                                      </button>
                                      <button type="button" className="small-button primary" onClick={v.editSteer18}>
                                        <svg
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
                                        Steer now
                                      </button>
                                    </>
                                  ) : null}
                                  {!v.running12 ? (
                                    <>
                                      <button type="button" className="small-button primary" onClick={v.editSend18}>
                                        Send
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </>
                          ) : null}
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
                        </article>
                      </>
                    ) : null}
                  </Fragment>
                ))}
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
                          <button type="button" className="bp-stage15" onClick={v.bpExpand15} aria-label={v.bpStageAria15}>
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
                            <button className="icon-button" aria-label="Replay from the first step" onClick={v.bpReplay15}>
                              <svg
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
          {v.hasScenario13 ? (
            <>
              <div className="jump-row13">
                <button onClick={v.showStart13}>
                  <svg
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
                  {interp(v.scenarioCount13)} messages
                </button>
                <button onClick={v.jumpLatest13}>
                  <svg
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
                  </svg>{" "}
                  Latest update
                </button>
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
        </main>
      </>
    ) : null
  );
}
