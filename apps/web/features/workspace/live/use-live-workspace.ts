"use client";

/* Hydrates the design's logic from the API and sends its actions back.
 *
 * The design owns presentation: grouping, labels, ordering, every pixel. This
 * layer only swaps the fixture rows for real ones and routes the handlers that
 * change something to the server. When NEXT_PUBLIC_BOTINC_API_URL is unset the
 * hook does nothing at all, so the fixtures still drive the screens and the
 * pixel proof stays reproducible. */

import { useEffect, useRef } from "react";
import { Client, type Conversation, type Issue, type User, type WSEvent, type WorkspaceClient } from "@botinc/api";
import type { DCLogic } from "@/lib/dc/logic";
import { mapAccount, mapAutopilot, mapConversation, mapIssue, mapRun, type PeopleIndex } from "./map";

export type LiveStatus = "off" | "connecting" | "live" | "signed-out" | "error";

type Logic = DCLogic<Record<string, unknown>> & {
  state: Record<string, unknown>;
  setState: (patch: Record<string, unknown>) => void;
  toast?: (text: string) => void;
};

declare global {
  interface Window { __BOTINC__?: { apiURL?: string } }
}

/* Workspace state that is indexed by the member's name. */
const MEMBER_KEYED = [
  "connections", "agentPrefs", "funding", "memoryByMember", "skillGrants",
  "modelAccounts", "preferencesBy10", "fallbackPolicies10",
] as const;

export function apiBaseURL(): string {
  if (typeof window === "undefined") return "";
  return (window.__BOTINC__?.apiURL ?? "").trim();
}

export function useLiveWorkspace(logic: Logic | null, onStatus?: (s: LiveStatus, detail?: string) => void) {
  /* Keep the callback in a ref: a caller that passes an inline function must
     not tear down the socket on every render. */
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;

  useEffect(() => {
    const baseURL = apiBaseURL();
    if (!logic || !baseURL) {
      statusRef.current?.("off");
      return;
    }
    let alive = true;
    const abort = new AbortController();
    const report = (s: LiveStatus, detail?: string) => { if (alive) statusRef.current?.(s, detail); };
    report("connecting");

    const api = new Client({ baseURL, onUnauthenticated: () => report("signed-out") });
    let disconnect: (() => void) | undefined;

    (async () => {
      let me: User | null = null;
      let ws: WorkspaceClient;
      try {
        me = (await api.me(abort.signal)).user;
        const { workspaces } = await api.workspaces(abort.signal);
        const first = workspaces[0];
        if (!first) {
          report("error", "this account has no workspace");
          return;
        }
        ws = api.workspace(first.slug);
      } catch (err) {
        if (!alive) return;
        report(err instanceof Error && "status" in err && (err as { status: number }).status === 401 ? "signed-out" : "error", String(err));
        return;
      }

      const people: PeopleIndex = new Map();
      if (me) people.set(me.id, { name: me.name, email: me.email });

      const hydrate = async () => {
        if (!alive) return;
        const [issues, conversations, autopilots, accounts, overview] = await Promise.allSettled([
          ws.issues(undefined, abort.signal),
          ws.conversations(abort.signal),
          ws.autopilots(abort.signal),
          ws.accounts(abort.signal),
          ws.overview(abort.signal),
        ]);
        if (!alive) return;
        const patch: Record<string, unknown> = {};
        if (issues.status === "fulfilled") {
          patch["issues"] = issues.value.issues.map((i: Issue) => mapIssue(i, people));
        }
        /* The signed-in person replaces the design's sample persona. The
           workspace derives roughly forty strings from `member`, so setting it
           here is what stops a real workspace introducing itself as someone
           else. */
        const previous = String(logic.state["member"] ?? "");
        const member = me ? (me.name.trim() || me.email.split("@")[0] || "You") : previous;
        if (me && member !== previous) {
          patch["member"] = member;
          /* `member` is also the key into nine per-member maps. Renaming it
             without moving them leaves every one of those lookups undefined,
             and the first render throws. Anything with no API behind it keeps
             the design's default under the new key rather than disappearing. */
          for (const key of MEMBER_KEYED) {
            const map = logic.state[key] as Record<string, unknown> | undefined;
            if (!map || typeof map !== "object") continue;
            const moved: Record<string, unknown> = {};
            moved[member] = map[previous];
            patch[key] = moved;
          }
        }

        if (conversations.status === "fulfilled") {
          /* The design indexes chats by state.member and calls .find on the
             result, so the key has to be the member the logic is on. Keying by
             anything else left chats[member] undefined and threw on the first
             render. */
          const rows = conversations.value.conversations.map((c: Conversation) => mapConversation(c, [], me, people));
          patch["chats"] = { [member]: rows };
        }
        if (autopilots.status === "fulfilled") {
          patch["autopilots9"] = autopilots.value.autopilots.map(mapAutopilot);
        }
        if (accounts.status === "fulfilled") {
          const rows = accounts.value.accounts.map(mapAccount);
          patch["accounts10"] = rows;
          /* The provider chips in the rail read modelAccounts[member]. Leaving
             the design's twenty samples there next to one real account is the
             kind of plausible-but-wrong surface that is worse than an empty
             one. */
          patch["modelAccounts"] = { [member]: rows };
        }
        if (overview.status === "fulfilled") {
          const ws0 = overview.value.workspace;
          if (ws0?.plan) patch["plan"] = ws0.plan.charAt(0).toUpperCase() + ws0.plan.slice(1);
          /* The footer reads monthly + purchased. The split is a fixture
             concept; the ledger has one balance, so it goes in one bucket
             rather than being apportioned into a shape the server never
             reported. */
          patch["monthly"] = 0;
          patch["purchased"] = overview.value.credit_cents / 100;
          patch["runningRuns"] = overview.value.running_runs;
        }
        if (Object.keys(patch).length) logic.setState(patch);
        report("live");
      };

      await hydrate();
      if (!alive) return;

      /* Writes go to the server; the socket brings back what changed, so the
         screen never shows an optimistic row the server did not accept. */
      installActions(logic, ws, report);

      disconnect = ws.connect(
        (event: WSEvent) => { void onEvent(event, hydrate); },
        (up: boolean) => report(up ? "live" : "connecting"),
      );
    })();

    return () => {
      alive = false;
      abort.abort();
      disconnect?.();
    };
  }, [logic]);
}

