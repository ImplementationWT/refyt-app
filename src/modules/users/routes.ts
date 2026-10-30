import type { FastifyInstance } from "fastify";
import { MongoServerError, ObjectId, type Filter } from "mongodb";
import { z } from "zod";
import { isAdmin, permissionsOf, requireAuth, requirePermission, type AuthContext } from "../../auth/context.js";
import { hashPassword } from "../../auth/password.js";
import { MAX_PASSWORD_LENGTH, passwordPolicyError } from "../../auth/password-policy.js";
import { ADMIN_ROLE_KEY, isPermissionKey } from "../../auth/permissions.js";
import { deleteUserSessions } from "../../auth/sessions.js";
import type { Collections, RoleDoc, UserDoc } from "../../db/collections.js";
import { AppError, conflict, forbidden, notFound } from "../../http/errors.js";
import {
  containsRegex,
  paginationSchema,
  parseObjectId,
  toMongoSort,
  type Page
} from "../../http/pagination.js";
import { recordAudit } from "../audit/service.js";
import { rolesMap, toPublicUser, type PublicUser } from "./dto.js";

interface Deps {
  collections: () => Promise<Collections>;
}

const objectIdString = z.string().regex(/^[a-f0-9]{24}$/i, { error: "Invalid identifier" });

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(200)
  .pipe(z.email({ error: "Invalid email" }));

const listSchema = paginationSchema(
  ["username", "displayName", "email", "status", "createdAt", "lastLoginAt"],
  "username"
).extend({ status: z.enum(["active", "disabled"]).optional() });

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,50}$/, {
      error: "Use 3 to 50 characters: lowercase letters, numbers, dot, hyphen or underscore"
    }),
  email: emailSchema.optional(),
  displayName: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
  roleIds: z.array(objectIdString).max(20).default([]),
  status: z.enum(["active", "disabled"]).default("active")
});

const updateSchema = z
  .object({
    email: emailSchema.nullable().optional(),
    displayName: z.string().trim().min(1).max(100).optional(),
    status: z.enum(["active", "disabled"]).optional(),
    roleIds: z.array(objectIdString).max(20).optional()
  })
  .refine((value) => Object.keys(value).length > 0, { error: "No changes" });

const resetPasswordSchema = z.object({ password: z.string().min(1).max(MAX_PASSWORD_LENGTH) });

/** An actor may only act on users/roles whose permissions it also holds. */
export function assertWithinActorPermissions(actor: AuthContext, roles: RoleDoc[]) {
  const exceeding = roles.some((role) =>
    role.permissionKeys.some((key) => !actor.permissions.has(key))
  );
  if (exceeding) {
    throw forbidden("You cannot manage roles or users with more permissions than yours");
  }
}

/** Same rule for a target user: their effective permissions (roles + overrides). */
export function assertCanManageUser(actor: AuthContext, target: UserDoc, targetRoles: RoleDoc[]) {
  if ([...permissionsOf(targetRoles, target)].some((key) => !actor.permissions.has(key))) {
    throw forbidden("You cannot manage users with more permissions than yours");
  }
}

const userPermissionsSchema = z.object({
  permissionKeys: z
    .array(z.string().refine(isPermissionKey, { error: "Unknown permission" }))
    .max(100)
    .transform((keys) => [...new Set(keys)])
});

async function loadRolesStrict(c: Collections, ids: string[]): Promise<RoleDoc[]> {
  const unique = [...new Set(ids)];
  const roles = await c.roles.find({ _id: { $in: unique.map((id) => new ObjectId(id)) } }).toArray();
  if (roles.length !== unique.length) {
    throw new AppError(400, "unknown_role", "One of the roles does not exist");
  }
  return roles;
}

async function getAdminRoleId(c: Collections): Promise<ObjectId | null> {
  return (await c.roles.findOne({ key: ADMIN_ROLE_KEY }, { projection: { _id: 1 } }))?._id ?? null;
}

function isActiveAdmin(user: Pick<UserDoc, "status" | "roleIds">, adminRoleId: ObjectId | null) {
  return (
    adminRoleId !== null &&
    user.status === "active" &&
    user.roleIds.some((id) => id.equals(adminRoleId))
  );
}

