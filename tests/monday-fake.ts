/**
 * In-memory stand-in for https://api.monday.com/v2 (no network, no real
 * token). Answers `me` and paginated `boards` queries from a board list and
 * records every call so tests can check headers, destination and pages.
 */
export const FAKE_MONDAY_TOKEN = "monday-fake-token-0000";

export interface FakeBoard {
  id: string;
  name: string;
  state?: string;
  type?: string | null;
  url?: string | null;
  workspace?: { name: string } | null;
}

export function makeBoards(count: number, prefix = "Tablero"): FakeBoard[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(1000 + index),
    name: `${prefix} ${String(index + 1).padStart(3, "0")}`,
    state: "active",
    type: "board",
    url: `https://demo.monday.com/boards/${1000 + index}`,
    workspace: index % 2 ? { name: "Operaciones" } : null
  }));
}

export interface FakeCall {
  url: string;
  init: RequestInit;
  body: { query: string; variables: Record<string, unknown> };
}

export function fakeMonday(
  boards: FakeBoard[],
  options: {
    slug?: string;
    respond?: (call: FakeCall) => Response | Promise<Response> | undefined;
  } = {}
) {
  const calls: FakeCall[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const call: FakeCall = { url: String(input), init, body: JSON.parse(String(init.body)) };
    calls.push(call);
    const custom = await options.respond?.(call);
    if (custom) return custom;

    const { query, variables } = call.body;
    const data: Record<string, unknown> = {};
    if (/\bme\s*\{/.test(query)) {
      data.me = { id: "42", account: { slug: options.slug ?? "demo" } };
    }
    if (/\bboards\(/.test(query)) {
      const limit = Number(variables.limit);
      const page = Number(variables.page);
      data.boards = boards.slice((page - 1) * limit, page * limit);
    }
    return Response.json({ data, extensions: { request_id: "req-1" } });
  }) as typeof fetch;
  return { fetch: fetchImpl, calls };
}

/** GraphQL-style error (HTTP 200 with an errors array, as Monday does). */
export function graphqlError(code: string, message = "Provider message that must never leak") {
  return Response.json({ errors: [{ message, extensions: { code } }], data: null });
}
