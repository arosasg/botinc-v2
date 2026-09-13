/* eslint-disable */
// @ts-nocheck
/* BotInc V16 - conversation subagent blocks and full run threads.
 *
 * This file is the only V16 logic.  It extends the immutable V15 component
 * (window.BotincWorkspaceBase16) and adds:
 *
 *   1. a compact, expandable work block for every stage in the conversation;
 *   2. a complete run thread inside the existing resizable right inspector,
 *      with breadcrumbs to the parent run and back to all runs;
 *   3. linked child runs, including a parallel group and a waiting child;
 *   4. immutable attempts, a quiet Details section, and a contextual
 *      "Ask Operator about this run" discussion that never edits the record.
 *
 * Every transcript below is authored design fixture built from the facts that
 * already exist in the V15 component for BOT-241 and BOT-250 (models, PR #1242,
 * commits 4d912ae and 8c42e1a, the voice and receipt test commands, the two
 * reviewers, the subscription reset at 16:10).  No hidden reasoning is shown:
 * every prose entry is something the specialist would say out loud.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------ entries -- */
  function say(time, who, text, role) {
    return {k: 'say', time: time, who: who, text: text, role: role || 'agent'};
  }
  function op(time, text) { return say(time, 'Operator', text, 'operator'); }
  function person(time, who, text) { return say(time, who, text, 'human'); }
  function tools(time, label, meta, rows) {
    return {k: 'tools', time: time, label: label, meta: meta, rows: rows};
  }
  function finding(time, sev, title, text, where) {
    return {k: 'find', time: time, sev: sev, title: title, text: text, where: where};
  }
  function kids(time, label, runs) { return {k: 'kids', time: time, label: label, runs: runs}; }
  function result(time, title, text, facts) {
    return {k: 'result', time: time, title: title, text: text, facts: facts || []};
  }
  function handoff(time, text, to) { return {k: 'hand', time: time, text: text, to: to}; }
  function live(time, text) { return {k: 'live', time: time, text: text}; }

  /* ---------------------------------------------------------- tool rows -- */
  function read(title, meta, out) { return {op: 'read', title: title, meta: meta, out: out}; }
  function edit(title, meta, out) { return {op: 'edit', title: title, meta: meta, out: out}; }
  function cmd(title, meta, out, exit) {
    return {op: 'run', title: title, meta: meta, out: out, exit: exit == null ? 0 : exit};
  }
  function grep(title, meta, out) { return {op: 'search', title: title, meta: meta, out: out}; }
  function browse(title, meta, out) { return {op: 'browse', title: title, meta: meta, out: out}; }
  function diff(title, meta, out) { return {op: 'diff', title: title, meta: meta, out: out}; }

  var VOICE_SUITE = `$ pnpm test voice/session voice/call-controller

 PASS  voice/session.test.ts
  ✓ uses the selected workspace (34 ms)
  ✓ creates a new session id per call (11 ms)
  ✓ rejects revoked access (9 ms)
  ✓ keeps the conversation id across a workspace switch (12 ms)
  ✓ preserves the transcript when audio fails (8 ms)
  ✓ stops fetching tool data after access is revoked (14 ms)
 PASS  voice/call-controller.test.ts
  ✓ cancels a pending handshake on workspace change (21 ms)
  ✓ tears down previous audio before connecting (17 ms)
  ✓ surfaces a microphone denial with a recovery action (10 ms)
  ✓ retries once after a transient connection failure (26 ms)
  ✓ bounds concurrent starts to one live session (13 ms)

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
Time:        4.2 s

$ pnpm typecheck --filter voice
✓ voice: 0 errors
Process exited with code 0`;

  var RECEIPT_SUITE = `$ pnpm test billing/receipt

 PASS  billing/receipt.test.ts
  ✓ ledger replay is idempotent (7 ms)
  ✓ mixed funding uses actual charges (9 ms)
  ✓ replayed entries are counted once (6 ms)
  ✓ does not convert quota to dollars (5 ms)
  ✓ missing token counts stay null (4 ms)
  ✓ two identical timestamps remain two charges (8 ms)
  ✓ shared receipt excludes private account identity (11 ms)
  ✓ historical runs keep the account used at execution time (9 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Time:        2.6 s
Process exited with code 0`;

  /* ================================================================ runs == */
  /* Child runs, addressed by id from their parent thread. */
  var CHILDREN = {
    'BOT-241-R2-C1': {
      parent: 'BOT-241-R2', issue: 'BOT-241', stage: 'Voice test suite',
      model: 'Claude Sonnet 5', effort: 'Low', status: 'Passed', tone: 'done',
      outcome: '11 voice checks passed in 4.2s',
      started: 'Sep 10 · 09:13', ended: 'Sep 10 · 09:14', duration: '52s',
      commit: 'Working tree of 4d912ae', cost: 0.02, kind: 'Delegated check',
      entries: [
        op('09:13', 'Run the full voice suite against the working tree. Report failures verbatim. Do not change any file.'),
        say('09:13', 'Test runner', 'Running the two voice suites together so the controller and the session lifecycle are exercised in one process.'),
        tools('09:13', 'Ran the voice suites', '2 suites · 11 tests', [
          cmd('pnpm test voice/session voice/call-controller', 'botinc/app · 4.2s', VOICE_SUITE, 0)
        ]),
        say('09:14', 'Test runner', 'All eleven checks pass. The two slowest are the transient-failure retry at 26 ms and the handshake cancellation at 21 ms; both are deliberate waits on an event, not sleeps.'),
        tools('09:14', 'Checked for skipped or filtered tests', '1 command', [
          cmd('pnpm test voice --listTests --reporters=summary', 'botinc/app', `Found 2 test files, 11 tests, 0 skipped, 0 todo.
No test.only or describe.only in voice/.`, 0)
        ]),
        result('09:14', '11 passed · 0 failed · 0 skipped',
          'Nothing was filtered out. The suite ran every voice test the package defines.',
          [['Command', 'pnpm test voice/session voice/call-controller'], ['Exit code', '0'], ['Wall time', '4.2s']]),
        handoff('09:14', 'Returning the full output to the Implement run. No files were changed by this check.', 'BOT-241-R2')
      ]
    },
    'BOT-241-R2-C2': {
      parent: 'BOT-241-R2', issue: 'BOT-241', stage: 'Typecheck',
      model: 'Claude Sonnet 5', effort: 'Low', status: 'Passed', tone: 'done',
      outcome: '0 type errors in the voice package',
      started: 'Sep 10 · 09:13', ended: 'Sep 10 · 09:14', duration: '38s',
      commit: 'Working tree of 4d912ae', cost: 0.01, kind: 'Delegated check',
      entries: [
        op('09:13', 'Typecheck the voice package against the working tree. Report every error with its file and line.'),
        say('09:13', 'Typecheck', 'The new grant type is the risk here, so I am checking the package rather than only the changed files.'),
        tools('09:13', 'Typechecked the package', '1 command', [
          cmd('pnpm typecheck --filter voice', 'botinc/app · 38s', `> voice@ typecheck
> tsc --noEmit -p tsconfig.json

Checked 34 files in 31.8s.
✓ voice: 0 errors
Process exited with code 0`, 0)
        ]),
        say('09:14', 'Typecheck', 'Zero errors. createVoiceSession now requires workspaceId and grant, and every caller passes both.'),
        tools('09:14', 'Confirmed the new signature has no untyped callers', '1 search', [
          grep('createVoiceSession(', 'botinc/app · 3 matches', `voice/session.ts:14        const session = await createVoiceSession({
voice/session.test.ts:22   const call = await createVoiceSession({
voice/call-controller.ts:41  return createVoiceSession(next);`)
        ]),
        result('09:14', '0 errors · 34 files', 'No implicit any and no remaining call site using the old cached-session signature.',
          [['Command', 'pnpm typecheck --filter voice'], ['Exit code', '0']]),
        handoff('09:14', 'Returning a clean typecheck to the Implement run.', 'BOT-241-R2')
      ]
    },
    'BOT-250-R7-C1': {
      parent: 'BOT-250-R7', issue: 'BOT-250', stage: 'Ledger reconciliation',
      model: 'Claude Sonnet 5', effort: 'Medium', status: 'Passed', tone: 'done',
      outcome: 'Receipt total reconciles to $0.06 of cloud credit',
      started: 'Today · 09:07', ended: 'Today · 09:08', duration: '1m 04s',
      commit: 'Working tree · receipt-funding-split', cost: 0.03, kind: 'Delegated check',
      entries: [
        op('09:07', 'Reconcile the rendered receipt against the credit ledger for this conversation. Report any difference, however small.'),
        say('09:07', 'Reconciler', 'I am comparing three numbers: what the ledger deducted, what the receipt component renders, and what the shared issue payload exposes.'),
        tools('09:07', 'Read the ledger and the receipt', '2 files', [
          read('billing/receipt.ts', '+38 -14 · working diff', `export function totalCredit(entries) {
  const unique = new Map();
  for (const entry of entries) {
    unique.set(entry.ledgerEntryId, entry);
  }
  return [...unique.values()].reduce(
    (sum, entry) => sum + entry.chargedCredit, 0
  );
}`),
          read('components/usage-receipt.tsx', '+26 -18 · working diff', `<ReceiptTotal amount={receipt.creditCharged} />
<FundingRow label="Model work" value="Subscription" />
<FundingRow label="Cloud compute" amount={receipt.compute} />
<RunLedger entries={receipt.runs} />`)
        ]),
        tools('09:08', 'Compared the totals', '1 command', [
          cmd('pnpm billing:reconcile --task BOT-250', 'botinc/app · 21s', `ledger deductions      : 0.06  (1 entry, cloud compute)
receipt.creditCharged  : 0.06
model work             : subscription-funded, 0 credit
tokens reported        : 2 of 7 runs (5 providers reported no counts)
difference             : 0.00
Process exited with code 0`, 0)
        ]),
        say('09:08', 'Reconciler', 'The difference is zero. The earlier $0.42 came from an estimated model cost that was never deducted; that estimate no longer reaches the total.'),
        say('09:08', 'Reconciler', 'Five of the seven runs report no token counts. Those stay null in the payload and render as "Not reported", not as zero.'),
        result('09:08', 'Reconciled · difference $0.00',
          'The receipt total equals the ledger. Subscription-funded model work contributes no credit, and unreported token counts are not coerced to zero.',
          [['Ledger', '$0.06'], ['Receipt', '$0.06'], ['Difference', '$0.00']]),
        handoff('09:08', 'Returning the reconciliation to the Verification run.', 'BOT-250-R7')
      ]
    },
    'BOT-250-R7-C2': {
      parent: 'BOT-250-R7', issue: 'BOT-250', stage: 'Browser check · 20 accounts',
      model: 'Claude Sonnet 5', effort: 'Medium', status: 'Running', tone: 'running',
      outcome: 'Walking the account list at 430px',
      started: 'Today · 09:08', ended: '', duration: '1m 46s so far',
      commit: 'Working tree · receipt-funding-split', cost: 0.04, kind: 'Delegated browser check',
      entries: [
        op('09:08', 'Open the account list at 430px with all twenty sample accounts. Confirm the exhausted account is findable without horizontal scrolling, and that status stays visible on every row.'),
        say('09:08', 'Browser check', 'I will walk the list top to bottom at 430px, then use the search field and the needs-attention filter, and record what is visible at each step.'),
        tools('09:08', 'Opened the account view', '2 steps', [
          browse('Set viewport 430 × 932', 'Simulated browser · design fixture', 'Viewport applied. Device pixel ratio 3.'),
          browse('Opened Usage → Model accounts', '/console/usage/accounts', `20 accounts rendered in 4 provider groups.
Claude 9 · Codex 6 · Cursor 1 · OpenRouter 1 · sample rows 3`)
        ]),
        say('09:09', 'Browser check', 'Every row keeps its status chip at 430px. The identity line truncates with an ellipsis rather than wrapping, which keeps the row height at 52px.'),
        tools('09:09', 'Found the exhausted account', '3 steps', [
          browse('Typed "Support" into the account search', 'Search field', '1 of 20 accounts match. Row is visible without scrolling.'),
          browse('Cleared the search, pressed "Needs attention"', 'Status filter', `3 accounts match: Support (At limit), Release (At limit), Weekend (Reconnect).
No horizontal scrollbar on the container.`),
          browse('Opened the Support account', 'Account detail', `SESSION 100% used · resets Today · 16:10
WEEK 100% used · resets Mon, Sep 14 · 09:00
FABLE 100% used · resets Tue, Sep 15 · 12:00`)
        ]),
        live('09:10', 'Checking the provider group headers with the keyboard only. Two of four groups reached so far.'),
        say('09:10', 'Browser check', 'Nothing to report yet on the keyboard pass. I will send the full tab order when the last group is reached.'),
        handoff('', 'This check is still running. Its result will be attached to the Verification run when the keyboard pass finishes.', 'BOT-250-R7')
      ]
    },
    'BOT-250-R7-C3': {
      parent: 'BOT-250-R7', issue: 'BOT-250', stage: 'Expired usage samples',
      model: 'Claude Sonnet 5', effort: 'Medium', status: 'Waiting on you', tone: 'needs',
      outcome: 'Blocked on one product decision',
      started: 'Today · 09:08', ended: '', duration: 'Waiting 2m',
      commit: 'Working tree · receipt-funding-split', cost: 0.01, kind: 'Delegated check',
      question: 'An account whose usage sample is older than 24 hours: should it stay in the "Needs attention" filter as a stale row, or drop out of that filter until its usage is refreshed?',
      questionWhy: 'Two sample accounts are in this state. The filter is how you find an exhausted account, so the answer changes whether a stale row can hide a real limit.',
      options: ['Keep it, marked stale', 'Drop it until refreshed'],
      entries: [
        op('09:08', 'Check how the account list behaves when a usage sample is older than the provider window it describes. Two sample accounts are in that state.'),
        say('09:08', 'Stale-usage check', 'The rendering is already decided: an old sample shows "Last reported" instead of a percentage, and never renders as 0%.'),
        tools('09:08', 'Read the freshness rules', '1 file · 1 search', [
          read('billing/account-usage.ts', 'freshness window', `const FRESH_MS = 24 * 60 * 60 * 1000;
export const isFresh = (sample) =>
  sample && Date.now() - sample.capturedAt < FRESH_MS;`),
          grep('accountFresh(', 'botinc/app · 4 matches', `components/account-row.tsx:31   const fresh = accountFresh(account);
components/account-detail.tsx:18 accountFresh(account) ? windows : lastReported
billing/routing.ts:64           if (!accountFresh(account)) return "refresh";
billing/routing.test.ts:22      expect(accountFresh(stale)).toBe(false);`)
        ]),
        say('09:09', 'Stale-usage check', 'What is not decided is the filter. Routing already refuses a stale account, so a stale row is not safe to hide - but a stale row that is actually fine will crowd the filter you use to find a real limit.'),
        say('09:09', 'Stale-usage check', 'I am not going to pick one. This is a product decision about how the filter is read, and both behaviors pass the tests I would write.'),
        handoff('', 'Paused with the question above. Nothing has been changed and no further credit is being used while this waits.', 'BOT-250-R7')
      ]
    }
  };

  /* ------------------------------------------------------- BOT-241 runs -- */
  var THREADS = {
    'BOT-241-R1': {
      issue: 'BOT-241', effort: 'High', source: 'Operator assignment',
      outcome: 'Cached session is created before the workspace switch completes',
      commit: 'Read-only · no commit', assignment: 'Trace the failing call',
      entries: [
        op('09:02', 'Alex reports that a voice call fails when switching from Product to Engineering, with credit available. Trace the call from workspace selection to audio connection and tell me where the workspace is actually decided. Change nothing.'),
        say('09:03', 'Planner', 'Reading the call path first. I want the exact order of workspace selection, grant fetch, and session creation before I form any theory.'),
        tools('09:03', 'Read the call path', '4 files', [
          read('voice/session.ts', '86 lines', `async function startCall(workspace) {
  const session = cachedSession;
  return connectAudio(session);
}`),
          read('voice/call-controller.ts', '142 lines', `async function onWorkspaceChange(next) {
  activeWorkspace = next;
}`),
          read('voice/grants.ts', '61 lines', `export async function getWorkspaceGrant(workspaceId) {
  return grantCache.get(workspaceId) ?? fetchGrant(workspaceId);
}`),
          read('billing/eligibility.ts', '94 lines', `export function canStartCall(member) {
  return hasCredit(member) && hasWorkspaceGrant(member);
}`)
        ]),
        say('09:03', 'Planner', 'The session is read from cachedSession, which is populated at sign-in and never invalidated when the workspace changes. onWorkspaceChange only assigns a variable.'),
        tools('09:04', 'Followed three call paths into startCall', '1 search', [
          grep('startCall(', 'botinc/app · 3 call sites', `voice/call-controller.ts:88   await startCall(activeWorkspace);
components/call-button.tsx:24 onClick={() => startCall(workspace)}
voice/session.test.ts:11      const call = await startCall(workspaceA);`)
        ]),
        say('09:04', 'Planner', 'Two of the three call sites pass a workspace argument that startCall then ignores. That is the defect: the argument exists and is discarded.'),
        finding('09:04', 'high', 'The workspace argument is ignored',
          'startCall takes a workspace and then reads cachedSession instead. Any call after a workspace switch reuses the previous workspace’s session and grant.',
          'voice/session.ts:12'),
        finding('09:04', 'medium', 'A handshake in flight can outlive the switch',
          'onWorkspaceChange does not cancel a pending handshake, so a connection started in the old workspace can resolve after the user has moved.',
          'voice/call-controller.ts:38'),
        say('09:05', 'Planner', 'The billing check is downstream of both problems. canStartCall passes here, so the credit balance is not what fails the call - the error surfaces as an access failure with a funding message.'),
        result('09:05', 'Two defects, one of them a race',
          'The cached session is the direct cause. The uncancelled handshake is a second, timing-dependent path to the same wrong workspace, and it will not be caught by a test that switches slowly.',
          [['Files read', '4'], ['Call paths followed', '3'], ['Product decision needed', 'What happens when access is revoked mid-call']]),
        op('09:05', 'Recorded. I will ask Alex about revoked access before the implementation reaches that branch.'),
        handoff('09:05', 'Handing the trace to the Implement run with both findings and the instruction to reproduce before changing the lifecycle.', 'BOT-241-R2')
      ]
    },

    'BOT-241-R2': {
      issue: 'BOT-241', effort: 'Medium', source: 'BOT-241-R1',
      outcome: 'Fresh grant per call, transcript preserved, 11 checks green',
      commit: '4d912ae', assignment: 'Bind the session to the selected workspace',
      children: ['BOT-241-R2-C1', 'BOT-241-R2-C2'],
      entries: [
        op('09:06', 'Take the plan run’s trace. Reproduce the failure first, then bind each new session to the selected workspace. Keep the conversation intact - only the voice session and its grant may be replaced. Use Alex’s connections and return evidence with the result.'),
        say('09:06', 'Implementer', 'I will write the failing test before I touch the lifecycle, so there is proof the fix is what changed the behavior and not the test.'),
        tools('09:06', 'Read the three files I expect to change', '3 files', [
          read('voice/session.ts', '86 lines · lines 8-24', `async function startCall(workspace) {
  const session = cachedSession;
  return connectAudio(session);
}`),
          read('voice/session.test.ts', '48 lines', `test("connects audio", async () => {
  const call = await startCall(workspaceA);
  expect(call.connected).toBe(true);
});`),
          read('voice/call-controller.ts', '142 lines · lines 30-48', `async function onWorkspaceChange(next) {
  activeWorkspace = next;
}`)
        ]),
        say('09:07', 'Implementer', 'Reproduced the failure before changing the session lifecycle. A call started in Product finishes its handshake after Engineering is selected, and the next connection receives Product’s cached session.'),
        tools('09:07', 'Ran the new regression against the original code', '1 command · exit 1', [
          cmd('pnpm test voice/session -t "uses the selected workspace"', 'botinc/app · expected failure', `$ pnpm test voice/session -t "uses the selected workspace"

 FAIL  voice/session.test.ts
  ✕ uses the selected workspace (18 ms)

  ● uses the selected workspace

    expect(received).toBe(expected)

    Expected: "ws_engineering"
    Received: "ws_product"

      at voice/session.test.ts:19:32

Tests:       1 failed, 1 total
Process exited with code 1`, 1)
        ]),
        say('09:07', 'Implementer', 'That failure is the bug, stated as an assertion: the second call returns ws_product. This test has to go red before the fix and green after it.'),
        tools('09:08', 'Bound the session to the selected workspace', '1 file', [
          edit('voice/session.ts', '+12 -4', `  async function startCall(workspace) {
-   const session = cachedSession;
+   await endPreviousAudio();
+   const grant = await getWorkspaceGrant(workspace.id);
+   const session = await createVoiceSession({
+     workspaceId: workspace.id,
+     grant,
+   });
    return connectAudio(session);
  }`)
        ]),
        say('09:09', 'Implementer', 'Bound the new session to the selected workspace. The connection now closes previous audio, fetches a grant for the selected workspace, and creates a new session.'),
        tools('09:09', 'Re-ran the same focused test', '1 command', [
          cmd('pnpm test voice/session -t "uses the selected workspace"', 'botinc/app · 1.1s', `$ pnpm test voice/session -t "uses the selected workspace"

 PASS  voice/session.test.ts
  ✓ uses the selected workspace (21 ms)

Tests:       1 passed, 1 total
Process exited with code 0`, 0)
        ]),
        say('09:09', 'Implementer', 'The transcript and conversation IDs are untouched. Only the session id changes, which is what I want: the same conversation, a new voice session.'),
        tools('09:10', 'Added the coverage the plan asked for', '1 file', [
          edit('voice/session.test.ts', '+10 -2', `+ test("uses the selected workspace", async () => {
+   const first = await startCall(workspaceA);
+   const next = await startCall(workspaceB);
+   expect(next.workspaceId).toBe(workspaceB.id);
+   expect(next.id).not.toBe(first.id);
+ });
+ test("rejects revoked access", async () => {
+   await revokeAccess(workspaceA);
+   await expect(startCall(workspaceA)).rejects.toThrow();
+ });`)
        ]),
        say('09:10', 'Implementer', 'The revoked-access test asserts that the call is refused, but it does not say what happens to a call that is already live. I need a decision before I write that branch.'),
        op('09:11', 'The first fix passes the selected-workspace test. Before I continue: if someone loses access during a call, should the call end immediately or finish the current response?'),
        person('09:12', 'Alex', 'End immediately. Keep the transcript that we already had, but do not keep fetching data from that workspace.'),
        op('09:12', 'Saved: revoked access ends audio and stops new tool calls. Existing messages remain visible according to the conversation’s permissions. Continue on that basis.'),
        say('09:12', 'Implementer', 'Applying that now. "Stops new tool calls" is the part that needs its own assertion - ending audio is not enough if the session can still read workspace data.'),
        tools('09:13', 'Implemented the revoked-access teardown', '2 files', [
          edit('voice/session.ts', '+6 -0', `+ grant.onRevoked(() => {
+   endAudio({ keepTranscript: true });
+   session.blockToolCalls();
+ });`),
          edit('voice/session.test.ts', '+8 -0', `+ test("stops fetching tool data after access is revoked", async () => {
+   const call = await startCall(workspaceA);
+   await revokeAccess(workspaceA);
+   expect(call.transcript).toHaveLength(3);
+   await expect(call.readWorkspaceFile("a.md")).rejects.toThrow();
+ });`)
        ]),
        kids('09:13', '2 checks', ['BOT-241-R2-C1', 'BOT-241-R2-C2']),
        say('09:14', 'Implementer', 'Added revoked-access and reconnect coverage. The call tears down before audio reconnects with an invalid grant. Tests cover switching, revocation, microphone denial, and a transient connection failure.'),
        tools('09:14', 'Ran the whole voice suite myself before handing over', '2 commands', [
          cmd('pnpm test voice/session voice/call-controller', 'botinc/app · 4.2s', VOICE_SUITE, 0)
        ]),
        say('09:14', 'Implementer', 'Eleven checks, no skips. The delegated runs above reached the same result independently, which is why I am not treating my own green run as the only evidence.'),
        tools('09:15', 'Staged the revision', '2 commands', [
          diff('git diff --stat', '3 files changed', `voice/session.ts          | 16 ++++++++++----
voice/session.test.ts     | 18 +++++++++++++++++
voice/call-controller.ts  |  4 ++--
3 files changed, 34 insertions(+), 6 deletions(-)`),
          cmd('git commit -m "Bind voice session to selected workspace"', 'botinc/app', `[voice-workspace-session 4d912ae] Bind voice session to selected workspace
 3 files changed, 34 insertions(+), 6 deletions(-)`, 0)
        ]),
        result('09:15', 'Revision 4d912ae · 3 files · 11 checks',
          'Each call fetches a grant for the selected workspace and creates a new session. Revoked access ends audio, keeps the transcript, and blocks further tool calls. The conversation id is unchanged across a switch.',
          [['Commit', '4d912ae'], ['Files changed', '3'], ['Checks', '11 passed, 0 skipped'], ['Delegated checks', '2 passed']]),
        say('09:15', 'Implementer', 'One thing I have not proved: whether a handshake that resolves late can still attach the old transport. My switch test is synchronous, so it would not catch that. I am flagging it rather than claiming it is covered.'),
        op('09:15', 'Noted, and that is exactly what the first review is scoped to. The implementation is ready for an independent review focused on race conditions and workspace authority.'),
        handoff('09:15', 'Handing 4d912ae to Review 1 with the open question about late handshakes attached.', 'BOT-241-R3')
      ]
    },

    'BOT-241-R3': {
      issue: 'BOT-241', effort: 'High', source: 'BOT-241-R2',
      outcome: 'Changes requested · late handshake can reconnect old audio',
      commit: 'Reviewed 4d912ae', assignment: 'Independent review · races and authority',
      entries: [
        op('09:15', 'Review 4d912ae independently. Scope: race conditions and workspace authority. You have the implementer’s own note that late handshakes are not covered. Do not edit any file.'),
        say('09:16', 'Reviewer', 'Reading the diff first without the tests, so my reading of the lifecycle is not shaped by what the tests already assert.'),
        tools('09:16', 'Read the changed files at 4d912ae', '3 files', [
          read('voice/session.ts', '+12 -4 at 4d912ae', `await endPreviousAudio();
const grant = await getWorkspaceGrant(workspace.id);
const session = await createVoiceSession({ workspaceId: workspace.id, grant });
return connectAudio(session);`),
          read('voice/call-controller.ts', '+2 -2 at 4d912ae', `async function onWorkspaceChange(next) {
  await stopAudioForPreviousWorkspace();
  activeWorkspace = next;
}`),
          read('voice/session.test.ts', '+10 -2 at 4d912ae', `const first = await startCall(workspaceA);
const next = await startCall(workspaceB);
expect(next.workspaceId).toBe(workspaceB.id);`)
        ]),
        say('09:16', 'Reviewer', 'The awaits in startCall are sequential, so between endPreviousAudio and connectAudio there are two suspension points. Anything that resolves during those points is not accounted for.'),
        tools('09:17', 'Constructed the interleaving by hand', '1 command · exit 1', [
          cmd('pnpm test voice/scratch -t "deferred handshake"', 'reviewer scratch fixture', `$ pnpm test voice/scratch -t "deferred handshake"

 FAIL  voice/scratch.test.ts
  ✕ deferred handshake does not reconnect (23 ms)

  ● deferred handshake does not reconnect

    expect(received).toBe(expected)

    Expected: "ws_engineering"
    Received: "ws_product"

    A handshake started in workspaceA resolved after the switch and
    attached its transport to the active call.

Tests:       1 failed, 1 total
Process exited with code 1`, 1)
        ]),
        finding('09:17', 'high', 'A late handshake can attach the previous transport',
          'A promise started before the switch can resolve after teardown and connect audio for the previous workspace. Guard each start with a generation token and invalidate it on workspace change.',
          'voice/call-controller.ts:38'),
        say('09:17', 'Reviewer', 'This is the implementer’s own open question, confirmed with a failing case rather than left as a suspicion. The existing switch test passes because it never lets an old promise resolve late.'),
        tools('09:18', 'Checked whether authority is re-read anywhere else', '1 search', [
          grep('activeWorkspace', 'botinc/app · 6 matches', `voice/call-controller.ts:39   activeWorkspace = next;
voice/call-controller.ts:88   await startCall(activeWorkspace);
voice/session.ts:31           if (session.workspaceId !== activeWorkspace.id) return;
voice/transcript.ts:12        workspaceId: activeWorkspace.id,
components/call-button.tsx:24 startCall(activeWorkspace);
voice/call-controller.test.ts:9 activeWorkspace = workspaceA;`)
        ]),
        say('09:18', 'Reviewer', 'voice/transcript.ts also reads activeWorkspace at write time. That is correct today, but it means the generation token has to be checked before the transcript line is written, not only before audio connects.'),
        result('09:18', 'Changes requested · 1 high finding',
          'The workspace binding itself is right. The gap is a timing one: nothing invalidates work that was already in flight when the workspace changed.',
          [['Reviewed', '4d912ae'], ['Findings', '1 high, 0 medium'], ['Files read', '3'], ['Verdict', 'Changes requested']]),
        op('09:18', 'The reviewer found a timing gap that the normal switch test missed. I am sending that finding back to implementation in this conversation.'),
        handoff('09:18', 'Returning to implementation with the failing interleaving attached.', 'BOT-241-R4')
      ]
    },

    'BOT-241-R4': {
      issue: 'BOT-241', effort: 'Medium', source: 'BOT-241-R3',
      outcome: 'Generation guard drops late responses, including A → B → A',
      commit: '8c42e1a', assignment: 'Apply the review finding',
      entries: [
        op('09:18', 'Review 1 requested changes: a late handshake can attach the previous transport. Reproduce it in the real suite, then guard it. Emre has also asked for the fast A → B → A case.'),
        person('09:19', 'Emre', 'Please include the fast A → B → A switch. We have seen that on slower connections.'),
        say('09:19', 'Implementer', 'A → B → A is the harder case, because a naive "is this still the active workspace" check passes again once you switch back. A generation token is the only guard that survives it.'),
        tools('09:20', 'Built a controlled promise fixture', '1 file', [
          edit('voice/handshake.fixture.ts', '+41 -0', `+ export function deferredHandshake() {
+   let release;
+   const promise = new Promise((r) => (release = r));
+   return { promise, release };
+ }`)
        ]),
        tools('09:20', 'Reproduced both interleavings against the current code', '1 command · exit 1', [
          cmd('pnpm test voice/call-controller -t "generation"', 'botinc/app · expected failure', `$ pnpm test voice/call-controller -t "generation"

 FAIL  voice/call-controller.test.ts
  ✕ drops a handshake from a previous workspace (19 ms)
  ✕ drops a handshake from a previous generation of the same workspace (22 ms)

  ● drops a handshake from a previous generation of the same workspace

    A → B → A: the handshake started in the first A generation
    resolved and attached, because the workspace id matched again.

Tests:       2 failed, 2 total
Process exited with code 1`, 1)
        ]),
        say('09:20', 'Implementer', 'Reproduced the reviewer’s race with deferred handshakes. Both fail if an old generation is allowed to reconnect, and the second is Emre’s A → B → A case.'),
        tools('09:21', 'Added the generation guard', '1 file', [
          edit('voice/call-controller.ts', '+14 -2', `+ let generation = 0;
  async function onWorkspaceChange(next) {
+   generation += 1;
+   await cancelPendingHandshake();
    await stopAudioForPreviousWorkspace();
    activeWorkspace = next;
  }
+ async function startCall(workspace) {
+   const mine = generation;
+   const session = await createSession(workspace);
+   if (mine !== generation) return session.discard();
+   return connectAudio(session);
+ }`)
        ]),
        tools('09:21', 'Re-ran the two race regressions', '1 command', [
          cmd('pnpm test voice/call-controller -t "generation"', 'botinc/app · 1.4s', `$ pnpm test voice/call-controller -t "generation"

 PASS  voice/call-controller.test.ts
  ✓ drops a handshake from a previous workspace (16 ms)
  ✓ drops a handshake from a previous generation of the same workspace (18 ms)

Tests:       2 passed, 2 total
Process exited with code 0`, 0)
        ]),
        say('09:22', 'Implementer', 'The delayed response is now discarded, including a fast switch back to the original workspace. I also moved the guard ahead of the transcript write, per the reviewer’s note about voice/transcript.ts.'),
        tools('09:23', 'Ran the full suite', '1 command · 1 unrelated failure', [
          cmd('pnpm test voice', 'botinc/app · 5.8s', `$ pnpm test voice

 PASS  voice/session.test.ts (11 tests)
 FAIL  voice/reconnect.test.ts
  ✕ reconnects after a transient failure (2014 ms)

  ● reconnects after a transient failure

    Exceeded timeout of 2000 ms.
    The test waits on a fixed setTimeout rather than the connection event.

Tests:       1 failed, 12 passed, 13 total
Process exited with code 1`, 1)
        ]),
        say('09:24', 'Implementer', 'Validation caught an unrelated timing assumption in the reconnect test: it waited on a fixed timeout rather than the connection event. Product behavior is unchanged; the fixture was wrong.'),
        tools('09:24', 'Fixed the fixture and re-ran', '2 steps', [
          edit('voice/reconnect.test.ts', '+3 -2', `- await new Promise((r) => setTimeout(r, 500));
+ await once(call, "connected");`),
          cmd('pnpm test voice', 'botinc/app · 4.6s', `$ pnpm test voice

 PASS  voice/session.test.ts (11 tests)
 PASS  voice/call-controller.test.ts (2 tests)
 PASS  voice/reconnect.test.ts (1 test)

Tests:       14 passed, 14 total
Process exited with code 0`, 0)
        ]),
        tools('09:24', 'Committed the revision', '1 command', [
          cmd('git commit -m "Cancel stale handshake before reconnecting"', 'botinc/app', `[voice-workspace-session 8c42e1a] Cancel stale handshake before reconnecting
 3 files changed, 58 insertions(+), 6 deletions(-)`, 0)
        ]),
        result('09:24', 'Revision 8c42e1a · race closed',
          'A handshake from any previous generation is discarded, including a switch back to the original workspace. The reconnect test now waits on the connection event.',
          [['Commit', '8c42e1a'], ['Race regressions added', '2'], ['Emre’s A → B → A case', 'Covered'], ['Unrelated fixture fixed', 'voice/reconnect.test.ts']]),
        handoff('09:24', 'Handing 8c42e1a to the second review, scoped to recovery behavior and the user-visible error states.', 'BOT-241-R5')
      ]
    },

    'BOT-241-R5': {
      issue: 'BOT-241', effort: 'High', source: 'BOT-241-R4',
      outcome: 'Approved · no correctness findings, one wording suggestion',
      commit: 'Reviewed 8c42e1a', assignment: 'Independent review · recovery and error states',
      entries: [
        op('09:25', 'Second independent review of 8c42e1a. Different scope from the first: recovery behavior and what the user actually sees when a call fails. Alex also asked whether a free workspace with available credit can make a call.'),
        say('09:26', 'Reviewer', 'I am going to separate the three reasons a call can fail - credit, workspace permission, and a transient connection problem - and check that each produces its own message.'),
        tools('09:26', 'Read the eligibility and error paths', '3 files', [
          read('billing/eligibility.ts', '94 lines at 8c42e1a', `export function canStartCall(member) {
  if (!hasCredit(member)) return { ok: false, reason: "funding" };
  if (!hasWorkspaceGrant(member)) return { ok: false, reason: "access" };
  return { ok: true };
}`),
          read('voice/errors.ts', '52 lines at 8c42e1a', `export const CALL_ERRORS = {
  funding: "You are out of credit for this task.",
  access: "You no longer have access to this workspace.",
  transient: "The connection dropped. Try again.",
};`),
          read('components/call-error.tsx', '+9 -3 at 8c42e1a', `<CallError reason={error.reason} onRetry={retry} />`)
        ]),
        say('09:27', 'Reviewer', 'The three reasons are distinct in the model and distinct in the copy. None of them is presented as "request access" to a beta, which is what made the original report confusing.'),
        tools('09:28', 'Walked five recovery states', '1 command', [
          cmd('pnpm test voice/errors', 'botinc/app · 1.9s', `$ pnpm test voice/errors

 PASS  voice/errors.test.ts
  ✓ funded free workspace reaches connection (12 ms)
  ✓ empty balance stops before a session is opened (8 ms)
  ✓ revoked grant produces an access message (9 ms)
  ✓ transient failure produces a retry message (7 ms)
  ✓ microphone denial produces a permission message (10 ms)

Tests:       5 passed, 5 total
Process exited with code 0`, 0)
        ]),
        say('09:28', 'Reviewer', 'Reviewed recovery behavior and the user-visible error states. A valid funded call does not hit a plan gate. Revoked grants produce an access message; missing credit produces a funding message.'),
        finding('09:29', 'low', 'The recovery action is the same for every reason',
          'All five states offer a single "Try again" button. A revoked grant is not retryable from the same workspace, so that action should read "Switch workspace" for the access reason.',
          'components/call-error.tsx:18'),
        say('09:29', 'Reviewer', 'That is a wording finding, not a correctness one. I am approving the revision; the copy can change without another review round.'),
        result('09:29', 'Approved on 8c42e1a · 0 correctness findings',
          'Credit, permission and connection failures are distinguished end to end. One suggestion: offer "Try again" for a transient error and "Switch workspace" for revoked access.',
          [['Reviewed', '8c42e1a'], ['Recovery states checked', '5'], ['Correctness findings', '0'], ['Verdict', 'Approved']]),
        op('09:30', 'The second reviewer has no correctness findings. One wording suggestion, which I will apply before the final check.'),
        handoff('09:30', 'Approving 8c42e1a and passing the wording suggestion to the follow-up run.', 'BOT-241-R6')
      ]
    },

    'BOT-241-R6': {
      issue: 'BOT-241', effort: 'Low', source: 'BOT-241-R5',
      outcome: 'Recovery copy applied, transcript persistence verified',
      commit: '8c42e1a', assignment: 'Apply the approved wording',
      entries: [
        op('09:31', 'Apply the second reviewer’s wording suggestion. Alex confirmed the actions and added one requirement: the transcript must never disappear when the call fails.'),
        person('09:31', 'Alex', 'Yes, use those actions. Make sure the transcript never disappears when the call fails.'),
        say('09:32', 'Implementer', 'Two changes: the action label depends on the failure reason, and the error surface renders above the conversation rather than replacing it.'),
        tools('09:32', 'Applied the recovery copy', '1 file', [
          edit('components/call-error.tsx', '+11 -4', `- <Button onClick={retry}>Try again</Button>
+ {reason === "access"
+   ? <Button onClick={switchWorkspace}>Switch workspace</Button>
+   : <Button onClick={retry}>Try again</Button>}`)
        ]),
        tools('09:32', 'Kept the conversation visible behind the failure', '1 file', [
          edit('components/call-surface.tsx', '+6 -9', `- {error ? <CallError /> : <Conversation />}
+ <Conversation />
+ {error && <CallErrorOverlay reason={error.reason} />}`)
        ]),
        say('09:33', 'Implementer', 'The error surface uses the specific failure reason and keeps the conversation visible behind the call. Closing the call returns to the same message position.'),
        tools('09:33', 'Verified transcript persistence', '1 command', [
          cmd('pnpm test voice/transcript', 'botinc/app · 1.6s', `$ pnpm test voice/transcript

 PASS  voice/transcript.test.ts
  ✓ transcript survives an access failure (11 ms)
  ✓ transcript survives a transient failure (9 ms)
  ✓ closing the call restores the scroll position (14 ms)

Tests:       3 passed, 3 total
Process exited with code 0`, 0)
        ]),
        say('09:33', 'Implementer', 'Three checks, including the scroll position. No source file outside components/ changed, so the approved revision 8c42e1a is still the reviewed logic.'),
        result('09:33', 'Copy applied · logic unchanged',
          'Only presentation changed. The reviewed session and controller code at 8c42e1a is untouched, so the approval still applies to the shipped logic.',
          [['Files changed', '2 (both components)'], ['Reviewed logic changed', 'No'], ['Checks', '3 passed']]),
        op('09:34', 'I have applied that wording. The PR has three changed files. I am re-running the checks on the exact revision that will be reviewed.'),
        handoff('09:34', 'Handing the final revision to Verification.', 'BOT-241-R7')
      ]
    },

    'BOT-241-R7': {
      issue: 'BOT-241', effort: 'Medium', source: 'BOT-241-R6',
      outcome: 'All 12 checks pass on 8c42e1a',
      commit: '8c42e1a', assignment: 'Final checks on the reviewed revision',
      entries: [
        op('09:34', 'Run every check on 8c42e1a - the exact revision that will be reviewed and merged. Report the checks by name, not as a count.'),
        say('09:34', 'Verifier', 'Checking out 8c42e1a rather than the working tree, so the result is tied to a revision instead of to whatever is on disk.'),
        tools('09:34', 'Checked out the reviewed revision', '1 command', [
          cmd('git checkout 8c42e1a --detach', 'botinc/app', `HEAD is now at 8c42e1a Cancel stale handshake before reconnecting
Working tree clean.`, 0)
        ]),
        tools('09:35', 'Ran the full check set', '1 command · 12 checks', [
          cmd('pnpm check --filter voice', 'botinc/app · 11.4s', `$ pnpm check --filter voice

 ✓ Selected workspace binds the new session
 ✓ Revoked access blocks connection
 ✓ Stale sessions cannot use previous authority
 ✓ Conversation stays intact
 ✓ Reconnect after transient failure
 ✓ Microphone denial has a recovery action
 ✓ Free credit can fund calls
 ✓ Empty balance stops before connection
 ✓ Disconnect releases audio
 ✓ Workspace switch cancels old handshake
 ✓ Concurrent starts are bounded
 ✓ Typecheck

12 passed, 0 failed, 0 skipped · 11.4s
Process exited with code 0`, 0)
        ]),
        say('09:35', 'Verifier', 'All 12 checks pass on 8c42e1a. Named individually above so a reader can see which behaviors are actually covered rather than trusting a total.'),
        tools('09:35', 'Confirmed the checks belong to this revision', '1 command', [
          cmd('git rev-parse HEAD && pnpm check --print-head', 'botinc/app', `8c42e1a2f0b4c918d3e0c7a55b19d4e3f6a1c802
check head: 8c42e1a
approval head: 8c42e1a
Process exited with code 0`, 0)
        ]),
        say('09:36', 'Verifier', 'The check head and the approval head are the same commit. If another commit lands, this result stops applying and the review has to run again.'),
        tools('09:36', 'Summarised the pull request state', '1 command', [
          cmd('gh pr view 1242 --json state,files,reviews', 'botinc/app · read-only', `{
  "state": "OPEN",
  "files": ["voice/session.ts", "voice/session.test.ts", "voice/call-controller.ts"],
  "reviews": [
    { "author": "Review 1 · GPT-6 Astra", "state": "CHANGES_REQUESTED", "head": "4d912ae" },
    { "author": "Review 2 · Claude Fable 5", "state": "APPROVED", "head": "8c42e1a" }
  ]
}`, 0)
        ]),
        result('09:36', '12 passed · 0 failed · tied to 8c42e1a',
          'Selected workspace, revoked access, stale authority, conversation continuity, reconnect, microphone denial, free credit, empty balance, disconnect, canceled handshake, concurrent starts, and typecheck.',
          [['Revision', '8c42e1a'], ['Checks', '12 passed, 0 failed'], ['Pull request', 'PR #1242 · open'], ['Merged', 'No - waiting for Alex']]),
        op('09:36', 'Ready for your review. Nothing has been merged.'),
        handoff('09:36', 'Returning the checked revision to the conversation. Merge is Alex’s decision.', '')
      ]
    },

    /* --------------------------------------------------- BOT-250 runs -- */
    'BOT-250-R1': {
      issue: 'BOT-250', effort: 'High', source: 'Operator assignment',
      outcome: 'Summary combines model estimates with actual deductions',
      commit: 'Read-only · no commit', assignment: 'Trace the receipt pipeline',
      entries: [
        op('15:03', 'Alex sees $0.42 for model work on a receipt that a Claude subscription paid for. Follow the receipt from the run usage events to the billing view and tell me where the number comes from. Change nothing.'),
        say('15:04', 'Planner', 'Reading the whole path in one pass: the usage events, the serializer that turns them into a receipt, and the console summary that renders it.'),
        tools('15:04', 'Read the receipt pipeline', '6 files', [
          read('billing/usage-events.ts', '78 lines', `export type UsageEvent = {
  ledgerEntryId: string;
  fundingKind: "subscription" | "credits";
  estimatedModelCost: number;
  chargedCredit: number;
};`),
          read('billing/receipt.ts', '112 lines', `export function totalCredit(entries) {
  return entries.reduce(
    (sum, e) => sum + e.estimatedModelCost + e.chargedCredit, 0
  );
}`),
          read('components/usage-receipt.tsx', '96 lines', `<ReceiptTotal amount={totalCredit(receipt.entries)} />`),
          read('billing/ledger.ts', '141 lines', 'export const deduct = (member, amount) => …'),
          read('billing/account-usage.ts', '64 lines', 'export const windowsFor = (account) => …'),
          read('billing/routing.ts', '88 lines', 'export const pickAccount = (member, model) => …')
        ]),
        say('15:05', 'Planner', 'totalCredit adds estimatedModelCost to chargedCredit. When a subscription pays for the model, chargedCredit is 0 but estimatedModelCost is not, so the total invents money that was never deducted.'),
        tools('15:06', 'Traced the two billing paths separately', '2 searches', [
          grep('estimatedModelCost', 'botinc/app · 5 matches', `billing/usage-events.ts:11   estimatedModelCost: number;
billing/receipt.ts:24        sum + e.estimatedModelCost + e.chargedCredit
billing/receipt.ts:58        modelCredit: e.estimatedModelCost,
components/usage-receipt.tsx:31 {receipt.modelCredit}
billing/receipt.test.ts:14   estimatedModelCost: 0.42,`),
          grep('deduct(', 'botinc/app · 2 matches', `billing/ledger.ts:44        export const deduct = (member, amount) =>
billing/runner.ts:96        await deduct(member, run.chargedCredit);`)
        ]),
        say('15:06', 'Planner', 'The ledger itself is correct: deduct is only ever called with chargedCredit. The defect is entirely in the presentation layer.'),
        finding('15:07', 'high', 'The displayed total includes money that was never charged',
          'totalCredit sums an estimate and an actual deduction into one number. For subscription-funded work the estimate is the whole visible amount.',
          'billing/receipt.ts:24'),
        finding('15:07', 'medium', 'Provider usage and credit share one unit',
          'Quota windows and dollar amounts are rendered by the same component, so an unreported token count is indistinguishable from zero usage.',
          'components/usage-receipt.tsx:31'),
        result('15:07', 'The ledger is right; the receipt is not',
          'Actual deductions and provider estimates need separate fields and separate units. Only deductions may contribute to the credit total.',
          [['Files read', '6'], ['Billing paths traced', '2'], ['Ledger correctness', 'Unaffected']]),
        handoff('15:07', 'Handing the trace to implementation with both findings.', 'BOT-250-R2')
      ]
    },

    'BOT-250-R2': {
      issue: 'BOT-250', effort: 'Medium', source: 'BOT-250-R1',
      outcome: 'Funding source and charged amount are independent fields',
      commit: 'Working tree · receipt-funding-split', assignment: 'Split funding from charge',
      entries: [
        op('15:09', 'Separate what was actually deducted from what a provider estimated. The receipt shows subscription-funded model work, BotInc-funded model work, and cloud compute as separate rows. Only actual credit deductions contribute to the credit total.'),
        say('15:10', 'Implementer', 'Starting with a failing test that mixes both funding sources in one conversation, because that is the case the current code gets wrong and the simple cases already pass.'),
        tools('15:11', 'Created the mixed-funding fixture', '1 file', [
          edit('billing/receipt.fixture.ts', '+34 -0', `+ export const mixedFunding = [
+   { ledgerEntryId: "le_1", fundingKind: "subscription",
+     estimatedModelCost: 0.42, chargedCredit: 0 },
+   { ledgerEntryId: "le_2", fundingKind: "credits",
+     estimatedModelCost: 0.18, chargedCredit: 0.18 },
+   { ledgerEntryId: "le_3", fundingKind: "credits",
+     estimatedModelCost: 0, chargedCredit: 0.06 },
+ ];`)
        ]),
        tools('15:11', 'Reproduced the inflated total', '1 command · exit 1', [
          cmd('pnpm test billing/receipt -t "mixed funding"', 'botinc/app · expected failure', `$ pnpm test billing/receipt -t "mixed funding"

 FAIL  billing/receipt.test.ts
  ✕ mixed funding uses actual charges (9 ms)

    expect(received).toBe(expected)

    Expected: 0.24
    Received: 0.84

    The subscription entry contributed 0.42 it never charged, and the
    credits entry was counted as estimate + charge.

Tests:       1 failed, 1 total
Process exited with code 1`, 1)
        ]),
        say('15:11', 'Implementer', 'Created a failing test for mixed funding in one conversation: Claude subscription for planning, BotInc credits for a later model run, cloud compute on both. The old summary double-counts.'),
        person('15:13', 'Emre', 'What happens when the provider never reports token counts? Some accounts only report usage windows.'),
        op('15:14', 'We will show "Not reported" for tokens. Quota windows stay in account usage; they will not be converted into this conversation’s token count or dollar cost.'),
        say('15:14', 'Implementer', 'That is a distinct case from zero, so the field has to be nullable rather than defaulted. I am adding it to this change instead of leaving it for later.'),
        tools('15:16', 'Split the fields', '1 file', [
          edit('billing/receipt.ts', '+38 -14', `export function totalCredit(entries) {
+ const unique = new Map();
+ for (const entry of entries) {
+   unique.set(entry.ledgerEntryId, entry);
+ }
+ return [...unique.values()].reduce(
+   (sum, entry) => sum + entry.chargedCredit, 0
+ );
}

export function sharedReceipt(entry) {
+ return { funding: entry.fundingKind,
+   owner: entry.executionOwner,
+   credit: entry.chargedCredit };
}`)
        ]),
        tools('15:17', 'Added the unreported-usage cases', '1 file', [
          edit('billing/receipt.test.ts', '+44 -0', `+ test("does not convert quota to dollars", () => {
+   expect(receipt.modelCredit).toBe(0);
+ });
+ test("missing token counts stay null", () => {
+   expect(receipt.runs[0].tokens).toBeNull();
+ });`)
        ]),
        say('15:17', 'Implementer', 'Split actual deductions from provider usage metadata. Receipt entries now carry the funding source and the charged amount independently, and missing token counts remain null, not zero.'),
        tools('15:18', 'Ran the receipt suite', '1 command', [
          cmd('pnpm test billing/receipt', 'botinc/app · 2.4s', `$ pnpm test billing/receipt

 PASS  billing/receipt.test.ts
  ✓ mixed funding uses actual charges (9 ms)
  ✓ does not convert quota to dollars (5 ms)
  ✓ missing token counts stay null (4 ms)
  ✓ shared receipt excludes private account identity (11 ms)

Tests:       4 passed, 4 total
Process exited with code 0`, 0)
        ]),
        result('15:19', 'Funding and charge are separate fields',
          'The credit total is the sum of actual deductions. Subscription-funded work contributes nothing to it, and unreported token counts stay null.',
          [['Files changed', '3'], ['Checks', '4 passed'], ['Total for the fixture', '$0.24 (was $0.84)']]),
        say('15:19', 'Implementer', 'One case I have not covered: what happens if the same usage event is delivered twice. I deduplicate by ledger entry id here, but I have not proved a replay is idempotent under retry.'),
        handoff('15:19', 'Handing to the first review with the replay question open.', 'BOT-250-R3')
      ]
    },

    'BOT-250-R3': {
      issue: 'BOT-250', effort: 'High', source: 'BOT-250-R2',
      outcome: 'Changes requested · a retry can duplicate the same deduction',
      commit: 'Reviewed working tree · receipt-funding-split', assignment: 'Independent review · correctness',
      entries: [
        op('15:19', 'Independent review of the receipt change. The implementer has flagged an open question about replayed usage events. Do not edit any file.'),
        say('15:20', 'Reviewer', 'Replay is the right thing to press on. Deduplication by map key looks safe until you ask what the key is derived from.'),
        tools('15:20', 'Read the reducer and its callers', '2 files', [
          read('billing/receipt.ts', 'working tree', `const unique = new Map();
for (const entry of entries) {
  unique.set(entry.ledgerEntryId, entry);
}`),
          read('billing/runner.ts', 'lines 88-104', `for (const event of usageEvents) {
  await appendReceiptEntry(taskId, {
    ledgerEntryId: event.ledgerEntryId ?? \`\${event.at}:\${event.model}\`,
    chargedCredit: event.chargedCredit,
  });
}`)
        ]),
        finding('15:21', 'high', 'The fallback key is not stable across a retry',
          'appendReceiptEntry falls back to a timestamp and model name when ledgerEntryId is absent. A replayed event gets a new timestamp, so the map keeps both copies and the deduction is counted twice.',
          'billing/runner.ts:94'),
        tools('15:22', 'Demonstrated the duplicate', '1 command · exit 1', [
          cmd('pnpm test billing/scratch -t "replay"', 'reviewer scratch fixture', `$ pnpm test billing/scratch -t "replay"

 FAIL  billing/scratch.test.ts
  ✕ a replayed usage event is counted once (12 ms)

    expect(received).toBe(expected)

    Expected: 0.06
    Received: 0.12

    Two entries with the same charge and different fallback keys:
      "1757500000:claude-sonnet-5" and "1757500004:claude-sonnet-5"

Tests:       1 failed, 1 total
Process exited with code 1`, 1)
        ]),
        say('15:22', 'Reviewer', 'The reducer adds both the initial usage event and its replay. Deduplicate by the persisted ledger entry id, not by timestamp or model name.'),
        say('15:22', 'Reviewer', 'The opposite mistake matters too: two legitimate charges can share a timestamp. Whatever replaces the fallback must not collapse those into one.'),
        tools('15:22', 'Checked for other timestamp-derived keys', '1 search', [
          grep('`${.*at}:', 'botinc/app · 1 match', 'billing/runner.ts:94   ledgerEntryId: event.ledgerEntryId ?? `${event.at}:${event.model}`,')
        ]),
        result('15:22', 'Changes requested · 1 high finding',
          'The field split is correct. The deduplication key is not: it can invent a duplicate on retry and can merge two real charges that share a timestamp.',
          [['Findings', '1 high'], ['Replay fixture', 'Attached'], ['Verdict', 'Changes requested']]),
        op('15:23', 'The first reviewer found a duplicate-event case. I will fix that before touching the display, so the receipt and ledger reconcile.'),
        handoff('15:23', 'Returning to implementation with the replay fixture attached.', 'BOT-250-R4')
      ]
    },

    'BOT-250-R4': {
      issue: 'BOT-250', effort: 'Medium', source: 'BOT-250-R3',
      outcome: 'Stable ledger deduplication and per-run account attribution',
      commit: 'Working tree · receipt-funding-split', assignment: 'Apply the replay finding',
      attempts: [
        {
          label: 'Attempt 1', status: 'Stopped', tone: 'needs',
          started: 'Yesterday · 15:26', ended: 'Yesterday · 15:34', duration: '8m 12s',
          note: 'Stopped when the Claude subscription window was exhausted. Alex chose to wait for the 16:10 reset rather than spend credits. Nothing in this attempt was discarded - attempt 2 resumed from the saved diff.',
          entries: [
            op('15:26', 'Fix the deduplication key. Each run also has to retain the account label and provider it actually used, because Alex has several subscriptions with the same provider.'),
            person('15:25', 'Alex', 'Yes. Also show me which account was used for each run. I have several subscriptions with the same provider.'),
            say('15:27', 'Implementer', 'The persisted ledger entry id already exists; the fallback is what has to go. If an event arrives without one, the right behavior is to refuse it, not to invent a key.'),
            tools('15:29', 'Removed the derived fallback key', '1 file', [
              edit('billing/runner.ts', '+9 -3', `- ledgerEntryId: event.ledgerEntryId ?? \`\${event.at}:\${event.model}\`,
+ ledgerEntryId: requireLedgerEntryId(event),`)
            ]),
            tools('15:31', 'Added the ledger regressions', '1 file', [
              edit('billing/receipt.test.ts', '+28 -0', `+ test("replayed entries are counted once", () => {
+   expect(totalCredit([entry, entry])).toBe(0.06);
+ });
+ test("two identical timestamps remain two charges", () => {
+   expect(totalCredit([a, b])).toBe(0.12);
+ });`)
            ]),
            tools('15:33', 'Started the account attribution snapshot', '1 file', [
              edit('billing/receipt.ts', '+14 -2', `+ accountSnapshot: {
+   label: run.account.label,
+   provider: run.account.provider,
+ },`)
            ]),
            say('15:33', 'Implementer', 'Two of the four regressions are written and passing. The account snapshot is half-applied: the field exists but nothing reads it yet.'),
            live('15:34', 'Run stopped: the Claude subscription window for this account is exhausted.'),
            op('15:34', 'Your Claude session window is now at its limit. I have saved the work and the current diff. The account resets at 16:10.'),
            op('15:34', 'Your fallback is "Ask before using credits." I can wait for the subscription to reset, or continue with credits within this task’s $2 limit.'),
            person('15:35', 'Alex', 'Wait for the reset. Keep the task queued and continue in this conversation.'),
            handoff('15:35', 'Attempt 1 stopped with the diff saved. No model credits are being used while this waits. This record is closed and will not change.', '')
          ]
        },
        {
          label: 'Attempt 2', status: 'Completed', tone: 'done', current: true,
          started: 'Today · 16:11', ended: 'Today · 16:14', duration: '3m 41s',
          note: 'Resumed from the saved worktree of attempt 1 after the subscription window reset at 16:10. Account eligibility was rechecked before any model call.',
          entries: [
            op('16:11', 'The session window has reset and the account is eligible again. Continue from the saved diff. Recheck eligibility before the first model call.'),
            say('16:11', 'Implementer', 'Resuming the same worktree rather than starting over, so the two regressions written in attempt 1 are still here and still passing.'),
            tools('16:11', 'Restored the saved worktree', '2 commands', [
              cmd('git stash list && git stash pop', 'botinc/app', `stash@{0}: WIP on receipt-funding-split: ledger dedup + account snapshot
On branch receipt-funding-split
Changes not staged for commit:
  modified:   billing/receipt.ts
  modified:   billing/receipt.test.ts
  modified:   billing/runner.ts
Dropped refs/stash@{0}`, 0),
              cmd('pnpm billing:eligibility --member alex', 'routing check', `claude · Work Max     SESSION 4% used   WEEK 61% used   eligible
Selected: Claude · Work Max (reset at 16:10 applied)
Process exited with code 0`, 0)
            ]),
            tools('16:12', 'Finished the account attribution', '1 file', [
              edit('billing/receipt.ts', '+18 -4', `+ export function runAccount(run) {
+   return run.accountSnapshot ?? resolveAccount(run.accountId);
+ }`)
            ]),
            say('16:12', 'Implementer', 'Historical runs keep the account used at execution time. If the account is renamed or removed later, the receipt still shows what actually paid.'),
            tools('16:13', 'Ran the four ledger regressions', '1 command', [
              cmd('pnpm test billing/receipt -t "ledger"', 'botinc/app · 1.8s', `$ pnpm test billing/receipt -t "ledger"

 PASS  billing/receipt.test.ts
  ✓ replayed entries are counted once (6 ms)
  ✓ two identical timestamps remain two charges (8 ms)
  ✓ an event without a ledger entry id is refused (5 ms)
  ✓ historical runs keep the account used at execution time (9 ms)

Tests:       4 passed, 4 total
Process exited with code 0`, 0)
            ]),
            say('16:13', 'Implementer', 'Added stable ledger deduplication and account attribution. Replayed events with the same ledger entry id are ignored; two legitimate charges with identical timestamps remain separate.'),
            tools('16:13', 'Finished the receipt layout', '1 file', [
              edit('components/usage-receipt.tsx', '+26 -18', `+ <ReceiptTotal amount={receipt.creditCharged} />
+ <FundingRow label="Model work" value="Subscription" />
+ <FundingRow label="Cloud compute" amount={receipt.compute} />
+ <RunLedger entries={receipt.runs} />`)
            ]),
            tools('16:14', 'Ran the whole receipt suite', '1 command', [
              cmd('pnpm test billing/receipt', 'botinc/app · 2.6s', RECEIPT_SUITE, 0)
            ]),
            say('16:14', 'Implementer', 'Resumed the same run and finished the receipt layout. The summary uses the ledger amount; account usage remains a separate link. A run that changes funding creates separate receipt entries.'),
            result('16:14', 'Deduplication stable · attribution retained',
              'Nine checks pass across both attempts’ work. The credit total is the ledger total, and every run keeps the account that paid for it.',
              [['Attempts', '2 (attempt 1 stopped at the quota limit)'], ['Model credit used while waiting', '$0.00'], ['Checks', '8 passed']]),
            handoff('16:14', 'Handing to the second review, scoped to account privacy and missing-usage behavior.', 'BOT-250-R5')
          ]
        }
      ]
    },

    'BOT-250-R5': {
      issue: 'BOT-250', effort: 'High', source: 'BOT-250-R4',
      outcome: 'Account identity leaks into the shared tooltip',
      commit: 'Reviewed working tree · receipt-funding-split', assignment: 'Independent review · privacy and scope',
      entries: [
        op('16:15', 'Second independent review, different scope from the first: member-scoped data and behavior when usage is missing or stale. Emre has asked whether a workspace member can see someone else’s personal subscription balance.'),
        person('16:15', 'Emre', 'The amount is clearer. Can a workspace member see someone else’s personal subscription balance from this page?'),
        say('16:16', 'Reviewer', 'The question is about the payload, not the screen. I am checking what the shared issue actually serialises, because a hidden field is still a leak.'),
        tools('16:16', 'Read the shared payload and its consumers', '3 files', [
          read('billing/receipt.ts', 'sharedReceipt', `return { funding: entry.fundingKind,
  owner: entry.executionOwner,
  credit: entry.chargedCredit };`),
          read('components/usage-receipt.tsx', 'run ledger row', `<RunRow
  label={run.accountSnapshot.label}
  title={run.accountSnapshot.identity}
/>`),
          read('billing/account-usage.ts', 'freshness', `const FRESH_MS = 24 * 60 * 60 * 1000;
export const isFresh = (sample) => Date.now() - sample.capturedAt < FRESH_MS;`)
        ]),
        finding('16:17', 'high', 'The run row puts the account email in a shared tooltip',
          'sharedReceipt correctly excludes identity, but the run ledger row reads accountSnapshot.identity directly and renders it as the row title. Any member who opens the shared issue sees the account email.',
          'components/usage-receipt.tsx:44'),
        say('16:17', 'Reviewer', 'Reviewing account privacy and missing-usage behavior. A shared receipt should expose the payer category and the execution owner. Personal account identity and quota windows must not be in the shared issue payload.'),
        tools('16:18', 'Checked the missing and stale cases', '1 command', [
          cmd('pnpm test billing/account-usage', 'botinc/app · 1.7s', `$ pnpm test billing/account-usage

 PASS  billing/account-usage.test.ts
  ✓ an unavailable window is not rendered as 0% (8 ms)
  ✓ an expired sample is marked as last reported (7 ms)
  ✓ a fresh sample renders its percentage (5 ms)

Tests:       3 passed, 3 total
Process exited with code 0`, 0)
        ]),
        say('16:18', 'Reviewer', 'Unavailable windows are not shown as 0% and expired samples are labelled as last reported. That part is right; the finding is only about identity.'),
        result('16:19', 'Changes requested · 1 high privacy finding',
          'The payload boundary is correct and the missing-usage behavior is correct. One component reaches past the boundary and renders a private account identity in shared context.',
          [['Findings', '1 high'], ['Missing-usage checks', '3 passed'], ['Verdict', 'Changes requested']]),
        op('16:20', 'The second review caught an account identity leaking into the shared tooltip. I am moving that detail behind the owner-scoped account view.'),
        handoff('16:20', 'Returning to implementation for the privacy fix.', 'BOT-250-R6')
      ]
    },

    'BOT-250-R6': {
      issue: 'BOT-250', effort: 'Medium', source: 'BOT-250-R5',
      outcome: 'Shared receipt shows "Alex’s subscription"; identity stays owner-only',
      commit: 'Working tree · receipt-funding-split', assignment: 'Apply the privacy finding',
      entries: [
        op('16:21', 'Move the account identity behind the owner-scoped account view. The work stays shared; the account details do not.'),
        person('16:21', 'Alex', 'Exactly. I should see my own accounts, and Emre should see his own. The work can still be shared.'),
        say('16:22', 'Implementer', 'The component should not be able to reach identity at all. I am removing the field from the snapshot the shared view receives, rather than hiding it in the markup.'),
        tools('16:22', 'Removed identity from the shared payload', '1 file', [
          edit('billing/receipt.ts', '+12 -6', `- accountSnapshot: { label, provider, identity }
+ accountSnapshot: { label, provider }
+ // identity resolves only through the owner-scoped account request
+ export const ownerAccount = (run, viewer) =>
+   viewer === run.executionOwner ? resolveAccount(run.accountId) : null;`)
        ]),
        tools('16:23', 'Updated the run row', '1 file', [
          edit('components/usage-receipt.tsx', '+7 -5', `- title={run.accountSnapshot.identity}
+ title={\`\${run.executionOwner}’s \${run.accountSnapshot.provider} subscription\`}`)
        ]),
        tools('16:23', 'Added a cross-member regression', '1 file', [
          edit('billing/receipt.test.ts', '+16 -0', `+ test("another member never resolves the account label", () => {
+   expect(ownerAccount(run, "Emre")).toBeNull();
+   expect(sharedReceipt(entry)).not.toHaveProperty("email");
+ });`)
        ]),
        say('16:23', 'Implementer', 'Separated shared receipt data from private account usage. The shared issue now shows "Alex’s subscription". Only Alex’s account request resolves the label, identity, usage windows, and reset times.'),
        tools('16:24', 'Ran the receipt suite with the new case', '1 command', [
          cmd('pnpm test billing/receipt', 'botinc/app · 2.6s', RECEIPT_SUITE, 0)
        ]),
        result('16:25', 'Identity is owner-scoped',
          'The shared payload carries a funding category and an execution owner. Account label, identity, usage windows and reset times resolve only for the account owner.',
          [['Files changed', '3'], ['Cross-member regression', 'Added'], ['Checks', '8 passed']]),
        op('16:26', 'The receipt now reconciles to $0.06 in cloud credit. Model work in this example was covered by subscriptions.'),
        handoff('16:26', 'Handing to the follow-up review of the new revision.', 'BOT-250-R7')
      ]
    },

    'BOT-250-R7': {
      issue: 'BOT-250', effort: 'Medium', source: 'BOT-250-R6', activeRun: true,
      outcome: '8 checks passed · responsive check still running',
      commit: 'Working tree · receipt-funding-split', assignment: 'Final checks and the 20-account layout',
      children: ['BOT-250-R7-C1', 'BOT-250-R7-C2', 'BOT-250-R7-C3'],
      entries: [
        person('09:04', 'Alex', 'One more thing: the 20-account layout should still let me find the account that is exhausted.'),
        op('09:05', 'Final validation. Ledger replay, mixed funding, missing usage, private identity, expired samples, and the responsive account navigation Alex asked about this morning. Delegate the browser work.'),
        say('09:06', 'Verifier', 'Six areas to check. The data checks I can run here; the layout needs a browser, so I will delegate that and keep this thread as the place the results come back to.'),
        say('09:06', 'Verifier', 'I am reading the working diff first rather than trusting the last run’s summary, because the privacy fix landed after those checks ran.'),
        tools('09:06', 'Read the working diff', '3 files', [
          read('billing/receipt.ts', '+38 -14', `export function totalCredit(entries) {
  const unique = new Map();
  for (const entry of entries) unique.set(entry.ledgerEntryId, entry);
  return [...unique.values()].reduce((s, e) => s + e.chargedCredit, 0);
}`),
          read('billing/receipt.test.ts', '+44 -0', `test("replayed entries are counted once", () => {
  expect(totalCredit([entry, entry])).toBe(0.06);
});`),
          read('components/usage-receipt.tsx', '+26 -18', '<ReceiptTotal amount={receipt.creditCharged} />')
        ]),
        tools('09:07', 'Ran the receipt suite', '1 command · 8 checks', [
          cmd('pnpm test billing/receipt', 'botinc/app · 2.6s', RECEIPT_SUITE, 0)
        ]),
        say('09:07', 'Verifier', 'Eight checks pass, including both replay cases and the cross-member privacy regression.'),
        tools('09:08', 'Ran the second shard', '1 command · exit 1', [
          cmd('pnpm test billing/receipt --shard=2/2', 'botinc/app · failed', `$ pnpm test billing/receipt --shard=2/2

 FAIL  billing/receipt.test.ts
  ✕ an expired sample is marked as last reported (3 ms)

  ● an expired sample is marked as last reported

    Error: BOTINC_FIXTURE_CLOCK is not set.
        at fixtureNow (billing/test-clock.ts:8:11)
        at billing/receipt.test.ts:71:19

    The first shard exports this variable during its setup. Shard 2 has
    no setup step of its own.

Tests:       1 failed, 7 passed, 8 total
Process exited with code 1`, 1)
        ]),
        say('09:08', 'Verifier', 'That failure is the harness, not the product: shard 2 has no setup step, so the fixture clock is missing. I am retrying with the variable set rather than reporting a false failure - and rather than pretending it did not happen.'),
        tools('09:09', 'Retried the shard with the fixture clock', '1 command · retry within this attempt', [
          cmd('BOTINC_FIXTURE_CLOCK=2026-09-10T09:00:00Z pnpm test billing/receipt --shard=2/2', 'botinc/app · 1.3s', `$ BOTINC_FIXTURE_CLOCK=2026-09-10T09:00:00Z pnpm test billing/receipt --shard=2/2

 PASS  billing/receipt.test.ts
  ✓ an expired sample is marked as last reported (6 ms)
  ✓ an unavailable window is not rendered as 0% (5 ms)

Tests:       8 passed, 8 total
Process exited with code 0`, 0)
        ]),
        say('09:09', 'Verifier', 'This is still attempt 1 of this run. A command failed and was retried inside it; that is not a new attempt, and the failed output above stays in the record.'),
        kids('09:09', 'Delegated checks', ['BOT-250-R7-C1', 'BOT-250-R7-C2']),
        say('09:09', 'Verifier', 'The reconciliation came back clean: the receipt equals the ledger at $0.06 and the difference is zero. The browser check is still walking the account list.'),
        tools('09:09', 'Confirmed the mixed-funding fixture matches the receipt Alex saw', '1 command', [
          cmd('pnpm billing:explain --task BOT-250 --entry le_1', 'botinc/app · 0.8s', `entry            le_1
funding          subscription (Claude · Work Max)
estimated model  0.42   ← the number on the old receipt
charged credit   0.00
contributes to total: no
Process exited with code 0`, 0)
        ]),
        say('09:09', 'Verifier', 'That is the original $0.42, still recorded as a provider estimate and now contributing nothing to the total. It was never a deduction.'),
        tools('09:09', 'Checked member scoping directly', '1 command', [
          cmd('pnpm test billing/receipt -t "member"', 'botinc/app · 1.1s', `$ pnpm test billing/receipt -t "member"

 PASS  billing/receipt.test.ts
  ✓ shared receipt excludes private account identity (11 ms)
  ✓ another member never resolves the account label (7 ms)

Tests:       2 passed, 2 total
Process exited with code 0`, 0)
        ]),
        result('09:09', '8 data checks passed · layout outstanding',
          'Ledger replay, mixed funding, missing usage, private identity and expired samples are all verified. The responsive account navigation is still being walked in a browser.',
          [['Data checks', '8 passed, 0 failed'], ['Failed commands retried', '1 (harness setup)'], ['Delegated checks', '1 passed, 1 running, 1 waiting']]),
        kids('09:10', 'Waiting on you', ['BOT-250-R7-C3']),
        op('09:10', 'One delegated check is paused on a product decision about the "Needs attention" filter. Answering it unblocks that child; the rest of this run keeps going.'),
        say('09:10', 'Verifier', 'I did not want that child to guess. Both behaviors pass the tests it would write, so choosing one is a product call rather than a correctness call.'),
        tools('09:11', 'Re-ran the expired-sample cases while that waits', '1 command', [
          cmd('BOTINC_FIXTURE_CLOCK=2026-09-10T09:00:00Z pnpm test billing/account-usage', 'botinc/app · 1.7s', `$ pnpm test billing/account-usage

 PASS  billing/account-usage.test.ts
  ✓ an unavailable window is not rendered as 0% (8 ms)
  ✓ an expired sample is marked as last reported (7 ms)
  ✓ a fresh sample renders its percentage (5 ms)

Tests:       3 passed, 3 total
Process exited with code 0`, 0)
        ]),
        say('09:11', 'Verifier', 'The rendering of a stale sample is settled either way. Only the filter membership depends on the answer, which is why one child is waiting and this run is not.'),
        live('09:11', 'Browser check in progress · keyboard pass, 2 of 4 provider groups reached.'),
        say('09:11', 'Verifier', 'Nothing else is outstanding on my side. When the browser child returns its keyboard order and the filter question is answered, I will close this run.'),
        op('09:12', 'The data checks pass. You can inspect the receipt, changed files, and both review threads while this runs.')
      ]
    }
  };

  /* -------------------------------------------------------------- utils -- */
  var OP_ICON = {read: 'file-text', edit: 'file-code', run: 'terminal',
    search: 'search', browse: 'globe', diff: 'git-commit-horizontal'};
  var OP_LABEL = {read: 'Read', edit: 'Edited', run: 'Ran', search: 'Searched',
    browse: 'Browser', diff: 'Diff'};
  var HEAD_LINES = 12;

  function lines(text) { return String(text == null ? '' : text).split('\n'); }
  function blob(entry) {
    var parts = [entry.who || '', entry.text || '', entry.label || '', entry.meta || '',
      entry.title || '', entry.where || ''];
    (entry.rows || []).forEach(function (r) {
      parts.push(r.title || '', r.meta || '', r.out || '');
    });
    (entry.facts || []).forEach(function (f) { parts.push(f[0] + ' ' + f[1]); });
    return parts.join(' \n ').toLowerCase();
  }

  window.BotincRunWorkspace16 = function (Base) {
    return class extends Base {

      /* ------------------------------------------------------ lifecycle -- */
      componentDidMount() {
        super.componentDidMount();
        this.initV16();
      }

      initV16() {
        this.setState({
          open16: null, stack16: [], folds16: {}, attempt16: {},
          find16: '', findOpen16: false, ask16: {}, discuss16: {},
          instruct16: {}, steer16: {}, answered16: {}, returnRun16: null,
          stopped16: {}, scroll16: {}
        });
        if (this.v16Variant === 'mobile') {
          this.setState({mobileDesign9: true, inspector10: false, mobileInspector10: false});
        }
        if (this.v16Variant === 'landing') this.go('landing', {panel: null});
      }

      /* ----------------------------------------------------- fold state -- */
      fold16(key, fallback) {
        var f = this.state.folds16 || {};
        return Object.prototype.hasOwnProperty.call(f, key) ? !!f[key] : !!fallback;
      }

      setFold16(key, on) {
        this.setState({folds16: Object.assign({}, this.state.folds16, this.pair16(key, !!on))});
      }

      /* One-entry patch. It must not coerce: the same helper carries fold
         booleans, composer drafts, entry lists and answer labels. */
      pair16(key, value) { var o = {}; o[key] = value; return o; }

      toggleFold16(key, fallback) { this.setFold16(key, !this.fold16(key, fallback)); }

      /* --------------------------------------------------- run registry -- */
      thread16(id) {
        if (!id) return null;
        if (THREADS[id]) return THREADS[id];
        if (CHILDREN[id]) return CHILDREN[id];
        // A run queued by a workflow decision has no authored transcript yet.
        // It still opens a thread: its assignment and its state, said plainly,
        // rather than a dead row or a fabricated history.
        var rec = this.record16(id);
        if (!rec) return null;
        var issue = this.issue() || {};
        return {
          issue: issue.id, effort: 'Medium', source: 'Operator assignment',
          outcome: rec.summary, commit: 'No revision yet', synthetic: true,
          entries: rec.messages.map(function (m) {
            return {k: 'say', role: m.who === 'Operator' ? 'operator' : 'agent',
              who: m.who, time: rec.when, text: m.text};
          }).concat([{
            k: 'live', time: rec.when,
            text: 'This run has not executed yet, so there is nothing further to read. '
              + 'Its conversation will appear here as it works.'
          }])
        };
      }

      isChild16(id) { return !!CHILDREN[id]; }

      /* Record from the base component's own run list, so the Runs tab and the
         thread never disagree about a run's stage, model, status or cost. */
      record16(id) {
        var rows = this.runRows12();
        for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return rows[i];
        return null;
      }

      childRecord16(id) {
        var c = CHILDREN[id];
        if (!c) return null;
        var rec = Object.assign({}, c, {id: id},
          this.brand12(/^GPT/.test(c.model) ? 'Codex' : 'Claude'));
        var answer = this.childAnswer16(id);
        if (answer) {
          rec.status = 'Running';
          rec.tone = 'running';
          rec.outcome = 'Continuing with “' + answer.label + '”';
          rec.question = '';
          rec.options = [];
          rec.duration = 'Resumed just now';
        }
        return rec;
      }

      /* Attempts are immutable. A run has a selector only when it has more
         than one of them; a failed command inside an attempt is not one. */
      attempts16(id) {
        var t = this.thread16(id);
        if (!t) return [];
        if (t.attempts) return t.attempts;
        var rec = this.record16(id) || {};
        var child = this.childRecord16(id);
        return [{
          label: 'Attempt 1', status: (child || rec).status || 'Completed',
          tone: (child || rec).tone || 'done', current: true,
          started: child ? child.started : rec.when,
          ended: child ? child.ended : '', duration: (child || rec).duration,
          entries: t.entries || []
        }];
      }

      attemptIndex16(id) {
        var list = this.attempts16(id);
        var chosen = (this.state.attempt16 || {})[id];
        if (chosen == null) return list.length - 1;
        return Math.min(Math.max(0, chosen), list.length - 1);
      }

      /* --------------------------------------------------- navigation --- */
      paneScroll16() { return document.querySelector('.rt-reading16') || document.querySelector('.inspector-content10'); }

      /* Scroll offsets are remembered outside React state: they are not render
         input, and they must survive a re-render without causing one. */
      rememberScroll16() {
        if (this.state.inspectorTab10 !== 'runs') return;
        var pane = this.paneScroll16();
        if (!pane) return;
        this.scrollMemo16 = this.scrollMemo16 || {};
        this.scrollMemo16[this.state.open16 || 'list'] = pane.scrollTop;
      }

      restoreScroll16(key) {
        var self = this;
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          if ((self.state.open16 || 'list') !== key || self.state.inspectorTab10 !== 'runs') return;
          var pane = self.paneScroll16();
          if (pane) pane.scrollTop = (self.scrollMemo16 || {})[key] || 0;
        }); });
      }

      /* `stack` is only passed when restoring a remembered context, for example
         coming back from a file the run linked to. Opening a child with no
         stack recovers its declared parent rather than stranding it. */
      rtOpen16(id, parent, stack) {
        if (!id) return;
        this.rememberScroll16();
        var next;
        if (stack) {
          next = stack.slice();
        } else if (parent) {
          next = (this.state.stack16 || []).slice();
          if (next[next.length - 1] !== parent) next.push(parent);
        } else if (this.isChild16(id)) {
          next = [CHILDREN[id].parent];
        } else {
          next = [];
        }
        var patch = {open16: id, stack16: next, find16: '', findOpen16: false,
          returnRun16: null, returnStack16: null};
        if (!this.isChild16(id)) patch.runFocus12 = id;
        this.setState(patch);
        this.openInspector10('runs');
        this.restoreScroll16(id);
      }

      rtAllRuns16() {
        this.rememberScroll16();
        this.setState({open16: null, stack16: [], runFocus12: null, find16: '',
          findOpen16: false, returnRun16: null, returnStack16: null});
        this.restoreScroll16('list');
      }

      parent16(id) {
        var stack = this.state.stack16 || [];
        return stack[stack.length - 1] || (this.isChild16(id) ? CHILDREN[id].parent : '');
      }

      rtParent16() {
        var id = this.state.open16;
        var stack = (this.state.stack16 || []).slice();
        var parent = stack.pop();
        if (!parent) parent = this.isChild16(id) ? CHILDREN[id].parent : '';
        if (!parent) return this.rtAllRuns16();
        this.rememberScroll16();
        this.setState({open16: parent, stack16: stack, find16: '', findOpen16: false,
          returnRun16: null, returnStack16: null,
          runFocus12: this.isChild16(parent) ? this.state.runFocus12 : parent});
        this.restoreScroll16(parent);
      }

      /* Scroll the transcript to its most recent entry. */
      rtLatest16() {
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          var pane = document.querySelector('.rt-reading16');
          if (pane) pane.scrollTop = pane.scrollHeight;
        }); });
      }

      /* Leave the run for a PR, file or usage surface and keep a way back.
         The breadcrumb context travels with it, so returning from a child's
         files still lands in the child, with its parent one step above. */
      rtGo16(tab, patch) {
        this.rememberScroll16();
        this.pendingReturn16 = this.state.open16;
        this.pendingStack16 = (this.state.stack16 || []).slice();
        if (patch) this.setState(patch);
        this.openInspector10(tab);
      }

      openInspector10(tab) {
        if (this.state.folds16 && tab !== 'runs') this.rememberScroll16();
        var keep = this.pendingReturn16;
        var stack = this.pendingStack16;
        this.pendingReturn16 = null;
        this.pendingStack16 = null;
        super.openInspector10(tab);
        if (this.state.folds16) {
          this.setState({returnRun16: keep || null, returnStack16: keep ? stack : null});
          if (tab === 'runs') this.restoreScroll16(this.state.open16 || 'list');
        }
      }

      openIssue(id) {
        super.openIssue(id);
        if (this.state.folds16) {
          this.setState({open16: null, stack16: [], returnRun16: null, returnStack16: null});
        }
      }

      /* Every V15 entry point into a run (stage block, Runs row, usage row)
         now opens the full thread instead of a two-line summary. */
      runRows12() {
        var self = this;
        var open = this.state.open16;
        return super.runRows12().map(function (r) {
          var t = THREADS[r.id];
          return Object.assign({}, r, {
            selected: open === r.id,
            open: function () { self.rtOpen16(r.id); },
            outcome16: (t && t.outcome) || r.summary,
            children16: (t && t.children) || []
          });
        });
      }

      /* --------------------------------------------- conversation block -- */
      historyRows13() {
        var self = this;
        var runs = this.runRows12();
        var issue = this.issue() || {};
        return super.historyRows13().map(function (m, index) {
          if (!m.isWork) return m;
          var rec = runs[m.run];
          var id = rec && rec.id;
          var t = id ? THREADS[id] : null;
          var key = 'wb:' + issue.id + ':' + index;
          var toolKey = key + ':tools';
          var expanded = self.fold16(key, false);
          var entries = t ? self.entriesFor16(id) : [];
          var progress = entries.filter(function (e) {
            return e.k === 'say' && e.role === 'agent';
          }).slice(0, 3).map(function (e) { return {time: e.time, text: e.text}; });
          var toolRows = [];
          entries.forEach(function (e) {
            if (e.k === 'tools') e.rows.forEach(function (r) {
              toolRows.push({
                icon: self.icon14(OP_ICON[r.op] || 'terminal'),
                title: r.title,
                meta: (OP_LABEL[r.op] || 'Ran') + ' · ' + (r.meta || ''),
                tone: r.exit ? 'bad14' : ''
              });
            });
          });
          var childIds = (t && t.children) || [];
          return Object.assign({}, m, {
            run16: id || '',
            expanded16: expanded,
            openCls16: expanded ? 'open16' : '',
            tone16: m.tone || (rec && rec.tone) || '',
            toggleAria16: (expanded ? 'Collapse ' : 'Expand ') + m.who + ' progress',
            toggle16: function () { self.toggleFold16(key, false); },
            openAria16: 'Open the full run thread for ' + m.who,
            openThread16: function () { self.rtOpen16(id); },
            // Replying to a stage belongs in that run's own thread, not in the
            // main composer's old reply context.
            replyAria16: 'Reply about ' + m.who + ' in its run thread',
            reply: function () {
              // Open the run's own discussion. The V15 reply context is still
              // recorded so anything that reads replyRun12 keeps working.
              if (rec && rec.reply) rec.reply();
              self.rtOpen16(id);
              setTimeout(function () {
                var box = document.querySelector('.rt-composer16 textarea');
                if (box && box.focus) box.focus();
              }, 0);
            },
            progress16: progress,
            hasTools16: toolRows.length > 0,
            toolsOpen16: self.fold16(toolKey, false),
            toolSummary16: toolRows.length + (toolRows.length === 1 ? ' tool action' : ' tool actions'),
            toggleTools16: function () { self.toggleFold16(toolKey, false); },
            toolRows16: toolRows,
            hasChildren16: childIds.length > 0,
            childLabel16: childIds.length === 1 ? '1 child run'
              : childIds.length + ' child runs',
            children16: childIds.map(function (cid) {
              var c = self.childRecord16(cid);
              return {
                stage: c.stage, model: c.model, status: c.status, tone: c.tone,
                icon: self.icon14(c.tone === 'needs' ? 'hand' : c.tone === 'running' ? 'loader' : 'circle-check'),
                open: function () { self.rtOpen16(cid, id); }
              };
            }),
            entryCount16: entries.length + ' entries in the full thread'
          });
        });
      }

      /* ------------------------------------------------------- entries --- */
      /* Only the current attempt can grow. An earlier attempt is a closed
         record and never receives steering or a stop notice. */
      entriesFor16(id) {
        var list = this.attempts16(id);
        var index = this.attemptIndex16(id);
        var attempt = list[index];
        var entries = (attempt && attempt.entries) || [];
        if (index !== list.length - 1) return entries;
        var answer = this.childAnswer16(id);
        if (answer) {
          // The answer belongs in this child's transcript, in order, followed
          // by the child saying what it does next.
          entries = entries.slice(0, entries.length - 1).concat([
            {k: 'say', role: 'human', who: answer.by, time: 'Just now',
              text: answer.label + '.', steer: true},
            {k: 'say', role: 'agent', who: this.speaker16(id) || 'Stale-usage check', time: 'Just now',
              text: 'Answered: ' + answer.label + '. Resuming with that rule and re-running the '
                + 'needs-attention filter against the two stale sample accounts.'},
            {k: 'live', time: 'Just now', text: 'Running again with the answer applied.'}
          ]);
        }
        var extra = (this.state.steer16 || {})[this.discussKey16(id)] || [];
        var stopped = (this.state.stopped16 || {})[id];
        var tail = stopped
          ? [{k: 'live', time: stopped.time, text: stopped.text, stop: true}]
          : [];
        return entries.concat(extra, tail);
      }

      /* The name the specialist speaks under in this run's transcript. */
      speaker16(id) {
        var entries = (this.attempts16(id)[this.attemptIndex16(id)] || {}).entries || [];
        for (var i = entries.length - 1; i >= 0; i--) {
          if (entries[i].k === 'say' && entries[i].role === 'agent') return entries[i].who;
        }
        return 'Operator';
      }

      /* ------------------------------------------------------ discussion -- */
      discussKey16(id) { return this.state.member + ':' + id; }

      // A finished run is a record.  Anything to say about it belongs in the
      // conversation, where every stage of the work can see it.
      rtDiscussInThread16() {
        this.setState({open16: null, stack16: []});
        var self = this;
        setTimeout(function () { self.scrollThread13('latest'); }, 80);
      }

      rtAskSend16(event) {
        if (event && event.preventDefault) event.preventDefault();
        var id = this.state.open16;
        var key = this.discussKey16(id);
        var text = ((this.state.ask16 || {})[key] || '').trim();
        if (!id || !text) return;
        var rec = this.record16(id) || this.childRecord16(id) || {};
        var log = ((this.state.discuss16 || {})[key] || []).slice();
        var attachments = ((this.state.runAttach16 || {})[key] || []).slice();
        log.push({who: this.state.member, text: text + (attachments.length ? '\nAttached: ' + attachments.map(function (a) { return a.name; }).join(', ') : ''), cls: 'mine16', attachments: attachments});
        log.push({
          who: 'Operator', cls: 'reply16',
          text: this.sampleRunReply16(id, text)
        });
        this.setState({
          discuss16: Object.assign({}, this.state.discuss16, this.pair16(key, log)),
          ask16: Object.assign({}, this.state.ask16, this.pair16(key, '')),
          runAttach16: Object.assign({}, this.state.runAttach16, this.pair16(key, []))
        });
        this.rtLatest16();
      }

      sampleRunReply16(id, question) {
        var thread = this.thread16(id), record = this.record16(id) || this.childRecord16(id) || {};
        var review = this.thread16(thread.issue + '-R3'), revision = this.thread16(thread.issue + '-R4');
        if (/review|finding|race|second revision/i.test(question) && review && revision) {
          var finding = (review.entries || []).find(function (entry) { return entry.k === 'find'; });
          return (finding ? finding.title + '. ' + finding.text : review.outcome + '.') +
            '\nThe next implementation addressed it: ' + revision.outcome +
            '. Open Review 1 for the original finding or Implement · revision for the change.';
        }
        if (/cost|credit|spend|fund/i.test(question)) {
          return 'This run used ' + (record.costLabel || this.cash(record.cost || 0)) +
            ' in cloud credit. Subscription capacity is recorded separately. Open Usage to see the conversation receipt and each funding source.';
        }
        var entries = this.entriesFor16(id), result = entries.find(function (entry) { return entry.k === 'result'; });
        return (result ? result.text : thread.outcome) +
          (thread.commit ? '\nRecorded revision: ' + thread.commit + '.' : '') +
          ' The commands and handoff above show how the run reached that result.';
      }

      /* A run only accepts steering while it is genuinely running: the current
         attempt of an active run that has not been stopped, and only from the
         member who owns its execution. Everything else gets the discussion. */
      rtActive16(id) {
        var thread = this.thread16(id);
        var child = this.childRecord16(id);
        if (!thread || (!thread.activeRun && !(child && child.tone === 'running'))) return false;
        if ((this.state.stopped16 || {})[id]) return false;
        var list = this.attempts16(id);
        return this.attemptIndex16(id) === list.length - 1;
      }

      runOwner16(id) {
        var thread = this.thread16(id) || {};
        var issue = (this.state.issues || []).find(function (x) { return x.id === thread.issue; }) || {};
        return issue.executionOwner || issue.owner || this.state.member;
      }

      canSteer16(id) { return this.rtActive16(id) && this.runOwner16(id) === this.state.member; }

      rtSendInstruction16(event) {
        if (event && event.preventDefault) event.preventDefault();
        var id = this.state.open16;
        if (!id || !this.canSteer16(id)) return;
        var key = this.discussKey16(id);
        var text = ((this.state.instruct16 || {})[key] || '').trim();
        if (!text) return;
        var steer = ((this.state.steer16 || {})[key] || []).slice();
        var attachments = ((this.state.runAttach16 || {})[key] || []).slice();
        steer.push({k: 'say', role: 'human', who: this.state.member, time: 'Just now', text: text + (attachments.length ? '\nAttached: ' + attachments.map(function (a) { return a.name; }).join(', ') : ''), steer: true, attachments: attachments});
        steer.push({k: 'say', role: 'agent', who: this.speaker16(id), time: 'Just now',
          text: 'Instruction received while this run is active. It is queued for the next step; ' +
            'nothing already recorded above is rewritten.'});
        this.setState({
          steer16: Object.assign({}, this.state.steer16, this.pair16(key, steer)),
          instruct16: Object.assign({}, this.state.instruct16, this.pair16(key, '')),
          runAttach16: Object.assign({}, this.state.runAttach16, this.pair16(key, []))
        });
        this.toast('Instruction queued for this run. Simulated in this design.');
        this.rtLatest16();
      }

      rtStop16() {
        var id = this.state.open16;
        if (!id || !this.canSteer16(id)) return;
        var stop = {time: 'Just now', text: 'Stop requested by ' + this.state.member +
          '. The run finishes its current step and keeps everything recorded so far.'};
        this.setState({stopped16: Object.assign({}, this.state.stopped16, this.pair16(id, stop))});
        this.toast('Stop requested. Simulated in this design.');
      }

      /* Answering a waiting child records the answer in that child's own
         transcript, at the point it arrived, and lets the child continue. The
         obsolete choices disappear rather than sitting under a confirmation. */
      answerChild16(childId, label) {
        var child = this.childRecord16(childId);
        if (!child || !child.question || !child.options.includes(label) || this.runOwner16(childId) !== this.state.member || (this.state.stopped16 || {})[childId]) return;
        if ((this.state.answered16 || {})[childId]) return;
        this.setState({answered16: Object.assign({}, this.state.answered16,
          this.pair16(childId, {label: label, by: this.state.member}))});
        this.toast('Answer saved. The waiting run can continue.');
      }

      childAnswer16(childId) { return (this.state.answered16 || {})[childId] || null; }

      /* ------------------------------------------- scoped composer actions -- */
      /* These write to the open run's own draft and attachments. They never
         touch the main conversation composer, which has its own state. */
      runDraftKey16() {
        var id = this.state.open16;
        return {id: id, key: this.discussKey16(id), field: this.canSteer16(id) ? 'instruct16' : 'ask16'};
      }

      setRunDraft16(text) {
        var slot = this.runDraftKey16();
        if (!slot.id) return;
        var patch = {};
        patch[slot.field] = Object.assign({}, this.state[slot.field], this.pair16(slot.key, text));
        this.setState(patch);
      }

      runDraft16() {
        var slot = this.runDraftKey16();
        return (this.state[slot.field] || {})[slot.key] || '';
      }

      rtPlus16(event) {
        var self = this;
        var slot = this.runDraftKey16();
        if (!slot.id) return;
        var thread = this.thread16(slot.id) || {};
        var files = (this.filesFor13() || []).slice(0, 4);
        var rows = files.map(function (f) {
          return {
            label: f.name, icon: self.icon14('file-code'),
            run: function () { self.attachToRun16(f.name, f.stats || f.kind || ''); }
          };
        });
        rows.push({
          label: 'Reference this run’s revision', icon: this.icon14('git-commit-horizontal'),
          run: function () { self.setRunDraft16(self.runDraft16() + 'On ' + (thread.commit || 'this revision') + ': '); }
        });
        this.openMenu14(null, event, rows, 'Add to this run message');
      }

      attachToRun16(name, meta) {
        var slot = this.runDraftKey16();
        if (!slot.id) return;
        var list = ((this.state.runAttach16 || {})[slot.key] || []).slice();
        if (list.some(function (x) { return x.name === name; })) return;
        list.push({name: name, meta: meta});
        this.setState({runAttach16: Object.assign({}, this.state.runAttach16,
          this.pair16(slot.key, list))});
        this.toast(name + ' attached to this run message.');
      }

      rtDictate16() {
        var slot = this.runDraftKey16();
        if (!slot.id) return;
        var rec = this.record16(slot.id) || this.childRecord16(slot.id) || {};
        var text = slot.field === 'instruct16'
          ? 'Also check the Codex account group at 430px before you close this run.'
          : 'Why did ' + (rec.stage || 'this run') + ' need a second revision?';
        this.setRunDraft16(text);
        this.toast('Sample dictation added to this run message.');
      }

      rtCall16() {
        var id = this.state.open16;
        var rec = this.record16(id) || this.childRecord16(id) || {};
        this.toast('Call topic: ' + (rec.stage || 'this run') + '. Simulated in this design.');
        this.openVoice10();
      }

      /* ------------------------------------------- expand / collapse all -- */
      foldKeys16(id, entries) {
        var keys = ['det:' + id];
        entries.forEach(function (e, i) {
          if (e.k === 'tools' || e.k === 'kids') keys.push('tg:' + id + ':' + i);
        });
        return keys;
      }

      rtToggleAll16() {
        var id = this.state.open16;
        var entries = this.entriesFor16(id);
        var keys = this.foldKeys16(id, entries);
        var self = this;
        var anyClosed = keys.some(function (k) { return !self.fold16(k, false); });
        var next = Object.assign({}, this.state.folds16);
        keys.forEach(function (k) { next[k] = anyClosed; });
        this.setState({folds16: next});
      }

      rtAllExpanded16() {
        var id = this.state.open16;
        if (!id) return false;
        var self = this;
        var keys = this.foldKeys16(id, this.entriesFor16(id));
        return keys.length > 0 && keys.every(function (k) { return self.fold16(k, false); });
      }

      /* --------------------------------------------------------- values -- */
      renderVals() {
        var s = super.renderVals();
        var t = this.state;
        if (!t.folds16) return s;
        var self = this;
        var collapseRunPane = s.collapsePane11;
        s.collapsePane11 = function () { self.rememberScroll16(); if (collapseRunPane) collapseRunPane(); };
        var icon = function (n) { return self.icon14(n); };
        var id = t.open16;
        var thread = this.thread16(id);

        s.runThreadOpen16 = !!thread;
        s.runList16 = this.runList16();
        s.backToRun16 = !!t.returnRun16 && t.inspectorTab10 !== 'runs';
        s.backToRunLabel16 = t.returnRun16
          ? ((this.record16(t.returnRun16) || this.childRecord16(t.returnRun16) || {}).stage || 'the run')
          : '';
        s.backToRun16Go = function () { self.rtOpen16(t.returnRun16); };

        if (!thread) {
          s.rtEntries16 = [];
          s.previewOptions = this.previewOptions16(s);
          return s;
        }

        var rec = this.isChild16(id) ? this.childRecord16(id) : (this.record16(id) || {});
        var attempts = this.attempts16(id);
        var index = this.attemptIndex16(id);
        var attempt = attempts[index] || {};
        var entries = this.entriesFor16(id);
        var query = String(t.find16 || '').trim().toLowerCase();
        var stack = t.stack16 || [];
        var parentId = stack[stack.length - 1] || (this.isChild16(id) ? CHILDREN[id].parent : '');

        s.rtTitle16 = rec.stage || id;
        s.rtSub16 = (rec.model || '') + ' · ' + (thread.effort || 'Medium') + ' effort · ' + (thread.issue || '');
        s.rtStatus16 = attempt.status || rec.status || '';
        s.rtTone16 = attempt.tone || rec.tone || '';
        s.rtBrand16 = rec.brand12;
        s.rtBrandClass16 = rec.brandClass12;
        s.rtKind16 = thread.kind || 'Run';
        s.rtOutcome16 = (this.isChild16(id) && rec.outcome) || thread.outcome || rec.summary || '';

        s.rtHasParent16 = !!parentId;
        s.rtParentLabel16 = parentId
          ? ((this.record16(parentId) || this.childRecord16(parentId) || {}).stage || parentId)
          : '';
        s.rtAllRuns16 = function () { self.rtAllRuns16(); };
        s.rtParent16 = function () { self.rtParent16(); };
        // One Back control: it goes up one level, and says where that is.
        s.rtBackLabel16 = parentId ? s.rtParentLabel16 : 'All runs';
        s.rtBackText16 = s.rtBackLabel16;
        s.rtBackAria16 = parentId
          ? 'Back to the parent run, ' + s.rtParentLabel16
          : 'Back to all runs for this issue';
        s.rtBackAction16 = parentId
          ? function () { self.rtParent16(); }
          : function () { self.rtAllRuns16(); };
        s.rtLatest16 = function () { self.rtLatest16(); };

        /* attempts - only offered when there is more than one */
        s.rtHasAttempts16 = attempts.length > 1;
        s.rtAttemptLabel16 = (attempt.label || 'Attempt 1') + ' of ' + attempts.length +
          (attempt.current ? ' · current' : '');
        s.rtAttemptNote16 = attempt.note || '';
        s.rtAttemptPick16 = function (event) {
          self.openMenu14(null, event, attempts.map(function (a, i) {
            return {
              label: a.label + ' · ' + a.status + (a.current ? ' · current' : ''),
              on: i === index,
              run: function () {
                self.setState({attempt16: Object.assign({}, t.attempt16, self.pair16(id, i))});
              }
            };
          }), 'Run attempt');
        };

        /* quiet toolbar */
        var expandedAll = this.rtAllExpanded16();
        s.rtToggleAll16 = function () { self.rtToggleAll16(); };
        s.rtToggleAllLabel16 = expandedAll ? 'Collapse all' : 'Expand all';
        s.rtToggleAllAria16 = expandedAll
          ? 'Collapse every tool group and detail in this thread'
          : 'Expand every tool group and detail in this thread';
        s.rtToggleAllIcon16 = icon(expandedAll ? 'chevrons-up-down' : 'chevrons-up-down');
        s.rtFindOpen16 = !!t.findOpen16;
        s.rtToggleFind16 = function () {
          self.setState({findOpen16: !t.findOpen16, find16: t.findOpen16 ? '' : t.find16});
        };
        s.rtFind16 = t.find16 || '';
        s.rtEditFind16 = function (event) { self.setState({find16: event.target.value}); };
        s.rtClearFind16 = function () { self.setState({find16: ''}); };

        /* entries */
        var rows = [];
        entries.forEach(function (entry, i) {
          if (query && blob(entry).indexOf(query) < 0) return;
          rows.push(self.entryVals16(entry, i, id));
        });
        s.rtEntries16 = rows;
        s.rtEntryTotal16 = entries.length;
        s.rtFindCount16 = query ? rows.length + ' of ' + entries.length : entries.length + ' entries';
        s.rtNoMatch16 = query && rows.length === 0;
        var toolCount = entries.filter(function (e) { return e.k === 'tools'; }).length;
        s.rtCountLabel16 = entries.length + ' entries · ' + toolCount + (toolCount === 1 ? ' tool group' : ' tool groups');

        /* quiet details */
        var detailKey = 'det:' + id;
        s.rtDetailsOpen16 = this.fold16(detailKey, false);
        s.rtToggleDetails16 = function () { self.toggleFold16(detailKey, false); };
        s.rtDetails16 = this.details16(id, thread, rec, attempt, attempts);
        s.rtLinks16 = this.links16(id, thread);

        /* one waiting child at a time gets a single answerable section */
        var currentChild = this.childRecord16(id);
        var waiting = currentChild && currentChild.tone === 'needs' && currentChild.question ? {id: id, rec: currentChild} : null;
        entries.forEach(function (e) {
          if (e.k !== 'kids') return;
          e.runs.forEach(function (cid) {
            var c = self.childRecord16(cid);
            if (!waiting && c && c.tone === 'needs' && c.question) waiting = {id: cid, rec: c};
          });
        });
        s.rtWaitingChild16 = !!waiting;
        s.rtChildQuestion16 = waiting ? waiting.rec.stage + ': ' + waiting.rec.question : '';
        s.rtChildWhy16 = waiting ? waiting.rec.questionWhy : '';
        s.rtChildOptions16 = waiting && this.runOwner16(waiting.id) === t.member ? waiting.rec.options.map(function (label) {
          return {label: label, pick: function () { self.answerChild16(waiting.id, label); }};
        }) : [];

        /* composers */
        var active = this.canSteer16(id);
        var key = this.discussKey16(id);
        s.rtActive16 = active;
        s.rtInstructDraft16 = (t.instruct16 || {})[key] || '';
        s.rtInstructEmpty16 = !String(s.rtInstructDraft16).trim();
        s.rtInstructPlaceholder16 = 'Give this run an instruction…';
        s.rtEditInstruct16 = function (event) {
          self.setState({instruct16: Object.assign({}, t.instruct16, self.pair16(key, event.target.value))});
        };
        s.rtSendInstruction16 = function (event) { self.rtSendInstruction16(event); };
        s.rtStop16 = function () { self.rtStop16(); };
        s.rtStopLabel16 = 'Stop this run';

        /* Composer controls are scoped to this run, not to the main composer. */
        var attach = (t.runAttach16 || {})[key] || [];
        s.rtHasAttachments16 = attach.length > 0;
        s.rtAttachments16 = attach.map(function (a) {
          return {
            name: a.name, removeLabel: 'Remove ' + a.name + ' from this message',
            remove: function () {
              self.setState({runAttach16: Object.assign({}, self.state.runAttach16,
                self.pair16(key, ((self.state.runAttach16 || {})[key] || [])
                  .filter(function (x) { return x.name !== a.name; })))});
            }
          };
        });
        s.rtPlus16 = function (event) { self.rtPlus16(event); };
        s.rtDictate16 = function () { self.rtDictate16(); };
        s.rtCall16 = function () { self.rtCall16(); };

        s.rtAskDraft16 = (t.ask16 || {})[key] || '';
        s.rtAskEmpty16 = !s.rtAskDraft16.trim();
        s.rtEditAsk16 = function (event) {
          self.setState({ask16: Object.assign({}, t.ask16, self.pair16(key, event.target.value))});
        };
        s.rtAskSend16 = function (event) { self.rtAskSend16(event); };
        s.rtDiscussion16 = (t.discuss16 || {})[key] || [];
        s.rtHasDiscussion16 = s.rtDiscussion16.length > 0;
        s.rtDiscussNote16 = 'Private to ' + t.member + '. This discussion is separate from the run record above.';
        s.rtRecordNote16 = waiting ? 'Answer above to continue this run. Discussion stays private.' : 'Private discussion · The execution record stays unchanged.';
        s.rtReadOnlyNote16 = 'Nothing here can be edited or re-run. Ask about it in the conversation and the answer stays with the whole issue.';
        s.rtDiscussInThread16 = function () { self.rtDiscussInThread16(); };
        if (currentChild) { s.rtStatus16 = currentChild.status; s.rtTone16 = currentChild.tone; }
        if ((t.stopped16 || {})[id]) { s.rtStatus16 = 'Stop requested'; s.rtTone16 = 'needs'; }
        s.rtComposerKey16 = function (event) {
          if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            if (active) self.rtSendInstruction16(event); else self.rtAskSend16(event);
          }
        };

        s.previewOptions = this.previewOptions16(s);
        return s;
      }

      entryVals16(entry, i, id) {
        var self = this;
        var icon = function (n) { return self.icon14(n); };
        var base = {
          time: entry.time || '', who: entry.who || '', text: entry.text || '',
          isSay: false, isTools: false, isFinding: false, isChild: false,
          isResult: false, isHandoff: false, isLive: false, cls: ''
        };

        if (entry.k === 'say') {
          return Object.assign(base, {
            isSay: true,
            cls: 'say16 ' + (entry.role === 'human' ? 'human16'
              : entry.role === 'operator' ? 'op16' : 'agent16') + (entry.steer ? ' steer16' : ''),
            isHuman: entry.role === 'human',
            isOperator: entry.role === 'operator',
            initial: (entry.who || '?')[0],
            steer: !!entry.steer,
            steerLabel: 'Steering · sent while this run was active',
            icon: icon(entry.role === 'operator' ? 'bot' : 'circle-user-round')
          });
        }

        if (entry.k === 'tools') {
          var key = 'tg:' + id + ':' + i;
          var open = this.fold16(key, false);
          return Object.assign(base, {
            isTools: true, cls: 'tools16' + (open ? ' open16' : ''),
            label: entry.label, meta: entry.meta, open: open,
            icon: icon('terminal'),
            aria: (open ? 'Collapse: ' : 'Expand: ') + entry.label,
            toggle: function () { self.toggleFold16(key, false); },
            rows: entry.rows.map(function (r, j) {
              return self.toolRow16(r, key + ':' + j);
            })
          });
        }

        if (entry.k === 'find') {
          return Object.assign(base, {
            isFinding: true,
            cls: 'find16 ' + (entry.sev === 'high' ? 'sev-high16' : entry.sev === 'medium' ? 'sev-med16' : 'sev-low16'),
            title: entry.title, where: entry.where,
            sev: entry.sev === 'high' ? 'High' : entry.sev === 'medium' ? 'Medium' : 'Low',
            icon: icon(entry.sev === 'high' ? 'triangle-alert' : 'circle-alert')
          });
        }

        if (entry.k === 'kids') {
          var gkey = 'tg:' + id + ':' + i;
          var gopen = this.fold16(gkey, entry.runs.length === 1);
          return Object.assign(base, {
            isChild: true, cls: 'kids16' + (gopen ? ' open16' : ''),
            label: entry.label,
            meta: entry.runs.length === 1 ? '1 run' : entry.runs.length + ' runs in parallel',
            open: gopen,
            aria: (gopen ? 'Collapse ' : 'Expand ') + entry.label,
            toggle: function () { self.toggleFold16(gkey, entry.runs.length === 1); },
            icon: icon('waypoints'),
            runs: entry.runs.map(function (cid) { return self.childVals16(cid, id); })
          });
        }

        if (entry.k === 'result') {
          return Object.assign(base, {
            isResult: true, cls: 'result16', title: entry.title,
            icon: icon('circle-check'),
            facts: (entry.facts || []).map(function (f) { return {k: f[0], v: f[1]}; })
          });
        }

        if (entry.k === 'hand') {
          var to = entry.to;
          var label = to ? ((this.record16(to) || this.childRecord16(to) || {}).stage || to) : '';
          return Object.assign(base, {
            isHandoff: true, cls: 'hand16', icon: icon('corner-down-right'),
            hasNext: !!to, nextLabel: label ? 'Open ' + label : '',
            next: function () { self.rtOpen16(to); }
          });
        }

        return Object.assign(base, {
          isLive: true, cls: 'livee16' + (entry.stop ? ' stop16' : ''),
          icon: icon(entry.stop ? 'square' : 'loader')
        });
      }

      toolRow16(r, key) {
        var self = this;
        var all = lines(r.out);
        var long = all.length > HEAD_LINES;
        var open = this.fold16(key, false);
        var shown = !long || open ? all : all.slice(0, HEAD_LINES);
        return {
          icon: this.icon14(OP_ICON[r.op] || 'terminal'),
          title: r.title,
          meta: (OP_LABEL[r.op] || 'Ran') + (r.meta ? ' · ' + r.meta : ''),
          hasOut: !!String(r.out || '').length,
          out: shown.join('\n'),
          outCls: r.exit ? 'bad-out16' : '',
          truncated: long,
          expandLabel: open
            ? 'Show fewer lines'
            : 'Show all ' + all.length + ' lines',
          expandAria: open
            ? 'Collapse the output of ' + r.title
            : 'Show all ' + all.length + ' lines of output from ' + r.title,
          expand: function () { self.toggleFold16(key, false); },
          hasState: r.exit != null,
          state: r.exit != null ? 'exit ' + r.exit : '',
          tone: r.exit ? 'bad14' : 'ok14',
          cls: r.exit ? 'failed16' : ''
        };
      }

      childVals16(cid, parentId) {
        var self = this;
        var c = this.childRecord16(cid) || {};
        var answer = this.childAnswer16(cid);
        return {
          id: cid, stage: c.stage, model: c.model, status: c.status, tone: c.tone,
          detail: c.outcome,
          icon: this.icon14(c.tone === 'needs' ? 'hand' : c.tone === 'running' ? 'loader' : 'circle-check'),
          aria: 'Open the full thread for ' + c.stage,
          open: function () { self.rtOpen16(cid, parentId); },
          waiting: c.tone === 'needs' && !!c.question,
          question: c.question || '',
          questionWhy: c.questionWhy || '',
          options: (c.options || []).map(function (label) {
            return {label: label, pick: function () { self.answerChild16(cid, label); }};
          }),
          answered: !!answer,
          answeredCopy: answer
            ? answer.by + ' answered “' + answer.label + '”. This run is going again.'
            : ''
        };
      }

      details16(id, thread, rec, attempt, attempts) {
        var issue = (this.state.issues || []).find(function (x) { return x.id === thread.issue; }) || {};
        var owner = this.runOwner16(id);
        // A shared run names the funding category. The account label behind it
        // belongs to its owner and is not shown to another member.
        var funding = owner === this.state.member ? rec.funding : owner + '’s subscription';
        var sourceLabel = thread.source && THREADS[thread.source]
          ? (this.record16(thread.source) || {}).stage || thread.source
          : (thread.source || 'Operator assignment');
        if (thread.parent) sourceLabel = ((this.record16(thread.parent) || {}).stage || thread.parent) + ' · ' + thread.parent;
        var times = (attempt.entries || []).map(function (entry) { return entry.time; }).filter(function (time) { return /^\d{2}:\d{2}$/.test(time || ''); });
        var started = times[0] || attempt.started || rec.when || '';
        var ended = times[times.length - 1] || attempt.ended || '';
        var ongoing = this.rtActive16(id), waiting = rec.tone === 'needs' && !!rec.question;
        var duration = attempt.duration || rec.duration || '';
        if (!thread.parent && !thread.attempts && times.length > 1) {
          var minutes = function (time) { var parts = time.split(':'); return Number(parts[0]) * 60 + Number(parts[1]); };
          duration = Math.max(0, minutes(ended) - minutes(started)) + 'm';
        }
        var status = (this.state.stopped16 || {})[id] ? 'Stop requested' : attempt.status || rec.status || '';
        var rows = [
          ['Status', status],
          ['Started', started],
          ['Ended', ongoing ? 'Still running' : waiting ? 'Waiting for an answer' : ended],
          ['Duration', duration],
          ['Model', (rec.model || '') + ' · ' + (thread.effort || 'Medium') + ' effort'],
          ['Execution owner', owner],
          ['Source run', sourceLabel],
          ['Revision', thread.commit || ''],
          ['Credit used', (rec.costLabel || this.cash(rec.cost || 0)) + (thread.parent ? ' · included in parent run' : '')],
          ['Funding', funding || ''],
          ['Workflow', rec.workflow || 'Code review · v3'],
          ['Attempts', attempts.length + (attempts.length === 1 ? ' (no retries)' : ' · earlier attempts kept')]
        ];
        return rows.filter(function (r) { return r[1]; }).map(function (r) { return {k: r[0], v: r[1]}; });
      }

      links16(id, thread) {
        var self = this;
        var out = [];
        var issue = (this.state.issues || []).find(function (x) { return x.id === thread.issue; }) || {};
        if (issue.files && issue.files.length && issue.pr && /#/.test(issue.pr)) {
          out.push({
            label: issue.pr + ' · changed files', icon: this.icon14('git-pull-request'),
            go: function () { self.rtGo16('pr', {prSection12: 'files'}); }
          });
        }
        out.push({
          label: 'Files & context', icon: this.icon14('files'),
          go: function () { self.rtGo16('files', {workspaceSection12: 'files', selectedFile13: null}); }
        });
        out.push({
          label: 'Usage for this conversation', icon: this.icon14('receipt'),
          go: function () { self.rtGo16('usage'); }
        });
        return out;
      }

      runList16() {
        var self = this;
        return this.runRows12().map(function (r) {
          var childIds = r.children16 || [];
          var key = 'rl:' + r.id;
          var open = self.fold16(key, false);
          return Object.assign({}, r, {
            outcome: r.outcome16,
            cls: r.selected ? 'selected' : '',
            aria: 'Open the full run thread for ' + r.stage,
            hasChildren: childIds.length > 0,
            childOpen: open,
            childLabel: childIds.length === 1 ? '1 check' : childIds.length + ' checks',
            childAria: (open ? 'Collapse ' : 'Expand ') + childIds.length + ' child runs of ' + r.stage,
            toggleChildren: function () { self.toggleFold16(key, false); },
            children: childIds.map(function (cid) { return self.childVals16(cid, r.id); })
          });
        });
      }

      previewOptions16(s) {
        var self = this;
        return [
          {
            title: 'V16 · Implementation run · 26 entries',
            copy: 'BOT-241 Implement: reproduce, fix, Alex’s steering, 2 delegated checks, commit 4d912ae',
            action: function () { self.openIssue('BOT-241'); self.rtOpen16('BOT-241-R2'); }
          },
          {
            title: 'V16 · Verification with a live child',
            copy: 'BOT-250 Verification: a failed command retried, a running browser check, a waiting question',
            action: function () { self.openIssue('BOT-250'); self.rtOpen16('BOT-250-R7'); }
          },
          {
            title: 'V16 · Two attempts, kept apart',
            copy: 'BOT-250 revision: attempt 1 stopped at the quota limit, attempt 2 resumed at 16:11',
            action: function () { self.openIssue('BOT-250'); self.rtOpen16('BOT-250-R4'); }
          },
          {
            title: 'V16 · All runs for this issue',
            copy: 'Every stage opens a complete thread, not a summary',
            action: function () { self.openIssue('BOT-241'); self.rtAllRuns16(); self.openInspector10('runs'); }
          }
        ].concat((s.previewOptions || []).filter(function (o) {
          return !String(o.title).startsWith('V16 ·');
        }));
      }
    };
  };
})();

