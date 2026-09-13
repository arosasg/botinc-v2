/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogPlugindialog10({ v }: { v: Vals }) {
  return (
    v.pluginDialog10 ? (
      <>
        <div className="plugin-detail10">
          <span className="plugin-logo10 large10">
            <img className={`brand12 ${v.pluginBrandClass12}`} src={v.pluginBrand12} alt="" />
          </span>
          <h2 id="dialog-title">{interp(v.pluginName10)}</h2>
          <p>{interp(v.pluginDescription10)}</p>
          <div className="plugin-visual10">
            <img className={`brand12 ${v.pluginBrandClass12}`} src={v.pluginBrand12} alt="" />
            <span>+</span>
            <img src="/assets/logo/botinc-mark.svg" alt="BotInc" />
          </div>
          <h3>What Operator can do</h3>
          {(v.pluginCapabilities10 ?? []).map((c: any, i: number) => (
            <Fragment key={i}>
              <p className="plugin-cap10">
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
                  <use href="/i15.svg#check" />
                </svg>
                {interp(c)}
              </p>
            </Fragment>
          ))}
          <p className="fine">{interp(v.pluginPermission10)}</p>
          <button className="button primary" onClick={v.pluginConnect10}>
            {interp(v.pluginButton10)}
          </button>
          {v.pluginConnected10 ? (
            <>
              <button className="text-button" onClick={v.pluginDisconnect10}>
                Disconnect plugin
              </button>
            </>
          ) : null}
          <p className="fine">Connection preview only. No account authorization is sent.</p>
        </div>
      </>
    ) : null
  );
}
