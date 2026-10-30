import type { FastifyInstance, FastifyRequest } from "fastify";
import { requireAuth, requirePermission } from "../../auth/context.js";
import type { Collections } from "../../db/collections.js";
import { AppError, notFound } from "../../http/errors.js";
import { INTEGRATION_ERROR_STATUS, IntegrationError } from "../../integrations/errors.js";
import { findProvider } from "../../integrations/registry.js";
import type { Integrations } from "../../integrations/service.js";
import { recordAudit } from "../audit/service.js";

interface Deps {
  collections: () => Promise<Collections>;
  integrations: Integrations;
}

/** Per-IP limits; the provider has its own limits on top. */
const TEST_RATE_LIMIT = { max: 10, timeWindow: 60_000 };
const BOARDS_RATE_LIMIT = { max: 30, timeWindow: 60_000 };

/** Logs the internal detail (redacted logger) and returns only the generic code. */
function logIntegrationError(request: FastifyRequest, provider: string, error: IntegrationError) {
  request.log.warn({ provider, code: error.code, detail: error.detail }, "integration request failed");
}

/**
 * Integrations API. No endpoint accepts or returns credentials: they are only
 * configured through environment variables. Provider ids come from the
 * registry; anything else is 404.
 */
export async function integrationRoutes(app: FastifyInstance, deps: Deps) {
  app.get("/api/integrations", { preHandler: requirePermission("integrations.read") }, async () => ({
    items: deps.integrations.status()
  }));

  app.post(
    "/api/integrations/:provider/test",
    { preHandler: requirePermission("integrations.manage"), config: { rateLimit: TEST_RATE_LIMIT } },
    async (request) => {
      const actor = requireAuth(request);
      const id = (request.params as { provider: string }).provider;
      const provider = findProvider(id);
      if (!provider) {
        throw notFound("Integration not found");
      }
      if (!deps.integrations.isConfigured(provider.id)) {
        throw new AppError(409, "not_configured", "The integration is not configured");
      }

      let result: { ok: true } | { ok: false; error: IntegrationError["code"] };
      try {
        await deps.integrations.test(provider.id);
        result = { ok: true };
      } catch (error) {
        if (!(error instanceof IntegrationError)) throw error;
        logIntegrationError(request, provider.id, error);
        result = { ok: false, error: error.code };
      }

      const c = await deps.collections();
      await recordAudit(c, request, {
        actorId: actor.user._id,
        action: "integration.test",
        entityType: "integration",
        entityId: provider.id,
        metadata: { provider: provider.id, ok: result.ok, ...(result.ok ? {} : { error: result.error }) }
      });
      return result;
    }
  );

  app.get(
    "/api/monday/boards",
    { preHandler: requirePermission("monday.read"), config: { rateLimit: BOARDS_RATE_LIMIT } },
    async (request) => {
      const actor = requireAuth(request);
      const client = deps.integrations.monday();
      if (!client) {
        throw notFound("Monday is not configured");
      }

      const c = await deps.collections();
      try {
        const items = await client.listBoards();
        // Audit the query only: never board names or ids.
        await recordAudit(c, request, {
          actorId: actor.user._id,
          action: "integration.monday.boards",
          entityType: "integration",
          entityId: "monday",
          metadata: { ok: true, count: items.length }
        });
        return { items, total: items.length };
      } catch (error) {
        if (!(error instanceof IntegrationError)) throw error;
        logIntegrationError(request, "monday", error);
        await recordAudit(c, request, {
          actorId: actor.user._id,
          action: "integration.monday.boards",
          entityType: "integration",
          entityId: "monday",
          metadata: { ok: false, error: error.code }
        });
        throw new AppError(INTEGRATION_ERROR_STATUS[error.code], error.code);
      }
    }
  );
}
