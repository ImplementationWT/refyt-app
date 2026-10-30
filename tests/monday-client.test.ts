import { describe, expect, it } from "vitest";
import { IntegrationError } from "../src/integrations/errors.js";
import { MONDAY_API_URL, MONDAY_API_VERSION, MondayClient } from "../src/integrations/monday/client.js";
import { buildBoardUrl, isSafeMondayUrl } from "../src/integrations/monday/links.js";
import { getIntegrationStatus } from "../src/integrations/registry.js";
import { createIntegrations } from "../src/integrations/service.js";
import { FAKE_MONDAY_TOKEN, fakeMonday, graphqlError, makeBoards, type FakeBoard } from "./monday-fake.js";

function client(boards: FakeBoard[], extra: Partial<ConstructorParameters<typeof MondayClient>[0]> = {}, fake = fakeMonday(boards)) {
  return { fake, monday: new MondayClient({ token: FAKE_MONDAY_TOKEN, maxBoards: 500, fetch: fake.fetch, ...extra }) };
}

async function errorCode(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(IntegrationError);
    // The internal detail never carries the provider's message.
    expect((error as IntegrationError).detail).not.toContain("must never leak");
    return (error as IntegrationError).code;
  }
  throw new Error("expected an IntegrationError");
}

describe("integration registry", () => {
  it("reports configured providers without values", () => {
    expect(getIntegrationStatus({})).toEqual([
      { id: "monday", label: "Monday.com", configured: false },
      { id: "anthropic", label: "Will Doo (Claude)", configured: false }
    ]);
    expect(getIntegrationStatus({ MONDAY_API_TOKEN: "  " })[0]?.configured).toBe(false);
    const status = getIntegrationStatus({ MONDAY_API_TOKEN: FAKE_MONDAY_TOKEN });
    expect(status[0]).toEqual({ id: "monday", label: "Monday.com", configured: true });
    expect(JSON.stringify(status)).not.toContain(FAKE_MONDAY_TOKEN);
  });

  it("is lazy: creating the service never calls the provider", () => {
    const fake = fakeMonday([]);
    const integrations = createIntegrations({ MONDAY_API_TOKEN: "invalid" }, { fetch: fake.fetch });

    expect(integrations.isConfigured("monday")).toBe(true);
    expect(integrations.features(new Set(["monday.read"]))).toEqual(["monday"]);
    expect(integrations.features(new Set())).toEqual([]);
    expect(fake.calls).toHaveLength(0);
  });
});

describe("Monday client requests", () => {
  it("posts to the fixed endpoint with the token, API version and no redirects", async () => {
    const { monday, fake } = client([]);
    await monday.testConnection();

    expect(fake.calls).toHaveLength(1);
    const [call] = fake.calls;
    expect(call!.url).toBe(MONDAY_API_URL);
    expect(call!.init.method).toBe("POST");
    expect(call!.init.redirect).toBe("error");
    expect(call!.init.signal).toBeInstanceOf(AbortSignal);
    expect(call!.init.headers).toMatchObject({
      Authorization: FAKE_MONDAY_TOKEN,
      "API-Version": MONDAY_API_VERSION,
      "Content-Type": "application/json"
    });
    expect(call!.body.query).toMatch(/me\s*\{\s*id\s*\}/);
  });

  it("always targets api.monday.com whatever the board data says", async () => {
    const boards: FakeBoard[] = [
      { id: "1", name: "Evil", state: "active", type: "board", url: "https://evil.example/steal" }
    ];
    const { monday, fake } = client(boards);
    await monday.listBoards();

    expect(new Set(fake.calls.map((call) => call.url))).toEqual(new Set([MONDAY_API_URL]));
  });
});

describe("listBoards", () => {
  it("pages 100 at a time until a short page", async () => {
    const { monday, fake } = client(makeBoards(230));
    const boards = await monday.listBoards();

    expect(boards).toHaveLength(230);
    expect(fake.calls.map((call) => call.body.variables)).toEqual([
      { limit: 100, page: 1 },
      { limit: 100, page: 2 },
      { limit: 100, page: 3 }
    ]);
    expect(fake.calls.every((call) => /state:\s*active/.test(call.body.query))).toBe(true);
    expect(boards[0]).toEqual({
      id: "1000",
      name: "Tablero 001",
      workspaceName: null,
      url: "https://demo.monday.com/boards/1000"
    });
  });

  it("respects the configured maximum", async () => {
    const { monday, fake } = client(makeBoards(900), { maxBoards: 150 });
    const boards = await monday.listBoards();

    expect(boards).toHaveLength(150);
    expect(fake.calls).toHaveLength(2);
  });

  it("excludes archived, deleted, sub-item, document and custom-object boards", async () => {
    const boards: FakeBoard[] = [
      { id: "1", name: "Normal", state: "active", type: "board" },
      { id: "2", name: "Legacy sin tipo", state: "active", type: null },
      { id: "3", name: "Archivado", state: "archived", type: "board" },
      { id: "4", name: "Eliminado", state: "deleted", type: "board" },
      { id: "5", name: "Subelementos de Normal", state: "active", type: "sub_items_board" },
      { id: "6", name: "Documento", state: "active", type: "document" },
      { id: "7", name: "Objeto", state: "active", type: "custom_object" }
    ];
    const { monday } = client(boards);

    expect((await monday.listBoards()).map((board) => board.name)).toEqual(["Legacy sin tipo", "Normal"]);
  });

  it("uses the API url when safe, falls back to the account slug, else drops the link", async () => {
    const boards: FakeBoard[] = [
      { id: "10", name: "A", state: "active", type: "board", url: "https://demo.monday.com/boards/10" },
      { id: "11", name: "B", state: "active", type: "board", url: "javascript:alert(1)" },
      { id: "12", name: "C", state: "active", type: "board", url: null }
    ];
    const withSlug = client(boards);
    expect((await withSlug.monday.listBoards()).map((board) => board.url)).toEqual([
      "https://demo.monday.com/boards/10",
      "https://demo.monday.com/boards/11",
      "https://demo.monday.com/boards/12"
    ]);

    const badSlug = client(boards, {}, fakeMonday(boards, { slug: "evil.com/x" }));
    expect((await badSlug.monday.listBoards()).map((board) => board.url)).toEqual([
      "https://demo.monday.com/boards/10",
      null,
      null
    ]);
  });

  it("caches the list for 60 seconds per process", async () => {
    let now = 1_000_000;
    const { monday, fake } = client(makeBoards(3), { now: () => now });

    await monday.listBoards();
    now += 59_000;
    await monday.listBoards();
    expect(fake.calls).toHaveLength(1);

    now += 2_000;
    await monday.listBoards();
    expect(fake.calls).toHaveLength(2);
  });

  it("shares one request between concurrent callers and does not cache failures", async () => {
    let fail = true;
    const fake = fakeMonday(makeBoards(3), {
      respond: () => (fail ? new Response("boom", { status: 500 }) : undefined)
    });
    const { monday } = client([], {}, fake);

    expect(await errorCode(monday.listBoards())).toBe("unavailable");
    fail = false;
    await Promise.all([monday.listBoards(), monday.listBoards(), monday.listBoards()]);
    expect(fake.calls).toHaveLength(2);
  });
});

