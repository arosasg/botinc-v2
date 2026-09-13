# BotInc V15 review notes

V15 refines the accepted V14 experience from the latest screenshot feedback.
Claude Opus 5 at high effort produced two local CLI passes, followed by host corrections, interaction checks and visual review.
V14 and earlier published designs remain unchanged.
All runs, browser actions, account connections, passkeys, invites, payments and merges are authored sample interactions.

## Open the experience

- `Workspace v15.dc.html` opens the long BOT-241 conversation.
- `Mobile v15.dc.html` provides the same experience in a dedicated 430px mobile artboard.
- `Start here v15.dc.html` opens the landing page and preserves the onboarding journey into the console.
- The long BOT-241 and BOT-250 examples contain 31 and 32 messages, with seven workflow runs each and multiple implementation and review models.

## Changes to review

| Area | V15 behavior |
| --- | --- |
| Attachment menu | A compact Codex-style menu contains Files and folders, Goal, Plan mode and Connectors. Files and folders opens file or directory selection. Connected tools have a clean submenu with selected states and a Plugins action. |
| Model and effort | One small anchored popup shows the selected model and a discrete effort slider. The model line opens a provider rail; hover, focus or click changes its model list. Both composers show the provider mark. |
| Review status | The pending decision is an action beside Issue and the overflow button. It jumps to the real review or question in the conversation. |
| Collapsed context | The issue, PR, files and sources card sits below the header actions. The browser preview sits below it. The conversation has one scrollbar at its outer right edge. |
| Browser preview | A miniature console shows the current route, issue states and question. Play, Next, Replay and the expanded Preview tab share the same sample sequence. |
| Side conversation | The floating launcher opens a resizable conversation pane with the shared composer, attachments, model selection, microphone, call and page context. It is absent from fresh New chat. Mobile uses a contained bottom sheet. |
| Schedule | History uses aligned columns with a reserved result cell. New routine includes templates, task, trigger, schedule or source, validation and a review summary. |
| Profile | Quick identity edits, a theme selector aligned right, a contribution calendar with working date ranges, Google and email sign-in details and complete sample passkey screens. |
| Repositories | A selectable repository list exposes Optimized, Needs setup and Attention states, connection details, sandbox startup, masked environment variables and an AI optimization conversation. There is no computer or default-branch selector. |
| Design | A compact design-system specimen and source list replace the sparse detail layout. Tokens are an authored specimen, not a live synchronized token editor. |
| Model accounts | Aligned title, provider tabs, search and content. Twenty sample accounts use named providers, without Other. The detail pane reuses compact usage bars, percentages and reset times, including Fable windows. |
| Team | Invite member and Create custom role are above their lists, with permission guards. Redundant actions below the lists have been removed. |
| Account connection | Clean selectable method cards replace the large radio layout. Failure simulation is in Design preview instead of the primary form. |

## State and interaction corrections

Goals, Plan mode and selected connectors belong to the conversation that chose them.
Plan mode uses the actual planning response path.
Main and side composers keep independent connector selections.
Expanding the side conversation preserves its exchange, unsent draft and attachments.
Pending replies, queued requests and passkey setup stay with the member who started them.
Queued requests are retained when the member changes and resume only for their owner.
File reads retain the selected composer and cannot attach to a different member's conversation.
Provider hover changes the visible model list without silently selecting a different model.
The side pane can resize, collapse and restore.
The final browser pass reproduced an empty New routine dialog, restored the active form, and verified setup, review and creation with a new regression assertion.
The collapsed browser preview reserves room for its controls even when connector chips make the composer taller.

## Brand assets

Cursor and Google are exact vectors extracted from the current BotInc repository.
Hermes uses the repository's original 48px WebP without resampling.
The image is stored directly because Design removes inline image URLs from SVG wrappers.
The asset provenance is recorded in `v15-reference/brand-sources.md`.
The V15 icon sprite is `i15.svg` and contains 144 symbols.
The generated Design support library is unchanged.

## Current functionality and proposed capability

The current repository was inspected on 2026-09-10.
`server/internal/handler/auth.go` supports Google sign-in and email code or magic link.
The current account and preferences components support profile editing, theme, language and timezone.
No passkey or WebAuthn implementation was found under `packages`, `apps/web` or `server`.
The passkey add, pending, success, cancel, rename and remove screens therefore describe a capability to implement later.
This implementation gap belongs in the handoff notes; the normal product screen has no Proposed badge.
No credential is collected or registered by the design.

Provider percentages remain separate reported windows and are not presented as pooled subscription quota.
The outer provider indicator is explicitly an average over reported accounts, alongside the number that can take work now.
Unknown, stale, exhausted and disconnected accounts remain distinct.
The accepted V14 pricing proposal is unchanged.
WebMCP navigation, repository optimization and PR merging remain simulated prototype behavior.

## Verification before saving

The built candidate passed 244 behavior assertions across the V15, V14, V13 and host contract suites.
All 1,499 template bindings resolved, control flow balanced, and the selector audit found no native select elements.
The host used these commands: `python3 v15-reference/run_tests.py`, `node v15-reference/host-new-contract-tests.mjs` and `node v15-reference/host-state-tests.mjs`.
The old `final-check.json` is historical duplicate-suite output and is not the release result.
The current suite results are in `v15-reference/test-summary.json`.

Desktop and mobile visual checks cover conversation layout, model and effort menus, the compact side context, account details, profile, account connection, schedule, role actions and repository settings.
The independent third visual review passed the targeted model-menu, outer-scrollbar, preview-control and mobile-account checks.
Light and dark themes were inspected.
The responsive 390px page and dedicated 430px artboard were checked separately.
The host then corrected and verified the dedicated mobile launcher and side-chat bounds.

The release process hashes every final file, writes it conditionally to the existing authorized Claude Design project, and reads every text file back.
Text files must match exactly; SVG verification ignores only the C2PA metadata added by Design and preserves that metadata in the saved readback.
The binary Hermes asset is verified by its saved etag and its loaded dimensions and appearance in the native preview; Design does not offer binary readback.

## Payload and source layout

The three generated HTML files are about 866 KB each, with about 7 KB of headroom under the encoded CLI request limit.
Further substantial additions require structural savings before publication.
Source fragments, state logic, style layers, browser captures and verification evidence are in `v15-reference/`.
`build_v15.py` builds the three HTML entries, two style sheets and icon sprite.
The final host style corrections live in `v15-reference/host-polish.css`.

