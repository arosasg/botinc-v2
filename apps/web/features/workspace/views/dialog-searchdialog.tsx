/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogSearchdialog({ v }: { v: Vals }) {
  return (
    v.searchDialog ? (
      <>
        <h2 id="dialog-title" className="sr-only">
          Search BotInc
        </h2>
        <div className="search14">
          <div className="search-input14">
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
            <label className="sr-only" htmlFor="search-field">
              Search issues, conversations and routines
            </label>
            <input
              id="search-field"
              placeholder="Search issues, conversations and routines…"
              value={v.searchQuery}
              onInput={v.editSearch14}
              onKeyDown={v.searchKey14}
              aria-label="Search issues, conversations and routines"
            />
            <kbd>esc</kbd>
          </div>
          <nav className="w8-nav search-tabs14 stabs16" role="tablist" aria-label="Filter results">
            {(v.searchTabs14 ?? []).map((t: any, i: number) => (
              <Fragment key={i}>
                <button role="tab" aria-selected={t.on} className={t.cls} onClick={t.open}>
                  <svg
                    className="ui-icon use14 stab-icon16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <use href={t.icon16} />
                  </svg>
                  {interp(t.title)}
                  <span className="w8-nav-count">{interp(t.count)}</span>
                </button>
              </Fragment>
            ))}
          </nav>
          <div className="search-results14">
            {(v.searchGroups14 ?? []).map((g: any, i: number) => (
              <Fragment key={i}>
                <section className="search-section14">
                  <p className="search-group14">
                    {g.hasIcon ? (
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
                          <use href={g.icon} />
                        </svg>
                      </>
                    ) : null}
                    {interp(g.title)}
                  </p>
                  {(g.rows ?? []).map((r: any, i: number) => (
                    <Fragment key={i}>
                      <button type="button" className={`search-row14 ${r.cls}`} onClick={r.open}>
                        <span className={`search-mark14 ${r.tone}`}>
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
                        </span>
                        {r.hasId ? (
                          <>
                            <span className="search-id14">{interp(r.id)}</span>
                          </>
                        ) : null}
                        <span className="search-title14">{interp(r.title)}</span>
                        <span className="search-meta14">
                          {r.hasSnippet ? (
                            <>
                              <span className="search-snippet14">{interp(r.snippet)}</span>
                            </>
                          ) : null}
                          {r.hasProject ? (
                            <>
                              <span className="search-project14">{interp(r.project)}</span>
                            </>
                          ) : null}
                          {r.hasStatus ? (
                            <>
                              <span className="search-status14">{interp(r.status)}</span>
                            </>
                          ) : null}
                          {r.hasPerson ? (
                            <>
                              <span className="search-person14" title={r.person}>
                                {interp(r.initial)}
                              </span>
                            </>
                          ) : null}
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </section>
              </Fragment>
            ))}
            {v.searchNoResults14 ? (
              <>
                <div className="search-empty14">
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
                    <use href="/i15.svg#search-x" />
                  </svg>
                  <strong>No matches for “{interp(v.searchQuery)}”</strong>
                  <p>Try an issue ID, a person, a conversation title or a routine.</p>
                  <button className="small-button" onClick={v.searchCreate14}>
                    Create an issue for this instead
                  </button>
                </div>
              </>
            ) : null}
            {v.searchIdle14 ? (
              <>
                <p className="search-hint14">
                  Start typing to search issues, conversations and routines. Recent work is listed above.
                </p>
              </>
            ) : null}
          </div>
          <footer className="search-foot14">
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
                <use href="/i15.svg#arrow-up" />
              </svg>
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
                <use href="/i15.svg#arrow-down" />
              </svg>{" "}
              move
            </span>
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
                <use href="/i15.svg#corner-down-left" />
              </svg>{" "}
              open
            </span>
            <span>esc close</span>
            {v.goalChip16 ? (
              <>
                <span className="cbar-chip16 goal16">
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
                    <use href="/i15.svg#flag" />
                  </svg>
                  {v.goalEditing16 ? (
                    <>
                      <input
                        className="cbar-goalin16"
                        placeholder="What should come of this?"
                        value={v.goalDraft16}
                        onInput={v.goalEdit16}
                        onKeyDown={v.goalKey16}
                        onBlur={v.goalCommit16}
                        aria-label="Goal for this conversation"
                      />
                    </>
                  ) : null}
                  {!v.goalEditing16 ? (
                    <>
                      <button type="button" className="cbar-chiptext16" onClick={v.goalOpen16} title={v.goalFull16}>
                        {interp(v.goalShort16)}
                      </button>
                    </>
                  ) : null}
                  <button type="button" className="cbar-chipx16" aria-label="Remove goal" onClick={v.goalClear16}>
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
                </span>
              </>
            ) : null}
            {v.planChip16 ? (
              <>
                <span className="cbar-chip16 plan16">
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
                    <use href="/i15.svg#lightbulb" />
                  </svg>
                  <span className="cbar-chiptext16">Plan</span>
                  <button type="button" className="cbar-chipx16" aria-label="Turn plan mode off" onClick={v.planClear16}>
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
                </span>
              </>
            ) : null}
            <span className="composer-spacer" />
            <span>{interp(v.searchCountLabel14)}</span>
          </footer>
        </div>
      </>
    ) : null
  );
}
