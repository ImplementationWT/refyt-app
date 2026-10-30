import { IntegrationError, type IntegrationErrorCode } from "../errors.js";
import { buildBoardUrl, isSafeMondayUrl } from "./links.js";

/**
 * Monday.com GraphQL client (https://developer.monday.com/api-reference).
 * - Fixed destination: requests only ever go to MONDAY_API_URL; no caller
 *   input reaches the URL, and redirects are refused.
 * - Auth: the token goes as-is in the `Authorization` header (no "Bearer").
 * - Version: pinned with the `API-Version` header (YYYY-MM). Bump it here.
 */
export const MONDAY_API_URL = "https://api.monday.com/v2";
export const MONDAY_API_VERSION = "2026-07";
export const BOARDS_PAGE_SIZE = 100;
export const BOARDS_CACHE_TTL_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 10_000;

export interface MondayBoard {
  id: string;
  name: string;
  /** null for the account's Main workspace. */
  workspaceName: string | null;
  /** https://*.monday.com link, or null if none passed validation. */
  url: string | null;
}

interface RawBoard {
  id?: unknown;
  name?: unknown;
  state?: unknown;
  type?: unknown;
  url?: unknown;
  workspace?: { name?: unknown } | null;
}

export interface MondayClientOptions {
  token: string;
  maxBoards: number;
  fetch?: typeof fetch;
  timeoutMs?: number;
  now?: () => number;
}

// Provider error codes (GraphQL `extensions.code` or legacy `error_code`).
const AUTH_CODES = new Set(["UserUnauthorizedException", "Unauthorized", "UNAUTHENTICATED", "USER_UNAUTHORIZED"]);
const LIMIT_CODES = new Set([
  "COMPLEXITY_BUDGET_EXHAUSTED",
  "ComplexityException",
  "RATE_LIMIT_EXCEEDED",
  "Rate Limit Exceeded",
  "IP_RATE_LIMIT_EXCEEDED",
  "maxConcurrencyExceeded",
  "DAILY_LIMIT_EXCEEDED"
]);

function fail(code: IntegrationErrorCode, detail: string): never {
  throw new IntegrationError(code, `monday: ${detail}`);
}

/** Maps a GraphQL error payload (HTTP 200 or not) to a generic code. */
function classifyErrors(body: Record<string, unknown>): never {
  const errors = Array.isArray(body.errors) ? (body.errors as Array<Record<string, unknown>>) : [];
  const codes = new Set<string>();
  const statuses = new Set<number>();
  for (const error of errors) {
    const extensions = (error.extensions ?? {}) as Record<string, unknown>;
    if (typeof extensions.code === "string") codes.add(extensions.code);
    if (typeof extensions.status_code === "number") statuses.add(extensions.status_code);
  }
  if (typeof body.error_code === "string") codes.add(body.error_code);
  if (typeof body.status_code === "number") statuses.add(body.status_code);

  // Codes and statuses only; never the provider's message text.
  const summary = `graphql errors [${[...codes].join(",") || "no code"}]`;
  if ([...codes].some((code) => AUTH_CODES.has(code)) || statuses.has(401) || statuses.has(403)) {
    fail("auth_failed", summary);
  }
  if ([...codes].some((code) => LIMIT_CODES.has(code)) || statuses.has(429)) {
    fail("rate_limited", summary);
  }
  fail("unavailable", summary);
}

export class MondayClient {
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly now: () => number;
  private cache: { expiresAt: number; boards: MondayBoard[] } | null = null;
  private inFlight: Promise<MondayBoard[]> | null = null;

  constructor(private readonly options: MondayClientOptions) {
    this.fetchImpl = options.fetch ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.now = options.now ?? Date.now;
  }

  private async graphql(query: string, variables: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await this.fetchImpl(MONDAY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.options.token,
          "API-Version": MONDAY_API_VERSION
        },
        body: JSON.stringify({ query, variables }),
        redirect: "error",
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      if (name === "TimeoutError" || name === "AbortError") fail("timeout", `no response in ${this.timeoutMs} ms`);
      fail("unavailable", `request failed (${name || "network"})`);
    }

    if (response.status === 401 || response.status === 403) fail("auth_failed", `HTTP ${response.status}`);
    if (response.status === 429) fail("rate_limited", "HTTP 429");

    let body: Record<string, unknown>;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      fail("unavailable", `HTTP ${response.status}, non-JSON body`);
    }
    if (!response.ok || (Array.isArray(body.errors) && body.errors.length > 0) || body.error_code) {
      if (!response.ok && !body.errors && !body.error_code) fail("unavailable", `HTTP ${response.status}`);
      classifyErrors(body);
    }
    if (!body.data || typeof body.data !== "object") fail("unavailable", "response without data");
    return body.data as Record<string, unknown>;
  }

  /** Lightweight connection check: the current user. */
  async testConnection(): Promise<void> {
    const data = await this.graphql("query { me { id } }");
    const me = data.me as { id?: unknown } | null;
    if (!me || me.id === undefined || me.id === null) fail("unavailable", "me without id");
  }

  /**
   * Active, regular boards of the account (no sub-item boards, documents or
   * other object types), up to `maxBoards`, cached for 60 s per process.
   */
  async listBoards(): Promise<MondayBoard[]> {
    if (this.cache && this.cache.expiresAt > this.now()) {
      return this.cache.boards;
    }
    // Concurrent requests share one fetch.
    this.inFlight ??= this.fetchBoards().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async fetchBoards(): Promise<MondayBoard[]> {
    const max = this.options.maxBoards;
    const maxPages = Math.ceil(max / BOARDS_PAGE_SIZE);
    const boardFields = "id name state type url workspace { name }";
    const boards: MondayBoard[] = [];
    let accountSlug: string | null = null;

    for (let page = 1; page <= maxPages && boards.length < max; page++) {
      const query =
        page === 1
          ? `query ($limit: Int!, $page: Int!) { me { account { slug } } boards(limit: $limit, page: $page, state: active) { ${boardFields} } }`
          : `query ($limit: Int!, $page: Int!) { boards(limit: $limit, page: $page, state: active) { ${boardFields} } }`;
      const data = await this.graphql(query, { limit: BOARDS_PAGE_SIZE, page });
      if (page === 1) {
        const me = data.me as { account?: { slug?: unknown } } | null;
        accountSlug = typeof me?.account?.slug === "string" ? me.account.slug : null;
      }
      const raw = Array.isArray(data.boards) ? (data.boards as RawBoard[]) : [];

      for (const board of raw) {
        const id = typeof board.id === "string" || typeof board.id === "number" ? String(board.id) : null;
        if (!id || typeof board.name !== "string") continue;
        // Only active, regular boards. `type` is null on some legacy boards.
        if (board.state !== "active") continue;
        if (board.type !== undefined && board.type !== null && board.type !== "board") continue;

        const candidate = isSafeMondayUrl(board.url) ? board.url : buildBoardUrl(accountSlug, id);
        boards.push({
          id,
          name: board.name,
          workspaceName: typeof board.workspace?.name === "string" ? board.workspace.name : null,
          url: isSafeMondayUrl(candidate) ? candidate : null
        });
        if (boards.length >= max) break;
      }
      if (raw.length < BOARDS_PAGE_SIZE) break;
    }

    boards.sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
    this.cache = { expiresAt: this.now() + BOARDS_CACHE_TTL_MS, boards };
    return boards;
  }
}
