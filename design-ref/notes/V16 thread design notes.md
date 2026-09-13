# V16 thread design notes

Subagents in the conversation, made understandable and inspectable.

V15 showed a stage as two summary lines and a Runs pane of metadata.
There was no way to read what a specialist actually did.
V16 keeps the single conversation with the Operator and adds one new reading surface: a complete run thread, opened from wherever you already are.

Nothing else moves.
Pricing, accounts, profiles, landing, repositories, schedules and the workflow graph are untouched, and every V15 behaviour check still passes.

## Reading hierarchy

There are four levels, and each one is a deliberate step down in density.

**1. The conversation.**
One conversation with the Operator, in real chronological order.
Human messages, Operator prose and work blocks are interleaved exactly where they happened.
A work block is one compact row: provider mark, stage name, model, the useful outcome, and status.
It is never a giant card and never a badge cluster.

**2. The expanded work block.**
Clicking the row expands it in place, so you keep your position in the conversation.
You get the specialist's own summary, its first few public updates with timestamps, a single collapsed line for the tool actions, and any child runs it delegated.
This is the "is this worth opening" level, not the "read everything" level.

**3. The full run thread.**
The `Open thread` action on the block, and every row in the Runs tab, open the same thing: the complete run conversation inside the existing resizable right inspector.
Issue stays the first context tab.
The thread is the primary content.
Metadata is one quiet, folded `Details` section at the bottom.

The pane splits into three regions so a 26-entry transcript stays navigable.
A compact header holds `Back`, the run name, its status and the toolbar, and never scrolls away.
The transcript is the only scrolling region, so the larger outcome line and `Details` scroll out of the way as you read.
The composer sits below it, always reachable.
`Latest update` jumps to the most recent entry.
The pane's own expand control belongs to the shell, so the thread does not repeat it.

**4. A child run.**
A delegated run is a linked block inside its parent's thread.
Opening it shows its own complete assignment, work and result, with `Back` going up exactly one level to the parent.
There is no permanent sidebar per specialist, and no endless nesting.

When a child is blocked, its question appears in one answerable section near the end of the thread being viewed, whether that is the parent or the child itself.
The child's own row shows its state, not a second copy of the same choices.
Answering it records the answer in that child's transcript at the point it arrived, shows the child saying what it does next, removes the obsolete choices and moves the child to `Running`.
The same answer is there when you open that child directly.
An answer cannot be given twice.

### Narrow pane and mobile

At the default 400px inspector width nothing is a three-column squeeze.
A Runs row is title plus status, then a full-width outcome line, then model and cost with a quiet `Open thread` action.
A work block puts its outcome below the name and status when space is tight, and keeps expanding the block separate from opening the thread.
Tool group labels take the available width and wrap to two lines; the count stays legible and the timestamp moves inside the expanded group.
While a run thread is open, the floating page-chat launcher is suppressed so it cannot sit on top of the transcript.
It is unchanged on every other screen, and `New chat` is untouched.

## What a run thread contains

The order is always the real order.

1. The Operator's assignment.
That is what the specialist was actually told, including any constraint that came from you.
2. The specialist's public updates.
Prose a person would say out loud.
No hidden reasoning is reproduced, and nothing is labelled as thinking.
3. Collapsible tool groups between the updates.
Each group names what it was doing and how many actions it took.
Inside, each row shows the command or file, what it was, its exit code, and its output.
4. Human steering at its actual position.
When you or a teammate interrupted a run, the message sits where it happened, marked as steering.
5. Findings.
A review finding is never behind a fold.
It shows severity, the claim, the explanation and the file and line.
6. The result and the handoff.
The result names the revision, the counts and the facts.
The handoff links to the run that received the work.

Long output genuinely expands.
A collapsed block shows twelve lines and the button states the real total, for example `Show all 23 lines` on the voice suite.
Expanding shows all of them.
Short output has no expander at all, and nothing is ever labelled a "full transcript" when it is a summary.
A failed command shows its real stderr and `exit 1`, immediately, in a red-toned block.

## Attempts

