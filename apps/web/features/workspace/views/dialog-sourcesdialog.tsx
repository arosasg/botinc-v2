/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogSourcesdialog({ v }: { v: Vals }) {
  return (
    v.sourcesDialog ? (
      <>
        <span className="eyebrow">ONE CONNECTION TO GET STARTED</span>
        <h2 id="dialog-title">Bring your work here.</h2>
        <p className="dialog-copy">Connect a source. Pick one issue. Let your Operator take the first pass.</p>
        <div className="source-options">
          <button onClick={v.chooseGithub}>
            <span className="app-logo">
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
                <use href="/i15.svg#git-branch" />
              </svg>
            </span>
            <span>
              <strong>GitHub</strong>
              <small>Issues and pull requests</small>
            </span>
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
                <use href="/i15.svg#arrow-right" />
              </svg>
            </span>
          </button>
          <button onClick={v.chooseLinear}>
            <span className="app-logo">
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
                <use href="/i15.svg#list-todo" />
              </svg>
            </span>
            <span>
              <strong>Linear</strong>
              <small>One-time migration</small>
            </span>
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
                <use href="/i15.svg#arrow-right" />
              </svg>
            </span>
          </button>
        </div>
        <p className="fine">Your connection belongs to {interp(v.memberName)}. You choose what enters shared Work.</p>
        <button className="text-button" onClick={v.skipSources}>
          I’ll start with a message
        </button>
      </>
    ) : null
  );
}
