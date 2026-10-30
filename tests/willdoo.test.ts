import type { BetaContentBlock, BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { ObjectId } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createIntegrations } from "../src/integrations/service.js";
import { IntegrationError } from "../src/integrations/errors.js";
import type { ModelRequest, WillDooModel } from "../src/modules/willdoo/model.js";
import { costMicros } from "../src/modules/willdoo/pricing.js";
import { MAX_ROUNDS } from "../src/modules/willdoo/service.js";
import { BUILT_IN_TOOLS, toolDefinition } from "../src/modules/willdoo/tools.js";
import { setupApi, type Api } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

/** Fake, low-entropy key: never a real credential. */
const FAKE_ANTHROPIC_KEY = "sk-ant-fakefakefakefake";

type Script = (request: ModelRequest, call: number) => { content: unknown[]; stop: BetaMessage["stop_reason"]; text?: string };

/** Claude stand-in: records every request and answers from a script. */
function fakeModel(script: Script) {
  const requests: ModelRequest[] = [];
  const model: WillDooModel = {
    model: "claude-sonnet-5-5",
    async respond(request, onText) {
      // Deep copy: the service keeps appending to the same arrays.
      requests.push(JSON.parse(JSON.stringify(request)) as ModelRequest);
      const answer = script(request, requests.length - 1);
      if (answer.text) onText(answer.text);
      return {
        id: `msg_${requests.length}`,
        type: "message",
        role: "assistant",
        model: "claude-sonnet-5-5",
        content: (answer.text ? [...answer.content, { type: "text", text: answer.text, citations: null }] : answer.content) as BetaContentBlock[],
        stop_reason: answer.stop,
        stop_sequence: null,
        usage: { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 3000, cache_creation_input_tokens: 500 }
      } as unknown as BetaMessage;
    }
  };
  return { model, requests };
}

const toolUse = (id: string, name: string, input: unknown = {}) => ({ type: "tool_use", id, name, input });
const answer = (text: string) => ({ content: [], stop: "end_turn" as const, text });

interface StreamEvent {
  type: string;
  conversationId: string;
  turn: { text: string; tools: string[] };
  [key: string]: unknown;
}

function events(body: string) {
  return body
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as StreamEvent);
}

