import { afterEach, describe, expect, it } from "vitest";
import { closeDb, getDb, initDb, pingDb, readBootstrapInfo } from "../src/db/mongo.js";
import { REDACTED, createRedactor, extractUriSecrets } from "../src/lib/redact.js";
import { FAKE_PASSWORD, FAKE_URI, buildTestApp, fakeDb } from "./helpers.js";

const SECRETS = [FAKE_URI, ...extractUriSecrets(FAKE_URI)];

describe("createRedactor", () => {
  it("redacts MongoDB URIs and literal secrets", () => {
    const redact = createRedactor(SECRETS);

    const output = redact(
      `failed for ${FAKE_URI} and mongodb+srv://u:p@other.example.invalid/x, pw=${FAKE_PASSWORD}`
    );

    expect(output).not.toContain(FAKE_PASSWORD);
    expect(output).not.toContain("u:p@");
    expect(output).toContain(REDACTED);
  });

  it("extracts percent-encoded passwords in both forms", () => {
    expect(extractUriSecrets("mongodb://user:p%40ss%2Fword@host")).toEqual([
      "p%40ss%2Fword",
      "p@ss/word"
    ]);
    expect(extractUriSecrets("mongodb://host:27017")).toEqual([]);
  });
});

describe("logs and HTTP errors never contain the URI", () => {
  it("redacts the URI from logged errors, messages and fields", async () => {
    const { app, logs } = await buildTestApp(
      fakeDb({
        readBootstrapInfo: async () => {
          throw new Error(`could not connect to ${FAKE_URI}`);
        }
      }),
      { secrets: SECRETS }
    );

    try {
      app.log.info(`plain message with ${FAKE_URI}`);
      app.log.info({ uri: FAKE_URI, nested: { password: FAKE_PASSWORD } }, "fields");

      const response = await app.inject({ method: "GET", url: "/api/meta" });

      expect(response.statusCode).toBe(500);
      expect(response.body).not.toContain(FAKE_PASSWORD);
      expect(response.body).not.toContain("mongodb://");

      const output = logs.text();
      expect(output).toContain("unhandled error");
      expect(output).toContain(REDACTED);
      expect(output).not.toContain(FAKE_PASSWORD);
      expect(output).not.toContain("test_user:");
    } finally {
      await app.close();
    }
  });

  describe("with the real driver and an unreachable server", () => {
    afterEach(async () => {
      await closeDb();
    });

    it("returns 503 and keeps credentials out of logs and responses", async () => {
      initDb({
        uri: FAKE_URI,
        dbName: "client_example",
        serverSelectionTimeoutMS: 300,
        connectTimeoutMS: 300,
        maxPoolSize: 1
      });
      const { app, logs } = await buildTestApp({ pingDb, readBootstrapInfo, getDb }, { secrets: SECRETS });

      try {
        const ready = await app.inject({ method: "GET", url: "/health/ready" });
        const meta = await app.inject({ method: "GET", url: "/api/meta" });

        expect(ready.statusCode).toBe(503);
        expect(ready.json()).toEqual({ status: "unavailable" });
        expect(meta.statusCode).toBe(503);
        expect(meta.json()).toEqual({ error: "service_unavailable" });

        const everything = `${ready.body}\n${meta.body}\n${logs.text()}`;
        expect(logs.text()).toContain("database unavailable");
        expect(everything).not.toContain(FAKE_PASSWORD);
        expect(everything).not.toContain("test_user:");
      } finally {
        await app.close();
      }
    });
  });
});
