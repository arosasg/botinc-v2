/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";

export function ShellCloseNavigation({ v }: { v: Vals }) {
  return (
    v.mobileNav ? (
      <>
        <button className="nav-shade" aria-label="Close navigation" onClick={v.closeNav} />
      </>
    ) : null
  );
}
