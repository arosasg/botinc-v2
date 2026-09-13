/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogSkillcreatedialog({ v }: { v: Vals }) {
  return (
    v.skillCreateDialog ? (
      <>
        <span className="eyebrow">{interp(v.memberName)} · PERSONAL SKILL</span>
        <h2 id="dialog-title">{interp(v.skillEditorTitle)}</h2>
        <p className="dialog-copy">Give your Operator a repeatable way to do something well.</p>
        <div className="tabs source-tabs">
          {(v.skillSourceOptions ?? []).map((o: any, i: number) => (
            <Fragment key={i}>
              <button className={o.cls} onClick={o.choose}>
                {interp(o.name)}
              </button>
            </Fragment>
          ))}
        </div>
        <label className="field-label" htmlFor="new-skill-name">
          Name
        </label>
        <input
          id="new-skill-name"
          className="field"
          value={v.skillNameInput}
          onChange={v.editSkillName}
          placeholder="e.g. Release checklist"
        />
        {v.writeSkill ? (
          <>
            <label className="field-label" htmlFor="new-skill-body">
              Instructions
            </label>
            <textarea
              id="new-skill-body"
              className="field"
              rows={5}
              value={v.skillBodyInput}
              onChange={v.editSkillBody}
              placeholder="When should this skill be used? What steps should the agent follow?"
            />
          </>
        ) : null}
        {v.importSkill ? (
          <>
            <label className="field-label" htmlFor="skill-source-value">
              {interp(v.skillImportLabel)}
            </label>
            <input id="skill-source-value" className="field" value={v.skillImportValue} onChange={v.editSkillImport} />
            <p className="fine">{interp(v.skillImportCopy)}</p>
            <button className="small-button" onClick={v.previewSkillImport}>
              Preview sample import
            </button>
            {v.skillImportReady ? (
              <>
                <pre className="skill-instructions">{interp(v.skillBodyInput)}</pre>
              </>
            ) : null}
          </>
        ) : null}
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.saveSkill}>
            Save and choose agents
          </button>
        </div>
      </>
    ) : null
  );
}
