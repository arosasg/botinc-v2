/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogImporteddialog({ v }: { v: Vals }) {
  return (
    v.importedDialog ? (
      <>
        <span className="eyebrow">CONNECTED</span>
        <h2 id="dialog-title">Your first issue is here.</h2>
        <p className="dialog-copy">Start with one. You can automate the next ones when you’re ready.</p>
        <button className="imported-issue" onClick={v.openImported}>
          <span className="issue-id">{interp(v.importedIssue?.id)}</span>
          <strong>{interp(v.importedIssue?.title)}</strong>
          <small>
            {interp(v.importedIssue?.origin?.app)} · {interp(v.importedIssue?.origin?.scope)} ·{" "}
            {interp(v.importedIssue?.origin?.key)}
          </small>
          <span>
            Open issue{" "}
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
              <use href="/i15.svg#arrow-right" />
            </svg>
          </span>
        </button>
        <button className="text-button" onClick={v.showWork}>
          View all work
        </button>
      </>
    ) : null
  );
}
