import type { FastifyInstance } from "fastify";
import { MongoServerError, type Filter } from "mongodb";
import { z } from "zod";
import { requireAuth, requirePermission } from "../../auth/context.js";
import { isPermissionKey } from "../../auth/permissions.js";
import type { Collections, RoleDoc } from "../../db/collections.js";
import { conflict, notFound } from "../../http/errors.js";
import {
  containsRegex,
  paginationSchema,
  parseObjectId,
  toMongoSort,
  type Page
} from "../../http/pagination.js";
import { recordAudit } from "../audit/service.js";
import { assertWithinActorPermissions } from "../users/routes.js";

interface Deps {
  collections: () => Promise<Collections>;
}

const permissionKeys = z
  .array(z.string().refine(isPermissionKey, { error: "Permiso desconocido" }))
  .max(100)
  .transform((keys) => [...new Set(keys)].sort());

const createSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z][a-z0-9_.-]{1,49}$/, {
      error: "Usa de 2 a 50 caracteres: letras minúsculas, números, punto, guion o guion bajo"
    }),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  permissionKeys: permissionKeys.default([])
});

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    permissionKeys: permissionKeys.optional()
  })
  .refine((value) => Object.keys(value).length > 0, { error: "No hay cambios" });

const listSchema = paginationSchema(["key", "name", "createdAt"], "name");

function toPublicRole(role: RoleDoc, userCount?: number) {
  return {
    id: String(role._id),
    key: role.key,
    name: role.name,
    description: role.description,
    permissionKeys: role.permissionKeys,
    isSystem: role.isSystem,
    ...(userCount !== undefined ? { userCount } : {}),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt
  };
}

type PublicRole = ReturnType<typeof toPublicRole>;

const systemRole = () => conflict("system_role", "Los roles del sistema no se pueden modificar ni eliminar");

export async function roleRoutes(app: FastifyInstance, deps: Deps) {
  app.get(
    "/api/roles",
    { preHandler: requirePermission("roles.read") },
    async (request): Promise<Page<PublicRole>> => {
      const { page, pageSize, q, sort } = listSchema.parse(request.query);
      const c = await deps.collections();
      const filter: Filter<RoleDoc> = q
        ? { $or: [{ key: containsRegex(q) }, { name: containsRegex(q) }] }
        : {};

      const [roles, total] = await Promise.all([
        c.roles.find(filter).sort(toMongoSort(sort)).skip((page - 1) * pageSize).limit(pageSize).toArray(),
        c.roles.countDocuments(filter)
      ]);
      const counts = await c.users
        .aggregate<{ _id: unknown; n: number }>([
          { $match: { roleIds: { $in: roles.map((role) => role._id) } } },
          { $unwind: "$roleIds" },
          { $group: { _id: "$roleIds", n: { $sum: 1 } } }
        ])
        .toArray();
      const countById = new Map(counts.map((row) => [String(row._id), row.n]));

      return {
        items: roles.map((role) => toPublicRole(role, countById.get(String(role._id)) ?? 0)),
        total,
        page,
        pageSize
      };
    }
  );

  app.post(
    "/api/roles",
    { preHandler: requirePermission("roles.create") },
    async (request, reply) => {
      const actor = requireAuth(request);
      const input = createSchema.parse(request.body);
      const now = new Date();
      const doc = { ...input, isSystem: false, createdAt: now, updatedAt: now };
      assertWithinActorPermissions(actor, [doc as RoleDoc]);

      const c = await deps.collections();
      const result = await c.roles.insertOne(doc as RoleDoc).catch((error: unknown) => {
        if (error instanceof MongoServerError && error.code === 11000) {
          throw conflict("role_key_taken", "Ya existe un rol con esa clave");
        }
        throw error;
      });
      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "role.create",
        entityType: "role",
        entityId: result.insertedId,
        metadata: { key: doc.key, permissionKeys: doc.permissionKeys }
      });
      return reply.code(201).send({ role: toPublicRole({ ...doc, _id: result.insertedId } as RoleDoc) });
    }
  );

  app.get("/api/roles/:id", { preHandler: requirePermission("roles.read") }, async (request) => {
    const id = parseObjectId((request.params as { id: string }).id);
    const role = await (await deps.collections()).roles.findOne({ _id: id });
    if (!role) {
      throw notFound("Rol no encontrado");
    }
    return { role: toPublicRole(role) };
  });

  app.patch("/api/roles/:id", { preHandler: requirePermission("roles.update") }, async (request) => {
    const actor = requireAuth(request);
    const id = parseObjectId((request.params as { id: string }).id);
    const input = updateSchema.parse(request.body);
    const c = await deps.collections();

    const role = await c.roles.findOne({ _id: id });
    if (!role) {
      throw notFound("Rol no encontrado");
    }
    if (role.isSystem) {
      throw systemRole();
    }
    assertWithinActorPermissions(actor, [role]);
    if (input.permissionKeys) {
      assertWithinActorPermissions(actor, [{ ...role, permissionKeys: input.permissionKeys }]);
    }

    const updated = await c.roles.findOneAndUpdate(
      { _id: id },
      { $set: { ...input, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    await recordAudit(c, request, {
      actorId: actor.user._id,
      action: "role.update",
      entityType: "role",
      entityId: id,
      metadata: {
        key: role.key,
        fields: Object.keys(input),
        ...(input.permissionKeys ? { permissionKeys: input.permissionKeys } : {})
      }
    });
    return { role: toPublicRole(updated!) };
  });

  app.delete("/api/roles/:id", { preHandler: requirePermission("roles.delete") }, async (request) => {
    const actor = requireAuth(request);
    const id = parseObjectId((request.params as { id: string }).id);
    const c = await deps.collections();

    const role = await c.roles.findOne({ _id: id });
    if (!role) {
      throw notFound("Rol no encontrado");
    }
    if (role.isSystem) {
      throw systemRole();
    }
    assertWithinActorPermissions(actor, [role]);
    if (await c.users.countDocuments({ roleIds: id }, { limit: 1 })) {
      throw conflict("role_in_use", "El rol está asignado a usuarios; quítalo antes de eliminarlo");
    }

    await c.roles.deleteOne({ _id: id });
    await recordAudit(c, request, {
      actorId: actor.user._id,
      action: "role.delete",
      entityType: "role",
      entityId: id,
      metadata: { key: role.key }
    });
    return { ok: true };
  });
}
