import { MongoClient, type Db } from "mongodb";
import { z } from "zod";

export interface MongoSettings {
  uri: string;
  dbName: string;
  serverSelectionTimeoutMS: number;
  connectTimeoutMS: number;
  maxPoolSize: number;
}

export type PingResult = "ok" | "fail";

export interface BootstrapInfo {
  clientId: string;
  templateVersion: string | number;
}

/**
 * Created by the provisioning platform. Holds the provisioner's `bootstrap`
 * document and this app's migration record (`schema`).
 */
export const METADATA_COLLECTION = "app_metadata";
const BOOTSTRAP_KEY = "bootstrap";

const bootstrapSchema = z.object({
  clientId: z.string().min(1),
  templateVersion: z.union([z.string(), z.number()])
});

export class BootstrapFormatError extends Error {
  constructor() {
    super(`Malformed ${METADATA_COLLECTION} bootstrap document`);
    this.name = "BootstrapFormatError";
  }
}

let settings: MongoSettings | undefined;
// Shared by concurrent callers so only one MongoClient ever exists.
let connecting: Promise<MongoClient> | undefined;

/**
 * Registers the connection settings. Does not open any connection: the
 * client connects on first use (lazy).
 */
export function initDb(next: MongoSettings): void {
  if (connecting) {
    throw new Error("Database already in use; call closeDb() before re-initializing");
  }
  settings = { ...next };
}

function getSettings(): MongoSettings {
  if (!settings) {
    throw new Error("Database not initialized; call initDb() first");
  }
  return settings;
}

function getClient(): Promise<MongoClient> {
  if (!connecting) {
    const { uri, serverSelectionTimeoutMS, connectTimeoutMS, maxPoolSize } = getSettings();
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS,
      connectTimeoutMS,
      maxPoolSize
    });

    const attempt: Promise<MongoClient> = client.connect().catch(async (error: unknown) => {
      // A failed initial connect leaves the client unusable; drop it so the
      // next call retries with a fresh one instead of failing forever.
      if (connecting === attempt) {
        connecting = undefined;
      }
      await client.close().catch(() => undefined);
      throw error;
    });
    connecting = attempt;
  }
  return connecting;
}

/** Returns the database named by MONGODB_DB. There is no way to pick another. */
export async function getDb(): Promise<Db> {
  const { dbName } = getSettings();
  const client = await getClient();
  return client.db(dbName);
}

export async function pingDbOn(db: Db): Promise<PingResult> {
  try {
    await db.command({ ping: 1 });
    return "ok";
  } catch {
    return "fail";
  }
}

export async function pingDb(): Promise<PingResult> {
  try {
    return await pingDbOn(await getDb());
  } catch {
    return "fail";
  }
}

/**
 * Reads the bootstrap document written by the provisioner. Returns only the
 * public fields, or null when the document does not exist.
 */
export async function readBootstrapInfoFrom(db: Db): Promise<BootstrapInfo | null> {
  const doc = await db
    .collection(METADATA_COLLECTION)
    .findOne({ key: BOOTSTRAP_KEY }, { projection: { _id: 0, clientId: 1, templateVersion: 1 } });

  if (!doc) {
    return null;
  }

  const parsed = bootstrapSchema.safeParse(doc);
  if (!parsed.success) {
    throw new BootstrapFormatError();
  }

  return parsed.data;
}

export async function readBootstrapInfo(): Promise<BootstrapInfo | null> {
  return readBootstrapInfoFrom(await getDb());
}

export interface RetryOptions {
  retries: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, delayMs: number) => void;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Waits for the database at startup with exponential backoff
 * (1s, 2s, 4s… capped). Throws after `retries` failed attempts so the
 * process can exit and the container be restarted.
 */
export async function waitForDb(options: RetryOptions): Promise<Db> {
  const { retries, baseDelayMs = 1_000, maxDelayMs = 30_000 } = options;
  const sleep = options.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));

  for (let attempt = 1; ; attempt++) {
    try {
      const db = await getDb();
      await db.command({ ping: 1 });
      return db;
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      options.onRetry?.(attempt, delayMs);
      await sleep(delayMs);
    }
  }
}

/** Closes the pool. Safe to call more than once. */
export async function closeDb(): Promise<void> {
  const pending = connecting;
  connecting = undefined;
  settings = undefined;

  // A failed connect already closed its own client.
  const client = await pending?.catch(() => undefined);
  await client?.close();
}
