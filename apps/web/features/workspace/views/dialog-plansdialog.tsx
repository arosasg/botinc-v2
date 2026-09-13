/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogPlansdialog({ v }: { v: Vals }) {
  return (
    v.plansDialog ? (
      <>
        <span className="eyebrow">PROPOSED PRICING</span>
        <h2 id="dialog-title">More room to get things done.</h2>
        <p className="dialog-copy">All one Operator on every plan. Use included credit, then top up when you need it.</p>
        <div className="cycle-toggle">
          <button className={v.monthlyCycleClass} onClick={v.chooseMonthly}>
            Monthly
          </button>
          <button className={v.annualCycleClass} onClick={v.chooseAnnual}>
            Annual
          </button>
        </div>
        <div className="plan-grid">
          {(v.plans ?? []).map((p: any, i: number) => (
            <Fragment key={i}>
              <article className="plan-card">
                <h3>{interp(p.name)}</h3>
                <div className="price">
                  {interp(p.price)}
                  <small>{interp(p.period)}</small>
                </div>
                <strong>{interp(p.credit)}</strong>
                <p>{interp(p.tasks)}</p>
                <p>{interp(p.calls)}</p>
                <p>{interp(p.audience)}</p>
                <p className="fine">
                  {interp(p.storage)} storage
                  <br />
                  {interp(p.automation)}
                </p>
                <button className={`small-button ${p.buttonClass}`} onClick={p.choose}>
                  {interp(p.button)}
                </button>
              </article>
            </Fragment>
          ))}
        </div>
        <p className="fine">
          Monthly credit resets at renewal. Purchased credit carries forward. Calls use credit on every plan. Prices exclude
          tax.
        </p>
        <button className="text-button" onClick={v.pricingDetails}>
          How credits, annual billing, and limits work{" "}
          <svg
            className="ui-icon "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <use href="/i15.svg#arrow-right" />
          </svg>
        </button>
      </>
    ) : null
  );
}
