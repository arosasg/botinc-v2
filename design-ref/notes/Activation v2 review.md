# BotInc activation, paywall, and pricing proposal

Prepared for Alex, September 9, 2026.
Design approval only; commercial terms, production access, and implementation remain unchanged.
Open `Activation v2.dc.html` in this project for the connected prototype.
The original Console, MarketingPage, and Onboarding files are preserved.

## Direction

Let a person give the company a useful task before asking them to configure agents, models, accounts, and computers.
Default to an editable sample brief, an eligible managed model, a visible estimate, and a small task budget.
Return an artifact and a receipt, then ask the person to save the workspace and bring context for a second task.
An authenticated API key, a spinner, or a sample page visit is not activation.
The prototype simulates work, signup, connections, and payments; it is not live execution evidence.

Use the existing monthly prices initially: Pro $75 and Team $150 per workspace.
Grant $75 and $150 of usage credit every paid month respectively, with optional additional purchases.
A smaller $50 / $100 allowance is available as a comparison in Design review.
Exact allowance and usage margin are hypotheses for approval, not recommendations backed by measured BotInc profitability.

## Why calls fail while credits remain

The supplied error was reproduced in Santé Labs, showing Team and $94.90 available.
The matching server branch checks the workspace `voice_operator` rollout flag before credit admission.
A separate global kill switch exists; the specific screenshot matches the workspace gate.
The message therefore does not mean that the customer has insufficient funds.

Design rule: every plan includes operator voice when spendable credit and a sufficient call budget exist.
Remove the staged workspace invitation gate from ordinary commercial entitlement after readiness approval.
Keep explicit recovery for microphone permission, provider outage, caller permissions, rate limits, service capacity, and workspace spend caps.
Only insufficient funds should offer a credit purchase.
The common five-call limit in the proposal matches the source default; actual environment overrides still require validation before launch.
Credits do not buy their way around an outage or a service-capacity limit.

## Journey and instrumentation

| Step | User intent and screen | Friction removed | Recovery | Evidence to measure |
|---|---|---|---|---|
| Entry | Editable brief with three useful samples | No role survey, provider key, or team invitation | Resume preserved draft | Entry assignment and draft started |
| Dispatch | Estimate $0.18-$0.45; $1 budget example | Managed model and computer already selected | Empty input, insufficient funds, no eligible route | Task admission or exact rejection reason |
| Work | Progress with actual task lineage in implementation | No detached setup checklist | Same-task interruption and retry | Task started, paused, recovered, completed |
| First value | Artifact plus model/compute receipt | Output is readable before purchase | Refine with preserved context | Artifact opened plus saved/copied/refined |
| Save | Lightweight account creation preserving work | No mandatory work email or provider login | Invalid email, abandoned signup, return to result | Workspace saved without losing original task |
| Adoption | Second useful job with own context | Connect only the app needed now | Provider quota with explicit fallback consent | Second completed useful task within seven days |
| Usage boundary | Credits and contextual top-up | Stay Free when only funds are needed | Failed payment grants nothing | Boundary reached, recovery chosen, same task resumed |
| Capacity boundary | Free queue or plan comparison | Queue is a valid free choice | Compute/provider capacity explained separately | Queue completion and voluntary upgrade |
| Voice | Budget, access, and concrete recovery | No request-access dead end | Mic, outage, cap, capacity, and balance states | Connected call and reviewed/used outcome |

Anonymous entry needs a bounded guest-task policy, abuse controls, draft ownership transfer, and no access to private integrations before identity is established.
If a static sample is used for anonymous visitors, record it as product education, never as a completed customer task.
Measure real first value separately after a customer supplies a brief.
Instrumentation is specified here; it has not been added or audited in production.
Do not collect raw task contents or call transcripts as analytics properties.

## Plan and entitlement matrix

The proposal retains existing Free capabilities and current capacity allocations.

| Capability | Free | Pro | Team |
|---|---|---|---|
| Monthly platform subscription | $0 | $75 | $150 |
| Included usage credits | $2 once, 30-day expiry | $75 each month | $150 each month |
| Annual payment option | None | $750/year | $1,500/year |
| Credits on annual option | Not applicable | $62.50 each monthly anniversary | $125 each monthly anniversary |
| Simultaneous tasks | 1 | 5 | No plan cap; resources still constrain execution |
| Agents | 8 | Unlimited | Unlimited |
| Autopilot runs/month | 100 | 10,000 | 100,000 |
| Included storage | 1 GB | 10 GB | 50 GB |
| Operator calls with credits | Included | Included | Included |
| Concurrent calls per workspace | 5 service limit | 5 service limit | 5 service limit |
| Own accounts and local computer | Included | Included | Included |
| Managed eligible models from credits | Yes | Yes | Yes |
| Top-ups from $5 without subscription | Yes | Yes | Yes |

