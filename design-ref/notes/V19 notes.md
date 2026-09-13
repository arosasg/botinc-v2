# V19 notes — motion

Layered over V18: `workspace-motion-v19.js` wraps the V18 class; `Workspace v19.css` imports `Workspace v18.css`. The CSS does the moving; the logic only names the moments (a screen change, a pane swap, a drag).

## The system

- **Timing**: 300ms for what a pointer caused, 500ms for what the page decided, `cubic-bezier(.22,.61,.36,1)` for anything that travels. One stagger step: 38ms.
- **A screen arrives**: the header and the page's blocks rise in order (opacity, 8px, a 3px blur that clears). The sidebar walks in once on load.
- **The skeleton beat**: for 420ms after a screen change, rows are grey shimmer bars the shape of their content (messages shorter than the column, notes shorter still), the title a grey bar. Then the rows rise in order. Same beat, 260ms, when a side-pane tab swaps.
- **Panes and widths**: the side pane slides in from the right; its width and the sidebar's ease over 320ms (expand, collapse, reset) and snap only while a pointer drags them.
- **Overlays**: scrims fade, sheets and the workflow editor pop (6px, 98% → 100%), menus and pickers pop from their anchor, toasts and the call bar rise. Inline editors, the queue and its rows, expanded workflow steps, and model rows all arrive the same way.
- **Hover and press**: colour and border ease over 160ms, cards lift 1px, buttons press to 96%, the composer's focus ring fades in, usage bars ease to their width.
- **Reduced motion** collapses everything to one frame and skips the skeleton.

Nothing that streams live (composer, route strip, the running clock) is animated.

## Added after review

- **Account safety is real.** Manage, Review and Open each open a screen instead of a toast: two-step sign-in (authenticator, passkey, text fallback, ten recovery codes, trust-this-device), signed-in devices (three sessions with location, IP and last active; sign out one or everywhere else), and API keys (scope per key, revoke, create with the secret shown once). The profile rows read their copy back from that state, so revoking a key or signing a device out changes the summary line.
- **The activity year is fixed and full width.** The range control is gone — the card states `LAST 12 MONTHS` and the squares stretch to fill the card at any width (columns sized from the data so the month labels stay aligned; a label in the last two columns is dropped rather than hung off the edge).
- **The step pane is a properties list.** Stacked form labels pushed every control 29px apart; now it is label left, control right, one hairline per group. It also stopped forgetting options: where it runs, skills, what it reads, what it may change, spend cap, give up after, retries, if it fails, what it produces, ask-me-before-it-starts, plus per-type groups for approval (who approves, remind after), question (wait up to, then), finish (reports, then) and start (starts when), and an "otherwise" branch for conditions.

