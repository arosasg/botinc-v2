/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function OverlayOverlay12({ v }: { v: Vals }) {
  return (
    v.workflowListOpen14 ? (
      <>
        <div className="overlay12">
          <section className="sheet12 wf-list14" role="dialog" aria-modal="true" aria-label="Workflows">
            <header>
              <div>
                <small>SETTINGS / ADVANCED</small>
                <h2>Workflows</h2>
              </div>
              <button className="icon-button" aria-label="Close workflows" onClick={v.closeWorkflows14}>
                <svg
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
            <p>
              A workflow is the ordered set of steps behind complex work. Saving a version changes future runs only;
              recorded runs keep the version they executed.
            </p>
            <div className="wf-rows14">
              {(v.workflowRows14 ?? []).map((w: any, i: number) => (
                <Fragment key={i}>
                  <article className={`wf-row14 ${w.cls}`}>
                    <button className="wf-open14" onClick={w.open}>
                      <span className="wf-mark14">
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href={w.icon} />
                        </svg>
                      </span>
                      <span>
                        <strong>{interp(w.name)}</strong>
                        <small>{interp(w.meta)}</small>
                      </span>
                    </button>
                    <span className={`wf-state14 ${w.tone}`}>{interp(w.state)}</span>
                    <button className="small-button" onClick={w.open}>
                      {interp(w.action)}
                    </button>
                  </article>
                </Fragment>
              ))}
            </div>
            <footer>
              <button className="text-button" onClick={v.workflowsPage16}>
                Open in Settings{" "}
                <svg
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
              <button className="small-button" onClick={v.closeWorkflows14}>
                Close
              </button>
              <button className="small-button primary" onClick={v.newWorkflow14}>
                <svg
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
                New workflow
              </button>
            </footer>
          </section>
        </div>
      </>
    ) : null
  );
}
