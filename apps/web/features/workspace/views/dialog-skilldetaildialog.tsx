/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogSkilldetaildialog({ v }: { v: Vals }) {
  return (
    v.skillDetailDialog ? (
      <>
        <span className="eyebrow">{interp(v.skillSourceLabel)}</span>
        <h2 id="dialog-title">{interp(v.selectedSkillName)}</h2>
        <p className="dialog-copy">{interp(v.selectedSkillDescription)}</p>
        <div className="skill-detail-meta">
          <span className="status-pill">{interp(v.selectedSkillVersion)}</span>
        </div>
        <div className="skill-files">
          {(v.skillFiles ?? []).map((f: any, i: number) => (
            <Fragment key={i}>
              <button className={f.cls} onClick={f.open}>
                {interp(f.name)}
              </button>
            </Fragment>
          ))}
        </div>
        <pre className="skill-instructions">{interp(v.skillInstructions)}</pre>
        <h3 className="subheading">Enable for your Operator</h3>
        {(v.skillAssignments ?? []).map((a: any, i: number) => (
          <Fragment key={i}>
            <label className="check-row">
              <input type="checkbox" checked={a.enabled} onChange={a.toggle} />
              <img className="mini-agent" src={a.avatar} alt="" />
              <span>{interp(a.name)}</span>
            </label>
          </Fragment>
        ))}
        <p className="fine">
          Changes apply to {interp(v.memberName)} only. Running tasks keep the skill version they started with.
        </p>
        <div className="dialog-actions">
          <button className="text-button" onClick={v.editSkill}>
            {interp(v.editSkillLabel)}
          </button>
          <button className="small-button primary" onClick={v.saveSkillAssignments}>
            Save agent access
          </button>
        </div>
      </>
    ) : null
  );
}
