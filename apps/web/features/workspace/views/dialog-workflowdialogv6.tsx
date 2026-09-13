/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogWorkflowdialogv6({ v }: { v: Vals }) {
  return (
    v.workflowDialogV6 ? (
      <>
        <span className="eyebrow">WORKFLOW</span>
        <h2 id="dialog-title">Fix and review</h2>
        <p className="dialog-copy">Keep the steps familiar. Tune what they do.</p>
        <label className="field-label" htmlFor="workflow-instructions-v6">
          Instructions for the first pass
        </label>
        <textarea
          id="workflow-instructions-v6"
          className="field"
          rows={4}
          value={v.workflowInstructions}
          onChange={v.editWorkflowInstructions}
        />
        <div className="form-pair">
          <label className="field-label">
            Maximum per task
            <button
              type="button"
              className={`sel14 field ${v.m14_workflowBudget?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_workflowBudget?.expanded}
              onClick={v.m14_workflowBudget?.pick}
            >
              <span>{interp(v.m14_workflowBudget?.label)}</span>
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
            Computer
            <button
              type="button"
              className={`sel14 field ${v.m14_workflowComputer?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_workflowComputer?.expanded}
              onClick={v.m14_workflowComputer?.pick}
            >
              <span>{interp(v.m14_workflowComputer?.label)}</span>
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
        <div className="permission-box">
          <strong>
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
              <use href="/i15.svg#shield-check" />
            </svg>{" "}
            Independent review, then your approval
          </strong>
          <p>Your Code Reviewer checks the current change. The workflow stops before merge.</p>
        </div>
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.saveWorkflowV6}>
            Save workflow
          </button>
        </div>
      </>
    ) : null
  );
}
