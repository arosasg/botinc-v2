/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageSettingsHomeV7({ v }: { v: Vals }) {
  return (
    v.settingsHome7 ? (
      <>
        <main className="settings-home-v7">
          <div className="v7-page-heading">
            <div>
              <h1>Settings</h1>
              <p>A few things to make BotInc work your way.</p>
            </div>
            <button className="v7-account-pill" onClick={v.profileMenu} aria-label="Your profile">
              <span className="person-avatar">{interp(v.memberInitial)}</span>
              {interp(v.memberName)}
            </button>
          </div>
          <div className="s7-home-grid">
            {(v.settingsHomeGroups7 ?? []).map((g: any, i: number) => (
              <Fragment key={i}>
                <section className="s7-home-group">
                  <div className="s7-group-title">
                    <h2>{interp(g.title)}</h2>
                    <span>{interp(g.scope)}</span>
                  </div>
                  {(g.items ?? []).map((i: any, ix: number) => (
                    <Fragment key={ix}>
                      <button className="s7-home-row" onClick={i.open}>
                        <span className="s7-home-icon">
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
                            <use href={i.iconHref} />
                          </svg>
                        </span>
                        <span>
                          <strong>{interp(i.title)}</strong>
                          <small>{interp(i.copy)}</small>
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
                </section>
              </Fragment>
            ))}
          </div>
          <details className="s7-advanced">
            <summary>
              <span>
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
                  <use href="/i15.svg#sliders-horizontal" />
                </svg>{" "}
                Advanced
              </span>
              <small>Workflows and activity</small>
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
            </summary>
            <div>
              {(v.settingsAdvanced7 ?? []).map((i: any, ix: number) => (
                <Fragment key={ix}>
                  <button className="s7-home-row" onClick={i.open}>
                    <span className="s7-home-icon">
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
                        <use href={i.iconHref} />
                      </svg>
                    </span>
                    <span>
                      <strong>{interp(i.title)}</strong>
                      <small>{interp(i.copy)}</small>
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
            </div>
          </details>
          <div className="s7-home-foot">
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
              <use href="/i15.svg#lock" />
            </svg>
            <p>
              Your accounts, skills, and memory belong to you.
              <br />
              Shared work stays in the BotInc workspace.
            </p>
          </div>
        </main>
      </>
    ) : null
  );
}
