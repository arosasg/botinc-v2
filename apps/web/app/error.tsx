"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="workspace-gate">
      <section className="workspace-gate-card" aria-labelledby="error-title">
        <img src="/assets/logo/botinc-mark.svg" alt="" />
        <span className="workspace-gate-kicker">THIS PAGE COULDN&apos;T LOAD</span>
        <h1 id="error-title">Your work is still safe</h1>
        <p>BotInc hit a temporary problem while opening this screen. Try it again without losing your current link.</p>
        <div className="workspace-gate-actions">
          <button className="workspace-gate-action" type="button" onClick={reset}>Try again</button>
          <a className="workspace-gate-secondary" href="/w">Open your workspace</a>
        </div>
        {error.digest ? <code className="workspace-gate-reference">Reference {error.digest}</code> : null}
      </section>
    </main>
  );
}