async function assertNotLastAdmin(c: Collections, target: UserDoc, adminRoleId: ObjectId | null) {
  if (!adminRoleId || !isActiveAdmin(target, adminRoleId)) {
    return;
  }
  const others = await c.users.countDocuments({
    _id: { $ne: target._id },
    roleIds: adminRoleId,
    status: "active"
  });
  if (others === 0) {
    throw conflict("last_admin", "The system cannot be left without an active administrator");
  }
}

function duplicateKeyConflict(error: unknown): never {
  if (error instanceof MongoServerError && error.code === 11000) {
    const field = Object.keys(error.keyPattern ?? {})[0];
    throw field === "email"
      ? conflict("email_taken", "A user with that email already exists")
      : conflict("username_taken", "A user with that username already exists");
  }
  throw error;
}

async function withRoles(c: Collections, users: UserDoc[]): Promise<PublicUser[]> {
  const ids = [...new Set(users.flatMap((user) => user.roleIds.map(String)))];
  const roles = ids.length
    ? await c.roles.find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray()
    : [];
  const map = rolesMap(roles);
  return users.map((user) => toPublicUser(user, map));
}

function weakPassword(password: string, username: string) {
  const message = passwordPolicyError(password, username);
  if (message) {
    throw new AppError(400, "weak_password", message);
  }
}

