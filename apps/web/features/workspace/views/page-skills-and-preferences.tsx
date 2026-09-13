/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageSkillsAndPreferences({ v }: { v: Vals }) {
  return (
    v.skillsPage10 ? (
      <>
        <main className="page10 settings-v7" data-screen-label="Skills and preferences">
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
          <div className="settings-title pf-title16">
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
            <h2>Skills</h2>
            <p>What your Operator knows how to do. You decide which are on.</p>
          </div>
          <nav className="w8-nav s14-nav sk-tabs16" aria-label="Skill sources">
            {(v.skTabs16 ?? []).map((t: any, i: number) => (
              <Fragment key={i}>
                <button className={t.cls} onClick={t.open}>
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
                      <use href={t.icon} />
                    </svg>
                  </span>
                  {interp(t.label)}
                  <span className="w8-nav-count">{interp(t.count)}</span>
                </button>
              </Fragment>
            ))}
          </nav>
          <div className="sk-bar16">
            <label className="w8-search sk-search16">
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
                placeholder={`Search ${v.skTotal16} skills`}
                value={v.skQ16}
                onInput={v.skEdit16}
                aria-label="Search skills"
              />
            </label>
            <button
              type="button"
              className="sel14"
              aria-haspopup="listbox"
              aria-label="Filter by plugin"
              onClick={v.skSourceMenu16}
            >
              <span>{interp(v.skSourceLabel16)}</span>
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
            <button type="button" className="sel14" aria-haspopup="listbox" aria-label="Sort" onClick={v.skSortMenu16}>
              <span>{interp(v.skSortLabel16)}</span>
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
            <button className="small-button primary" onClick={v.addSkill10}>
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
              Add skill
            </button>
          </div>
          <div className="sk-list16">
            <div className="sk-th16">
              <span>Skill</span>
              <span>Source</span>
              <span>Used</span>
              <span>Mode</span>
            </div>
            {(v.skRows16 ?? []).map((k: any, i: number) => (
              <Fragment key={i}>
                <article className="sk-row16">
                  <button type="button" className="sk-open16" onClick={k.open}>
                    <span className="sk-mark16">
                      {k.hasLogo ? (
                        <>
                          <img src={k.logo} alt="" />
                        </>
                      ) : null}
                      {!k.hasLogo ? (
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
                            <use href="/i15.svg#book-open" />
                          </svg>
                        </>
                      ) : null}
                    </span>
                    <span className="sk-body16">
                      <strong>{interp(k.name)}</strong>
                      <small>{interp(k.copy)}</small>
                    </span>
                  </button>
                  <span className="sk-src16">{interp(k.source)}</span>
                  <span className="sk-used16">{interp(k.used)}</span>
                  <button
                    type="button"
                    className={`sk-mode16 ${k.modeCls}`}
                    role="switch"
                    aria-checked={k.on}
                    aria-label={k.modeAria}
                    onClick={k.toggle}
                  >
                    <i />
                    <span>{interp(k.mode)}</span>
                  </button>
                </article>
              </Fragment>
            ))}
            {v.skEmpty16 ? (
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
                    <use href="/i15.svg#search-x" />
                  </svg>
                  <h2>No skill matches</h2>
                  <p>Try another word, or add the skill you were looking for.</p>
                </div>
              </>
            ) : null}
          </div>
          <div className="sk-foot16">
            <span>{interp(v.skShowing16)}</span>
            {v.skHasMore16 ? (
              <>
                <button className="small-button" onClick={v.skMore16}>
                  Show 50 more
                </button>
              </>
            ) : null}
          </div>
        </main>
      </>
    ) : null
  );
}
