import { afterEach, describe, expect, it } from "vitest";
import { hydrationIssueKey, openNewChatWithDraft, readDraft, routineTrigger, saveDraft, threadInspectorPatch } from "./use-live-workspace";

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

    const state = { activeChat: "conversation-1", draft: "current conversation" };
    const logic = {
      setState(patch: Record<string, unknown>) {
        Object.assign(state, patch);
      },
    };
    saveDraft("workspace-1", null, "saved new conversation");

    openNewChatWithDraft(logic, "workspace-1", () => {
      Object.assign(state, { activeChat: null, draft: "" });
    });

    expect(state).toEqual({ activeChat: null, draft: "saved new conversation" });
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
});

describe("work conversation layout", () => {
  it("hydrates the routed issue on a cold deep link before active state exists", () => {
    expect(hydrationIssueKey(undefined, "issue-from-route", false)).toBe("issue-from-route");
    expect(hydrationIssueKey("stale-sample-issue", "issue-from-route", false)).toBe("issue-from-route");
    expect(hydrationIssueKey("active-issue", "stale-route", true)).toBe("active-issue");
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
    expect(threadInspectorPatch(false)).toEqual({});
  });
});
