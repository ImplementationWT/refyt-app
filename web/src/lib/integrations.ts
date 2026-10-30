import { ApiError } from "./api";
import type { IntegrationErrorCode } from "./types";

/** Spanish text per generic code. Provider messages are never shown. */
export const INTEGRATION_ERROR_TEXT: Record<IntegrationErrorCode, { title: string; message: string }> = {
  auth_failed: {
    title: "Credential rejected",
    message: "The service rejected the configured credential. Check it with whoever manages the platform."
  },
  rate_limited: {
    title: "Limit reached",
    message: "The service query limit was reached. Try again in a few minutes."
  },
  timeout: {
    title: "No response",
    message: "The service took too long to respond. Try again."
  },
  unavailable: {
    title: "Service unavailable",
    message: "The service is not available right now. Try again later."
  }
};

const CODES = new Set<string>(Object.keys(INTEGRATION_ERROR_TEXT));

export function integrationErrorCode(error: unknown): IntegrationErrorCode {
  return error instanceof ApiError && CODES.has(error.code) ? (error.code as IntegrationErrorCode) : "unavailable";
}
