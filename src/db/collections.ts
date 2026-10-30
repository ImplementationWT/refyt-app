import type { Db, ObjectId } from "mongodb";

export type UserStatus = "active" | "disabled";

export interface UserDoc {
  _id: ObjectId;
  /** Stored lowercase; unique. */
  username: string;
  /** Stored lowercase; unique when present. */
  email?: string;
  displayName: string;
  passwordHash: string;
  roleIds: ObjectId[];
  /** Per-user overrides on top of the roles (absent on older documents). */
  grantedPermissionKeys?: string[];
  revokedPermissionKeys?: string[];
  status: UserStatus;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  failedLoginCount: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDoc {
  _id: ObjectId;
  key: string;
  name: string;
  description: string;
  permissionKeys: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionDoc {
  _id: ObjectId;
  key: string;
  module: string;
  description: string;
}

export interface NotificationDoc {
  _id: ObjectId;
  userId: ObjectId;
  type: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface AuditLogDoc {
  _id: ObjectId;
  actorId: ObjectId | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  createdAt: Date;
}

export interface SessionDoc {
  _id: ObjectId;
  /** HMAC-SHA256(SESSION_SECRET, session id). The raw id is never stored. */
  sessionIdHash: string;
  userId: ObjectId;
  createdAt: Date;
  lastSeenAt: Date;
  /** min(absolute expiry, lastSeenAt + idle timeout). TTL-indexed. */
  expiresAt: Date;
  absoluteExpiresAt: Date;
}

/** One turn as the panel shows it (the API transcript lives in `messages`). */
export interface WillDooTurn {
  role: "user" | "assistant";
  text: string;
  /** Tools Will used to answer (assistant turns). */
  tools?: string[];
  at: Date;
}

export interface WillDooConversationDoc {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  /**
   * Transcript sent to Claude, append-only (thinking blocks and tool results
   * included). Never edited: Claude checks earlier turns were not changed.
   */
  messages: unknown[];
  turns: WillDooTurn[];
  /** Spend of the whole conversation, in millionths of USD (list price). */
  costMicros: number;
  createdAt: Date;
  updatedAt: Date;
  /** TTL-indexed: WILL_DOO_RETENTION_DAYS after the last message. */
  expiresAt: Date;
}

/** One answer of Will (several model calls when it uses tools). Kept for budgets. */
export interface WillDooUsageDoc {
  _id: ObjectId;
  userId: ObjectId;
  conversationId: ObjectId;
  model: string;
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
  costMicros: number;
  toolCalls: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface SchemaMetadataDoc {
  key: "schema";
  version: number;
  appliedAt: Date;
}

export function collections(db: Db) {
  return {
    users: db.collection<UserDoc>("users"),
    roles: db.collection<RoleDoc>("roles"),
    permissions: db.collection<PermissionDoc>("permissions"),
    notifications: db.collection<NotificationDoc>("notifications"),
    auditLogs: db.collection<AuditLogDoc>("audit_logs"),
    sessions: db.collection<SessionDoc>("sessions"),
    willdooConversations: db.collection<WillDooConversationDoc>("willdoo_conversations"),
    willdooUsage: db.collection<WillDooUsageDoc>("willdoo_usage"),
    metadata: db.collection("app_metadata")
  };
}

export type Collections = ReturnType<typeof collections>;
