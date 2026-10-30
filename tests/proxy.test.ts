import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupApi } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

/**
 * The app runs behind nginx (TLS termination, 1 hop) on
 * <slug>.apps.<domain>. These tests send what nginx sends with the
 * configuration required by the contract:
 *   proxy_set_header Host $host;
 *   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 *   proxy_set_header X-Forwarded-Proto $scheme;
 */
const HOST = "demo.apps.example.test";
const ORIGIN = `https://${HOST}`;
const CREDENTIALS = { username: "admin", password: "admin123" };

describe.skipIf(skipDb)("behind nginx (trustProxy = 1 hop)", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  const production = () => setupApi(mongo, { settings: { production: true, trustProxyHops: 1 } });

  it("accepts the login over HTTPS and sets a Secure __Host- cookie", async () => {
    const api = await production();
    const response = await api.request("POST", "/api/auth/login", {
      body: CREDENTIALS,
      headers: { host: HOST, origin: ORIGIN, "x-forwarded-proto": "https", "x-forwarded-for": "203.0.113.7" }
    });

    expect(response.statusCode).toBe(200);
    const cookie = response.cookies.find((item) => item.name === "__Host-sid");
    expect(cookie).toMatchObject({ secure: true, httpOnly: true, sameSite: "Strict", path: "/" });
    expect(response.headers["strict-transport-security"]).toBeDefined();
  });

  it("uses the client IP from X-Forwarded-For (only the hop nginx added)", async () => {
    const api = await production();
    // A client-supplied X-Forwarded-For value is ignored: nginx appends the real IP.
    await api.request("POST", "/api/auth/login", {
      body: CREDENTIALS,
      headers: {
        host: HOST,
        origin: ORIGIN,
        "x-forwarded-proto": "https",
        "x-forwarded-for": "198.51.100.66, 203.0.113.7"
      }
    });

    const entry = await api.c.auditLogs.findOne({ action: "auth.login.success" });
    expect(entry?.ip).toBe("203.0.113.7");
  });

  it("rejects writes if nginx does not forward the original Host", async () => {
    const api = await production();
    // nginx's default would send the upstream address as Host.
    const response = await api.request("POST", "/api/auth/login", {
      body: CREDENTIALS,
      headers: { host: "127.0.0.1:3000", origin: ORIGIN, "x-forwarded-proto": "https" }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("invalid_origin");
  });

  it("rejects writes if nginx does not forward the protocol", async () => {
    const api = await production();
    const response = await api.request("POST", "/api/auth/login", {
      body: CREDENTIALS,
      headers: { host: HOST, origin: ORIGIN }
    });

    expect(response.statusCode).toBe(403);
  });

  it("serves liveness and readiness through the proxy", async () => {
    const api = await production();
    const headers = { host: HOST, "x-forwarded-proto": "https", "x-forwarded-for": "203.0.113.7" };

    expect((await api.app.inject({ method: "GET", url: "/health", headers })).statusCode).toBe(200);
    expect((await api.app.inject({ method: "GET", url: "/health/ready", headers })).statusCode).toBe(200);
  });
});
