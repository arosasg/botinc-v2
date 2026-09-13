/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogMcpdialog10({ v }: { v: Vals }) {
  return (
    v.mcpDialog10 ? (
      <>
        <div className="dlg-head16">
          <span className="dlg-mark16">
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
              <use href="/i15.svg#plug" />
            </svg>
          </span>
          <div>
            <h2 id="dialog-title">Add an MCP server</h2>
            <p>Connect a custom tool to your personal Operator. Read-only by default.</p>
          </div>
        </div>
        <div className="frm16">
          <label className="frm-row16">
            <span>Name</span>
            <input className="field" value={v.mcpName10} onChange={v.editMcpName10} placeholder="Team knowledge" />
          </label>
          <label className="frm-row16">
            <span>Server URL</span>
            <input
              className="field mono16"
              value={v.mcpUrl10}
              onChange={v.editMcpUrl10}
              placeholder="https://tools.example.com/mcp"
            />
          </label>
          <div className="frm-row16">
            <span>Authentication</span>
            <button
              type="button"
              className={`sel14 field ${v.m14_mcpAuth10?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_mcpAuth10?.expanded}
              aria-label="Authentication"
              onClick={v.m14_mcpAuth10?.pick}
            >
              <span>{interp(v.m14_mcpAuth10?.label)}</span>
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
          </div>
        </div>
        {v.mcpError10 ? (
          <>
            <p className="d9-error" role="alert">
              {interp(v.mcpError10)}
            </p>
          </>
        ) : null}
        {v.mcpReview10 ? (
          <>
            <div className="dlg-review16">
              <span className="dlg-rhead16">
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
                  <use href="/i15.svg#shield" />
                </svg>
                <strong>What this server gets</strong>
              </span>
              <span className="dlg-rrows16">
                <span className="dlg-rrow16">
                  <span>Server</span>
                  <b>{interp(v.mcpName10)}</b>
                </span>
                <span className="dlg-rrow16">
                  <span>Endpoint</span>
                  <b className="mono16">{interp(v.mcpUrl10)}</b>
                </span>
                <span className="dlg-rrow16">
                  <span>Tools</span>
                  <b>search_knowledge · read only</b>
                </span>
                <span className="dlg-rrow16">
                  <span>Scope</span>
                  <b>Personal · not installed workspace-wide</b>
                </span>
              </span>
            </div>
          </>
        ) : null}
        {!v.mcpReview10 ? (
          <>
            <p className="fine">Preview the server and the access it asks for before connecting.</p>
          </>
        ) : null}
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.submitMcp10}>
            {interp(v.mcpSubmitLabel10)}
          </button>
        </div>
      </>
    ) : null
  );
}
