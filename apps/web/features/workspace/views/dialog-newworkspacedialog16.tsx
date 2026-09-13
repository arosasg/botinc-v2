/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";

export function DialogNewworkspacedialog16({ v }: { v: Vals }) {
  return (
    v.newWorkspaceDialog16 ? (
      <>
        <span className="eyebrow">WORKSPACE</span>
        <h2 id="dialog-title">Create a new workspace.</h2>
        <p className="dialog-copy">Workspaces are shared environments where teams work on projects and issues.</p>
        <div className="nw16">
          <label className="nw-field16">
            <span className="eyebrow">WORKSPACE NAME</span>
            <input placeholder="My workspace" value={v.nwName16} onInput={v.nwEditName16} onKeyDown={v.nwKey16} />
          </label>
          <label className="nw-field16">
            <span className="eyebrow">WORKSPACE URL</span>
            <span className="nw-url16">
              <em>botinc.ai/</em>
              <input placeholder="my-workspace" value={v.nwSlug16} onInput={v.nwEditSlug16} onKeyDown={v.nwKey16} />
            </span>
          </label>
        </div>
        <div className="dialog-actions14">
          <button className="button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="button primary" disabled={v.nwEmpty16} onClick={v.nwCreate16}>
            Create workspace
          </button>
        </div>
      </>
    ) : null
  );
}
