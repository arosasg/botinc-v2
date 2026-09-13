/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogTopupdialog19({ v }: { v: Vals }) {
  return (
    v.topupDialog19 ? (
      <>
        <span className="eyebrow">BILLING · {interp(v.memberName)}</span>
        <h2 id="dialog-title">Auto top-up</h2>
        <p className="dialog-copy">
          Credit is added on its own so a run never stops halfway. Nothing is charged while this is off.
        </p>
        <div className="tu19">
          <div className="tu-switch19">
            <span>
              <strong>Auto top-up</strong>
              <small>{interp(v.tuStateCopy19)}</small>
            </span>
            <button
              type="button"
              className={`pf-switch16 ${v.tuCls19}`}
              role="switch"
              aria-checked={v.tuOn19}
              aria-label="Auto top-up"
              onClick={v.tuToggle19}
            >
              <i />
            </button>
          </div>
          <div className={`tu-rows19 ${v.tuRowsCls19}`}>
            <div className="tu-row19">
              <span>Add</span>
              <button
                type="button"
                className="sel14"
                aria-haspopup="listbox"
                aria-label="How much to add"
                disabled={v.tuOff19}
                onClick={v.tuAmountPick19}
              >
                <span>{interp(v.tuAmount19)}</span>
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
            </div>
            <div className="tu-row19">
              <span>When the balance drops below</span>
              <button
                type="button"
                className="sel14"
                aria-haspopup="listbox"
                aria-label="Trigger balance"
                disabled={v.tuOff19}
                onClick={v.tuFloorPick19}
              >
                <span>{interp(v.tuFloor19)}</span>
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
            </div>
            <div className="tu-row19">
              <span>Never more than</span>
              <button
                type="button"
                className="sel14"
                aria-haspopup="listbox"
                aria-label="Monthly cap"
                disabled={v.tuOff19}
                onClick={v.tuCapPick19}
              >
                <span>{interp(v.tuCap19)}</span>
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
            </div>
            <div className="tu-row19 tu-card19">
              <span>Charged to</span>
              <span className="tu-cardval19">
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
                  <use href="/i15.svg#credit-card" />
                </svg>
                <b>{interp(v.tuCard19)}</b>
                <button type="button" className="text-button" onClick={v.tuChangeCard19}>
                  Change
                </button>
              </span>
            </div>
          </div>
          <p className="tu-outcome19">
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
              <use href="/i15.svg#info" />
            </svg>
            {interp(v.tuOutcome19)}
          </p>
        </div>
        <div className="tu-acts19">
          <button className="button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="button primary" onClick={v.tuSave19}>
            {interp(v.tuSaveLabel19)}
          </button>
        </div>
      </>
    ) : null
  );
}
