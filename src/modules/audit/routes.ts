import type { FastifyInstance } from "fastify";
import { ObjectId, type Filter } from "mongodb";
import { z } from "zod";
import { requirePermission } from "../../auth/context.js";
import type { AuditLogDoc, Collections } from "../../db/collections.js";
import { paginationSchema, toMongoSort } from "../../http/pagination.js";

interface Deps {
  collections: () => Promise<Collections>;
}

const listSchema = paginationSchema(["createdAt", "action"], "-createdAt").extend({
  action: z.string().trim().max(100).optional(),
  entityType: z.string().trim().max(50).optional(),
  actorId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  from: z.iso.datetime({ offset: true }).or(z.iso.date()).optional(),
  to: z.iso.datetime({ offset: true }).or(z.iso.date()).optional()
});

/** Read-only. Entries are written by the modules via recordAudit(). */
export async function auditRoutes(app: FastifyInstance, deps: Deps) {
  app.get("/api/audit", { preHandler: requirePermission("audit.read") }, async (request) => {
    const query = listSchema.parse(request.query);
    const c = await deps.collections();

    const filter: Filter<AuditLogDoc> = {};
    if (query.action) filter.action = query.action;
    if (query.entityType) filter.entityType = query.entityType;
    if (query.actorId) filter.actorId = new ObjectId(query.actorId);
    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        // A plain date "to" includes that whole day.
        ...(query.to
          ? { $lt: new Date(new Date(query.to).getTime() + (query.to.length === 10 ? 86_400_000 : 1)) }
          : {})
      };
    }

    const [docs, total] = await Promise.all([
      c.auditLogs
        .find(filter)
        .sort(toMongoSort(query.sort))
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .toArray(),
      c.auditLogs.countDocuments(filter)
    ]);

    const actorIds = [...new Set(docs.flatMap((doc) => (doc.actorId ? [String(doc.actorId)] : [])))];
    const actors = actorIds.length
      ? await c.users
          .find(
            { _id: { $in: actorIds.map((id) => new ObjectId(id)) } },
            { projection: { username: 1, displayName: 1 } }
          )
          .toArray()
      : [];
    const actorById = new Map(actors.map((actor) => [String(actor._id), actor]));

    return {
      items: docs.map((doc) => {
        const actor = doc.actorId ? actorById.get(String(doc.actorId)) : undefined;
        return {
          id: String(doc._id),
          actor: doc.actorId
            ? { id: String(doc.actorId), username: actor?.username ?? null, displayName: actor?.displayName ?? null }
            : null,
          action: doc.action,
          entityType: doc.entityType,
          entityId: doc.entityId,
          metadata: doc.metadata,
          ip: doc.ip,
          createdAt: doc.createdAt
        };
      }),
      total,
      page: query.page,
      pageSize: query.pageSize
    };
  });
}
