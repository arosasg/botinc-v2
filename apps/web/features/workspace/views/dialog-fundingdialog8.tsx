/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function DialogFundingdialog8({ v }: { v: Vals }) {
  return (
    v.fundingDialog8 ? (
      <>
        <span className="eyebrow">{interp(v.fundingEyebrow)}</span>
        <h2 id="dialog-title">{interp(v.fundingTitle)}</h2>
        <p className="dialog-copy">{interp(v.fundingCopy)}</p>
        {v.fundingHasBlock ? (
          <>
            <div className="info-box">
              <h3>{interp(v.fundingBlockTitle)}</h3>
              <p>{interp(v.fundingBlockCopy)}</p>
            </div>
          </>
        ) : null}
        <div className="a8-funding-options">
          {(v.fundingOptions ?? []).map((o: any, i: number) => (
            <Fragment key={i}>
              <button className={`a8-funding-option ${o.cls}`} onClick={o.pick} disabled={o.disabled}>
                <span className="a8-funding-main">
                  <strong>{interp(o.title)}</strong>
                  <small>{interp(o.copy)}</small>
                </span>
                {o.hasUsage ? (
                  <>
                    <span className="a8-funding-usage">
                      {(o.windows ?? []).map((u: any, i: number) => (
                        <Fragment key={i}>
                          <span className="a8-window">
                            <span className="a8-window-label">{interp(u.label)}</span>
                            <span className="a8-bar">
                              <i className={u.tone} style={css(u.style)} />
                            </span>
                            <span className="a8-pct">{interp(u.pct)}</span>
                          </span>
                        </Fragment>
                      ))}
                    </span>
                  </>
                ) : null}
                <span className="a8-funding-check">{interp(o.check)}</span>
              </button>
            </Fragment>
          ))}
        </div>
        <p className="fine">{interp(v.fundingFine)}</p>
        <button className="text-button" onClick={v.openModelAccounts8}>
          Manage model accounts{" "}
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
            <use href="/i15.svg#arrow-up-right" />
          </svg>
        </button>
      </>
    ) : null
  );
}
