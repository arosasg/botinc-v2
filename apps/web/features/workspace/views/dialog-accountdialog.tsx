/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function DialogAccountdialog({ v }: { v: Vals }) {
  return (
    v.accountDialog ? (
      <>
        <div className="a8-detail-head">
          <span className="s7-tool-icon">
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
              <use href={v.acc?.iconHref} />
            </svg>
          </span>
          <div>
            <span className="eyebrow">{interp(v.acc?.providerLabel)}</span>
            <h2 id="dialog-title">{interp(v.acc?.identity)}</h2>
          </div>
          <span className={`a8-badge ${v.acc?.stateCls}`}>{interp(v.acc?.stateLabel)}</span>
        </div>
        {v.accountRemoving ? (
          <>
            <p className="dialog-copy">Remove this account from {interp(v.memberName)}&apos;s workspace?</p>
            <div className="permission-box">
              <strong>What changes</strong>
              <p>{interp(v.acc?.removeCopy)}</p>
            </div>
            <div className="dialog-actions">
              <button className="small-button" onClick={v.cancelRemoveAccount}>
                Keep account
              </button>
              <button className="small-button primary" onClick={v.confirmRemoveAccount}>
                Remove account
              </button>
            </div>
          </>
        ) : null}
        {v.accountOverview ? (
          <>
            <dl className="detail-grid">
              <dt>Provider</dt>
              <dd>{interp(v.acc?.providerLabel)}</dd>
              <dt>Access</dt>
              <dd>{interp(v.acc?.kindLabel)}</dd>
              <dt>Plan</dt>
              <dd>{interp(v.acc?.plan)}</dd>
              <dt>Owner</dt>
              <dd>{interp(v.acc?.owner)}</dd>
              <dt>Available on</dt>
              <dd>{interp(v.acc?.where)}</dd>
              <dt>Connected</dt>
              <dd>{interp(v.acc?.added)}</dd>
              <dt>Serves models</dt>
              <dd>{interp(v.acc?.models)}</dd>
            </dl>
            <h3 className="subheading">Usage windows</h3>
            <div className="a8-usage a8-usage-wide">
              {(v.acc?.windows ?? []).map((u: any, i: number) => (
                <Fragment key={i}>
                  <div className="a8-window">
                    <span className="a8-window-label">{interp(u.label)}</span>
                    <span className="a8-bar">
                      <i className={u.tone} style={css(u.style)} />
                    </span>
                    <span className="a8-pct">{interp(u.pct)}</span>
                    <span className="a8-reset">{interp(u.reset)}</span>
                  </div>
                </Fragment>
              ))}
              {v.acc?.noWindows ? (
                <>
                  <p className="a8-nowindow">{interp(v.acc?.noWindowCopy)}</p>
                </>
              ) : null}
              <p className={`a8-fresh ${v.acc?.freshCls}`}>{interp(v.acc?.freshLabel)}</p>
            </div>
            {v.acc?.hasReason ? (
              <>
                <div className="info-box">
                  <h3>{interp(v.acc?.reasonTitle)}</h3>
                  <p>{interp(v.acc?.reasonCopy)}</p>
                </div>
              </>
            ) : null}
            <div className="a8-detail-actions">
              <button className="small-button" onClick={v.refreshAccountUsage}>
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
                  <use href="/i15.svg#refresh-cw" />
                </svg>{" "}
                Refresh usage
              </button>
              {v.acc?.routable ? (
                <>
                  <button className="small-button" onClick={v.toggleAccountEnabled}>
                    {interp(v.acc?.toggleLabel)}
                  </button>
                </>
              ) : null}
              {v.acc?.canReconnect ? (
                <>
                  <button className="small-button primary" onClick={v.reconnectAccount}>
                    Reconnect
                  </button>
                </>
              ) : null}
              {v.acc?.canDefault ? (
                <>
                  <button className="small-button" onClick={v.makeDefaultAccount}>
                    Use for my work
                  </button>
                </>
              ) : null}
              <button className="small-button" onClick={v.askRemoveAccount}>
                Remove
              </button>
            </div>
            <p className="fine">{interp(v.acc?.note)}</p>
          </>
        ) : null}
      </>
    ) : null
  );
}
