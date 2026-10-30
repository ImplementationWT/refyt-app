import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LATEST_SCHEMA_VERSION } from "../src/db/migrations/index.js";
import { createIntegrations } from "../src/integrations/service.js";
import { setupApi } from "./api.js";
import { FAKE_MONDAY_TOKEN, fakeMonday, graphqlError, makeBoards, type FakeBoard, type FakeCall } from "./monday-fake.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

describe.skipIf(skipDb)("integrations API", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  /** App with Monday configured (mocked fetch) and the logger redacting the token. */
  async function withMonday(boards: FakeBoard[] = makeBoards(3, "Secreto comercial"), respond?: (call: FakeCall) => Response | undefined) {
    const fake = fakeMonday(boards, respond ? { respond } : {});
    const integrations = createIntegrations({ MONDAY_API_TOKEN: FAKE_MONDAY_TOKEN, MONDAY_MAX_BOARDS: 500 }, { fetch: fake.fetch });
    const api = await setupApi(mongo, { integrations, secrets: [FAKE_MONDAY_TOKEN] });
    const cookie = await api.adminCookie();
    return { api, cookie, fake };
  }

  describe("without MONDAY_API_TOKEN", () => {
    it("starts, applies the migration and reports nothing configured", async () => {
      const api = await setupApi(mongo);
      const cookie = await api.adminCookie();

      expect((await api.request("GET", "/api/meta")).json().schemaVersion).toBe(LATEST_SCHEMA_VERSION);
      expect(LATEST_SCHEMA_VERSION).toBe(6);
      for (const key of ["integrations.read", "integrations.manage", "monday.read"]) {
        expect(await api.c.permissions.countDocuments({ key })).toBe(1);
      }

      expect((await api.request("GET", "/api/integrations", { cookie })).json()).toEqual({
        items: [
          { id: "monday", label: "Monday.com", configured: false },
          { id: "anthropic", label: "Will Doo (Claude)", configured: false }
        ]
      });
      expect((await api.request("GET", "/api/auth/me", { cookie })).json().features).toEqual(["willdoo"]);

      const boards = await api.request("GET", "/api/monday/boards", { cookie });
      expect(boards.statusCode).toBe(404);
      const test = await api.request("POST", "/api/integrations/monday/test", { cookie });
      expect(test.statusCode).toBe(409);
      expect(test.json().error).toBe("not_configured");
    });

    it("rejects unknown providers", async () => {
      const api = await setupApi(mongo);
      const cookie = await api.adminCookie();

      for (const provider of ["slack", "..%2F..%2Fadmin", "MONDAY"]) {
        const response = await api.request("POST", `/api/integrations/${provider}/test`, { cookie });
        expect(response.statusCode, provider).toBe(404);
      }
    });
  });

  describe("with MONDAY_API_TOKEN", () => {
    it("lists the boards and exposes the feature to users with monday.read", async () => {
      const { api, cookie } = await withMonday();

      expect((await api.request("GET", "/api/integrations", { cookie })).json().items[0].configured).toBe(true);
      expect((await api.request("GET", "/api/auth/me", { cookie })).json().features).toEqual(["monday", "willdoo"]);

      const response = await api.request("GET", "/api/monday/boards", { cookie });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.total).toBe(3);
      expect(Object.keys(body.items[0]).sort()).toEqual(["id", "name", "url", "workspaceName"]);
    });

    it("hides the feature from users without monday.read", async () => {
      const { api } = await withMonday();
      const viewer = await api.createUser({ username: "sin.monday", permissions: ["integrations.read"] });
      const reader = await api.createUser({ username: "con.monday", permissions: ["monday.read"] });

      expect((await api.request("GET", "/api/auth/me", { cookie: await viewer.cookie() })).json().features).toEqual([]);
      const login = await api.request("POST", "/api/auth/login", {
        body: { username: "con.monday", password: reader.password }
      });
      expect(login.json().features).toEqual(["monday"]);
    });

    it("tests the connection and audits it without values", async () => {
      const { api, cookie, fake } = await withMonday();
      const response = await api.request("POST", "/api/integrations/monday/test", { cookie });

      expect(response.json()).toEqual({ ok: true });
      expect(fake.calls.at(-1)?.body.query).toMatch(/me\s*\{\s*id\s*\}/);
      const entry = await api.c.auditLogs.findOne({ action: "integration.test" });
      expect(entry?.metadata).toEqual({ provider: "monday", ok: true });
    });

    it("never exposes the token or board names in logs, responses, errors or audit", async () => {
      let mode: "ok" | "auth" = "ok";
      const { api, cookie } = await withMonday(makeBoards(3, "Secreto comercial"), () =>
        mode === "auth" ? graphqlError("UserUnauthorizedException", `bad token ${FAKE_MONDAY_TOKEN}`) : undefined
      );

      await api.request("GET", "/api/monday/boards", { cookie });
      await api.request("POST", "/api/integrations/monday/test", { cookie });
      mode = "auth";
      await api.request("POST", "/api/integrations/monday/test", { cookie });
      await api.request("GET", "/api/integrations", { cookie });
      await api.request("GET", "/api/auth/me", { cookie });

      const responses = api.bodies.join("\n");
      const logs = api.logs.text();
      const audit = JSON.stringify(await api.c.auditLogs.find().toArray());
      for (const text of [responses, logs, audit]) {
        expect(text).not.toContain(FAKE_MONDAY_TOKEN);
        expect(text).not.toContain("bad token");
      }
      // Board names reach the HTTP response (that is the feature) but never logs or audit.
      expect(logs).not.toContain("Secreto comercial");
      expect(audit).not.toContain("Secreto comercial");
      expect(logs).toContain("integration request failed");
    });

    it("maps provider failures to generic codes without provider messages", async () => {
      const cases: Array<[() => Response, number, string]> = [
        [() => new Response("{}", { status: 401 }), 502, "auth_failed"],
        [() => new Response("{}", { status: 429 }), 503, "rate_limited"],
        [() => graphqlError("COMPLEXITY_BUDGET_EXHAUSTED"), 503, "rate_limited"],
        [() => new Response("oops", { status: 500 }), 503, "unavailable"]
      ];
      for (const [respond, status, code] of cases) {
        const { api, cookie } = await withMonday([], respond);
        const boards = await api.request("GET", "/api/monday/boards", { cookie });
        const test = await api.request("POST", "/api/integrations/monday/test", { cookie });

        expect(boards.statusCode, code).toBe(status);
        expect(boards.json()).toEqual({ error: code });
        expect(test.json()).toEqual({ ok: false, error: code });
        expect(`${boards.body}${test.body}`).not.toContain("must never leak");
      }
    });

    it("cannot be pointed at another host by request input", async () => {
      const { api, cookie, fake } = await withMonday();
      await api.request("GET", "/api/monday/boards?url=https://evil.example&host=evil.example", {
        cookie,
        headers: { "x-forwarded-host": "evil.example" }
      });
      await api.request("POST", "/api/integrations/monday/test", {
        cookie,
        body: { url: "https://evil.example", token: "other" }
      });

      expect(fake.calls.length).toBeGreaterThan(0);
      expect(new Set(fake.calls.map((call) => call.url))).toEqual(new Set(["https://api.monday.com/v2"]));
      expect(fake.calls.every((call) => (call.init.headers as Record<string, string>).Authorization === FAKE_MONDAY_TOKEN)).toBe(
        true
      );
    });

    it("audits the boards query without board data and serves repeats from cache", async () => {
      const { api, cookie, fake } = await withMonday(makeBoards(2, "Privado"));
      await api.request("GET", "/api/monday/boards", { cookie });
      await api.request("GET", "/api/monday/boards", { cookie });

      expect(fake.calls).toHaveLength(1);
      const entries = await api.c.auditLogs.find({ action: "integration.monday.boards" }).toArray();
      expect(entries).toHaveLength(2);
      expect(entries[0]?.metadata).toEqual({ ok: true, count: 2 });
    });
  });
});
