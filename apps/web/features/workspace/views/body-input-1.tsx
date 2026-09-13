/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";

export function BodyInput1({ v }: { v: Vals }) {
  return (
    <input type="file" id="folder15" multiple {...{ webkitdirectory: "" }} hidden onChange={v.filesChanged15} />
  );
}
