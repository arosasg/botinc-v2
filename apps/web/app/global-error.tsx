"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="workspace-gate">
          <section className="workspace-gate-card" aria-labelledby="global-error-title">
            <img src="/assets/logo/botinc-mark.svg" alt="" />
            <span className="workspace-gate-kicker">500 - TEMPORARY ERROR</span>
            <h1 id="global-error-title">BotInc needs another try</h1>
            <p>The application could not finish loading. No message or saved work was removed.</p>
            <div className="workspace-gate-actions">
              <button className="workspace-gate-action" type="button" onClick={reset}>Reload BotInc</button>
              <a className="workspace-gate-secondary" href="/">Return home</a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
