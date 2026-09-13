/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function ShellBotincLanding({ v }: { v: Vals }) {
  return (
    v.landingPage ? (
      <>
        <main className="landing-v7" data-screen-label="BotInc landing">
          <nav className="l7-nav">
            <button className="brand" onClick={v.showLanding}>
              <img src="/assets/logo/botinc-mark.svg" alt="" />
              BotInc
            </button>
            <div>
              <button className="text-button" onClick={v.landingHow}>
                How it works
              </button>
              <button className="text-button" onClick={v.comparePlans}>
                Pricing
              </button>
              <button className="small-button" onClick={v.enterWorkspace}>
                Open workspace{" "}
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
                  <use href="/i15.svg#arrow-up-right" />
                </svg>
              </button>
            </div>
          </nav>
          <section className="l7-hero">
            <div className="l7-intro">
              <span className="l7-kicker">
                <span className="l7-blue-dot" />
                Your personal Operator
              </span>
              <h1>
                Hand it off.
                <br />
                <span>Stay in control.</span>
              </h1>
              <p>
                From a question to a fix, a design, or a finished brief.
                <br /> Your Operator brings the right skills. You make the calls.
              </p>
              <div className="l7-hero-actions">
                <button className="small-button primary" onClick={v.startFresh}>
                  Start for free{" "}
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
                    <use href="/i15.svg#arrow-right" />
                  </svg>
                </button>
                <button className="text-button" onClick={v.exploreExample}>
                  See a finished task{" "}
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
                    <use href="/i15.svg#play" />
                  </svg>
                </button>
              </div>
              <small>Proposed: $2 starter credit · No card or model account needed</small>
            </div>
            <div className="l7-handoff">
              <div className="l7-request">
                <span className="l7-person">You</span>
                <p>Fix the voice call issue. Show me the change before it goes live.</p>
              </div>
              <div className="operator-route11">
                <img src="/assets/agents/operator.svg" alt="" />
                <div>
                  <strong>Operator</strong>
                  <span>
                    Understands the request{" "}
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
                      <use href="/i15.svg#chevron-right" />
                    </svg>{" "}
                    Prepares the work{" "}
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
                      <use href="/i15.svg#chevron-right" />
                    </svg>{" "}
                    Checks the result
                  </span>
                </div>
              </div>
              <div className="l7-delivery">
                <div className="l7-delivery-top">
                  <span>
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
                      <use href="/i15.svg#circle-check" />
                    </svg>{" "}
                    Ready for your review
                  </span>
                  <small>Interactive example</small>
                </div>
                <h2>Voice calls follow your workspace.</h2>
                <p>The connection refreshes when you switch workspaces. The previous call closes cleanly.</p>
                <div className="l7-evidence">
                  <span>
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
                      <use href="/i15.svg#git-branch" />
                    </svg>{" "}
                    GitHub #842
                  </span>
                  <span>
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
                      <use href="/i15.svg#file-text" />
                    </svg>{" "}
                    3 files
                  </span>
                  <span>
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
                      <use href="/i15.svg#check" />
                    </svg>{" "}
                    12 checks passed
                  </span>
                </div>
                <div className="l7-delivery-bottom">
                  <span>Nothing merges until you approve.</span>
                  <button className="small-button primary" onClick={v.exploreExample}>
                    Review the change{" "}
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
                      <use href="/i15.svg#arrow-right" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section className="l7-story" id="how-it-works">
            <div className="l7-section-intro">
              <span>01 / ONE CONVERSATION</span>
              <h2>
                Start with what
                <br />
                you want done.
              </h2>
              <p>
                Ask a question, attach a file, or bring an issue from GitHub, Slack, or a one-time Linear migration. Connect
                a tool when the work needs it.
              </p>
              <button className="text-button" onClick={v.startFresh}>
                Give it a task{" "}
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
                  <use href="/i15.svg#arrow-right" />
                </svg>
              </button>
            </div>
            <div className="l7-example-list">
              <button onClick={v.exploreExample}>
                <span>
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
                    <use href="/i15.svg#git-pull-request" />
                  </svg>
                </span>
                <strong>“Fix this issue and prepare a pull request.”</strong>
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
                  <use href="/i15.svg#arrow-up-right" />
                </svg>
              </button>
              <button onClick={v.exploreResearch}>
                <span>
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
                    <use href="/i15.svg#search" />
                  </svg>
                </span>
                <strong>“Research the options. Give me a recommendation.”</strong>
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
                  <use href="/i15.svg#arrow-up-right" />
                </svg>
              </button>
              <button onClick={v.startDesign7}>
                <span>
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
                    <use href="/i15.svg#palette" />
                  </svg>
                </span>
                <strong>“Turn this idea into something I can review.”</strong>
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
                  <use href="/i15.svg#arrow-up-right" />
                </svg>
              </button>
              <p>
                Keep the conversation. Choose the model and effort for each task. Pay with BotInc credits, or connect your
                own Claude or Codex subscription later.
              </p>
            </div>
          </section>
          <section className="l7-team">
            <div className="l7-section-intro">
              <span>02 / YOUR PEOPLE, BUILT IN</span>
              <h2>
                One Operator.
                <br />
                The right skills.
              </h2>
              <p>One Operator handles your work, using your tools and skills. Your preferences and memory stay personal.</p>
            </div>
            <div className="operator-capabilities11">
              <img src="/assets/agents/operator.svg" alt="Operator" />
              <h3>Your Operator</h3>
              <p>One conversation for the whole task.</p>
              <div>
                <span>
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
                    <use href="/i15.svg#code" />
                  </svg>
                  Build & fix
                </span>
                <span>
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
                    <use href="/i15.svg#search" />
                  </svg>
                  Research
                </span>
                <span>
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
                    <use href="/i15.svg#palette" />
                  </svg>
                  Design
                </span>
                <span>
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
                    <use href="/i15.svg#circle-check" />
                  </svg>
                  Check the result
                </span>
              </div>
              <button className="small-button" onClick={v.startFresh}>
                Give it a task{" "}
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
                  <use href="/i15.svg#arrow-right" />
                </svg>
              </button>
            </div>
          </section>
          <section className="l7-control">
            <div>
              <span>03 / A CLEAR NEXT STEP</span>
              <h2>
                The work comes
                <br />
                back to you.
              </h2>
              <p>
                Open the result beside the conversation. See where it came from, what changed, and what it cost. Give
                feedback or approve the next step.
              </p>
            </div>
            <button className="l7-result-example" onClick={v.exploreResearch}>
              <span>
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
                  <use href="/i15.svg#file-text" />
                </svg>{" "}
                Research brief
              </span>
              <h3>A simpler first-use experience.</h3>
              <p>Three recommendations, with the evidence behind them.</p>
              <footer>
                <span>
                  <img src="/assets/agents/operator.svg" alt="" />
                  Your Operator
                </span>
                <strong>
                  Open result{" "}
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
                    <use href="/i15.svg#arrow-up-right" />
                  </svg>
                </strong>
              </footer>
            </button>
          </section>
          <section className="l7-closing">
            <div>
              <h2>
                More done.
                <br />
                Less to manage.
              </h2>
              <p>Start free. Paid plans include credit for your work.</p>
            </div>
            <div>
              <button className="small-button primary" onClick={v.startFresh}>
                Start for free{" "}
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
                  <use href="/i15.svg#arrow-right" />
                </svg>
              </button>
              <button className="text-button" onClick={v.comparePlans}>
                Explore plans and credits
              </button>
            </div>
          </section>
          <footer className="l7-footer">
            <span>
              <img src="/assets/logo/botinc-mark.svg" alt="" />
              BotInc
            </span>
            <div>
              <button className="text-button" onClick={v.privacyDetails}>
                Privacy
              </button>
              <button className="text-button" onClick={v.pricingDetails}>
                Credit terms
              </button>
              <button className="text-button" onClick={v.toggleTheme}>
                {interp(v.appearanceLabel)}
              </button>
            </div>
            <small>Design proposal · Sample work and simulated actions</small>
          </footer>
        </main>
      </>
    ) : null
  );
}
