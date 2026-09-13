# V14 product contracts

This is a design proposal for implementation after review.
Prototype data and actions are simulated.

## One conversation and its execution

The user talks to one Operator.
A conversation can link to an issue, and each turn can create runs for implementation, reviews, tools and approvals.
The main conversation shows useful progress and decisions; Runs preserves the complete stage history and model attribution.
Each run records its workflow version, selected model, execution owner, funding source, timestamps, tool results, artifacts and terminal outcome.

Forking at a message creates a new conversation with the prefix through that message and a link back to the source.
It preserves the original conversation and does not undo file changes, sent messages or other completed actions.
A fork starts with its own subsequent messages and pending decisions; it must not inherit an already-satisfied approval as permission for a different action.
Queued follow-ups can be edited, removed or retried without interrupting the current turn.

## Workflow editor

A saved workflow version consists of typed nodes, explicit edges, entry/exit nodes and execution limits.
The editor exposes task, condition, bounded repeat, user question and approval nodes.
Parallel execution is represented by multiple task edges; the review condition joins their results.
Model, effort, prompt, tool/connector requirements and expected outputs belong to the selected node.
Edges can have labelled conditions and refer only to validated outputs from preceding nodes.

Validation checks missing configuration, unreachable nodes, dangling edges, invalid condition references, join semantics and unbounded cycles.
An explicit repeat node has a maximum number of attempts and an exit to human attention when exhausted.
Independent reviewers receive the same immutable artifact revision, and approval applies to that revision.
Editing the graph creates a draft; activating a version affects future runs while in-flight and historical runs keep their existing version.

Test runs are isolated and show the path taken, inputs, outputs and failure location.
AI-assisted graph edits produce a concrete change preview with apply and undo.
The chat remains an assistant to the editor; users can inspect and edit the graph directly.

## Capacity and funding

Per-account usage windows remain separate and carry the provider label, used fraction, reset timestamp, observed timestamp and availability state.
All visual bars in V14 are explicitly labelled as remaining capacity.
Unknown or stale capacity must never appear as zero usage or unlimited access.

The outer provider ring is a capacity index: the mean of the tightest reported window for current reporting accounts owned by the current user.
Routing eligibility is displayed separately; capacity that cannot currently route is identified.
It is not a pooled token allowance or a dollar balance.
Its tooltip states the included denominator and excluded unknown, stale, disabled or disconnected accounts.
Model-specific account eligibility is applied when choosing a route, even if the broader provider index looks healthy.
Provider subscription limits are never converted into BotInc credit value.

BotInc credits remain a separate ledger with monthly grants, top-ups, usage charges, adjustments and balance.
Subscription-first routing asks for consent before switching to credit funding when required by the user's policy.

## Memory core

The core separates conversation working state, reusable facts/preferences, examples from prior work and procedural guidance.
Its UI presents readable memories with source and scope, keeping retrieval mechanics in the service.
The current BotInc memory type already includes provenance, validity, supersession and recall metadata; personal Operator ownership needs an explicit server contract.

Every memory is scoped to an owner and permitted workspace/project context before retrieval candidates are ranked.
Private memories are not promoted to workspace knowledge merely because a conversation is shared.
Connector-derived material retains source identity and access constraints; revoked access invalidates its eligibility.
Secret values are excluded from extraction and from repository context supplied to chat.

New candidates are checked for duplicates, contradictions and outdated references before promotion.
User corrections take precedence over inferred facts, with a reviewable replacement proposal when the system is uncertain.
Pinned instructions, ordinary facts and historical episodes have distinct retrieval policies.
Time-sensitive memories carry review or validity dates, and expired information is not presented as current.

The user can inspect why a memory was used, follow its source, edit it, reject a suggestion or forget it.
Forgetting removes the memory from future retrieval and the memory UI.
Deleting the source conversation is a separate explicit action, explained at the point of choice.
Quality evaluation covers recall on real tasks, false recall, stale recall, contradictory updates, cross-user leakage and verified deletion.

## Recent memory research and evaluation

[LongMemEval-V2](https://arxiv.org/abs/2605.12493) evaluates environment experience across state recall, changing state, workflow knowledge, recurring pitfalls and premise awareness.
BotInc should test these abilities on its own repository, issue, connector and review histories, rather than scoring only conversational recall.
[MemForest](https://arxiv.org/abs/2605.23986), revised September 6, 2026, studies parallel extraction and temporal indexing to make new memories available sooner.
For this proposal, that motivates asynchronous extraction, incremental refresh and visible freshness metadata.
[Skill-Pro](https://arxiv.org/abs/2602.01869) studies learning reusable skills from prior execution experience.
BotInc should require successful replay or review before promoting an observed workaround into reusable procedural guidance.
These are design inferences from recent research; algorithm selection still needs matched evaluation on BotInc tasks and latency requirements.

## Remote repository readiness

Repository settings hold connection status, sandbox startup configuration and environment variable names with masked secret values.
The startup assistant inspects dependency manifests, service requirements and test commands in parallel, then proposes the smallest set of setup files.
It validates the proposal in a fresh remote sandbox and reports install, service readiness and smoke-test results separately.
Missing secrets produce named requirements, never invented values.
Changes to repository files are reviewable diffs and use the normal PR process after implementation.

## Membership and migration

Roles express permissions over work, repositories, workflows, integrations, members and billing.
Owner-only capabilities cannot be granted through an ordinary custom role.
Project restrictions remain visible when inviting someone and when previewing effective permissions.
Invitations expire and can be revoked; pending invitations do not imply active membership.

Issue migration is a one-time Work action with provider choice, field/status/member mapping, duplicate handling and an import preview.
Parent/subissue relationships and source links are preserved where available.
Partial failures are retryable without duplicating successful imports.
Migration does not silently create ongoing synchronization.

## References

The thread/turn/item model follows the [Codex App Server description](https://openai.com/index/unlocking-the-codex-harness/).
Memory scope and memory-type choices draw on [LangChain's memory overview](https://docs.langchain.com/oss/python/concepts/memory) and [Letta's scoped memory blocks](https://docs.letta.com/tutorials/attaching-detaching-blocks/).
The workflow interaction references include [Plain on Mobbin](https://mobbin.com/screens/fc2573d6-f22b-42b5-bc94-f6917a39649c), [Flodesk on Mobbin](https://mobbin.com/screens/daf1786d-d41f-4cfd-8cf4-4ee3b9c45519) and [n8n node documentation](https://docs.n8n.io/workflows/components/nodes/).
These sources inform the proposal; they do not establish one universally best memory or workflow architecture.

