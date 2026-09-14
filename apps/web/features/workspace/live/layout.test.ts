import { describe, expect, it } from "vitest";
import {
  absolutePublicAsset,
  clampConversationPaneWidth,
  conversationPaneBounds,
  normalizePublicAssets,
} from "./layout";

describe("workspace public assets", () => {
  it("anchors design assets and symbol sprites at the domain root", () => {
    expect(absolutePublicAsset("assets/brands-v12/claude.svg")).toBe("/assets/brands-v12/claude.svg");
    expect(absolutePublicAsset("i15.svg#git-branch")).toBe("/i15.svg#git-branch");
    expect(absolutePublicAsset("/assets/brands-v12/claude.svg")).toBe("/assets/brands-v12/claude.svg");
    expect(absolutePublicAsset("https://cdn.example.com/logo.svg")).toBe("https://cdn.example.com/logo.svg");
    expect(absolutePublicAsset("blob:preview")).toBe("blob:preview");
  });

  it("normalizes nested presentation values without failing on cycles", () => {
    const values: Record<string, unknown> = {
      icon: "i15.svg#circle-check",
      providers: [{ src: "assets/providers/claude-v8.svg" }],
      copy: "assets remain part of this sentence",
    };
    values.self = values;

    normalizePublicAssets(values);

    expect(values.icon).toBe("/i15.svg#circle-check");
    expect(values.providers).toEqual([{ src: "/assets/providers/claude-v8.svg" }]);
    expect(values.copy).toBe("assets remain part of this sentence");
    expect(values.self).toBe(values);
  });
});

describe("conversation pane sizing", () => {
  it("preserves useful chat width on wide screens", () => {
    expect(conversationPaneBounds(1440)).toEqual({ min: 360, max: 720 });
    expect(conversationPaneBounds(1190)).toEqual({ min: 360, max: 670 });
    expect(clampConversationPaneWidth(900, 1190)).toBe(670);
  });

  it("keeps the pane usable without crushing a narrow desktop chat", () => {
    expect(conversationPaneBounds(800)).toEqual({ min: 300, max: 360 });
    expect(clampConversationPaneWidth(100, 800)).toBe(300);
  });
});
