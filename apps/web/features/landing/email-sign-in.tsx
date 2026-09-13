"use client";
import type { LandingVals } from "./use-landing";
export function EmailSignIn({v}:{v:LandingVals}) {
 return <form onSubmit={e=>{e.preventDefault();void v.emailSignIn();}}>
  <label className="sr-only" htmlFor="email">Email address</label>
  <input id="email" type="email" autoComplete="email" required className="input" placeholder="Email address" value={v.email} onChange={v.editEmail} disabled={v.authBusy}/>
  {v.codeSent && <><label htmlFor="code">Sign-in code</label><input id="code" className="input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={v.code} onChange={v.editCode}/></>}
  <button type="submit" className="btn lg full" disabled={v.authBusy}>{v.authBusy?"Please wait":v.codeSent?"Verify code":"Continue with email"}</button>
  {v.error && <p className="ob-error" role="alert">{v.error}</p>}
  <p className="ob-fine">{v.codeSent?"Check your email. The code expires in 10 minutes.":"A sign-in code will be sent to your email."}</p>
 </form>;
}
