import type { FastifyInstance, FastifyRequest } from "fastify";
import { AppError } from "../http/errors.js";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function sameOrigin(request: FastifyRequest, value: string): boolean {
  try {
    // request.protocol / request.host honour X-Forwarded-* from the trusted proxy.
    const expected = new URL(`${request.protocol}://${request.host}`).origin;
    return new URL(value).origin === expected;
  } catch {
    return false;
  }
}

/**
 * CSRF defence in depth (on top of SameSite=Strict cookies) for state-changing
 * /api requests: JSON only (forms cannot send it cross-site without a CORS
 * preflight) and an Origin (or Referer) matching this host.
 */
export function installCsrfProtection(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    if (!UNSAFE_METHODS.has(request.method) || !request.url.startsWith("/api/")) {
      return;
    }

    const contentType = request.headers["content-type"] ?? "";
    if (!/^application\/json(\s*;|$)/i.test(contentType)) {
      throw new AppError(415, "unsupported_media_type", "Content-Type: application/json is required");
    }

    const source = request.headers.origin ?? request.headers.referer;
    if (!source || !sameOrigin(request, source)) {
      throw new AppError(403, "invalid_origin", "Request origin not allowed");
    }
  });
}
