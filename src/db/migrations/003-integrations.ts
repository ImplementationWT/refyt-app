import { ADMIN_ROLE_KEY } from "../../auth/permissions.js";
import { collections } from "../collections.js";
import type { Migration } from "./types.js";

// Frozen: applied migrations never change.
const V3_PERMISSIONS = [
  { key: "integrations.read", module: "integrations", description: "Ver el estado de las integraciones" },
  { key: "integrations.manage", module: "integrations", description: "Probar la conexión de las integraciones" },
  { key: "monday.read", module: "monday", description: "Ver los tableros de Monday.com" }
];

/**
 * External integrations: adds their permissions to the catalog and to the
 * system admin role. Other roles (including edited ones) are untouched.
 * Idempotent: upserts by key and $addToSet.
 */
export const integrationsMigration: Migration = {
  version: 3,
  name: "integrations",
  async up({ db }) {
    const c = collections(db);
    for (const permission of V3_PERMISSIONS) {
      await c.permissions.updateOne(
        { key: permission.key },
        { $set: { module: permission.module, description: permission.description } },
        { upsert: true }
      );
    }
    await c.roles.updateOne(
      { key: ADMIN_ROLE_KEY },
      {
        $addToSet: { permissionKeys: { $each: V3_PERMISSIONS.map((permission) => permission.key) } },
        $set: { updatedAt: new Date() }
      }
    );
  }
};