Annual credits are reduced to the annualized fee in the default full-fee scenario.
This must be shown beside the discount, not hidden in a tooltip.
Alternative annual packaging can retain $75/$150 monthly credits, but needs a separate cost model and explicit commercial approval.
The card marked Current plan must match both the tier and billing cadence.

## Paywall and credit lifecycle

Show the requested action, actual boundary, remaining credit or capacity, a free recovery when available, and the purchase outcome before checkout.
Preserve the original task, transcript, and result when money runs out.
A completed artifact is never held hostage by a later paywall.

Track starter grants, monthly grants, paid purchases, consumption, refunds, and reversals separately.
Consume the soonest-expiring included credit first, then non-expiring paid top-ups.
Monthly credits refresh on the paid monthly anniversary and unused monthly credit expires then.
Annual payment issues twelve monthly grants; it never places a year's spendable balance upfront.
Issue grants idempotently only after confirmed payment, with unique subscription-period keys and reconciliation.
A duplicate payment webhook must not issue duplicate credit.

Upgrade immediately only after a review of the prorated price difference and matching prorated allowance difference.
Never replace or erase an existing paid balance when changing plans.
Downgrades and cancellation take effect at renewal; paid top-ups remain available.
A failed renewal grants no new monthly credit, preserves already-paid access through its period, and offers payment recovery.
Proration, failed renewal, refunds, and multi-currency taxes are documented contracts for detailed checkout implementation; the prototype purchase is a clearly labeled billing-boundary example.

Top-ups add the displayed face value with no separate credit-purchase deduction in this proposal.
The service margin is in usage rates, not applied twice.
Show tax before payment and issue the corresponding money receipt.
Auto-refill starts off and requires explicit approval of threshold, purchase amount, and monthly purchase cap.
Workspace usage caps apply independently from credit balance and refill caps.
Only authorized billing members can buy, change plans, or raise caps; other members should see the boundary and an internal request action without performing a purchase.

## Billing unit scorecard

Scores are qualitative product judgments, 1 low to 5 high.

| Candidate | Predictable to buyer | Tracks delivered value | Tracks direct cost | Auditable | Decision |
|---|---|---|---|---|---|
| Per completed task | 4 | 4 | 1 | 3 | Avoid initially: task sizes and failures vary |
| Raw tokens only | 2 | 2 | 5 | 5 | Expose in detailed receipts, not primary package |
| Dollar-denominated usage credit | 4 | 3 | 5 | 5 | Primary wallet; estimate before dispatch |
| Seats | 5 | 2 | 1 | 5 | Avoid artificial friction for a company of agents |
| Simultaneous task capacity | 5 | 4 | 3 | 5 | Plan differentiator, with queue alternative |

One dollar of credit buys one dollar of usage at published BotInc rates; it is not one dollar of underlying provider cost.
Meter actual delivered model usage and elapsed cloud compute.
Failed work can have real consumption; explain charged work and stop reason in the receipt.
Rejected admission, queue time, and duplicate events do not consume credit.
Absorb internal retries; a user-requested retry requires a new estimate and budget approval when necessary.
The receipt needs provider, exact model/version, input/output/cache/audio usage, rate version, compute duration, total, and credit lots debited.
The design uses illustrative $0.24 model and $0.06 compute values, not a verified model quote.

## Managed and own-account access

Managed access should route commercially permitted OpenRouter or NanoGPT PAYG behind BotInc's gateway with workspace-scoped spending and attribution.
Keep provider secrets server-side, select only tested tool-capable models, reserve a bounded budget, record provider cost, and stop cleanly on unavailable routes.
No provider connection is required for the managed path.
Do not promise every model or every harness before end-to-end execution is verified.

Own-account access is optional and available on Free.
The user's provider bills its model usage; local compute has no BotInc usage charge.
BotInc cloud compute and voice still use workspace credit.
The proposal removes an additional own-account model surcharge for future approved cohorts while preserving current agreements.
A provider quota exhaustion must pause the existing task; paid managed fallback is off unless the user explicitly enables it within the approved budget.

