/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogCheckoutdialog({ v }: { v: Vals }) {
  return (
    v.checkoutDialog ? (
      <>
        <span className="eyebrow">{interp(v.checkoutModeLabel)}</span>
        <h2 id="dialog-title">{interp(v.checkoutTitle)}</h2>
        <p className="dialog-copy">{interp(v.checkoutDescription)}</p>
        <dl className="receipt-rows">
          <dt>{interp(v.dueLabel)}</dt>
          <dd>{interp(v.checkoutDue)}</dd>
          <dt>Credit added</dt>
          <dd>{interp(v.checkoutGrant)}</dd>
          <dt>{interp(v.afterBalanceLabel)}</dt>
          <dd>{interp(v.checkoutAfter)}</dd>
          <dt>Next credit refresh</dt>
          <dd>{interp(v.checkoutRefresh)}</dd>
          <dt>Next payment</dt>
          <dd>{interp(v.checkoutNext)}</dd>
        </dl>
        <div className="info-box">
          <h3>{interp(v.checkoutRuleTitle)}</h3>
          <p>{interp(v.checkoutRule)}</p>
        </div>
        <p className="fine">{interp(v.checkoutTerms)}</p>
        {v.paymentError ? (
          <>
            <p className="error" role="alert">
              The payment failed. Your plan and balance have not changed.
            </p>
            <button className="text-button" onClick={v.retryPayment}>
              Try another payment method
            </button>
          </>
        ) : null}
        <div className="dialog-actions">
          <button className="small-button" onClick={v.backToPlans}>
            Back
          </button>
          <button className="small-button primary" onClick={v.confirmPlan}>
            {interp(v.checkoutConfirm)}
          </button>
        </div>
        <p className="fine">USD. Tax is calculated at checkout. Payment is processed securely by Stripe.</p>
      </>
    ) : null
  );
}
