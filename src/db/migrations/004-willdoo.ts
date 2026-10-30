import { ADMIN_ROLE_KEY } from "../../auth/permissions.js";
import { collections } from "../collections.js";
import type { Migration } from "./types.js";

// Frozen: applied migrations never change.
const V4_PERMISSIONS = [
  { key: "willdoo.use", module: "willdoo", description: "Conversar con Will Doo (co-pilot con IA)" },
  { key: "willdoo.audit", module: "willdoo", description: "Revisar las conversaciones y el gasto de Will Doo" }
];

/**
 * Will Doo (co-pilot): permissions for the catalog and the system admin role,
 * and the indexes of its two collections. Conversations and usage expire by
 * their own `expiresAt` (TTL 0), so the retention can change without
 * rebuilding the index. Idempotent.
 */
export const willDooMigration: Migration = {
  version: 4,
  name: "willdoo",
  async up({ db }) {
    const c = collections(db);
    for (const permission of V4_PERMISSIONS) {
      await c.permissions.updateOne(
        { key: permission.key },
        { $set: { module: permission.module, description: permission.description } },
        { upsert: true }
      );
    }
    await c.roles.updateOne(
      { key: ADMIN_ROLE_KEY },
      {
        $addToSet: { permissionKeys: { $each: V4_PERMISSIONS.map((permission) => permission.key) } },
        $set: { updatedAt: new Date() }
      }
    );
    await c.willdooConversations.createIndex({ userId: 1, updatedAt: -1 }, { name: "user_updated" });
    await c.willdooConversations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl" });
    await c.willdooUsage.createIndex({ createdAt: 1 }, { name: "created" });
    await c.willdooUsage.createIndex({ userId: 1, createdAt: 1 }, { name: "user_created" });
    await c.willdooUsage.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl" });
  }
};
