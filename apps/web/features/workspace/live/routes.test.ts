import { describe, expect, it } from "vitest";
import { parseWorkspaceRoute, workspacePath } from "./routes";

describe("workspace paths", () => {
  const workspace = "v1-44148312";
  const conversation = "3d24e70f-a99d-4fc5-a09d-57212fd42612";
  const issue = "e93e0bea-3680-4cdf-9e76-2dcfdab317a5";

  it("gives chats and work records stable shareable paths", () => {
    expect(workspacePath({ workspace, view: "chat", conversation })).toBe(`/w/${workspace}/chats/${conversation}`);
    expect(workspacePath({ workspace, view: "issue", issue })).toBe(`/w/${workspace}/work/${issue}`);
    expect(workspacePath({ workspace, view: "thread9", issue })).toBe(`/w/${workspace}/work/${issue}/conversation`);
  });

  it("round trips every routable Workspace v19 surface without query parameters", () => {
    const routes = [
      { workspace, view: "chat" },
      { workspace, view: "work" },
      { workspace, view: "schedule9" },
      { workspace, view: "auto9", autopilot: "routine-1" },
      { workspace, view: "plugins10" },
      { workspace, view: "skills10" },
      { workspace, view: "profile10" },
      { workspace, view: "settings", section: "accounts" },
      { workspace, view: "settings", section: "workflows", workflow: "workflow-1" },
    ];
    for (const route of routes) {
      const path = workspacePath(route);
      expect(path).not.toContain("?");
      expect(parseWorkspaceRoute(new URL(path, "https://botinc.ai"))).toEqual(route);
    }
  });

  it("still reads old query links so they can be canonicalized after hydration", () => {
    const url = new URL(`https://botinc.ai/w?workspace=${workspace}&view=chat&conversation=${conversation}`);
    expect(parseWorkspaceRoute(url)).toEqual({ workspace, view: "chat", conversation });
  });
});
