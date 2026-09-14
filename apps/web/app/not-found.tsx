export default function NotFound() {
  return (
    <main className="workspace-gate">
      <section className="workspace-gate-card" aria-labelledby="not-found-title">
        <img src="/assets/logo/botinc-mark.svg" alt="" />
        <span className="workspace-gate-kicker">404 - NOT FOUND</span>
        <h1 id="not-found-title">This link has nowhere to go</h1>
        <p>The workspace, conversation, or issue may have moved. Your saved work is untouched.</p>
        <div className="workspace-gate-actions">
          <a className="workspace-gate-action" href="/w">Open your workspace</a>
          <a className="workspace-gate-secondary" href="/">Return home</a>
        </div>
      </section>
    </main>
  );
}
