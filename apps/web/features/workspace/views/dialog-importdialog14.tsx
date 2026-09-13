/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogImportdialog14({ v }: { v: Vals }) {
  return (
    v.importDialog14 ? (
      <>
        <span className="eyebrow">WORK · ONE-TIME IMPORT</span>
        <h2 id="dialog-title">{interp(v.importTitle14)}</h2>
        <p className="dialog-copy">{interp(v.importCopy14)}</p>
        {v.importPickStep14 ? (
          <>
            <div className="conn-gallery14">
              {(v.importProviders14 ?? []).map((p: any, i: number) => (
                <Fragment key={i}>
                  <button className={`conn-tile14 ${p.cls}`} onClick={p.choose}>
                    <span className="conn-logo14">
                      {p.logo ? (
                        <>
                          <img className={p.logoClass} src={p.logoSrc} alt="" />
                        </>
                      ) : null}
                      {!p.logo ? (
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
                    </span>
                    <strong>{interp(p.name)}</strong>
                    <small>{interp(p.copy)}</small>
                  </button>
                </Fragment>
              ))}
            </div>
            <p className="fine">
              Importing copies issues once. BotInc does not create a recurring sync and does not write back to the source.
            </p>
          </>
        ) : null}
        {v.importMapStep14 ? (
          <>
            <div className="imp-summary14">
              <span className="conn-logo14">
                {v.importHasLogo14 ? (
                  <>
                    <img className={v.importLogoClass14} src={v.importLogo14} alt="" />
                  </>
                ) : null}
                {!v.importHasLogo14 ? (
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
                      <use href={v.importIcon14} />
                    </svg>
                  </>
                ) : null}
              </span>
              <div>
                <strong>{interp(v.importSourceName14)}</strong>
                <small>{interp(v.importScanned14)}</small>
              </div>
            </div>
            <p className="gside-title14">Status mapping</p>
            <div className="imp-map14">
              {(v.importStatusRows14 ?? []).map((r: any, i: number) => (
                <Fragment key={i}>
                  <div className="imp-maprow14">
                    <span className="imp-from14">{interp(r.from)}</span>
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
                    <button
                      className="sel14"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={r.expanded}
                      aria-label={`Map ${r.from} to a BotInc status`}
                      onClick={r.pick}
                    >
                      <span>{interp(r.to)}</span>
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
                    <small>{interp(r.count)}</small>
                  </div>
                </Fragment>
              ))}
            </div>
            <p className="gside-title14">People</p>
            <div className="imp-map14">
              {(v.importPeopleRows14 ?? []).map((r: any, i: number) => (
                <Fragment key={i}>
                  <div className="imp-maprow14">
                    <span className="imp-from14">{interp(r.from)}</span>
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
                    <button
                      className="sel14"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={r.expanded}
                      aria-label={`Map ${r.from} to a member`}
                      onClick={r.pick}
                    >
                      <span>{interp(r.to)}</span>
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
                    <small className={r.tone}>{interp(r.note)}</small>
                  </div>
                </Fragment>
              ))}
            </div>
            <label className="check-row">
              <input type="checkbox" checked={v.importKeepParents14} onChange={v.toggleImportParents14} />
              <span>
                Keep parent and subissue links<small>{interp(v.importParentNote14)}</small>
              </span>
            </label>
            <label className="check-row">
              <input type="checkbox" checked={v.importSkipDuplicates14} onChange={v.toggleImportDuplicates14} />
              <span>
                Skip issues already imported<small>{interp(v.importDuplicateNote14)}</small>
              </span>
            </label>
            <div className="imp-preview14">
              <p className="gside-title14">Preview</p>
              {(v.importPreviewRows14 ?? []).map((r: any, i: number) => (
                <Fragment key={i}>
                  <div className={`imp-prow14 ${r.tone}`}>
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
                      <use href={r.icon} />
                    </svg>
                    <span className="imp-pid14">{interp(r.id)}</span>
                    <span className="imp-ptitle14">{interp(r.title)}</span>
                    <span className="imp-pstate14">{interp(r.state)}</span>
                    <small>{interp(r.note)}</small>
                  </div>
                </Fragment>
              ))}
            </div>
            {v.hasImportError14 ? (
              <>
                <p className="error" role="alert">
                  {interp(v.importError14)}
                </p>
              </>
            ) : null}
            <div className="dialog-actions">
              <button className="small-button" onClick={v.importBack14}>
                Back
              </button>
              <button className="small-button primary" onClick={v.runImport14}>
                {interp(v.importActionLabel14)}
              </button>
            </div>
          </>
        ) : null}
        {v.importDoneStep14 ? (
          <>
            <div className="a8-done">
              <span className="a8-done-icon">
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
                  <use href="/i15.svg#circle-check" />
                </svg>
              </span>
              <div>
                <strong>{interp(v.importDoneTitle14)}</strong>
                <p>{interp(v.importDoneCopy14)}</p>
              </div>
            </div>
            <div className="permission-box">
              <strong>One-time migration</strong>
              <p>{interp(v.importDoneNote14)}</p>
            </div>
            <div className="dialog-actions">
              <button className="small-button" onClick={v.closeDialog}>
                Close
              </button>
              <button className="small-button primary" onClick={v.openImported14}>
                Open imported work
              </button>
            </div>
          </>
        ) : null}
      </>
    ) : null
  );
}