describe("error mapping to generic codes", () => {
  const cases: Array<[string, () => Response]> = [
    ["HTTP 401", () => new Response(JSON.stringify({ error_message: "Not Authenticated" }), { status: 401 })],
    ["GraphQL UserUnauthorizedException", () => graphqlError("UserUnauthorizedException")],
    ["HTTP 429", () => new Response("{}", { status: 429, headers: { "Retry-After": "30" } })],
    ["GraphQL COMPLEXITY_BUDGET_EXHAUSTED", () => graphqlError("COMPLEXITY_BUDGET_EXHAUSTED")],
    ["legacy ComplexityException", () => Response.json({ error_code: "ComplexityException", error_message: "budget", status_code: 429 })],
    ["GraphQL maxConcurrencyExceeded", () => graphqlError("maxConcurrencyExceeded")],
    ["HTTP 500", () => new Response("Internal", { status: 500 })],
    ["non-JSON 200", () => new Response("<html>")],
    ["unknown GraphQL error", () => graphqlError("SomethingElse")]
  ];
  const expected: Record<string, string> = {
    "HTTP 401": "auth_failed",
    "GraphQL UserUnauthorizedException": "auth_failed",
    "HTTP 429": "rate_limited",
    "GraphQL COMPLEXITY_BUDGET_EXHAUSTED": "rate_limited",
    "legacy ComplexityException": "rate_limited",
    "GraphQL maxConcurrencyExceeded": "rate_limited",
    "HTTP 500": "unavailable",
    "non-JSON 200": "unavailable",
    "unknown GraphQL error": "unavailable"
  };

  it.each(cases)("%s", async (name, response) => {
    const fake = fakeMonday([], { respond: response });
    const { monday } = client([], {}, fake);

    expect(await errorCode(monday.testConnection())).toBe(expected[name]);
    expect(await errorCode(monday.listBoards())).toBe(expected[name]);
  });

  it("maps a timeout", async () => {
    const hanging = (async (_input: RequestInfo | URL, init: RequestInit = {}) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      })) as typeof fetch;
    const monday = new MondayClient({ token: FAKE_MONDAY_TOKEN, maxBoards: 10, fetch: hanging, timeoutMs: 30 });

    expect(await errorCode(monday.testConnection())).toBe("timeout");
  });

  it("maps a refused redirect or network failure", async () => {
    const broken = (async () => {
      throw new TypeError("fetch failed: redirect mode is set to error");
    }) as typeof fetch;
    const monday = new MondayClient({ token: FAKE_MONDAY_TOKEN, maxBoards: 10, fetch: broken });

    expect(await errorCode(monday.testConnection())).toBe("unavailable");
  });
});

describe("board link validation", () => {
  it.each([
    ["https://demo.monday.com/boards/1", true],
    ["https://monday.com/boards/1", true],
    ["https://a.b.monday.com/boards/1", true],
    ["http://demo.monday.com/boards/1", false],
    ["javascript:alert(1)", false],
    ["https://monday.com.evil.com/boards/1", false],
    ["https://evilmonday.com/boards/1", false],
    ["https://evil.com/?x=.monday.com", false],
    ["https://user:pass@demo.monday.com/boards/1", false],
    ["https://demo.monday.com:8443/boards/1", false],
    ["//demo.monday.com/boards/1", false],
    ["not a url", false]
  ])("%s → %s", (url, safe) => {
    expect(isSafeMondayUrl(url)).toBe(safe);
  });

  it("builds fallback links only from a plain slug and numeric id", () => {
    expect(buildBoardUrl("demo", "123")).toBe("https://demo.monday.com/boards/123");
    expect(buildBoardUrl("evil.com/x", "123")).toBeNull();
    expect(buildBoardUrl("demo", "123/../../x")).toBeNull();
    expect(buildBoardUrl(null, "123")).toBeNull();
  });
});
