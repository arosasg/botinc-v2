/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogPreviewdialog({ v }: { v: Vals }) {
  return (
    v.previewDialog ? (
      <>
        <span className="eyebrow">REVIEW CONTROLS · SIMULATION ONLY</span>
        <h2 id="dialog-title">Explore the whole experience.</h2>
        <div className="preview-options">
          {(v.previewOptions ?? []).map((o: any, i: number) => (
            <Fragment key={i}>
              <button onClick={o.action}>
                <strong>{interp(o.title)}</strong>
                <small>{interp(o.copy)}</small>
              </button>
            </Fragment>
          ))}
        </div>
        <div className="member-switch">
          <span>Preview as</span>
          <button className="small-button" onClick={v.switchAlex}>
            Alex · owner
          </button>
          <button className="small-button" onClick={v.switchEmre}>
            Emre · member
          </button>
        </div>
        <p className="fine">
          Switching members is a design test control. It changes private chats and connections while keeping shared issues.
        </p>
      </>
    ) : null
  );
}