/* A change anywhere re-reads the lists it could have touched. Refetching is
   the honest option: a hand-patched local row can drift from the server and
   nobody notices until the numbers disagree. */
let pending: ReturnType<typeof setTimeout> | undefined;
async function onEvent(event: WSEvent, hydrate: () => Promise<void>) {
  if (event.type === "hello") return;
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => { void hydrate(); }, 150);
}

function installActions(logic: Logic, ws: WorkspaceClient, report: (s: LiveStatus, detail?: string) => void) {
  const fail = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    logic.toast?.(message);
    report("error", message);
  };

  const l = logic as unknown as Record<string, unknown>;

  /* Only the handlers that change something are replaced. Everything else -
     navigation, filtering, every dialog - stays the design's own code. */
  const send = l["send"];
  if (typeof send === "function") {
    l["send"] = async () => {
      const draft = String(logic.state["draft"] ?? "").trim();
      if (!draft) return;
      const activeId = logic.state["activeChat"] as string | null;
      logic.setState({ draft: "" });
      try {
        if (activeId) await ws.sendMessage(activeId, draft);
        else await ws.createConversation({ message: draft });
      } catch (err) { fail(err); }
    };
  }

  const work = l["workOnIssue"] ?? l["startWork"];
  if (typeof work === "function") {
    const key = l["workOnIssue"] ? "workOnIssue" : "startWork";
    l[key] = async (issue: { uuid?: string; id?: string }) => {
      const id = issue?.uuid ?? issue?.id;
      if (!id) return;
      try { await ws.work(id); } catch (err) { fail(err); }
    };
  }
}

/* Exported for the tests: the mapping is the part most likely to drift. */
export { mapIssue, mapConversation, mapAutopilot, mapAccount, mapRun };
export type { Issue };
