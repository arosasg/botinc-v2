export interface WorkspaceRoute {
  workspace: string;
  view: string;
  conversation?: string;
  issue?: string;
  autopilot?: string;
  section?: string;
  workflow?: string;
}

function decodeSegment(value: string | undefined): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function legacyRoute(url: URL): WorkspaceRoute {
  return {
    workspace: url.searchParams.get("workspace") || "",
    view: url.searchParams.get("view") || "chat",
    ...(url.searchParams.get("conversation") ? { conversation: url.searchParams.get("conversation")! } : {}),
    ...(url.searchParams.get("issue") ? { issue: url.searchParams.get("issue")! } : {}),
    ...(url.searchParams.get("autopilot") ? { autopilot: url.searchParams.get("autopilot")! } : {}),
    ...(url.searchParams.get("section") ? { section: url.searchParams.get("section")! } : {}),
    ...(url.searchParams.get("workflow") ? { workflow: url.searchParams.get("workflow")! } : {}),
  };
}

export function parseWorkspaceRoute(url: URL): WorkspaceRoute {
  const segments = url.pathname.split("/").filter(Boolean).map(decodeSegment);
  if (segments[0] !== "w" || !segments[1]) return legacyRoute(url);

  const workspace = segments[1];
  const resource = segments[2] || "";
  const id = segments[3] || "";
  if (!resource) return { workspace, view: "chat" };
  if (resource === "chats" && id) return { workspace, view: "chat", conversation: id };
  if (resource === "work" && !id) return { workspace, view: "work" };
  if (resource === "work" && id) {
    return { workspace, view: segments[4] === "conversation" ? "thread9" : "issue", issue: id };
  }
  if (resource === "schedule") return { workspace, view: "schedule9" };
  if (resource === "autopilots" && id) return { workspace, view: "auto9", autopilot: id };
  if (resource === "plugins") return { workspace, view: "plugins10" };
  if (resource === "skills") return { workspace, view: "skills10" };
  if (resource === "profile") return { workspace, view: "profile10" };
  if (resource === "settings") return { workspace, view: "settings", section: id || "connections" };
  if (resource === "workflows" && id) {
    return { workspace, view: "settings", section: "workflows", workflow: id };
  }
  return { workspace, view: "chat" };
}

function segment(value: unknown): string {
  return encodeURIComponent(String(value || ""));
}

export function workspacePath(route: WorkspaceRoute): string {
  const root = `/w/${segment(route.workspace)}`;
  if (route.view === "chat" && route.conversation) return `${root}/chats/${segment(route.conversation)}`;
  if (route.view === "work") return `${root}/work`;
  if (route.view === "issue" && route.issue) return `${root}/work/${segment(route.issue)}`;
  if (route.view === "thread9" && route.issue) return `${root}/work/${segment(route.issue)}/conversation`;
  if (route.view === "schedule9") return `${root}/schedule`;
  if (route.view === "auto9" && route.autopilot) return `${root}/autopilots/${segment(route.autopilot)}`;
  if (route.view === "plugins10") return `${root}/plugins`;
  if (route.view === "skills10") return `${root}/skills`;
  if (route.view === "profile10") return `${root}/profile`;
  if (route.workflow) return `${root}/workflows/${segment(route.workflow)}`;
  if (route.view === "settings") return `${root}/settings/${segment(route.section || "connections")}`;
  return root;
}
