import Anthropic from "@anthropic-ai/sdk";
import { IntegrationError } from "../errors.js";

const DEFAULT_TIMEOUT_MS = 60_000;

export interface AnthropicClientOptions {
  apiKey: string;
  /** Injectable for tests (mocked fetch). */
  fetch?: typeof fetch;
  timeoutMs?: number;
}

/**
 * Client of the official SDK for Will Doo. Fixed destination (api.anthropic.com;
 * no caller input reaches the URL) and the key only in the SDK's header.
 */
export function createAnthropicClient(options: AnthropicClientOptions): Anthropic {
  return new Anthropic({
    apiKey: options.apiKey,
    timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxRetries: 2,
    ...(options.fetch ? { fetch: options.fetch } : {})
  });
}

/**
 * Maps an SDK error to the generic codes of the integrations. The detail is
 * for the (redacted) log: class and HTTP status, never the provider's message.
 */
export function toIntegrationError(error: unknown): IntegrationError {
  if (error instanceof IntegrationError) return error;
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new IntegrationError("auth_failed", `anthropic: ${error.status}`);
  }
  if (error instanceof Anthropic.RateLimitError) return new IntegrationError("rate_limited", "anthropic: 429");
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new IntegrationError("timeout", "anthropic: timeout");
  if (error instanceof Anthropic.APIError) {
    return new IntegrationError("unavailable", `anthropic: ${error.status ?? "connection"} ${error.name}`);
  }
  return new IntegrationError("unavailable", `anthropic: ${error instanceof Error ? error.name : "error"}`);
}

/** Connection test: the key is valid and can use the configured model. */
export async function testAnthropicConnection(client: Anthropic, model: string): Promise<void> {
  try {
    await client.models.retrieve(model);
  } catch (error) {
    throw toIntegrationError(error);
  }
}
