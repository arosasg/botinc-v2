# BotInc onboarding v3

September 9, 2026.
Rebuilt from scratch after Alex rejected v2 as too complex.
Open `Onboarding v3.dc.html`; the earlier `Activation v2.dc.html` review link opens the same new experience.
The previous full design is preserved as `Archive - Activation v2.dc.html`.

## The new path

One conversation is the product entry.
The first screen contains one question, one message box, three short suggestions, and the optional sign-in action.
A voice button remains available because speaking to the operator is also a core BotInc entry path.

The user writes a task or chooses a suggestion, then sends it.
A small estimate appears once the task is entered.
The result appears automatically in the same conversation.
The user can open or copy it, send another message, or save their work by signing in.
No welcome tour, setup checklist, workspace name, team invitation, model selection, separate running screen, or billing dashboard precedes the result.

The starting allowance is explicitly described as free credit.
Plans, connected apps, appearance, and the credit balance live under the account menu.
The detailed receipt is behind the small usage link beside the completed result.
A task asks for an app connection only when needed, with the option to paste context instead.
A low balance offers a simple top-up; a capacity limit keeps a free queue alternative.
The original pricing economics and migration proposal remain review material outside the onboarding.

## What was actually checked

| Reference | Direct observation | Limit |
|---|---|---|
| [Muse](https://muse.ai/) | Opened the live entry screen: mobile/email field and Continue; followed email entry to the six-digit verification screen | Full authenticated onboarding was not completed; the sign-in code requires the user's access |
| [Instinct](https://instinct.com/) and its linked [sign-in](https://app.instinct.com/login) | Opened the live site and followed its entry to a phone field and Send code | Private access; the button accepts Terms and SMS Terms, so phone verification was left to the user |
| [Muse official product tour](https://www.youtube.com/watch?v=wHn0hTjvFoo) | Read its timestamped transcript and inspected the conversation layout in the video | A walkthrough of the product, not evidence of personally completing first-run setup |
| Mobbin MCP | Queried Muse and Instinct onboarding as web flows, then iOS screens | Returned unrelated products, not an exact Muse or Instinct match; this does not prove absence from the entire catalog |

[Meta's launch announcement](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/) confirms the September 8 release.
[Muse's design account](https://introducing.muse.ai/) describes an ongoing main conversation, optional detail behind activity, and artifacts delivered through chat.
Those patterns informed the new structure; we did not copy its branding or treat its post-login onboarding as personally verified.
Instinct's public text-and-call positioning supports the familiar conversation model, but its authenticated setup remains unverified.

## Journey contract

| Step | User question | Product response | Required input | Success event | Failure recovery |
|---|---|---|---|---|---|
| Ask | What can this do for me? | One composer with three examples | A task, or an editable suggestion | First task submitted | Preserve the draft |
| Work | Is anything happening? | A short status in the conversation | None | Task starts within its budget | Pause and continue the same task |
| Result | Can I use this? | A concise artifact in the conversation | None | Artifact opened, copied, or refined | Original brief and earlier outputs stay accessible |
| Save | Will I lose my work? | Optional Google or email sign-in | Identity only when saving | Same conversation is attached to the account | Validation in place; no restart |
| Context | Why do you need this app? | One scoped connection beside the task | Only the relevant permission or pasted context | Original task resumes | Paste context or return later |
| Credit boundary | How do I continue? | Add $5, $10, or $25 while keeping the plan | Explicit payment confirmation | Payment succeeds and same task resumes | Failed payment changes no balance |
| Capacity boundary | Why is this waiting? | Free queue, with optional Pro capacity | None for waiting | Queued task starts | No charge while waiting |

First value means a useful completed customer task whose result is opened, copied, or refined.
Production adoption means a second useful task with the customer's own context within seven days.
Clicks through these sample results are prototype usability evidence, not customer activation.

## Basis and experiment

The onboarding skill's recurrent guidance supports a useful first result, relevant examples, optional setup, and contextual recovery.
The single-conversation layout is a BotInc design hypothesis informed by the observed references and Alex's explicit simplicity requirement.
No conversion uplift is established by those references.

Highest-priority test: compare the current onboarding with this conversation entry while holding pricing, credits, eligible models, and task quality constant.
Assign new eligible workspaces at entry and count all assigned workspaces in the denominator.
Primary metric: useful first-result use within 24 hours.
Secondary metrics: time to first result, seven-day second-task completion, successful recovery, and signup without losing the original conversation.
Guardrails: failures, confusing charges, support contacts, and contribution per assigned workspace.
Estimate sample size from the baseline before launch and evaluate mature cohorts against a pre-registered practical improvement threshold.
Instrumentation is specified here and has not been implemented in production.

## Preview and implementation boundaries

All model work, account creation, app connection, voice, and checkout in the prototype are simulated.
The prototype uses a $0.30 task receipt and $0.24 call receipt, not live provider quotes.
A real guest-task entry needs bounded admission, abuse controls, persistent ownership transfer, and an actual eligible managed model.
The prototype intentionally uses short static examples and makes no claim that a custom request ran against a real model or repository.

The proposed Free, Pro, and Team monthly prices and credit allowances remain $0/$2 once, $75/$75 monthly, and $150/$150 monthly.
The v3 contextual plan sheet shows monthly options; the prior annual proposal, detailed entitlements, rate assumptions, and migration contracts remain in `Activation v2 review.md` for commercial review.
No production pricing, entitlement, or issue changes were made.

