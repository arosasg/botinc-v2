import { describe, expect, it } from "vitest";
import { parseMessageBlocks } from "./message-markdown";

describe("parseMessageBlocks", () => {
  it("structures migrated headings, paragraphs, lists, quotes, and code", () => {
    expect(parseMessageBlocks("## Result\n\nDone **safely**.\n\n- one\n- two\n\n> review\n\n```\npnpm test\n```"))
      .toEqual([
        { type: "heading", level: 2, text: "Result" },
        { type: "paragraph", text: "Done **safely**." },
        { type: "list", ordered: false, items: ["one", "two"] },
        { type: "quote", text: "review" },
        { type: "code", text: "pnpm test" },
      ]);
  });

  it("removes the migration file directive without removing its link", () => {
    expect(parseMessageBlocks("!file [review.zip](https://api.botinc.ai/review.zip)"))
      .toEqual([{ type: "paragraph", text: "[review.zip](https://api.botinc.ai/review.zip)" }]);
    expect(parseMessageBlocks("!filereview-evidence.zip"))
      .toEqual([{ type: "paragraph", text: "review-evidence.zip" }]);
  });
});