NanoGPT's current terms distinguish commercial PAYG access from personal subscription allowances.
Personal subscriptions must not become a pooled, shared customer backend.
Sources checked September 9: [NanoGPT terms](https://nano-gpt.com/legal/terms-of-service), [NanoGPT support](https://nano-gpt.com/support), [OpenRouter pricing](https://openrouter.ai/pricing), and [OpenRouter FAQ](https://openrouter.ai/docs/faq).
OpenRouter's gateway fee must be included in landed cost before applying a BotInc margin; do not assume provider list price is total cost.

## Economics and sensitivities

Current source uses a 10% markup for managed models and voice, which is 9.1% gross margin on those usage charges before payment and platform costs.
The design explores a 35% markup on landed provider cost, equivalent to 25.9% usage gross margin before those costs.
These are different from contribution and net profit.
Support, payment, infrastructure, included idle/storage cost, refunds, and acquisition costs still matter.

The following table assumes managed-model-heavy usage, landed cost equals customer usage / 1.35, payment fee 2.9% + $0.30 per purchase, and allocated support/platform cost $8 Pro or $15 Team per month.
High usage is three times allowance and adds one top-up for the excess.
These inputs are illustrative, not observed BotInc unit economics.

| Plan / usage | Subscription + top-ups collected | Usage at retail | Modeled direct cost | Contribution |
|---|---:|---:|---:|---:|
| Pro / Light | $75.00 | $18.75 | $24.36 | $50.64 (67.5%) |
| Pro / Full | $75.00 | $75.00 | $66.03 | $8.97 (12.0%) |
| Pro / High | $225.00 | $225.00 | $181.79 | $43.21 (19.2%) |
| Team / Light | $150.00 | $37.50 | $47.43 | $102.57 (68.4%) |
| Team / Full | $150.00 | $150.00 | $130.76 | $19.24 (12.8%) |
| Team / High | $450.00 | $450.00 | $361.98 | $88.02 (19.6%) |

With only today's 10% markup and full $75 monthly credit consumption, this same Pro model produces approximately -$3.66 contribution.
The full-credit design therefore must not ship using current rates without a validated cost model.
Annual scenarios must allocate annual subscription revenue and processing costs across the year and use the explicitly displayed monthly allowance.
Cloud compute and storage need their own measured margins rather than blindly applying the managed-model calculation.

## Evidence, migration, and experiment decision

Source baseline: BotInc origin/main commit `51b3d20d8`, checked September 9.
Relevant source includes `server/internal/handler/voice_gate.go`, `server/internal/billing/catalog_v1.json`, and subscription invoice handling in `stripe_service.go`.
Current subscription payment is a platform fee with no monthly credit grant; live pricing is $0/$75/$150 and top-ups currently deduct a purchase fee.
Those facts explain the proposed changes; this artifact does not alter their implementation.

The dev-saas-onboarding, dev-saas-paywalls, and dev-saas-pricing skills inform first useful output, contextual help, value-based boundaries, transparent billing, and cost validation.
Their qualitative research does not establish the winning BotInc allowance, markup, conversion lift, or paywall timing.

First run an onboarding-only test with fixed pricing and credit allowances across arms.
Randomize new eligible workspaces at entry; count all assignments in the denominator.
Primary outcome: completed first useful task with an artifact use event within 24 hours.
Secondary outcome: a second useful task with customer context within seven days, time to first result, and collaborator use of completed work.
Guardrails: task failure, recovery success, support contacts, billing disputes, and contribution per assigned workspace.
Establish baseline and variance, power the sample before launch, pre-register a 10% relative practical improvement, and wait for mature cohorts.
Do not promote a variant from a small early conversion spike.

Run the credit/price pilot separately, first with shadow invoices and then an explicitly consented new cohort.
Evaluate retained paid workspaces and contribution at days 30 and 60, plus high-use tail costs and refund/dispute rates.
Reject or revise the full-credit hypothesis if high-use contribution turns negative or billing disputes increase materially.
Keep existing prices, agreements, paid balances, and grandfathered behavior unchanged until migration is approved and communicated.
Roll back new assignments and rates for future work if guardrails fail; honor already-purchased allowances and preserve in-flight task budgets.

Owner: Alex.
The next step after design review is an approved implementation issue bundle; none has been created here.

