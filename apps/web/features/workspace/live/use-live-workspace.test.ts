import { afterEach, describe, expect, it } from "vitest";
import { accountHydrationPatch, conversationRoutingPatch, hydrationIssueKey, issueThinkingLabel, lastReportedProviderRing, liveConnectedConnectorNames, liveFeaturedConnectorNames, livePersonaDefaults, liveRoutineConnectorNames, normalizeScheduleSourceLogo, openNewChatWithDraft, readDraft, routineTrigger, runFailurePatch, saveDraft, threadInspectorPatch } from "./use-live-workspace";

describe("new conversation drafts", () => {
  const values = new Map<string, string>();

  afterEach(() => {
    values.clear();
    Reflect.deleteProperty(globalThis, "window");
  });

  it("restores the workspace draft after New chat resets the composer", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => values.get(key) ?? null,
          removeItem: (key: string) => values.delete(key),
          setItem: (key: string, value: string) => values.set(key, value),
        },
      },
    });

    const state = {
      activeChat: "conversation-1",
      draft: "current conversation",
      funding: { Alex: "subscription" },
      member: "Alex",
      model: "GPT-5.6 Sol",
      reasoning: "Extra High",
    };
    const logic = {
      state,
      setState(patch: Record<string, unknown>) {
        Object.assign(state, patch);
      },
    };
    saveDraft("workspace-1", null, "saved new conversation");

    openNewChatWithDraft(logic, "workspace-1", () => {
      Object.assign(state, { activeChat: null, draft: "", model: "Auto" });
    });

    expect(state).toEqual({
      activeChat: null,
      draft: "saved new conversation",
      funding: { Alex: "subscription" },
      member: "Alex",
      model: "GPT-5.6 Sol",
      reasoning: "Extra High",
    });
  });

  it("preserves subscription funding during live refreshes", () => {
    expect(livePersonaDefaults("Alex", "subscription").funding).toEqual({ Alex: "subscription" });
  });

  it("keeps drafts isolated by workspace and conversation", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => values.get(key) ?? null,
          removeItem: (key: string) => values.delete(key),
          setItem: (key: string, value: string) => values.set(key, value),
        },
      },
    });

    const firstConversation = "a25d7fc7-4e36-4aeb-8622-6d64f250c5bb";
    const secondConversation = "f270ca09-3b7f-4789-befb-2ef34d066881";
    saveDraft("workspace-a", firstConversation, "first draft");
    saveDraft("workspace-a", secondConversation, "second draft");
    saveDraft("workspace-b", firstConversation, "other workspace");

    expect(readDraft("workspace-a", firstConversation)).toBe("first draft");
    expect(readDraft("workspace-a", secondConversation)).toBe("second draft");
    expect(readDraft("workspace-b", firstConversation)).toBe("other workspace");

    saveDraft("workspace-a", firstConversation, "");
    expect(readDraft("workspace-a", firstConversation)).toBe("");
    expect(readDraft("workspace-a", secondConversation)).toBe("second draft");
  });
});

describe("routine triggers", () => {
  it("turns the Workspace v19 daily schedule into the API cron shape", () => {
    expect(routineTrigger({ kind: "schedule", cadence: "daily", time: "09:30", zone: "Europe/Madrid" })).toEqual({
      kind: "schedule", cron: "30 9 * * *", tz: "Europe/Madrid",
    });
  });

  it("preserves an imported interval cron the editor cannot express", () => {
    expect(routineTrigger({ kind: "schedule", cadence: "Every 10 minutes", cron: "*/10 * * * *", zone: "UTC" })).toEqual({
      kind: "schedule", cron: "*/10 * * * *", tz: "UTC",
    });
  });

  it("uses the icon fallback when a routine source has no resolved brand logo", () => {
    expect(normalizeScheduleSourceLogo({ source: "BotInc", sourceLogo: "", hasSourceLogo: true })).toEqual({
      source: "BotInc", sourceLogo: "", hasSourceLogo: false,
    });
    expect(normalizeScheduleSourceLogo({ source: "GitHub", sourceLogo: "/brands/github.svg", hasSourceLogo: false })).toEqual({
      source: "GitHub", sourceLogo: "/brands/github.svg", hasSourceLogo: true,
    });
  });

  it("resolves only the connected connectors attached to the active routine", () => {
    expect(liveRoutineConnectorNames({ pluginIds: ["p2", "p1", "p4"] }, [
      { id: "p1", kind: "mcp:gmail", status: "connected", account: {} },
      { id: "p2", kind: "mcp:custom-research", status: "connected", account: { name: "Research MCP" } },
      { id: "p3", kind: "mcp:github", status: "connected", account: {} },
      { id: "p4", kind: "mcp:slack", status: "needs_reauth", account: {} },
    ])).toEqual(["Gmail", "Research MCP"]);
  });
});

describe("work conversation layout", () => {
  it("hydrates the routed issue on a cold deep link before active state exists", () => {
    expect(hydrationIssueKey(undefined, "issue-from-route", false)).toBe("issue-from-route");
    expect(hydrationIssueKey("stale-sample-issue", "issue-from-route", false)).toBe("issue-from-route");
    expect(hydrationIssueKey("active-issue", "stale-route", true)).toBe("active-issue");
  });

  it("seeds every member-scoped collection before showing a cold deep link", () => {
    expect(livePersonaDefaults("Route Member")).toEqual({
      chats: { "Route Member": [] },
      connections: { "Route Member": {} },
      agentPrefs: { "Route Member": {} },
      funding: { "Route Member": "credits" },
      memoryByMember: { "Route Member": {} },
      skillGrants: { "Route Member": {} },
      modelAccounts: { "Route Member": [] },
      preferencesBy10: { "Route Member": "" },
      fallbackPolicies10: { "Route Member": "ask" },
    });
  });

  it("opens the Workspace v19 issue inspector on desktop deep links", () => {
    expect(threadInspectorPatch(true)).toEqual({
      inspector10: true,
      mobileInspector10: false,
      inspectorTab10: "issue",
      paneWidth11: 400,
      paneRestore11: 400,
    });
  });

  it("leaves the mobile conversation full width", () => {
    expect(threadInspectorPatch(false)).toEqual({
      inspector10: false,
      mobileInspector10: false,
    });
  });
});

