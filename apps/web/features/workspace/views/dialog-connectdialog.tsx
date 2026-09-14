/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogConnectdialog({ v }: { v: Vals }) {
  return (
    v.connectDialog ? (
      <>
        <span className="eyebrow">{interp(v.connectApp)} · YOUR CONNECTION</span>
        <h2 id="dialog-title">{interp(v.connectionTitle)}</h2>
        <p className="dialog-copy">{interp(v.connectionCopy)}</p>
        <label className="field-label" htmlFor="connection-scope">
          {interp(v.scopeLabel)}
        </label>
        <input
          id="connection-scope"
          className="field"
          value={v.connectionScope}
          onChange={v.editConnectionScope}
          aria-label="Connection scope"
        />
        <div className="permission-box">
          <strong>What your Operator can access</strong>
          <p>{interp(v.connectionPermissions)}</p>
        </div>
        {v.isIssueSource ? (
          <>
            <label className="check-row">
              <input type="checkbox" checked={v.shareSource} onChange={v.toggleShareSource} />
              <span>
                Bring selected issues into shared Work.
                <small>Members with access can see their titles, descriptions, and results.</small>
              </span>
            </label>
          </>
        ) : null}
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.finishConnect}>
            {interp(v.connectButton)}
          </button>
        </div>
        <p className="fine">The connection is verified before it is saved to this workspace.</p>
      </>
    ) : null
  );
}
