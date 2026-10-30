import { existsSync } from "node:fs";
import { join } from "node:path";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyServerOptions } from "fastify";
import type { Db } from "mongodb";
import { cookieSettings, installAuth } from "./auth/context.js";
import { installCsrfProtection } from "./auth/csrf.js";
import type { Config } from "./config/env.js";
import { collections } from "./db/collections.js";
import type { BootstrapInfo, PingResult } from "./db/mongo.js";
import { AppError, installErrorHandling } from "./http/errors.js";
import { installSpa } from "./http/spa.js";
import { auditRoutes } from "./modules/audit/routes.js";
import { authRoutes } from "./modules/auth/routes.js";
import { createIntegrations, type Integrations } from "./integrations/service.js";
import { dashboardRoutes } from "./modules/dashboard/routes.js";
import { integrationRoutes } from "./modules/integrations/routes.js";
import { notificationRoutes } from "./modules/notifications/routes.js";
import { permissionRoutes } from "./modules/permissions/routes.js";
import { roleRoutes } from "./modules/roles/routes.js";
import { userRoutes } from "./modules/users/routes.js";
import { anthropicModel, type WillDooModel } from "./modules/willdoo/model.js";
import { willDooRoutes } from "./modules/willdoo/routes.js";
import type { QuickQuery } from "./modules/willdoo/quick.js";
import type { WillDooTool } from "./modules/willdoo/tools.js";

/** off: hidden · basic: quick queries without AI (default) · claude: chat with Claude. */
export type WillDooMode = "off" | "basic" | "claude";

/** The database operations the HTTP layer depends on (injectable for tests). */
export interface AppDb {
  pingDb(): Promise<PingResult>;
  readBootstrapInfo(): Promise<BootstrapInfo | null>;
  getDb(): Promise<Db>;
}

/** Mutable startup state: /api and readiness stay at 503 until migrations finish. */
export interface AppState {
  ready: boolean;
  schemaVersion: number | null;
}

export interface AppSettings {
  production: boolean;
  appName: string;
  sessionSecret: string;
  sessionTtlMs: number;
  sessionIdleMs: number;
  loginMaxAttempts: number;
  loginLockMs: number;
  loginRateLimit: { max: number; timeWindowMs: number };
  trustProxyHops: number;
  /** Directory with the built SPA (web/dist), or null to serve the API only. */
  webRoot: string | null;
  /** Will Doo, the co-pilot (active only with ANTHROPIC_API_KEY). */
  willdoo: { mode: WillDooMode; model: string; monthlyBudgetUsd: number; userDailyMessages: number; retentionDays: number };
}

export interface AppOptions {
  db: AppDb;
  settings: AppSettings;
  state: AppState;
  logger?: FastifyServerOptions["logger"];
  /** Optional external integrations; none configured by default. */
  integrations?: Integrations;
  /** Tests: replaces the Claude client and/or the read tools of Will Doo. */
  willdoo?: { model?: WillDooModel; tools?: readonly WillDooTool[]; quickQueries?: readonly QuickQuery[] };
}

export const DEFAULT_APP_NAME = "Aplicación";

export function settingsFromConfig(config: Config, webRoot: string | null): AppSettings {
  return {
    production: config.NODE_ENV === "production",
    appName: config.APP_DISPLAY_NAME ?? DEFAULT_APP_NAME,
    sessionSecret: config.SESSION_SECRET,
    sessionTtlMs: config.SESSION_TTL_HOURS * 3_600_000,
    sessionIdleMs: config.SESSION_IDLE_MINUTES * 60_000,
    loginMaxAttempts: config.LOGIN_MAX_ATTEMPTS,
    loginLockMs: config.LOGIN_LOCK_MINUTES * 60_000,
    loginRateLimit: { max: 10, timeWindowMs: 5 * 60_000 },
    trustProxyHops: config.TRUST_PROXY_HOPS,
    webRoot: webRoot && existsSync(join(webRoot, "index.html")) ? webRoot : null,
    willdoo: {
      mode: config.WILL_DOO_MODE,
      model: config.WILL_DOO_MODEL,
      monthlyBudgetUsd: config.WILL_DOO_MONTHLY_BUDGET_USD,
      userDailyMessages: config.WILL_DOO_USER_DAILY_MESSAGES,
      retentionDays: config.WILL_DOO_RETENTION_DAYS
    }
  };
}

