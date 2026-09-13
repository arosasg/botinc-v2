/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PagePlugins({ v }: { v: Vals }) {
  return (
    v.pluginsPage10 ? (
      <>
        <main className="plugins10 page10 settings-v7 plugins16" data-screen-label="Plugins">
          <div className="s7-back-row">
            <button className="text-button" onClick={v.showSettings}>
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
              </svg>{" "}
              Settings
            </button>
          </div>
          <div className="settings-title pf-title16 has-cta16">
            <span className="settings-scope">
              <svg
                className="ui-icon "
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
              {interp(v.pfScope16)}
            </span>
            <h2>Plugins</h2>
            <p>Your tools, ready in every conversation.</p>
            <span className="settings-cta16">
              <button className="small-button" onClick={v.customMcp10}>
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
                  <use href="/i15.svg#plus" />
                </svg>
                Add MCP
              </button>
            </span>
          </div>
          <label className="search10">
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
            <input
              aria-label="Search plugins"
              placeholder="Search plugins"
              value={v.pluginQuery10}
              onChange={v.searchPlugins10}
            />
          </label>
          <nav className="filter-tabs10">
            {(v.pluginTabs10 ?? []).map((t: any, i: number) => (
              <Fragment key={i}>
                <button className={t.cls} onClick={t.pick}>
                  {interp(t.label)}
                </button>
              </Fragment>
            ))}
          </nav>
          {(v.pluginGroups10 ?? []).map((g: any, i: number) => (
            <Fragment key={i}>
              <section className="plugin-section10">
                <header>
                  <h2>{interp(g.title)}</h2>
                  <span>{interp(g.count)}</span>
                </header>
                <div className="plugin-grid10">
                  {(g.rows ?? []).map((p: any, i: number) => (
                    <Fragment key={i}>
                      <button className="plugin-card10" onClick={p.open}>
                        <span className={`plugin-logo10 ${p.color}`}>
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
                        </span>
                        <span>
                          <strong>{interp(p.name)}</strong>
                          <small>{interp(p.copy)}</small>
                        </span>
                        <span className="plugin-status10">{interp(p.status)}</span>
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
              </section>
            </Fragment>
          ))}
          {v.noPlugins10 ? (
            <>
              <div className="empty10">
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
                  <use href="/i15.svg#plug" />
                </svg>
                <h2>{interp(v.pluginEmptyTitle10)}</h2>
                <p>{interp(v.pluginEmptyCopy10)}</p>
                <button className="small-button" onClick={v.browsePlugins10}>
                  Browse directory
                </button>
              </div>
            </>
          ) : null}
          <footer className="page-foot10">
            Plugins and permissions belong to {interp(v.memberName)}. Other members connect their own accounts.
          </footer>
        </main>
      </>
    ) : null
  );
}
