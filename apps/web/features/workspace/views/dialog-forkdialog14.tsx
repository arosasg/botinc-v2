/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogForkdialog14({ v }: { v: Vals }) {
  return (
    v.forkDialog14 ? (
      <>
        <span className="eyebrow">{interp(v.forkEyebrow14)}</span>
        <h2 id="dialog-title">{interp(v.forkTitle14)}</h2>
        <p className="dialog-copy">{interp(v.forkCopy14)}</p>
        <div className="fork-preview14">
          {(v.forkPreviewRows14 ?? []).map((r: any, i: number) => (
            <Fragment key={i}>
              <div className={`fork-prow14 ${r.tone}`}>
                <span>{interp(r.who)}</span>
                <p>{interp(r.text)}</p>
              </div>
            </Fragment>
          ))}
          <p className="fork-cut14">
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
              <use href="/i15.svg#scissors" />
            </svg>
            {interp(v.forkCutLabel14)}
          </p>
          {(v.forkDroppedRows14 ?? []).map((r: any, i: number) => (
            <Fragment key={i}>
              <div className="fork-prow14 dropped14">
                <span>{interp(r.who)}</span>
                <p>{interp(r.text)}</p>
              </div>
            </Fragment>
          ))}
        </div>
        {v.forkIsBranch14 ? (
          <>
            <label className="field-label" htmlFor="fork-edit14">
              Your edited message
            </label>
            <textarea id="fork-edit14" className="field" rows={3} value={v.forkDraft14} onChange={v.editForkDraft14} />
          </>
        ) : null}
        <div className="permission-box">
          <strong>The original is untouched</strong>
          <p>{interp(v.forkGuarantee14)}</p>
        </div>
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.confirmFork14}>
            {interp(v.forkActionLabel14)}
          </button>
        </div>
      </>
    ) : null
  );
}
