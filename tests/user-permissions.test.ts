import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ALL_PERMISSION_KEYS } from "../src/auth/permissions.js";
import { setupApi, type Api } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

interface PermissionRow {
  key: string;
  fromRoles: string[];
  granted: boolean;
  revoked: boolean;
  effective: boolean;
  grantable: boolean;
}

describe.skipIf(skipDb)("per-user permissions", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  async function scenario(): Promise<{ api: Api; cookie: string; user: Awaited<ReturnType<Api["createUser"]>> }> {
    const api = await setupApi(mongo);
    const cookie = await api.adminCookie();
    // Role "user" grants notifications.read.
    const user = await api.createUser({ username: "maria", roleKeys: ["user"] });
    return { api, cookie, user };
  }

  it("lists every catalog permission with its origin", async () => {
    const { api, cookie, user } = await scenario();
    const response = await api.request("GET", `/api/users/${user.id}/permissions`, { cookie });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toMatchObject({ isAdmin: false, isSelf: false, editable: true });
    const rows = body.permissions as PermissionRow[];
    expect(rows).toHaveLength(ALL_PERMISSION_KEYS.length);
    expect(rows.find((row) => row.key === "notifications.read")).toMatchObject({
      fromRoles: ["Usuario"],
      effective: true,
      granted: false,
      revoked: false
    });
    expect(rows.find((row) => row.key === "users.read")).toMatchObject({ fromRoles: [], effective: false });
  });

  it("grants and revokes permissions on top of the roles", async () => {
    const { api, cookie, user } = await scenario();
    const userCookie = await user.cookie();
    expect((await api.request("GET", "/api/dashboard", { cookie: userCookie })).statusCode).toBe(403);
    expect((await api.request("GET", "/api/notifications", { cookie: userCookie })).statusCode).toBe(200);

    // Add dashboard.read, remove notifications.read (inherited from the role).
    const saved = await api.request("PUT", `/api/users/${user.id}/permissions`, {
      cookie,
      body: { permissionKeys: ["dashboard.read"] }
    });
    expect(saved.statusCode).toBe(200);
    expect(saved.json()).toEqual({
      permissionKeys: ["dashboard.read"],
      grantedPermissionKeys: ["dashboard.read"],
      revokedPermissionKeys: ["notifications.read"]
    });

    // Effective immediately, on the same session.
    expect((await api.request("GET", "/api/dashboard", { cookie: userCookie })).statusCode).toBe(200);
    expect((await api.request("GET", "/api/notifications", { cookie: userCookie })).statusCode).toBe(403);
    const me = await api.request("GET", "/api/auth/me", { cookie: userCookie });
    expect(me.json().permissions).toEqual(["dashboard.read"]);

    const rows = (await api.request("GET", `/api/users/${user.id}/permissions`, { cookie })).json()
      .permissions as PermissionRow[];
    expect(rows.find((row) => row.key === "notifications.read")).toMatchObject({ revoked: true, effective: false });
    expect(rows.find((row) => row.key === "dashboard.read")).toMatchObject({ granted: true, effective: true });

    const audit = await api.c.auditLogs.findOne({ action: "user.permissions.update" });
    expect(audit?.metadata).toEqual({ username: "maria", added: ["dashboard.read"], removed: ["notifications.read"] });
  });

  it("restoring the role permissions clears the overrides", async () => {
    const { api, cookie, user } = await scenario();
    await api.request("PUT", `/api/users/${user.id}/permissions`, { cookie, body: { permissionKeys: [] } });
    const restored = await api.request("PUT", `/api/users/${user.id}/permissions`, {
      cookie,
      body: { permissionKeys: ["notifications.read"] }
    });

    expect(restored.json()).toMatchObject({ grantedPermissionKeys: [], revokedPermissionKeys: [] });
  });

  it("does not let administrators be edited, nor anyone edit themselves", async () => {
    const { api, cookie } = await scenario();
    const admin = await api.c.users.findOne({ username: "admin" });
    const other = await api.createUser({ username: "otro.admin", roleKeys: ["admin"] });

    const self = await api.request("PUT", `/api/users/${admin!._id}/permissions`, { cookie, body: { permissionKeys: [] } });
    const otherAdmin = await api.request("PUT", `/api/users/${other.id}/permissions`, { cookie, body: { permissionKeys: [] } });
    const view = await api.request("GET", `/api/users/${other.id}/permissions`, { cookie });

    expect(self.json().error).toBe("cannot_edit_own_permissions");
    expect(otherAdmin.json().error).toBe("admin_has_all_permissions");
    expect(view.json()).toMatchObject({ isAdmin: true, editable: false });
  });

  it("blocks privilege escalation", async () => {
    const { api, user } = await scenario();
    const manager = await api.createUser({ username: "gestor", permissions: ["users.read", "users.update", "notifications.read"] });
    const managerCookie = await manager.cookie();

    // Cannot grant something the manager does not have.
    const escalate = await api.request("PUT", `/api/users/${user.id}/permissions`, {
      cookie: managerCookie,
      body: { permissionKeys: ["notifications.read", "audit.read"] }
    });
    expect(escalate.statusCode).toBe(403);

    // Cannot manage a user who holds more permissions than the manager.
    const strong = await api.createUser({ username: "fuerte", permissions: ["audit.read"] });
    const blocked = await api.request("PUT", `/api/users/${strong.id}/permissions`, {
      cookie: managerCookie,
      body: { permissionKeys: [] }
    });
    expect(blocked.statusCode).toBe(403);

    const view = await api.request("GET", `/api/users/${user.id}/permissions`, { cookie: managerCookie });
    const rows = view.json().permissions as PermissionRow[];
    expect(rows.find((row) => row.key === "audit.read")?.grantable).toBe(false);
    expect(rows.find((row) => row.key === "notifications.read")?.grantable).toBe(true);
  });

  it("rejects unknown permission keys", async () => {
    const { api, cookie, user } = await scenario();
    const response = await api.request("PUT", `/api/users/${user.id}/permissions`, {
      cookie,
      body: { permissionKeys: ["billing.pay"] }
    });
    expect(response.statusCode).toBe(400);
  });
});
