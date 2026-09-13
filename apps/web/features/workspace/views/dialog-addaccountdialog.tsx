/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogAddaccountdialog({ v }: { v: Vals }) {
  return (
    v.addAccountDialog ? (
      <>
        <span className="eyebrow">{interp(v.memberName)} · PERSONAL MODEL ACCOUNT</span>
        <h2 id="dialog-title">{interp(v.addTitle)}</h2>
        <p className="dialog-copy">{interp(v.addCopy)}</p>
        {v.addStepProvider ? (
          <>
            <div className="conn-gallery14">
              {(v.addProviders14 ?? []).map((p: any, i: number) => (
                <Fragment key={i}>
                  <button className={`conn-tile14 ${p.cls}`} onClick={p.choose}>
                    <span className="conn-logo14">
                      {p.logo ? (
                        <>
                          <img className={p.logoClass} src={p.logoSrc} alt="" />
                        </>
                      ) : null}
                      {!p.logo ? (
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
                            <use href={p.iconHref} />
                          </svg>
                        </>
                      ) : null}
                    </span>
                    <strong>{interp(p.name)}</strong>
                    <small>{interp(p.methodLabel)}</small>
                    <span className={`conn-badge14 ${p.tone}`}>{interp(p.badge)}</span>
                  </button>
                </Fragment>
              ))}
            </div>
            <p className="fine">
              Providers differ. Some support a direct sign-in, some are used through an API key that the provider bills, and
              some are not routable from BotInc Cloud at all.
            </p>
          </>
        ) : null}
        {v.addStepMethod ? (
          <>
            <div className="conn-chosen14">
              <span className="conn-logo14">
                {v.addChosenLogo14 ? (
                  <>
                    <img className={v.addChosenClass14} src={v.addChosenSrc14} alt="" />
                  </>
                ) : null}
              </span>
              <div>
                <strong>{interp(v.addChosenName14)}</strong>
                <small>{interp(v.addChosenNote14)}</small>
              </div>
            </div>
            <div className="method-cards15" role="radiogroup" aria-label="Connection method">
              {(v.addMethods15 ?? []).map((m: any, i: number) => (
                <Fragment key={i}>
                  <button
                    type="button"
                    className={`method-card15 ${m.cls}`}
                    role="radio"
                    aria-checked={m.checked}
                    onClick={m.pick}
                  >
                    <span className="method-mark15">
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
                        <use href={m.icon} />
                      </svg>
                    </span>
                    <strong>{interp(m.title)}</strong>
                    <small>{interp(m.copy)}</small>
                    <span className="method-tick15">
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
                      </svg>
                    </span>
                  </button>
                </Fragment>
              ))}
            </div>
            {v.addNeedsKey ? (
              <>
                <label className="field-label" htmlFor="add-key">
                  API key
                </label>
                <input
                  id="add-key"
                  className="field"
                  type="password" autoComplete="new-password" onChange={v.editLiveAccountSecret} value={v.addKeySample}
                  disabled={v.addTrue}
                  aria-describedby="add-key-note"
                />
                <p className="fine" id="add-key-note">
                  The key is stored encrypted and passed only to your remote runs.
                </p>
              </>
            ) : null}
            <label className="field-label" htmlFor="add-label">
              Label (optional)
            </label>
            <input
              id="add-label"
              className="field"
              value={v.addLabel}
              onChange={v.editAddLabel}
              placeholder={v.addLabelHint}
            />
            {v.addFailArmed15 ? (
              <>
                <p className="conn-armed15">
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
                    <use href="/i15.svg#flask-conical" />
                  </svg>
                  {interp(v.addFailArmedCopy15)}
                  <button className="text-button" onClick={v.toggleAddFail}>
                    Turn off
                  </button>
                </p>
              </>
            ) : null}
            <div className="dialog-actions">
              <button className="small-button" onClick={v.addBack}>
                Back
              </button>
              <button className="small-button primary" onClick={v.addStart}>
                {interp(v.addStartLabel)}
              </button>
            </div>
            <p className="fine">
              The account is saved to this workspace. Usage is reported by the provider during a run.
            </p>
          </>
        ) : null}
        {v.addStepConnecting ? (
          <>
            <div className="a8-connecting">
              <span className="a8-pulse" />
              <div>
                <strong>{interp(v.addConnectingTitle)}</strong>
                <p>{interp(v.addConnectingCopy)}</p>
              </div>
            </div>
            <ol className="conn-steps14">
              {(v.addProgress14 ?? []).map((s: any, i: number) => (
                <Fragment key={i}>
                  <li className={s.tone}>
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
                      <use href={s.icon} />
                    </svg>
                    {interp(s.label)}
                  </li>
                </Fragment>
              ))}
            </ol>
            <div className="dialog-actions">
              <button className="small-button" onClick={v.addCancel}>
                Cancel
              </button>
            </div>
            <p className="fine">This step waits for the provider. Cancelling connects nothing.</p>
          </>
        ) : null}
        {v.addStepFailed ? (
          <>
            <p className="error" role="alert">
              {interp(v.addErrorCopy)}
            </p>
            <div className="permission-box">
              <strong>Nothing changed</strong>
              <p>No account was added and no existing account was modified.</p>
            </div>
            <div className="dialog-actions">
              <button className="small-button" onClick={v.addCancel}>
                Close
              </button>
              <button className="small-button primary" onClick={v.addRetry}>
                Try again
              </button>
            </div>
          </>
        ) : null}
        {v.addStepDone ? (
          <>
            <div className="a8-done">
              <span className="a8-done-icon">
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
                  <use href="/i15.svg#circle-check" />
                </svg>
              </span>
              <div>
                <strong>{interp(v.addDoneIdentity)}</strong>
                <p>{interp(v.addDoneCopy)}</p>
              </div>
            </div>
            <div className="permission-box">
              <strong>What happens next</strong>
              <p>{interp(v.addDoneNext)}</p>
            </div>
            <div className="dialog-actions">
              <button className="small-button" onClick={v.addAnother}>
                Add another account
              </button>
              <button className="small-button primary" onClick={v.addFinish}>
                Done
              </button>
            </div>
          </>
        ) : null}
      </>
    ) : null
  );
}