describe("failed conversation runs", () => {
  it("surfaces the backend failure beside the composer", () => {
    expect(runFailurePatch({ status: "failed", error: "codex exited non-zero: exit status 2" })).toEqual({
      composerError10: "Run failed: codex exited non-zero: exit status 2",
    });
  });

  it("clears an earlier failure after a successful run", () => {
    expect(runFailurePatch({ status: "done", error: "" })).toEqual({ composerError10: "" });
  });
});

describe("conversation routing hydration", () => {
  it("draws a neutral provider ring from stale but real quota observations", () => {
    const group = lastReportedProviderRing({ id: "claude", name: "Claude", index14: "n/a" }, [
      { provider: "claude", limits: [{ percent: 93 }, { percent: 57 }] },
      { provider: "claude", limits: [{ percent: 17 }] },
      { provider: "codex", limits: [{ percent: 2 }] },
    ]);

    expect(group).toMatchObject({
      index14: "45%",
      indexTone14: "muted14 reported14",
      ringStyle14: "--used14:198deg;--used:198deg;--remaining:162deg",
      usedLabel19: "55% used",
    });
    expect(group.aria14).toContain("last reported average capacity left 45%");
  });

  it("keeps a provider with no quota observation on an empty track", () => {
    expect(lastReportedProviderRing({ id: "hermes", index14: "n/a" }, [
      { provider: "hermes", limits: [] },
    ])).toMatchObject({ index14: "n/a", indexTone14: "muted14 no-report14" });
  });

  it("hydrates provider accounts with a cold conversation so its subscription route is immediately resolvable", () => {
    const patch = accountHydrationPatch("Alejandro", [{
      id: "a1", provider: "codex", label: "", email: "alejandro@example.test", plan: "team",
      kind: "subscription", status: "connected", quota: [{ window: "week", used: 0, limit: 100 }], has_secret: true,
    }]);
    expect(patch.modelAccounts.Alejandro).toHaveLength(1);
    expect(patch.modelAccounts.Alejandro[0]).toMatchObject({ provider: "codex", kind: "subscription", enabled: true });
    expect(patch.accounts10).toEqual(patch.modelAccounts.Alejandro);
  });

  it("restores the exact model, effort, and subscription funding from the latest run", () => {
    expect(conversationRoutingPatch("Alejandro", { model: "auto" }, {
      model: "GPT-5.6 Sol", effort: "Extra High", funding: "subscription",
    })).toEqual({
      model: "GPT-5.6 Sol",
      reasoning: "Extra High",
      funding: { Alejandro: "subscription" },
    });
  });

  it("normalizes auto and preserves an explicit credit-funded run", () => {
    expect(conversationRoutingPatch("Alejandro", { model: "auto" }, {
      model: "auto", effort: "Medium", funding: "credits",
    })).toEqual({
      model: "Auto",
      reasoning: "Medium",
      funding: { Alejandro: "credits" },
    });
  });

  it("does not overwrite a chat effort with an unrelated empty issue", () => {
    expect(issueThinkingLabel("chat", "Extra High", undefined)).toBe("Extra High");
    expect(issueThinkingLabel("thread9", "Extra High", { effort: "Low" })).toBe("Low");
  });
});

describe("live conversation connectors", () => {
  it("lists connected MCP plugins instead of the design fixture", () => {
    expect(liveConnectedConnectorNames([
      { kind: "mcp:github", status: "connected" },
      { kind: "mcp:google-drive", status: "connected" },
      { kind: "mcp:slack", status: "needs_reauth" },
      { kind: "oauth:google", status: "connected" },
    ])).toEqual(["GitHub", "Google Drive"]);
  });

  it("names connectors the way the design's brand catalog does, then by the member's own server name", () => {
    expect(liveConnectedConnectorNames([
      { kind: "mcp:posthog", status: "connected", account: { name: "posthog" } },
      { kind: "mcp:claude-design", status: "connected", account: {} },
      { kind: "mcp:didit-docs", status: "connected", account: { name: "didit-docs" } },
      { kind: "mcp:internal-wiki", status: "connected", account: {} },
    ])).toEqual(["PostHog", "Claude Design", "didit-docs", "Internal Wiki"]);
  });

  it("features the branded connectors first when more than four are connected", () => {
    expect(liveFeaturedConnectorNames([
      { kind: "mcp:attio", status: "connected", account: { name: "attio" } },
      { kind: "mcp:braintrust", status: "connected", account: { name: "braintrust" } },
      { kind: "mcp:codegraph", status: "connected", account: { name: "codegraph" } },
      { kind: "mcp:github", status: "connected", account: { name: "GitHub" } },
      { kind: "mcp:slack", status: "connected", account: { name: "slack" } },
      { kind: "mcp:gmail", status: "connected", account: { name: "gmail" } },
    ])).toEqual(["GitHub", "Slack", "Gmail", "attio"]);
  });
});
