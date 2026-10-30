import { ObjectId } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COPY, followUps, normalize, understand } from "../src/modules/willdoo/basic-chat.js";
import { BUILT_IN_QUICK_QUERIES } from "../src/modules/willdoo/quick.js";
import { setupApi, type Api } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

const ALL = BUILT_IN_QUICK_QUERIES;
const byId = (id: string) => ALL.find((query) => query.id === id)!;

describe("chat de «Will Doo solo» (sin IA)", () => {
  it("cada consulta tiene pregunta, tema, palabras clave y continuaciones válidas", () => {
    const ids = new Set(ALL.map((query) => query.id));
    for (const query of ALL) {
      expect(query.question, query.id).toMatch(/^¿.+\?$/);
      expect(query.group, query.id).toBeTruthy();
      expect(query.keywords.length, query.id).toBeGreaterThan(2);
      expect(query.next.length, query.id).toBeLessThanOrEqual(3);
      for (const next of query.next) {
        expect(ids.has(next), `${query.id} → ${next}`).toBe(true);
        expect(next).not.toBe(query.id);
      }
    }
  });

  it("entiende preguntas escritas con sus palabras (acentos, plurales, mayúsculas)", () => {
    const cases: Array<[string, string]> = [
      ["¿Quiénes están DESACTIVADOS?", "usuarios-desactivados"],
      ["usuario desactivada", "usuarios-desactivados"],
      ["¿hubo intentos fallidos hoy?", "ingresos-fallidos-hoy"],
      ["tengo notificaciones pendientes", "mis-notificaciones"],
      ["cuántas personas tiene cada rol", "roles"],
      ["muéstrame los usuarios nuevos", "usuarios-recientes"],
      ["which users are disabled", "usuarios-desactivados"]
    ];
    for (const [question, id] of cases) {
      const intent = understand(question, ALL);
      expect(intent.kind, question).toBe("answer");
      expect(intent.kind === "answer" && intent.query.id, question).toBe(id);
    }
  });

  it("pronósticos y análisis: lo dice y muestra los datos relacionados (o una respuesta general)", () => {
    const related = understand("¿Cuál es el pronóstico de usuarios desactivados para el próximo mes?", ALL);
    expect(related).toMatchObject({ kind: "analytics", query: { id: "usuarios-desactivados" } });
    expect(related.message).toContain("Will Doo + Claude");
    const general = understand("predice las ventas del año", ALL);
    expect(general).toMatchObject({ kind: "analytics", query: null });
    // A loose word that only appears in the labels («usuarios») is not a related topic.
    expect(understand("predice cuántos usuarios habrá", ALL)).toMatchObject({ kind: "analytics", query: null });
  });

  it("responde lo que puede: cada tema de la pregunta, o lo más cercano que hay", () => {
    // Two topics in one question: both answered, neither suggested again.
    const both = understand("¿qué usuarios están desactivados y tengo notificaciones?", ALL);
    expect(both).toMatchObject({ kind: "answer", partial: false, query: { id: "usuarios-desactivados" }, more: [{ id: "mis-notificaciones" }] });
    // A second query that only repeats the same words is not another topic.
    expect(understand("usuarios desactivados", ALL)).toMatchObject({ kind: "answer", partial: false, more: [] });
    expect(understand("roles y usuarios nuevos", ALL)).toMatchObject({ kind: "answer", query: { id: "usuarios-recientes" }, more: [{ id: "roles" }] });
    // Only for queries the user may run.
    expect(understand("¿qué usuarios están desactivados y tengo notificaciones?", [byId("mis-notificaciones")])).toMatchObject({ query: { id: "mis-notificaciones" }, more: [] });
  });

  it("«cómo…» responde con la guía; lo que no reconoce da una respuesta general", () => {
    const howTo = understand("¿Cómo cambio mi contraseña?", ALL);
    expect(howTo.kind).toBe("guide");
    expect(howTo.kind === "guide" && howTo.lines.join(" ")).toContain("contraseña");
    expect(understand("hola qué tal el clima", ALL).kind).toBe("none");
    expect(understand("   ¿?  ", ALL).kind).toBe("none");
    // One loose word is too weak to pick data: it answers with the guide…
    const loose = understand("usuarios", ALL);
    expect(loose.kind).toBe("guide");
    expect(loose.kind === "guide" && loose.lines[0]).toContain("Usuarios");
    // …but on the Usuarios screen it answers with the closest data and suggests the other candidate first.
    const onUsers = understand("usuarios", ALL, undefined, "/usuarios");
    expect(onUsers).toMatchObject({ kind: "answer", partial: true, message: COPY.partial });
    const shown = onUsers.kind === "answer" ? [onUsers.query, ...onUsers.alternatives].map((query) => query.id).sort() : [];
    expect(shown).toEqual(["usuarios-desactivados", "usuarios-recientes"]);
  });

  it("solo elige consultas permitidas", () => {
    const onlyNotifications = [byId("mis-notificaciones")];
    const intent = understand("¿qué usuarios están desactivados?", onlyNotifications);
    expect(intent.kind).not.toBe("answer");
    expect(JSON.stringify(intent)).not.toContain("usuarios-desactivados");
  });

  it("continuaciones: 3, primero las suyas, sin repetirse ni salirse de lo permitido", () => {
    const next = followUps(byId("usuarios-desactivados"), ALL).map((query) => query.id);
    expect(next).toEqual(["usuarios-recientes", "roles", "ingresos-fallidos-hoy"]);
    const limited = followUps(byId("usuarios-desactivados"), [byId("usuarios-desactivados"), byId("mis-notificaciones")]).map((query) => query.id);
    expect(limited).toEqual(["mis-notificaciones"]);
    expect(normalize("¿Qué ÚSUARIOS?")).toBe("que usuarios");
    // With nothing to follow, the open screen's queries come first.
    expect(followUps(null, ALL, 3, "/roles")[0]!.id).toBe("roles");
    expect(followUps(null, ALL, 3, "/panel")[0]!.id).toBe("indicadores-semana");
    // Other candidates first; what is already shown is never suggested.
    const withFirst = followUps(byId("usuarios-desactivados"), ALL, 3, undefined, { first: [byId("mis-notificaciones")], skip: [byId("usuarios-recientes")] });
    expect(withFirst.map((query) => query.id)).toEqual(["mis-notificaciones", "roles", "ingresos-fallidos-hoy"]);
  });
});

