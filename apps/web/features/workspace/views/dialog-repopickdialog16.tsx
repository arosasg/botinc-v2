/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogRepopickdialog16({ v }: { v: Vals }) {
  return (
    v.repoPickDialog16 ? (
      <>
        <span className="eyebrow">GITHUB</span>
        <h2 id="dialog-title">Choose a repository.</h2>
        <p className="dialog-copy">BotInc can only see what the GitHub app was granted.</p>
        <label className="menu-search15 rp-search16">
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
            <use href="/i15.svg#search" />
          </svg>
          <span className="sr-only">Search repositories</span>
          <input placeholder="Search repositories…" value={v.rpQuery16} onInput={v.rpEdit16} />
        </label>
        <div className="rp-rows16">
          {(v.rpRows16 ?? []).map((r: any, i: number) => (
            <Fragment key={i}>
              <button type="button" className={`rp-row16 ${r.cls}`} onClick={r.pick}>
                <img className="repo-gh16" src="/assets/providers/c-github.svg" alt="" />
                <span>
                  <strong>{interp(r.name)}</strong>
                  <small>{interp(r.note)}</small>
                </span>
                <em>{interp(r.state)}</em>
              </button>
            </Fragment>
          ))}
        </div>
        {v.rpEmpty16 ? (
          <>
            <p className="rp-none16">Nothing matches that name in what BotInc can see.</p>
          </>
        ) : null}
        <div className="rp-grant16">
          <span>
            <strong>Not finding a repository?</strong>
            <small>The GitHub app needs access to it before BotInc can see it.</small>
          </span>
          <button className="small-button" onClick={v.rpGrant16}>
            Give GitHub access
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
        </div>
      </>
    ) : null
  );
}
