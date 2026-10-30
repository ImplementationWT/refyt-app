import type { BetaTool } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { ObjectId, type Filter } from "mongodb";
import { z } from "zod";
import type { AuthContext } from "../../auth/context.js";
import type { PermissionKey } from "../../auth/permissions.js";
import type { AuditLogDoc, Collections, UserDoc } from "../../db/collections.js";
import { containsRegex } from "../../http/pagination.js";
import { IntegrationError } from "../../integrations/errors.js";
import type { Integrations } from "../../integrations/service.js";
import { dashboardData, isTimeZone } from "../dashboard/routes.js";
import { rolesMap } from "../users/dto.js";

/** What a tool may use: always the identity and scope of whoever asks. */
export interface ToolContext {
  auth: AuthContext;
  c: Collections;
  integrations: Integrations;
  /** IANA zone of the user's browser (for dates and the dashboard). */
  timeZone: string;
}

/**
 * Read tool for Will Doo. Permissions are enforced HERE, in the data layer:
 * a tool is only offered to Claude when the user holds `permission`, it is
 * checked again before running, and `run` only queries what that user can see.
 * The model never receives data the user could not open in the app.
 */
export interface WillDooTool<Input = unknown> {
  name: string;
  /** Shown in the chat while it runs ("Consultando usuarios…"). */
  label: string;
  description: string;
  /** null: any user of Will Doo. */
  permission: PermissionKey | null;
  input: z.ZodType<Input>;
  /** Extra condition (e.g. an integration that must be configured). */
  available?(ctx: ToolContext): boolean;
  run(ctx: ToolContext, input: Input): Promise<unknown>;
}

/** Keeps generics out of the registry while preserving the per-tool types. */
export function defineTool<Input>(tool: WillDooTool<Input>): WillDooTool<unknown> {
  return tool as WillDooTool<unknown>;
}

const limit = (max: number, fallback: number) =>
  z.number().int().min(1).max(max).optional().default(fallback).describe(`Maximum results (1–${max}, ${fallback} by default)`);

const searchUsers = defineTool({
  name: "buscar_usuarios",
  label: "Looking up users",
  description:
    "Searches the app's users by name, username or email and returns their status, roles and last sign-in. Without text, lists the most recent. Use it for questions about people or accounts.",
  permission: "users.read",
  input: z.strictObject({
    texto: z.string().trim().max(100).optional().describe("Part of the name, username or email"),
    estado: z.enum(["active", "disabled"]).optional().describe("Filters by active or disabled"),
    limite: limit(25, 10)
  }),
  async run({ c }, { texto, estado, limite }) {
    const filter: Filter<UserDoc> = {};
    if (estado) filter.status = estado;
    if (texto) {
      const pattern = containsRegex(texto);
      filter.$or = [{ username: pattern }, { displayName: pattern }, { email: pattern }];
    }
    const [users, total, roles] = await Promise.all([
      c.users.find(filter).sort({ createdAt: -1 }).limit(limite).toArray(),
      c.users.countDocuments(filter),
      c.roles.find().toArray()
    ]);
    const byId = rolesMap(roles);
    return {
      total,
      mostrados: users.length,
      usuarios: users.map((user) => ({
        usuario: user.username,
        nombre: user.displayName,
        correo: user.email ?? null,
        estado: user.status === "active" ? "active" : "disabled",
        bloqueado: user.lockedUntil !== null && user.lockedUntil > new Date(),
        roles: user.roleIds.map((id) => byId.get(String(id))?.name).filter(Boolean),
        ultimoIngreso: user.lastLoginAt,
        creado: user.createdAt
      })),
      enlace: "/users"
    };
  }
});