describe.skipIf(skipDb)("API del chat sin IA", () => {
  let mongo: TestMongo;
  beforeAll(async () => {
    mongo = await startMongo();
  });
  afterAll(async () => {
    await mongo?.stop();
  });

  const ask = (api: Api, cookie: string, text: string) => api.request("POST", "/api/willdoo/basic", { cookie, body: { text, timeZone: "America/Lima" } });

  it("responde con datos de la base, sugiere 3 continuaciones y lo audita", async () => {
    const api = await setupApi(mongo);
    const cookie = await api.adminCookie();
    await api.createUser({ username: "inactivo" });
    await api.c.users.updateOne({ username: "inactivo" }, { $set: { status: "disabled" } });

    const response = await ask(api, cookie, "¿Quiénes están desactivados?");
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toMatchObject({ kind: "answer", result: { id: "usuarios-desactivados", summary: "1 usuario", question: "¿Qué usuarios están desactivados?" } });
    expect(body.suggestions.map((s: { id: string }) => s.id)).toEqual(["usuarios-recientes", "roles", "ingresos-fallidos-hoy"]);
    expect(body.suggestions[0].question).toMatch(/^¿/);
    expect(await api.c.auditLogs.findOne({ action: "willdoo.basic" })).toMatchObject({
      entityId: "usuarios-desactivados",
      metadata: { pregunta: "¿Quiénes están desactivados?", tipo: "answer", consulta: "usuarios-desactivados" }
    });

    // Two topics in one question: both answered, and neither among the suggestions.
    const both = (await ask(api, cookie, "¿qué usuarios están desactivados y quién tiene cada rol?")).json();
    const shown = [both.result.id, ...both.more.map((r: { id: string }) => r.id)];
    expect(both.kind).toBe("answer");
    expect(shown.sort()).toEqual(["roles", "usuarios-desactivados"]);
    expect(both.partial).toBeUndefined();
    expect(both.suggestions.map((s: { id: string }) => s.id)).not.toContain("roles");
    expect(both.suggestions.map((s: { id: string }) => s.id)).not.toContain("usuarios-desactivados");
    const audit = await api.c.auditLogs.findOne({ action: "willdoo.basic", "metadata.consultas": "roles" });
    expect((audit?.metadata as { consultas: string[] }).consultas.sort()).toEqual(["roles", "usuarios-desactivados"]);

    // The quick query itself also returns its follow-ups.
    const quick = (await api.request("POST", "/api/willdoo/quick/roles", { cookie, body: {} })).json();
    expect(quick.suggestions).toHaveLength(3);
    expect(quick.suggestions.map((s: { id: string }) => s.id)).not.toContain("roles");

    const list = (await api.request("GET", "/api/willdoo/quick", { cookie })).json();
    expect(list.items[0]).toMatchObject({ id: "indicadores-semana", question: "¿Cómo va la actividad de esta semana?", group: "Actividad" });
  });

  it("pronósticos: respuesta general con los datos que hay; guía y sin coincidencias, con sugerencias", async () => {
    const api = await setupApi(mongo);
    const cookie = await api.adminCookie();
    const forecast = (await ask(api, cookie, "¿Cuál es la tendencia de ingresos fallidos?")).json();
    expect(forecast).toMatchObject({ kind: "analytics", result: { id: "ingresos-fallidos-hoy" } });
    expect(forecast.message).toContain("Will Doo + Claude");
    expect(forecast.suggestions).toHaveLength(3);

    const guide = (await ask(api, cookie, "¿Cómo creo un usuario?")).json();
    expect(guide.kind).toBe("guide");
    expect(guide.guide.join(" ")).toContain("Nuevo usuario");

    const none = (await ask(api, cookie, "hola, ¿qué tal el clima?")).json();
    expect(none).toMatchObject({ kind: "none" });
    expect(none.suggestions).toHaveLength(3);
    expect(none.result).toBeUndefined();
  });

  it("una consulta con `parse` toma su entrada de la pregunta escrita; si no encuentra nada, usa la fija", async () => {
    const recent = byId("usuarios-recientes");
    // Example of a project query: «¿quién es @ana?» searches that user.
    const lookup = { ...recent, keywords: [...recent.keywords, "quien es"], parse: (question: string) => (/@(\w+)/.exec(question) ? { texto: /@(\w+)/.exec(question)![1], limite: 10 } : null) };
    const api = await setupApi(mongo, { willdoo: { quickQueries: ALL.map((query) => (query.id === recent.id ? lookup : query)) } });
    const cookie = await api.adminCookie();
    await api.createUser({ username: "ana" });
    await api.createUser({ username: "beto" });

    const one = (await ask(api, cookie, "¿quién es @ana? usuarios nuevos")).json();
    expect(one.result).toMatchObject({ id: "usuarios-recientes", summary: "1 usuario" });
    const all = (await ask(api, cookie, "usuarios nuevos")).json();
    expect(all.result.summary).toBe("3 usuarios");
    // A click on the roadmap never reads text: the fixed input.
    expect((await api.request("POST", "/api/willdoo/quick/usuarios-recientes", { cookie, body: {} })).json().summary).toBe("3 usuarios");
  });

  it("con los permisos del usuario: nunca responde con una consulta que no puede ver", async () => {
    const api = await setupApi(mongo);
    const ana = await api.createUser({ username: "ana", permissions: ["willdoo.use", "notifications.read"] });
    await api.c.notifications.insertOne({ _id: new ObjectId(), userId: new ObjectId(ana.id), type: "info", title: "Aviso", body: "", readAt: null, createdAt: new Date() });
    const cookie = await ana.cookie();
    const body = (await ask(api, cookie, "¿Qué usuarios están desactivados?")).json();
    expect(body.kind).not.toBe("answer");
    expect(body.result).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("usuarios-desactivados");
    expect((await ask(api, cookie, "¿tengo notificaciones?")).json()).toMatchObject({ kind: "answer", result: { id: "mis-notificaciones", summary: "1 notificación sin leer" } });
  });

  it("valida la entrada y respeta el modo apagado", async () => {
    const api = await setupApi(mongo);
    const cookie = await api.adminCookie();
    expect((await ask(api, cookie, "  ")).statusCode).toBe(400);
    expect((await ask(api, cookie, "x".repeat(501))).statusCode).toBe(400);
    const off = await setupApi(mongo, { settings: { willdoo: { mode: "off", model: "claude-sonnet-5-5", monthlyBudgetUsd: 50, userDailyMessages: 100, retentionDays: 90 } } });
    expect((await ask(off, await off.adminCookie(), "roles")).statusCode).toBe(404);
  });
});
