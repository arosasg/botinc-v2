/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function ShellPlansAndCredits({ v }: { v: Vals }) {
  return (
    v.pricingPage7 ? (
      <>
        <main className="pricing-v7" data-screen-label="Plans and credits">
          <nav className="p7-nav">
            <button className="text-button" onClick={v.leavePricing7}>
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
                <use href="/i15.svg#chevron-left" />
              </svg>{" "}
              {interp(v.pricingBack7)}
            </button>
            <span>
              BotInc <span className="p7-proposal">Pricing proposal</span>
            </span>
            <button className="icon-button" aria-label="Change appearance" onClick={v.toggleTheme}>
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
                <use href="/i15.svg#sun-moon" />
              </svg>
            </button>
          </nav>
          <header className="p7-header">
            <h1>A plan for your pace.</h1>
            <p>
              Your personal Operator on every plan.
              <br />
              Included credit for the work, more capacity when you need it.
            </p>
            <div className="p7-cadence">
              <button className={v.monthlyCycleClass} onClick={v.chooseMonthly}>
                Monthly
              </button>
              <button className={v.annualCycleClass} onClick={v.chooseAnnual}>
                Annual
              </button>
            </div>
          </header>
          <div className="p7-plans">
            {(v.plans7 ?? []).map((p: any, i: number) => (
              <Fragment key={i}>
                <article className={`p7-plan ${p.cls}`}>
                  <div className="p7-plan-label">
                    <h2>{interp(p.name)}</h2>
                    <span>{interp(p.tag)}</span>
                  </div>
                  <p>{interp(p.audience)}</p>
                  <div className="p7-price">
                    <strong>{interp(p.price)}</strong>
                    <span>{interp(p.period)}</span>
                  </div>
                  <div className="p7-credit">
                    <strong>{interp(p.credit)}</strong>
                    <small>{interp(p.creditDetail)}</small>
                  </div>
                  <button className={`small-button ${p.buttonClass}`} onClick={p.choose}>
                    {interp(p.button)}{" "}
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
                  <ul>
                    <li>
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
                      {interp(p.tasks)}
                    </li>
                    <li>
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
                      {interp(p.calls)}
                    </li>
                    <li>
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
                      Your personal Operator
                    </li>
                    <li>
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
                      Chat, skills, and your connections
                    </li>
                  </ul>
                  <details>
                    <summary>
                      More about this plan{" "}
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
                    </summary>
                    <p>
                      {interp(p.storage)} storage
                      <br />
                      {interp(p.automation)}
                      <br />
                      Calls use the same credit balance.
                    </p>
                  </details>
                </article>
              </Fragment>
            ))}
          </div>
          <p className="p7-under-plans">
            USD, excluding tax. Optional top-ups from $5. Your work stays available if credit runs out.
          </p>
          <section className="p7-credit-guide">
            <div>
              <span>ONE BALANCE. A CLEAR RECEIPT.</span>
              <h2>
                Credits pay for
                <br />
                the work.
              </h2>
              <p>
                Models, cloud computers, and calls draw from the same workspace balance. See the estimated cost and set a
                limit before a task starts.
              </p>
              <button className="text-button" onClick={v.pricingDetails}>
                How rates and limits work{" "}
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
            <div className="p7-receipt">
              <span>EXAMPLE TASK</span>
              <h3>Research a product idea</h3>
              <dl>
                <dt>Models</dt>
                <dd>$0.24</dd>
                <dt>Cloud computer</dt>
                <dd>$0.06</dd>
                <dt>Total credit used</dt>
                <dd>$0.30</dd>
              </dl>
              <p>
                Illustrative usage, not a fixed task price.
                <br />
                Actual cost depends on the model and work.
              </p>
            </div>
          </section>
          <section className="p7-faq">
            <h2>A few things to know.</h2>
            <details>
              <summary>
                What happens to unused credit?{" "}
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
                  <use href="/i15.svg#plus" />
                </svg>
              </summary>
              <p>
                Monthly credit expires at the next credit refresh. Purchased credit carries forward. The earliest-expiring
                allowance is used first. Free starter credit is granted once and expires after 30 days.
              </p>
            </details>
            <details>
              <summary>
                How does annual credit work?{" "}
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
                  <use href="/i15.svg#plus" />
                </svg>
              </summary>
              <p>
                {interp(v.annualCredit7)} Annual payment is collected up front. Credit is released monthly, not all at once.
              </p>
            </details>
            <details>
              <summary>
                Can I use my own model account?{" "}
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
                  <use href="/i15.svg#plus" />
                </svg>
              </summary>
              <p>
                Yes. Settings has a Model accounts page for your own Claude or Codex subscription, or an API key.
                Subscription work uses that provider’s quota rather than BotInc credit, and the receipt says so. BotInc
                cloud compute, if any, is still itemized. Quota percentages are never converted into a dollar amount, your
                account is never used by a teammate, and nothing changes who pays without asking you. A model account is
                optional: your first task works without one.
              </p>
            </details>
            <details>
              <summary>
                Can I make calls on Free?{" "}
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
                  <use href="/i15.svg#plus" />
                </svg>
              </summary>
              <p>
                Yes. Calls are available on every plan when credit and capacity are available. A service problem or
                connection error is shown separately from a billing limit.
              </p>
            </details>
            <details>
              <summary>
                What changes when I upgrade or cancel?{" "}
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
                  <use href="/i15.svg#plus" />
                </svg>
              </summary>
              <p>
                We show the exact payment, credit grant, and effective date before you confirm. A monthly upgrade is
                prorated. Downgrades and billing-cycle changes take effect at renewal. Your conversations and purchased
                credit remain available.
              </p>
            </details>
          </section>
          <footer className="p7-footer">
            <span>All prices and limits are proposed for review.</span>
            <button className="text-button" onClick={v.leavePricing7}>
              {interp(v.pricingBack7)}{" "}
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
          </footer>
        </main>
      </>
    ) : null
  );
}
