/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function ShellDismissPicker({ v }: { v: Vals }) {
  return (
    v.popoverOpen11 ? (
      <>
        <button className="picker-scrim11" aria-label="Dismiss picker" onClick={v.closePicker11} />
        <section
          className={`picker11 ${v.pickerClass11}`}
          style={css(v.pickerStyle11)}
          role="dialog"
          aria-label={v.popoverTitle10}
          onKeyDown={v.pickerKey11}
        >
          <header>
            {v.pickerHasBack16 ? (
              <>
                <button type="button" className="picker-back16" aria-label="Back to model" onClick={v.pickerBack16}>
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
              </>
            ) : null}
            <strong>{interp(v.popoverTitle10)}</strong>
            <button type="button" className="icon-button" aria-label="Close picker" onClick={v.closePicker11}>
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
          </header>
          {v.modelPopover10 ? (
            <>
              <div className="mp15">
                {v.mpSummary15 ? (
                  <>
                    {!v.limitEditing17 ? (
                      <>
                        <button type="button" className="mp-current15" onClick={v.mpDrill15} aria-label="Choose a model">
                          <span className="mp-mark15">
                            {v.modelHasLogo11 ? (
                              <>
                                <img className={v.modelLogoClass11} src={v.modelLogo11} alt="" />
                              </>
                            ) : null}
                            {v.mpNoLogo15 ? (
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
                                  <use href="/i15.svg#sparkles" />
                                </svg>
                              </>
                            ) : null}
                          </span>
                          <strong>{interp(v.modelLabel11)}</strong>
                          <em>{interp(v.thinkingLabel)}</em>
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
                        <div className="mp-effort15">
                          <label className="sr-only" htmlFor="mp-range15">
                            Thinking effort
                          </label>
                          <input
                            id="mp-range15"
                            className="effort-range11"
                            type="range"
                            min="0"
                            max={v.effortMax11}
                            step="1"
                            value={v.effortIndex11}
                            aria-valuetext={v.thinkingLabel}
                            style={css(v.effortTrack11)}
                            onInput={v.changeEffort11}
                            onChange={v.changeEffort11}
                          />
                          <div className="effort-ticks11">
                            {(v.effortLevels11 ?? []).map((e: any, i: number) => (
                              <Fragment key={i}>
                                <button type="button" className={e.cls} onClick={e.pick}>
                                  {interp(e.name)}
                                </button>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="mp-funding15"
                          title={v.mpFundingDetails15}
                          onClick={v.mpFundingGo16}
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
                            <use href={v.fundingIcon11} />
                          </svg>
                          <span>{interp(v.mpFunding15)}</span>
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
                      </>
                    ) : null}
                    {!v.limitEditing17 ? (
                      <>
                        <button type="button" className="mp-funding15 mp-row17" onClick={v.editTaskLimit17}>
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
                            <use href="/i15.svg#gauge" />
                          </svg>
                          <span>{interp(v.routeLimitRow17)}</span>
                          <em className="mp-rowaction17">Edit</em>
                        </button>
                      </>
                    ) : null}
                    {v.limitEditing17 ? (
                      <>
                        <div className="mp-limit17">
                          <button type="button" className="mp-back15" onClick={v.limitEditCancel17}>
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
                              <use href="/i15.svg#arrow-left" />
                            </svg>
                            Task limit
                          </button>
                          <div className="mp-limithead17">
                            <span className="gside-title14">Stop and ask at</span>
                            <small>{interp(v.routeSpent17)} used so far</small>
                          </div>
                          <div className="mp-limitpresets17">
                            {(v.limitPresets17 ?? []).map((p: any, i: number) => (
                              <Fragment key={i}>
                                <button type="button" className={p.cls} onClick={p.pick}>
                                  {interp(p.label)}
                                </button>
                              </Fragment>
                            ))}
                          </div>
                          <div className="mp-limitrow17">
                            <label className="mp-limitinput17">
                              <i>$</i>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={v.limitDraft17}
                                onChange={v.limitDraftEdit17}
                                aria-label="Task limit in USD"
                              />
                            </label>
                            <button type="button" className="text-button" onClick={v.limitEditCancel17}>
                              Cancel
                            </button>
                            <button type="button" className="small-button primary" onClick={v.limitEditSave17}>
                              Save
                            </button>
                          </div>
                          {v.limitError17 ? (
                            <>
                              <p className="mp-limiterr17">{interp(v.limitError17)}</p>
                            </>
                          ) : null}
                          <p className="mp-limitnote17">
                            The run pauses and asks you when spend reaches this amount, whatever paid for it.
                          </p>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : null}
                {v.mpPickList15 ? (
                  <>
                    <button type="button" className="mp-back15" onClick={v.mpBack15}>
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
                      {interp(v.modelLabel11)} · {interp(v.thinkingLabel)}
                    </button>
                    <label className="mp-search18">
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
                        type="search"
                        placeholder="Search models"
                        aria-label="Search models"
                        value={v.mpQuery18}
                        onChange={v.mpQueryEdit18}
                        onInput={v.mpQueryEdit18}
                        onKeyDown={v.mpQueryKey18}
                      />
                      {v.mpHasQuery18 ? (
                        <>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label="Clear search"
                            onClick={v.mpQueryClear18}
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
                              <use href="/i15.svg#x" />
                            </svg>
                          </button>
                        </>
                      ) : null}
                    </label>
                    <div className="model-list11 mlist18">
                      {v.mpShowAuto18 ? (
                        <>
                          <button
                            type="button"
                            className={`model-row11 mrow18 auto18 ${v.mpAutoCls18}`}
                            onClick={v.mpPickAuto18}
                          >
                            <span className="mrow-mark18">
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
                                <use href="/i15.svg#sparkles" />
                              </svg>
                            </span>
                            <span>
                              <strong>Auto</strong>
                              <small>{interp(v.mpAutoCopy18)}</small>
                            </span>
                            <span className="model-check11">{interp(v.mpAutoCheck18)}</span>
                          </button>
                        </>
                      ) : null}
                      {(v.mpGroups18 ?? []).map((g: any, i: number) => (
                        <Fragment key={i}>
                          <div className="mgroup18">
                            <img className={g.logoClass} src={g.logo} alt="" />
                            <strong>{interp(g.name)}</strong>
                            <small>{interp(g.meta)}</small>
                          </div>
                          {(g.rows ?? []).map((m: any, i: number) => (
                            <Fragment key={i}>
                              <button type="button" className={`model-row11 mrow18 ${m.cls}`} onClick={m.pick}>
                                <span>
                                  <strong>{interp(m.name)}</strong>
                                  <small>{interp(m.copy)}</small>
                                </span>
                                {m.hasBar ? (
                                  <>
                                    <span className={`mrow-bar18 ${m.barTone}`} title={m.barTitle}>
                                      <i style={css(m.barStyle)} />
                                    </span>
                                  </>
                                ) : null}
                                <span className="model-check11">{interp(m.check)}</span>
                              </button>
                            </Fragment>
                          ))}
                          {g.hasMore ? (
                            <>
                              <button
                                type="button"
                                className="mgroup-more18"
                                aria-expanded={g.expanded}
                                onClick={g.toggleMore}
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
                                {interp(g.moreLabel)}
                              </button>
                            </>
                          ) : null}
                        </Fragment>
                      ))}
                      {v.mpEmpty18 ? (
                        <>
                          <p className="mp-empty18">No model matches “{interp(v.mpQuery18)}”.</p>
                        </>
                      ) : null}
                    </div>
                    <footer className="picker-footer11">
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
                          <use href="/i15.svg#sparkles" />
                        </svg>
                        Choose a model. Accounts route automatically.
                      </span>
                      <button type="button" className="text-button" onClick={v.modelAccounts10}>
                        Manage accounts{" "}
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
                    </footer>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
          {v.routePopover17 ? (
            <>
              <div className="rp17">
                <div className="rp-head17">
                  <small>{interp(v.rpSummary17)}</small>
                </div>
                <ol className="rp-list17">
                  {(v.rpSteps17 ?? []).map((st: any, i: number) => (
                    <Fragment key={i}>
                      <li className={`rp-step17 ${st.cls}`}>
                        <span className="rp-n17">{interp(st.n)}</span>
                        <span className="rp-mark17">
                          {st.hasLogo ? (
                            <>
                              <img className={`brand12 ${st.logoClass}`} src={st.logo} alt="" />
                            </>
                          ) : null}
                        </span>
                        <span className="rp-main17">
                          <b>{interp(st.model)}</b>
                          <small>
                            {interp(st.account)}
                            {interp(st.metaSep)}
                            {interp(st.meta)}
                          </small>
                        </span>
                        <span className={`rp-bar17 ${st.barTone}`}>
                          {st.hasBar ? (
                            <>
                              <span className="route-bar17">
                                <i style={css(st.barStyle)} />
                              </span>
                              <b>{interp(st.used)}</b>
                            </>
                          ) : null}
                        </span>
                        <em className={`route-kind17 ${st.kindCls}`}>{interp(st.kind)}</em>
                        <button
                          type="button"
                          className="icon-button rp-menu17"
                          aria-label="Edit this step"
                          onClick={st.menu}
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
                            <use href="/i15.svg#ellipsis" />
                          </svg>
                        </button>
                      </li>
                    </Fragment>
                  ))}
                </ol>
                <div className="rp-end17">
                  <i />
                  <span>
                    <b>{interp(v.rpEndTitle17)}</b>
                    <small>{interp(v.rpEndMeta17)}</small>
                  </span>
                  <em className={`route-kind17 ${v.rpEndCls17}`}>{interp(v.rpEndKind17)}</em>
                  <button type="button" className="text-button" onClick={v.rpFunding17}>
                    Change
                  </button>
                </div>
                <div className="rp-foot17">
                  <button type="button" className="text-button" onClick={v.rpAdd17}>
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
                    Add a step
                  </button>
                  {v.rpCustom17 ? (
                    <>
                      <button type="button" className="text-button" onClick={v.rpReset17}>
                        Reset to automatic
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {v.fundingPopover10 ? (
            <>
              <div className="fp17">
                <p className="fp-lead17">{interp(v.fpLead17)}</p>
                <div className="fp-list17" role="radiogroup" aria-label="How this workspace pays for model calls">
                  {(v.fpRows17 ?? []).map((f: any, i: number) => (
                    <Fragment key={i}>
                      <button
                        type="button"
                        className={`fp-row17 ${f.cls}`}
                        role="radio"
                        aria-checked={f.checkedStr}
                        onClick={f.pick}
                      >
                        <i className="fp-radio17" />
                        <span className="fp-main17">
                          <strong>{interp(f.title)}</strong>
                          <small>{interp(f.copy)}</small>
                        </span>
                        <em className={`route-kind17 ${f.kindCls}`}>{interp(f.kind)}</em>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <footer className="picker-footer11 fp-foot17">
                  <button type="button" className="text-button" onClick={v.fpLadder17}>
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
                      <use href="/i15.svg#waypoints" />
                    </svg>
                    Routing ladder
                  </button>
                  <button type="button" className="text-button" onClick={v.modelAccounts10}>
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
                      <use href="/i15.svg#settings" />
                    </svg>
                    Model accounts
                  </button>
                </footer>
              </div>
            </>
          ) : null}
          {v.otherPicker11 ? (
            <>
              {(v.otherRows11 ?? []).map((r: any, i: number) => (
                <Fragment key={i}>
                  <button type="button" className="model-row11" onClick={r.pick}>
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
                    <span>
                      <strong>{interp(r.title)}</strong>
                      <small>{interp(r.copy)}</small>
                    </span>
                    <span>{interp(r.check)}</span>
                  </button>
                </Fragment>
              ))}
            </>
          ) : null}
        </section>
      </>
    ) : null
  );
}
