import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { lastDays } from "../src/modules/dashboard/routes.js";
import { setupApi } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

describe("lastDays", () => {
  it("lists calendar dates in the requested time zone, oldest first", () => {
    const now = new Date("2026-03-10T02:00:00Z");

    expect(lastDays(3, "UTC", now)).toEqual(["2026-03-08", "2026-03-09", "2026-03-10"]);
    // 02:00 UTC is still the previous day in Lima (UTC-5).
    expect(lastDays(3, "America/Lima", now)).toEqual(["2026-03-07", "2026-03-08", "2026-03-09"]);
  });
});

describe.skipIf(skipDb)("GET /api/dashboard", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  it("returns KPIs and a zero-filled daily login series", async () => {
    const api = await setupApi(mongo);
    const cookie = await api.adminCookie();
    const user = await api.createUser({ username: "visitante", roleKeys: ["user"] });
    await user.cookie();
    await user.cookie();
    await api.request("POST", "/api/auth/login", { body: { username: "visitante", password: "mal-password" } });
    await api.createUser({ username: "inactivo" });
    await api.c.users.updateOne({ username: "inactivo" }, { $set: { status: "disabled" } });
    // An old login outside the range is ignored.
    await api.c.auditLogs.insertOne({
      actorId: null,
      action: "auth.login.success",
      entityType: "user",
      entityId: null,
      metadata: {},
      ip: null,
      createdAt: new Date(Date.now() - 40 * 86_400_000)
    } as never);

    const response = await api.request("GET", "/api/dashboard?days=7&tz=UTC", { cookie });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.range).toMatchObject({ days: 7, tz: "UTC" });
    expect(body.series).toHaveLength(7);
    expect(body.series.at(-1).date).toBe(new Date().toISOString().slice(0, 10));
    // admin: 1 login + visitante: 2 logins; 1 failed attempt.
    expect(body.kpis).toEqual({
      activeUsers: 2,
      disabledUsers: 1,
      // admin, user and the 13 roles of REFYT's process.
      roles: 15,
      logins: 3,
      failedLogins: 1,
      uniqueUsers: 2
    });
    expect(body.series.at(-1)).toMatchObject({ logins: 3, failures: 1 });
    expect(body.series.slice(0, -1).every((day: { logins: number }) => day.logins === 0)).toBe(true);
  });

  it("validates the range and the time zone", async () => {
    const api = await setupApi(mongo);
    const cookie = await api.adminCookie();

    expect((await api.request("GET", "/api/dashboard?days=9", { cookie })).statusCode).toBe(400);
    expect((await api.request("GET", "/api/dashboard?tz=Mars/Base", { cookie })).statusCode).toBe(400);
    expect((await api.request("GET", "/api/dashboard?tz=America/Lima&days=30", { cookie })).json().series).toHaveLength(30);
  });
});
