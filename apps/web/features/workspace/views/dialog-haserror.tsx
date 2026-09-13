/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogHaserror({ v }: { v: Vals }) {
  return (
    v.hasError ? (
      <>
        <p className="error" role="alert">
          {interp(v.error)}
        </p>
      </>
    ) : null
  );
}
