import type { FastifyServerOptions } from "fastify";
import { createRedactor, redactDeep } from "./redact.js";

export interface LoggerSettings {
  level: string;
  /** Literal values (e.g. MONGODB_URI) that must never reach the logs. */
  secrets?: readonly string[];
  /** Destination stream; defaults to stdout. Used by tests to capture output. */
  stream?: { write(chunk: string): void };
}

/**
 * Structured JSON logger options for Fastify with redaction of MongoDB URIs
 * and known secrets in messages, fields and serialized errors.
 */
export function createLoggerOptions(settings: LoggerSettings): FastifyServerOptions["logger"] {
  const redact = createRedactor(settings.secrets);

  return {
    level: settings.level,
    ...(settings.stream ? { stream: settings.stream } : {}),
    hooks: {
      logMethod(args, method) {
        method.apply(
          this,
          args.map((arg) => (typeof arg === "string" ? redact(arg) : arg)) as Parameters<
            typeof method
          >
        );
      }
    },
    formatters: {
      log: (object) => redactDeep(object, redact) as Record<string, unknown>
    },
    serializers: {
      // Only name, code, message and stack are kept (no `cause` or driver
      // internals such as topology descriptions, which can list hosts).
      err: (error: unknown) => {
        if (!(error instanceof Error)) {
          return { type: typeof error, message: redact(String(error)), stack: "" };
        }
        const { code } = error as { code?: unknown };
        return {
          type: error.name,
          message: redact(error.message),
          stack: redact(error.stack ?? ""),
          ...(typeof code === "string" || typeof code === "number" ? { code } : {})
        };
      }
    }
  };
}
