import type { FastifyInstance } from "fastify";
import {
  MongoNetworkError,
  MongoServerSelectionError,
  MongoTopologyClosedError
} from "mongodb";
import { ZodError } from "zod";

/**
 * Expected error with a stable machine code and an optional Spanish message
 * safe to show to the user. Anything else becomes a generic 500.
 */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    readonly publicMessage?: string
  ) {
    super(publicMessage ?? code);
    this.name = "AppError";
  }
}

export const notFound = (message = "Not found") =>
  new AppError(404, "not_found", message);
export const forbidden = (message = "You do not have permission to do this") =>
  new AppError(403, "forbidden", message);
export const conflict = (code: string, message: string) => new AppError(409, code, message);

const CLIENT_ERROR_CODES: Record<number, string> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  405: "method_not_allowed",
  413: "payload_too_large",
  415: "unsupported_media_type",
  429: "too_many_requests"
};

export function isDbUnavailable(error: unknown): boolean {
  return (
    error instanceof MongoServerSelectionError ||
    error instanceof MongoNetworkError ||
    // Requests that arrive while the pool is closing during shutdown.
    error instanceof MongoTopologyClosedError
  );
}

/** Clients never receive stack traces or driver messages; details go to the redacted log. */
export function installErrorHandling(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: error.code,
        ...(error.publicMessage ? { message: error.publicMessage } : {})
      });
    }

    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: "validation_error",
        message: "The data sent is not valid",
        // Path and rule only; Zod messages never include the received value.
        issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
      });
    }

    if (isDbUnavailable(error)) {
      request.log.error({ err: error }, "database unavailable");
      return reply.code(503).send({ error: "service_unavailable" });
    }

    const { statusCode } = error as { statusCode?: unknown };
    if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 500) {
      request.log.info({ err: error }, "client error");
      return reply.code(statusCode).send({ error: CLIENT_ERROR_CODES[statusCode] ?? "bad_request" });
    }

    request.log.error({ err: error }, "unhandled error");
    return reply.code(500).send({ error: "internal_error" });
  });
}
