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
   * Screens where it is most relevant (route prefixes, e.g. "/usuarios"; "/" only
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
const when = (value: unknown, ctx: ToolContext) => (value ? formatInTimeZone(new Date(String(value)), ctx.timeZone) : "nunca");

interface UsersResult {
  total: number;
  usuarios: Array<{ usuario: string; nombre: string; correo: string | null; estado: string; bloqueado: boolean; roles: string[]; ultimoIngreso: string | null }>;
  enlace: string;
}

const presentUsers = (empty: string) => (result: UsersResult, ctx: ToolContext): QuickResult => ({
  summary: result.total ? plural(result.total, "usuario", "usuarios") : empty,
  items: result.usuarios.map((user) => ({
    title: user.nombre,
    subtitle: `@${user.usuario}${user.correo ? ` · ${user.correo}` : ""}`,
    meta: `${user.estado}${user.bloqueado ? " · bloqueado" : ""} · ${user.roles.join(", ") || "sin rol"} · último ingreso: ${when(user.ultimoIngreso, ctx)}`,
    link: result.enlace
  })),
  link: result.enlace
});

export const BUILT_IN_QUICK_QUERIES: readonly QuickQuery[] = [
  defineQuick({
    id: "indicadores-semana",
    label: "Indicadores de la semana",
    description: "Usuarios activos, ingresos e intentos fallidos de los últimos 7 días",
    question: "¿Cómo va la actividad de esta semana?",
    group: "Actividad",
    keywords: ["indicadores", "actividad", "semana", "ingresos", "entraron", "iniciaron sesion", "login", "usuarios activos", "resumen", "kpi", "sign in", "activity"],
    next: ["ingresos-fallidos-hoy", "usuarios-desactivados", "usuarios-recientes"],
    screens: ["/"],
    tool: "indicadores",
    input: () => ({ dias: 7 }),
    present: (result: { kpis: Record<string, number>; enlace: string }) => ({
      summary: `${plural(result.kpis.logins ?? 0, "ingreso", "ingresos")} en 7 días`,
      items: [
        { title: "Usuarios activos", meta: String(result.kpis.activeUsers ?? 0) },
        { title: "Usuarios desactivados", meta: String(result.kpis.disabledUsers ?? 0) },
        { title: "Personas distintas que entraron", meta: String(result.kpis.uniqueUsers ?? 0) },
        { title: "Intentos fallidos", meta: String(result.kpis.failedLogins ?? 0) },
        { title: "Roles", meta: String(result.kpis.roles ?? 0) }
      ],
      link: result.enlace
    })
  }),
  defineQuick({
    id: "usuarios-desactivados",
    label: "Usuarios desactivados",
    description: "Cuentas que hoy no pueden entrar",
    question: "¿Qué usuarios están desactivados?",
    group: "Equipo",
    keywords: ["desactivados", "desactivado", "inactivos", "bloqueados", "no pueden entrar", "sin acceso", "disabled", "locked"],
    next: ["usuarios-recientes", "roles", "ingresos-fallidos-hoy"],
    screens: ["/usuarios"],
    tool: "buscar_usuarios",
    input: () => ({ estado: "disabled", limite: 25 }),
    present: presentUsers("No hay usuarios desactivados")
  }),
  defineQuick({
    id: "usuarios-recientes",
    label: "Usuarios más recientes",
    description: "Las últimas cuentas creadas",
    question: "¿Quiénes son los usuarios más recientes?",
    group: "Equipo",
    keywords: ["recientes", "nuevos usuarios", "ultimos usuarios", "creados", "altas", "usuarios nuevos", "lista de usuarios", "new users"],
    next: ["roles", "usuarios-desactivados", "indicadores-semana"],
    screens: ["/usuarios"],
    tool: "buscar_usuarios",
    input: () => ({ limite: 10 }),
    present: presentUsers("Aún no hay usuarios")
  }),
  defineQuick({
    id: "ingresos-fallidos-hoy",
    label: "Ingresos fallidos de hoy",
    description: "Intentos de ingreso con contraseña incorrecta hoy",
    question: "¿Hubo ingresos fallidos hoy?",
    group: "Seguridad",
    keywords: ["fallidos", "fallido", "intentos", "contrasena incorrecta", "errores de ingreso", "seguridad", "failed", "wrong password"],
    next: ["usuarios-desactivados", "indicadores-semana", "usuarios-recientes"],
    screens: ["/"],
    tool: "consultar_auditoria",
    input: (ctx) => ({ accion: "auth.login.failure", desde: formatInTimeZone(new Date(), ctx.timeZone).slice(0, 10), limite: 30 }),
    present: (result: { total: number; registros: Array<{ fecha: string; usuario: string | null; detalle: Record<string, unknown> }> }, ctx) => ({
      summary: result.total ? plural(result.total, "intento fallido hoy", "intentos fallidos hoy") : "Ningún intento fallido hoy",
      items: result.registros.map((entry) => ({
        title: entry.usuario ?? (typeof entry.detalle.username === "string" ? `@${entry.detalle.username}` : "Usuario desconocido"),
        meta: when(entry.fecha, ctx)
      }))
    })
  }),
  defineQuick({
    id: "mis-notificaciones",
    label: "Mis notificaciones sin leer",
    description: "Tus avisos pendientes",
    question: "¿Tengo notificaciones sin leer?",
    group: "Mis avisos",
    keywords: ["notificaciones", "avisos", "pendientes", "mensajes", "alertas", "sin leer", "notifications", "unread"],
    next: ["indicadores-semana", "usuarios-recientes", "roles"],
    tool: "mis_notificaciones",
    input: () => ({ soloNoLeidas: true, limite: 20 }),
    present: (result: { noLeidas: number; notificaciones: Array<{ titulo: string; texto: string; fecha: string }> }, ctx) => ({
      summary: result.noLeidas ? plural(result.noLeidas, "notificación sin leer", "notificaciones sin leer") : "No tienes notificaciones sin leer",
      items: result.notificaciones.map((item) => ({ title: item.titulo, subtitle: item.texto || null, meta: when(item.fecha, ctx) }))
    })
  }),
  defineQuick({
    id: "roles",
    label: "Roles y sus usuarios",
    description: "Cada rol con cuántas personas lo tienen",
    question: "¿Qué roles hay y cuántas personas tiene cada uno?",
    group: "Equipo",
    keywords: ["roles", "rol", "perfiles", "permisos", "quien tiene", "cuantas personas", "roles"],
    next: ["usuarios-recientes", "usuarios-desactivados", "indicadores-semana"],
    screens: ["/roles"],
    tool: "listar_roles",
    input: () => ({}),
    present: (result: { roles: Array<{ nombre: string; descripcion: string; permisos: number; usuarios: number }>; enlace: string }) => ({
      summary: plural(result.roles.length, "rol", "roles"),
      items: result.roles.map((role) => ({
        title: role.nombre,
        subtitle: role.descripcion || null,
        meta: `${plural(role.usuarios, "usuario", "usuarios")} · ${plural(role.permisos, "permiso", "permisos")}`,
        link: result.enlace
      })),
      link: result.enlace
    })
  }),
  defineQuick({
    id: "tableros-monday",
    label: "Tableros de Monday",
    description: "Tableros de la cuenta conectada",
    question: "¿Qué tableros hay en Monday?",
    group: "Integraciones",
    keywords: ["monday", "tableros", "boards", "tablero"],
    next: ["indicadores-semana", "mis-notificaciones", "roles"],
    screens: ["/monday"],
    tool: "tableros_monday",
    input: () => ({}),
    present: (result: { total: number; tableros: Array<{ nombre: string; espacio: string | null; enlace: string | null }> }) => ({
      summary: plural(result.total, "tablero", "tableros"),
      items: result.tableros.map((board) => ({ title: board.nombre, subtitle: board.espacio ?? "Espacio principal", link: board.enlace }))
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
