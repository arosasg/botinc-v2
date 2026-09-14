/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function DialogInvitedialog14({ v }: { v: Vals }) {
  return (
    v.inviteDialog14 ? (
      <>
        <span className="eyebrow">BOTINC WORKSPACE</span>
        <h2 id="dialog-title">Invite teammates</h2>
        <p className="dialog-copy">
          They get shared work and team conversations. Personal accounts, credentials and private memory are never shared.
        </p>
        <label className="field-label" htmlFor="invite-emails14">
          Email addresses
        </label>
        <textarea
          id="invite-emails14"
          className="field"
          rows={3}
          placeholder="ana@example.com, sam@example.com"
          value={v.inviteEmails14}
          onChange={v.editInviteEmails14}
        />
        {v.inviteHasChips14 ? (
          <>
            <div className="invite-chips14">
              {(v.inviteChips14 ?? []).map((c: any, i: number) => (
                <Fragment key={i}>
                  <span className={`invite-chip14 ${c.tone}`}>
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
                    {interp(c.email)}
                  </span>
                </Fragment>
              ))}
            </div>
          </>
        ) : null}
        <div className="form-pair">
          <label className="field-label">
            Role
            <button
              type="button"
              className={`sel14 field ${v.m14_inviteRole14?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_inviteRole14?.expanded}
              aria-label="Invitation role"
              onClick={v.m14_inviteRole14?.pick}
            >
              <span>{interp(v.m14_inviteRole14?.label)}</span>
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
          <label className="field-label">
            Project scope
            <button
              type="button"
              className={`sel14 field ${v.m14_inviteScope14?.cls}`}
              aria-haspopup="listbox"
              aria-expanded={v.m14_inviteScope14?.expanded}
              aria-label="Project scope"
              onClick={v.m14_inviteScope14?.pick}
            >
              <span>{interp(v.m14_inviteScope14?.label)}</span>
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
        <p className="fine">{interp(v.inviteRoleCopy14)}</p>
        {v.hasInviteError14 ? (
          <>
            <p className="error" role="alert">
              {interp(v.inviteError14)}
            </p>
          </>
        ) : null}
        <div className="dialog-actions">
          <button className="small-button" onClick={v.closeDialog}>
            Cancel
          </button>
          <button className="small-button primary" onClick={v.sendInvites14}>
            {interp(v.inviteActionLabel14)}
          </button>
        </div>
        <p className="fine">Invitation links are created securely and can be revoked from this workspace.</p>
      </>
    ) : null
  );
}