const listRoles = defineTool({
  name: "listar_roles",
  label: "Looking up roles",
  description: "Lists the app's roles with their description, how many permissions they have and how many users use them.",
  permission: "roles.read",
  input: z.strictObject({}),
  async run({ c }) {
    const [roles, counts] = await Promise.all([
      c.roles.find().sort({ name: 1 }).toArray(),
      c.users.aggregate<{ _id: ObjectId; n: number }>([{ $unwind: "$roleIds" }, { $group: { _id: "$roleIds", n: { $sum: 1 } } }]).toArray()
    ]);
    const usersByRole = new Map(counts.map((row) => [String(row._id), row.n]));
    return {
      roles: roles.map((role) => ({
        nombre: role.name,
        clave: role.key,
        descripcion: role.description,
        permisos: role.permissionKeys.length,
        usuarios: usersByRole.get(String(role._id)) ?? 0,
        delSistema: role.isSystem
      })),
      enlace: "/roles"
    };
  }
});

const indicators = defineTool({
  name: "indicadores",
  label: "Looking up indicators",
  description:
    "Dashboard indicators: active and disabled users, roles, successful and failed sign-ins and unique users in the last 7, 14 or 30 days, with the daily series.",
  permission: "dashboard.read",
  input: z.strictObject({
    dias: z.union([z.literal(7), z.literal(14), z.literal(30)]).optional().default(14).describe("Period: 7, 14 or 30 days")
  }),
  async run({ c, timeZone }, { dias }) {
    return { ...(await dashboardData(c, dias, timeZone)), enlace: "/dashboard" };
  }
});

const auditLog = defineTool({
  name: "consultar_auditoria",
  label: "Looking up the audit log",
  description:
    "Searches the audit log for who did what and when (sign-ins, user and role changes, notifications…). Filters by action and date range.",
  permission: "audit.read",
  input: z.strictObject({
    accion: z.string().trim().max(100).optional().describe("Exact action, e.g. auth.login.failure or user.update"),
    desde: z.iso.date().optional().describe("Start date YYYY-MM-DD"),
    hasta: z.iso.date().optional().describe("End date YYYY-MM-DD (included)"),
    limite: limit(50, 20)
  }),
  async run({ c }, { accion, desde, hasta, limite }) {
    const filter: Filter<AuditLogDoc> = {};
    if (accion) filter.action = accion;
    if (desde || hasta) {
      filter.createdAt = {
        ...(desde ? { $gte: new Date(desde) } : {}),
        ...(hasta ? { $lt: new Date(new Date(hasta).getTime() + 86_400_000) } : {})
      };
    }
    const [entries, total] = await Promise.all([
      c.auditLogs.find(filter).sort({ createdAt: -1 }).limit(limite).toArray(),
      c.auditLogs.countDocuments(filter)
    ]);
    const actorIds = [...new Set(entries.flatMap((entry) => (entry.actorId ? [String(entry.actorId)] : [])))];
    const actors = actorIds.length
      ? await c.users.find({ _id: { $in: actorIds.map((id) => new ObjectId(id)) } }, { projection: { username: 1, displayName: 1 } }).toArray()
      : [];
    const actorById = new Map(actors.map((actor) => [String(actor._id), actor]));
    return {
      total,
      mostrados: entries.length,
      registros: entries.map((entry) => {
        const actor = entry.actorId ? actorById.get(String(entry.actorId)) : undefined;
        return {
          fecha: entry.createdAt,
          accion: entry.action,
          entidad: entry.entityType,
          usuario: actor ? `${actor.displayName} (@${actor.username})` : null,
          detalle: entry.metadata
        };
      })
    };
  }
});

const myNotifications = defineTool({
  name: "mis_notificaciones",
  label: "Looking up your notifications",
  description: "Notifications of the user asking (only theirs), with their read status.",
  permission: "notifications.read",
  input: z.strictObject({
    soloNoLeidas: z.boolean().optional().default(false).describe("Unread only"),
    limite: limit(30, 10)
  }),
  async run({ auth, c }, { soloNoLeidas, limite }) {
    const filter = { userId: auth.user._id, ...(soloNoLeidas ? { readAt: null } : {}) };
    const [items, unread] = await Promise.all([
      c.notifications.find(filter).sort({ createdAt: -1 }).limit(limite).toArray(),
      c.notifications.countDocuments({ userId: auth.user._id, readAt: null })
    ]);
    return {
      noLeidas: unread,
      notificaciones: items.map((item) => ({
        titulo: item.title,
        texto: item.body,
        tipo: item.type,
        leida: item.readAt !== null,
        fecha: item.createdAt
      }))
    };
  }
});

