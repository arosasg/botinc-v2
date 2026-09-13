/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogFileviewdialog16({ v }: { v: Vals }) {
  return (
    v.fileViewDialog16 ? (
      <>
        <div className="fv16" tabIndex={0} onKeyDown={v.fvKey16}>
          <div className="fv-top16">
            <span className="fv-mark16">
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
                <use href={v.fvIcon16} />
              </svg>
            </span>
            <div className="fv-title16">
              <h2 id="dialog-title">{interp(v.fvName16)}</h2>
              <p>{interp(v.fvMeta16)}</p>
            </div>
            <div className="fv-nav16">
              <button
                type="button"
                className="icon-button"
                aria-label="Previous file"
                onClick={v.fvPrev16}
                disabled={v.fvFirst16}
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
                  <use href="/i15.svg#chevron-left" />
                </svg>
              </button>
              <span className="fv-count16">
                {interp(v.fvIndex16)} of {interp(v.fvTotal16)}
              </span>
              <button
                type="button"
                className="icon-button"
                aria-label="Next file"
                onClick={v.fvNext16}
                disabled={v.fvLast16}
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
                  <use href="/i15.svg#chevron-right" />
                </svg>
              </button>
            </div>
          </div>
          <div className={`fv-body16 fv-${v.fvKind16}`}>
            {v.fvIsMd16 ? (
              <>
                <div className="md16">
                  {(v.fvBlocks16 ?? []).map((b: any, i: number) => (
                    <Fragment key={i}>
                      {b.h1 ? (
                        <>
                          <h3 className="md-h1-16">{interp(b.text)}</h3>
                        </>
                      ) : null}
                      {b.h2 ? (
                        <>
                          <h4 className="md-h2-16">{interp(b.text)}</h4>
                        </>
                      ) : null}
                      {b.p ? (
                        <>
                          <p className="md-p16">{interp(b.text)}</p>
                        </>
                      ) : null}
                      {b.li ? (
                        <>
                          <div className="md-li16">
                            <i />
                            <span>{interp(b.text)}</span>
                          </div>
                        </>
                      ) : null}
                      {b.num ? (
                        <>
                          <div className="md-li16 md-num16">
                            <b>{interp(b.n)}</b>
                            <span>{interp(b.text)}</span>
                          </div>
                        </>
                      ) : null}
                      {b.code ? (
                        <>
                          <pre className="md-code16">{interp(b.text)}</pre>
                        </>
                      ) : null}
                      {b.hr ? (
                        <>
                          <hr className="md-hr16" />
                        </>
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.fvIsDiff16 ? (
              <>
                <div className="fv-diff16">
                  {(v.fvLines16 ?? []).map((d: any, i: number) => (
                    <Fragment key={i}>
                      <span className={`fv-drow16 ${d.cls}`}>
                        <span className="fv-dn16">{interp(d.n)}</span>
                        <span className="fv-ds16">{interp(d.sign)}</span>
                        <code>{interp(d.text)}</code>
                      </span>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.fvIsText16 ? (
              <>
                <div className="fv-text16">
                  {(v.fvLines16 ?? []).map((d: any, i: number) => (
                    <Fragment key={i}>
                      <span className="fv-trow16">
                        <span className="fv-dn16">{interp(d.n)}</span>
                        <code>{interp(d.text)}</code>
                      </span>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.fvIsImage16 ? (
              <>
                <div className="fv-image16">
                  <img src={v.fvUrl16} alt={v.fvName16} />
                </div>
              </>
            ) : null}
            {v.fvIsPdf16 ? (
              <>
                <div className="fv-pdf16">
                  <div className="fv-page16">
                    <span className="fv-pagetag16">Page 1 of {interp(v.fvPages16)}</span>
                    <div className="md16">
                      {(v.fvBlocks16 ?? []).map((b: any, i: number) => (
                        <Fragment key={i}>
                          {b.h1 ? (
                            <>
                              <h3 className="md-h1-16">{interp(b.text)}</h3>
                            </>
                          ) : null}
                          {b.h2 ? (
                            <>
                              <h4 className="md-h2-16">{interp(b.text)}</h4>
                            </>
                          ) : null}
                          {b.p ? (
                            <>
                              <p className="md-p16">{interp(b.text)}</p>
                            </>
                          ) : null}
                          {b.li ? (
                            <>
                              <div className="md-li16">
                                <i />
                                <span>{interp(b.text)}</span>
                              </div>
                            </>
                          ) : null}
                          {b.num ? (
                            <>
                              <div className="md-li16 md-num16">
                                <b>{interp(b.n)}</b>
                                <span>{interp(b.text)}</span>
                              </div>
                            </>
                          ) : null}
                          {b.code ? (
                            <>
                              <pre className="md-code16">{interp(b.text)}</pre>
                            </>
                          ) : null}
                          {b.hr ? (
                            <>
                              <hr className="md-hr16" />
                            </>
                          ) : null}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <p className="fine">PDF preview. Download to read every page.</p>
                </div>
              </>
            ) : null}
          </div>
          <div className="dialog-actions fv-foot16">
            <div className="fv-strip16">
              {(v.fvStrip16 ?? []).map((s: any, i: number) => (
                <Fragment key={i}>
                  <button type="button" className={`fv-chip16 ${s.cls}`} onClick={s.pick}>
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
                      <use href={s.icon} />
                    </svg>
                    {interp(s.name)}
                  </button>
                </Fragment>
              ))}
            </div>
            <button className="small-button" onClick={v.closeDialog}>
              Close
            </button>
            <button className="small-button" onClick={v.fvAttach16}>
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
                <use href="/i15.svg#paperclip" />
              </svg>
              Add to chat
            </button>
            <button className="small-button primary" onClick={v.fvDownload16}>
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
                <use href="/i15.svg#download" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </>
    ) : null
  );
}
