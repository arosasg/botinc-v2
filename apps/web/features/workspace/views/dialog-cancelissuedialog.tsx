/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogCancelissuedialog({ v }: { v: Vals }) {
  return (
    v.cancelIssueDialog ? (
      <>
        <span className="eyebrow">{interp(v.issue?.id)} · CANCEL WORK</span>
        <h2 id="dialog-title">Cancel this issue?</h2>
        <p className="dialog-copy">{interp(v.issue?.title)}</p>
        <label className="field-label" htmlFor="cancel-reason">
          Why is it canceled?
        </label>
        <textarea
          id="cancel-reason"
          className="field"
          rows={3}
          value={v.cancelReasonInput}
          onChange={v.editCancelReason}
          placeholder="Superseded, out of scope, duplicate…"
        />
        <div className="permission-box">
          <strong>What happens</strong>
          <p>{interp(v.cancelConsequence)}</p>
        </div>
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Keep working on it
          </button>
          <button className="small-button primary" onClick={v.confirmCancelIssue}>
            Cancel issue
          </button>
        </div>
      </>
    ) : null
  );
}
