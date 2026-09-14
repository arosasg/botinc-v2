/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogTwostepdialog19({ v }: { v: Vals }) {
  return (
    v.twoStepDialog19 ? (
      <>
        <div className="sec19">
          <span className="eyebrow">ACCOUNT SAFETY</span>
          <h2 id="dialog-title">Two-step sign-in</h2>
          <p className="dialog-copy">
            A code from your phone on every new sign-in. Recovery codes are the only way back if the phone is gone.
          </p>
          <div className="sec-rows19">
            {(v.tsRows19 ?? []).map((r: any, i: number) => (
              <Fragment key={i}>
                <div className="sec-row19">
                  <span className="sec-copy19">
                    <strong>{interp(r.title)}</strong>
                    <small>{interp(r.copy)}</small>
                  </span>
                  <span className={`sec-state19 ${r.tone}`}>{interp(r.state)}</span>
                  <button type="button" className="small-button" onClick={r.act}>
                    {interp(r.action)}
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
          {v.tsCodesOpen19 ? (
            <>
              <div className="sec-codes19">
                <p className="gside-title14">Ten codes, each good once</p>
                <pre>{interp(v.tsCodes19)}</pre>
                <div className="sec-acts19">
                  <button type="button" className="small-button" onClick={v.tsCopyCodes19}>
                    Copy codes
                  </button>
                  <button type="button" className="small-button" onClick={v.tsNewCodes19}>
                    Regenerate
                  </button>
                  <span className="fine">Regenerating voids the ten above.</span>
                </div>
              </div>
            </>
          ) : null}
          <div className="sec-row19 sec-toggle19">
            <span className="sec-copy19">
              <strong>Ask on every new device</strong>
              <small>Off keeps a device trusted for 30 days after it signs in.</small>
            </span>
            <button
              type="button"
              className={`pf-switch16 ${v.tsAskCls19}`}
              role="switch"
              aria-checked={v.tsAsk19}
              aria-label="Ask on every new device"
              onClick={v.tsToggleAsk19}
            >
              <i />
            </button>
          </div>
          <div className="sec-foot19">
            <button type="button" className="text-button sec-danger19" onClick={v.tsTurnOff19}>
              {interp(v.tsOffLabel19)}
            </button>
            <button type="button" className="small-button primary" onClick={v.closeDialog}>
              Done
            </button>
          </div>
          <p className="fine">Two-step verification is not available on this deployment yet.</p>
        </div>
      </>
    ) : null
  );
}