export async function buildApp({
  db,
  settings,
  state,
  logger = true,
  integrations = createIntegrations({}),
  willdoo
}: AppOptions) {
  const app = Fastify({
    logger,
    // Runs behind nginx (TLS termination): trust only the configured number of proxy hops for
    // client IP, protocol and host.
    trustProxy:
      settings.trustProxyHops > 0
        ? (_address: string, hop: number) => hop < settings.trustProxyHops
        : false,
    bodyLimit: 100 * 1024
  });

  installErrorHandling(app);

  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        ...(settings.production ? { upgradeInsecureRequests: [] } : {})
      }
    },
    hsts: settings.production ? { maxAge: 31_536_000, includeSubDomains: false } : false
  });
  await app.register(cookie);
  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: () =>
      new AppError(429, "too_many_requests", "Demasiados intentos. Inténtalo de nuevo más tarde.")
  });

  // Order matters: readiness, then CSRF, then session resolution.
  app.addHook("onRequest", async (request) => {
    if (!state.ready && request.url.startsWith("/api/")) {
      throw new AppError(503, "service_unavailable");
    }
  });
  installCsrfProtection(app);

  const getCollections = async () => collections(await db.getDb());
  const cookieConfig = cookieSettings(settings.production);
  const sessions = {
    secret: settings.sessionSecret,
    ttlMs: settings.sessionTtlMs,
    idleMs: settings.sessionIdleMs
  };
  installAuth(app, { collections: getCollections, sessions, cookie: cookieConfig });

  // Liveness: never touches the database.
  app.get("/health", async () => ({ status: "ok" }));

  // Readiness: migrations applied and the database answers.
  app.get("/health/ready", async (_request, reply) => {
    if (state.ready && (await db.pingDb()) === "ok") {
      return { status: "ok" };
    }
    return reply.code(503).send({ status: "unavailable" });
  });

  app.get("/api/meta", { config: { auth: "public" } }, async (request) => {
    let bootstrap: BootstrapInfo | null = null;
    try {
      bootstrap = await db.readBootstrapInfo();
    } catch (error) {
      if (!(error instanceof Error) || error.name !== "BootstrapFormatError") {
        throw error;
      }
      request.log.warn({ err: error }, "ignoring malformed bootstrap document");
    }
    return {
      appName: settings.appName,
      clientId: bootstrap?.clientId ?? null,
      templateVersion: bootstrap?.templateVersion ?? null,
      schemaVersion: state.schemaVersion
    };
  });

  const deps = { collections: getCollections };
  // claude without a key works as basic: Will stays, informative only.
  const willDooMode: WillDooMode =
    settings.willdoo.mode === "claude" && !integrations.isConfigured("anthropic") ? "basic" : settings.willdoo.mode;
  await authRoutes(app, {
    ...deps,
    sessions,
    cookie: cookieConfig,
    lockout: { maxAttempts: settings.loginMaxAttempts, lockMs: settings.loginLockMs },
    loginRateLimit: settings.loginRateLimit,
    features: (permissions) => [
      // "willdoo-ai" (the provider's flag) only counts in claude mode.
      ...integrations.features(permissions).filter((feature) => feature !== "willdoo-ai"),
      ...(willDooMode !== "off" && permissions.has("willdoo.use") ? ["willdoo"] : []),
      ...(willDooMode === "claude" && permissions.has("willdoo.use") ? ["willdoo-ai"] : [])
    ]
  });
  await userRoutes(app, deps);
  await roleRoutes(app, deps);
  await permissionRoutes(app, deps);
  await notificationRoutes(app, deps);
  await auditRoutes(app, deps);
  await dashboardRoutes(app, deps);
  await integrationRoutes(app, { ...deps, integrations });
  let willDooModel: WillDooModel | null = null;
  await willDooRoutes(app, {
    ...deps,
    integrations,
    settings: { ...settings.willdoo, appName: settings.appName },
    mode: willDooMode,
    // Only in claude mode with the key (the feature flags say the same to the SPA).
    model: () => {
      if (willDooMode !== "claude") return null;
      willDooModel ??= willdoo?.model ?? anthropicModel(integrations.anthropic()!, settings.willdoo.model);
      return willDooModel;
    },
    ...(willdoo?.tools ? { tools: willdoo.tools } : {}),
    ...(willdoo?.quickQueries ? { quickQueries: willdoo.quickQueries } : {})
  });

  installSpa(app, settings.webRoot);

  return app;
}
