/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";

export function DialogVoicestartdialog10({ v }: { v: Vals }) {
  return (
    v.voiceStartDialog10 ? (
      <>
        <div className="voice-start10">
          <div className="voice-orb10" />
          <h2 id="dialog-title">Talk. Watch it happen.</h2>
          <p>Operator works in your console while you talk. Follow along, answer questions, or take over.</p>
          <div className="voice-start-list10">
            <span>
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
                <use href="/i15.svg#message-square" />
              </svg>
              Unblock work together
            </span>
            <span>
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
                <use href="/i15.svg#mouse-pointer-2" />
              </svg>
              See every action in the console
            </span>
            <span>
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
                <use href="/i15.svg#hand" />
              </svg>
              Pause or take over at any time
            </span>
          </div>
          <div className="dialog-actions">
            <button className="small-button" onClick={v.closeDialog}>
              Keep typing
            </button>
            <button className="small-button primary" onClick={v.connectVoice10}>
              Start preview{" "}
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
            </button>
          </div>
          <p className="fine">Voice calls are not available on this deployment yet.</p>
        </div>
      </>
    ) : null
  );
}
