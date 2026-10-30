import type { Db } from "mongodb";
import { buildApp, type AppDb, type AppOptions, type AppSettings, type AppState } from "../src/app.js";
import type { Integrations } from "../src/integrations/service.js";
import { pingDbOn, readBootstrapInfoFrom } from "../src/db/mongo.js";
import { createLoggerOptions } from "../src/lib/logger.js";

/** Fake credentials used only in tests; they never point at a real server.
 * Deliberately low-entropy so secret scanners do not flag them. */
export const FAKE_PASSWORD = "fakefakefakefake";
export const FAKE_URI = `mongodb://test_user:${FAKE_PASSWORD}@127.0.0.1:1/?authSource=admin`;
export const TEST_SESSION_SECRET = "x".repeat(48);

export function baseEnv(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    MONGODB_URI: "mongodb://localhost:27017",
    MONGODB_DB: "client_example",
    SESSION_SECRET: TEST_SESSION_SECRET,
    ...overrides
  };
}

export function testSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    production: false,
    appName: "Aplicación de prueba",
    sessionSecret: TEST_SESSION_SECRET,
    sessionTtlMs: 12 * 3_600_000,
    sessionIdleMs: 30 * 60_000,
    loginMaxAttempts: 5,
    loginLockMs: 15 * 60_000,
    loginRateLimit: { max: 1000, timeWindowMs: 60_000 },
    trustProxyHops: 1,
    webRoot: null,
    willdoo: { mode: "basic", model: "claude-sonnet-5-5", monthlyBudgetUsd: 50, userDailyMessages: 100, retentionDays: 90 },
    ...overrides
  };
}

export function captureStream() {
  const lines: string[] = [];
  return {
    lines,
    stream: { write: (chunk: string) => void lines.push(chunk) },
    text: () => lines.join("")
  };
}

export function fakeDb(overrides: Partial<AppDb> = {}): AppDb & { calls: number } {
  const db = {
    calls: 0,
    async pingDb() {
      db.calls += 1;
      return "ok" as const;
    },
    async readBootstrapInfo() {
      db.calls += 1;
      return null;
    },
    async getDb(): Promise<Db> {
      db.calls += 1;
      throw new Error("no database in this test");
    },
    ...overrides
  };
  return db;
}

/** AppDb bound to an explicit database (no singleton). */
export function dbFrom(db: Db): AppDb {
  return {
    pingDb: () => pingDbOn(db),
    readBootstrapInfo: () => readBootstrapInfoFrom(db),
    getDb: async () => db
  };
}

export async function buildTestApp(
  db: AppDb,
  options: {
    secrets?: string[];
    settings?: Partial<AppSettings>;
    state?: AppState;
    integrations?: Integrations;
    willdoo?: AppOptions["willdoo"];
  } = {}
) {
  const capture = captureStream();
  const state = options.state ?? { ready: true, schemaVersion: 1 };
  const app = await buildApp({
    db,
    settings: testSettings(options.settings),
    state,
    ...(options.integrations ? { integrations: options.integrations } : {}),
    ...(options.willdoo ? { willdoo: options.willdoo } : {}),
    logger: createLoggerOptions({
      level: "trace",
      secrets: [TEST_SESSION_SECRET, ...(options.secrets ?? [])],
      stream: capture.stream
    })
  });
  return { app, logs: capture, state };
}