export async function userRoutes(app: FastifyInstance, deps: Deps) {
  app.get(
    "/api/users",
    { preHandler: requirePermission("users.read") },
    async (request): Promise<Page<PublicUser>> => {
      const { page, pageSize, q, sort, status } = listSchema.parse(request.query);
      const c = await deps.collections();

      const filter: Filter<UserDoc> = {};
      if (q) {
        const regex = containsRegex(q);
        filter.$or = [{ username: regex }, { displayName: regex }, { email: regex }];
      }
      if (status) {
        filter.status = status;
      }

      const [docs, total] = await Promise.all([
        c.users
          .find(filter, { projection: { passwordHash: 0 } })
          .sort(toMongoSort(sort))
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        c.users.countDocuments(filter)
      ]);
      return { items: await withRoles(c, docs as UserDoc[]), total, page, pageSize };
    }
  );

  app.post(
    "/api/users",
    { preHandler: requirePermission("users.create") },
    async (request, reply) => {
      const actor = requireAuth(request);
      const input = createSchema.parse(request.body);
      weakPassword(input.password, input.username);
      const c = await deps.collections();
      const roles = await loadRolesStrict(c, input.roleIds);
      assertWithinActorPermissions(actor, roles);

      const now = new Date();
      const doc = {
        username: input.username,
        ...(input.email ? { email: input.email } : {}),
        displayName: input.displayName,
        passwordHash: await hashPassword(input.password),
        roleIds: roles.map((role) => role._id),
        status: input.status,
        mustChangePassword: true,
        lastLoginAt: null,
        failedLoginCount: 0,
        lockedUntil: null,
        createdAt: now,
        updatedAt: now
      };
      const result = await c.users.insertOne(doc as UserDoc).catch(duplicateKeyConflict);
      const created = { ...doc, _id: result.insertedId } as UserDoc;

      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "user.create",
        entityType: "user",
        entityId: created._id,
        metadata: { username: created.username, roles: roles.map((role) => role.key) }
      });
      return reply.code(201).send({ user: toPublicUser(created, rolesMap(roles)) });
    }
  );

  app.get(
    "/api/users/:id",
    { preHandler: requirePermission("users.read") },
    async (request) => {
      const id = parseObjectId((request.params as { id: string }).id);
      const c = await deps.collections();
      const user = await c.users.findOne({ _id: id });
      if (!user) {
        throw notFound("User not found");
      }
      return { user: (await withRoles(c, [user]))[0] };
    }
  );

  app.patch(
    "/api/users/:id",
    { preHandler: requirePermission("users.update") },
    async (request) => {
      const actor = requireAuth(request);
      const id = parseObjectId((request.params as { id: string }).id);
      const input = updateSchema.parse(request.body);
      const c = await deps.collections();

      const target = await c.users.findOne({ _id: id });
      if (!target) {
        throw notFound("User not found");
      }
      const currentRoles = await c.roles.find({ _id: { $in: target.roleIds } }).toArray();
      assertCanManageUser(actor, target, currentRoles);

      const isSelf = target._id.equals(actor.user._id);
      const adminRoleId = await getAdminRoleId(c);
      const next = { status: input.status ?? target.status, roleIds: target.roleIds };
      let nextRoles = currentRoles;

      if (input.roleIds) {
        nextRoles = await loadRolesStrict(c, input.roleIds);
        const currentIds = new Set(currentRoles.map((role) => String(role._id)));
        const nextIds = new Set(nextRoles.map((role) => String(role._id)));
        const changed = [
          ...nextRoles.filter((role) => !currentIds.has(String(role._id))),
          ...currentRoles.filter((role) => !nextIds.has(String(role._id)))
        ];
        assertWithinActorPermissions(actor, changed);
        next.roleIds = nextRoles.map((role) => role._id);
      }

      if (isSelf && input.status === "disabled") {
        throw conflict("cannot_disable_self", "You cannot disable your own user");
      }
      if (isSelf && isActiveAdmin(target, adminRoleId) && !isActiveAdmin(next, adminRoleId)) {
        throw conflict("cannot_remove_own_admin", "You cannot remove the administrator role from yourself");
      }
      if (isActiveAdmin(target, adminRoleId) && !isActiveAdmin(next, adminRoleId)) {
        await assertNotLastAdmin(c, target, adminRoleId);
      }

      const set: Partial<UserDoc> = { updatedAt: new Date() };
      const unset: Record<string, ""> = {};
      if (input.displayName !== undefined) set.displayName = input.displayName;
      if (input.status !== undefined) set.status = input.status;
      if (input.roleIds !== undefined) set.roleIds = next.roleIds;
      if (input.email === null) unset.email = "";
      else if (input.email !== undefined) set.email = input.email;

      await c.users
        .updateOne({ _id: id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) })
        .catch(duplicateKeyConflict);

      if (input.status === "disabled") {
        await deleteUserSessions(c, id);
      }
      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "user.update",
        entityType: "user",
        entityId: id,
        metadata: {
          fields: Object.keys(input),
          ...(input.status ? { status: input.status } : {}),
          ...(input.roleIds ? { roles: nextRoles.map((role) => role.key) } : {})
        }
      });

      const updated = await c.users.findOne({ _id: id });
      return { user: toPublicUser(updated!, rolesMap(nextRoles)) };
    }
  );

  app.post(
    "/api/users/:id/reset-password",
    { preHandler: requirePermission("users.update") },
    async (request) => {
      const actor = requireAuth(request);
      const id = parseObjectId((request.params as { id: string }).id);
      const { password } = resetPasswordSchema.parse(request.body);
      const c = await deps.collections();

      const target = await c.users.findOne({ _id: id });
      if (!target) {
        throw notFound("User not found");
      }
      if (target._id.equals(actor.user._id)) {
        throw conflict("use_change_password", "For your own account use “Change password”");
      }
      assertCanManageUser(actor, target, await c.roles.find({ _id: { $in: target.roleIds } }).toArray());
      weakPassword(password, target.username);

      await c.users.updateOne(
        { _id: id },
        {
          $set: {
            passwordHash: await hashPassword(password),
            mustChangePassword: true,
            failedLoginCount: 0,
            lockedUntil: null,
            updatedAt: new Date()
          }
        }
      );
      await deleteUserSessions(c, id);
      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "user.password.reset",
        entityType: "user",
        entityId: id,
        metadata: { username: target.username }
      });
      return { ok: true };
    }
  );

  app.delete(
    "/api/users/:id",
    { preHandler: requirePermission("users.delete") },
    async (request) => {
      const actor = requireAuth(request);
      const id = parseObjectId((request.params as { id: string }).id);
      const c = await deps.collections();

      const target = await c.users.findOne({ _id: id });
      if (!target) {
        throw notFound("User not found");
      }
      if (target._id.equals(actor.user._id)) {
        throw conflict("cannot_delete_self", "You cannot delete your own user");
      }
      assertCanManageUser(actor, target, await c.roles.find({ _id: { $in: target.roleIds } }).toArray());
      await assertNotLastAdmin(c, target, await getAdminRoleId(c));

      await c.users.deleteOne({ _id: id });
      await deleteUserSessions(c, id);
      await c.notifications.deleteMany({ userId: id });
      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "user.delete",
        entityType: "user",
        entityId: id,
        metadata: { username: target.username }
      });
      return { ok: true };
    }
  );

  // ── Per-user permissions ──────────────────────────────────────────────
  // Effective = (role permissions ∪ granted) − revoked; admins always have all.

  app.get(
    "/api/users/:id/permissions",
    { preHandler: requirePermission("users.read") },
    async (request) => {
      const actor = requireAuth(request);
      const id = parseObjectId((request.params as { id: string }).id);
      const c = await deps.collections();
      const target = await c.users.findOne({ _id: id });
      if (!target) {
        throw notFound("User not found");
      }
      const roles = await c.roles.find({ _id: { $in: target.roleIds } }).toArray();
      const catalog = await c.permissions.find().sort({ module: 1, key: 1 }).toArray();
      const effective = permissionsOf(roles, target);
      const admin = isAdmin(roles);
      const granted = new Set(admin ? [] : (target.grantedPermissionKeys ?? []));
      const revoked = new Set(admin ? [] : (target.revokedPermissionKeys ?? []));
      const withinActor = [...effective].every((key) => actor.permissions.has(key));

      return {
        user: { id: String(target._id), username: target.username, displayName: target.displayName },
        isAdmin: admin,
        isSelf: target._id.equals(actor.user._id),
        editable:
          actor.permissions.has("users.update") && !admin && !target._id.equals(actor.user._id) && withinActor,
        permissions: catalog.map(({ key, module, description }) => {
          const fromRoles = roles.filter((role) => role.permissionKeys.includes(key)).map((role) => role.name);
          return {
            key,
            module,
            description,
            fromRoles,
            granted: granted.has(key),
            revoked: revoked.has(key),
            effective: effective.has(key),
            // The actor can only grant what they hold themselves.
            grantable: actor.permissions.has(key)
          };
        })
      };
    }
  );

  app.put(
    "/api/users/:id/permissions",
    { preHandler: requirePermission("users.update") },
    async (request) => {
      const actor = requireAuth(request);
      const id = parseObjectId((request.params as { id: string }).id);
      const { permissionKeys } = userPermissionsSchema.parse(request.body);
      const c = await deps.collections();

      const target = await c.users.findOne({ _id: id });
      if (!target) {
        throw notFound("User not found");
      }
      if (target._id.equals(actor.user._id)) {
        throw conflict("cannot_edit_own_permissions", "You cannot change your own permissions");
      }
      const roles = await c.roles.find({ _id: { $in: target.roleIds } }).toArray();
      if (isAdmin(roles)) {
        throw conflict("admin_has_all_permissions", "Administrators always have every permission");
      }
      assertCanManageUser(actor, target, roles);

      const desired = new Set<string>(permissionKeys);
      if ([...desired].some((key) => !actor.permissions.has(key))) {
        throw forbidden("You cannot grant permissions you do not have");
      }
      const fromRoles = new Set(roles.flatMap((role) => role.permissionKeys));
      const granted = [...desired].filter((key) => !fromRoles.has(key)).sort();
      const revoked = [...fromRoles].filter((key) => !desired.has(key)).sort();
      const before = permissionsOf(roles, target);

      await c.users.updateOne(
        { _id: id },
        { $set: { grantedPermissionKeys: granted, revokedPermissionKeys: revoked, updatedAt: new Date() } }
      );
      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "user.permissions.update",
        entityType: "user",
        entityId: id,
        metadata: {
          username: target.username,
          added: [...desired].filter((key) => !before.has(key)).sort(),
          removed: [...before].filter((key) => !desired.has(key)).sort()
        }
      });

      return { permissionKeys: [...desired].sort(), grantedPermissionKeys: granted, revokedPermissionKeys: revoked };
    }
  );
}
