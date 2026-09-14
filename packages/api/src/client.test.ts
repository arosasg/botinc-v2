import { describe, expect, it, vi } from "vitest";
import { ApiError, Client, webSocketURL } from "./client";

/* A fake fetch that records what the client asked for and replies with what
   the test wants. No network, no server: this pins the contract the client
   speaks, and the end-to-end suite pins that the server answers it. */
function stub(handler: (url: string, init: RequestInit) => { status?: number; body?: unknown }) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetchImpl = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    calls.push({ url, init });
    const { status = 200, body = {} } = handler(url, init);
    return new Response(body === null ? "" : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof globalThis.fetch;
  return { fetchImpl, calls };
}

describe("Client", () => {
  it("sends the session cookie on every request", async () => {
    const { fetchImpl, calls } = stub(() => ({ body: { user: { email: "a@b.test" } } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await api.me();
    expect(calls[0]!.init.credentials).toBe("include");
    expect(calls[0]!.url).toBe("https://api.test/api/me");
  });

  it("never sends a body on a GET", async () => {
    const { fetchImpl, calls } = stub(() => ({ body: { issues: [] } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await api.workspace("acme").issues();
    expect(calls[0]!.init.body).toBeUndefined();
    expect(calls[0]!.init.method).toBe("GET");
  });

  it("escapes the workspace slug into the path", async () => {
    const { fetchImpl, calls } = stub(() => ({ body: { issues: [] } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await api.workspace("a c/me").issues();
    expect(calls[0]!.url).toBe("https://api.test/api/w/a%20c%2Fme/issues");
  });

  it("builds issue filters as query parameters", async () => {
    const { fetchImpl, calls } = stub(() => ({ body: { issues: [] } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await api.workspace("acme").issues({ status: "needs_you,in_review", assignee: "me" });
    expect(calls[0]!.url).toContain("status=needs_you%2Cin_review");
    expect(calls[0]!.url).toContain("assignee=me");
  });

  it("surfaces the server's own error text and code", async () => {
    const { fetchImpl } = stub(() => ({ status: 409, body: { error: "a run is already working on this issue", code: "already_running" } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await expect(api.workspace("acme").work("BOT-1")).rejects.toMatchObject({
      status: 409,
      code: "already_running",
      message: "a run is already working on this issue",
    });
  });

  it("reports an unauthenticated caller once, to the shell", async () => {
    const onUnauthenticated = vi.fn();
    const { fetchImpl } = stub(() => ({ status: 401, body: { error: "sign in to continue", code: "unauthenticated" } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl, onUnauthenticated });
    await expect(api.me()).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthenticated).toHaveBeenCalledOnce();
  });

  it("does not call the unauthenticated hook for other failures", async () => {
    const onUnauthenticated = vi.fn();
    const { fetchImpl } = stub(() => ({ status: 500, body: { error: "something went wrong" } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl, onUnauthenticated });
    await expect(api.me()).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("survives a body that is not JSON", async () => {
    const fetchImpl = (async () => new Response("<html>502</html>", { status: 502 })) as typeof globalThis.fetch;
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await expect(api.me()).rejects.toMatchObject({ status: 502 });
  });

  it("tolerates an empty success body", async () => {
    const fetchImpl = (async () => new Response("", { status: 200 })) as typeof globalThis.fetch;
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await expect(api.workspace("acme").cancelRun("r1")).resolves.toBeUndefined();
  });

  it("trims a trailing slash off the base URL so paths do not double up", async () => {
    const { fetchImpl, calls } = stub(() => ({ body: {} }));
    const api = new Client({ baseURL: "https://api.test///", fetch: fetchImpl });
    await api.me();
    expect(calls[0]!.url).toBe("https://api.test/api/me");
  });

  it("builds an absolute same-origin websocket URL when the API base is relative", () => {
    expect(webSocketURL("/", "/api/w/acme/ws", "https://botinc.ai")).toBe("wss://botinc.ai/api/w/acme/ws");
  });

  it("keeps a separately hosted API in websocket URLs", () => {
    expect(webSocketURL("https://api.botinc.ai/", "/api/w/acme/ws", "https://botinc.ai")).toBe("wss://api.botinc.ai/api/w/acme/ws");
  });

  it("tails run events from a cursor", async () => {
    const { fetchImpl, calls } = stub(() => ({ body: { events: [], next: 7 } }));
    const api = new Client({ baseURL: "https://api.test", fetch: fetchImpl });
    await api.workspace("acme").runEvents("r1", 7);
    expect(calls[0]!.url).toBe("https://api.test/api/w/acme/runs/r1/events?after=7");
  });
});
