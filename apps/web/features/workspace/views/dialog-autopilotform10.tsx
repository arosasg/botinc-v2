/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogAutopilotform10({ v }: { v: Vals }) {
  return (
    v.autopilotForm10 ? (
      <>
        <div className="auto-form10 af16 af2-16">
          <div className="af-headrow16">
            <div>
              <span className="eyebrow">{interp(v.afStepLabel16)}</span>
              <h2 id="dialog-title">{interp(v.autoFormTitle9)}</h2>
            </div>
            <ol className="af-steps16" aria-label="Steps">
              {(v.afSteps16 ?? []).map((s: any, i: number) => (
                <Fragment key={i}>
                  <li className={s.cls}>
                    <button type="button" onClick={s.go} disabled={s.disabled}>
                      <i>{interp(s.n)}</i>
                      <span>{interp(s.label)}</span>
                    </button>
                  </li>
                </Fragment>
              ))}
            </ol>
          </div>
          {v.afPageWhat16 ? (
            <>
              {v.afShowTemplates16 ? (
                <>
                  <div className="af-templates16">
                    <button type="button" className={`af-template16 ${v.scratchClass10}`} onClick={v.scratchAuto10}>
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
                        <use href="/i15.svg#square-pen" />
                      </svg>
                      From scratch
                    </button>
                    {(v.autoTemplates9 ?? []).map((t: any, i: number) => (
                      <Fragment key={i}>
                        <button type="button" className={`af-template16 ${t.cls}`} onClick={t.pick}>
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
                          {interp(t.title)}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </>
              ) : null}
              <label className="af-namefield16">
                <span>Name</span>
                <input
                  className="field"
                  value={v.autoDraftTitle9}
                  onChange={v.editAutoTitle9}
                  placeholder="Morning brief"
                />
              </label>
              <div className="af-editor16">
                <div className="af-editorhead16">
                  <span className="af-editortitle16">
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
                      <use href="/i15.svg#file-text" />
                    </svg>
                    Instructions<small>Markdown</small>
                  </span>
                  <div className="af-editortools16">
                    <button type="button" className={v.afWriteCls16} onClick={v.afWrite16}>
                      Write
                    </button>
                    <button type="button" className={v.afPreviewCls16} onClick={v.afPreview16}>
                      Preview
                    </button>
                  </div>
                </div>
                {v.afWriting16 ? (
                  <>
                    <textarea
                      className="af-textarea16"
                      value={v.afInstr16}
                      onInput={v.afEditInstr16}
                      aria-label="Instructions"
                      spellCheck="false"
                      placeholder="# What this routine does\n\nWrite it the way you would brief a colleague."
                    />
                  </>
                ) : null}
                {!v.afWriting16 ? (
                  <>
                    <div className="af-preview16">
                      <div className="md16">
                        {(v.afBlocks16 ?? []).map((b: any, i: number) => (
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
                  </>
                ) : null}
                <div className="af-editorfoot16">
                  <span>{interp(v.afInstrCount16)}</span>
                  <span>Read at the start of every run, with your preferences.</span>
                </div>
              </div>
            </>
          ) : null}
          {v.afPageWhen16 ? (
            <>
              <section className="af-group16">
                <header>
                  <h3>Trigger</h3>
                  <span>{interp(v.afWhenNote16)}</span>
                </header>
                <div className="af-kinds16">
                  {(v.afKinds16 ?? []).map((k: any, i: number) => (
                    <Fragment key={i}>
                      <button type="button" className={`af-kind16 ${k.cls}`} onClick={k.pick} aria-pressed={k.on}>
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
                          <use href={k.icon} />
                        </svg>
                        <span>
                          <strong>{interp(k.title)}</strong>
                          <small>{interp(k.copy)}</small>
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div className="frm16">
                  {v.autoIsTimed9 ? (
                    <>
                      <div className="frm-row16">
                        <span>Repeat</span>
                        <div className="af-pair16">
                          <button
                            type="button"
                            className={`sel14 field ${v.m14_autoDraftCadence9?.cls}`}
                            aria-haspopup="listbox"
                            aria-expanded={v.m14_autoDraftCadence9?.expanded}
                            aria-label="Repeat"
                            onClick={v.m14_autoDraftCadence9?.pick}
                          >
                            <span>{interp(v.m14_autoDraftCadence9?.label)}</span>
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
                          <input
                            className="field af-time16"
                            type="time"
                            value={v.autoDraftTime9}
                            onChange={v.editAutoTime9}
                            aria-label="At"
                          />
                        </div>
                      </div>
                      <label className="frm-row16">
                        <span>Timezone</span>
                        <input className="field" value={v.autoDraftZone9} onChange={v.editAutoZone9} />
                      </label>
                    </>
                  ) : null}
                  {v.autoIsEvent9 ? (
                    <>
                      <div className="frm-row16">
                        <span>Plugin</span>
                        <button
                          type="button"
                          className={`sel14 field ${v.m14_autoDraftSource9?.cls}`}
                          aria-haspopup="listbox"
                          aria-expanded={v.m14_autoDraftSource9?.expanded}
                          aria-label="Plugin"
                          onClick={v.m14_autoDraftSource9?.pick}
                        >
                          <span>{interp(v.m14_autoDraftSource9?.label)}</span>
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
                      </div>
                      <label className="frm-row16">
                        <span>Event filter</span>
                        <input
                          className="field"
                          value={v.autoDraftFilter9}
                          onChange={v.editAutoFilter9}
                          placeholder="issues labeled botinc"
                        />
                      </label>
                    </>
                  ) : null}
                  {v.afIsManual16 ? (
                    <>
                      <p className="fine af-manualnote16">Runs only when you press Run now or ask the Operator for it.</p>
                    </>
                  ) : null}
                </div>
              </section>
              <section className="af-group16">
                <header>
                  <h3>Repository and result</h3>
                  <span>Runs as {interp(v.memberName)} · Operator · BotInc Cloud</span>
                </header>
                <div className="frm16">
                  <div className="frm-row16">
                    <span>Repository</span>
                    <button
                      type="button"
                      className="sel14 field"
                      aria-haspopup="listbox"
                      aria-label="Repository"
                      onClick={v.afRepoMenu16}
                    >
                      <span className="af-repolabel16">
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
                          <use href="/i15.svg#folder-git-2" />
                        </svg>
                        {interp(v.afRepoLabel16)}
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
                        <use href="/i15.svg#chevron-down" />
                      </svg>
                    </button>
                  </div>
                  <label className="frm-row16">
                    <span>Allowed scope</span>
                    <input
                      className="field"
                      value={v.autoDraftScope9}
                      onChange={v.editAutoScope9}
                      placeholder="botinc/app"
                    />
                  </label>
                  <div className="frm-row16">
                    <span>Result</span>
                    <button
                      type="button"
                      className={`sel14 field ${v.m14_autoDraftOutput9?.cls}`}
                      aria-haspopup="listbox"
                      aria-expanded={v.m14_autoDraftOutput9?.expanded}
                      aria-label="Result"
                      onClick={v.m14_autoDraftOutput9?.pick}
                    >
                      <span>{interp(v.m14_autoDraftOutput9?.label)}</span>
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
                  </div>
                </div>
              </section>
              <section className="af-group16">
                <header>
                  <h3>Model and funding</h3>
                  <span>Every run records the model, the account and what paid</span>
                </header>
                <div className="frm16">
                  <div className="frm-row16">
                    <span>Model</span>
                    <button
                      type="button"
                      className="sel14 field"
                      aria-haspopup="listbox"
                      aria-label="Model for runs"
                      onClick={v.afModelMenu17}
                    >
                      <span className="af-repolabel16">
                        {v.afModelHasLogo17 ? (
                          <>
                            <img className={`brand12 ${v.afModelLogoClass17}`} src={v.afModelLogo17} alt="" />
                          </>
                        ) : null}
                        {!v.afModelHasLogo17 ? (
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
                        {interp(v.afModel17)}
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
                        <use href="/i15.svg#chevron-down" />
                      </svg>
                    </button>
                  </div>
                  <div className="frm-row16">
                    <span>Pay with</span>
                    <button
                      type="button"
                      className="sel14 field"
                      aria-haspopup="listbox"
                      aria-label="Funding for runs"
                      onClick={v.afFundMenu17}
                    >
                      <span>{interp(v.afFund17)}</span>
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
                  </div>
                  <div className="frm-row16 af-routerow17">
                    <span>Would run on</span>
                    <div className="af-route17">
                      {v.afRouteHasLogo17 ? (
                        <>
                          <img className={`brand12 ${v.afRouteLogoClass17}`} src={v.afRouteLogo17} alt="" />
                        </>
                      ) : null}
                      <span>
                        <strong>{interp(v.afRouteAccount17)}</strong>
                        <small>{interp(v.afRouteMeta17)}</small>
                      </span>
                      <em className={`route-kind17 ${v.afRouteKindCls17}`}>{interp(v.afRouteKind17)}</em>
                    </div>
                  </div>
                </div>
              </section>
              <section className="af-group16">
                <header>
                  <h3>Limits</h3>
                  <span>The run stops when either is reached</span>
                </header>
                <div className="frm16">
                  <div className="frm-row16">
                    <span>Spend</span>
                    <div className="af-pair16">
                      <label className="af-money16">
                        <b>$</b>
                        <input
                          className="field"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={v.autoDraftLimit9}
                          onChange={v.editAutoLimit9}
                          aria-label="Limit per run"
                        />
                        <small>per run</small>
                      </label>
                      <label className="af-money16">
                        <b>$</b>
                        <input
                          className="field"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={v.autoDraftDaily9}
                          onChange={v.editAutoDaily9}
                          aria-label="Daily limit"
                        />
                        <small>per day</small>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : null}
          {v.autoFormReview9 ? (
            <>
              <div className="af-review16">
                <span className="af-reviewmark16">
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
                    <use href="/i15.svg#calendar-clock" />
                  </svg>
                </span>
                <div>
                  <h3>{interp(v.autoDraftTitle9)}</h3>
                  <p>{interp(v.afInstrFirst16)}</p>
                </div>
                <dl className="af-reviewmeta16">
                  <dt>Starts</dt>
                  <dd>{interp(v.autoDraftTrigger9)}</dd>
                  <dt>Next</dt>
                  <dd>{interp(v.autoDraftNext9)}</dd>
                  <dt>Repository</dt>
                  <dd>{interp(v.afRepoLabel16)}</dd>
                  <dt>Result</dt>
                  <dd>{interp(v.autoDraftOutputLabel9)}</dd>
                  <dt>Limits</dt>
                  <dd>
                    ${interp(v.autoDraftLimit9)} per run · ${interp(v.autoDraftDaily9)} per day
                  </dd>
                  <dt>Instructions</dt>
                  <dd>{interp(v.afInstrCount16)}</dd>
                  <dt>Model</dt>
                  <dd>
                    {interp(v.afModel17)} · {interp(v.afRouteAccount17)} · {interp(v.afRouteKind17)}
                  </dd>
                  <dt>Runs as</dt>
                  <dd>{interp(v.memberName)} · Operator · BotInc Cloud</dd>
                </dl>
                <p className="fine">{interp(v.autoDraftConnection9)}</p>
              </div>
            </>
          ) : null}
          {v.autoFormError9 ? (
            <>
              <p className="error" role="alert">
                {interp(v.autoFormError9)}
              </p>
            </>
          ) : null}
          <div className="dialog-actions">
            <button className="small-button" onClick={v.afBack16}>
              {interp(v.afBackLabel16)}
            </button>
            <button className="small-button primary" onClick={v.afNext16}>
              {interp(v.afNextLabel16)}
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
          </div>
        </div>
      </>
    ) : null
  );
}
