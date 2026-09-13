/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function ShellToast({ v }: { v: Vals }) {
  return (
    v.hasNotice ? (
      <>
        <div className="toast" role="status">
          {interp(v.notice)}
        </div>
      </>
    ) : null
  );
}
