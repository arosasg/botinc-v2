/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function ShellOverlay12({ v }: { v: Vals }) {
  return (
    v.chatMenu12 ? (
      <>
        <div className="overlay12">
          <section className="sheet12 action-sheet12" role="dialog" aria-modal="true" aria-label="Conversation actions">
            <header>
              <h2>Conversation</h2>
              <button className="icon-button" aria-label="Close conversation actions" onClick={v.closeOverlay12}>
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
                  <use href="/i15.svg#x" />
                </svg>
              </button>
            </header>
            {(v.chatActionRows12 ?? []).map((a: any, i: number) => (
              <Fragment key={i}>
                <button className="action-row12" onClick={a.open}>
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
                    <use href={a.icon} />
                  </svg>
                  <span>
                    <strong>{interp(a.title)}</strong>
                    <small>{interp(a.copy)}</small>
                  </span>
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
                    <use href="/i15.svg#chevron-right" />
                  </svg>
                </button>
              </Fragment>
            ))}
          </section>
        </div>
      </>
    ) : null
  );
}
