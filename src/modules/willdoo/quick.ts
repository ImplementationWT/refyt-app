import type { PermissionKey } from "../../auth/permissions.js";
import { formatInTimeZone } from "./dates.js";
import { BUILT_IN_TOOLS, runTool, toolsFor, type ToolContext, type WillDooTool } from "./tools.js";

/** One row of a quick-query result, ready to show (no interpretation in the browser). */
export interface QuickItem {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  link?: string | null;
}

export interface QuickResult {
  summary: string;
  items: QuickItem[];
  link?: string | null;
}

/**
 * Quick query of «Will Doo solo» (no AI, no cost): a read tool with fixed input
 * and a presentation. Same permissions as the chat: it is listed and runs only
 * when the user holds the tool's permission. Each project adds its own.
 */
export interface QuickQuery {
  id: string;
  label: string;
  description: string;
  /** How the user would ask it: shown as a suggestion and as their message. */
  question: string;
  /** Topic of the roadmap (start screen), e.g. "Equipo". */
  group: string;
  /**
   * Words and phrases that identify it in a typed question (no AI). Each entry is
   * a word or a phrase; a phrase counts only when all its words appear.
   */
  keywords: string[];
  /** Up to 3 follow-ups suggested after answering it (ids of other queries). */
  next: string[];
  /**
   * Screens where it is most relevant (route prefixes, e.g. "/users"; "/" only
   * matches the home page). On those screens it wins ties and is suggested first.
   */
  screens?: string[];
  tool: string;
  input: (ctx: ToolContext) => unknown;
  /**
   * Input taken from a typed question ("¿qué hizo ana el lunes?"), without AI.
   * null: nothing in the question for it, so `input` is used.
   */
  parse?: (question: string, ctx: ToolContext) => Promise<unknown> | unknown;
  present: (result: never, ctx: ToolContext) => QuickResult;
}

