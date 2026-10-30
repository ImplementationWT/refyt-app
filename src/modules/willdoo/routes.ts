import { PassThrough } from "node:stream";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireAuth, requirePermission } from "../../auth/context.js";
import type { Collections, WillDooConversationDoc } from "../../db/collections.js";
import { AppError, notFound } from "../../http/errors.js";
import { parseObjectId } from "../../http/pagination.js";
import type { Integrations } from "../../integrations/service.js";
import { recordAudit } from "../audit/service.js";
import type { WillDooMode } from "../../app.js";
import { SYSTEM_GUIDE } from "./context.js";
import type { WillDooModel } from "./model.js";
import { followUps, understand } from "./basic-chat.js";
import { BUILT_IN_QUICK_QUERIES, QuickQueryError, quickQueriesFor, runQuickQuery, type QuickQuery } from "./quick.js";
import { microsToUsd } from "./pricing.js";
import { monthSpendMicros, prepareAsk, runAsk, toPublicTurn, type WillDooEvent, type WillDooSettings } from "./service.js";
import { BUILT_IN_TOOLS, safeTimeZone, type ToolContext, type WillDooTool } from "./tools.js";

interface Deps {
  collections: () => Promise<Collections>;
  integrations: Integrations;
  settings: WillDooSettings;
  /** Effective mode (claude without a key is already basic). */
  mode: WillDooMode;
  /** null unless the mode is claude: the chat routes answer 404. */
  model: () => WillDooModel | null;
  tools?: readonly WillDooTool[];
  quickQueries?: readonly QuickQuery[];
}

