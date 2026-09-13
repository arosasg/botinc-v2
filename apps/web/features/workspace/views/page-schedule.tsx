/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageSchedule({ v }: { v: Vals }) {
  return (
    v.schedulePage9 ? (
      <>
        <main className="schedule9 schedule14" data-screen-label="Schedule">
          <div className="v7-page-heading">
            <div>
              <h1>Schedule</h1>
              <p>{interp(v.scheduleSummary14)}</p>
            </div>
            <div className="head-actions14">
              <button className="small-button primary" onClick={v.newAutopilot9}>
                <svg
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
          <div className="s14-context16">
            <nav className="w8-nav s14-nav" aria-label="Schedule views">
              {(v.scheduleTabs14 ?? []).map((t: any, i: number) => (
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
            <span className="zone-chip14 zone16" title="Every time on this page is in this zone">
              <svg
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
              {interp(v.scheduleZone14)}
            </span>
          </div>
          {v.scheduleUpcoming14 ? (
            <>
              <div className="s14-list" aria-label="Upcoming runs">
                {(v.upcomingRows14 ?? []).map((r: any, i: number) => (
                  <Fragment key={i}>
                    <article className="s14-up">
                      <span className="s14-when">
                        <strong>{interp(r.when)}</strong>
                        <small>{interp(r.whenNote)}</small>
                      </span>
                      <button className="s14-open" onClick={r.open}>
                        <strong>{interp(r.title)}</strong>
                        <small>{interp(r.trigger)}</small>
                      </button>
                      <span className="s14-src">
                        {r.hasSourceLogo ? (
                          <>
                            <img className={`brand12 ${r.sourceLogoClass}`} src={r.sourceLogo} alt="" />
                          </>
                        ) : null}
                        {!r.hasSourceLogo ? (
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
                              <use href={r.icon} />
                            </svg>
                          </>
                        ) : null}
                        {interp(r.source)}
                      </span>
                      <span className={`s14-state ${r.tone}`}>{interp(r.state)}</span>
                      <button className="icon-button" aria-label={r.menuLabel} onClick={r.actions}>
                        <svg
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
                    </article>
                  </Fragment>
                ))}
                {v.noUpcoming14 ? (
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
                        <use href="/i15.svg#calendar-clock" />
                      </svg>
                      <strong>Nothing is scheduled to run</strong>
                      <p>Enable a routine, or create one that starts on a schedule, an event or an API request.</p>
                      <button className="small-button" onClick={v.newAutopilot9}>
                        Create a routine
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
          {v.scheduleRoutines14 ? (
            <>
              <div className="s14-list" aria-label="Routines">
                {(v.routineRows14 ?? []).map((r: any, i: number) => (
                  <Fragment key={i}>
                    <article className="s14-row">
                      <label className="s9-switch s14-switch">
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          onChange={r.toggle}
                          aria-label={r.toggleLabel}
                          disabled={r.readonly}
                        />
                        <span />
                      </label>
                      <button className="s14-open" onClick={r.open}>
                        <strong>{interp(r.title)}</strong>
                        <small>{interp(r.trigger)}</small>
                      </button>
                      <span className="s14-col s14-next">
                        <small>Next run</small>
                        <strong className={r.tone}>{interp(r.next)}</strong>
                      </span>
                      <span className="s14-col s14-source">
                        <small>Source</small>
                        <strong>
                          {r.hasSourceLogo ? (
                            <>
                              <img className={`brand12 ${r.sourceLogoClass}`} src={r.sourceLogo} alt="" />
                            </>
                          ) : null}
                          {!r.hasSourceLogo ? (
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
                                <use href={r.icon} />
                              </svg>
                            </>
                          ) : null}
                          {interp(r.source)}
                        </strong>
                      </span>
                      <span className="s14-action-slot">
                        {r.hasProblem ? (
                          <>
                            <button className="small-button s14-fix" onClick={r.fix}>
                              {interp(r.problemLabel)}
                            </button>
                          </>
                        ) : null}
                      </span>
                      <button
                        className="small-button s14-edit"
                        onClick={r.edit}
                        disabled={r.readonly}
                        aria-label={r.editLabel}
                      >
                        Edit
                      </button>
                      <button className="icon-button" aria-label={r.menuLabel} onClick={r.actions}>
                        <svg
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
                    </article>
                  </Fragment>
                ))}
                {v.noRoutines14 ? (
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
                        <use href="/i15.svg#bot" />
                      </svg>
                      <strong>No routines yet</strong>
                      <p>
                        A routine starts work on a schedule, when a connector event arrives, or when your API asks for it.
                      </p>
                      <button className="small-button" onClick={v.newAutopilot9}>
                        Create a routine
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
          {v.scheduleHistory14 ? (
            <>
              <div className="s14-history" aria-label="Run history">
                {(v.historyRows14 ?? []).map((h: any, i: number) => (
                  <Fragment key={i}>
                    <article className="s14-hrow">
                      <span className={`s14-hicon ${h.tone}`}>
                        <svg
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
                      </span>
                      <span className="s14-hbody">
                        <strong>{interp(h.title)}</strong>
                        <small>{interp(h.detail)}</small>
                        {h.hasRoute17 ? (
                          <>
                            <small className="s14-hroute17">
                              <svg
                                className="ui-icon use14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href={h.routeIcon17} />
                              </svg>
                              {interp(h.route17)}
                            </small>
                          </>
                        ) : null}
                      </span>
                      <span className="s14-hroutine">{interp(h.routine)}</span>
                      <time>{interp(h.when)}</time>
                      <span className="s14-haction15">
                        {h.hasAction ? (
                          <>
                            <button className="text-button" onClick={h.action}>
                              <svg
                                className="ui-icon use14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <use href={h.actionIcon} />
                              </svg>
                              {interp(h.actionLabel)}
                            </button>
                          </>
                        ) : null}
                      </span>
                    </article>
                  </Fragment>
                ))}
                {v.noHistory14 ? (
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
                        <use href="/i15.svg#history" />
                      </svg>
                      <strong>No recorded runs</strong>
                      <p>Runs appear here after a routine starts.</p>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
          <p className="s9-foot">Sample routines and recorded activity. Nothing runs from this design.</p>
        </main>
      </>
    ) : null
  );
}
