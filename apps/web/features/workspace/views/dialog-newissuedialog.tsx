/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogNewissuedialog({ v }: { v: Vals }) {
  return (
    v.newIssueDialog ? (
      <>
        <h2 id="dialog-title">What needs doing?</h2>
        <label className="field-label" htmlFor="new-issue-title">
          Issue title
        </label>
        <input
          id="new-issue-title"
          className="field"
          placeholder="Describe the outcome…"
          value={v.newIssueTitle}
          onChange={v.editNewTitle}
        />
        <label className="field-label" htmlFor="new-issue-description">
          Context
        </label>
        <textarea
          id="new-issue-description"
          className="field"
          rows={4}
          placeholder="Add what your agent should know"
          value={v.newIssueDescription}
          onChange={v.editNewDescription}
        />
        <div className="form-pair">
          <label className="field-label">
            Priority
            <button
              type="button"
              className={`sel14 field ${v.m14_newIssuePriority?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_newIssuePriority?.expanded}
              onClick={v.m14_newIssuePriority?.pick}
            >
              <span>{interp(v.m14_newIssuePriority?.label)}</span>
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
              className={`sel14 field ${v.m14_newIssueProject?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_newIssueProject?.expanded}
              onClick={v.m14_newIssueProject?.pick}
            >
              <span>{interp(v.m14_newIssueProject?.label)}</span>
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
        {v.hasNewParent ? (
          <>
            <p className="fine">{interp(v.newParentCopy)}</p>
          </>
        ) : null}
        <div className="permission-box">
          <strong>Shared with BotInc</strong>
          <p>{interp(v.newIssueShareCopy)}</p>
        </div>
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.createIssue}>
            Create issue
          </button>
        </div>
      </>
    ) : null
  );
}
