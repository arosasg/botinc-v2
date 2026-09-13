/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogRepodialogv6({ v }: { v: Vals }) {
  return (
    v.repoDialogV6 ? (
      <>
        <div className="detail-dialog-heading">
          <span className="detail-icon">
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
              <use href="/i15.svg#folder-git-2" />
            </svg>
          </span>
          <div>
            <span className="eyebrow">REPOSITORY</span>
            <h2 id="dialog-title">botinc/app</h2>
          </div>
        </div>
        <p className="dialog-copy">Shared project context. Your Operator use your own GitHub connection.</p>
        <div className="form-pair">
          <label className="field-label">
            Default branch
            <input className="field" value={v.repoBranch} onChange={v.editRepoBranch} />
          </label>
          <label className="field-label">
            Default computer
            <button
              type="button"
              className={`sel14 field ${v.m14_repoComputer?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_repoComputer?.expanded}
              onClick={v.m14_repoComputer?.pick}
            >
              <span>{interp(v.m14_repoComputer?.label)}</span>
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
        <label className="field-label" htmlFor="repo-setup-v6">
          Setup instructions
        </label>
        <textarea className="field code-field" id="repo-setup-v6" rows={4} value={v.repoSetup} onChange={v.editRepoSetup} />
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
            Review required
          </strong>
          <p>Agents can prepare changes and open a pull request. A workspace member reviews and approves the merge.</p>
        </div>
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.saveRepoV6}>
            Save repository
          </button>
        </div>
      </>
    ) : null
  );
}
