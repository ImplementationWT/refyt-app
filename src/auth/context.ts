import type { FastifyInstance, FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import type { ObjectId } from "mongodb";
import type { Collections, RoleDoc, SessionDoc, UserDoc } from "../db/collections.js";
import { AppError, forbidden } from "../http/errors.js";
import { ADMIN_ROLE_KEY, type PermissionKey } from "./permissions.js";
import { deleteSession, resolveSession, type SessionSettings } from "./sessions.js";

export interface AuthContext {
  user: UserDoc;
  roles: RoleDoc[];
  permissions: ReadonlySet<string>;
  session: SessionDoc;
}

declare module "fastify" {
  interface FastifyContextConfig {
    /** "public": no session needed. Default: a valid session is required. */
    auth?: "public";
    /** Reachable while the user must still change their password. */
    allowDuringPasswordChange?: boolean;
  }
  interface FastifyRequest {
    auth: AuthContext | null;
  }
}

export interface CookieSettings {
  name: string;
  secure: boolean;
}

/** __Host- prefix (requires Secure, Path=/, no Domain) when served over HTTPS. */
export function cookieSettings(production: boolean): CookieSettings {
  return production ? { name: "__Host-sid", secure: true } : { name: "sid", secure: false };
}

export function setSessionCookie(
  reply: FastifyReply,
  cookie: CookieSettings,
  id: string,
  absoluteExpiresAt: Date
) {
  reply.setCookie(cookie.name, id, {
    httpOnly: true,
    sameSite: "strict",
    secure: cookie.secure,
    path: "/",
    expires: absoluteExpiresAt
  });
}

export function clearSessionCookie(reply: FastifyReply, cookie: CookieSettings) {
  reply.clearCookie(cookie.name, { httpOnly: true, sameSite: "strict", secure: cookie.secure, path: "/" });
}

export async function loadRoles(c: Collections, roleIds: ObjectId[]): Promise<RoleDoc[]> {
  return roleIds.length ? c.roles.find({ _id: { $in: roleIds } }).toArray() : [];
}

export function isAdmin(roles: RoleDoc[]): boolean {
  return roles.some((role) => role.key === ADMIN_ROLE_KEY);
}

/**
 * Effective permissions: (role permissions ∪ granted) − revoked.
 * Administrators always keep the full admin role: overrides do not apply.
 */
export function permissionsOf(
  roles: RoleDoc[],
  user?: Pick<UserDoc, "grantedPermissionKeys" | "revokedPermissionKeys">
): Set<string> {
  const effective = new Set(roles.flatMap((role) => role.permissionKeys));
  if (!user || isAdmin(roles)) {
    return effective;
  }
  for (const key of user.grantedPermissionKeys ?? []) effective.add(key);
  for (const key of user.revokedPermissionKeys ?? []) effective.delete(key);
  return effective;
}

const unauthorized = () => new AppError(401, "unauthorized", "Tu sesión no es válida o ha expirado");

/**
 * Resolves the session cookie on every /api request and enforces:
 * a valid session (unless the route is public) and, while
 * mustChangePassword is set, only the routes that allow it.
 */
export function installAuth(
  app: FastifyInstance,
  deps: { collections: () => Promise<Collections>; sessions: SessionSettings; cookie: CookieSettings }
) {
  app.decorateRequest("auth", null);

  app.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/api/")) {
      return;
    }
    const config = request.routeOptions.config;
    const isPublic = config?.auth === "public";
    const rawId = request.cookies[deps.cookie.name];

    if (rawId) {
      const c = await deps.collections();
      const session = await resolveSession(c, rawId, deps.sessions);
      const user = session ? await c.users.findOne({ _id: session.userId }) : null;

      if (session && user && user.status === "active") {
        const roles = await loadRoles(c, user.roleIds);
        request.auth = { user, roles, permissions: permissionsOf(roles, user), session };
      } else {
        if (session) {
          await deleteSession(c, rawId, deps.sessions);
        }
        clearSessionCookie(reply, deps.cookie);
      }
    }

    if (isPublic) {
      return;
    }
    if (!request.auth) {
      throw unauthorized();
    }
    if (request.auth.user.mustChangePassword && !config?.allowDuringPasswordChange) {
      throw new AppError(403, "password_change_required", "Debes cambiar tu contraseña para continuar");
    }
  });
}

export function requireAuth(request: FastifyRequest): AuthContext {
  if (!request.auth) {
    throw unauthorized();
  }
  return request.auth;
}

/** preHandler: the authenticated user must hold the permission (via any role). */
export function requirePermission(permission: PermissionKey): preHandlerHookHandler {
  return async (request) => {
    if (!requireAuth(request).permissions.has(permission)) {
      throw forbidden();
    }
  };
}
