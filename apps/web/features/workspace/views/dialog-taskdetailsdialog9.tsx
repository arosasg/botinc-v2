/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogTaskdetailsdialog9({ v }: { v: Vals }) {
  return (
    v.taskDetailsDialog9 ? (
      <>
        <div className="task-sheet9">
          <span className="sheet-grabber9" />
          <span className="n9-overline">{interp(v.issue?.id)} · TASK DETAILS</span>
          <h2 id="dialog-title">{interp(v.issue?.title)}</h2>
          <dl>
            <dt>Status</dt>
            <dd>{interp(v.threadStatus9)}</dd>
            <dt>Execution owner</dt>
            <dd>{interp(v.issue?.owner)}</dd>
            <dt>Project</dt>
            <dd>{interp(v.i8Project)}</dd>
            <dt>Source</dt>
            <dd>
              <button className="text-button" onClick={v.sourceDetail}>
                {interp(v.threadSource9)}{" "}
                <svg
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
            </dd>
            <dt>Funding</dt>
            <dd>{interp(v.i8Funding)}</dd>
          </dl>
          <h3>Acceptance criteria</h3>
          <ul>
            {(v.i8Criteria ?? []).map((c: any, i: number) => (
              <Fragment key={i}>
                <li>{interp(c)}</li>
              </Fragment>
            ))}
          </ul>
          <div className="d9-options">
            <button className="small-button" onClick={v.openFullIssue9}>
              All issue details
            </button>
            <button className="small-button" onClick={v.openExecution9}>
              Execution & usage
            </button>
          </div>
        </div>
      </>
    ) : null
  );
}