An attempt is a whole run of the work.
A failed command inside an attempt is not a new attempt, and the thread says so in words where it happens.

The attempt selector only appears when there is more than one attempt.
Thirteen of the fourteen runs in the sample have exactly one, and show no selector.
`BOT-250 · Implement · revision` has two, and switching between them shows two separate immutable records.
Attempt 1 stops at 15:34 when the Claude subscription window is exhausted, with Alex choosing to wait.
Attempt 2 resumes at 16:11 from the saved worktree.
Neither can be edited, and steering or a stop request only ever reaches the current attempt.

## Composers

The main composer is unchanged, including the user's latest labels: the plus menu, the model chip with its effort label, dictation, voice and send.
The run thread uses the same family at a smaller scale.
No agent selector was added, and the Build/Plan/Context selectors were not recreated below it.

Its controls are scoped to the run rather than delegating to the main composer.
Plus offers this run's own files and its revision, and an attached file appears as a chip on the run message.
Dictation writes into the run's draft.
Neither touches the main conversation composer, and an attachment belongs to the run it was added to.

- An **active** run gets a clearly labelled instruction composer and a stop control.
Sending appends to the live thread, marked as steering, and rewrites nothing above it.
A run only accepts steering while it is genuinely running: the current attempt, not stopped, and only from the member who owns its execution.
Everyone else gets the discussion instead.
- A **completed** run gets `Ask Operator about this run`.
That appends to a separate contextual discussion, shown in a dashed container marked private to you.
The run record is byte-identical before and after, and a different member sees none of it.

`Reply in thread` on an expanded work block opens that run's own discussion and focuses its composer.
It still records the V15 reply context, so anything that read `replyRun12` keeps working.

## Sample entry points

Open the preview dock (the four `V16 ·` options at the top of the list), or use these directly.

| Where | What you see |
| --- | --- |
| `BOT-241` conversation, any stage row | A compact block. `Open thread` is on every one of them. |
| `BOT-241` Runs tab, any of 7 rows | `Open thread` on every row, including the grouped `2 checks`. |
| `BOT-241 · Implement` | The primary example. 26 chronological entries: read the call path, a regression that fails with `exit 1` against the original code, the fix, Alex's steering at 09:12 about revoked access, two delegated checks, the full voice suite, and commit `4d912ae`. |
| `BOT-241 · Implement`, child block `2 checks` | Two parallel children under one compact block. Open either, then use the breadcrumb to return to the same place in the parent. |
| `BOT-241 · Review 1` | A changes-requested review with a high-severity finding at `voice/call-controller.ts:38` and the interleaving that proves it. |
| `BOT-241 · Verification` | 12 named checks on `8c42e1a`, and a `PR #1242` link with a `Back to Verification` strip. |
| `BOT-250 · Verification` | The second long example. 25 entries, live progress, a sharded command that fails with a missing fixture clock and is retried in the same attempt, a running browser child, and a waiting child. |
| `BOT-250 · Verification`, `Waiting on you` | A child paused on one stated question, with the two options that unblock it. |
| `BOT-250 · Implement · revision` | The only attempt selector in the sample. |

Nineteen threads are authored in total: fourteen stages across the two issues, and five delegated children.
Every one of them opens a real conversation, the shortest being six entries.
A run that a workflow decision has queued but not yet executed also opens a thread: it shows its assignment and then says plainly that nothing has run yet, rather than inventing a history.

## Navigation and state

- `Back` goes up exactly one level and says where: the parent run's name inside a child, `All runs` at the top level.
- Leaving a run for a file, PR or receipt carries the breadcrumb context with it, so returning from a child's files lands in the child with its parent still one step above.
- Folds are component state, not native `<details>`, so they survive closing and reopening the pane and visiting a child.
- The main conversation does not move when you open, read or close a run.
- `Expand all` / `Collapse all` reaches every tool group, child block and the Details section of the open thread, and reports which action it will perform.
- `Find in this thread` searches prose, commands and output, and reports `4 of 26` rather than silently hiding entries.
- Links to a PR, a file or the receipt use the existing inspector surfaces and leave a `Back to <run>` strip. Changing tab deliberately clears it.
- On mobile the inspector is already the full-width pane. The header stays fixed at the top so `Back` is reachable midway through a 26-entry transcript, run rows stack, and tool output drops to 10px rather than being squeezed.
- A shared run's Details name the funding category and the execution owner. The account label behind it resolves only for that owner, so another member never sees it.

