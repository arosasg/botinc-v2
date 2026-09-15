/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function ShellErrorStates({ v }: { v: Vals }) {
  return (
    v.errorPage19 ? (
      <>
        <main className="error-design19" data-screen-label="Error states">
          <section className="error-card19">
            <img src="/assets/logo/botinc-mark.svg" alt="" />
            <span>{interp(v.errorEyebrow19)}</span>
            <h1>{interp(v.errorTitle19)}</h1>
            <p>{interp(v.errorCopy19)}</p>
            <div>
              <button className="small-button primary" onClick={v.errorRetry19}>
                {interp(v.errorAction19)}
              </button>
              <button className="text-button" onClick={v.errorHome19}>
                Return home
              </button>
            </div>
            <small>{interp(v.errorSafety19)}</small>
          </section>
        </main>
      </>
    ) : null
  );
}
