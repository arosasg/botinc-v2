/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogComputerdialogv6({ v }: { v: Vals }) {
  return (
    v.computerDialogV6 ? (
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
              <use href="/i15.svg#monitor" />
            </svg>
          </span>
          <div>
            <span className="eyebrow">COMPUTER</span>
            <h2 id="dialog-title">{interp(v.computerDetailName)}</h2>
          </div>
          <span className="connection-state">
            <i />
            Ready
          </span>
        </div>
        <div className="tabs detail-dialog-tabs">
          <button className={v.computerOverviewClass} onClick={v.computerOverviewV6}>
            Overview
          </button>
          <button className={v.computerRunsClass} onClick={v.computerRunsV6}>
            Runs
          </button>
        </div>
        {v.computerOverviewV6Visible ? (
          <>
            <dl className="detail-grid computer-detail-grid">
              <dt>Owner</dt>
              <dd>{interp(v.computerDetailOwner)}</dd>
              <dt>Location</dt>
              <dd>{interp(v.computerDetailLocation)}</dd>
              <dt>Environment</dt>
              <dd>{interp(v.computerDetailEnvironment)}</dd>
              <dt>Task isolation</dt>
              <dd>A separate working directory for each task</dd>
              <dt>Model payment</dt>
              <dd>{interp(v.computerDetailFunding)}</dd>
            </dl>
            <div className="settings-list">
              <div className="setting-row">
                <div>
                  <h3>Use for new tasks</h3>
                  <p>Existing tasks stay on their current computer.</p>
                </div>
                <button className="small-button primary" onClick={v.useComputerV6}>
                  Use this computer
                </button>
              </div>
            </div>
          </>
        ) : null}
        {v.computerRunsV6Visible ? (
          <>
            {v.computerHasRunsV6 ? (
              <>
                <div className="compact-run">
                  <span className="live-dot" />
                  <div>
                    <strong>Draft recovery</strong>
                    <small>BOT-242 · Code Implementer · Alex</small>
                  </div>
                  <span>Running</span>
                </div>
                <div className="compact-run">
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
                    <use href="/i15.svg#circle-check" />
                  </svg>
                  <div>
                    <strong>Voice workspace fix</strong>
                    <small>BOT-241 · Code Reviewer · Alex</small>
                  </div>
                  <span>$0.84</span>
                </div>
                <p className="fine">
                  Open a task in Work to inspect its full run history and evidence.
                </p>
              </>
            ) : null}
            {v.computerNoRunsV6 ? (
              <>
                <div className="computer-empty">
                  <span>
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
                      <use href="/i15.svg#monitor" />
                    </svg>
                  </span>
                  <h3>No tasks on this computer yet</h3>
                  <p>Choose Your Mac when you start a task. Its progress and results will appear here.</p>
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </>
    ) : null
  );
}
