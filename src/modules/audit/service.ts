import type { FastifyRequest } from "fastify";
import type { ObjectId } from "mongodb";
import type { AuditLogDoc, Collections } from "../../db/collections.js";

export type AuditAction =
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.logout"
  | "auth.password.change"
  | "user.create"
  | "user.update"
  | "user.password.reset"
  | "user.permissions.update"
  | "user.delete"
  | "role.create"
  | "role.update"
  | "role.delete"
  | "notification.create"
  | "integration.test"
  | "integration.monday.boards"
  | "willdoo.ask"
  | "willdoo.quick"
  | "willdoo.basic"
  | "willdoo.conversation.delete"
  | "feedback.create"
  | "feedback.update"
  | "feedback.settings";

const SENSITIVE_KEY = /pass|secret|token|cookie|hash|session|authorization|uri/i;

/** Drops any key that could carry a credential, at any depth. */
export function sanitizeMetadata(value: unknown, depth = 0): unknown {
  if (depth > 5 || value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeMetadata(item, depth + 1));
  }
  if (value instanceof Date) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .map(([key, item]) => [key, sanitizeMetadata(item, depth + 1)])
  );
}

export interface AuditEntry {
  actorId: ObjectId | null;
  action: AuditAction;
  entityType: string;
  entityId?: ObjectId | string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(c: Collections, request: FastifyRequest, entry: AuditEntry) {
  await c.auditLogs.insertOne({
    actorId: entry.actorId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ? String(entry.entityId) : null,
    metadata: sanitizeMetadata(entry.metadata ?? {}) as Record<string, unknown>,
    ip: request.ip ?? null,
    createdAt: new Date()
  } as AuditLogDoc);
}
