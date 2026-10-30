import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "../src/config/env.js";
import { FAKE_PASSWORD, FAKE_URI, baseEnv } from "./helpers.js";

function configError(env: NodeJS.ProcessEnv): ConfigError {
  try {
    loadConfig(env);
  } catch (error) {
    expect(error).toBeInstanceOf(ConfigError);
    return error as ConfigError;
  }
  throw new Error("expected loadConfig to throw");
}

describe("loadConfig", () => {
  it("accepts a valid environment and applies defaults", () => {
    const config = loadConfig(baseEnv());

    expect(config.MONGODB_DB).toBe("client_example");
    expect(config.MONGODB_SERVER_SELECTION_TIMEOUT_MS).toBe(5000);
    expect(config.MONGODB_CONNECT_TIMEOUT_MS).toBe(10000);
    expect(config.MONGODB_MAX_POOL_SIZE).toBe(10);
  });

  it("accepts mongodb+srv URIs and overrides for timeouts and pool size", () => {
    const config = loadConfig(
      baseEnv({
        MONGODB_URI: "mongodb+srv://cluster.example.invalid",
        MONGODB_SERVER_SELECTION_TIMEOUT_MS: "2000",
        MONGODB_CONNECT_TIMEOUT_MS: "3000",
        MONGODB_MAX_POOL_SIZE: "5"
      })
    );

    expect(config.MONGODB_SERVER_SELECTION_TIMEOUT_MS).toBe(2000);
    expect(config.MONGODB_CONNECT_TIMEOUT_MS).toBe(3000);
    expect(config.MONGODB_MAX_POOL_SIZE).toBe(5);
  });

  it("fails when MONGODB_URI and MONGODB_DB are missing", () => {
    const error = configError({});

    expect(error.problems).toEqual(
      expect.arrayContaining(["MONGODB_URI is required", "MONGODB_DB is required"])
    );
  });

  it("fails when variables are empty strings", () => {
    const error = configError(baseEnv({ MONGODB_URI: "  ", MONGODB_DB: "" }));

    expect(error.problems).toEqual(
      expect.arrayContaining(["MONGODB_URI is required", "MONGODB_DB is required"])
    );
  });

  it.each([
    "example",
    "client_",
    "Client_example",
    "client_Example",
    "client-example",
    "client_example.prod",
    "admin",
    "client_example;drop"
  ])("rejects MONGODB_DB=%j", (dbName) => {
    const error = configError(baseEnv({ MONGODB_DB: dbName }));

    expect(error.problems).toEqual(["MONGODB_DB must match ^client_[a-z0-9_]+$"]);
  });

  it("never includes the rejected MONGODB_DB value in the error", () => {
    const error = configError(baseEnv({ MONGODB_DB: "Leaky-Value-123" }));

    expect(`${error.message}\n${error.stack}`).not.toContain("Leaky-Value-123");
  });

  it("rejects URIs with a different scheme", () => {
    const error = configError(baseEnv({ MONGODB_URI: "postgres://user:pw@localhost/db" }));

    expect(error.problems).toEqual([
      "MONGODB_URI must be a mongodb:// or mongodb+srv:// connection string"
    ]);
  });

  it("rejects invalid numeric settings", () => {
    const error = configError(baseEnv({ MONGODB_MAX_POOL_SIZE: "0" }));

    expect(error.problems).toEqual(["MONGODB_MAX_POOL_SIZE must be greater than 0"]);
  });

  it("never includes the URI in the error, even when other variables fail", () => {
    const error = configError(
      baseEnv({ MONGODB_URI: FAKE_URI, MONGODB_DB: "bad", MONGODB_MAX_POOL_SIZE: "abc" })
    );
    const serialized = `${error.message}\n${error.stack}\n${JSON.stringify(error)}`;

    expect(serialized).not.toContain(FAKE_PASSWORD);
    expect(serialized).not.toContain("127.0.0.1");
    expect(serialized).not.toContain("mongodb://");
  });

  describe("session and admin settings", () => {
    it("fails without SESSION_SECRET", () => {
      const error = configError(baseEnv({ SESSION_SECRET: undefined }));
      expect(error.problems).toEqual(["SESSION_SECRET is required"]);
    });

    it("rejects a short SESSION_SECRET without revealing it", () => {
      const secret = "short-but-distinctive";
      const error = configError(baseEnv({ SESSION_SECRET: secret }));

      expect(error.problems).toEqual(["SESSION_SECRET must be at least 32 characters"]);
      expect(`${error.message}\n${error.stack}`).not.toContain(secret);
    });

    it("applies defaults for optional settings", () => {
      const config = loadConfig(baseEnv());

      expect(config).toMatchObject({
        SESSION_TTL_HOURS: 12,
        SESSION_IDLE_MINUTES: 30,
        LOGIN_MAX_ATTEMPTS: 5,
        LOGIN_LOCK_MINUTES: 15,
        TRUST_PROXY_HOPS: 1,
        FORCE_ADMIN_PASSWORD_CHANGE: true
      });
      expect(config.INITIAL_ADMIN_PASSWORD).toBeUndefined();
      expect(config.APP_DISPLAY_NAME).toBeUndefined();
    });

    it("treats blank optional values as unset (compose passes VAR=)", () => {
      const config = loadConfig(baseEnv({ INITIAL_ADMIN_PASSWORD: "", APP_DISPLAY_NAME: "  " }));

      expect(config.INITIAL_ADMIN_PASSWORD).toBeUndefined();
      expect(config.APP_DISPLAY_NAME).toBeUndefined();
    });

    it("validates INITIAL_ADMIN_PASSWORD length without revealing it", () => {
      const error = configError(baseEnv({ INITIAL_ADMIN_PASSWORD: "tiny-pw" }));

      expect(error.problems).toEqual(["INITIAL_ADMIN_PASSWORD must be at least 10 characters"]);
      expect(error.message).not.toContain("tiny-pw");
    });

    it("allows FORCE_ADMIN_PASSWORD_CHANGE=false outside production only", () => {
      expect(loadConfig(baseEnv({ FORCE_ADMIN_PASSWORD_CHANGE: "false" })).FORCE_ADMIN_PASSWORD_CHANGE).toBe(false);

      const error = configError(baseEnv({ NODE_ENV: "production", FORCE_ADMIN_PASSWORD_CHANGE: "false" }));
      expect(error.problems).toEqual(["FORCE_ADMIN_PASSWORD_CHANGE cannot be false when NODE_ENV=production"]);
    });

    it("treats MONDAY_API_TOKEN as optional and never echoes it", () => {
      expect(loadConfig(baseEnv()).MONDAY_API_TOKEN).toBeUndefined();
      expect(loadConfig(baseEnv({ MONDAY_API_TOKEN: "" })).MONDAY_API_TOKEN).toBeUndefined();
      expect(loadConfig(baseEnv({ MONDAY_API_TOKEN: "abc123" })).MONDAY_MAX_BOARDS).toBe(500);

      const error = configError(baseEnv({ MONDAY_API_TOKEN: "leaky token value" }));
      expect(error.problems).toEqual(["MONDAY_API_TOKEN must not contain whitespace"]);
      expect(error.message).not.toContain("leaky");
    });

    it("rejects a multi-line APP_DISPLAY_NAME", () => {
      const error = configError(baseEnv({ APP_DISPLAY_NAME: "Uno\nDos" }));
      expect(error.problems).toEqual(["APP_DISPLAY_NAME must be a single line"]);
    });
  });

  it("never includes the value of a malformed URI in the error", () => {
    const badUri = `http://test_user:${FAKE_PASSWORD}@host`;
    const error = configError(baseEnv({ MONGODB_URI: badUri }));

    expect(`${error.message}\n${error.stack}`).not.toContain(FAKE_PASSWORD);
  });
});
