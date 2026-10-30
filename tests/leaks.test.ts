import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_NEW_PASSWORD, setupApi } from "./api.js";
import { TEST_SESSION_SECRET } from "./helpers.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

describe.skipIf(skipDb)("no sensitive data in responses or logs", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  it("covers a full session: login, change password, every module, errors, logout", async () => {
    const api = await setupApi(mongo);
    const cookies: string[] = [];

    const firstLogin = await api.login("admin", "admin123");
    cookies.push(firstLogin);
    await api.request("GET", "/api/users", { cookie: firstLogin }); // 403 password_change_required
    const cookie = await api.adminCookie();
    cookies.push(cookie);

    const created = await api.request("POST", "/api/users", {
      cookie,
      body: { username: "leak.check", displayName: "L", password: "Clave-secreta-77" }
    });
    const id = created.json().user.id;
    await api.request("GET", "/api/users?q=leak", { cookie });
    await api.request("GET", `/api/users/${id}`, { cookie });
    await api.request("PATCH", `/api/users/${id}`, { cookie, body: { displayName: "L2" } });
    await api.request("POST", `/api/users/${id}/reset-password`, { cookie, body: { password: "Clave-secreta-88" } });
    const userCookie = await api.login("leak.check", "Clave-secreta-88");
    cookies.push(userCookie);
    await api.request("GET", "/api/auth/me", { cookie: userCookie });
    await api.request("POST", "/api/auth/login", { body: { username: "leak.check", password: "Wrong-secret-99" } });
    await api.request("POST", "/api/notifications", { cookie, body: { userIds: [id], title: "T" } });
    await api.request("GET", "/api/roles", { cookie });
    await api.request("GET", "/api/permissions", { cookie });
    await api.request("GET", "/api/notifications", { cookie });
    const audit = await api.request("GET", "/api/audit?pageSize=100", { cookie });
    await api.request("POST", "/api/users", { cookie, body: { username: "x" } }); // validation error
    await api.request("POST", "/api/auth/logout", { cookie });

    const passwords = ["admin123", ADMIN_NEW_PASSWORD, "Clave-secreta-77", "Clave-secreta-88", "Wrong-secret-99"];
    const sessionIds = cookies.map((value) => value.split("=")[1]!);
    const forbidden = [TEST_SESSION_SECRET, "passwordHash", "scrypt$", "sessionIdHash", "mongodb://", ...sessionIds];

    const responses = api.bodies.join("\n");
    for (const value of [...forbidden, ...passwords]) {
      expect(responses, `response contains ${value.slice(0, 12)}`).not.toContain(value);
    }

    const logs = api.logs.text();
    expect(logs.length).toBeGreaterThan(0);
    for (const value of [...forbidden, ...passwords]) {
      expect(logs, `logs contain ${value.slice(0, 12)}`).not.toContain(value);
    }
    expect(logs.toLowerCase()).not.toContain("cookie");

    // Audit metadata never stores credentials.
    const stored = JSON.stringify(await api.c.auditLogs.find().toArray());
    for (const value of [...passwords, ...sessionIds]) {
      expect(stored).not.toContain(value);
    }
    expect(audit.json().total).toBeGreaterThan(5);
  });
});
