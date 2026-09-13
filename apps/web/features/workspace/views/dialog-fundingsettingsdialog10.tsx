/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogFundingsettingsdialog10({ v }: { v: Vals }) {
  return (
    v.fundingSettingsDialog10 ? (
      <>
        <h2 id="dialog-title">Pay for model usage</h2>
        <p className="dialog-copy">BotInc chooses an eligible account. You choose what can be spent.</p>
        <div className="account-methods10">
          <button className={v.subscriptionClass10} onClick={v.setSubscriptions10}>
            Subscriptions first
          </button>
          <button className={v.creditClass10} onClick={v.setCredits10}>
            BotInc credits
          </button>
        </div>
        <div className="route-strip10">
          <strong>Claude</strong>
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
            <use href="/i15.svg#arrow-right" />
          </svg>
          <strong>Codex</strong>
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
            <use href="/i15.svg#arrow-right" />
          </svg>
          <strong>Fallback</strong>
        </div>
        <label className="field-label">
          If no subscription is available
          <button
            type="button"
            className={`sel14 field ${v.m14_fallback102?.cls}`}
            aria-haspopup="listbox"
            aria-expanded={v.m14_fallback102?.expanded}
            onClick={v.m14_fallback102?.pick}
          >
            <span>{interp(v.m14_fallback102?.label)}</span>
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
              <use href="/i15.svg#chevron-down" />
            </svg>
          </button>
        </label>
        <p className="fine">
          A pinned model never changes providers. With Auto, eligible subscriptions follow this order. Cloud work and calls
          always use credit.
        </p>
        <button className="button primary" onClick={v.closeDialog}>
          Done
        </button>
      </>
    ) : null
  );
}
