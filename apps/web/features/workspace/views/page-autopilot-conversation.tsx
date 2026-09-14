/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";
import { MessageText } from "../message-text";

export function PageAutopilotConversation({ v }: { v: Vals }) {
  return (
    v.autoConversation10 ? (
      <>
        <main className="auto-chat10" data-screen-label="Autopilot conversation">
          <header className="chat10-heading">
            <div>
              <button className="text-button" onClick={v.showSchedule9}>
                <svg
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
                Schedule
              </button>
              <h1>{interp(v.autoTitle9)}</h1>
              <p>
                {interp(v.autoTrigger9)} · {interp(v.autoNext9)}
              </p>
            </div>
            <div className="rt-acts16">
              <button className="small-button" onClick={v.pauseAutopilot9} disabled={v.autoReadonly9}>
                <svg
                  className="ui-icon use14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <use href={v.rtPauseIcon16} />
                </svg>
                {interp(v.rtPauseLabel16)}
              </button>
              <button className="small-button" onClick={v.editAutopilot9} disabled={v.autoReadonly9}>
                <svg
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
                Edit
              </button>
              <button className="small-button primary" onClick={v.runAutopilot9} disabled={v.autoReadonly9}>
                <svg
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
                </svg>
                Run now
              </button>
              <button className="icon-button" aria-label="Routine actions" onClick={v.rtMenu16}>
                <svg
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
          </header>
          <div className="w8-bar16 rt-bar16">
            <nav className="w8-nav w8-nav16" aria-label="Routine views">
              {(v.rtTabs16 ?? []).map((t: any, i: number) => (
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
          </div>
          <div className="auto-chat-scroll10 rt-page16">
            {v.rtOverview16 ? (
              <>
                {v.autoProblem9 ? (
                  <>
                    <div className="auto-block10">
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
                          <use href="/i15.svg#circle-alert" />
                        </svg>
                        Needs attention
                      </span>
                      <h2>{interp(v.autoProblemTitle10)}</h2>
                      <p>{interp(v.autoProblemCopy10)}</p>
                      <div>
                        <button className="small-button primary" onClick={v.fixAutopilot10}>
                          Fix with Operator
                        </button>
                        <button className="small-button" onClick={v.voiceRepair10}>
                          <svg
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
                          Talk it through
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
                <section className="rt-card16">
                  <header className="rt-cardhead16">
                    <h2>This routine</h2>
                    <span className={`rt-runstate16 ${v.rtStateTone16}`}>{interp(v.rtStateWord16)}</span>
                  </header>
                  <dl className="rt-dl16">
                    {(v.rtDefs16 ?? []).map((d: any, i: number) => (
                      <Fragment key={i}>
                        <div className={`rt-dlrow16 ${d.cls}`}>
                          <dt>
                            <svg
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
                            {interp(d.k)}
                          </dt>
                          <dd>
                            {!d.editing ? (
                              <>
                                <strong>{interp(d.v)}</strong>
                                {d.hasNote ? (
                                  <>
                                    <small>{interp(d.note)}</small>
                                  </>
                                ) : null}
                              </>
                            ) : null}
                            {d.editing ? (
                              <>
                                <div className="rt-limitedit16">
                                  <label className="af-money16">
                                    <b>$</b>
                                    <input
                                      className="field"
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={v.rtLimitRun16}
                                      onInput={v.rtEditLimitRun16}
                                      aria-label="Limit per run"
                                    />
                                    <small>per run</small>
                                  </label>
                                  <label className="af-money16">
                                    <b>$</b>
                                    <input
                                      className="field"
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={v.rtLimitDay16}
                                      onInput={v.rtEditLimitDay16}
                                      aria-label="Daily limit"
                                    />
                                    <small>per day</small>
                                  </label>
                                  <div className="rt-limitacts16">
                                    <button className="small-button" onClick={v.rtLimitCancel16}>
                                      Cancel
                                    </button>
                                    <button className="small-button primary" onClick={v.rtLimitSave16}>
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : null}
                          </dd>
                          {d.hasAction ? (
                            <>
                              <button
                                type="button"
                                className="text-button rt-dlact16"
                                onClick={d.act}
                                disabled={v.autoReadonly9}
                              >
                                {interp(d.actionLabel)}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </Fragment>
                    ))}
                  </dl>
                </section>
                <section className="rt-card16 rt-instr16">
                  <header className="rt-cardhead16">
                    <div className="rt-instrtitle16">
                      <h2>Instructions</h2>
                      <span>{interp(v.rtInstrMeta16)}</span>
                    </div>
                    {!v.rtEditing16 ? (
                      <>
                        <button className="text-button" onClick={v.rtEditStart16} disabled={v.autoReadonly9}>
                          Edit{" "}
                          <svg
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
                    {v.rtEditing16 ? (
                      <>
                        <div className="rt-instracts16">
                          <button className="small-button" onClick={v.rtEditCancel16}>
                            Cancel
                          </button>
                          <button className="small-button primary" onClick={v.rtEditSave16}>
                            Save
                          </button>
                        </div>
                      </>
                    ) : null}
                  </header>
                  {!v.rtEditing16 ? (
                    <>
                      <div className={`rt-instrbody16 ${v.rtInstrClamp16}`}>
                        <div className="md16">
                          {(v.rtInstrBlocks16 ?? []).map((b: any, i: number) => (
                            <Fragment key={i}>
                              {b.h1 ? (
                                <>
                                  <h3 className="md-h1-16">{interp(b.text)}</h3>
                                </>
                              ) : null}
                              {b.h2 ? (
                                <>
                                  <h4 className="md-h2-16">{interp(b.text)}</h4>
                                </>
                              ) : null}
                              {b.p ? (
                                <>
                                  <p className="md-p16">{interp(b.text)}</p>
                                </>
                              ) : null}
                              {b.li ? (
                                <>
                                  <div className="md-li16">
                                    <i />
                                    <span>{interp(b.text)}</span>
                                  </div>
                                </>
                              ) : null}
                              {b.num ? (
                                <>
                                  <div className="md-li16 md-num16">
                                    <b>{interp(b.n)}</b>
                                    <span>{interp(b.text)}</span>
                                  </div>
                                </>
                              ) : null}
                              {b.code ? (
                                <>
                                  <pre className="md-code16">{interp(b.text)}</pre>
                                </>
                              ) : null}
                              {b.hr ? (
                                <>
                                  <hr className="md-hr16" />
                                </>
                              ) : null}
                            </Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="rt-instrfoot16">
                        {v.rtInstrLong16 ? (
                          <>
                            <button className="text-button" onClick={v.rtInstrToggle16}>
                              {interp(v.rtInstrToggleLabel16)}{" "}
                              <svg
                                className="ui-icon use14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href={v.rtInstrToggleIcon16} />
                              </svg>
                            </button>
                          </>
                        ) : null}
                        <span className="fine">
                          Read by the Operator at the start of every run, together with your preferences.
                        </span>
                      </div>
                    </>
                  ) : null}
                  {v.rtEditing16 ? (
                    <>
                      <textarea
                        className="field rt-instredit16"
                        value={v.rtDraft16}
                        onInput={v.rtEditDraft16}
                        aria-label="Routine instructions"
                        spellCheck="false"
                      />
                      <div className="rt-instrfoot16">
                        <span className="fine">
                          Markdown. Headings, lists and code blocks are kept. Saving changes future runs only.
                        </span>
                        <span className="rt-instrcount16">{interp(v.rtDraftCount16)}</span>
                      </div>
                    </>
                  ) : null}
                </section>
                {v.rtHasMessages16 ? (
                  <>
                    <div className="rt-logtitle16">
                      <h2>Conversation</h2>
                    </div>
                    {(v.autoMessages10 ?? []).map((m: any, i: number) => (
                      <Fragment key={i}>
                        <article className="message10">
                          <div className="message-author">
                            <strong>{interp(m.who)}</strong>
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
                        </article>
                      </Fragment>
                    ))}
                  </>
                ) : null}
              </>
            ) : null}
            {v.rtRunsTab16 ? (
              <>
                <div className="rt-runbar16">
                  <button
                    type="button"
                    className={`sel14 ${v.m14_runFilter10?.cls}`}
                    aria-haspopup="listbox"
                    aria-expanded={v.m14_runFilter10?.expanded}
                    aria-label="Filter runs"
                    onClick={v.m14_runFilter10?.pick}
                  >
                    <span>{interp(v.m14_runFilter10?.label)}</span>
                    <svg
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
                  <span className="rt-runcount16">{interp(v.rtRunCount16)}</span>
                </div>
                <div className="rt-runs16">
                  {(v.rtRunRows16 ?? []).map((r: any, i: number) => (
                    <Fragment key={i}>
                      <article className="rt-run16">
                        <span className={`rt-runmark16 ${r.tone16}`}>
                          <svg
                            className="ui-icon use14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <use href={r.icon16} />
                          </svg>
                        </span>
                        <span className="rt-runbody16">
                          <strong>{interp(r.title)}</strong>
                          <small>{interp(r.detail)}</small>
                        </span>
                        <span className={`rt-runstate16 ${r.tone16}`}>{interp(r.stateWord16)}</span>
                        <time className="rt-runwhen16">{interp(r.when)}</time>
                        <button className="text-button" onClick={r.open}>
                          Details{" "}
                          <svg
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
                      </article>
                    </Fragment>
                  ))}
                </div>
                {v.noRuns10 ? (
                  <>
                    <div className="empty10">
                      <svg
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
                      <h2>No runs in this view</h2>
                      <p>Each run will appear here with its result and any next step.</p>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </main>
      </>
    ) : null
  );
}
