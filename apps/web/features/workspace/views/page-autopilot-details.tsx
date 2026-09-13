/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageAutopilotDetails({ v }: { v: Vals }) {
  return (
    v.autopilotPage9 ? (
      <>
        <main className="autopilot9" data-screen-label="Autopilot details">
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
            </svg>{" "}
            Schedule
          </button>
          <div className="v7-page-heading">
            <div>
              <span className="n9-overline">{interp(v.autoStatus9)}</span>
              <h1>{interp(v.autoTitle9)}</h1>
              <p>{interp(v.autoPrompt9)}</p>
            </div>
            <button className="small-button" onClick={v.editAutopilot9} disabled={v.autoReadonly9}>
              Edit
            </button>
          </div>
          <section className="s9-summary">
            <div>
              <span>TRIGGER</span>
              <strong>{interp(v.autoTrigger9)}</strong>
              <small>{interp(v.autoNext9)}</small>
            </div>
            <div>
              <span>RUNS AS</span>
              <strong>{interp(v.autoOwner9)}</strong>
              <small>
                {interp(v.autoAgent9)} · {interp(v.autoComputer9)}
              </small>
            </div>
            <div>
              <span>RESULT</span>
              <strong>{interp(v.autoOutput9)}</strong>
              <small>{interp(v.autoScope9)}</small>
            </div>
            <div>
              <span>MODEL</span>
              <strong>{interp(v.autoModel17)}</strong>
              <small>{interp(v.autoRoute17)}</small>
            </div>
          </section>
          <div className="s9-detail-actions">
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
              </svg>{" "}
              Test a run
            </button>
            <button className="small-button" onClick={v.pauseAutopilot9} disabled={v.autoReadonly9}>
              {interp(v.autoPauseLabel9)}
            </button>
            <button className="text-button" onClick={v.autoAccess9}>
              Access & limits{" "}
              <svg
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
          {v.autoProblem9 ? (
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
                  <use href="/i15.svg#circle-alert" />
                </svg>
                <div>
                  <strong>{interp(v.autoProblemTitle9)}</strong>
                  <p>{interp(v.autoProblemCopy9)}</p>
                </div>
                <button className="small-button" onClick={v.autoResolve9}>
                  {interp(v.autoProblemAction9)}
                </button>
              </div>
            </>
          ) : null}
          <section className="s9-history">
            <header>
              <h2>Recent activity</h2>
              <span>{interp(v.autoHistoryCount9)} events</span>
            </header>
            {(v.autoHistory9 ?? []).map((h: any, i: number) => (
              <Fragment key={i}>
                <button className="s9-history-row" onClick={h.open}>
                  <span className={`c9-status ${h.tone}`}>
                    <svg
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
                  <span>
                    <strong>{interp(h.title)}</strong>
                    <small>{interp(h.detail)}</small>
                  </span>
                  <time>{interp(h.when)}</time>
                  <svg
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
            {v.autoNoHistory9 ? (
              <>
                <p className="fine">No runs yet. Your first result will appear here.</p>
              </>
            ) : null}
          </section>
        </main>
      </>
    ) : null
  );
}
