/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageWork({ v }: { v: Vals }) {
  return (
    v.workPage ? (
      <>
        <main className="work-v8 work-v9" data-screen-label="Work">
          <div className="v7-page-heading">
            <div>
              <h1>Work</h1>
              <p>{interp(v.w8Lede16)}</p>
            </div>
            <div className="head-actions14">
              {v.hasNeeds16 ? (
                <>
                  <button className="small-button attn16" onClick={v.fixMenu16} aria-haspopup="menu">
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
                      <use href="/i15.svg#circle-alert" />
                    </svg>
                    {interp(v.attnLabel16)}
                  </button>
                </>
              ) : null}
              <button className="small-button primary" onClick={v.newIssue}>
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
                </svg>{" "}
                New issue
              </button>
            </div>
          </div>
          <div className="w8-find16">
            <div className="w8-controls">
              <label className="w8-search">
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
                <span className="sr-only">Search work</span>
                <input placeholder="Search title, ID, source, or person" value={v.w8Search} onChange={v.editW8Search} />
                {v.w8HasSearch ? (
                  <>
                    <button className="icon-button" aria-label="Clear search" onClick={v.clearW8Search}>
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
                  </>
                ) : null}
              </label>
              <button type="button" className="small-button w8-import16" onClick={v.w8Import16}>
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
                </svg>{" "}
                Import
              </button>
              <div className="w8-fields">
                <label className="w8-field">
                  <span className="sr-only">Owner</span>
                  <button
                    type="button"
                    className={`sel14 ${v.m14_w8Owner?.cls}`}
                    aria-haspopup="listbox"
                    aria-expanded={v.m14_w8Owner?.expanded}
                    onClick={v.m14_w8Owner?.pick}
                  >
                    <span>{interp(v.m14_w8Owner?.label)}</span>
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
                </label>
                <label className="w8-field">
                  <span className="sr-only">Project</span>
                  <button
                    type="button"
                    className={`sel14 ${v.m14_w8Project?.cls}`}
                    aria-haspopup="listbox"
                    aria-expanded={v.m14_w8Project?.expanded}
                    onClick={v.m14_w8Project?.pick}
                  >
                    <span>{interp(v.m14_w8Project?.label)}</span>
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
                </label>
                <label className="w8-field">
                  <span className="sr-only">Sort</span>
                  <button
                    type="button"
                    className={`sel14 ${v.m14_w8Sort?.cls}`}
                    aria-haspopup="listbox"
                    aria-expanded={v.m14_w8Sort?.expanded}
                    onClick={v.m14_w8Sort?.pick}
                  >
                    <span>{interp(v.m14_w8Sort?.label)}</span>
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
                </label>
              </div>
            </div>
            {v.w8SearchWide16 ? (
              <>
                <p className="w8-findnote16">
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
                  {interp(v.w8SearchNote16)}
                </p>
              </>
            ) : null}
          </div>
          <div className="w8-bar16">
            <nav className="w8-nav w8-nav16" aria-label="Filter work by status">
              {(v.w8Nav ?? []).map((n: any, i: number) => (
                <Fragment key={i}>
                  <button className={n.navCls16} onClick={n.open}>
                    <span className="w8-nav-icon">
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
                        <use href={n.iconHref} />
                      </svg>
                    </span>
                    {interp(n.label)}
                    <span className="w8-nav-count">{interp(n.count)}</span>
                  </button>
                </Fragment>
              ))}
            </nav>
          </div>
          {v.w8FilterActive ? (
            <>
              <div className="w8-filter-note">
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
                    <use href="/i15.svg#funnel" />
                  </svg>{" "}
                  {interp(v.w8FilterNote)}
                </span>
                <button className="text-button" onClick={v.clearW8Filters}>
                  Clear filters
                </button>
              </div>
            </>
          ) : null}
          {v.w8HasRows ? (
            <>
              <div className="w8-groups">
                {(v.w8Groups ?? []).map((g: any, i: number) => (
                  <Fragment key={i}>
                    <section className="w8-group">
                      <header className="w8-group-head">
                        <span className={`w8-group-icon ${g.tone}`}>
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
                            <use href={g.iconHref} />
                          </svg>
                        </span>
                        <span className="w8-gname16">
                          <h2>{interp(g.label)}</h2>
                          <span className="w8-group-count">{interp(g.count)}</span>
                          {g.hasMore ? (
                            <>
                              <button className="text-button" onClick={g.openAll}>
                                {interp(g.moreLabel)}{" "}
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
                              </button>
                            </>
                          ) : null}
                        </span>
                        <span className="w8-collabel16 col-prio16" aria-hidden="true">
                          Priority
                        </span>
                        <span className="w8-collabel16 col-project16" aria-hidden="true">
                          Project
                        </span>
                        <span className="w8-collabel16 col-source16" aria-hidden="true">
                          Source
                        </span>
                        <span className="w8-collabel16 col-owner16" aria-hidden="true">
                          Owner
                        </span>
                        <span className="w8-collabel16 col-updated16" aria-hidden="true">
                          Updated
                        </span>
                      </header>
                      <div className="w8-rows">
                        {(g.rows ?? []).map((w: any, i: number) => (
                          <Fragment key={i}>
                            <button className="w8-row" onClick={w.open}>
                              <span className={`w8-state ${w.tone}`}>
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
                                  <use href={w.iconHref} />
                                </svg>
                              </span>
                              <span className="w8-id">{interp(w.id)}</span>
                              <span className="w8-title">
                                <strong>{interp(w.title)}</strong>
                                <small className="w8-inline-meta">{interp(w.mobileMeta)}</small>
                              </span>
                              <span className={`w8-prio ${w.prioCls} ${w.prioLevel16}`}>
                                <span className="w8-bars16" aria-hidden="true">
                                  <i />
                                  <i />
                                  <i />
                                </span>
                                <span className="w8-prio-label16">{interp(w.priority)}</span>
                              </span>
                              <span className="w8-project">{interp(w.project)}</span>
                              <span className={`w8-source ${w.sourceTone16}`}>
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
                                  <use href={w.sourceIconHref} />
                                </svg>
                                <span>{interp(w.sourceKey)}</span>
                              </span>
                              <span className="w8-ownercell16" title={w.ownerTitle}>
                                <span className="w8-owner">{interp(w.ownerInitial)}</span>
                                <span className="w8-ownername16">{interp(w.ownerName16)}</span>
                              </span>
                              <time className="w8-updated">{interp(w.updated)}</time>
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </section>
                  </Fragment>
                ))}
              </div>
              <div className="w8-foot">
                <p>{interp(v.w8CountLine)}</p>
                {v.w8HasNextPage ? (
                  <>
                    <button className="small-button" onClick={v.w8ShowMore}>
                      {interp(v.w8MoreLabel)}
                    </button>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
          {v.w8FirstRun16 ? (
            <>
              <section className="w8-first16">
                <span className="w8-first-mark16">
                  <img src="/assets/logo/botinc-mark.svg" alt="" />
                </span>
                <h2>Post your first issue.</h2>
                <p>
                  Work is the register of everything the company is doing for you. You write what needs to happen; the
                  roster picks it up, builds it, reviews it, and brings it back for your approval.
                </p>
                <ol className="w8-steps16">
                  {(v.w8FirstSteps16 ?? []).map((s: any, i: number) => (
                    <Fragment key={i}>
                      <li>
                        <span className="w8-stepn16">{interp(s.n)}</span>
                        <span>
                          <strong>{interp(s.title)}</strong>
                          <small>{interp(s.copy)}</small>
                        </span>
                      </li>
                    </Fragment>
                  ))}
                </ol>
                <div className="w8-first-actions16">
                  <button className="small-button primary" onClick={v.newIssue}>
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
                    </svg>{" "}
                    Write the first issue
                  </button>
                  <button className="small-button" onClick={v.w8FirstImport16}>
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
                    </svg>{" "}
                    Import issues
                  </button>
                  <button className="text-button" onClick={v.dockOpenBtn15}>
                    Talk it through instead
                  </button>
                </div>
                <p className="fine">Nothing merges itself. Every result comes back for your approval.</p>
              </section>
            </>
          ) : null}
          {v.w8EmptyFiltered16 ? (
            <>
              <section className="w8-empty">
                <span className="w8-empty-icon">
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
                    <use href={v.w8EmptyIcon} />
                  </svg>
                </span>
                <h2>{interp(v.w8EmptyTitle)}</h2>
                <p>{interp(v.w8EmptyCopy)}</p>
                <div className="w8-empty-actions">
                  <button className="small-button primary" onClick={v.w8EmptyPrimary}>
                    {interp(v.w8EmptyPrimaryLabel)}{" "}
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
                  </button>
                  {v.w8HasEmptySecondary ? (
                    <>
                      <button className="text-button" onClick={v.w8EmptySecondary}>
                        {interp(v.w8EmptySecondaryLabel)}
                      </button>
                    </>
                  ) : null}
                </div>
              </section>
            </>
          ) : null}
        </main>
      </>
    ) : null
  );
}
