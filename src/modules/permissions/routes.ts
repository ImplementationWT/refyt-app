import type { FastifyInstance } from "fastify";
import { requirePermission } from "../../auth/context.js";
import type { Collections } from "../../db/collections.js";

interface Deps {
  collections: () => Promise<Collections>;
}

/** Read-only catalog; seeded by migrations, never editable through the API. */
export async function permissionRoutes(app: FastifyInstance, deps: Deps) {
  app.get("/api/permissions", { preHandler: requirePermission("permissions.read") }, async () => {
    const c = await deps.collections();
    const items = (await c.permissions.find().sort({ module: 1, key: 1 }).toArray()).map(
      ({ key, module, description }) => ({ key, module, description })
    );
    return { items, total: items.length, page: 1, pageSize: items.length };
  });
}
