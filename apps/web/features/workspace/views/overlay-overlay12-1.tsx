/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function OverlayOverlay121({ v }: { v: Vals }) {
  return (
    v.graphOpen14 ? (
      <>
        <div className="overlay12 graph-overlay14">
          <section className="graph-sheet14" role="dialog" aria-modal="true" aria-label="Workflow editor">
            <header className="graph-head14">
              <button className="text-button" onClick={v.backToWorkflows14}>
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
                Workflows
              </button>
              <div className="graph-name14 gh-name16">
                <span className="gh-mark16">
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
                    <use href="/i15.svg#git-branch" />
                  </svg>
                </span>
                <div className="gh-namecol16">
                  <input value={v.graphName14} onChange={v.editGraphName14} aria-label="Workflow name" />
                  <span className="gh-meta16">
                    <span className={`graph-ver14 ${v.graphDirtyTone14}`}>{interp(v.graphVersionLabel14)}</span>
                    <span className="gh-dot16" />
                    <span>{interp(v.graphSummary14)}</span>
                  </span>
                </div>
              </div>
              <div className="graph-head-actions14 gh-acts16">
                <button className="text-button gh-ask16" onClick={v.askOperator14}>
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
                    <use href="/i15.svg#message-circle" />
                  </svg>{" "}
                  Ask Operator
                </button>
                <span className="gh-seg16" role="group" aria-label="Check the workflow">
                  <button className="small-button" onClick={v.validateGraph14}>
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
                      <use href="/i15.svg#shield-check" />
                    </svg>{" "}
                    Validate
                  </button>
                  <button className="small-button" onClick={v.testGraph14}>
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
                      <use href="/i15.svg#play" />
                    </svg>{" "}
                    Test
                  </button>
                </span>
                <button className="small-button primary" onClick={v.saveGraph14} disabled={v.graphClean14}>
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
                    <use href="/i15.svg#check" />
                  </svg>{" "}
                  Save version
                </button>
                <span className="gh-rule16" />
                <button className="icon-button" aria-label="Close workflow editor" onClick={v.closeGraph14}>
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
              </div>
            </header>
            <div className="graph-body14">
              <div className="graph-canvas14" onPointerDown={v.graphPan14} aria-label="Workflow canvas">
                <div className="graph-stage14" style={css(v.graphStageStyle14)}>
                  <svg className="graph-wires14" width={v.graphWidth14} height={v.graphHeight14} aria-hidden="true">
                    {(v.graphEdges14 ?? []).map((e: any, i: number) => (
                      <Fragment key={i}>
                        <path className={`wire14 ${e.cls}`} d={e.d} />
                      </Fragment>
                    ))}
                  </svg>
                  {(v.graphEdges14 ?? []).map((e: any, i: number) => (
                    <Fragment key={i}>
                      <button
                        type="button"
                        className={`wire-label14 ${e.cls}`}
                        style={css(e.labelStyle)}
                        onClick={e.select}
                        aria-label={e.aria}
                      >
                        {interp(e.label)}
                      </button>
                    </Fragment>
                  ))}
                  {(v.graphNodes14 ?? []).map((n: any, i: number) => (
                    <Fragment key={i}>
                      <div className={`gnode14 ${n.cls}`} style={css(n.style)}>
                        <button
                          type="button"
                          className="gnode-body14"
                          onClick={n.select}
                          onPointerDown={n.grab}
                          aria-label={n.aria}
                        >
                          <span className="gnode-kind14">
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
                              <use href={n.icon} />
                            </svg>
                            {interp(n.kind)}
                          </span>
                          <strong>{interp(n.label)}</strong>
                          {n.hasModel ? (
                            <>
                              <small className="gnode-model14">
                                {interp(n.model)} · {interp(n.effort)}
                              </small>
                            </>
                          ) : null}
                          {n.hasNote ? (
                            <>
                              <small className="gnode-note14">{interp(n.note)}</small>
                            </>
                          ) : null}
                          {n.hasIssue ? (
                            <>
                              <em className="gnode-warn14">
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
                                  <use href="/i15.svg#triangle-alert" />
                                </svg>
                                {interp(n.issue)}
                              </em>
                            </>
                          ) : null}
                          {n.traced ? (
                            <>
                              <i className="gnode-trace14">{interp(n.traceStep)}</i>
                            </>
                          ) : null}
                        </button>
                        {n.connectable ? (
                          <>
                            <button type="button" className="gnode-connect14" onClick={n.connect}>
                              Connect here
                            </button>
                          </>
                        ) : null}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div className="graph-tools14">
                  <button className="icon-button" aria-label="Zoom out" onClick={v.zoomOut14}>
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
                      <use href="/i15.svg#minus" />
                    </svg>
                  </button>
                  <span>{interp(v.graphZoomLabel14)}</span>
                  <button className="icon-button" aria-label="Zoom in" onClick={v.zoomIn14}>
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
                  </button>
                  <button className="icon-button" aria-label="Fit workflow to view" onClick={v.fitGraph14}>
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
                      <use href="/i15.svg#maximize" />
                    </svg>
                  </button>
                </div>
                {v.graphConnecting14 ? (
                  <>
                    <p className="graph-hint14">
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
                        <use href="/i15.svg#spline" />
                      </svg>{" "}
                      Choose the node this edge should point to, or press Escape.
                    </p>
                  </>
                ) : null}
              </div>
              <aside className="graph-side14" aria-label="Node settings">
                <div className="w8-bar16 gside-bar16">
                  <nav className="w8-nav w8-nav16 gside-tabs16" aria-label="Step settings">
                    {(v.graphSideTabs14 ?? []).map((t: any, i: number) => (
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
                              <use href={t.icon16} />
                            </svg>
                          </span>
                          {interp(t.label)}
                          {t.hasCount ? (
                            <>
                              <span className="w8-nav-count">{interp(t.count)}</span>
                            </>
                          ) : null}
                        </button>
                      </Fragment>
                    ))}
                  </nav>
                </div>
                {v.graphNodePane14 ? (
                  <>
                    {v.graphHasSelection14 ? (
                      <>
                        <div className="gside-form14 gform19">
                          <div className="gf-sec19">
                            <label className="gf-row19">
                              <span>Name</span>
                              <input
                                className="field gf-in19"
                                value={v.graphNodeLabel14}
                                onChange={v.editGraphLabel14}
                                aria-label="Step name"
                              />
                            </label>
                            <div className="gf-row19">
                              <span>Type</span>
                              <button
                                type="button"
                                className={`sel14 gf-sel19 ${v.m14_graphNodeType14?.cls}`}
                                aria-haspopup="listbox"
                                aria-expanded={v.m14_graphNodeType14?.expanded}
                                aria-label="Step type"
                                onClick={v.m14_graphNodeType14?.pick}
                              >
                                <span>{interp(v.m14_graphNodeType14?.label)}</span>
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
                          {v.graphNodeHasModel14 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">Who does it</p>
                                <div className="gf-row19">
                                  <span>Model</span>
                                  <button
                                    type="button"
                                    className={`sel14 gf-sel19 ${v.m14_graphNodeModel14?.cls}`}
                                    aria-haspopup="listbox"
                                    aria-expanded={v.m14_graphNodeModel14?.expanded}
                                    aria-label="Step model"
                                    onClick={v.m14_graphNodeModel14?.pick}
                                  >
                                    <span>{interp(v.m14_graphNodeModel14?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Effort</span>
                                  <button
                                    type="button"
                                    className={`sel14 gf-sel19 ${v.m14_graphNodeEffort14?.cls}`}
                                    aria-haspopup="listbox"
                                    aria-expanded={v.m14_graphNodeEffort14?.expanded}
                                    aria-label="Step effort"
                                    onClick={v.m14_graphNodeEffort14?.pick}
                                  >
                                    <span>{interp(v.m14_graphNodeEffort14?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Runs on</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Where it runs"
                                    onClick={v.gfComputer19?.pick}
                                  >
                                    <span>{interp(v.gfComputer19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Skills</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Skills this step may use"
                                    onClick={v.gfSkills19?.pick}
                                  >
                                    <span>{interp(v.gfSkills19?.label)}</span>
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
                                <p className="gf-note19">{interp(v.nodeRouteNote17)}</p>
                              </div>
                            </>
                          ) : null}
                          {v.graphNodeHasPrompt14 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">{interp(v.gfPromptTitle19)}</p>
                                <textarea
                                  className="field gf-text19"
                                  rows={4}
                                  value={v.graphNodePrompt14}
                                  onChange={v.editGraphPrompt14}
                                  aria-label="Instruction"
                                />
                                {v.gfHasContext19 ? (
                                  <>
                                    <div className="gf-row19">
                                      <span>Reads</span>
                                      <button
                                        type="button"
                                        className="sel14 gf-sel19"
                                        aria-haspopup="listbox"
                                        aria-label="What it reads"
                                        onClick={v.gfContext19?.pick}
                                      >
                                        <span>{interp(v.gfContext19?.label)}</span>
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
                                  </>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                          {v.graphNodeHasCondition14 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">Branch</p>
                                <div className="gf-row19">
                                  <span>Yes when</span>
                                  <button
                                    type="button"
                                    className={`sel14 gf-sel19 ${v.m14_graphNodeRule14?.cls}`}
                                    aria-haspopup="listbox"
                                    aria-expanded={v.m14_graphNodeRule14?.expanded}
                                    aria-label="Condition rule"
                                    onClick={v.m14_graphNodeRule14?.pick}
                                  >
                                    <span>{interp(v.m14_graphNodeRule14?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Otherwise</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Otherwise"
                                    onClick={v.gfElse19?.pick}
                                  >
                                    <span>{interp(v.gfElse19?.label)}</span>
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
                                <p className="gf-note19">{interp(v.graphRuleHint14)}</p>
                                <button
                                  className="text-button gf-adv19"
                                  onClick={v.toggleAdvanced14}
                                  aria-expanded={v.graphAdvanced14}
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
                                    <use href="/i15.svg#code" />
                                  </svg>{" "}
                                  {interp(v.graphAdvancedLabel14)}
                                </button>
                                {v.graphAdvanced14 ? (
                                  <>
                                    <input
                                      className="field gf-in19 gf-mono19 mono-field14"
                                      value={v.graphNodeCondition14}
                                      onChange={v.editGraphCondition14}
                                      placeholder="reviews.every(r => r.approved)"
                                      aria-label="Condition expression"
                                    />
                                  </>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                          {v.gfLimits19 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">Permissions and limits</p>
                                <div className="gf-row19">
                                  <span>May change</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="What it may change"
                                    onClick={v.gfTouch19?.pick}
                                  >
                                    <span>{interp(v.gfTouch19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Spend cap</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Spend cap"
                                    onClick={v.gfCap19?.pick}
                                  >
                                    <span>{interp(v.gfCap19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Give up after</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Give up after"
                                    onClick={v.gfTimeout19?.pick}
                                  >
                                    <span>{interp(v.gfTimeout19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Retries</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Retries"
                                    onClick={v.gfRetries19?.pick}
                                  >
                                    <span>{interp(v.gfRetries19?.label)}</span>
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
                                {v.graphNodeHasLimit14 ? (
                                  <>
                                    <div className="gf-row19">
                                      <span>Max attempts</span>
                                      <button
                                        type="button"
                                        className={`sel14 gf-sel19 ${v.m14_graphNodeLimit14?.cls}`}
                                        aria-haspopup="listbox"
                                        aria-expanded={v.m14_graphNodeLimit14?.expanded}
                                        aria-label="Maximum attempts"
                                        onClick={v.m14_graphNodeLimit14?.pick}
                                      >
                                        <span>{interp(v.m14_graphNodeLimit14?.label)}</span>
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
                                  </>
                                ) : null}
                                <div className="gf-row19">
                                  <span>If it fails</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="If it fails"
                                    onClick={v.gfFail19?.pick}
                                  >
                                    <span>{interp(v.gfFail19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Produces</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="What it produces"
                                    onClick={v.gfProduces19?.pick}
                                  >
                                    <span>{interp(v.gfProduces19?.label)}</span>
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
                                <div className="gf-toggle19">
                                  <span>
                                    <strong>Ask me before it starts</strong>
                                    <small>The run stops here until you say go.</small>
                                  </span>
                                  <button
                                    type="button"
                                    className={`pf-switch16 ${v.gfAsk19?.cls}`}
                                    role="switch"
                                    aria-checked={v.gfAsk19?.on}
                                    aria-label="Ask me before it starts"
                                    onClick={v.gfAsk19?.toggle}
                                  >
                                    <i />
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : null}
                          {v.gfApproval19 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">Approval</p>
                                <div className="gf-row19">
                                  <span>Who approves</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Who approves"
                                    onClick={v.gfApprover19?.pick}
                                  >
                                    <span>{interp(v.gfApprover19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Remind after</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Remind after"
                                    onClick={v.gfRemind19?.pick}
                                  >
                                    <span>{interp(v.gfRemind19?.label)}</span>
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
                                <p className="gf-note19">
                                  Nothing merges itself. The run waits here until someone approves.
                                </p>
                              </div>
                            </>
                          ) : null}
                          {v.gfQuestion19 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">Waiting for you</p>
                                <div className="gf-row19">
                                  <span>Wait up to</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Wait up to"
                                    onClick={v.gfWait19?.pick}
                                  >
                                    <span>{interp(v.gfWait19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Then</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Then"
                                    onClick={v.gfThen19?.pick}
                                  >
                                    <span>{interp(v.gfThen19?.label)}</span>
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
                            </>
                          ) : null}
                          {v.gfFinish19 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">Report</p>
                                <div className="gf-row19">
                                  <span>Reports</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Reports"
                                    onClick={v.gfReport19?.pick}
                                  >
                                    <span>{interp(v.gfReport19?.label)}</span>
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
                                <div className="gf-row19">
                                  <span>Then</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Then"
                                    onClick={v.gfAfter19?.pick}
                                  >
                                    <span>{interp(v.gfAfter19?.label)}</span>
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
                            </>
                          ) : null}
                          {v.gfStart19 ? (
                            <>
                              <div className="gf-sec19">
                                <p className="gside-title14">Trigger</p>
                                <div className="gf-row19">
                                  <span>Starts when</span>
                                  <button
                                    type="button"
                                    className="sel14 gf-sel19"
                                    aria-haspopup="listbox"
                                    aria-label="Starts when"
                                    onClick={v.gfTrigger19?.pick}
                                  >
                                    <span>{interp(v.gfTrigger19?.label)}</span>
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
                                <p className="gf-note19">
                                  The first step marks where a run begins. It calls no model and costs nothing.
                                </p>
                              </div>
                            </>
                          ) : null}
                          <div className="gf-sec19">
                            <p className="gside-title14">Goes to</p>
                            {(v.graphNodeEdges14 ?? []).map((e: any, i: number) => (
                              <Fragment key={i}>
                                <div className="gside-edge14">
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
                                      <use href="/i15.svg#arrow-right" />
                                    </svg>
                                    {interp(e.label)} → {interp(e.target)}
                                  </span>
                                  <button className="icon-button" aria-label={`Remove edge ${e.aria}`} onClick={e.remove}>
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
                                      <use href="/i15.svg#trash-2" />
                                    </svg>
                                  </button>
                                </div>
                              </Fragment>
                            ))}
                            {v.graphNodeNoEdges14 ? (
                              <>
                                <p className="gf-note19">No outgoing edge yet. The run ends at this step.</p>
                              </>
                            ) : null}
                            <div className="gf-acts19">
                              <button className="text-button" onClick={v.startConnect14}>
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
                                  <use href="/i15.svg#spline" />
                                </svg>{" "}
                                Draw an edge
                              </button>
                              <button className="text-button" onClick={v.addNodeAfter14}>
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
                                Add a step after
                              </button>
                              <button
                                className="text-button gf-danger19"
                                onClick={v.removeNode14}
                                disabled={v.graphNodeLocked14}
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
                                  <use href="/i15.svg#trash-2" />
                                </svg>{" "}
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                    {!v.graphHasSelection14 ? (
                      <>
                        <p className="gside-empty14">
                          Select a step on the canvas to edit its model, effort, instruction or condition.
                        </p>
                      </>
                    ) : null}
                  </>
                ) : null}
                {v.wfPane19 ? (
                  <>
                    <div className="gside-form14 gform19 wfd19">
                      <div className="gf-sec19">
                        <p className="gside-title14">This workflow</p>
                        <label className="wfd-field19">
                          <span>Title</span>
                          <input
                            className="field"
                            value={v.graphName14}
                            onChange={v.editGraphName14}
                            aria-label="Workflow title"
                          />
                        </label>
                        <label className="wfd-field19">
                          <span>When to use it</span>
                          <textarea
                            className="field wfd-text19"
                            rows={4}
                            value={v.wfWhen19}
                            onChange={v.editWfWhen19}
                            aria-label="When to use this workflow"
                            placeholder="A bug report with a reproduction, in botinc/app. Not design work, not migrations."
                          />
                        </label>
                        <p className="gf-note19">{interp(v.wfDispatchNote19)}</p>
                      </div>
                      <div className="gf-sec19">
                        <p className="gside-title14">Dispatch order</p>
                        {(v.wfPeers19 ?? []).map((w: any, i: number) => (
                          <Fragment key={i}>
                            <div className={`wfd-peer19 ${w.cls}`}>
                              <span className="wfd-n19">{interp(w.n)}</span>
                              <span>
                                <strong>{interp(w.name)}</strong>
                                <small>{interp(w.when)}</small>
                              </span>
                              {w.isThis ? (
                                <>
                                  <em>This one</em>
                                </>
                              ) : null}
                            </div>
                          </Fragment>
                        ))}
                        <p className="gf-note19">{interp(v.wfFallbackNote19)}</p>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.graphChecksPane14 ? (
                  <>
                    <div className="gside-checks17">
                      <div className="gchk-head17">
                        <span className={`gchk-sum17 ${v.checksTone17}`}>
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
                            <use href={v.checksIcon17} />
                          </svg>
                          <span>{interp(v.checksSummary17)}</span>
                        </span>
                        <button type="button" className="small-button primary" onClick={v.validateGraph14}>
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
                            <use href="/i15.svg#shield-check" />
                          </svg>{" "}
                          Run checks
                        </button>
                      </div>
                      {(v.checkGroups17 ?? []).map((g: any, i: number) => (
                        <Fragment key={i}>
                          <section className={`gchk17 ${g.cls}`}>
                            <header>
                              <span className="gchk-mark17">
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
                              </span>
                              <strong>{interp(g.title)}</strong>
                              <span className="gchk-state17">{interp(g.status)}</span>
                            </header>
                            <p>{interp(g.copy)}</p>
                            {g.hasIssues ? (
                              <>
                                <div className="gchk-issues17">
                                  {(g.issues ?? []).map((v: any, i: number) => (
                                    <Fragment key={i}>
                                      <button type="button" className={`gcheck14 ${v.tone}`} onClick={v.open}>
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
                                          <use href={v.icon} />
                                        </svg>
                                        <span>
                                          <strong>{interp(v.title)}</strong>
                                          <small>{interp(v.copy)}</small>
                                        </span>
                                        <em className="gchk-fix17">{interp(v.action)}</em>
                                      </button>
                                    </Fragment>
                                  ))}
                                </div>
                              </>
                            ) : null}
                          </section>
                        </Fragment>
                      ))}
                      <p className="fine">
                        Checks run against the draft on this canvas. A blocking result stops activation; a warning does not.
                      </p>
                    </div>
                  </>
                ) : null}
                {v.graphTestPane14 ? (
                  <>
                    <div className="gside-test17">
                      <section className="gtest-setup17">
                        <p className="gside-title14">Example configuration</p>
                        <div className="gcases17">
                          {(v.graphCases17 ?? []).map((c: any, i: number) => (
                            <Fragment key={i}>
                              <button type="button" className={`gcase17 ${c.cls}`} onClick={c.pick} aria-pressed={c.on}>
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
                                  <use href={c.icon} />
                                </svg>
                                <span>
                                  <strong>{interp(c.title)}</strong>
                                  <small>{interp(c.copy)}</small>
                                </span>
                              </button>
                            </Fragment>
                          ))}
                        </div>
                        <div className="gtest-actions17">
                          <button type="button" className="small-button primary" onClick={v.runTest17}>
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
                              <use href="/i15.svg#play" />
                            </svg>{" "}
                            Run whole test
                          </button>
                          <button type="button" className="small-button" onClick={v.stepTest17}>
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
                              <use href="/i15.svg#skip-forward" />
                            </svg>{" "}
                            {interp(v.stepLabel17)}
                          </button>
                          {v.graphHasTrace14 ? (
                            <>
                              <button type="button" className="text-button" onClick={v.clearTrace14}>
                                Clear
                              </button>
                            </>
                          ) : null}
                        </div>
                      </section>
                      {v.graphHasTrace14 ? (
                        <>
                          <div className="gtest-sum17">
                            {(v.traceFacts17 ?? []).map((f: any, i: number) => (
                              <Fragment key={i}>
                                <span>
                                  <small>{interp(f.k)}</small>
                                  <strong className={f.tone}>{interp(f.v)}</strong>
                                </span>
                              </Fragment>
                            ))}
                          </div>
                          <ol className="gtrace17">
                            {(v.graphTrace17 ?? []).map((t: any, i: number) => (
                              <Fragment key={i}>
                                <li className={`gtrace-row17 ${t.tone} ${t.cls}`}>
                                  <span className="gtrace-step14">{interp(t.step)}</span>
                                  <span className="gtrace-body17">
                                    <strong>{interp(t.title)}</strong>
                                    <small>{interp(t.detail)}</small>
                                    {t.hasRoute ? (
                                      <>
                                        <span className={`gtrace-route17 ${t.routeTone}`}>
                                          {t.hasLogo ? (
                                            <>
                                              <img className={`brand12 ${t.logoClass}`} src={t.logo} alt="" />
                                            </>
                                          ) : null}
                                          <b>{interp(t.routeModel)}</b>
                                          <i>·</i>
                                          <span>{interp(t.routeAccount)}</span>
                                          <em className={`route-kind17 ${t.kindCls}`}>{interp(t.kind)}</em>
                                          <span className="route-bar17">
                                            <i style={css(t.barStyle)} />
                                          </span>
                                          <span className="gtrace-left17">{interp(t.left)}</span>
                                        </span>
                                      </>
                                    ) : null}
                                  </span>
                                </li>
                              </Fragment>
                            ))}
                          </ol>
                          {v.traceHasMore17 ? (
                            <>
                              <p className="fine">{interp(v.traceMoreNote17)}</p>
                            </>
                          ) : null}
                          <p className="fine">{interp(v.graphTraceNote14)}</p>
                        </>
                      ) : null}
                      {!v.graphHasTrace14 ? (
                        <>
                          <p className="gside-empty14">
                            Pick a case and run it. The trace shows the branch each condition takes, where the run waits for
                            you, and the model, account and funding every step would use.
                          </p>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                {v.graphVersionsPane14 ? (
                  <>
                    <div className="gside-versions17">
                      {v.graphDraft17 ? (
                        <>
                          <article className="gver17 draft17">
                            <header>
                              <span className="gver-pill17 draft">Draft</span>
                              <strong>Unsaved changes</strong>
                            </header>
                            <p>{interp(v.graphDraftCopy17)}</p>
                            <footer>
                              <span>{interp(v.graphSummary14)}</span>
                              <button type="button" className="small-button primary" onClick={v.saveGraph14}>
                                Activate as {interp(v.graphNextVersion17)}
                              </button>
                            </footer>
                          </article>
                        </>
                      ) : null}
                      {(v.graphVersions17 ?? []).map((v: any, i: number) => (
                        <Fragment key={i}>
                          <article className={`gver17 ${v.cls}`}>
                            <header>
                              <span className={`gver-pill17 ${v.pill}`}>{interp(v.state)}</span>
                              <strong>{interp(v.name)}</strong>
                              <time>{interp(v.date)}</time>
                            </header>
                            <p>{interp(v.copy)}</p>
                            <footer>
                              <span>{interp(v.runs)}</span>
                              {v.canActivate ? (
                                <>
                                  <button type="button" className="text-button" onClick={v.activate}>
                                    Make active{" "}
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
                                      <use href="/i15.svg#rotate-ccw" />
                                    </svg>
                                  </button>
                                </>
                              ) : null}
                              {v.isActive ? (
                                <>
                                  <span className="gver-live17">
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
                                      <use href="/i15.svg#circle-dot" />
                                    </svg>{" "}
                                    New runs use this
                                  </span>
                                </>
                              ) : null}
                            </footer>
                          </article>
                        </Fragment>
                      ))}
                      {v.graphNoVersions14 ? (
                        <>
                          <p className="gside-empty14">
                            This workflow has never been activated. Save a version to make it available to new runs.
                          </p>
                        </>
                      ) : null}
                      <p className="fine">
                        Historical runs keep the version they executed. Activating a version affects new runs only.
                      </p>
                    </div>
                  </>
                ) : null}
                {v.graphProposal14 ? (
                  <>
                    <div className="gprop14">
                      <p className="gside-title14">
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
                        </svg>{" "}
                        Proposed change
                      </p>
                      <strong>{interp(v.graphProposalTitle14)}</strong>
                      <ul>
                        {(v.graphProposalRows14 ?? []).map((r: any, i: number) => (
                          <Fragment key={i}>
                            <li className={r.tone}>{interp(r.text)}</li>
                          </Fragment>
                        ))}
                      </ul>
                      <div className="gprop-actions14">
                        <button className="small-button" onClick={v.previewProposal14}>
                          {interp(v.graphPreviewLabel14)}
                        </button>
                        <button
                          className="small-button primary"
                          onClick={v.applyProposal14}
                          disabled={v.graphProposalApplied14}
                        >
                          Apply
                        </button>
                        <button className="small-button" onClick={v.revertProposal14} disabled={v.graphNoRevert14}>
                          Revert
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </aside>
            </div>
            <footer className="graph-foot14">
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
                  <use href="/i15.svg#info" />
                </svg>{" "}
                Saving a version changes future runs only.
              </span>
              <button
                type="button"
                className="gh-fund17"
                onClick={v.gfMenu17}
                title="How this workflow pays for model calls"
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
                  <use href="/i15.svg#credit-card" />
                </svg>
                <span>{interp(v.gfShort17)}</span>
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
              <span>{interp(v.graphSummary14)}</span>
            </footer>
          </section>
        </div>
      </>
    ) : null
  );
}
