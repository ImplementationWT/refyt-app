import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaContentBlock,
  BetaMessageParam,
  BetaToolResultBlockParam,
  BetaToolUseBlock
} from "@anthropic-ai/sdk/resources/beta/messages/messages";
import type { FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";
import type { AuthContext } from "../../auth/context.js";
import type { Collections, WillDooConversationDoc, WillDooTurn } from "../../db/collections.js";
import { AppError } from "../../http/errors.js";
import { toIntegrationError } from "../../integrations/anthropic/client.js";
import { IntegrationError } from "../../integrations/errors.js";
import type { Integrations } from "../../integrations/service.js";
import { recordAudit } from "../audit/service.js";
import type { WillDooModel } from "./model.js";
import { costMicros, type TokenUsage } from "./pricing.js";
import { contextBlock, systemPrompt, type ScreenContext } from "./prompt.js";
import { runTool, toolDefinition, toolsFor, type ToolContext, type WillDooTool } from "./tools.js";

export interface WillDooSettings {
  appName: string;
  monthlyBudgetUsd: number;
  userDailyMessages: number;
  retentionDays: number;
}

/** Model calls per question: the last one may not use tools, so it always answers. */
export const MAX_ROUNDS = 6;
/** A conversation stops growing past this (JSON of the transcript). */
export const MAX_TRANSCRIPT_CHARS = 1_500_000;
const DAY_MS = 86_400_000;

/** Events streamed to the browser (one JSON per line). */
export type WillDooEvent =
  | { type: "start"; conversationId: string }
  | { type: "text"; delta: string }
  | { type: "tool"; name: string; label: string }
  | { type: "done"; conversationId: string; turn: PublicTurn }
  | { type: "error"; error: string; message: string };

export interface PublicTurn {
  role: WillDooTurn["role"];
  text: string;
  tools: string[];
  at: Date;
}

export const toPublicTurn = (turn: WillDooTurn): PublicTurn => ({ role: turn.role, text: turn.text, tools: turn.tools ?? [], at: turn.at });

const ERROR_TEXT: Record<IntegrationError["code"], string> = {
  auth_failed: "This project's Anthropic key is not valid. Let an administrator know.",
  timeout: "Claude took too long to answer. Try again.",
  rate_limited: "Claude is receiving too many requests. Wait a moment.",
  unavailable: "Will Doo is not available right now. Try again later."
};

const startOfMonthUtc = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
const startOfDayUtc = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

/** Spend of the whole app this month (UTC), in millionths of USD. */
export async function monthSpendMicros(c: Collections, now = new Date()): Promise<number> {
  const [row] = await c.willdooUsage
    .aggregate<{ total: number }>([{ $match: { createdAt: { $gte: startOfMonthUtc(now) } } }, { $group: { _id: null, total: { $sum: "$costMicros" } } }])
    .toArray();
  return row?.total ?? 0;
}

export interface AskInput {
  conversationId?: string | undefined;
  text: string;
  screen?: ScreenContext | undefined;
  timeZone?: string | undefined;
}

export interface Prepared {
  auth: AuthContext;
  conversation: WillDooConversationDoc | null;
  input: AskInput;
  timeZone: string;
}

/**
 * Checks before streaming (normal JSON errors): monthly budget, the user's
 * daily limit and that the conversation is theirs (others' are 404).
 */
export async function prepareAsk(c: Collections, settings: WillDooSettings, auth: AuthContext, input: AskInput, timeZone: string, now = new Date()): Promise<Prepared> {
  if ((await monthSpendMicros(c, now)) >= settings.monthlyBudgetUsd * 1_000_000) {
    throw new AppError(429, "willdoo_budget_exhausted", "Will Doo reached this month's budget. Let an administrator know.");
  }
  const today = await c.willdooUsage.countDocuments({ userId: auth.user._id, createdAt: { $gte: startOfDayUtc(now) } });
  if (today >= settings.userDailyMessages) {
    throw new AppError(429, "willdoo_daily_limit", "You reached today's question limit. Try again tomorrow.");
  }
  let conversation: WillDooConversationDoc | null = null;
  if (input.conversationId) {
    conversation = ObjectId.isValid(input.conversationId)
      ? await c.willdooConversations.findOne({ _id: new ObjectId(input.conversationId), userId: auth.user._id })
      : null;
    if (!conversation) throw new AppError(404, "not_found", "Conversation not found");
    if (JSON.stringify(conversation.messages).length > MAX_TRANSCRIPT_CHARS) {
      throw new AppError(409, "conversation_too_long", "This conversation is too long. Start a new one.");
    }
  }
  return { auth, conversation, input, timeZone };
}

interface RunDeps {
  c: Collections;
  integrations: Integrations;
  model: WillDooModel;
  settings: WillDooSettings;
  tools?: readonly WillDooTool[];
  request: FastifyRequest;
  now?: () => Date;
}

const textOf = (content: BetaContentBlock[]) =>
  content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");

/**
 * One question: the tool loop with Claude, streaming the answer. The
 * transcript is append-only and is saved only when the answer is complete;
 * the spend is always recorded (it was already incurred).
 */
export async function runAsk(deps: RunDeps, prepared: Prepared, emit: (event: WillDooEvent) => void, signal: AbortSignal) {
  const { c, model, settings, request } = deps;
  const now = deps.now ?? (() => new Date());
  const { auth, input } = prepared;
  const ctx: ToolContext = { auth, c, integrations: deps.integrations, timeZone: prepared.timeZone };
  const offered = toolsFor(ctx, deps.tools);
  const definitions = offered.map(toolDefinition);
  const system = systemPrompt(settings.appName);

  const conversationId = prepared.conversation?._id ?? new ObjectId();
  emit({ type: "start", conversationId: String(conversationId) });

  const history = (prepared.conversation?.messages ?? []) as BetaMessageParam[];
  const messages: BetaMessageParam[] = [
    ...history,
    {
      role: "user",
      content: [
        { type: "text", text: contextBlock(auth, input.screen, prepared.timeZone, now()) },
        { type: "text", text: input.text }
      ]
    }
  ];

  const usage: TokenUsage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  const toolCalls: Array<{ name: string; input: unknown; ok: boolean }> = [];
  let answer = "";
  let stop: string | null = null;
  let failure: { error: string; message: string } | null = null;

  try {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const lastRound = round === MAX_ROUNDS - 1;
      const message = await model.respond(
        { system, tools: definitions, messages, ...(lastRound ? { toolChoice: { type: "none" } } : {}) },
        (delta) => {
          answer += delta;
          emit({ type: "text", delta });
        },
        signal
      );
      usage.input += message.usage.input_tokens;
      usage.output += message.usage.output_tokens;
      usage.cacheRead += message.usage.cache_read_input_tokens ?? 0;
      usage.cacheWrite += message.usage.cache_creation_input_tokens ?? 0;
      stop = message.stop_reason;
      // The whole content (thinking and fallback blocks too), unchanged.
      messages.push({ role: "assistant", content: message.content });

      if (message.stop_reason === "refusal") {
        if (!textOf(message.content)) {
          const text = "I cannot help with that. Try another question about the system.";
          answer += text;
          emit({ type: "text", delta: text });
        }
        break;
      }
      const uses = message.content.filter((block): block is BetaToolUseBlock => block.type === "tool_use");
      if (message.stop_reason !== "tool_use" || uses.length === 0) break;
      if (message.stop_reason === "tool_use" && lastRound) break;

      for (const use of uses) {
        const tool = offered.find((candidate) => candidate.name === use.name);
        emit({ type: "tool", name: use.name, label: tool?.label ?? "Looking up" });
      }
      // In parallel; every result goes back in ONE user message.
      const outcomes = await Promise.all(uses.map((use) => runTool(ctx, offered, use.name, use.input)));
      const results: BetaToolResultBlockParam[] = uses.map((use, index) => {
        toolCalls.push({ name: use.name, input: use.input, ok: !outcomes[index]!.isError });
        return { type: "tool_result", tool_use_id: use.id, content: outcomes[index]!.content, ...(outcomes[index]!.isError ? { is_error: true } : {}) };
      });
      messages.push({ role: "user", content: results });
    }
  } catch (error) {
    if (signal.aborted) {
      failure = { error: "aborted", message: "The answer was cancelled." };
    } else if (error instanceof Anthropic.APIError || error instanceof IntegrationError) {
      const integrationError = toIntegrationError(error);
      request.log.warn({ code: integrationError.code, detail: integrationError.detail }, "willdoo model call failed");
      failure = { error: `willdoo_${integrationError.code}`, message: ERROR_TEXT[integrationError.code] };
    } else {
      request.log.error({ err: error }, "willdoo answer failed");
      failure = { error: "internal_error", message: "Will Doo had a problem answering. Try again." };
    }
  }

  const at = now();
  const cost = costMicros(model.model, usage);
  const expiresAt = new Date(at.getTime() + settings.retentionDays * DAY_MS);
  const usedTools = [...new Set(toolCalls.filter((call) => call.ok).map((call) => offered.find((tool) => tool.name === call.name)?.label ?? call.name))];

  // The spend is recorded even if the answer failed: it was already incurred.
  await c.willdooUsage.insertOne({
    _id: new ObjectId(),
    userId: auth.user._id,
    conversationId,
    model: model.model,
    usage,
    costMicros: cost,
    toolCalls: toolCalls.length,
    createdAt: at,
    expiresAt
  });

  let saved = false;
  const turns: WillDooTurn[] = [
    { role: "user", text: input.text, at },
    { role: "assistant", text: answer.trim(), tools: usedTools, at }
  ];
  if (!failure) {
    if (prepared.conversation) {
      // Optimistic: two questions at once in the same conversation cannot both be saved.
      const result = await c.willdooConversations.updateOne(
        { _id: conversationId, userId: auth.user._id, updatedAt: prepared.conversation.updatedAt },
        { $set: { messages, updatedAt: at, expiresAt }, $push: { turns: { $each: turns } }, $inc: { costMicros: cost } }
      );
      saved = result.matchedCount === 1;
      if (!saved) failure = { error: "conversation_busy", message: "The conversation changed while answering. Ask again." };
    } else {
      await c.willdooConversations.insertOne({
        _id: conversationId,
        userId: auth.user._id,
        title: input.text.replace(/\s+/g, " ").slice(0, 80),
        messages,
        turns,
        costMicros: cost,
        createdAt: at,
        updatedAt: at,
        expiresAt
      });
      saved = true;
    }
  }

  // Who asked what, which data was consulted and the spend. Never the answer or the data.
  await recordAudit(c, request, {
    actorId: auth.user._id,
    action: "willdoo.ask",
    entityType: "willdoo_conversation",
    entityId: conversationId,
    metadata: {
      pregunta: input.text.slice(0, 500),
      pantalla: input.screen?.path ?? null,
      herramientas: toolCalls.map((call) => ({ nombre: call.name, entrada: call.input, ok: call.ok })),
      modelo: model.model,
      consumo: usage,
      costoMicrosUsd: cost,
      fin: failure ? failure.error : stop
    }
  });

  if (failure) {
    emit({ type: "error", ...failure });
    return;
  }
  emit({ type: "done", conversationId: String(conversationId), turn: toPublicTurn(turns[1]!) });
}
