/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function PageC9Card16({ v }: { v: Vals }) {
  return (
    v.hcOpen16 ? (
      <>
        <div className="c9-card16" style={css(v.hcStyle16)} aria-hidden="true">
          <span className="c9-card-top16">
            <strong>{interp(v.hcTitle16)}</strong>
            <em>{interp(v.hcWhen16)}</em>
          </span>
          <span className="c9-card-meta16">
            <span className={`c9-card-state16 ${v.hcTone16}`}>
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
                <use href={v.hcIcon16} />
              </svg>
              {interp(v.hcState16)}
            </span>
            <span className="c9-card-proj16">
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
                <use href="/i15.svg#folder" />
              </svg>
              {interp(v.hcWhere16)}
            </span>
          </span>
        </div>
      </>
    ) : null
  );
}
