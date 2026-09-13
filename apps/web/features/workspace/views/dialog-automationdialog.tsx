/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogAutomationdialog({ v }: { v: Vals }) {
  return (
    v.automationDialog ? (
      <>
        <span className="eyebrow">{interp(v.memberName)}’S AUTOMATION</span>
        <h2 id="dialog-title">Let the next issue start itself.</h2>
        <p className="dialog-copy">A narrow rule, with you in control of the result.</p>
        <div className="rule-fields">
          <label>
            Source
            <button
              type="button"
              className={`sel14 field ${v.m14_menu27?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_menu27?.expanded}
              onClick={v.m14_menu27?.pick}
            >
              <span>{interp(v.m14_menu27?.label)}</span>
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
          <label>
            Only issues labeled
            <input className="field" value={v.ruleLabel} onChange={v.editRuleLabel} />
          </label>
          <label>
            Maximum per issue
            <button
              type="button"
              className={`sel14 field ${v.m14_ruleBudget?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_ruleBudget?.expanded}
              onClick={v.m14_ruleBudget?.pick}
            >
              <span>{interp(v.m14_ruleBudget?.label)}</span>
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
          <label>
            Daily spending limit
            <button
              type="button"
              className={`sel14 field ${v.m14_ruleDaily?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_ruleDaily?.expanded}
              onClick={v.m14_ruleDaily?.pick}
            >
              <span>{interp(v.m14_ruleDaily?.label)}</span>
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
        <div className="permission-box">
          <strong>
            {interp(v.memberName)}’s Implementer{" "}
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
              <use href="/i15.svg#arrow-right" />
            </svg>{" "}
            Reviewer{" "}
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
              <use href="/i15.svg#arrow-right" />
            </svg>{" "}
            {interp(v.memberName)}
          </strong>
          <p>
            Create a branch, make a fix, and open a draft pull request. Merging stays with you. The rule pauses if your
            access expires.
          </p>
        </div>
        <div className="dialog-actions">
          {v.canPauseRule ? (
            <>
              <button className="text-button" onClick={v.pauseRule}>
                Pause rule
              </button>
            </>
          ) : null}
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.enableAutomation}>
            {interp(v.automationSaveLabel)}
          </button>
        </div>
      </>
    ) : null
  );
}
