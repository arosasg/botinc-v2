/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogRoledialog14({ v }: { v: Vals }) {
  return (
    v.roleDialog14 ? (
      <>
        <span className="eyebrow">{interp(v.roleEyebrow14)}</span>
        <h2 id="dialog-title">{interp(v.roleTitle14)}</h2>
        <p className="dialog-copy">A role is a named set of permissions. Give it to people from the Members tab.</p>
        <div className="role16">
          <div className="role-main16">
            <label className="frm-row16 role-name16">
              <span>Name</span>
              <input
                id="role-name14"
                className="field"
                value={v.roleName14}
                onChange={v.editRoleName14}
                placeholder="Release manager"
              />
            </label>
            <div className="role-presets16">
              <span className="gside-title14">Start from</span>
              <div className="role-presetrow16">
                {(v.rolePresets16 ?? []).map((p: any, i: number) => (
                  <Fragment key={i}>
                    <button type="button" className={`role-preset16 ${p.cls}`} onClick={p.pick}>
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
                        <use href={p.icon} />
                      </svg>
                      {interp(p.name)}
                      <small>{interp(p.count)}</small>
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
            {(v.rolePermGroups16 ?? []).map((g: any, i: number) => (
              <Fragment key={i}>
                <section className="role-group16">
                  <header>
                    <h3>{interp(g.title)}</h3>
                    <span>{interp(g.count)}</span>
                  </header>
                  {(g.rows ?? []).map((p: any, i: number) => (
                    <Fragment key={i}>
                      <div className={`role-perm16 ${p.cls}`}>
                        <span className="role-permbody16">
                          <strong>{interp(p.title)}</strong>
                          <small>{interp(p.copy)}</small>
                        </span>
                        {p.locked ? (
                          <>
                            <em className="perm-lock14">
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
                                <use href="/i15.svg#lock-keyhole" />
                              </svg>
                              Owner only
                            </em>
                          </>
                        ) : null}
                        {!p.locked ? (
                          <>
                            <button
                              type="button"
                              className={`pf-switch16 ${p.swCls}`}
                              role="switch"
                              aria-checked={p.on}
                              aria-label={p.title}
                              onClick={p.toggle}
                            >
                              <i />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </Fragment>
                  ))}
                </section>
              </Fragment>
            ))}
          </div>
          <aside className="role-side16">
            <span className={`role-avatar16 ${v.roleSideTone16}`}>
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
                <use href="/i15.svg#shield" />
              </svg>
            </span>
            <strong className="role-sidename16">{interp(v.roleSideName16)}</strong>
            <span className="role-sidecount16">{interp(v.roleSideCount16)}</span>
            <ul className="role-sidelist16">
              {(v.rolePreview14 ?? []).map((r: any, i: number) => (
                <Fragment key={i}>
                  <li className={r.tone}>
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
                    {interp(r.text)}
                  </li>
                </Fragment>
              ))}
            </ul>
            <p className="fine">
              Owner-only powers stay with the owner. The server enforces every role change.
            </p>
          </aside>
        </div>
        {v.hasRoleError14 ? (
          <>
            <p className="error" role="alert">
              {interp(v.roleError14)}
            </p>
          </>
        ) : null}
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.saveRole14}>
            {interp(v.roleActionLabel14)}
          </button>
        </div>
      </>
    ) : null
  );
}
