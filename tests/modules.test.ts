import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ALL_PERMISSION_KEYS } from "../src/auth/permissions.js";
import { setupApi, type Api } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

describe.skipIf(skipDb)("API modules", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  async function adminApi(): Promise<{ api: Api; cookie: string; adminId: string; adminRoleId: string }> {
    const api = await setupApi(mongo);
    const cookie = await api.adminCookie();
    const admin = await api.c.users.findOne({ username: "admin" });
    const role = await api.c.roles.findOne({ key: "admin" });
    return { api, cookie, adminId: String(admin!._id), adminRoleId: String(role!._id) };
  }

  describe("users", () => {
    it("creates, reads, updates, resets and deletes a user", async () => {
      const { api, cookie } = await adminApi();
      const userRole = await api.c.roles.findOne({ key: "user" });

      const created = await api.request("POST", "/api/users", {
        cookie,
        body: {
          username: "Ana.Perez",
          email: "ANA@example.test",
          displayName: "Ana Pérez",
          password: "Clave-inicial-1",
          roleIds: [String(userRole!._id)]
        }
      });
      expect(created.statusCode).toBe(201);
      const user = created.json().user;
      expect(user).toMatchObject({
        username: "ana.perez",
        email: "ana@example.test",
        mustChangePassword: true,
        roles: [{ key: "user" }]
      });
      expect(user).not.toHaveProperty("passwordHash");

      const duplicate = await api.request("POST", "/api/users", {
        cookie,
        body: { username: "ana.perez", displayName: "Otra", password: "Clave-inicial-1" }
      });
      expect(duplicate.statusCode).toBe(409);
      expect(duplicate.json().error).toBe("username_taken");

      const fetched = await api.request("GET", `/api/users/${user.id}`, { cookie });
      expect(fetched.json().user.displayName).toBe("Ana Pérez");

      const updated = await api.request("PATCH", `/api/users/${user.id}`, {
        cookie,
        body: { displayName: "Ana P.", email: null, status: "disabled" }
      });
      expect(updated.json().user).toMatchObject({ displayName: "Ana P.", email: null, status: "disabled" });

      const reset = await api.request("POST", `/api/users/${user.id}/reset-password`, {
        cookie,
        body: { password: "Clave-temporal-2" }
      });
      expect(reset.statusCode).toBe(200);

      const removed = await api.request("DELETE", `/api/users/${user.id}`, { cookie });
      expect(removed.statusCode).toBe(200);
      expect((await api.request("GET", `/api/users/${user.id}`, { cookie })).statusCode).toBe(404);

      const actions = (await api.c.auditLogs.find({ entityType: "user", entityId: user.id }).toArray()).map(
        (entry) => entry.action
      );
      expect(actions).toEqual(["user.create", "user.update", "user.password.reset", "user.delete"]);
    });

    it("rejects weak passwords on create and reset", async () => {
      const { api, cookie, adminId } = await adminApi();
      const created = await api.request("POST", "/api/users", {
        cookie,
        body: { username: "weak.user", displayName: "W", password: "admin123" }
      });
      expect(created.json().error).toBe("weak_password");

      const other = await api.createUser({ username: "other.user" });
      const reset = await api.request("POST", `/api/users/${other.id}/reset-password`, {
        cookie,
        body: { password: "other.user" }
      });
      expect(reset.json().error).toBe("weak_password");

      const self = await api.request("POST", `/api/users/${adminId}/reset-password`, {
        cookie,
        body: { password: "Clave-valida-9" }
      });
      expect(self.statusCode).toBe(409);
    });

    it("reset forces a password change and revokes the user's sessions", async () => {
      const { api, cookie } = await adminApi();
      const user = await api.createUser({ username: "reset.me" });
      const userCookie = await user.cookie();

      await api.request("POST", `/api/users/${user.id}/reset-password`, {
        cookie,
        body: { password: "Clave-temporal-3" }
      });

      expect((await api.request("GET", "/api/auth/me", { cookie: userCookie })).statusCode).toBe(401);
      const relogin = await api.request("POST", "/api/auth/login", {
        body: { username: "reset.me", password: "Clave-temporal-3" }
      });
      expect(relogin.json().user.mustChangePassword).toBe(true);
    });

    it("disabling a user revokes their sessions", async () => {
      const { api, cookie } = await adminApi();
      const user = await api.createUser({ username: "to.disable", roleKeys: ["user"] });
      const userCookie = await user.cookie();

      await api.request("PATCH", `/api/users/${user.id}`, { cookie, body: { status: "disabled" } });

      expect((await api.request("GET", "/api/notifications", { cookie: userCookie })).statusCode).toBe(401);
    });

    it("searches, sorts and paginates on the server", async () => {
      const { api, cookie } = await adminApi();
      for (const name of ["zeta.user", "alpha.user", "beta.user", "gamma.other"]) {
        await api.createUser({ username: name });
      }

      const page1 = await api.request("GET", "/api/users?q=user&sort=-username&page=1&pageSize=2", { cookie });
      expect(page1.json()).toMatchObject({ total: 3, page: 1, pageSize: 2 });
      expect(page1.json().items.map((u: { username: string }) => u.username)).toEqual(["zeta.user", "beta.user"]);

      const page2 = await api.request("GET", "/api/users?q=user&sort=-username&page=2&pageSize=2", { cookie });
      expect(page2.json().items.map((u: { username: string }) => u.username)).toEqual(["alpha.user"]);

      // Regex metacharacters are matched literally.
      const literal = await api.request("GET", "/api/users?q=.*", { cookie });
      expect(literal.json().total).toBe(0);

      const badSort = await api.request("GET", "/api/users?sort=passwordHash", { cookie });
      expect(badSort.statusCode).toBe(400);
      const tooBig = await api.request("GET", "/api/users?pageSize=1000", { cookie });
      expect(tooBig.statusCode).toBe(400);
    });
  });

  describe("administrator safeguards", () => {
    it("cannot delete or disable the last active admin", async () => {
      const { api, adminId } = await adminApi();
      // A second account with full user management but without the admin role.
      const manager = await api.createUser({
        username: "manager.full",
        permissions: [...ALL_PERMISSION_KEYS]
      });
      const cookie = await manager.cookie();

      const disable = await api.request("PATCH", `/api/users/${adminId}`, { cookie, body: { status: "disabled" } });
      const remove = await api.request("DELETE", `/api/users/${adminId}`, { cookie });
      const demote = await api.request("PATCH", `/api/users/${adminId}`, { cookie, body: { roleIds: [] } });

      for (const response of [disable, remove, demote]) {
        expect(response.statusCode).toBe(409);
        expect(response.json().error).toBe("last_admin");
      }
    });

    it("cannot remove the admin role from oneself, disable or delete oneself", async () => {
      const { api, cookie, adminId, adminRoleId } = await adminApi();
      // With a second admin the last-admin rule does not apply.
      await api.createUser({ username: "second.admin", roleKeys: ["admin"] });

      const demote = await api.request("PATCH", `/api/users/${adminId}`, { cookie, body: { roleIds: [] } });
      const disable = await api.request("PATCH", `/api/users/${adminId}`, { cookie, body: { status: "disabled" } });
      const remove = await api.request("DELETE", `/api/users/${adminId}`, { cookie });

      expect(demote.json().error).toBe("cannot_remove_own_admin");
      expect(disable.json().error).toBe("cannot_disable_self");
      expect(remove.json().error).toBe("cannot_delete_self");

      const keep = await api.request("PATCH", `/api/users/${adminId}`, { cookie, body: { roleIds: [adminRoleId] } });
      expect(keep.statusCode).toBe(200);
    });

    it("allows disabling an admin when another active admin remains", async () => {
      const { api, cookie } = await adminApi();
      const second = await api.createUser({ username: "second.admin", roleKeys: ["admin"] });

      const response = await api.request("PATCH", `/api/users/${second.id}`, { cookie, body: { status: "disabled" } });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("roles and permissions", () => {
    it("creates, edits and deletes custom roles", async () => {
      const { api, cookie } = await adminApi();
      const created = await api.request("POST", "/api/roles", {
        cookie,
        body: { key: "auditor", name: "Auditor", permissionKeys: ["audit.read", "audit.read"] }
      });
      expect(created.statusCode).toBe(201);
      const role = created.json().role;
      expect(role.permissionKeys).toEqual(["audit.read"]);

      const unknown = await api.request("POST", "/api/roles", {
        cookie,
        body: { key: "bad", name: "Bad", permissionKeys: ["billing.pay"] }
      });
      expect(unknown.statusCode).toBe(400);

      const edited = await api.request("PATCH", `/api/roles/${role.id}`, {
        cookie,
        body: { name: "Auditoría", permissionKeys: ["audit.read", "users.read"] }
      });
      expect(edited.json().role).toMatchObject({ name: "Auditoría", permissionKeys: ["audit.read", "users.read"] });

      const list = await api.request("GET", "/api/roles?sort=key", { cookie });
      expect(list.json().items.map((r: { key: string }) => r.key)).toEqual(expect.arrayContaining(["admin", "auditor", "user"]));

      expect((await api.request("DELETE", `/api/roles/${role.id}`, { cookie })).statusCode).toBe(200);
      expect(await api.c.auditLogs.countDocuments({ entityType: "role" })).toBe(3);
    });

    it("protects system roles and roles in use", async () => {
      const { api, cookie } = await adminApi();
      const admin = await api.c.roles.findOne({ key: "admin" });
      const userRole = await api.c.roles.findOne({ key: "user" });
      await api.createUser({ username: "holder", roleKeys: ["user"] });

      const edit = await api.request("PATCH", `/api/roles/${admin!._id}`, { cookie, body: { name: "X" } });
      const remove = await api.request("DELETE", `/api/roles/${admin!._id}`, { cookie });
      const inUse = await api.request("DELETE", `/api/roles/${userRole!._id}`, { cookie });

      expect(edit.json().error).toBe("system_role");
      expect(remove.json().error).toBe("system_role");
      expect(inUse.json().error).toBe("role_in_use");
    });

    it("lists the read-only permission catalog", async () => {
      const { api, cookie } = await adminApi();
      const response = await api.request("GET", "/api/permissions", { cookie });

      expect(response.json().total).toBe(ALL_PERMISSION_KEYS.length);
      expect(response.json().items[0]).toEqual({
        key: "audit.read",
        module: "audit",
        description: "See the audit log"
      });
    });
  });

  describe("notifications", () => {
    it("sends, lists own, marks one and all as read", async () => {
      const { api, cookie } = await adminApi();
      const user = await api.createUser({ username: "reader", roleKeys: ["user"] });
      const other = await api.createUser({ username: "other.reader", roleKeys: ["user"] });

      const sent = await api.request("POST", "/api/notifications", {
        cookie,
        body: { userIds: [user.id, other.id], title: "Bienvenida", body: "Hola", type: "info" }
      });
      expect(sent.json()).toEqual({ created: 2 });
      await api.request("POST", "/api/notifications", { cookie, body: { userIds: [user.id], title: "Segunda" } });

      const userCookie = await user.cookie();
      const list = await api.request("GET", "/api/notifications", { cookie: userCookie });
      expect(list.json()).toMatchObject({ total: 2, unreadCount: 2 });
      expect(list.json().items[0].title).toBe("Segunda");

      const first = list.json().items[0].id;
      const read = await api.request("POST", `/api/notifications/${first}/read`, { cookie: userCookie });
      expect(read.json().notification.readAt).not.toBeNull();

      // Another user's notification is not visible to this user.
      const otherList = await api.request("GET", "/api/notifications", { cookie: await other.cookie() });
      const foreign = otherList.json().items[0].id;
      expect((await api.request("POST", `/api/notifications/${foreign}/read`, { cookie: userCookie })).statusCode).toBe(404);

      const all = await api.request("POST", "/api/notifications/read-all", { cookie: userCookie });
      expect(all.json()).toEqual({ updated: 1 });
      const after = await api.request("GET", "/api/notifications?unread=true", { cookie: userCookie });
      expect(after.json()).toMatchObject({ total: 0, unreadCount: 0 });
    });
  });

  describe("audit", () => {
    it("filters by action, actor and date", async () => {
      const { api, cookie, adminId } = await adminApi();
      await api.request("POST", "/api/auth/login", { body: { username: "nobody", password: "whatever-1" } });

      const failures = await api.request("GET", "/api/audit?action=auth.login.failure", { cookie });
      expect(failures.json().total).toBe(1);
      expect(failures.json().items[0]).toMatchObject({ actor: null, metadata: { username: "nobody", reason: "unknown_user" } });

      const byActor = await api.request("GET", `/api/audit?actorId=${adminId}`, { cookie });
      expect(byActor.json().items.every((item: { actor: { username: string } }) => item.actor.username === "admin")).toBe(true);

      const today = new Date().toISOString().slice(0, 10);
      const ranged = await api.request("GET", `/api/audit?from=${today}&to=${today}`, { cookie });
      const future = await api.request("GET", "/api/audit?from=2999-01-01", { cookie });
      expect(ranged.json().total).toBeGreaterThan(0);
      expect(future.json().total).toBe(0);
    });
  });
});
