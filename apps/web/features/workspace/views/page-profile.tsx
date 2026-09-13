/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function PageProfile({ v }: { v: Vals }) {
  return (
    v.profilePage10 ? (
      <>
        <main className="page10 profile15 settings-v7" data-screen-label="Profile">
          <div className="pf-wrap15">
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
              <div className="settings-page-icon">
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
                  <use href="/i15.svg#user" />
                </svg>
              </div>
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
              <h2>Your settings</h2>
              <p>Profile, security, notifications and how Operator works with you.</p>
            </div>
            <nav className="w8-nav s14-nav" role="tablist" aria-label="Profile sections">
              {(v.pfTabs16 ?? []).map((p: any, i: number) => (
                <Fragment key={i}>
                  <button role="tab" aria-selected={p.on} className={p.cls} onClick={p.open}>
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
                        <use href={p.icon} />
                      </svg>
                    </span>
                    {interp(p.name)}
                  </button>
                </Fragment>
              ))}
            </nav>
            {v.pfSecurity16 ? (
              <>
                <section className="pf-card15">
                  <h3 className="pf-h16">How you sign in</h3>
                  <div className="pf-rows16">
                    {(v.pfMethodRows16 ?? []).map((r: any, i: number) => (
                      <Fragment key={i}>
                        <div className="pf-row16">
                          <span className="pf-mark16">
                            {r.hasLogo16 ? (
                              <>
                                <img src={r.logo16} alt="" />
                              </>
                            ) : null}
                            {r.hasGlyph16 ? (
                              <>
                                <b>{interp(r.glyph16)}</b>
                              </>
                            ) : null}
                            {r.hasIcon16 ? (
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
                                  <use href={r.icon} />
                                </svg>
                              </>
                            ) : null}
                          </span>
                          <span>
                            <strong>{interp(r.title)}</strong>
                            <small>{interp(r.copy)}</small>
                          </span>
                          <em className="pf-state16">{interp(r.state)}</em>
                          <button type="button" className="small-button" onClick={r.act}>
                            {interp(r.action)}
                          </button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </section>
                <section className="pf-card15">
                  <h3 className="pf-h16">Passkeys</h3>
                  <p className="pf-note16">
                    A passkey signs you in with the device you already unlock. No password travels.
                  </p>
                  <div className="pf-rows16">
                    {(v.pfPasskeyRows16 ?? []).map((r: any, i: number) => (
                      <Fragment key={i}>
                        <div className="pf-row16">
                          <span className="pf-mark16">
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
                              <use href={r.icon16} />
                            </svg>
                          </span>
                          <span>
                            <strong>{interp(r.title)}</strong>
                            <small>{interp(r.copy)}</small>
                          </span>
                          <button type="button" className="small-button" onClick={r.act}>
                            {interp(r.action)}
                          </button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <button type="button" className="small-button primary pf-add16" onClick={v.pfAddPasskey16}>
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
                    Add a passkey
                  </button>
                </section>
                <section className="pf-card15">
                  <h3 className="pf-h16">Account safety</h3>
                  <div className="pf-rows16">
                    {(v.pfSecurityRows16 ?? []).map((r: any, i: number) => (
                      <Fragment key={i}>
                        <div className="pf-row16">
                          <span>
                            <strong>{interp(r.title)}</strong>
                            <small>{interp(r.copy)}</small>
                          </span>
                          <button type="button" className="small-button" onClick={r.act}>
                            {interp(r.action)}
                          </button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
            {v.pfNotifs16 ? (
              <>
                <section className="pf-card15">
                  <h3 className="pf-h16">What reaches you</h3>
                  <div className="pf-rows16">
                    {(v.pfNotifRows16 ?? []).map((r: any, i: number) => (
                      <Fragment key={i}>
                        <div className="pf-row16">
                          <span>
                            <strong>{interp(r.title)}</strong>
                            <small>{interp(r.copy)}</small>
                          </span>
                          <button
                            type="button"
                            className={`pf-switch16 ${r.cls}`}
                            role="switch"
                            aria-checked={r.on}
                            aria-label={r.title}
                            onClick={r.toggle}
                          >
                            <i />
                          </button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
            {v.pfOperator16 ? (
              <>
                <section className="pf-card15 pf-op16">
                  <h3 className="pf-h16">How Operator works with you</h3>
                  <p className="pf-note16">Read at the start of every conversation and run. Only your Operator sees it.</p>
                  <textarea
                    className="field pf-optext16"
                    rows={4}
                    value={v.preferences10}
                    onChange={v.editPreferences10}
                    placeholder="Keep updates concise. Ask before publishing."
                    aria-label="Operator preferences"
                  />
                  <div className="pf-oprow16">
                    <span className="fine">Tip: say how you want to be asked, not only what to do.</span>
                    <button type="button" className="small-button primary" onClick={v.savePreferences10}>
                      Save preferences
                    </button>
                  </div>
                </section>
                <section className="pf-card15">
                  <h3 className="pf-h16">Skills and memory</h3>
                  <div className="pf-rows16">
                    <div className="pf-row16">
                      <span className="pf-mark16">
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
                      </span>
                      <span>
                        <strong>Skills</strong>
                        <small>{interp(v.pfSkillsCount16)}</small>
                      </span>
                      <button type="button" className="small-button" onClick={v.pfOpenSkills16}>
                        Open
                      </button>
                    </div>
                    <div className="pf-row16">
                      <span className="pf-mark16">
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
                          <use href="/i15.svg#brain" />
                        </svg>
                      </span>
                      <span>
                        <strong>Memory</strong>
                        <small>Review and control what Operator remembers</small>
                      </span>
                      <button type="button" className="small-button" onClick={v.memory10}>
                        Open
                      </button>
                    </div>
                    <div className="pf-row16">
                      <span className="pf-mark16">
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
                      </span>
                      <span>
                        <strong>Plugin permissions</strong>
                        <small>Control the tools your Operator can access</small>
                      </span>
                      <button type="button" className="small-button" onClick={v.installedPlugins10}>
                        Open
                      </button>
                    </div>
                  </div>
                </section>
              </>
            ) : null}
            {v.pfProfile16 ? (
              <>
                <section className="pf-card15">
                  <div className="pf-id15">
                    <span className="pf-avatar15">{interp(v.memberInitial)}</span>
                    <div className="pf-fields15">
                      <label className="pf-field15">
                        <span>Display name</span>
                        <input className="field" value={v.profileName10} onChange={v.editProfileName10} />
                      </label>
                      <label className="pf-field15">
                        <span>What you work on</span>
                        <input
                          className="field"
                          value={v.pfAbout15}
                          onChange={v.editPfAbout15}
                          placeholder="Voice and platform work"
                        />
                      </label>
                    </div>
                    <div className="pf-theme15" role="group" aria-label="Appearance">
                      <span>Appearance</span>
                      <div className="seg14">
                        {(v.pfThemeOptions15 ?? []).map((o: any, i: number) => (
                          <Fragment key={i}>
                            <button className={o.cls} onClick={o.pick} aria-pressed={o.on}>
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
                                <use href={o.icon} />
                              </svg>
                              {interp(o.label)}
                            </button>
                          </Fragment>
                        ))}
                      </div>
                      {v.pfHasThemeNote15 ? (
                        <>
                          <small className="pf-themenote15">{interp(v.pfThemeNote15)}</small>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="pf-meta15">
                    <span>{interp(v.pfEmail15)}</span>
                    <button className="text-button" onClick={v.pfTimezone15}>
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
                        <use href="/i15.svg#globe" />
                      </svg>
                      {interp(v.pfZone15)}
                    </button>
                    <span>{interp(v.pfSaved15)}</span>
                  </div>
                </section>
                <section className="pf-block15">
                  <header className="pf-head15 pf-head19">
                    <div>
                      <h2>Your activity</h2>
                      <p>{interp(v.pfActivitySummary15)}</p>
                    </div>
                    <span className="pf-range19">Last 12 months</span>
                  </header>
                  <div className="pf-cal15">
                    <div className="pf-scroll15">
                      <div className="pf-months15" style={css(v.pfMonthsStyle19)}>
                        {(v.pfMonths15 ?? []).map((m: any, i: number) => (
                          <Fragment key={i}>
                            <span style={css(m.style)}>{interp(m.label)}</span>
                          </Fragment>
                        ))}
                      </div>
                      <div className="pf-grid15">
                        <div className="pf-days15">
                          {(v.pfDayLabels15 ?? []).map((d: any, i: number) => (
                            <Fragment key={i}>
                              <span>{interp(d.label)}</span>
                            </Fragment>
                          ))}
                        </div>
                        <div className="pf-weeks15">
                          {(v.pfWeeks15 ?? []).map((w: any, i: number) => (
                            <Fragment key={i}>
                              <span className="pf-week15">
                                {(w.days ?? []).map((d: any, i: number) => (
                                  <Fragment key={i}>
                                    <i
                                      className={`pf-day15 ${d.cls}`}
                                      tabIndex={0}
                                      aria-label={d.title}
                                      onMouseEnter={d.tipIn16}
                                      onMouseLeave={d.tipOut16}
                                      onFocus={d.tipIn16}
                                      onBlur={d.tipOut16}
                                    />
                                  </Fragment>
                                ))}
                              </span>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pf-legend15">
                      <span>{interp(v.pfLegendLow15)}</span>
                      {(v.pfLegend15 ?? []).map((l: any, i: number) => (
                        <Fragment key={i}>
                          <i className={`pf-day15 ${l.cls}`} title={l.title} />
                        </Fragment>
                      ))}
                      <span>{interp(v.pfLegendHigh15)}</span>
                    </div>
                  </div>
                  <div className="pf-stats15">
                    {(v.pfStats15 ?? []).map((s: any, i: number) => (
                      <Fragment key={i}>
                        <span>
                          <strong>{interp(s.value)}</strong>
                          <small>{interp(s.label)}</small>
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
            <p className="page-foot10">{interp(v.pfFoot15)}</p>
          </div>
        </main>
      </>
    ) : null
  );
}
