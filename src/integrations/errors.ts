/** The only error information an HTTP client ever receives from an integration. */
export type IntegrationErrorCode = "auth_failed" | "timeout" | "rate_limited" | "unavailable";

/**
 * Failure talking to an external provider. `code` is generic and safe to
 * return; `detail` is for the (redacted) server log only and never contains
 * the provider's message, response body or credentials.
 */
export class IntegrationError extends Error {
  constructor(
    readonly code: IntegrationErrorCode,
    readonly detail: string
  ) {
    super(`integration error: ${code}`);
    this.name = "IntegrationError";
  }
}

/** HTTP status used for each code (never 401: that means "your session" to the SPA). */
export const INTEGRATION_ERROR_STATUS: Record<IntegrationErrorCode, number> = {
  auth_failed: 502,
  timeout: 504,
  rate_limited: 503,
  unavailable: 503
};
