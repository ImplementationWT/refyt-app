import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupApi, type Api } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

const FAKE_ID = "0123456789abcdef01234567";

// Every protected endpoint with the permission it needs.
const ENDPOINTS: Array<[method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, permission: string, body?: unknown]> = [
  ["GET", "/api/users", "users.read"],
  ["GET", `/api/users/${FAKE_ID}`, "users.read"],
  ["POST", "/api/users", "users.create", { username: "x.user", displayName: "X", password: "Clave-valida-1" }],
  ["PATCH", `/api/users/${FAKE_ID}`, "users.update", { displayName: "X" }],
  ["POST", `/api/users/${FAKE_ID}/reset-password`, "users.update", { password: "Clave-valida-1" }],
  ["DELETE", `/api/users/${FAKE_ID}`, "users.delete"],
  ["GET", `/api/users/${FAKE_ID}/permissions`, "users.read"],
  ["PUT", `/api/users/${FAKE_ID}/permissions`, "users.update", { permissionKeys: [] }],
  ["GET", "/api/roles", "roles.read"],
  ["GET", `/api/roles/${FAKE_ID}`, "roles.read"],
  ["POST", "/api/roles", "roles.create", { key: "x", name: "X" }],
  ["PATCH", `/api/roles/${FAKE_ID}`, "roles.update", { name: "X" }],
  ["DELETE", `/api/roles/${FAKE_ID}`, "roles.delete"],
  ["GET", "/api/permissions", "permissions.read"],
  ["GET", "/api/notifications", "notifications.read"],
  ["POST", "/api/notifications/read-all", "notifications.read"],
  ["POST", `/api/notifications/${FAKE_ID}/read`, "notifications.read"],
  ["POST", "/api/notifications", "notifications.manage", { userIds: [FAKE_ID], title: "X" }],
  ["GET", "/api/audit", "audit.read"],
  ["GET", "/api/dashboard", "dashboard.read"],
  ["GET", "/api/integrations", "integrations.read"],
  ["POST", "/api/integrations/monday/test", "integrations.manage"],
  ["GET", "/api/monday/boards", "monday.read"]
];

describe.skipIf(skipDb)("authorization", () => {
  let mongo: TestMongo;
  let api: Api;

  beforeAll(async () => {
    mongo = await startMongo();
    api = await setupApi(mongo);
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  it.each(ENDPOINTS)("%s %s returns 401 without a session", async (method, url, _permission, body) => {
    const response = await api.request(method, url, { body });
    expect(response.statusCode).toBe(401);
  });

  it.each(ENDPOINTS)("%s %s returns 403 without %s", async (method, url, permission, body) => {
    const user = await api.createUser({
      username: `no.${permission}.${method.toLowerCase()}.${url.length}`,
      permissions: ENDPOINTS.map(([, , key]) => key).filter((key) => key !== permission)
    });
    const response = await api.request(method, url, { cookie: await user.cookie(), body });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("forbidden");
  });

  it.each(ENDPOINTS)("%s %s is allowed with %s", async (method, url, permission, body) => {
    const user = await api.createUser({
      username: `yes.${permission}.${method.toLowerCase()}.${url.length}`,
      permissions: [permission]
    });
    const response = await api.request(method, url, { cookie: await user.cookie(), body });

    // Past the permission check: success, validation or not-found, never 401/403.
    expect([200, 201, 400, 404, 409]).toContain(response.statusCode);
  });

  describe("privilege escalation", () => {
    it("cannot assign a role with permissions the actor lacks", async () => {
      const manager = await api.createUser({
        username: "manager.assign",
        permissions: ["users.read", "users.create", "users.update"]
      });
      const cookie = await manager.cookie();
      const adminRole = await api.c.roles.findOne({ key: "admin" });

      const created = await api.request("POST", "/api/users", {
        cookie,
        body: { username: "sneaky", displayName: "S", password: "Clave-valida-1", roleIds: [String(adminRole!._id)] }
      });
      const selfPromote = await api.request("PATCH", `/api/users/${manager.id}`, {
        cookie,
        body: { roleIds: [String(adminRole!._id)] }
      });

      expect(created.statusCode).toBe(403);
      expect(selfPromote.statusCode).toBe(403);
    });

    it("cannot reset the password of a more privileged user", async () => {
      const manager = await api.createUser({ username: "manager.reset", permissions: ["users.update"] });
      const admin = await api.c.users.findOne({ username: "admin" });
      const response = await api.request("POST", `/api/users/${admin!._id}/reset-password`, {
        cookie: await manager.cookie(),
        body: { password: "Clave-tomada-1" }
      });

      expect(response.statusCode).toBe(403);
    });

    it("cannot create a role with permissions the actor lacks", async () => {
      const manager = await api.createUser({ username: "manager.roles", permissions: ["roles.create"] });
      const response = await api.request("POST", "/api/roles", {
        cookie: await manager.cookie(),
        body: { key: "superpowers", name: "S", permissionKeys: ["audit.read"] }
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