const mondayBoards = defineTool({
  name: "tableros_monday",
  label: "Looking up Monday",
  description: "Boards of the connected Monday.com account, with their workspace and link.",
  permission: "monday.read",
  input: z.strictObject({
    texto: z.string().trim().max(100).optional().describe("Part of the board name")
  }),
  available: ({ integrations }) => integrations.monday() !== null,
  async run({ integrations }, { texto }) {
    const boards = await integrations.monday()!.listBoards();
    const needle = texto?.toLowerCase();
    const matches = needle ? boards.filter((board) => board.name.toLowerCase().includes(needle)) : boards;
    return {
      total: matches.length,
      tableros: matches.slice(0, 50).map((board) => ({ nombre: board.name, espacio: board.workspaceName, enlace: board.url }))
    };
  }
});

/**
 * Built-in read tools. Each project adds its own here (invoices, orders…),
 * always with a permission and queries limited to what that user can see.
 */
export const BUILT_IN_TOOLS: readonly WillDooTool[] = [searchUsers, listRoles, indicators, auditLog, myNotifications, mondayBoards];

/** Tools the user may use right now, in a stable order (keeps the prompt cache). */
export function toolsFor(ctx: ToolContext, tools: readonly WillDooTool[] = BUILT_IN_TOOLS): WillDooTool[] {
  return tools
    .filter((tool) => (tool.permission === null || ctx.auth.permissions.has(tool.permission)) && (tool.available?.(ctx) ?? true))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Definition sent to Claude (JSON Schema derived from the Zod input). */
export function toolDefinition(tool: WillDooTool): BetaTool {
  const { $schema: _schema, ...schema } = z.toJSONSchema(tool.input, { io: "input" }) as Record<string, unknown>;
  void _schema;
  return {
    name: tool.name,
    description: tool.description,
    input_schema: { ...schema, type: "object" } as BetaTool["input_schema"],
    // Inputs stream as generated; they are validated with Zod before running.
    eager_input_streaming: true
  };
}

/** Results larger than this are not sent: Claude is asked to narrow the query. */
export const MAX_RESULT_CHARS = 40_000;

export interface ToolOutcome {
  content: string;
  isError: boolean;
}

/**
 * Runs a tool requested by the model. A tool that was not offered, a missing
 * permission or invalid input never reaches the data.
 */
export async function runTool(ctx: ToolContext, offered: readonly WillDooTool[], name: string, input: unknown): Promise<ToolOutcome> {
  const tool = offered.find((candidate) => candidate.name === name);
  if (!tool || (tool.permission !== null && !ctx.auth.permissions.has(tool.permission))) {
    return { content: JSON.stringify({ error: "herramienta_no_disponible" }), isError: true };
  }
  const parsed = tool.input.safeParse(input ?? {});
  if (!parsed.success) {
    return {
      content: JSON.stringify({ error: "entrada_invalida", detalle: parsed.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`) }),
      isError: true
    };
  }
  try {
    const content = JSON.stringify(await tool.run(ctx, parsed.data));
    if (content.length > MAX_RESULT_CHARS) {
      return { content: JSON.stringify({ error: "resultado_demasiado_grande", sugerencia: "Narrow the query (fewer results or filters)." }), isError: true };
    }
    return { content, isError: false };
  } catch (error) {
    if (error instanceof IntegrationError) {
      return { content: JSON.stringify({ error: `integracion_${error.code}` }), isError: true };
    }
    throw error;
  }
}

/** Timezone from the browser, or UTC when missing or invalid. */
export function safeTimeZone(value: string | undefined): string {
  return value && value.length <= 64 && /^[A-Za-z0-9_+\-/]+$/.test(value) && isTimeZone(value) ? value : "UTC";
}
