/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function PageCallWithYourOperator({ v }: { v: Vals }) {
  return (
    v.callBar16 ? (
      <>
        <div className="callbar16" role="dialog" aria-label="Call with your Operator" style={css(v.cbStyle16)}>
          <span className="cb-grip16" aria-hidden="true" onPointerDown={v.cbDrag16} />
          <span className={`cb-orb16 ${v.cbOrbTone16}`} aria-hidden="true" onPointerDown={v.cbDrag16} />
          <span className="cb-copy16" onPointerDown={v.cbDrag16}>
            <strong>{interp(v.cbState16)}</strong>
            <small>{interp(v.cbSub16)}</small>
          </span>
          <button
            type="button"
            className={`cb-btn16 ${v.cbMicCls16}`}
            aria-label={v.cbMicLabel16}
            title={v.cbMicLabel16}
            onClick={v.cbToggleMic16}
          >
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
              <use href={v.cbMicIcon16} />
            </svg>
          </button>
          <button
            type="button"
            className="cb-btn16 cb-dev16"
            aria-label="Choose audio device"
            title={v.cbDevice16}
            onClick={v.cbDeviceMenu16}
            aria-haspopup="menu"
          >
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
          <button type="button" className="cb-btn16 cb-end16" aria-label="End call" title="End call" onClick={v.cbEnd16}>
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
              <use href="/i15.svg#x" />
            </svg>
          </button>
        </div>
      </>
    ) : null
  );
}
