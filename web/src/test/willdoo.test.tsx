import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Markdown } from "../components/willdoo/Markdown";
import { META, mockApi, renderApp, session } from "./utils";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/** JSON routes plus /api/willdoo/messages answering with an NDJSON stream. */
function mockWithWillDoo(permissions: string[], stream: (body: Record<string, unknown>) => Response) {
  const asks: Array<Record<string, unknown>> = [];
  const { fetchMock } = mockApi({
    "GET /api/meta": META,
    "GET /api/auth/me": session(permissions, {}, ["willdoo", "willdoo-ai"]),
    "GET /api/dashboard": { status: 403, body: { error: "forbidden" } },
    "GET /api/willdoo/conversations": { items: [{ id: "c1", title: "Usuarios inactivos", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z" }] }
  });
  const jsonFetch = fetchMock.getMockImplementation()!;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "/api/willdoo/messages") {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        asks.push(body);
        return stream(body);
      }
      return jsonFetch(input, init);
    })
  );
  return { asks };
}

const ndjson = (events: unknown[]) =>
  new Response(events.map((event) => JSON.stringify(event)).join("\n") + "\n", { headers: { "content-type": "application/x-ndjson" } });

describe("Will Doo", () => {
  it("no aparece si el backend no activa el feature", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(["willdoo.use"]) });
    renderApp("/panel");
    await screen.findByRole("complementary", { name: "Navegación principal" });
    expect(screen.queryByRole("button", { name: "Abrir Will Doo" })).not.toBeInTheDocument();
  });

  it("sugiere preguntas según los permisos, envía la pantalla y muestra la respuesta en streaming", async () => {
    const user = userEvent.setup();
    const { asks } = mockWithWillDoo(["willdoo.use", "users.read"], () =>
      ndjson([
        { type: "start", conversationId: "c9" },
        { type: "tool", name: "buscar_usuarios", label: "Consultando usuarios" },
        { type: "text", delta: "Hay **2** desactivados. " },
        { type: "text", delta: "[Ver usuarios](/usuarios)" },
        { type: "done", conversationId: "c9", turn: { role: "assistant", text: "Hay **2** desactivados. [Ver usuarios](/usuarios)", tools: ["Consultando usuarios"], at: "2026-10-28T00:00:00Z" } }
      ])
    );
    renderApp("/usuarios");

    await user.click(await screen.findByRole("button", { name: "Abrir Will Doo" }));
    const dialog = screen.getByRole("dialog", { name: "Will Doo" });
    expect(dialog).toHaveTextContent("Hola, Ana");
    // Suggestions only for what the user can see (no dashboard or audit here).
    expect(screen.getByRole("button", { name: "¿Qué usuarios están desactivados o bloqueados?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "¿Hubo ingresos fallidos hoy?" })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Pregunta para Will Doo"), "¿Quién está desactivado?{Enter}");

    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver usuarios" })).toHaveAttribute("href", "/usuarios");
    expect(screen.getByText("Consultó: usuarios")).toBeInTheDocument();
    expect(asks[0]).toMatchObject({ text: "¿Quién está desactivado?", screen: { path: "/usuarios" } });
    expect(asks[0]).not.toHaveProperty("conversationId");

    // The follow-up continues the same conversation.
    await user.type(screen.getByLabelText("Pregunta para Will Doo"), "¿Y bloqueados?{Enter}");
    await waitFor(() => expect(asks).toHaveLength(2));
    expect(asks[1]).toMatchObject({ conversationId: "c9" });
  });

  it("muestra el mensaje del servidor si no puede responder (presupuesto, límites)", async () => {
    const user = userEvent.setup();
    mockWithWillDoo(["willdoo.use"], () =>
      Response.json({ error: "willdoo_budget_exhausted", message: "Will Doo alcanzó el presupuesto de este mes." }, { status: 429 })
    );
    renderApp("/panel");
    await user.click(await screen.findByRole("button", { name: "Abrir Will Doo" }));
    await user.click(screen.getByRole("button", { name: "¿Cómo cambio mi contraseña?" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Will Doo alcanzó el presupuesto de este mes.");
  });

  it("muestra el historial de conversaciones", async () => {
    const user = userEvent.setup();
    mockWithWillDoo(["willdoo.use"], () => ndjson([]));
    renderApp("/panel");
    await user.click(await screen.findByRole("button", { name: "Abrir Will Doo" }));
    await user.click(screen.getByRole("button", { name: "Conversaciones anteriores" }));
    expect(await screen.findByText("Usuarios inactivos")).toBeInTheDocument();
  });
});

describe("Will Doo solo (sin IA)", () => {
  const QUICK = {
    mode: "basic",
    items: [
      { id: "usuarios-desactivados", label: "Usuarios desactivados", description: "", question: "¿Qué usuarios están desactivados?", group: "Equipo" },
      { id: "roles", label: "Roles", description: "", question: "¿Qué roles hay?", group: "Equipo" },
      { id: "mis-notificaciones", label: "Mis notificaciones", description: "", question: "¿Tengo notificaciones sin leer?", group: "Mis avisos" }
    ]
  };
  const RESULT = {
    id: "usuarios-desactivados",
    label: "Usuarios desactivados",
    question: "¿Qué usuarios están desactivados?",
    summary: "1 usuario",
    items: [{ title: "Beto", subtitle: "@beto", meta: "desactivado · sin rol", link: "/usuarios" }, { title: "Malo", link: "javascript:alert(1)" }],
    link: "/usuarios",
    at: "2026-10-28T12:00:00Z"
  };
  const NEXT = [
    { id: "roles", label: "Roles", question: "¿Qué roles hay?" },
    { id: "mis-notificaciones", label: "Mis notificaciones", question: "¿Tengo notificaciones sin leer?" },
    { id: "usuarios-recientes", label: "Recientes", question: "¿Quiénes son los usuarios más recientes?" }
  ];

  function mockBasic(basic: (body: unknown) => unknown) {
    return mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["willdoo.use", "users.read"], {}, ["willdoo"]),
      "GET /api/dashboard": { status: 403, body: { error: "forbidden" } },
      "GET /api/willdoo/quick": QUICK,
      "POST /api/willdoo/quick/usuarios-desactivados": { ...RESULT, suggestions: NEXT },
      "POST /api/willdoo/quick/roles": { ...RESULT, id: "roles", label: "Roles", question: "¿Qué roles hay?", summary: "3 roles", items: [], suggestions: NEXT.slice(1) },
      "POST /api/willdoo/basic": (body: unknown) => ({ body: basic(body) }),
      "GET /api/willdoo/guide": { guide: "## Secciones de la app\n- **Usuarios** (/usuarios): cuentas." }
    });
  }

  it("ruta de preguntas por tema; al responder sugiere 3 continuaciones", async () => {
    const user = userEvent.setup();
    const { calls } = mockBasic(() => ({}));
    renderApp("/panel");

    await user.click(await screen.findByRole("button", { name: "Abrir Will Doo" }));
    expect(await screen.findByText("Equipo")).toBeInTheDocument();
    expect(screen.getByText("Mis avisos")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "¿Qué usuarios están desactivados?" }));

    expect(await screen.findByText("1 usuario")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Beto/ })).toHaveAttribute("href", "/usuarios");
    expect(screen.queryByRole("link", { name: /Malo/ })).not.toBeInTheDocument();
    expect(screen.getByText("Sigue con")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "¿Quiénes son los usuarios más recientes?" })).toBeInTheDocument();
    expect(calls.find((call) => call.method === "POST")?.body).toMatchObject({ timeZone: expect.any(String) });

    // A follow-up continues the conversation; only the latest answer shows suggestions.
    await user.click(screen.getByRole("button", { name: "¿Qué roles hay?" }));
    expect(await screen.findByText("3 roles")).toBeInTheDocument();
    expect(screen.getAllByText("Sigue con")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "¿Qué roles hay?" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Cómo se usa/ }));
    expect(await screen.findByText("Secciones de la app")).toBeInTheDocument();
  });

  it("chat sin IA: envía el texto y muestra la respuesta general con sugerencias", async () => {
    const user = userEvent.setup();
    const asked: unknown[] = [];
    mockBasic((body) => {
      asked.push(body);
      return {
        kind: "analytics",
        message: "Sin la conexión con Claude no hago pronósticos. Te muestro los datos que hay hoy.",
        result: RESULT,
        suggestions: NEXT
      };
    });
    renderApp("/panel");
    await user.click(await screen.findByRole("button", { name: "Abrir Will Doo" }));
    await user.type(await screen.findByLabelText("Pregunta para Will Doo"), "¿Cuántos desactivados habrá el mes que viene?{Enter}");

    expect(await screen.findByText(/no hago pronósticos/)).toBeInTheDocument();
    expect(screen.getByText("1 usuario")).toBeInTheDocument();
    expect(asked[0]).toMatchObject({ text: "¿Cuántos desactivados habrá el mes que viene?", timeZone: expect.any(String), screen: { path: "/panel" } });
    expect(screen.getByRole("button", { name: "¿Tengo notificaciones sin leer?" })).toBeInTheDocument();
  });

  it("una pregunta con dos temas muestra los datos de ambos", async () => {
    const user = userEvent.setup();
    mockBasic(() => ({
      kind: "answer",
      message: "Esto es lo que hay en el sistema:",
      result: RESULT,
      more: [{ ...RESULT, id: "roles", label: "Roles", question: "¿Qué roles hay?", summary: "3 roles", items: [] }],
      suggestions: NEXT.slice(1)
    }));
    renderApp("/panel");
    await user.click(await screen.findByRole("button", { name: "Abrir Will Doo" }));
    await user.type(await screen.findByLabelText("Pregunta para Will Doo"), "desactivados y roles{Enter}");

    expect(await screen.findByText("1 usuario")).toBeInTheDocument();
    expect(screen.getByText("3 roles")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Actualizar consulta" })).toHaveLength(2);
  });

  it("«Sin Will Doo»: sin el feature no aparece el botón", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(["willdoo.use"]), "GET /api/dashboard": { status: 403, body: { error: "forbidden" } } });
    renderApp("/panel");
    await screen.findByRole("complementary", { name: "Navegación principal" });
    expect(screen.queryByRole("button", { name: "Abrir Will Doo" })).not.toBeInTheDocument();
  });
});

describe("Markdown de Will", () => {
  function renderText(text: string) {
    render(
      <MemoryRouter>
        <Markdown text={text} />
      </MemoryRouter>
    );
  }

  it("solo enlaza rutas de la app y monday.com; el resto queda como texto", () => {
    renderText(
      "[interno](/usuarios) [monday](https://acme.monday.com/boards/1) [malo](javascript:alert(1)) [fuera](https://evil.example/x) [protocolo](//evil.example)"
    );
    expect(screen.getByRole("link", { name: "interno" })).toHaveAttribute("href", "/usuarios");
    expect(screen.getByRole("link", { name: "monday" })).toHaveAttribute("rel", "noopener noreferrer");
    for (const name of ["malo", "fuera", "protocolo"]) {
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
      expect(screen.getByText(name, { exact: false })).toBeInTheDocument();
    }
  });

  it("listas, negritas y nunca HTML", () => {
    renderText("Resumen:\n- **uno**\n- dos\n\n<img src=x onerror=alert(1)>");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("uno").tagName).toBe("STRONG");
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });
});
