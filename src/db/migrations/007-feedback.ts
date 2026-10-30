import { ADMIN_ROLE_KEY } from "../../auth/permissions.js";
import { collections } from "../collections.js";
import type { Migration } from "./types.js";

// Frozen: applied migrations never change.
const V7_PERMISSIONS = [
  { key: "feedback.manage", module: "feedback", description: "Review feedback and switch the feedback module on or off" }
];

/** Feedback module: its permission for the admin role, its indexes and the switch (on). Idempotent. */
export const feedbackMigration: Migration = {
  version: 7,
  name: "feedback",
  async up({ db }) {
    const c = collections(db);
    for (const permission of V7_PERMISSIONS) {
      await c.permissions.updateOne(
        { key: permission.key },
        { $set: { module: permission.module, description: permission.description } },
        { upsert: true }
      );
    }
    await c.roles.updateOne(
      { key: ADMIN_ROLE_KEY },
      { $addToSet: { permissionKeys: { $each: V7_PERMISSIONS.map((permission) => permission.key) } }, $set: { updatedAt: new Date() } }
    );
    await c.feedback.createIndex({ createdAt: -1 }, { name: "created" });
    await c.feedback.createIndex({ status: 1, createdAt: -1 }, { name: "status_created" });
    await c.metadata.updateOne(
      { key: "feedback" },
      { $setOnInsert: { key: "feedback", enabled: true, updatedAt: new Date() } },
      { upsert: true }
    );
  }
};
