# V18 notes

Layered over V17: `workspace-flow-v18.js` wraps the V17 class; `Workspace v18.css` imports `Workspace v17.css`. Nothing in V17 files was edited.

## Issue header

- The workflow chip left the meta line, and the meta line no longer wraps. Under the title sits one line: a dot per step (green done, amber changes requested, pulsing blue = running, amber ring = waiting for you, red = stuck) and the current step with the workflow name and state (`Your approval · Code review · waiting for you`, or a running clock). It never competes with the title for width. Clicking it opens the Workflow pane.

## Workflow pane (side pane, between Issue and Pull requests)

- Name, version, whether Auto chose it or it was forced, and the workflow's one-line description.
- **Now card**: Running (account, live elapsed time, what the step is doing, `Open thread`), Waiting for you (`Review the change` / `Answer`), Stuck (the blocker and the fix), Paused (`Resume`), Finished, Not started.
- **Steps** in run order with real state from the issue's runs: done, changes requested, running (live clock), waiting, upcoming (dashed). The gate shows the branch it took (`no once, then yes`). Loop steps (Revise) sit under a dashed rule with attempts used. The current step opens by default; any step expands to model, account, effort, duration, cost, start time and `Open thread`.
- Footer: spend against the task limit and run count; `Open in editor`.
- After a send the current step shows as running for ~25 s (same window as V17's mid-run notices).

## Model picker

- One list, no provider rail. Search on top (Escape clears), **Auto** first and independent of any provider, then one section per routable provider (Claude, Codex, OpenRouter) with a header showing live accounts and a usage bar per model naming the account that would serve it. Each section shows its three headline models; `Show N more` opens the rest (Haiku, 4.x, o-series, Gemini, DeepSeek, Kimi, Qwen, Grok on OpenRouter). Search ignores the fold and matches across every section. Picking from a section sets that provider. Width 316px in list mode; the summary card is unchanged.

## Editing, queueing and steering (the Codex desktop set)

- **Hover a message of yours**: Edit, Fork from here, Copy.
- **Edit** opens the message in place. When nothing is running, `Send` replaces every later reply and replays from there (a note in the conversation records it; changed files stay). While a run is going, the same editor offers `Steer now` (the current turn reads it before its next action) and `Queue` (sent after). ⌘/Ctrl+Enter sends, Escape cancels.
- **Fork from here** copies the conversation up to that message into a new chat (`Fork · <title>`) and opens it; the issue is untouched.
- **Queue** above the composer: numbered rows in send order with Send earlier / Send later, Edit, `Send now` (steer) and Remove; `Clear all` when there are several. While a run is going the send button becomes a clock (`Queue message`) and a `Steer now` button sits beside Stop. Pressing Enter queues; Steer interrupts.

