# V17 routing notes

Routing transparency, funding policy, a workflow choice per conversation, and a rebuilt Checks / Test / Versions side panel in the workflow editor. Layered over V16: `workspace-routing-v17.js` wraps the V16 class; `Workspace v17.css` imports `Workspace v16.css`. Nothing in the V16 files was edited except one appended CSS fix (the composer model chip hugs the left, per Alex's comment).

## What you always see

- **Routing strip** under every composer: live dot, model, the account that will take the next call, SUB / API KEY / CREDIT / WAIT / ASK, and the tightest quota window left. Next to it the chosen workflow (`Code review · auto`) and `$0.16 of $2.00` with an edit pencil for the task limit.
- **Model popover**: the account it will run on (identity, plan), every quota window with reset time, and the line after it — `Then Research · 28% left` or the fallback you chose. Under the funding row: the task limit with Edit, and the Workflow row.
- **Notices in the conversation**: model changes, funding changes, every send (`Sent with Claude Sonnet 5 · Work Max · sub · 31% left`), account switches when one runs out, and task-limit edits. They sit at the position where they happened.
- **Fallback policy** (funding popover) is the persona choice: subscriptions first, then *Ask before using credits* / *Use credits within the task limit* / *Wait for a subscription to reset*. The strip and the popover state which one applies once every subscription for the model is exhausted.

## Workflow choice

Workflow row in the model popover, or the chip in the strip. `Auto` is the default and names what it would run now; hovering any row previews its steps (model, effort, account, waits) without closing the picker; click selects and keeps the picker open; `Open in editor` jumps to the graph.

## Workflow editor

- **Checks**: six categories always listed (Configuration, Reachability, Exits and edges, Branches and joins, Bounded loops, Model routing). `Run checks` fills them; each finding has Fix, which selects the step.
- **Test**: four sample cases (approve first time, changes once, changes every time, subscription runs out mid-run). `Run whole test` or `Step through`. Every task step shows model, account, kind and quota left; account switches are called out. Summary: steps, where it stops, estimated spend, accounts used.
- **Versions**: status pill first, then name and date; recorded-run count in the footer; `Make active` on historical versions; a dashed Draft card with `Activate as v4` when the canvas has unsaved changes.

## Routines

Model and funding group in the routine form (model, pay with, and the account it would run on), the model on the routine page, model · account · kind on every recorded run, and Account / Paid with in the run record.

## Simulation

Quota moves 6% of the tightest window per send; spend $0.06. Cases and quotas are sample state; nothing calls a model.