/** Typed definition: `present` receives the tool's own result shape. */
export function defineQuick<Result>(query: Omit<QuickQuery, "present"> & { present: (result: Result, ctx: ToolContext) => QuickResult }): QuickQuery {
  return query as unknown as QuickQuery;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const when = (value: unknown, ctx: ToolContext) => (value ? formatInTimeZone(new Date(String(value)), ctx.timeZone) : "never");

interface UsersResult {
  total: number;
  usuarios: Array<{ usuario: string; nombre: string; correo: string | null; estado: string; bloqueado: boolean; roles: string[]; ultimoIngreso: string | null }>;
  enlace: string;
}

const presentUsers = (empty: string) => (result: UsersResult, ctx: ToolContext): QuickResult => ({
  summary: result.total ? plural(result.total, "user", "users") : empty,
  items: result.usuarios.map((user) => ({
    title: user.nombre,
    subtitle: `@${user.usuario}${user.correo ? ` · ${user.correo}` : ""}`,
    meta: `${user.estado}${user.bloqueado ? " · locked" : ""} · ${user.roles.join(", ") || "no role"} · last sign-in: ${when(user.ultimoIngreso, ctx)}`,
    link: result.enlace
  })),
  link: result.enlace
});

export const BUILT_IN_QUICK_QUERIES: readonly QuickQuery[] = [
  defineQuick({
    id: "indicadores-semana",
    label: "This week's indicators",
    description: "Active users, sign-ins and failed attempts in the last 7 days",
    question: "How is activity this week?",
    group: "Activity",
    keywords: ["indicadores", "actividad", "semana", "ingresos", "entraron", "iniciaron sesion", "login", "usuarios activos", "resumen", "kpi", "sign in", "activity"],
    next: ["ingresos-fallidos-hoy", "usuarios-desactivados", "usuarios-recientes"],
    screens: ["/dashboard"],
    tool: "indicadores",
    input: () => ({ dias: 7 }),
    present: (result: { kpis: Record<string, number>; enlace: string }) => ({
      summary: `${plural(result.kpis.logins ?? 0, "sign-in", "sign-ins")} in 7 days`,
      items: [
        { title: "Active users", meta: String(result.kpis.activeUsers ?? 0) },
        { title: "Disabled users", meta: String(result.kpis.disabledUsers ?? 0) },
        { title: "Different people who signed in", meta: String(result.kpis.uniqueUsers ?? 0) },
        { title: "Failed attempts", meta: String(result.kpis.failedLogins ?? 0) },
        { title: "Roles", meta: String(result.kpis.roles ?? 0) }
      ],
      link: result.enlace
    })
  }),
  defineQuick({
    id: "usuarios-desactivados",
    label: "Disabled users",
    description: "Accounts that cannot sign in today",
    question: "Which users are disabled?",
    group: "Team",
    keywords: ["desactivados", "desactivado", "inactivos", "bloqueados", "no pueden entrar", "sin acceso", "disabled", "locked"],
    next: ["usuarios-recientes", "roles", "ingresos-fallidos-hoy"],
    screens: ["/users"],
    tool: "buscar_usuarios",
    input: () => ({ estado: "disabled", limite: 25 }),
    present: presentUsers("There are no disabled users")
  }),
  defineQuick({
    id: "usuarios-recientes",
    label: "Most recent users",
    description: "The latest accounts created",
    question: "Who are the most recent users?",
    group: "Team",
    keywords: ["recientes", "nuevos usuarios", "ultimos usuarios", "creados", "altas", "usuarios nuevos", "lista de usuarios", "new users"],
    next: ["roles", "usuarios-desactivados", "indicadores-semana"],
    screens: ["/users"],
    tool: "buscar_usuarios",
    input: () => ({ limite: 10 }),
    present: presentUsers("There are no users yet")
  }),
  defineQuick({
    id: "ingresos-fallidos-hoy",
    label: "Today's failed sign-ins",
    description: "Sign-in attempts with a wrong password today",
    question: "Were there failed sign-ins today?",
    group: "Security",
    keywords: ["fallidos", "fallido", "intentos", "contrasena incorrecta", "errores de ingreso", "seguridad", "failed", "wrong password"],
    next: ["usuarios-desactivados", "indicadores-semana", "usuarios-recientes"],
    screens: ["/dashboard"],
    tool: "consultar_auditoria",
    input: (ctx) => ({ accion: "auth.login.failure", desde: formatInTimeZone(new Date(), ctx.timeZone).slice(0, 10), limite: 30 }),
    present: (result: { total: number; registros: Array<{ fecha: string; usuario: string | null; detalle: Record<string, unknown> }> }, ctx) => ({
      summary: result.total ? plural(result.total, "failed attempt today", "failed attempts today") : "No failed attempts today",
      items: result.registros.map((entry) => ({
        title: entry.usuario ?? (typeof entry.detalle.username === "string" ? `@${entry.detalle.username}` : "Unknown user"),
        meta: when(entry.fecha, ctx)
      }))
    })
  }),
  defineQuick({
    id: "mis-notificaciones",
    label: "My unread notifications",
    description: "Your pending notices",
    question: "Do I have unread notifications?",
    group: "My notices",
    keywords: ["notificaciones", "avisos", "pendientes", "mensajes", "alertas", "sin leer", "notifications", "unread"],
    next: ["indicadores-semana", "usuarios-recientes", "roles"],
    tool: "mis_notificaciones",
    input: () => ({ soloNoLeidas: true, limite: 20 }),
    present: (result: { noLeidas: number; notificaciones: Array<{ titulo: string; texto: string; fecha: string }> }, ctx) => ({
      summary: result.noLeidas ? plural(result.noLeidas, "unread notification", "unread notifications") : "You have no unread notifications",
      items: result.notificaciones.map((item) => ({ title: item.titulo, subtitle: item.texto || null, meta: when(item.fecha, ctx) }))
    })
  }),
  defineQuick({
    id: "roles",
    label: "Roles and their users",
    description: "Each role with how many people have it",
    question: "Which roles are there and how many people does each have?",
    group: "Team",
    keywords: ["roles", "rol", "perfiles", "permisos", "quien tiene", "cuantas personas", "roles"],
    next: ["usuarios-recientes", "usuarios-desactivados", "indicadores-semana"],
    screens: ["/roles"],
    tool: "listar_roles",
    input: () => ({}),
    present: (result: { roles: Array<{ nombre: string; descripcion: string; permisos: number; usuarios: number }>; enlace: string }) => ({
      summary: plural(result.roles.length, "role", "roles"),
      items: result.roles.map((role) => ({
        title: role.nombre,
        subtitle: role.descripcion || null,
        meta: `${plural(role.usuarios, "user", "users")} · ${plural(role.permisos, "permission", "permissions")}`,
        link: result.enlace
      })),
      link: result.enlace
    })
  }),
  defineQuick({
    id: "tableros-monday",
    label: "Monday boards",
    description: "Boards of the connected account",
    question: "Which boards are there in Monday?",
    group: "Integrations",
    keywords: ["monday", "tableros", "boards", "tablero"],
    next: ["indicadores-semana", "mis-notificaciones", "roles"],
    screens: ["/monday"],
    tool: "tableros_monday",
    input: () => ({}),
    present: (result: { total: number; tableros: Array<{ nombre: string; espacio: string | null; enlace: string | null }> }) => ({
      summary: plural(result.total, "board", "boards"),
      items: result.tableros.map((board) => ({ title: board.nombre, subtitle: board.espacio ?? "Main workspace", link: board.enlace }))
    })
  })
];

/** Quick queries the user may run now (their tool is available to them), in a stable order. */
export function quickQueriesFor(ctx: ToolContext, queries: readonly QuickQuery[] = BUILT_IN_QUICK_QUERIES, tools: readonly WillDooTool[] = BUILT_IN_TOOLS) {
  const available = new Set(toolsFor(ctx, tools).map((tool) => tool.name));
  return queries.filter((query) => available.has(query.tool));
}

export class QuickQueryError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

/**
 * Runs a quick query through the same permission check as the chat. With the
 * typed `question`, its own `parse` may take the input from it.
 */
export async function runQuickQuery(ctx: ToolContext, query: QuickQuery, tools: readonly WillDooTool[] = BUILT_IN_TOOLS, question?: string): Promise<QuickResult> {
  const parsed = question && query.parse ? await query.parse(question, ctx) : null;
  const outcome = await runTool(ctx, toolsFor(ctx, tools), query.tool, parsed ?? query.input(ctx));
  if (outcome.isError) throw new QuickQueryError((JSON.parse(outcome.content) as { error: string }).error);
  return query.present(JSON.parse(outcome.content) as never, ctx);
}

/** Permission of a quick query (for the audit and docs). */
export function quickPermission(query: QuickQuery, tools: readonly WillDooTool[] = BUILT_IN_TOOLS): PermissionKey | null {
  return tools.find((tool) => tool.name === query.tool)?.permission ?? null;
}
