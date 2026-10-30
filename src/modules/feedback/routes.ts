import type { FastifyInstance } from "fastify";
import type { Filter } from "mongodb";
import { z } from "zod";
import { requireAuth, requirePermission } from "../../auth/context.js";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  type Collections,
  type FeedbackDoc,
  type FeedbackSettingsDoc
} from "../../db/collections.js";
import { AppError, notFound } from "../../http/errors.js";
import { containsRegex, paginationSchema, parseObjectId, toMongoSort } from "../../http/pagination.js";
import { recordAudit } from "../audit/service.js";

interface Deps {
  collections: () => Promise<Collections>;
}

/** Per-IP limit on sending: enough for real use, not for flooding the inbox. */
const SEND_RATE_LIMIT = { max: 10, timeWindow: 60_000 };

const createSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  message: z.string().trim().min(3, { error: "Write at least a few words" }).max(4000),
  page: z.string().trim().max(300).default("/"),
  screen: z.string().trim().max(200).optional()
});

const listSchema = paginationSchema(["createdAt", "status", "type"], "-createdAt").extend({
  status: z.enum(FEEDBACK_STATUSES).optional()
});

const updateSchema = z
  .object({
    status: z.enum(FEEDBACK_STATUSES).optional(),
    note: z.string().trim().max(4000).optional()
  })
  .refine((value) => Object.keys(value).length > 0, { error: "No changes" });

const settingsSchema = z.object({ enabled: z.boolean() });

export function toPublicFeedback(doc: FeedbackDoc) {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    userName: doc.userName,
    username: doc.username,
    type: doc.type,
    message: doc.message,
    page: doc.page,
    screen: doc.screen,
    status: doc.status,
    note: doc.note,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
  };
}

/** On unless an administrator switched it off (also on before migration 7 runs). */
async function isEnabled(c: Collections): Promise<boolean> {
  const settings = (await c.metadata.findOne({ key: "feedback" })) as FeedbackSettingsDoc | null;
  return settings?.enabled ?? true;
}

/**
 * Feedback: any signed-in user sends it while the module is on; feedback.manage (the admin
 * role) reviews it, tracks its status and switches the module on or off.
 */
export async function feedbackRoutes(app: FastifyInstance, deps: Deps) {
  const canManage = { preHandler: requirePermission("feedback.manage") };

  app.get("/api/feedback/settings", async (request) => {
    const auth = requireAuth(request);
    const c = await deps.collections();
    const enabled = await isEnabled(c);
    const newCount = auth.permissions.has("feedback.manage") ? await c.feedback.countDocuments({ status: "new" }) : undefined;
    return { enabled, ...(newCount === undefined ? {} : { newCount }) };
  });

  app.put("/api/feedback/settings", canManage, async (request) => {
    const actor = requireAuth(request);
    const { enabled } = settingsSchema.parse(request.body);
    const c = await deps.collections();
    await c.metadata.updateOne({ key: "feedback" }, { $set: { key: "feedback", enabled, updatedAt: new Date() } }, { upsert: true });
    await recordAudit(c, request, {
      actorId: actor.user._id,
      action: "feedback.settings",
      entityType: "feedback",
      metadata: { enabled }
    });
    return { enabled };
  });

  app.post("/api/feedback", { config: { rateLimit: SEND_RATE_LIMIT } }, async (request, reply) => {
    const actor = requireAuth(request);
    const input = createSchema.parse(request.body);
    const c = await deps.collections();
    if (!(await isEnabled(c))) {
      throw new AppError(409, "feedback_disabled", "Feedback is switched off");
    }
    const now = new Date();
    const doc = {
      userId: actor.user._id,
      userName: actor.user.displayName,
      username: actor.user.username,
      type: input.type,
      message: input.message,
      page: input.page,
      screen: input.screen ?? null,
      status: "new" as const,
      note: "",
      createdAt: now,
      updatedAt: now
    };
    const result = await c.feedback.insertOne(doc as FeedbackDoc);
    await recordAudit(c, request, {
      actorId: actor.user._id,
      action: "feedback.create",
      entityType: "feedback",
      entityId: result.insertedId,
      metadata: { type: input.type, page: input.page }
    });
    return reply.code(201).send({ feedback: toPublicFeedback({ ...doc, _id: result.insertedId }) });
  });

  app.get("/api/feedback", canManage, async (request) => {
    const { page, pageSize, q, sort, status } = listSchema.parse(request.query);
    const c = await deps.collections();
    const filter: Filter<FeedbackDoc> = {};
    if (status) filter.status = status;
    if (q) {
      const regex = containsRegex(q);
      filter.$or = [{ message: regex }, { userName: regex }, { username: regex }, { page: regex }, { screen: regex }];
    }
    const [items, total] = await Promise.all([
      c.feedback
        .find(filter)
        .sort(toMongoSort(sort))
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      c.feedback.countDocuments(filter)
    ]);
    return { items: items.map(toPublicFeedback), total, page, pageSize };
  });

  app.patch("/api/feedback/:id", canManage, async (request) => {
    const actor = requireAuth(request);
    const id = parseObjectId((request.params as { id: string }).id);
    const input = updateSchema.parse(request.body);
    const c = await deps.collections();
    const updated = await c.feedback.findOneAndUpdate(
      { _id: id },
      { $set: { ...input, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!updated) {
      throw notFound("Feedback not found");
    }
    await recordAudit(c, request, {
      actorId: actor.user._id,
      action: "feedback.update",
      entityType: "feedback",
      entityId: id,
      metadata: { ...(input.status ? { status: input.status } : {}), noteChanged: input.note !== undefined }
    });
    return { feedback: toPublicFeedback(updated) };
  });
}
