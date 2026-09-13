/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogKeysdialog19({ v }: { v: Vals }) {
  return (
    v.keysDialog19 ? (
      <>
        <div className="sec19">
          <span className="eyebrow">ACCOUNT SAFETY</span>
          <h2 id="dialog-title">API keys</h2>
          <p className="dialog-copy">
            The daemon and your CI sign in with these. A key can do what you can, so read-only is the default.
          </p>
          {v.akNew19 ? (
            <>
              <div className="sec-codes19 sec-new19">
                <p className="gside-title14">New key · shown once</p>
                <pre>{interp(v.akSecret19)}</pre>
                <div className="sec-acts19">
                  <button type="button" className="small-button" onClick={v.akCopy19}>
                    Copy
                  </button>
                  <button type="button" className="small-button primary" onClick={v.akDismiss19}>
                    I have saved it
                  </button>
                  <span className="fine">Close this and the secret is gone for good.</span>
                </div>
              </div>
            </>
          ) : null}
          <div className="sec-rows19">
            {(v.akRows19 ?? []).map((k: any, i: number) => (
              <Fragment key={i}>
                <div className="sec-row19">
                  <span className="sec-copy19">
                    <strong>{interp(k.name)}</strong>
                    <small className="sec-mono19">{interp(k.prefix)}····</small>
                    <small>
                      Created {interp(k.created)} · used {interp(k.used)}
                    </small>
                  </span>
                  <button
                    type="button"
                    className="sel14 sec-sel19"
                    aria-haspopup="listbox"
                    aria-label="What this key may do"
                    onClick={k.scopePick}
                  >
                    <span>{interp(k.scope)}</span>
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
                  <button type="button" className="small-button" onClick={k.revoke}>
                    Revoke
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
          {v.akEmpty19 ? (
            <>
              <p className="gside-empty14">No keys. The daemon signs in with your account until you create one.</p>
            </>
          ) : null}
          <div className="sec-foot19">
            <span className="fine">{interp(v.akNote19)}</span>
            <button type="button" className="small-button primary" onClick={v.akCreate19}>
              Create a key
            </button>
          </div>
        </div>
      </>
    ) : null
  );
}