/** Quick queries are cheap but still read data: per IP. */
const QUICK_RATE_LIMIT = { max: 30, timeWindow: 60_000 };
const screenSchema = z.strictObject({ path: z.string().max(200).regex(/^\//) }).optional();
const quickBodySchema = z.strictObject({ timeZone: z.string().max(64).optional(), screen: screenSchema });
const basicSchema = z.strictObject({
  text: z.string().trim().min(1, { error: "Type a question" }).max(500),
  timeZone: z.string().max(64).optional(),
  screen: screenSchema
});

/** Per IP, on top of the per-user daily limit and the monthly budget. */
const ASK_RATE_LIMIT = { max: 20, timeWindow: 60_000 };

const askSchema = z.strictObject({
  conversationId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  text: z.string().trim().min(1, { error: "Type a question" }).max(4000),
  screen: z
    .strictObject({
      path: z.string().max(200).regex(/^\//),
      title: z.string().trim().max(120).optional(),
      recordId: z.string().trim().max(64).optional()
    })
    .optional(),
  timeZone: z.string().max(64).optional()
});

const listSchema = z.object({ userId: z.string().regex(/^[a-f0-9]{24}$/i).optional() });

function toSummary(doc: Pick<WillDooConversationDoc, "_id" | "title" | "updatedAt" | "createdAt">) {
  return { id: String(doc._id), title: doc.title, createdAt: doc.createdAt, updatedAt: doc.updatedAt };
}

/**
 * Will Doo, the co-pilot. Only for users with willdoo.use and only when the
 * project has its Anthropic key. Each user sees only their own conversations;
 * willdoo.audit can review everyone's and the spend.
 */
export async function willDooRoutes(app: FastifyInstance, deps: Deps) {
  const requireModel = () => {
    const model = deps.model();
    if (!model) throw notFound("Will Doo is not configured");
    return model;
  };
  const canUse = { preHandler: [async () => void requireModel(), requirePermission("willdoo.use")] };
  const tools = deps.tools ?? BUILT_IN_TOOLS;
  const quickQueries = deps.quickQueries ?? BUILT_IN_QUICK_QUERIES;
  // «Will Doo solo» (and claude too): quick queries and the guide, no AI.
  const canBrowse = {
    preHandler: [
      async () => {
        if (deps.mode === "off") throw notFound("Will Doo is not enabled");
      },
      requirePermission("willdoo.use")
    ]
  };
  const toolContext = async (request: FastifyRequest, timeZone?: string): Promise<ToolContext> => ({
    auth: requireAuth(request),
    c: await deps.collections(),
    integrations: deps.integrations,
    timeZone: safeTimeZone(timeZone)
  });

  const suggestion = (query: QuickQuery) => ({ id: query.id, label: query.label, question: query.question });

  app.get("/api/willdoo/quick", canBrowse, async (request) => {
    const ctx = await toolContext(request, (request.query as { tz?: string }).tz);
    return {
      mode: deps.mode,
      // In roadmap order; the panel groups them by topic.
      items: quickQueriesFor(ctx, quickQueries, tools).map(({ id, label, description, question, group, screens }) => ({ id, label, description, question, group, screens: screens ?? [] }))
    };
  });

  /** Runs a quick query (data from the database); null if its source failed. `text`: the typed question it may read its input from. */
  async function resultOf(request: FastifyRequest, ctx: ToolContext, query: QuickQuery, text?: string) {
    try {
      return { id: query.id, label: query.label, question: query.question, at: new Date(), ...(await runQuickQuery(ctx, query, tools, text)) };
    } catch (error) {
      if (!(error instanceof QuickQueryError)) throw error;
      request.log.warn({ query: query.id, code: error.code }, "willdoo quick query failed");
      return null;
    }
  }

  const unavailable = () => new AppError(503, "unavailable", "The query could not be completed. Try again.");

  /** Runs a quick query and returns it with its 3 follow-ups. */
  async function answerWith(request: FastifyRequest, ctx: ToolContext, query: QuickQuery, available: readonly QuickQuery[], screenPath?: string) {
    const result = await resultOf(request, ctx, query);
    if (!result) throw unavailable();
    return { result, suggestions: followUps(query, available, 3, screenPath).map(suggestion) };
  }

  app.post("/api/willdoo/quick/:id", { ...canBrowse, config: { rateLimit: QUICK_RATE_LIMIT } }, async (request) => {
    const { timeZone, screen } = quickBodySchema.parse(request.body ?? {});
    const ctx = await toolContext(request, timeZone);
    const id = (request.params as { id: string }).id;
    const available = quickQueriesFor(ctx, quickQueries, tools);
    // Unknown or not permitted: the same 404 (does not reveal which queries exist).
    const query = available.find((candidate) => candidate.id === id);
    if (!query) throw notFound("Query not found");
    const { result, suggestions } = await answerWith(request, ctx, query, available, screen?.path);
    await recordAudit(ctx.c, request, {
      actorId: ctx.auth.user._id,
      action: "willdoo.quick",
      entityType: "willdoo_quick",
      entityId: query.id,
      metadata: { consulta: query.id, resultados: result.items.length }
    });
    return { ...result, suggestions };
  });

  /**
   * Chat of «Will Doo solo»: a typed question, answered without AI with a quick
   * query (database), the guide or a general answer. Never invents data.
   */
  app.post("/api/willdoo/basic", { ...canBrowse, config: { rateLimit: QUICK_RATE_LIMIT } }, async (request) => {
    const { text, timeZone, screen } = basicSchema.parse(request.body ?? {});
    const ctx = await toolContext(request, timeZone);
    const available = quickQueriesFor(ctx, quickQueries, tools);
    // The open screen helps: its queries win ties and are suggested first.
    const intent = understand(text, available, SYSTEM_GUIDE, screen?.path);
    let body: Record<string, unknown> = { kind: intent.kind, message: intent.message };
    let queryId: string | null = null;
    let shown: string[] = [];
    if ((intent.kind === "answer" || intent.kind === "analytics") && intent.query) {
      const query = intent.query;
      queryId = query.id;
      // Answers what it can: the other topics of the question too, skipping any whose source failed.
      const [result, ...more] = await Promise.all([query, ...intent.more].map((topic) => resultOf(request, ctx, topic, text)));
      if (!result) throw unavailable();
      const extra = more.filter((item) => item !== null);
      shown = [result.id, ...extra.map((item) => item.id)];
      const first = intent.kind === "answer" ? intent.alternatives : [];
      body = {
        ...body,
        ...(intent.kind === "answer" && intent.partial ? { partial: true } : {}),
        result,
        ...(extra.length ? { more: extra } : {}),
        suggestions: followUps(query, available, 3, screen?.path, { first, skip: intent.more }).map(suggestion)
      };
    } else if (intent.kind === "guide") {
      body = { ...body, guide: intent.lines, suggestions: followUps(null, available, 3, screen?.path).map(suggestion) };
    } else {
      body.suggestions = followUps(null, available, 3, screen?.path).map(suggestion);
    }
    await recordAudit(ctx.c, request, {
      actorId: ctx.auth.user._id,
      action: "willdoo.basic",
      entityType: "willdoo_quick",
      entityId: queryId,
      metadata: { pregunta: text.slice(0, 500), tipo: intent.kind, consulta: queryId, consultas: shown, pantalla: screen?.path ?? null }
    });
    return body;
  });

  app.get("/api/willdoo/guide", canBrowse, async () => ({ guide: SYSTEM_GUIDE }));

  /** Own conversation, or anyone's for willdoo.audit (others → 404). */
  async function findReadable(request: FastifyRequest, c: Collections) {
    const auth = requireAuth(request);
    const id = parseObjectId((request.params as { id: string }).id);
    const filter = auth.permissions.has("willdoo.audit") ? { _id: id } : { _id: id, userId: auth.user._id };
    const conversation = await c.willdooConversations.findOne(filter);
    if (!conversation) throw notFound("Conversation not found");
    return conversation;
  }

  app.post("/api/willdoo/messages", { ...canUse, config: { rateLimit: ASK_RATE_LIMIT } }, async (request, reply) => {
    const model = requireModel();
    const auth = requireAuth(request);
    const input = askSchema.parse(request.body);
    const c = await deps.collections();
    const timeZone = safeTimeZone(input.timeZone);
    const prepared = await prepareAsk(c, deps.settings, auth, input, timeZone);

    const stream = new PassThrough();
    const controller = new AbortController();
    // The browser closed the panel or the connection: stop paying for the answer.
    reply.raw.on("close", () => {
      if (!reply.raw.writableFinished) controller.abort();
    });
    const emit = (event: WillDooEvent) => {
      if (!stream.writableEnded) stream.write(`${JSON.stringify(event)}\n`);
    };
    void runAsk({ c, integrations: deps.integrations, model, settings: deps.settings, request, ...(deps.tools ? { tools: deps.tools } : {}) }, prepared, emit, controller.signal)
      .catch((error: unknown) => {
        request.log.error({ err: error }, "willdoo stream failed");
        emit({ type: "error", error: "internal_error", message: "Will Doo had a problem answering. Try again." });
      })
      .finally(() => stream.end());

    return reply
      .header("content-type", "application/x-ndjson; charset=utf-8")
      .header("cache-control", "no-store")
      // nginx must not buffer: the answer arrives as it is written.
      .header("x-accel-buffering", "no")
      .send(stream);
  });

  app.get("/api/willdoo/conversations", canUse, async (request) => {
    const auth = requireAuth(request);
    const { userId } = listSchema.parse(request.query);
    if (userId && !auth.permissions.has("willdoo.audit")) throw new AppError(403, "forbidden", "You do not have permission to see other users' conversations");
    const c = await deps.collections();
    const docs = await c.willdooConversations
      .find({ userId: userId ? new ObjectId(userId) : auth.user._id }, { projection: { title: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .toArray();
    return { items: docs.map(toSummary) };
  });

  app.get("/api/willdoo/conversations/:id", canUse, async (request) => {
    const conversation = await findReadable(request, await deps.collections());
    return { ...toSummary(conversation), turns: conversation.turns.map(toPublicTurn) };
  });

  app.delete("/api/willdoo/conversations/:id", canUse, async (request) => {
    const auth = requireAuth(request);
    const id = parseObjectId((request.params as { id: string }).id);
    const c = await deps.collections();
    const result = await c.willdooConversations.deleteOne({ _id: id, userId: auth.user._id });
    if (result.deletedCount === 0) throw notFound("Conversation not found");
    await recordAudit(c, request, { actorId: auth.user._id, action: "willdoo.conversation.delete", entityType: "willdoo_conversation", entityId: id });
    return { ok: true };
  });

  /** Spend this month (list price) against the budget, per person. */
  app.get("/api/willdoo/usage", { preHandler: [async () => void requireModel(), requirePermission("willdoo.audit")] }, async () => {
    const c = await deps.collections();
    const now = new Date();
    const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const [used, perUser] = await Promise.all([
      monthSpendMicros(c, now),
      c.willdooUsage
        .aggregate<{ _id: ObjectId; costMicros: number; answers: number }>([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: "$userId", costMicros: { $sum: "$costMicros" }, answers: { $sum: 1 } } },
          { $sort: { costMicros: -1 } },
          { $limit: 50 }
        ])
        .toArray()
    ]);
    const users = await c.users.find({ _id: { $in: perUser.map((row) => row._id) } }, { projection: { username: 1, displayName: 1 } }).toArray();
    const byId = new Map(users.map((user) => [String(user._id), user]));
    return {
      month: since.toISOString().slice(0, 7),
      model: requireModel().model,
      usedUsd: microsToUsd(used),
      budgetUsd: deps.settings.monthlyBudgetUsd,
      listPrice: true,
      byUser: perUser.map((row) => ({
        userId: String(row._id),
        username: byId.get(String(row._id))?.username ?? null,
        displayName: byId.get(String(row._id))?.displayName ?? null,
        costUsd: microsToUsd(row.costMicros),
        answers: row.answers
      }))
    };
  });
}
