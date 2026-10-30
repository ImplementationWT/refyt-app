import type { FastifyInstance } from "fastify";
import { ObjectId, type Filter } from "mongodb";
import { z } from "zod";
import { requireAuth, requirePermission } from "../../auth/context.js";
import type { Collections, NotificationDoc } from "../../db/collections.js";
import { AppError, notFound } from "../../http/errors.js";
import { paginationSchema, parseObjectId, toMongoSort } from "../../http/pagination.js";
import { recordAudit } from "../audit/service.js";

interface Deps {
  collections: () => Promise<Collections>;
}

export const NOTIFICATION_TYPES = ["info", "success", "warning", "error"] as const;

const listSchema = paginationSchema(["createdAt"], "-createdAt").extend({
  unread: z.enum(["true", "false"]).optional()
});

const createSchema = z.object({
  userIds: z
    .array(z.string().regex(/^[a-f0-9]{24}$/i, { error: "Identificador no válido" }))
    .min(1)
    .max(100),
  type: z.enum(NOTIFICATION_TYPES).default("info"),
  title: z.string().trim().min(1).max(150),
  body: z.string().trim().max(2000).default("")
});

function toPublicNotification(doc: NotificationDoc) {
  return {
    id: String(doc._id),
    type: doc.type,
    title: doc.title,
    body: doc.body,
    readAt: doc.readAt,
    createdAt: doc.createdAt
  };
}

export async function notificationRoutes(app: FastifyInstance, deps: Deps) {
  const canRead = { preHandler: requirePermission("notifications.read") };

  // Only the caller's own notifications are ever listed or modified.
  app.get("/api/notifications", canRead, async (request) => {
    const { user } = requireAuth(request);
    const { page, pageSize, sort, unread } = listSchema.parse(request.query);
    const c = await deps.collections();
    const filter: Filter<NotificationDoc> = {
      userId: user._id,
      ...(unread === "true" ? { readAt: null } : {})
    };

    const [docs, total, unreadCount] = await Promise.all([
      c.notifications.find(filter).sort(toMongoSort(sort)).skip((page - 1) * pageSize).limit(pageSize).toArray(),
      c.notifications.countDocuments(filter),
      c.notifications.countDocuments({ userId: user._id, readAt: null })
    ]);
    return { items: docs.map(toPublicNotification), total, page, pageSize, unreadCount };
  });

  app.post("/api/notifications/read-all", canRead, async (request) => {
    const { user } = requireAuth(request);
    const c = await deps.collections();
    const result = await c.notifications.updateMany(
      { userId: user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return { updated: result.modifiedCount };
  });

  app.post("/api/notifications/:id/read", canRead, async (request) => {
    const { user } = requireAuth(request);
    const id = parseObjectId((request.params as { id: string }).id);
    const c = await deps.collections();
    const doc = await c.notifications.findOne({ _id: id, userId: user._id });
    if (!doc) {
      throw notFound("Notificación no encontrada");
    }
    if (!doc.readAt) {
      doc.readAt = new Date();
      await c.notifications.updateOne({ _id: id }, { $set: { readAt: doc.readAt } });
    }
    return { notification: toPublicNotification(doc) };
  });

  app.post(
    "/api/notifications",
    { preHandler: requirePermission("notifications.manage") },
    async (request, reply) => {
      const actor = requireAuth(request);
      const input = createSchema.parse(request.body);
      const c = await deps.collections();
      const ids = [...new Set(input.userIds)].map((id) => new ObjectId(id));
      const found = await c.users.countDocuments({ _id: { $in: ids } });
      if (found !== ids.length) {
        throw new AppError(400, "unknown_user", "Alguno de los usuarios no existe");
      }

      const now = new Date();
      await c.notifications.insertMany(
        ids.map(
          (userId) =>
            ({ userId, type: input.type, title: input.title, body: input.body, readAt: null, createdAt: now }) as NotificationDoc
        )
      );
      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "notification.create",
        entityType: "notification",
        metadata: { recipients: ids.length, type: input.type, title: input.title }
      });
      return reply.code(201).send({ created: ids.length });
    }
  );
}
