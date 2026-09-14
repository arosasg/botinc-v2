import { afterEach, describe, expect, it } from "vitest";
import { openNewChatWithDraft, saveDraft } from "./use-live-workspace";

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
