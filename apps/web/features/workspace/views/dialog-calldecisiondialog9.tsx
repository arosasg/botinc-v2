/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogCalldecisiondialog9({ v }: { v: Vals }) {
  return (
    v.callDecisionDialog9 ? (
      <>
        <div className="call9">
          <header>
            <span className="n9-overline">OPERATOR CALL · SIMULATION</span>
            <button className="icon-button" aria-label="End call" onClick={v.endDecisionCall9}>
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
          <div className="call9-identity">
            <img src="/assets/agents/operator.svg" alt="Operator" />
            <h2 id="dialog-title">{interp(v.callTitle9)}</h2>
            <p>{interp(v.callSubtitle9)}</p>
            <span className="call9-status">{interp(v.callStatus9)}</span>
          </div>
          <section className="call9-task">
            <span>
              {interp(v.issue?.id)} · {interp(v.threadStatus9)}
            </span>
            <h3>{interp(v.issue?.title)}</h3>
            <span className="call9-progress">{interp(v.decisionProgress9)}</span>
          </section>
          {v.callCanStart9 ? (
            <>
              <div className="d9-options">
                <button className="small-button primary" onClick={v.connectDecisionCall9}>
                  Start call{" "}
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
                    <use href="/i15.svg#phone" />
                  </svg>
                </button>
              </div>
              <p className="fine">{interp(v.callFunding9)}</p>
            </>
          ) : null}
          {v.callConnected9 ? (
            <>
              <div className="call9-transcript" aria-live="polite">
                {(v.callTranscript9 ?? []).map((l: any, i: number) => (
                  <Fragment key={i}>
                    <p>
                      <strong>{interp(l.who)}</strong>
                      <span>{interp(l.text)}</span>
                    </p>
                  </Fragment>
                ))}
              </div>
              {v.callAnswering9 ? (
                <>
                  <div className="d9-options">
                    {(v.callOptions9 ?? []).map((o: any, i: number) => (
                      <Fragment key={i}>
                        <button className="small-button" onClick={o.pick}>
                          {interp(o.label)}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  <p className="fine">Tap an answer to simulate speaking. Your microphone is not used.</p>
                </>
              ) : null}
              {v.decisionConfirm9 ? (
                <>
                  <div className="call9-confirm">
                    <h3>Ready to continue?</h3>
                    {(v.decisionAnswers9 ?? []).map((a: any, i: number) => (
                      <Fragment key={i}>
                        <p>
                          <span>{interp(a.question)}</span>
                          <strong>{interp(a.answer)}</strong>
                        </p>
                      </Fragment>
                    ))}
                    <button className="small-button primary" onClick={v.confirmCallDecision9}>
                      Confirm & continue{" "}
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
                </>
              ) : null}
              {v.callReview9 ? (
                <>
                  <p className="fine">Review the result in writing. A call cannot approve or merge a change.</p>
                  <button className="small-button primary" onClick={v.switchCallToText9}>
                    Open review
                  </button>
                </>
              ) : null}
              {v.decisionExternal9 ? (
                <>
                  <p className="fine">{interp(v.decisionContext9)}</p>
                  <button className="small-button primary" onClick={v.switchCallToText9}>
                    {interp(v.decisionExternalLabel9)}
                  </button>
                </>
              ) : null}
              {v.callDone9 ? (
                <>
                  <button className="small-button primary" onClick={v.nextCallDecision9}>
                    {interp(v.callNextLabel9)}{" "}
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
              <div className="call9-controls">
                <button className="icon-button" aria-label={v.callMuteLabel9} onClick={v.toggleCallMute9}>
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
                    <use href={v.callMuteIcon9} />
                  </svg>
                </button>
                <button className="small-button" onClick={v.switchCallToText9}>
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
                    <use href="/i15.svg#message-square" />
                  </svg>{" "}
                  Continue in chat
                </button>
                <button className="icon-button call9-end" aria-label="End call" onClick={v.endDecisionCall9}>
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
                    <use href="/i15.svg#phone-off" />
                  </svg>
                </button>
              </div>
              <button className="text-button call9-interrupt" onClick={v.interruptCall9}>
                Preview interrupted call
              </button>
            </>
          ) : null}
          {v.callInterrupted9 ? (
            <>
              <div className="t9-waiting">
                <div>
                  <strong>Connection lost. Your answers are saved.</strong>
                  <p>The task is still waiting until you confirm.</p>
                </div>
              </div>
              <div className="d9-options">
                <button className="small-button" onClick={v.switchCallToText9}>
                  Continue in chat
                </button>
                <button className="small-button primary" onClick={v.connectDecisionCall9}>
                  Reconnect call
                </button>
              </div>
            </>
          ) : null}
          {v.callNoCredit9 ? (
            <>
              <p className="d9-error">Calls need an available voice balance. Continue by text or add credits.</p>
              <div className="d9-options">
                <button className="small-button" onClick={v.switchCallToText9}>
                  Continue in chat
                </button>
                <button className="small-button primary" onClick={v.topup}>
                  Add credits
                </button>
              </div>
            </>
          ) : null}
        </div>
      </>
    ) : null
  );
}
