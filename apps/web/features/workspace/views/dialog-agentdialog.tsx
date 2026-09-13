/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogAgentdialog({ v }: { v: Vals }) {
  return (
    v.agentDialog ? (
      <>
        <h2 id="dialog-title">Who should take this?</h2>
        <p className="dialog-copy">Your one Operator. The conversation stays when you switch.</p>
        <div className="agent-options">
          {(v.agentRows ?? []).map((a: any, i: number) => (
            <Fragment key={i}>
              <button onClick={a.pick}>
                <img src={a.avatar} alt="" />
                <span>
                  <strong>{interp(a.name)}</strong>
                  <small>{interp(a.description)}</small>
                </span>
                <span>{interp(a.check)}</span>
              </button>
            </Fragment>
          ))}
        </div>
        <p className="fine">Each uses your connections and its own private memory.</p>
      </>
    ) : null
  );
}
