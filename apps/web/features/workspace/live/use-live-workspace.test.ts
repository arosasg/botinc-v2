import { afterEach, describe, expect, it } from "vitest";
import { openNewChatWithDraft, routineTrigger, saveDraft, threadInspectorPatch } from "./use-live-workspace";

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
