import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  METADATA_COLLECTION,
  closeDb,
  getDb,
  initDb,
  pingDb,
  readBootstrapInfo,
  waitForDb,
  BootstrapFormatError
} from "../src/db/mongo.js";
import { LATEST_SCHEMA_VERSION, runMigrations } from "../src/db/migrations/index.js";
import { buildTestApp } from "./helpers.js";

// Uses an in-memory mongod (downloaded on first run, no credentials needed).
// Set SKIP_DB_INTEGRATION=1 to skip, e.g. on machines without network access.
const skip = process.env.SKIP_DB_INTEGRATION === "1";
const DB_NAME = "client_integration_test";

function settings(uri: string) {
  return {
    uri,
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 1000,
    connectTimeoutMS: 1000,
    maxPoolSize: 5
  };
}

describe("getDb before initDb", () => {
  it("rejects instead of falling back to another database", async () => {
    await expect(getDb()).rejects.toThrow("Database not initialized");
  });
});

describe.skipIf(skip)("MongoDB integration (mongodb-memory-server)", () => {
  let server: MongoMemoryServer;
  let seed: MongoClient;

  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    seed = new MongoClient(server.getUri());
  }, 120_000);

  afterEach(async () => {
    await closeDb();
    await seed.db(DB_NAME).dropDatabase();
  });

  afterAll(async () => {
    await seed?.close();
    await server?.stop();
  });

  it("getDb() returns only the configured database", async () => {
    initDb(settings(server.getUri("some_other_db")));

    const [first, second] = await Promise.all([getDb(), getDb()]);
    expect(first.databaseName).toBe(DB_NAME);
    expect(second.databaseName).toBe(DB_NAME);
    // Concurrent callers share the same client (singleton).
    expect(first.client).toBe(second.client);
    // getDb() accepts no arguments, so callers cannot select another database.
    expect(getDb.length).toBe(0);
  });

  it("refuses to be re-initialized while a client is in use", async () => {
    initDb(settings(server.getUri()));
    await getDb();

    expect(() => initDb({ ...settings(server.getUri()), dbName: "client_other" })).toThrow();
    expect((await getDb()).databaseName).toBe(DB_NAME);
  });

  it("pingDb() returns ok when the server is available", async () => {
    initDb(settings(server.getUri()));

    await expect(pingDb()).resolves.toBe("ok");
  });

  it("readBootstrapInfo() returns null when the document does not exist", async () => {
    initDb(settings(server.getUri()));

    await expect(readBootstrapInfo()).resolves.toBeNull();
  });

  it("readBootstrapInfo() returns only the public bootstrap fields", async () => {
    await seed
      .db(DB_NAME)
      .collection(METADATA_COLLECTION)
      .insertOne({
        key: "bootstrap",
        clientId: "example",
        templateVersion: "1.1.0",
        schemaVersion: 7,
        internalNote: "not exposed"
      });
    initDb(settings(server.getUri()));

    await expect(readBootstrapInfo()).resolves.toEqual({ clientId: "example", templateVersion: "1.1.0" });
  });

  it("readBootstrapInfo() reports a malformed document with a dedicated error", async () => {
    await seed.db(DB_NAME).collection(METADATA_COLLECTION).insertOne({ key: "bootstrap", clientId: 42 });
    initDb(settings(server.getUri()));

    await expect(readBootstrapInfo()).rejects.toBeInstanceOf(BootstrapFormatError);
  });

  it("startup: waits for the database, migrates, then serves /health/ready and /api/meta", async () => {
    await seed.db(DB_NAME).collection(METADATA_COLLECTION).insertOne({
      key: "bootstrap",
      clientId: "example",
      templateVersion: "1.1.0",
      schemaVersion: 99
    });
    initDb(settings(server.getUri()));
    const { app, state } = await buildTestApp(
      { pingDb, readBootstrapInfo, getDb },
      { state: { ready: false, schemaVersion: null } }
    );

    try {
      expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(503);

      const db = await waitForDb({ retries: 3 });
      state.schemaVersion = await runMigrations({
        db,
        seed: { initialAdminPassword: undefined, forceAdminPasswordChange: true },
        log: { info: () => undefined }
      });
      state.ready = true;

      const ready = await app.inject({ method: "GET", url: "/health/ready" });
      const meta = await app.inject({ method: "GET", url: "/api/meta" });

      expect(ready.statusCode).toBe(200);
      expect(meta.json()).toEqual({
        appName: "Aplicación de prueba",
        clientId: "example",
        templateVersion: "1.1.0",
        // From the applied migrations, not from the bootstrap document.
        schemaVersion: LATEST_SCHEMA_VERSION
      });
    } finally {
      await app.close();
    }
  });
});

describe("waitForDb", () => {
  afterEach(async () => {
    await closeDb();
  });

  it("retries with exponential backoff and gives up after the last attempt", async () => {
    initDb({
      uri: "mongodb://127.0.0.1:1",
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 100,
      connectTimeoutMS: 100,
      maxPoolSize: 1
    });
    const delays: number[] = [];

    await expect(
      waitForDb({
        retries: 4,
        baseDelayMs: 1000,
        maxDelayMs: 3000,
        sleep: async (ms) => void delays.push(ms)
      })
    ).rejects.toThrow();
    expect(delays).toEqual([1000, 2000, 3000]);
  });
});

describe.skipIf(skip)("readiness when availability changes", () => {
  it("recovers when the database is down at startup and comes back", async () => {
    // Reserve a free port, then free it so nothing is listening there.
    const probe = await MongoMemoryServer.create();
    const port = probe.instanceInfo!.port;
    const uri = probe.getUri();
    await probe.stop();

    initDb(settings(uri));
    const { app } = await buildTestApp({ pingDb, readBootstrapInfo, getDb });
    let server: MongoMemoryServer | undefined;

    try {
      expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(503);

      server = await MongoMemoryServer.create({ instance: { port } });

      expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(200);
    } finally {
      await app.close();
      await closeDb();
      await server?.stop();
    }
  }, 120_000);

  it("returns 503 after the server stops", async () => {
    const server = await MongoMemoryServer.create();
    initDb(settings(server.getUri()));
    const { app } = await buildTestApp({ pingDb, readBootstrapInfo, getDb });

    try {
      expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(200);

      await server.stop();

      const response = await app.inject({ method: "GET", url: "/health/ready" });
      expect(response.statusCode).toBe(503);
      expect(response.json()).toEqual({ status: "unavailable" });
    } finally {
      await app.close();
      await closeDb();
      await server.stop();
    }
  }, 120_000);
});
