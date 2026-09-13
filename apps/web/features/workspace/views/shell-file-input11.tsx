/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";

export function ShellFileInput11({ v }: { v: Vals }) {
  return (
    <input
      className="file-input11"
      type="file"
      id="attachments11"
      multiple
      accept="image/*,.pdf,.txt,.md,.csv,.json"
      aria-label="Choose attachment files"
      onChange={v.filesChanged11}
    />
  );
}
