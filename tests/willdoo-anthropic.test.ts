import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/env.js";
import { createAnthropicClient } from "../src/integrations/anthropic/client.js";
import { IntegrationError } from "../src/integrations/errors.js";
import { createIntegrations } from "../src/integrations/service.js";
import { anthropicModel } from "../src/modules/willdoo/model.js";
import { systemPrompt } from "../src/modules/willdoo/prompt.js";
import { baseEnv } from "./helpers.js";

const FAKE_KEY = "sk-ant-fakefakefakefake";

interface Call {
  url: string;
  headers: Headers;
  body: Record<string, unknown> | null;
}

/** Records requests to Anthropic and answers with `respond` (no network). */
function fakeAnthropic(respond: (call: Call) => Response) {
  const calls: Call[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const call = { url: String(input), headers: new Headers(init.headers), body: init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null };
    calls.push(call);
    return respond(call);
  }) as typeof fetch;
  return { fetch: fetchImpl, calls };
}

/** A streamed message as Server-Sent Events, the way the Messages API sends it. */
function sse(events: Array<[string, unknown]>) {
  const text = events.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join("");
  return new Response(text, { status: 200, headers: { "content-type": "text/event-stream" } });
}

describe("conexión con Anthropic (prueba de la integración)", () => {
  it("valida la clave contra el modelo configurado, con la clave solo en su cabecera", async () => {
    const fake = fakeAnthropic(() => Response.json({ type: "model", id: "claude-sonnet-5-5", display_name: "Claude Sonnet 5.5", created_at: "2026-01-01T00:00:00Z" }));
    const integrations = createIntegrations({ ANTHROPIC_API_KEY: FAKE_KEY, WILL_DOO_MODEL: "claude-sonnet-5-5" }, { fetch: fake.fetch });
    expect(integrations.isConfigured("anthropic")).toBe(true);
    expect(integrations.features(new Set(["willdoo.use"]))).toEqual(["willdoo-ai"]);
    expect(integrations.features(new Set())).toEqual([]);
    expect(fake.calls).toHaveLength(0); // lazy

    await integrations.test("anthropic");
    expect(fake.calls[0]!.url).toBe("https://api.anthropic.com/v1/models/claude-sonnet-5-5");
    expect(fake.calls[0]!.headers.get("x-api-key")).toBe(FAKE_KEY);
    expect(fake.calls[0]!.url).not.toContain(FAKE_KEY);
  });

  it("clave rechazada → auth_failed, sin el mensaje del proveedor", async () => {
    const fake = fakeAnthropic(() => Response.json({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key: secret detail" } }, { status: 401 }));
    const integrations = createIntegrations({ ANTHROPIC_API_KEY: FAKE_KEY }, { fetch: fake.fetch });
    const error = await integrations.test("anthropic").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(IntegrationError);
    expect((error as IntegrationError).code).toBe("auth_failed");
    expect((error as IntegrationError).detail).not.toContain("secret detail");
  });
});

describe("llamada a Claude (SDK oficial, streaming)", () => {
  it("envía modelo, caché, fallback, effort y herramientas; transmite el texto y devuelve el mensaje", async () => {
    const fake = fakeAnthropic(() =>
      sse([
        ["message_start", { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant", model: "claude-sonnet-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } }],
        ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "", citations: null } }],
        ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Hola, " } }],
        ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "soy Will." } }],
        ["content_block_stop", { type: "content_block_stop", index: 0 }],
        ["message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 5 } }],
        ["message_stop", { type: "message_stop" }]
      ])
    );
    const model = anthropicModel(createAnthropicClient({ apiKey: FAKE_KEY, fetch: fake.fetch }), "claude-sonnet-5-5");
    const deltas: string[] = [];
    const message = await model.respond(
      { system: systemPrompt("Demo"), tools: [{ name: "listar_roles", description: "Roles", input_schema: { type: "object", properties: {} } }], messages: [{ role: "user", content: "Hola" }] },
      (delta) => deltas.push(delta),
      new AbortController().signal
    );

    expect(deltas.join("")).toBe("Hola, soy Will.");
    expect(message.stop_reason).toBe("end_turn");
    expect(message.content).toEqual([{ type: "text", text: "Hola, soy Will.", citations: null }]);

    const call = fake.calls[0]!;
    expect(call.url).toBe("https://api.anthropic.com/v1/messages?beta=true");
    expect(call.headers.get("anthropic-beta")).toContain("server-side-fallback-2026-07-01");
    expect(call.body).toMatchObject({
      model: "claude-sonnet-5-5",
      stream: true,
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      cache_control: { type: "ephemeral" }
    });
    expect((call.body!.system as Array<{ cache_control: unknown }>)[0]!.cache_control).toEqual({ type: "ephemeral" });
    expect(call.body).not.toHaveProperty("tool_choice");
  });
});

describe("configuración de Will Doo", () => {
  it("la clave es opcional, sin espacios y nunca se repite en el error", () => {
    const config = loadConfig(baseEnv());
    expect(config.ANTHROPIC_API_KEY).toBeUndefined();
    expect(config).toMatchObject({ WILL_DOO_MODEL: "claude-sonnet-5-5", WILL_DOO_MONTHLY_BUDGET_USD: 50, WILL_DOO_USER_DAILY_MESSAGES: 100, WILL_DOO_RETENTION_DAYS: 90 });
    expect(() => loadConfig(baseEnv({ ANTHROPIC_API_KEY: "sk ant leaky" }))).toThrow(/ANTHROPIC_API_KEY must not contain whitespace/);
    try {
      loadConfig(baseEnv({ ANTHROPIC_API_KEY: "sk ant leaky" }));
    } catch (error) {
      expect(String(error)).not.toContain("leaky");
    }
    expect(() => loadConfig(baseEnv({ WILL_DOO_MODEL: "gpt-5" }))).toThrow(/WILL_DOO_MODEL/);
    expect(loadConfig(baseEnv({ WILL_DOO_RETENTION_DAYS: "30" })).WILL_DOO_RETENTION_DAYS).toBe(30);
    expect(config.WILL_DOO_MODE).toBe("basic");
    expect(loadConfig(baseEnv({ WILL_DOO_MODE: "off" })).WILL_DOO_MODE).toBe("off");
    expect(() => loadConfig(baseEnv({ WILL_DOO_MODE: "full" }))).toThrow(/WILL_DOO_MODE must be one of off, basic, claude/);
  });
});
