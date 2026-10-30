import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  clearSessionCookie,
  permissionsOf,
  requireAuth,
  setSessionCookie,
  type CookieSettings
} from "../../auth/context.js";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "../../auth/password.js";
import { MAX_PASSWORD_LENGTH, passwordPolicyError } from "../../auth/password-policy.js";
import {
  createSession,
  deleteSession,
  deleteUserSessions,
  type SessionSettings
} from "../../auth/sessions.js";
import type { Collections, UserDoc } from "../../db/collections.js";
import { AppError } from "../../http/errors.js";
import { recordAudit } from "../audit/service.js";
import { rolesMap, toPublicUser } from "../users/dto.js";

export interface AuthRouteDeps {
  collections: () => Promise<Collections>;
  sessions: SessionSettings;
  cookie: CookieSettings;
  lockout: { maxAttempts: number; lockMs: number };
  loginRateLimit: { max: number; timeWindowMs: number };
  /** Feature flags of optional integrations for a user's permissions. */
  features: (permissions: ReadonlySet<string>) => string[];
}

const INVALID_CREDENTIALS = "Incorrect username or password";

const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(100),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(MAX_PASSWORD_LENGTH),
  newPassword: z.string().min(1).max(MAX_PASSWORD_LENGTH)
});

function invalidCredentials() {
  return new AppError(401, "invalid_credentials", INVALID_CREDENTIALS);
}

export async function authRoutes(app: FastifyInstance, deps: AuthRouteDeps) {
  const rateLimit = { max: deps.loginRateLimit.max, timeWindow: deps.loginRateLimit.timeWindowMs };

  app.post(
    "/api/auth/login",
    { config: { auth: "public", rateLimit } },
    async (request, reply) => {
      const { username, password } = loginSchema.parse(request.body);
      const c = await deps.collections();
      const now = new Date();
      const user = await c.users.findOne({ username });

      const fail = async (reason: string, target: UserDoc | null) => {
        await recordAudit(c, request, {
          actorId: target?._id ?? null,
          action: "auth.login.failure",
          entityType: "user",
          entityId: target?._id ?? null,
          metadata: { username: username.slice(0, 100), reason }
        });
        // Same status and message whatever the reason (no user enumeration).
        return invalidCredentials();
      };

      if (!user) {
        await verifyAgainstDummy(password);
        throw await fail("unknown_user", null);
      }
      if (user.lockedUntil && user.lockedUntil > now) {
        await verifyAgainstDummy(password);
        throw await fail("locked", user);
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        const updated = await c.users.findOneAndUpdate(
          { _id: user._id },
          { $inc: { failedLoginCount: 1 } },
          { returnDocument: "after" }
        );
        if (updated && updated.failedLoginCount >= deps.lockout.maxAttempts) {
          await c.users.updateOne(
            { _id: user._id },
            { $set: { lockedUntil: new Date(now.getTime() + deps.lockout.lockMs), failedLoginCount: 0 } }
          );
        }
        throw await fail("bad_password", user);
      }
      if (user.status !== "active") {
        throw await fail("disabled", user);
      }

      await c.users.updateOne(
        { _id: user._id },
        { $set: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: now } }
      );

      // Never reuse a pre-login session id (session fixation).
      const previous = request.cookies[deps.cookie.name];
      if (previous) {
        await deleteSession(c, previous, deps.sessions);
      }
      const session = await createSession(c, user._id, deps.sessions, now);
      setSessionCookie(reply, deps.cookie, session.id, session.absoluteExpiresAt);

      await recordAudit(c, request, {
        actorId: user._id,
        action: "auth.login.success",
        entityType: "user",
        entityId: user._id
      });

      const roles = await c.roles.find({ _id: { $in: user.roleIds } }).toArray();
      return {
        user: toPublicUser({ ...user, lastLoginAt: now }, rolesMap(roles)),
        permissions: [...permissionsOf(roles, user)].sort(),
        features: deps.features(permissionsOf(roles, user))
      };
    }
  );

  app.post("/api/auth/logout", { config: { auth: "public" } }, async (request, reply) => {
    const c = await deps.collections();
    const rawId = request.cookies[deps.cookie.name];
    if (rawId) {
      await deleteSession(c, rawId, deps.sessions);
    }
    if (request.auth) {
      await recordAudit(c, request, {
        actorId: request.auth.user._id,
        action: "auth.logout",
        entityType: "user",
        entityId: request.auth.user._id
      });
    }
    clearSessionCookie(reply, deps.cookie);
    return { ok: true };
  });

  app.get("/api/auth/me", { config: { allowDuringPasswordChange: true } }, async (request) => {
    const { user, roles, permissions } = requireAuth(request);
    return {
      user: toPublicUser(user, rolesMap(roles)),
      permissions: [...permissions].sort(),
      features: deps.features(permissions)
    };
  });

  app.post(
    "/api/auth/change-password",
    { config: { allowDuringPasswordChange: true, rateLimit } },
    async (request) => {
      const { user, session } = requireAuth(request);
      const { currentPassword, newPassword } = changePasswordSchema.parse(request.body);

      if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        throw new AppError(400, "invalid_current_password", "The current password is not correct");
      }
      const policyError = passwordPolicyError(newPassword, user.username);
      if (policyError) {
        throw new AppError(400, "weak_password", policyError);
      }
      if (newPassword === currentPassword) {
        throw new AppError(400, "weak_password", "The new password must be different from the current one");
      }

      const c = await deps.collections();
      await c.users.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordHash: await hashPassword(newPassword),
            mustChangePassword: false,
            updatedAt: new Date()
          }
        }
      );
      // Every other session of this user is revoked; the current one stays.
      await deleteUserSessions(c, user._id, session._id);
      await recordAudit(c, request, {
        actorId: user._id,
        action: "auth.password.change",
        entityType: "user",
        entityId: user._id
      });
      return { ok: true };
    }
  );
}
