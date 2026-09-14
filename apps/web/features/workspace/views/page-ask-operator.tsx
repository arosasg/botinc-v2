/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import { MessageText } from "../message-text";

export function PageAskOperator({ v }: { v: Vals }) {
  return (
    v.dockOpen15 ? (
      <>
        <aside className="dock15 dock-float16" style={css(v.dockFloatStyle16)} aria-label="Ask Operator">
          <button
            className="dock-grip19"
            aria-label="Resize this conversation"
            title="Drag to resize · double-click to expand or shrink"
            onPointerDown={v.dockCornerDrag16}
            onKeyDown={v.dockCornerKey16}
            onDoubleClick={v.dockToggleSize19}
          >
            <i />
          </button>
          <header className="dock-head15" onPointerDown={v.dockMove16}>
            <img className="dock-mark15" src="/assets/logo/botinc-mark.svg" alt="" />
            <div>
              <strong>Ask Operator</strong>
              <small>{interp(v.dockSub15)}</small>
            </div>
            <button className="icon-button" aria-label="Close the side conversation" onClick={v.dockClose15}>
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
          <div className="dock-log15 chat10-col15">
            {(v.dockRows15 ?? []).map((m: any, i: number) => (
              <Fragment key={i}>
                <article className={`message10 ${m.cls}`}>
                  <div className="message-author">
                    {m.hasAvatar ? (
                      <>
                        <img src={m.avatar} alt="" />
                      </>
                    ) : null}
                    <strong>{interp(m.author)}</strong>
                    <small>{interp(m.model)}</small>
                  </div>
                  <MessageText text={String(m.text ?? "")} />
                  {m.hasAttachments11 ? (
                    <>
                      <div className="message-attachments11">
                        {(m.attachments11 ?? []).map((a: any, i: number) => (
                          <Fragment key={i}>
                            <button type="button">
                              {a.image ? (
                                <>
                                  <img src={a.url} alt={a.name} />
                                </>
                              ) : null}
                              {!a.image ? (
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
                                    <use href="/i15.svg#file-text" />
                                  </svg>
                                </>
                              ) : null}
                              <span>{interp(a.name)}</span>
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </>
                  ) : null}
                  {m.hasOptions ? (
                    <>
                      <div className="message-actions11 dock-opts19">
                        {(m.options ?? []).map((o: any, i: number) => (
                          <Fragment key={i}>
                            <button type="button" className="small-button" onClick={o.pick}>
                              {interp(o.label)}
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </>
                  ) : null}
                  {m.hasAction ? (
                    <>
                      <div className="message-actions11">
                        <button type="button" className="small-button" onClick={m.act}>
                          {interp(m.actionLabel)}
                        </button>
                      </div>
                    </>
                  ) : null}
                  {m.isOperator11 ? (
                    <>
                      <div className="message-actions11">
                        <button className="icon-button" aria-label="Copy response" title="Copy response" onClick={m.copy11}>
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
                            <use href="/i15.svg#copy" />
                          </svg>
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Use response as draft"
                          title="Use as draft"
                          onClick={m.quote11}
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
                            <use href="/i15.svg#corner-up-left" />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : null}
                </article>
              </Fragment>
            ))}
            {v.dockNoLog15 ? (
              <>
                <div className="dock-start15">
                  <p>{interp(v.dockIntro15)}</p>
                  {(v.dockSuggestions15 ?? []).map((s: any, i: number) => (
                    <Fragment key={i}>
                      <button className="dock-sug15" onClick={s.ask}>
                        {interp(s.label)}
                      </button>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.dockRunning15 ? (
              <>
                <p className="dock-run15">
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
                    <use href="/i15.svg#loader" />
                  </svg>
                  {interp(v.dockRunCopy15)}
                </p>
              </>
            ) : null}
          </div>
          {v.dockQueued15 ? (
            <>
              <div className="dock-queue15">
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
                  <use href="/i15.svg#clock" />
                </svg>
                <div>
                  {(v.dockQueueRows15 ?? []).map((q: any, i: number) => (
                    <Fragment key={i}>
                      <span className="dock-qrow15">
                        {interp(q.text)}
                        <button className="icon-button" aria-label="Remove queued message" onClick={q.remove}>
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
                    </Fragment>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          <div className="dock-form15">
            {v.dockNoContext15 ? (
              <>
                <button type="button" className="dock-rechip15" onClick={v.dockAddContext15}>
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
                  Add this page as context
                </button>
              </>
            ) : null}
            {v.dockHasTools15 ? (
              <>
                <div className="tool-chips15">
                  {(v.dockTools15 ?? []).map((c: any, i: number) => (
                    <Fragment key={i}>
                      <span className="tool-chip15">
                        <img className={c.brandClass12} src={c.brand12} alt="" />
                        {interp(c.name)}
                        <button type="button" className="icon-button" aria-label="Remove connector" onClick={c.remove}>
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
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.dockPlan15 ? (
              <>
                <p className="dock-mode15">Plan mode</p>
              </>
            ) : null}
            {v.dockHasGoal15 ? (
              <>
                <p className="dock-mode15">Goal: {interp(v.dockGoal15)}</p>
              </>
            ) : null}
            <form className="composer10 composer11 dock-shell15" onSubmit={v.dockSend15}>
              {v.dockHasAttach15 ? (
                <>
                  <div className="attachments11">
                    {(v.dockAttachRows19 ?? []).map((a: any, i: number) => (
                      <Fragment key={i}>
                        <div className="attachment11">
                          <button type="button" className="attachment-preview11" onClick={a.open}>
                            {a.image ? (
                              <>
                                <img src={a.url} alt={a.name} />
                              </>
                            ) : null}
                            {!a.image ? (
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
                                  <use href="/i15.svg#file-text" />
                                </svg>
                              </>
                            ) : null}
                            <span>
                              <strong>{interp(a.name)}</strong>
                              <small>{interp(a.meta)}</small>
                            </span>
                          </button>
                          <button className="icon-button" type="button" aria-label={a.removeLabel} onClick={a.remove}>
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
                      </Fragment>
                    ))}
                  </div>
                </>
              ) : null}
              <div className={`route-head17 ${v.routeTone17}`}>
                <button
                  type="button"
                  className="rh-main17"
                  onClick={v.routePicker17}
                  title={v.routeTitle17}
                  aria-label="Routing for the next message"
                  aria-expanded={v.routePopover17}
                >
                  <i className="route-dot17" />
                  <svg
                    className="ui-icon use14 rh-route17"
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
                  {v.routeHasLogo17 ? (
                    <>
                      <img className={`brand12 rh-logo17 ${v.routeLogoClass17}`} src={v.routeLogo17} alt="" />
                    </>
                  ) : null}
                  <span className="rh-model17">{interp(v.routeModel17)}</span>
                  <span className="rh-sep17">·</span>
                  <span className="rh-acct17">{interp(v.routeAccount17)}</span>
                  <em className={`route-kind17 ${v.routeKindCls17}`}>{interp(v.routeKind17)}</em>
                  {v.routeHasBar17 ? (
                    <>
                      <span className="route-bar17">
                        <i style={css(v.routeBarStyle17)} />
                      </span>
                      <span className="route-left17">{interp(v.routeLeft17)}</span>
                    </>
                  ) : null}
                </button>
                {v.dockHasCost19 ? (
                  <>
                    <button
                      type="button"
                      className="rh-cost17"
                      onClick={v.editTaskLimit17}
                      title="Task limit for this conversation. Click to edit."
                    >
                      <span className="rh-cost-long17">
                        {interp(v.conversationCost10)} of {interp(v.routeLimit17)}
                      </span>
                      <span className="rh-cost-short17">{interp(v.routeCostShort17)}</span>
                    </button>
                  </>
                ) : null}
              </div>
              <textarea
                id="dock-composer15"
                rows={2}
                aria-label="Message your Operator"
                placeholder={v.dockPlaceholder15}
                value={v.dockDraft15}
                onChange={v.editDockDraft15}
                onKeyDown={v.dockKey15}
              />
              <div className="composer10-tools">
                <button type="button" className="icon-button" aria-label="Add files or context" onClick={v.dockPlusMenu15}>
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
                <button
                  className="composer10-choice model11"
                  type="button"
                  onClick={v.modelPicker11}
                  aria-label="Choose model"
                  aria-expanded={v.modelPopover10}
                >
                  {v.modelHasLogo11 ? (
                    <>
                      <img className={v.modelLogoClass11} src={v.modelLogo11} alt="" />
                    </>
                  ) : null}
                  {!v.modelHasLogo11 ? (
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
                  <span>{interp(v.modelLabel11)}</span>
                  <em className="model-effort15">{interp(v.thinkingLabel)}</em>
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
                      <button
                        type="button"
                        className="cbar-chipx16"
                        aria-label="Turn plan mode off"
                        onClick={v.planClear16}
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
                    </span>
                  </>
                ) : null}
                <span className="composer-spacer" />
                {v.dockRunning15 ? (
                  <>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Stop this answer"
                      title="Stop this answer"
                      onClick={v.dockStop15}
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
                        <use href="/i15.svg#square" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="steer-btn18"
                      title="Interrupt the current turn with this message"
                      disabled={v.dockEmpty15}
                      onClick={v.dockSteer19}
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
                        <use href="/i15.svg#zap" />
                      </svg>
                      <span>Steer now</span>
                    </button>
                  </>
                ) : null}
                <button
                  className={`icon-button mic11 ${v.micClass16}`}
                  type="button"
                  aria-label={v.micLabel16}
                  title={v.micLabel16}
                  aria-pressed={v.micOnStr16}
                  onClick={v.dockDictate15}
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
                    <use href="/i15.svg#mic" />
                  </svg>
                </button>
                <button
                  className="icon-button call10-button"
                  type="button"
                  aria-label="Start voice call"
                  onClick={v.startVoice10}
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
                    <use href="/i15.svg#audio-lines" />
                  </svg>
                </button>
                <button
                  className={`send-button ${v.dockSendCls19}`}
                  type="submit"
                  aria-label={v.dockSendLabel15}
                  title={v.dockSendLabel15}
                  disabled={v.dockEmpty15}
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
                    <use href={v.dockSendIcon15} />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          {v.dockProposal15 ? (
            <>
              <div className="dock-prop15">
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
                <div>
                  <strong>{interp(v.dockPropTitle15)}</strong>
                  <small>{interp(v.dockPropCopy15)}</small>
                </div>
                <button className="small-button primary" onClick={v.dockApply15} disabled={v.dockApplied15}>
                  Apply
                </button>
                <button className="small-button" onClick={v.dockRevert15} disabled={v.dockNoRevert15}>
                  Revert
                </button>
              </div>
            </>
          ) : null}
          <footer className="dock-foot15">{interp(v.dockFoot15)}</footer>
        </aside>
      </>
    ) : null
  );
}
