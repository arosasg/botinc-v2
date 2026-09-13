/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function PagePfTip16({ v }: { v: Vals }) {
  return (
    v.tipOpen16 ? (
      <>
        <b className="pf-tip16" style={css(v.tipStyle16)} aria-hidden="true">
          {interp(v.tipText16)}
        </b>
      </>
    ) : null
  );
}