describe.skipIf(skipDb)("Will Doo", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });
  afterAll(async () => {
    await mongo?.stop();
  });

  async function setup(script: Script, settings: { monthlyBudgetUsd?: number; userDailyMessages?: number } = {}) {
    const fake = fakeModel(script);
    const integrations = createIntegrations({ ANTHROPIC_API_KEY: FAKE_ANTHROPIC_KEY });
    const api = await setupApi(mongo, {
      integrations,
      secrets: [FAKE_ANTHROPIC_KEY],
      willdoo: { model: fake.model },
      settings: {
        willdoo: { mode: "claude", model: "claude-sonnet-5-5", monthlyBudgetUsd: settings.monthlyBudgetUsd ?? 50, userDailyMessages: settings.userDailyMessages ?? 100, retentionDays: 90 }
      }
    });
    return { api, fake };
  }

  const ask = (api: Api, cookie: string, body: Record<string, unknown>) =>
    api.request("POST", "/api/willdoo/messages", { cookie, body: { timeZone: "America/Lima", ...body } });

  async function basicApi(mode: "off" | "basic" | "claude" = "basic", withKey = false) {
    return setupApi(mongo, {
      ...(withKey ? { integrations: createIntegrations({ ANTHROPIC_API_KEY: FAKE_ANTHROPIC_KEY }), secrets: [FAKE_ANTHROPIC_KEY] } : {}),
      settings: { willdoo: { mode, model: "claude-sonnet-5-5", monthlyBudgetUsd: 50, userDailyMessages: 100, retentionDays: 90 } }
    });
  }
  const quick = (api: Api, cookie: string, id: string) => api.request("POST", `/api/willdoo/quick/${id}`, { cookie, body: { timeZone: "America/Lima" } });

  it("«Will Doo solo» (por defecto): consultas rápidas y guía, sin chat ni Claude", async () => {
    const api = await basicApi();
    const cookie = await api.adminCookie();
    expect((await api.request("GET", "/api/auth/me", { cookie })).json().features).toEqual(["willdoo"]);
    expect((await ask(api, cookie, { text: "Hola" })).statusCode).toBe(404);
    expect((await api.request("GET", "/api/willdoo/conversations", { cookie })).statusCode).toBe(404);
    expect((await api.request("GET", "/api/willdoo/guide", { cookie })).json().guide).toContain("## Sections of the app");

    const list = (await api.request("GET", "/api/willdoo/quick", { cookie })).json();
    expect(list.mode).toBe("basic");
    // Monday is not configured: its query is not listed.
    expect(list.items.map((item: { id: string }) => item.id)).toEqual([
      "indicadores-semana",
      "usuarios-desactivados",
      "usuarios-recientes",
      "ingresos-fallidos-hoy",
      "mis-notificaciones",
      "roles"
    ]);

    await api.createUser({ username: "inactivo" });
    await api.c.users.updateOne({ username: "inactivo" }, { $set: { status: "disabled" } });
    const disabled = await quick(api, cookie, "usuarios-desactivados");
    expect(disabled.statusCode).toBe(200);
    expect(disabled.json()).toMatchObject({ id: "usuarios-desactivados", summary: "1 user", link: "/users", items: [{ title: "inactivo", subtitle: "@inactivo" }] });
    expect(disabled.body).not.toContain("passwordHash");
    expect((await quick(api, cookie, "indicadores-semana")).json().items[0]).toEqual({ title: "Active users", meta: "1" });
    expect(await api.c.auditLogs.findOne({ action: "willdoo.quick" })).toMatchObject({ entityId: "usuarios-desactivados", metadata: { consulta: "usuarios-desactivados", resultados: 1 } });
  });

  it("consultas rápidas con los permisos del usuario: las demás no se listan y responden 404", async () => {
    const api = await basicApi();
    const ana = await api.createUser({ username: "ana", permissions: ["willdoo.use", "notifications.read"] });
    await api.c.notifications.insertOne({ _id: new ObjectId(), userId: new ObjectId(ana.id), type: "info", title: "Aviso de Ana", body: "", readAt: null, createdAt: new Date() });
    const cookie = await ana.cookie();
    expect((await api.request("GET", "/api/willdoo/quick", { cookie })).json().items.map((item: { id: string }) => item.id)).toEqual(["mis-notificaciones"]);
    expect((await quick(api, cookie, "usuarios-desactivados")).statusCode).toBe(404);
    expect((await quick(api, cookie, "no-existe")).statusCode).toBe(404);
    expect((await quick(api, cookie, "mis-notificaciones")).json()).toMatchObject({ summary: "1 unread notification", items: [{ title: "Aviso de Ana" }] });

    const plain = await api.createUser({ username: "sinwill", permissions: ["users.read"] });
    const plainCookie = await plain.cookie();
    expect((await api.request("GET", "/api/auth/me", { cookie: plainCookie })).json().features).toEqual([]);
    expect((await api.request("GET", "/api/willdoo/quick", { cookie: plainCookie })).statusCode).toBe(403);
  });

  it("«Sin Will Doo»: no aparece y todo responde 404, aunque haya clave", async () => {
    const api = await basicApi("off", true);
    const cookie = await api.adminCookie();
    expect((await api.request("GET", "/api/auth/me", { cookie })).json().features).toEqual([]);
    for (const url of ["/api/willdoo/quick", "/api/willdoo/guide", "/api/willdoo/conversations"]) {
      expect((await api.request("GET", url, { cookie })).statusCode, url).toBe(404);
    }
    expect((await ask(api, cookie, { text: "Hola" })).statusCode).toBe(404);
  });

  it("«Will Doo + Claude» sin clave funciona como «Will Doo solo»", async () => {
    const api = await basicApi("claude", false);
    const cookie = await api.adminCookie();
    expect((await api.request("GET", "/api/auth/me", { cookie })).json().features).toEqual(["willdoo"]);
    expect((await api.request("GET", "/api/willdoo/quick", { cookie })).json().mode).toBe("basic");
    expect((await ask(api, cookie, { text: "Hola" })).statusCode).toBe(404);
  });

  it("«Will Doo + Claude»: con willdoo.use aparecen willdoo y willdoo-ai; sin el permiso, 403", async () => {
    const { api } = await setup(() => answer("Hola"));
    const admin = await api.adminCookie();
    expect((await api.request("GET", "/api/auth/me", { cookie: admin })).json().features).toEqual(["willdoo", "willdoo-ai"]);
    expect((await api.request("GET", "/api/willdoo/quick", { cookie: admin })).json().mode).toBe("claude");

    const plain = await api.createUser({ username: "sinwill", permissions: ["notifications.read"] });
    const cookie = await plain.cookie();
    expect((await api.request("GET", "/api/auth/me", { cookie })).json().features).toEqual([]);
    expect((await ask(api, cookie, { text: "Hola" })).statusCode).toBe(403);
  });

  it("responde en streaming, guarda la conversación, audita y registra el costo", async () => {
    const { api, fake } = await setup((_request, call) =>
      call === 0 ? { content: [toolUse("t1", "indicadores", { dias: 7 })], stop: "tool_use" } : answer("Hay **1** usuario activo. [Ver dashboard](/)")
    );
    const cookie = await api.adminCookie();
    const response = await ask(api, cookie, { text: "¿Cuántos usuarios activos hay?", screen: { path: "/", title: "Dashboards" } });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/x-ndjson");
    expect(response.headers["cache-control"]).toBe("no-store");

    const stream = events(response.body);
    expect(stream.map((event) => event.type)).toEqual(["start", "tool", "text", "done"]);
    expect(stream[1]).toMatchObject({ name: "indicadores", label: "Looking up indicators" });
    const done = stream.at(-1) as { conversationId: string; turn: { text: string; tools: string[] } };
    expect(done.turn).toMatchObject({ text: "Hay **1** usuario activo. [Ver dashboard](/)", tools: ["Looking up indicators"] });

    // The tool result went back to Claude with live data, inside a tool_result.
    const second = fake.requests[1]!;
    const results = second.messages.at(-1)!.content as Array<{ type: string; tool_use_id: string; content: string }>;
    expect(results[0]).toMatchObject({ type: "tool_result", tool_use_id: "t1" });
    expect(JSON.parse(results[0]!.content).kpis.activeUsers).toBe(1);
    // Screen and identity travel as marked data in the user turn, not in the system prompt.
    const userTurn = fake.requests[0]!.messages[0]!.content as Array<{ text: string }>;
    expect(userTurn[0]!.text).toMatch(/^<context>[\s\S]*Open screen: \/ · “Dashboards”[\s\S]*<\/context>$/);
    expect(userTurn[1]!.text).toBe("¿Cuántos usuarios activos hay?");
    expect(JSON.stringify(fake.requests[0]!.system)).not.toContain("@admin");
    expect(fake.requests[0]!.system[0]!.cache_control).toEqual({ type: "ephemeral" });

    const conversation = await api.c.willdooConversations.findOne({ _id: new ObjectId(done.conversationId) });
    expect(conversation?.turns.map((turn) => turn.role)).toEqual(["user", "assistant"]);
    expect(conversation?.messages).toHaveLength(4);
    expect(conversation!.expiresAt.getTime() - conversation!.updatedAt.getTime()).toBe(90 * 86_400_000);

    const usage = await api.c.willdooUsage.findOne({ conversationId: conversation!._id });
    const expected = costMicros("claude-sonnet-5-5", { input: 2000, output: 400, cacheRead: 6000, cacheWrite: 1000 });
    expect(usage).toMatchObject({ toolCalls: 1, costMicros: expected });
    expect(expected).toBe(2000 * 2 + 400 * 10 + 6000 * 0.2 + 1000 * 2.5);

    const audit = await api.c.auditLogs.findOne({ action: "willdoo.ask" });
    expect(audit?.metadata).toMatchObject({
      pregunta: "¿Cuántos usuarios activos hay?",
      pantalla: "/",
      herramientas: [{ nombre: "indicadores", entrada: { dias: 7 }, ok: true }],
      costoMicrosUsd: expected,
      fin: "end_turn"
    });
    // The answer and the data are not in the audit.
    expect(JSON.stringify(audit)).not.toContain("usuario activo");
  });

  it("sin fuga de permisos: solo se ofrecen sus herramientas y lo demás no llega a los datos", async () => {
    const { api, fake } = await setup((_request, call) =>
      call === 0
        ? { content: [toolUse("t1", "buscar_usuarios", { texto: "beto" }), toolUse("t2", "mis_notificaciones", {})], stop: "tool_use" }
        : answer("Listo")
    );
    const admin = await api.adminCookie();
    const ana = await api.createUser({ username: "ana", permissions: ["willdoo.use", "notifications.read"] });
    const beto = await api.createUser({ username: "beto", permissions: ["notifications.read"] });
    const now = new Date();
    await api.c.notifications.insertMany([
      { _id: new ObjectId(), userId: new ObjectId(ana.id), type: "info", title: "Aviso de Ana", body: "", readAt: null, createdAt: now },
      { _id: new ObjectId(), userId: new ObjectId(beto.id), type: "info", title: "Secreto de Beto", body: "", readAt: null, createdAt: now }
    ]);
    void admin;

    const response = await ask(api, await ana.cookie(), { text: "¿Quién es Beto y qué avisos tengo?" });
    expect(response.statusCode).toBe(200);

    expect(fake.requests[0]!.tools.map((tool) => tool.name)).toEqual(["mis_notificaciones"]);
    const results = fake.requests[1]!.messages.at(-1)!.content as Array<{ tool_use_id: string; content: string; is_error?: boolean }>;
    expect(results[0]).toMatchObject({ tool_use_id: "t1", is_error: true });
    expect(JSON.parse(results[0]!.content)).toEqual({ error: "herramienta_no_disponible" });
    expect(results[1]!.content).toContain("Aviso de Ana");

    // Nothing of another user, nor any credential, ever reaches Claude.
    const sent = JSON.stringify(fake.requests);
    expect(sent).not.toContain("Secreto de Beto");
    expect(sent).not.toContain("passwordHash");
    expect(sent).not.toMatch(/scrypt\$/);
    expect((await api.c.auditLogs.findOne({ action: "willdoo.ask" }))?.metadata).toMatchObject({
      herramientas: [
        { nombre: "buscar_usuarios", ok: false },
        { nombre: "mis_notificaciones", ok: true }
      ]
    });
  });

  it("un administrador recibe todas sus herramientas; la entrada inválida no consulta datos", async () => {
    const { api, fake } = await setup((_request, call) =>
      call === 0 ? { content: [toolUse("t1", "buscar_usuarios", { limite: 9999 })], stop: "tool_use" } : answer("ok")
    );
    const cookie = await api.adminCookie();
    await ask(api, cookie, { text: "Lista usuarios" });
    // Monday is not configured: its tool is not offered.
    expect(fake.requests[0]!.tools.map((tool) => tool.name)).toEqual(["buscar_usuarios", "consultar_auditoria", "indicadores", "listar_roles", "mis_notificaciones"]);
    const results = fake.requests[1]!.messages.at(-1)!.content as Array<{ content: string; is_error?: boolean }>;
    expect(results[0]!.is_error).toBe(true);
    expect(JSON.parse(results[0]!.content).error).toBe("entrada_invalida");
  });

  it("la conversación sigue en orden y sin editar lo anterior (append-only)", async () => {
    const { api, fake } = await setup(() => answer("Respuesta"));
    const cookie = await api.adminCookie();
    const first = events((await ask(api, cookie, { text: "Primera" })).body).at(-1) as { conversationId: string };
    const second = await ask(api, cookie, { text: "Segunda", conversationId: first.conversationId });
    expect(events(second.body).at(-1)).toMatchObject({ type: "done", conversationId: first.conversationId });

    const before = fake.requests[0]!.messages;
    const after = fake.requests[1]!.messages;
    expect(after.slice(0, before.length)).toEqual(before);
    expect(after).toHaveLength(before.length + 2);

    const detail = await api.request("GET", `/api/willdoo/conversations/${first.conversationId}`, { cookie });
    expect(detail.json().turns.map((turn: { text: string }) => turn.text)).toEqual(["Primera", "Respuesta", "Segunda", "Respuesta"]);
    expect((await api.request("GET", "/api/willdoo/conversations", { cookie })).json().items).toHaveLength(1);
  });

  it("cada usuario ve solo sus conversaciones; willdoo.audit puede revisarlas; borrar queda auditado", async () => {
    const { api } = await setup(() => answer("Hola"));
    const ana = await api.createUser({ username: "ana", permissions: ["willdoo.use"] });
    const beto = await api.createUser({ username: "beto", permissions: ["willdoo.use"] });
    const auditor = await api.createUser({ username: "auditor", permissions: ["willdoo.use", "willdoo.audit"] });
    const anaCookie = await ana.cookie();
    const id = (events((await ask(api, anaCookie, { text: "Mío" })).body).at(-1) as { conversationId: string }).conversationId;

    const betoCookie = await beto.cookie();
    expect((await api.request("GET", `/api/willdoo/conversations/${id}`, { cookie: betoCookie })).statusCode).toBe(404);
    expect((await ask(api, betoCookie, { text: "Intruso", conversationId: id })).statusCode).toBe(404);
    expect((await api.request("DELETE", `/api/willdoo/conversations/${id}`, { cookie: betoCookie })).statusCode).toBe(404);
    expect((await api.request("GET", `/api/willdoo/conversations?userId=${ana.id}`, { cookie: betoCookie })).statusCode).toBe(403);

    const auditorCookie = await auditor.cookie();
    expect((await api.request("GET", `/api/willdoo/conversations/${id}`, { cookie: auditorCookie })).statusCode).toBe(200);
    expect((await api.request("GET", `/api/willdoo/conversations?userId=${ana.id}`, { cookie: auditorCookie })).json().items).toHaveLength(1);
    const usage = (await api.request("GET", "/api/willdoo/usage", { cookie: auditorCookie })).json();
    expect(usage).toMatchObject({ budgetUsd: 50, listPrice: true, byUser: [{ username: "ana", answers: 1 }] });
    expect((await api.request("GET", "/api/willdoo/usage", { cookie: anaCookie })).statusCode).toBe(403);

    expect((await api.request("DELETE", `/api/willdoo/conversations/${id}`, { cookie: anaCookie })).statusCode).toBe(200);
    expect(await api.c.willdooConversations.countDocuments()).toBe(0);
    expect(await api.c.auditLogs.countDocuments({ action: "willdoo.conversation.delete" })).toBe(1);
  });

  it("presupuesto del mes agotado y límite diario por usuario: 429 antes de llamar a Claude", async () => {
    const { api, fake } = await setup(() => answer("Hola"), { monthlyBudgetUsd: 1, userDailyMessages: 1 });
    const cookie = await api.adminCookie();
    expect((await ask(api, cookie, { text: "Una" })).statusCode).toBe(200);
    const daily = await ask(api, cookie, { text: "Dos" });
    expect(daily.statusCode).toBe(429);
    expect(daily.json().error).toBe("willdoo_daily_limit");

    await api.c.willdooUsage.insertOne({
      _id: new ObjectId(),
      userId: new ObjectId(),
      conversationId: new ObjectId(),
      model: "claude-sonnet-5-5",
      usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      costMicros: 1_000_000,
      toolCalls: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86_400_000)
    });
    const budget = await ask(api, cookie, { text: "Tres" });
    expect(budget.statusCode).toBe(429);
    expect(budget.json().error).toBe("willdoo_budget_exhausted");
    expect(fake.requests).toHaveLength(1);
  });

  it("como máximo MAX_ROUNDS llamadas: la última sin herramientas, para que siempre conteste", async () => {
    let n = 0;
    const { api, fake } = await setup((request) =>
      request.toolChoice?.type === "none" ? answer("Con lo que tengo…") : { content: [toolUse(`t${++n}`, "listar_roles")], stop: "tool_use" }
    );
    const cookie = await api.adminCookie();
    const stream = events((await ask(api, cookie, { text: "Bucle" })).body);
    expect(fake.requests).toHaveLength(MAX_ROUNDS);
    expect(fake.requests.at(-1)!.toolChoice).toEqual({ type: "none" });
    expect(stream.at(-1)).toMatchObject({ type: "done", turn: { text: "Con lo que tengo…" } });
  });

  it("si Claude falla: error genérico, no guarda el turno y nada filtra la clave", async () => {
    const { api } = await setup(() => {
      throw new IntegrationError("auth_failed", "anthropic: 401");
    });
    const cookie = await api.adminCookie();
    const stream = events((await ask(api, cookie, { text: "Hola" })).body);
    expect(stream.at(-1)).toMatchObject({ type: "error", error: "willdoo_auth_failed" });
    expect(await api.c.willdooConversations.countDocuments()).toBe(0);
    // The spend so far is still recorded.
    expect(await api.c.willdooUsage.countDocuments()).toBe(1);
    expect(api.logs.text()).not.toContain(FAKE_ANTHROPIC_KEY);
    expect(api.bodies.join("\n")).not.toContain(FAKE_ANTHROPIC_KEY);
  });

  it("valida la entrada: texto vacío, campos extra y pantallas sin ruta", async () => {
    const { api } = await setup(() => answer("Hola"));
    const cookie = await api.adminCookie();
    expect((await ask(api, cookie, { text: "   " })).statusCode).toBe(400);
    expect((await ask(api, cookie, { text: "Hola", extra: 1 })).statusCode).toBe(400);
    expect((await ask(api, cookie, { text: "Hola", screen: { path: "javascript:alert(1)" } })).statusCode).toBe(400);
    expect((await ask(api, cookie, { text: "x".repeat(4001) })).statusCode).toBe(400);
  });
});

describe("herramientas de Will Doo", () => {
  it("cada herramienta declara permiso y un esquema de objeto", () => {
    for (const tool of BUILT_IN_TOOLS) {
      expect(tool.permission, tool.name).not.toBeNull();
      const definition = toolDefinition(tool);
      expect(definition.input_schema.type).toBe("object");
      expect(JSON.stringify(definition)).not.toContain("$schema");
    }
  });
});
