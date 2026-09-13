/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogGenericdialog({ v }: { v: Vals }) {
  return (
    v.genericDialog ? (
      <>
        <span className="eyebrow">{interp(v.genericEyebrow)}</span>
        <h2 id="dialog-title">{interp(v.genericTitle)}</h2>
        <p className="dialog-copy">{interp(v.genericCopy)}</p>
        {v.hasGenericInput ? (
          <>
            <label className="field-label" htmlFor="generic-input">
              {interp(v.genericInputLabel)}
            </label>
            <input id="generic-input" className="field" value={v.genericInput} onChange={v.editGenericInput} />
          </>
        ) : null}
        {v.hasGenericText ? (
          <>
            <div className="detail19">
              {(v.genericLines19 ?? []).map((g: any, i: number) => (
                <Fragment key={i}>
                  {g.pair ? (
                    <>
                      <div className="detail-pair19">
                        <span>{interp(g.label)}</span>
                        <strong>{interp(g.value)}</strong>
                      </div>
                    </>
                  ) : null}
                  {g.plain ? (
                    <>
                      <p className="detail-line19">{interp(g.value)}</p>
                    </>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </>
        ) : null}
        <div className="generic-items">
          {(v.genericItems ?? []).map((i: any, ix: number) => (
            <Fragment key={ix}>
              <button onClick={i.action}>
                <span>
                  <strong>{interp(i.title)}</strong>
                  <small>{interp(i.copy)}</small>
                </span>
                <span>
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
                </span>
              </button>
            </Fragment>
          ))}
        </div>
        {v.hasGenericAction ? (
          <>
            <button className="button primary" onClick={v.genericAction}>
              {interp(v.genericActionLabel)}
            </button>
          </>
        ) : null}
      </>
    ) : null
  );
}
