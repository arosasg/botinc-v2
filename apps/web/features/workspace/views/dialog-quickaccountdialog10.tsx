/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogQuickaccountdialog10({ v }: { v: Vals }) {
  return (
    v.quickAccountDialog10 ? (
      <>
        <h2 id="dialog-title">Add a model account</h2>
        <p className="dialog-copy">Your subscription or your API key. Only your work can use it.</p>
        <div className="account-methods10">
          <button className={v.signinClass10} onClick={v.signInMethod10}>
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
              <use href="/i15.svg#user-round" />
            </svg>
            Sign in
          </button>
          <button className={v.apiClass10} onClick={v.apiMethod10}>
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
              <use href="/i15.svg#key-round" />
            </svg>
            API key
          </button>
        </div>
        {(v.quickProviders10 ?? []).map((p: any, i: number) => (
          <Fragment key={i}>
            <button className="picker-row10" onClick={p.pick}>
              {p.brand12 ? (
                <>
                  <img className={`brand12 ${p.brandClass12}`} src={p.brand12} alt="" />
                </>
              ) : null}
              {!p.brand12 ? (
                <>
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
                    <use href={p.icon} />
                  </svg>
                </>
              ) : null}
              <span>
                <strong>{interp(p.name)}</strong>
                <small>{interp(p.copy)}</small>
              </span>
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
                <use href="/i15.svg#chevron-right" />
              </svg>
            </button>
          </Fragment>
        ))}
        <p className="fine">
          This opens a simulated provider authorization. No credentials are requested or stored in the design.
        </p>
      </>
    ) : null
  );
}
