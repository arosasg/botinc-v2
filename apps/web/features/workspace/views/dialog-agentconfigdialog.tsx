/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogAgentconfigdialog({ v }: { v: Vals }) {
  return (
    v.agentConfigDialog ? (
      <>
        <div className="agent-config-title">
          <img src={v.configAgentAvatar} alt="" />
          <div>
            <span className="eyebrow">{interp(v.memberName)}’S PERSONAL AGENT</span>
            <h2 id="dialog-title">{interp(v.configAgentName)}</h2>
          </div>
        </div>
        <label className="field-label" htmlFor="agent-model">
          Default model
        </label>
        <button
          type="button"
          className={`sel14 field ${v.m14_configModel?.cls}`}
          aria-haspopup="listbox"
          aria-expanded={v.m14_configModel?.expanded}
          id="agent-model"
          onClick={v.m14_configModel?.pick}
        >
          <span>{interp(v.m14_configModel?.label)}</span>
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
        <label className="field-label" htmlFor="agent-instructions">
          Your preferences
        </label>
        <textarea
          id="agent-instructions"
          className="field"
          rows={3}
          value={v.configInstructions}
          onChange={v.editAgentInstructions}
          placeholder="How should this agent work with you?"
        />
        <h3 className="subheading">Model funding for this agent</h3>
        {(v.agentAccountOptions ?? []).map((o: any, i: number) => (
          <Fragment key={i}>
            <label className="check-row">
              <input type="radio" name="agent-funding" checked={o.checked} onChange={o.pick} />
              <span>
                {interp(o.title)}
                <small>{interp(o.copy)}</small>
              </span>
            </label>
          </Fragment>
        ))}
        <p className="fine">Only your own accounts are listed. A teammate’s account is never offered here.</p>
        <h3 className="subheading">Allowed connections</h3>
        {(v.agentGrants ?? []).map((c: any, i: number) => (
          <Fragment key={i}>
            <label className="check-row">
              <input type="checkbox" checked={c.enabled} disabled={c.disabled} onChange={c.toggle} />
              <span>
                {interp(c.name)}
                <small>{interp(c.caption)}</small>
              </span>
            </label>
          </Fragment>
        ))}
        <div className="dialog-actions">
          <button className="text-button" onClick={v.agentSkillsLink}>
            Configure skills
          </button>
          <button className="text-button" onClick={v.memoryDetails}>
            Private memory
          </button>
          <button className="small-button primary" onClick={v.saveAgentConfig}>
            Save preferences
          </button>
        </div>
      </>
    ) : null
  );
}
