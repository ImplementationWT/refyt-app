import { ApiError } from "./api";
import type { IntegrationErrorCode } from "./types";

/** Spanish text per generic code. Provider messages are never shown. */
export const INTEGRATION_ERROR_TEXT: Record<IntegrationErrorCode, { title: string; message: string }> = {
  auth_failed: {
    title: "Credencial rechazada",
    message: "El servicio rechazó la credencial configurada. Revísala con quien administra la plataforma."
  },
  rate_limited: {
    title: "Límite alcanzado",
    message: "Se alcanzó el límite de consultas del servicio. Inténtalo de nuevo en unos minutos."
  },
  timeout: {
    title: "Sin respuesta",
    message: "El servicio tardó demasiado en responder. Inténtalo de nuevo."
  },
  unavailable: {
    title: "Servicio no disponible",
    message: "El servicio no está disponible en este momento. Inténtalo de nuevo más tarde."
  }
};

const CODES = new Set<string>(Object.keys(INTEGRATION_ERROR_TEXT));

export function integrationErrorCode(error: unknown): IntegrationErrorCode {
  return error instanceof ApiError && CODES.has(error.code) ? (error.code as IntegrationErrorCode) : "unavailable";
}
