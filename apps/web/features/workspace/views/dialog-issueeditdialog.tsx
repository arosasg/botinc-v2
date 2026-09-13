/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogIssueeditdialog({ v }: { v: Vals }) {
  return (
    v.issueEditDialog ? (
      <>
        <span className="eyebrow">{interp(v.issue?.id)} · SHARED WORK</span>
        <h2 id="dialog-title">Work details</h2>
        <label className="field-label" htmlFor="work-owner">
          Execution owner
        </label>
        <button
          type="button"
          className={`sel14 field ${v.m14_issueOwnerInput?.cls}`}
          aria-haspopup="listbox"
          aria-expanded={v.m14_issueOwnerInput?.expanded}
          id="work-owner"
          onClick={v.m14_issueOwnerInput?.pick}
        >
          <span>{interp(v.m14_issueOwnerInput?.label)}</span>
          <svg
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
        <p className="fine">
          The owner’s agents, connections, and model accounts do the work. Reassigning pauses a running task until the new
          owner continues.
        </p>
        <div className="form-pair">
          <label className="field-label">
            Priority
            <button
              type="button"
              className={`sel14 field ${v.m14_issuePriorityInput?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_issuePriorityInput?.expanded}
              onClick={v.m14_issuePriorityInput?.pick}
            >
              <span>{interp(v.m14_issuePriorityInput?.label)}</span>
              <svg
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
          <label className="field-label">
            Project
            <button
              type="button"
              className={`sel14 field ${v.m14_issueProjectInput?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_issueProjectInput?.expanded}
              onClick={v.m14_issueProjectInput?.pick}
            >
              <span>{interp(v.m14_issueProjectInput?.label)}</span>
              <svg
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
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.saveIssueProperties}>
            Save details
          </button>
        </div>
      </>
    ) : null
  );
}
