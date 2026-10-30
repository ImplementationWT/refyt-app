import { ADMIN_ROLE_KEY } from "../../auth/permissions.js";
import { collections } from "../collections.js";
import type { Migration } from "./types.js";

/**
 * Adds the dashboard.read permission (Dashboards page indicators) and grants
 * it to the system admin role, which always holds the whole catalog.
 * Other roles are left untouched: administrators grant it explicitly.
 */
export const dashboardMigration: Migration = {
  version: 2,
  name: "dashboard",
  async up({ db }) {
    const c = collections(db);
    await c.permissions.updateOne(
      { key: "dashboard.read" },
      { $set: { module: "dashboard", description: "Ver los indicadores del dashboard" } },
      { upsert: true }
    );
    await c.roles.updateOne(
      { key: ADMIN_ROLE_KEY },
      { $addToSet: { permissionKeys: "dashboard.read" }, $set: { updatedAt: new Date() } }
    );
  }
};
