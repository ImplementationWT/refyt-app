import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_NEW_PASSWORD, ORIGIN, cookieHeader, setupApi } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

const GENERIC = { error: "invalid_credentials", message: "Usuario o contraseña incorrectos" };

describe.skipIf(skipDb)("authentication", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  describe("login", () => {
    it("logs in the seeded admin with admin123 and forces a password change", async () => {
      const api = await setupApi(mongo);
      const response = await api.request("POST", "/api/auth/login", {
        body: { username: "admin", password: "admin123" }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().user).toMatchObject({ username: "admin", mustChangePassword: true });
      expect(response.json().permissions).toContain("users.create");
    });

    it("answers identically for unknown user, wrong password and disabled user", async () => {
      const api = await setupApi(mongo);
      const disabled = await api.createUser({ username: "disabled.user" });
      await api.c.users.updateOne({ username: disabled.username }, { $set: { status: "disabled" } });

      const attempts = [
        { username: "nobody", password: "whatever-123" },
        { username: "admin", password: "wrong-password" },
        { username: disabled.username, password: disabled.password }
      ];
      for (const body of attempts) {
        const response = await api.request("POST", "/api/auth/login", { body });
        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual(GENERIC);
        expect(response.headers["set-cookie"]).toBeUndefined();
      }

      const audit = await api.c.auditLogs.find({ action: "auth.login.failure" }).toArray();
      expect(audit).toHaveLength(3);
    });

    it("records successful logins in the audit log", async () => {
      const api = await setupApi(mongo);
      await api.login("admin", "admin123");

      expect(await api.c.auditLogs.countDocuments({ action: "auth.login.success" })).toBe(1);
    });

    it("locks the account after repeated failures, even with the right password", async () => {
      const api = await setupApi(mongo, { settings: { loginMaxAttempts: 3, loginLockMs: 300 } });
      const user = await api.createUser({ username: "victim" });

      for (let i = 0; i < 3; i++) {
        await api.request("POST", "/api/auth/login", { body: { username: "victim", password: "bad-password" } });
      }
      const locked = await api.request("POST", "/api/auth/login", {
        body: { username: "victim", password: user.password }
      });
      expect(locked.statusCode).toBe(401);
      expect(locked.json()).toEqual(GENERIC);

      await new Promise((resolve) => setTimeout(resolve, 350));
      const unlocked = await api.request("POST", "/api/auth/login", {
        body: { username: "victim", password: user.password }
      });
      expect(unlocked.statusCode).toBe(200);
    });

    it("rate limits login attempts per IP", async () => {
      const api = await setupApi(mongo, { settings: { loginRateLimit: { max: 3, timeWindowMs: 60_000 } } });
      const statuses: number[] = [];
      for (let i = 0; i < 4; i++) {
        const response = await api.request("POST", "/api/auth/login", {
          body: { username: "nobody", password: "whatever-123" }
        });
        statuses.push(response.statusCode);
      }

      expect(statuses).toEqual([401, 401, 401, 429]);
      expect(JSON.parse(api.bodies.at(-1)!)).toMatchObject({ error: "too_many_requests" });
    });

    it("rejects malformed bodies with a validation error", async () => {
      const api = await setupApi(mongo);
      const response = await api.request("POST", "/api/auth/login", { body: { username: 1 } });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBe("validation_error");
    });
  });

  describe("forced password change", () => {
    it("blocks every other route until the password is changed", async () => {
      const api = await setupApi(mongo);
      const cookie = await api.login("admin", "admin123");

      for (const url of ["/api/users", "/api/roles", "/api/permissions", "/api/notifications", "/api/audit"]) {
        const response = await api.request("GET", url, { cookie });
        expect(response.statusCode, url).toBe(403);
        expect(response.json().error).toBe("password_change_required");
      }
      const blockedPost = await api.request("POST", "/api/notifications/read-all", { cookie });
      expect(blockedPost.statusCode).toBe(403);

      expect((await api.request("GET", "/api/auth/me", { cookie })).statusCode).toBe(200);
    });

    it.each([
      ["admin123", "La contraseña no puede ser la contraseña inicial"],
      ["corta", "La contraseña debe tener al menos 10 caracteres"],
      ["Admin", "La contraseña debe tener al menos 10 caracteres"]
    ])("rejects %j as the new password", async (newPassword, message) => {
      const api = await setupApi(mongo);
      const cookie = await api.login("admin", "admin123");
      const response = await api.request("POST", "/api/auth/change-password", {
        cookie,
        body: { currentPassword: "admin123", newPassword }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: "weak_password", message });
    });

    it("rejects a new password equal to the username", async () => {
      const api = await setupApi(mongo);
      await api.createUser({ username: "maria.lopez1", mustChangePassword: true });
      const cookie = await api.login("maria.lopez1", "Clave-de-prueba-1");
      const response = await api.request("POST", "/api/auth/change-password", {
        cookie,
        body: { currentPassword: "Clave-de-prueba-1", newPassword: "MARIA.LOPEZ1" }
      });

      expect(response.json().message).toBe("La contraseña no puede ser igual al usuario");
    });

    it("rejects a wrong current password", async () => {
      const api = await setupApi(mongo);
      const cookie = await api.login("admin", "admin123");
      const response = await api.request("POST", "/api/auth/change-password", {
        cookie,
        body: { currentPassword: "not-the-password", newPassword: ADMIN_NEW_PASSWORD }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBe("invalid_current_password");
    });

    it("unlocks the API after a valid change and revokes the other sessions", async () => {
      const api = await setupApi(mongo);
      const other = await api.login("admin", "admin123");
      const current = await api.login("admin", "admin123");

      const changed = await api.request("POST", "/api/auth/change-password", {
        cookie: current,
        body: { currentPassword: "admin123", newPassword: ADMIN_NEW_PASSWORD }
      });
      expect(changed.statusCode).toBe(200);

      expect((await api.request("GET", "/api/users", { cookie: current })).statusCode).toBe(200);
      expect((await api.request("GET", "/api/auth/me", { cookie: other })).statusCode).toBe(401);
      expect(await api.c.auditLogs.countDocuments({ action: "auth.password.change" })).toBe(1);

      const relogin = await api.request("POST", "/api/auth/login", {
        body: { username: "admin", password: ADMIN_NEW_PASSWORD }
      });
      expect(relogin.json().user.mustChangePassword).toBe(false);
    });
  });

  describe("sessions and cookies", () => {
    it("sets an httpOnly, SameSite=Strict, non-secure cookie in development", async () => {
      const api = await setupApi(mongo);
      const response = await api.request("POST", "/api/auth/login", {
        body: { username: "admin", password: "admin123" }
      });
      const cookie = response.cookies.find((item) => item.name === "sid")!;

      expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Strict", path: "/" });
      expect(cookie.secure).toBeFalsy();
    });

    it("sets a Secure __Host- cookie in production", async () => {
      const api = await setupApi(mongo, { settings: { production: true } });
      const response = await api.request("POST", "/api/auth/login", {
        body: { username: "admin", password: "admin123" }
      });
      const cookie = response.cookies.find((item) => item.name === "__Host-sid")!;

      expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Strict", path: "/" });
      expect(response.headers["strict-transport-security"]).toBeDefined();
    });

    it("stores only a hash of the session id", async () => {
      const api = await setupApi(mongo);
      const cookie = await api.login("admin", "admin123");
      const raw = cookie.split("=")[1]!;
      const session = await api.c.sessions.findOne({});

      expect(session?.sessionIdHash).toMatch(/^[a-f0-9]{64}$/);
      expect(JSON.stringify(session)).not.toContain(raw);
    });

    it("expires idle sessions", async () => {
      const api = await setupApi(mongo, { settings: { sessionIdleMs: 200 } });
      const cookie = await api.login("admin", "admin123");
      expect((await api.request("GET", "/api/auth/me", { cookie })).statusCode).toBe(200);

      await new Promise((resolve) => setTimeout(resolve, 250));
      expect((await api.request("GET", "/api/auth/me", { cookie })).statusCode).toBe(401);
    });

    it("logout deletes the session and clears the cookie", async () => {
      const api = await setupApi(mongo);
      const cookie = await api.login("admin", "admin123");
      const response = await api.request("POST", "/api/auth/logout", { cookie });

      expect(response.statusCode).toBe(200);
      expect(response.cookies.find((item) => item.name === "sid")?.value).toBe("");
      expect(await api.c.sessions.countDocuments()).toBe(0);
      expect((await api.request("GET", "/api/auth/me", { cookie })).statusCode).toBe(401);
    });

    it("requires a session for /api routes except login and meta", async () => {
      const api = await setupApi(mongo);

      expect((await api.request("GET", "/api/auth/me")).statusCode).toBe(401);
      expect((await api.request("GET", "/api/users")).statusCode).toBe(401);
      expect((await api.request("GET", "/api/meta")).statusCode).toBe(200);
      expect((await api.request("GET", "/health")).statusCode).toBe(200);
    });
  });

  describe("CSRF protection", () => {
    it("rejects unsafe requests without a matching Origin", async () => {
      const api = await setupApi(mongo);
      const body = { username: "admin", password: "admin123" };

      const missing = await api.request("POST", "/api/auth/login", { body, headers: { origin: "" } });
      const foreign = await api.request("POST", "/api/auth/login", {
        body,
        headers: { origin: "https://evil.example" }
      });
      expect(missing.statusCode).toBe(403);
      expect(foreign.statusCode).toBe(403);
      expect(foreign.json().error).toBe("invalid_origin");
    });

    it("accepts the forwarded host and protocol from the trusted proxy", async () => {
      const api = await setupApi(mongo);
      const response = await api.request("POST", "/api/auth/login", {
        body: { username: "admin", password: "admin123" },
        headers: {
          origin: "https://app.example.test",
          "x-forwarded-host": "app.example.test",
          "x-forwarded-proto": "https"
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it("requires application/json", async () => {
      const api = await setupApi(mongo);
      const response = await api.app.inject({
        method: "POST",
        url: "/api/auth/login",
        headers: { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded" },
        payload: "username=admin&password=admin123"
      });

      expect(response.statusCode).toBe(415);
    });

    it("keeps the session cookie usable with a valid origin", async () => {
      const api = await setupApi(mongo);
      const login = await api.request("POST", "/api/auth/login", {
        body: { username: "admin", password: "admin123" }
      });
      expect(cookieHeader(login)).toMatch(/^sid=/);
    });
  });
});
