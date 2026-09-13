/* The browser's client for the BotInc API.
 *
 * Session cookies do the authenticating, so every request is credentialed and
 * nothing here ever holds a token. A failure surfaces the server's own words:
 * the UI must never invent an explanation for something it did not diagnose. */

import type {
  Account, Autopilot, Conversation, Issue, IssueComment, Message, Overview,
  Skill, Memory, Member, Invitation, WorkflowVersion, WorkflowGraph, Plugin, Project, Repository, Run, RunEvent, RunStep, User, Workflow, Workspace, WSEvent,
} from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message || `the server returned ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
  get unauthenticated() {
    return this.status === 401;
  }
}

export type ClientOptions = {
  baseURL: string;
  /* Called whenever a request comes back unauthenticated, so the shell can send
     the reader to sign in once rather than every caller handling it. */
  onUnauthenticated?: () => void;
  fetch?: typeof globalThis.fetch;
};

export class Client {
  readonly baseURL: string;
  private readonly onUnauthenticated: (() => void) | undefined;
  private readonly doFetch: typeof globalThis.fetch;

  constructor(opts: ClientOptions) {
    this.baseURL = opts.baseURL.replace(/\/+$/, "");
    this.onUnauthenticated = opts.onUnauthenticated;
    this.doFetch = opts.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const res = await this.doFetch(this.baseURL + path, {
      method,
      credentials: "include",
      headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(signal ? { signal } : {}),
    });
    const text = await res.text();
    if (!res.ok) {
      let code = "";
      let message = "";
      try {
        const parsed = JSON.parse(text) as { error?: string; code?: string };
        code = parsed.code ?? "";
        message = parsed.error ?? "";
      } catch {
        message = text.slice(0, 200);
      }
      const err = new ApiError(res.status, code, message);
      if (err.unauthenticated) this.onUnauthenticated?.();
      throw err;
    }
    return (text ? (JSON.parse(text) as T) : (undefined as T));
  }

  private get<T>(path: string, signal?: AbortSignal) { return this.request<T>("GET", path, undefined, signal); }
  private post<T>(path: string, body?: unknown) { return this.request<T>("POST", path, body ?? {}); }
  private patch<T>(path: string, body: unknown) { return this.request<T>("PATCH", path, body); }
  private del<T>(path: string) { return this.request<T>("DELETE", path); }

  // --- account ---

  me(signal?: AbortSignal) { return this.get<{ user: User }>("/api/me", signal); }
  logout() { return this.post<void>("/api/auth/logout"); }
  startEmail(email: string) { return this.post<void>("/api/auth/email/start", { email }); }
  verifyEmail(email: string, code: string) {
    return this.post<{ user: User; workspace: Workspace }>("/api/auth/email/verify", { email, code });
  }
  workspaces(signal?: AbortSignal) { return this.get<{ workspaces: Workspace[] }>("/api/workspaces", signal); }
  publicConfig(signal?: AbortSignal) {
    return this.get<{ google_sign_in: boolean; dev_login_code: boolean; sandbox: string; env: string }>("/api/config", signal);
  }

  /* Everything below is workspace-scoped. */
  workspace(slug: string) { return new WorkspaceClient(this, slug); }
}

export class WorkspaceClient {
  constructor(private readonly api: Client, readonly slug: string) {}

  private w(suffix: string) { return `/api/w/${encodeURIComponent(this.slug)}${suffix}`; }
  private get<T>(s: string, signal?: AbortSignal) { return this.api.request<T>("GET", this.w(s), undefined, signal); }
  private post<T>(s: string, body?: unknown) { return this.api.request<T>("POST", this.w(s), body ?? {}); }
  private patch<T>(s: string, body: unknown) { return this.api.request<T>("PATCH", this.w(s), body); }
  private del<T>(s: string) { return this.api.request<T>("DELETE", this.w(s)); }

  overview(signal?: AbortSignal) { return this.get<Overview>("/overview", signal); }

  // --- conversations ---
  conversations(signal?: AbortSignal) { return this.get<{ conversations: Conversation[] }>("/conversations", signal); }
  conversation(id: string, signal?: AbortSignal) {
    return this.get<{ conversation: Conversation; messages: Message[]; runs: Run[] }>(`/conversations/${id}`, signal);
  }
  createConversation(input: { message?: string; title?: string; model?: string; issue_id?: string }) {
    return this.post<{ conversation: Conversation; message: Message | null; run: Run | null }>("/conversations", input);
  }
  sendMessage(id: string, body: string) {
    return this.post<{ message: Message; run: Run | null }>(`/conversations/${id}/messages`, { body });
  }
  queueMessage(id: string, body: string) { return this.post<void>(`/conversations/${id}/queue`, { body }); }

  // --- issues ---
  issues(params?: { status?: string; assignee?: "me"; project?: string }, signal?: AbortSignal) {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.assignee) q.set("assignee", params.assignee);
    if (params?.project) q.set("project", params.project);
    const qs = q.toString();
    return this.get<{ issues: Issue[] }>(`/issues${qs ? "?" + qs : ""}`, signal);
  }
  issue(id: string, signal?: AbortSignal) {
    return this.get<{
      issue: Issue; comments: IssueComment[]; runs: Run[]; steps: RunStep[];
      children: Issue[]; conversation_id: string | null;
    }>(`/issues/${id}`, signal);
  }
  createIssue(input: {
    title: string; description?: string; priority?: string; status?: string;
    project_id?: string; workflow?: string; start?: boolean;
  }) {
    return this.post<{ issue: Issue; run: Run | null }>("/issues", input);
  }
  updateIssue(id: string, patch: Partial<Pick<Issue, "title" | "description" | "status" | "priority">>) {
    return this.patch<{ issue: Issue }>(`/issues/${id}`, patch);
  }
  comment(id: string, body: string) { return this.post<{ comment: IssueComment }>(`/issues/${id}/comments`, { body }); }
  work(id: string, instructions?: string) { return this.post<{ run: Run }>(`/issues/${id}/work`, { instructions: instructions ?? "" }); }
  approve(id: string, opts?: { note?: string; merge?: boolean }) {
    return this.post<{ issue_id: string; status: string; run: Run | null }>(`/issues/${id}/approve`, opts ?? {});
  }
  requestChanges(id: string, note: string) { return this.post<{ run: Run }>(`/issues/${id}/changes`, { note }); }

  // --- runs ---
  runs(signal?: AbortSignal) { return this.get<{ runs: Run[] }>("/runs", signal); }
  run(id: string, signal?: AbortSignal) { return this.get<{ run: Run; steps: RunStep[] }>(`/runs/${id}`, signal); }
  runEvents(id: string, after = 0, signal?: AbortSignal) {
    return this.get<{ events: RunEvent[]; next: number }>(`/runs/${id}/events?after=${after}`, signal);
  }
  cancelRun(id: string) { return this.post<void>(`/runs/${id}/cancel`); }

  skills(signal?: AbortSignal) { return this.get<{skills: Skill[]}>("/skills", signal); }
  saveSkill(input: {name?: string; body?: string; enabled?: boolean}, id?: string) { return id ? this.patch<{skill: Skill}>(`/skills/${id}`, input) : this.post<{skill: Skill}>("/skills", input); }
  deleteSkill(id: string) { return this.del<void>(`/skills/${id}`); }
  memories(signal?: AbortSignal) { return this.get<{memories: Memory[]}>("/memories", signal); }
  saveMemory(input: {body?: string; scope?: string; project_id?: string; pinned?: boolean}, id?: string) { return id ? this.patch<{memory: Memory}>(`/memories/${id}`, input) : this.post<{memory: Memory}>("/memories", input); }
  deleteMemory(id: string) { return this.del<void>(`/memories/${id}`); }
  members(signal?: AbortSignal) { return this.get<{members: Member[]}>("/members", signal); }
  invitations(signal?: AbortSignal) { return this.get<{invitations: Invitation[]}>("/invitations", signal); }
  invite(email: string, role: string) { return this.post<{id: string; link: string}>("/invitations", {email, role}); }
  revokeInvitation(id: string) { return this.del<void>(`/invitations/${id}`); }
  setMemberRole(id: string, role: string) { return this.patch<void>(`/members/${id}`, {role}); }
  removeMember(id: string) { return this.del<void>(`/members/${id}`); }
  workflow(id: string, signal?: AbortSignal) { return this.get<{workflow: Workflow; versions: WorkflowVersion[]}>(`/workflows/${id}`, signal); }
  saveWorkflow(id: string, graph: WorkflowGraph) { return this.post<{version: WorkflowVersion}>(`/workflows/${id}/versions`, {graph, activate: true}); }
  createWorkflow(input: {name: string; graph: WorkflowGraph}) { return this.post<{workflow: Workflow}>("/workflows", input); }
  updateConversation(id: string, input: {title?: string; archived?: boolean; shared?: boolean}) { return this.patch<void>(`/conversations/${id}`, input); }
  saveAutopilot(input: Record<string, unknown>, id?: string) { return id ? this.patch<{autopilot: Autopilot}>(`/autopilots/${id}`,input) : this.post<{autopilot: Autopilot}>("/autopilots",input); }
  usage(signal?: AbortSignal) { return this.get<{days: Array<{day:string; runs:number; cost_cents:number}>; providers: Array<{provider:string; runs:number; cost_cents:number}>; total_cost_cents:number; runs:number}>("/usage", signal); }

  // --- the rest ---
  workflows(signal?: AbortSignal) { return this.get<{ workflows: Workflow[] }>("/workflows", signal); }
  autopilots(signal?: AbortSignal) { return this.get<{ autopilots: Autopilot[] }>("/autopilots", signal); }
  triggerAutopilot(id: string) { return this.post<{ run: Run }>(`/autopilots/${id}/trigger`); }
  setAutopilotEnabled(id: string, enabled: boolean) { return this.patch<{ autopilot: Autopilot }>(`/autopilots/${id}`, { enabled }); }
  accounts(signal?: AbortSignal) { return this.get<{ accounts: Account[] }>("/accounts", signal); }
  plugins(signal?: AbortSignal) { return this.get<{ plugins: Plugin[] }>("/plugins", signal); }
  projects(signal?: AbortSignal) { return this.get<{ projects: Project[] }>("/projects", signal); }
  repositories(signal?: AbortSignal) { return this.get<{ repositories: Repository[] }>("/repositories", signal); }
  credits(signal?: AbortSignal) {
    return this.get<{ balance_cents: number; payments_enabled: boolean; payments_test_mode: boolean; entries: Array<{ kind: string; amount_cents: number; note: string; created_at: string }> }>("/credits", signal);
  }

  /* The realtime socket for this workspace. Reconnects with backoff, because a
     dropped socket must not quietly stop the page from updating. */
  connect(onEvent: (e: WSEvent) => void, onStatus?: (up: boolean) => void): () => void {
    const url = this.api.baseURL.replace(/^http/, "ws") + this.w("/ws");
    let socket: WebSocket | null = null;
    let closed = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const open = () => {
      if (closed) return;
      socket = new WebSocket(url);
      socket.onopen = () => { attempt = 0; onStatus?.(true); };
      socket.onmessage = (ev) => {
        try { onEvent(JSON.parse(String(ev.data)) as WSEvent); } catch { /* a frame we cannot read is not worth crashing for */ }
      };
      socket.onclose = () => {
        onStatus?.(false);
        if (closed) return;
        attempt += 1;
        const wait = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
        timer = setTimeout(open, wait);
      };
      socket.onerror = () => socket?.close();
    };
    open();
    return () => {
      closed = true;
      if (timer) clearTimeout(timer);
      socket?.close();
    };
  }
}
