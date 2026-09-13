/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogTopupdialog({ v }: { v: Vals }) {
  return (
    v.topupDialog ? (
      <>
        <span className="eyebrow">{interp(v.balanceText)} AVAILABLE</span>
        <h2 id="dialog-title">Keep the work moving.</h2>
        <p className="dialog-copy">Add credit once. Your plan stays {interp(v.plan)}.</p>
        <div className="amounts">
          {(v.topupAmounts ?? []).map((a: any, i: number) => (
            <Fragment key={i}>
              <button className={a.cls} onClick={a.pick}>
                {interp(a.label)}
              </button>
            </Fragment>
          ))}
        </div>
        <div className="payment-summary">
          <span>One-time credit</span>
          <strong>{interp(v.topupText)}</strong>
          <span>Available after payment</span>
          <strong>{interp(v.afterTopup)}</strong>
        </div>
        <p className="fine">Purchased credit does not reset monthly. Auto top-up stays off.</p>
        <button className="button primary" onClick={v.payTopup}>
          {interp(v.payLabel)}
        </button>
        {v.paymentError ? (
          <>
            <p className="error" role="alert">
              Payment declined. Nothing was charged. Your work is saved.
            </p>
            <button className="text-button" onClick={v.retryPayment}>
              Try another payment method
            </button>
          </>
        ) : null}
        <p className="fine">Simulated checkout. No charge will be made.</p>
      </>
    ) : null
  );
}
