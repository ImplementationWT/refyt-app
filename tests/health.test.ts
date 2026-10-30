import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildTestApp, fakeDb } from "./helpers.js";

describe("GET /health", () => {
  it("responds without touching the database", async () => {
    const db = fakeDb({
      pingDb: async () => {
        throw new Error("must not be called");
      }
    });
    const { app } = await buildTestApp(db);

    try {
      const response = await app.inject({ method: "GET", url: "/health" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: "ok" });
      expect(db.calls).toBe(0);
    } finally {
      await app.close();
    }
  });

  it("answers even before migrations finish", async () => {
    const { app } = await buildTestApp(fakeDb(), { state: { ready: false, schemaVersion: null } });

    try {
      expect((await app.inject({ method: "GET", url: "/health" })).statusCode).toBe(200);
    } finally {
      await app.close();
    }
  });
});

describe("GET /health/ready", () => {
  it("returns 503 until migrations finish, then 200", async () => {
    const { app, state } = await buildTestApp(fakeDb({ pingDb: async () => "ok" }), {
      state: { ready: false, schemaVersion: null }
    });

    try {
      const before = await app.inject({ method: "GET", url: "/health/ready" });
      expect(before.statusCode).toBe(503);
      expect(before.json()).toEqual({ status: "unavailable" });
      expect((await app.inject({ method: "GET", url: "/api/meta" })).statusCode).toBe(503);

      state.ready = true;
      state.schemaVersion = 1;

      const after = await app.inject({ method: "GET", url: "/health/ready" });
      expect(after.statusCode).toBe(200);
      expect(after.json()).toEqual({ status: "ok" });
    } finally {
      await app.close();
    }
  });

  it("returns 503 without details when the database is unavailable", async () => {
    const { app } = await buildTestApp(fakeDb({ pingDb: async () => "fail" }));

    try {
      const response = await app.inject({ method: "GET", url: "/health/ready" });

      expect(response.statusCode).toBe(503);
      expect(response.json()).toEqual({ status: "unavailable" });
    } finally {
      await app.close();
    }
  });
});

describe("GET /api/meta", () => {
  it("returns appName, bootstrap info and the applied schema version", async () => {
    const { app } = await buildTestApp(
      fakeDb({ readBootstrapInfo: async () => ({ clientId: "example", templateVersion: "1.1.0" }) }),
      { settings: { appName: "Portal" }, state: { ready: true, schemaVersion: 1 } }
    );

    try {
      const response = await app.inject({ method: "GET", url: "/api/meta" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        appName: "Portal",
        clientId: "example",
        templateVersion: "1.1.0",
        schemaVersion: 1
      });
    } finally {
      await app.close();
    }
  });

  it("returns nulls when the bootstrap document does not exist", async () => {
    const { app } = await buildTestApp(fakeDb());

    try {
      const response = await app.inject({ method: "GET", url: "/api/meta" });

      expect(response.json()).toEqual({
        appName: "Aplicación de prueba",
        clientId: null,
        templateVersion: null,
        schemaVersion: 1
      });
    } finally {
      await app.close();
    }
  });

  it("returns a generic 500 without stack traces or error messages", async () => {
    const { app } = await buildTestApp(
      fakeDb({
        readBootstrapInfo: async () => {
          throw new Error("internal detail that must stay in the logs");
        }
      })
    );

    try {
      const response = await app.inject({ method: "GET", url: "/api/meta" });

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({ error: "internal_error" });
      expect(response.body).not.toContain("internal detail");
      expect(response.body).not.toContain("at ");
    } finally {
      await app.close();
    }
  });
});

describe("security headers and SPA serving", () => {
  async function spaApp() {
    const webRoot = await mkdtemp(join(tmpdir(), "web-"));
    await mkdir(join(webRoot, "assets"));
    await writeFile(join(webRoot, "index.html"), "<!doctype html><div id=root></div>");
    await writeFile(join(webRoot, "assets", "app-abc123.js"), "console.log(1)");
    return buildTestApp(fakeDb(), { settings: { webRoot } });
  }

  it("serves index.html, fingerprinted assets and SPA routes", async () => {
    const { app } = await spaApp();

    try {
      const root = await app.inject({ method: "GET", url: "/" });
      const route = await app.inject({ method: "GET", url: "/users/123" });
      const asset = await app.inject({ method: "GET", url: "/assets/app-abc123.js" });

      expect(root.statusCode).toBe(200);
      expect(root.body).toContain('<div id=root>');
      expect(route.statusCode).toBe(200);
      expect(route.headers["content-type"]).toContain("text/html");
      expect(route.headers["cache-control"]).toBe("no-cache");
      expect(asset.headers["cache-control"]).toContain("immutable");
      expect(root.headers["content-security-policy"]).toContain("script-src 'self'");
      expect(root.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(root.headers["x-content-type-options"]).toBe("nosniff");
    } finally {
      await app.close();
    }
  });

  it("allows inline style attributes (Refyt) but never inline scripts", async () => {
    const { app } = await spaApp();

    try {
      const csp = (await app.inject({ method: "GET", url: "/" })).headers["content-security-policy"];

      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toMatch(/script-src 'self'(;|$)/);
    } finally {
      await app.close();
    }
  });

  it("never falls back to index.html for /api or /health", async () => {
    const { app } = await spaApp();

    try {
      const api = await app.inject({ method: "GET", url: "/api/does-not-exist" });
      const health = await app.inject({ method: "GET", url: "/health/nope" });
      const post = await app.inject({ method: "POST", url: "/somewhere" });

      expect(api.headers["content-type"]).toContain("application/json");
      expect(health.statusCode).toBe(404);
      expect(health.json()).toEqual({ error: "not_found" });
      expect(post.statusCode).toBe(404);
    } finally {
      await app.close();
    }
  });
});