## Fixture honesty

The scenarios are authored design examples based on the existing V15 issue facts.
The expanded commands, outputs, conversations and delegated checks are sample content, not captured production executions.
Models are `Claude Opus 5`, `Claude Sonnet 5`, `Claude Fable 5` and `GPT-6 Astra`.
`BOT-241` uses `PR #1242`, commits `4d912ae` and `8c42e1a`, `voice/session.ts`, `voice/call-controller.ts`, `pnpm test voice/session`, the 12 named checks and Emre's fast A to B to A request.
`BOT-250` has no pull request in the fixture, so its runs say `Working tree · receipt-funding-split` rather than inventing a commit.
Its facts are the `$0.42` estimate, the `$0.06` cloud credit, the 16:10 reset, `billing/receipt.ts`, `billing/receipt.test.ts`, `components/usage-receipt.tsx` and the twenty sample accounts.

All chat interaction is simulated.
Actions use sample state and do not execute tasks, authorize accounts or merge pull requests.

## How it is built

`v16-reference/prepare_base.py` lifted the user's live component out of `Workspace v15.dc.html` verbatim into `workspace-core-v16.js`, wrapped as `window.BotincWorkspaceBase16(DCLogic)`.
That file is not edited, and no legacy feature was removed from it to save bytes.

All V16 logic is in `workspace-runs-v16.js`, as `window.BotincRunWorkspace16 = (Base) => class extends Base {...}`.
It overrides `renderVals`, `componentDidMount`, `historyRows13`, `runRows12`, `openInspector10` and `openIssue`, and calls `super` in each.

`build_v16.py` makes exactly three edits to the exact current template, so every user edit in it survives byte for byte: the work block replaces the V13 burst, the Runs tab gains the thread, and one return strip is inserted at the top of the inspector content.
It refuses to run if the template, the DC tag or the extracted core has drifted from the live file.

The markup lives in three readable fragments under `v16-reference/`: `work-block.html`, `runs-pane.html` and `return-strip.html`.
`refine_visuals.py` records the first visual review pass over those fragments, with `runs-pane-first.html` kept as the pre-review version.

`Workspace v16.css` imports `Workspace base v16.css`, an exact copy of the current user stylesheet, then adds the V16 layer and the review layer in `host-ui.css`.
`Mobile base v16.css` is the current mobile artboard stylesheet with one substitution, so mobile inherits the edited desktop CSS instead of the older published copy.
Because the mobile artboard is 430px inside a desktop viewport, the small-screen rules are flattened into `Mobile v16.css` as well as carried in a media query.

## Checks

`python3 v16-reference/run_tests_v16.py` runs everything.

- 50 V16 behaviour checks: selecting runs, child and back navigation, folds, complete transcripts, genuine expansion, attempt isolation, steering and its ownership guard, the answerable child question, the private discussion, scoped composer controls, and the return path.
One of them is a wiring check: it reads every `onClick`, `onSubmit`, `onChange`, `onInput` and `onKeyDown` hole out of the V16 markup and asserts each one resolves to a real function in the state where that markup renders.
A passing suite is not a substitute for that, so the wiring is asserted directly.
- 15 V16 template checks: balanced control flow, dotted-lookup holes only, canonical HTML, icon coverage, and the 1 MiB request budget.
- 17 host journey checks, written independently against this build, including answering inside a child, metadata consistency, attachment sending and execution ownership.
- 224 inherited V13, V14 and V15 checks, re-pointed at the V16 build. Nothing in `v15-reference` or any earlier directory was edited.

306 of 306 pass, with no assertion suppressed or superseded.

These checks prove state transitions through the real component.
They are not a substitute for seeing the design render.
Visual verification, local and native, belongs to the host.

