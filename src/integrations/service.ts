import type Anthropic from "@anthropic-ai/sdk";
import { createAnthropicClient, testAnthropicConnection } from "./anthropic/client.js";
import { IntegrationError } from "./errors.js";
import { MondayClient } from "./monday/client.js";
import { PROVIDERS, findProvider, getIntegrationStatus, type IntegrationStatus } from "./registry.js";

export interface IntegrationsConfig {
  MONDAY_API_TOKEN?: string;
  MONDAY_MAX_BOARDS?: number;
  ANTHROPIC_API_KEY?: string;
  WILL_DOO_MODEL?: string;
}

export interface IntegrationsDeps {
  /** Injectable for tests (mocked fetch); defaults to the global fetch. */
  fetch?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
}

/**
 * Entry point used by the HTTP layer. Everything is lazy: clients are created
 * on first use and nothing connects at startup, so a bad token never blocks
 * the app from starting.
 */
export interface Integrations {
  status(): IntegrationStatus[];
  isConfigured(id: string): boolean;
  /** Feature flags for a user: provider configured + its permission held. */
  features(permissions: ReadonlySet<string>): string[];
  /** Runs the provider's connection test; throws IntegrationError on failure. */
  test(id: string): Promise<void>;
  /** null when Monday is not configured. */
  monday(): MondayClient | null;
  /** null when Will Doo (ANTHROPIC_API_KEY) is not configured. */
  anthropic(): Anthropic | null;
}

export function createIntegrations(config: IntegrationsConfig, deps: IntegrationsDeps = {}): Integrations {
  const env = { MONDAY_API_TOKEN: config.MONDAY_API_TOKEN, ANTHROPIC_API_KEY: config.ANTHROPIC_API_KEY };
  const statuses = getIntegrationStatus(env);
  const configured = (id: string) => statuses.some((status) => status.id === id && status.configured);
  let mondayClient: MondayClient | null = null;
  let anthropicClient: Anthropic | null = null;

  const anthropic = () => {
    if (!configured("anthropic") || !config.ANTHROPIC_API_KEY) return null;
    anthropicClient ??= createAnthropicClient({
      apiKey: config.ANTHROPIC_API_KEY,
      ...(deps.fetch ? { fetch: deps.fetch } : {}),
      ...(deps.timeoutMs ? { timeoutMs: deps.timeoutMs } : {})
    });
    return anthropicClient;
  };

  const monday = () => {
    if (!configured("monday") || !config.MONDAY_API_TOKEN) return null;
    mondayClient ??= new MondayClient({
      token: config.MONDAY_API_TOKEN,
      maxBoards: config.MONDAY_MAX_BOARDS ?? 500,
      ...(deps.fetch ? { fetch: deps.fetch } : {}),
      ...(deps.now ? { now: deps.now } : {}),
      ...(deps.timeoutMs ? { timeoutMs: deps.timeoutMs } : {})
    });
    return mondayClient;
  };

  return {
    status: () => statuses.map((status) => ({ ...status })),
    isConfigured: configured,
    features: (permissions) =>
      PROVIDERS.filter((provider) => configured(provider.id) && permissions.has(provider.usePermission)).map(
        (provider) => provider.feature
      ),
    async test(id) {
      if (!findProvider(id) || !configured(id)) {
        throw new IntegrationError("unavailable", `${id}: not configured`);
      }
      switch (id) {
        case "monday":
          await monday()!.testConnection();
          return;
        case "anthropic":
          await testAnthropicConnection(anthropic()!, config.WILL_DOO_MODEL ?? "claude-sonnet-5-5");
          return;
        default:
          throw new IntegrationError("unavailable", `${id}: no connection test`);
      }
    },
    monday,
    anthropic
  };
}
