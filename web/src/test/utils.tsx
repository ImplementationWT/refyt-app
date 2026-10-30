import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import { App, createQueryClient } from "../App";
import type { Session } from "../lib/types";

type Handler = (body: unknown) => { status?: number; body: unknown };

/**
 * Replaces fetch with a tiny in-memory API: "METHOD /path" -> handler.
 * Query strings are ignored for matching. Unknown routes answer 404.
 */
export function mockApi(routes: Record<string, Handler | unknown>) {
  const calls: Array<{ method: string; url: string; body: unknown }> = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, url, body });

    const route = routes[`${method} ${url.split("?")[0]}`];
    const result =
      typeof route === "function"
        ? (route as Handler)(body)
        : route === undefined
          ? { status: 404, body: { error: "not_found" } }
          : { status: 200, body: route };
    return new Response(JSON.stringify(result.body), {
      status: result.status ?? 200,
      headers: { "content-type": "application/json" }
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock };
}

export const META = { appName: "Aplicación de prueba", clientId: "demo", templateVersion: "1.1.0", schemaVersion: 1 };

export function session(
  permissions: string[],
  overrides: Partial<Session["user"]> = {},
  features: string[] = []
): Session {
  return {
    user: {
      id: "u1",
      username: "ana",
      email: null,
      displayName: "Ana",
      status: "active",
      mustChangePassword: false,
      roles: [],
      grantedPermissionKeys: [],
      revokedPermissionKeys: [],
      locked: false,
      lastLoginAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      ...overrides
    },
    permissions,
    features
  };
}

export const EMPTY_PAGE = { items: [], total: 0, page: 1, pageSize: 20 };

export function renderApp(path: string) {
  // Same client as the app (global 401 handling), without retries.
  const queryClient = createQueryClient();
  const defaults = queryClient.getDefaultOptions();
  queryClient.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, retry: false } });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App queryClient={queryClient} />
    </MemoryRouter>
  );
}
