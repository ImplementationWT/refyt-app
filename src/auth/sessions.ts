import { createHmac, randomBytes } from "node:crypto";
import type { ObjectId } from "mongodb";
import type { Collections, SessionDoc } from "../db/collections.js";

export interface SessionSettings {
  secret: string;
  ttlMs: number;
  idleMs: number;
}

// lastSeenAt is persisted at most once per interval to limit writes.
const TOUCH_INTERVAL_MS = 60_000;

/** The DB only stores an HMAC of the id, so a leaked collection cannot be replayed. */
export function hashSessionId(id: string, secret: string): string {
  return createHmac("sha256", secret).update(id).digest("hex");
}

export async function createSession(
  c: Collections,
  userId: ObjectId,
  settings: SessionSettings,
  now = new Date()
): Promise<{ id: string; expiresAt: Date; absoluteExpiresAt: Date }> {
  const id = randomBytes(32).toString("base64url");
  const absoluteExpiresAt = new Date(now.getTime() + settings.ttlMs);
  const expiresAt = new Date(Math.min(absoluteExpiresAt.getTime(), now.getTime() + settings.idleMs));

  await c.sessions.insertOne({
    sessionIdHash: hashSessionId(id, settings.secret),
    userId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
    absoluteExpiresAt
  } as SessionDoc);

  return { id, expiresAt, absoluteExpiresAt };
}

/**
 * Returns the live session for a raw id and slides its idle expiry. The TTL
 * index may lag up to a minute, so expiry is also checked here.
 */
export async function resolveSession(
  c: Collections,
  id: string,
  settings: SessionSettings,
  now = new Date()
): Promise<SessionDoc | null> {
  const sessionIdHash = hashSessionId(id, settings.secret);
  const session = await c.sessions.findOne({ sessionIdHash, expiresAt: { $gt: now } });
  if (!session) {
    return null;
  }

  if (now.getTime() - session.lastSeenAt.getTime() >= TOUCH_INTERVAL_MS) {
    const expiresAt = new Date(
      Math.min(session.absoluteExpiresAt.getTime(), now.getTime() + settings.idleMs)
    );
    await c.sessions.updateOne({ _id: session._id }, { $set: { lastSeenAt: now, expiresAt } });
    session.lastSeenAt = now;
    session.expiresAt = expiresAt;
  }

  return session;
}

export async function deleteSession(c: Collections, id: string, settings: SessionSettings) {
  await c.sessions.deleteOne({ sessionIdHash: hashSessionId(id, settings.secret) });
}

/** Revokes every session of a user, optionally keeping one (the current). */
export async function deleteUserSessions(c: Collections, userId: ObjectId, keep?: ObjectId) {
  await c.sessions.deleteMany(keep ? { userId, _id: { $ne: keep } } : { userId });
}
