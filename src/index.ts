import "dotenv/config";
import { fileURLToPath } from "node:url";
import { buildApp, settingsFromConfig, type AppState } from "./app.js";
import { createIntegrations } from "./integrations/service.js";
import { ConfigError, loadConfig, type Config } from "./config/env.js";
import { runMigrations } from "./db/migrations/index.js";
import {
  closeDb,
  getDb,
  initDb,
  pingDb,
  readBootstrapInfo,
  waitForDb
} from "./db/mongo.js";
import { createLoggerOptions } from "./lib/logger.js";
import { extractUriSecrets } from "./lib/redact.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;
// dist/index.js -> web/dist (same layout in the repo and in the image).
const WEB_ROOT = fileURLToPath(new URL("../web/dist", import.meta.url));

let config: Config;
try {
  config = loadConfig();
} catch (error) {
  if (error instanceof ConfigError) {
    // The message lists variable names and rules only, never values.
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}

initDb({
  uri: config.MONGODB_URI,
  dbName: config.MONGODB_DB,
  serverSelectionTimeoutMS: config.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  connectTimeoutMS: config.MONGODB_CONNECT_TIMEOUT_MS,
  maxPoolSize: config.MONGODB_MAX_POOL_SIZE
});

const state: AppState = { ready: false, schemaVersion: null };
const settings = settingsFromConfig(config, WEB_ROOT);

const app = await buildApp({
  db: { pingDb, readBootstrapInfo, getDb },
  settings,
  state,
  // Lazy: nothing connects at startup; an invalid token never blocks it.
  integrations: createIntegrations({
    MONDAY_API_TOKEN: config.MONDAY_API_TOKEN,
    MONDAY_MAX_BOARDS: config.MONDAY_MAX_BOARDS,
    ANTHROPIC_API_KEY: config.ANTHROPIC_API_KEY,
    WILL_DOO_MODEL: config.WILL_DOO_MODEL
  }),
  logger: createLoggerOptions({
    level: config.LOG_LEVEL,
    secrets: [
      config.MONGODB_URI,
      ...extractUriSecrets(config.MONGODB_URI),
      config.SESSION_SECRET,
      ...(config.INITIAL_ADMIN_PASSWORD ? [config.INITIAL_ADMIN_PASSWORD] : []),
      ...(config.MONDAY_API_TOKEN ? [config.MONDAY_API_TOKEN] : []),
      ...(config.ANTHROPIC_API_KEY ? [config.ANTHROPIC_API_KEY] : [])
    ]
  })
});

app.addHook("onClose", async () => {
  await closeDb();
});

let shuttingDown = false;
async function shutdown(signal: NodeJS.Signals | "startup-failure", code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  app.log.info({ signal }, "shutting down");

  const forceExit = setTimeout(() => {
    app.log.error("graceful shutdown timed out");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    await app.close();
    process.exit(code);
  } catch (error) {
    app.log.error({ err: error }, "error during shutdown");
    process.exit(1);
  }
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

try {
  // Listen first so liveness (/health) answers; /api and /health/ready stay
  // at 503 until the database is reachable and migrations are applied.
  await app.listen({ port: config.PORT, host: config.HOST });
} catch (error) {
  app.log.error({ err: error }, "failed to start");
  await closeDb();
  process.exit(1);
}

if (config.WILL_DOO_MODE === "claude" && !config.ANTHROPIC_API_KEY) {
  app.log.warn("WILL_DOO_MODE=claude without ANTHROPIC_API_KEY: Will Doo runs in basic mode (no AI)");
}
if (!settings.webRoot) {
  app.log.warn("web/dist not found: serving the API only");
}
if (settings.production && !config.INITIAL_ADMIN_PASSWORD) {
  app.log.warn(
    "INITIAL_ADMIN_PASSWORD is not set: if the admin user does not exist yet it will be created with the default password"
  );
}

try {
  const db = await waitForDb({
    retries: config.MONGODB_STARTUP_RETRIES,
    onRetry: (attempt, delayMs) =>
      app.log.warn({ attempt, delayMs }, "database not reachable, retrying")
  });
  state.schemaVersion = await runMigrations({
    db,
    seed: {
      initialAdminPassword: config.INITIAL_ADMIN_PASSWORD,
      forceAdminPasswordChange: config.FORCE_ADMIN_PASSWORD_CHANGE
    },
    log: app.log
  });
  state.ready = true;
  app.log.info({ schemaVersion: state.schemaVersion }, "ready");
} catch (error) {
  // Exit non-zero so the container is restarted.
  app.log.error({ err: error }, "startup failed: database unavailable or migration error");
  await shutdown("startup-failure", 1);
}
