/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogRepairdialog10({ v }: { v: Vals }) {
  return (
    v.repairDialog10 ? (
      <>
        <span className="n9-overline">AUTOPILOT REPAIR</span>
        <h2 id="dialog-title">{interp(v.repairTitle10)}</h2>
        <p className="dialog-copy">{interp(v.repairCopy10)}</p>
        <div className="repair-diff10">
          <div>
            <span>BEFORE</span>
            <strong>{interp(v.repairBefore10)}</strong>
          </div>
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
          <div>
            <span>AFTER</span>
            <strong>{interp(v.repairAfter10)}</strong>
          </div>
        </div>
        <p>Future triggers will use the corrected setting. A test run will be queued after confirmation.</p>
        <p className="fine">You can follow the test and its result in this conversation.</p>
        {v.repairError10 ? (
          <>
            <p className="d9-error" role="alert">
              {interp(v.repairError10)}
            </p>
          </>
        ) : null}
        <div className="dialog-actions">
          <button className="small-button" onClick={v.cancelRepair10}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.confirmRepair10}>
            Apply & queue test
          </button>
        </div>
      </>
    ) : null
  );
}
