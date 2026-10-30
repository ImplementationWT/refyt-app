/**
 * Minimal same-origin JSON client. The session lives in an httpOnly cookie
 * the browser sends automatically; this code never sees it. The browser adds
 * the Origin header the backend checks for CSRF.
 */
export interface ApiIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues: ApiIssue[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: "Los datos enviados no son válidos",
  401: "Tu sesión no es válida o ha expirado",
  403: "No tienes permiso para realizar esta acción",
  404: "No se encontró el recurso",
  409: "La operación no es posible en el estado actual",
  429: "Demasiados intentos. Inténtalo de nuevo más tarde.",
  503: "El servicio no está disponible en este momento"
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function api<T>(path: string, options: { method?: Method; body?: unknown } = {}): Promise<T> {
  const method = options.method ?? "GET";
  const unsafe = method !== "GET";

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: { Accept: "application/json", ...(unsafe ? { "Content-Type": "application/json" } : {}) },
      ...(unsafe ? { body: JSON.stringify(options.body ?? {}) } : {})
    });
  } catch {
    throw new ApiError(0, "network_error", "No se pudo conectar con el servidor");
  }

  const data = (await response.json().catch(() => null)) as
    | { error?: string; message?: string; issues?: ApiIssue[] }
    | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? "error",
      data?.message ?? DEFAULT_MESSAGES[response.status] ?? "Ha ocurrido un error inesperado",
      data?.issues ?? []
    );
  }
  return data as T;
}

export function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
