/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";

export function DialogAuthdialog({ v }: { v: Vals }) {
  return (
    v.authDialog ? (
      <>
        <h2 id="dialog-title">Keep your work.</h2>
        <p className="dialog-copy">Your conversation stays right here.</p>
        <button className="button primary" onClick={v.authComplete}>
          Continue with Google
        </button>
        <div className="or-line">or</div>
        <label className="sr-only" htmlFor="auth-email">
          Email address
        </label>
        <input
          id="auth-email"
          className="field"
          type="email"
          placeholder="Email address"
          value={v.email}
          onChange={v.editEmail}
        />
        <button className="button" onClick={v.emailComplete}>
          Continue with email
        </button>
        <p className="fine">Prototype sign-in. No account is created.</p>
      </>
    ) : null
  );
}
