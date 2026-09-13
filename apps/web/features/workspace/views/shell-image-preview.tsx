/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function ShellImagePreview({ v }: { v: Vals }) {
  return (
    v.imageOpen11 ? (
      <>
        <div className="image-overlay11" role="dialog" aria-label="Image preview">
          <header>
            <span>{interp(v.imageName11)}</span>
            <button className="icon-button" aria-label="Close image preview" onClick={v.closeImage11}>
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
          <img src={v.imageUrl11} alt={v.imageName11} />
        </div>
      </>
    ) : null
  );
}
