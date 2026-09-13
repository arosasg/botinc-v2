/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogModeldialog({ v }: { v: Vals }) {
  return (
    v.modelDialog ? (
      <>
        <h2 id="dialog-title">Choose a model.</h2>
        <p className="dialog-copy">For this conversation. Your work stays here.</p>
        <div className="model-options">
          {(v.modelOptions ?? []).map((m: any, i: number) => (
            <Fragment key={i}>
              <button onClick={m.pick}>
                <span>
                  <strong>{interp(m.name)}</strong>
                  <small>{interp(m.copy)}</small>
                </span>
                <span>{interp(m.check)}</span>
              </button>
            </Fragment>
          ))}
        </div>
        <div className="inline-banner">
          <span>Paid with {interp(v.modelFunding)}</span>
          <button className="text-button" onClick={v.chooseFunding}>
            Change
          </button>
        </div>
      </>
    ) : null
  );
}
