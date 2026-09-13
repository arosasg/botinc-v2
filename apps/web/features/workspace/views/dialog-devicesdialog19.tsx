/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogDevicesdialog19({ v }: { v: Vals }) {
  return (
    v.devicesDialog19 ? (
      <>
        <div className="sec19">
          <span className="eyebrow">ACCOUNT SAFETY</span>
          <h2 id="dialog-title">Signed-in devices</h2>
          <p className="dialog-copy">{interp(v.devSummary19)}</p>
          <div className="sec-rows19">
            {(v.devRows19 ?? []).map((d: any, i: number) => (
              <Fragment key={i}>
                <div className="sec-row19">
                  <span className="sec-mark19">
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
                      <use href={d.icon} />
                    </svg>
                  </span>
                  <span className="sec-copy19">
                    <strong>{interp(d.name)}</strong>
                    <small>{interp(d.meta)}</small>
                    <small className="sec-mono19">
                      {interp(d.where)} · {interp(d.ip)} · {interp(d.when)}
                    </small>
                  </span>
                  {d.current ? (
                    <>
                      <span className="sec-state19 ok19">This device</span>
                    </>
                  ) : null}
                  {d.notCurrent ? (
                    <>
                      <button type="button" className="small-button" onClick={d.out}>
                        Sign out
                      </button>
                    </>
                  ) : null}
                </div>
              </Fragment>
            ))}
          </div>
          <div className="sec-foot19">
            <button type="button" className="text-button sec-danger19" onClick={v.devOutAll19}>
              Sign out everywhere else
            </button>
            <button type="button" className="small-button primary" onClick={v.closeDialog}>
              Done
            </button>
          </div>
          <p className="fine">
            Signing out a device also ends the daemon session on it. Its next run asks you to sign in again.
          </p>
        </div>
      </>
    ) : null
  );
}
