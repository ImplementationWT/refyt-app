import { initialMigration } from "./001-initial.js";
import { dashboardMigration } from "./002-dashboard.js";
import { integrationsMigration } from "./003-integrations.js";
import { willDooMigration } from "./004-willdoo.js";
import type { Migration, MigrationContext } from "./types.js";

export type { Migration, MigrationContext } from "./types.js";

/** Ordered list. Append new migrations; never edit or reorder applied ones. */
export const MIGRATIONS: readonly Migration[] = [initialMigration, dashboardMigration, integrationsMigration, willDooMigration];

export const LATEST_SCHEMA_VERSION = MIGRATIONS.at(-1)?.version ?? 0;

const SCHEMA_KEY = "schema";

export async function readSchemaVersion(context: Pick<MigrationContext, "db">): Promise<number> {
  const doc = await context.db.collection("app_metadata").findOne({ key: SCHEMA_KEY });
  return typeof doc?.version === "number" ? doc.version : 0;
}

/**
 * Applies pending migrations in order and records each version in
 * app_metadata { key: "schema", version, appliedAt }. Returns the version.
 */
export async function runMigrations(
  context: MigrationContext,
  migrations: readonly Migration[] = MIGRATIONS
): Promise<number> {
  let current = await readSchemaVersion(context);

  for (const migration of migrations) {
    if (migration.version <= current) {
      continue;
    }
    context.log.info({ version: migration.version, name: migration.name }, "applying migration");
    await migration.up(context);
    await context.db
      .collection("app_metadata")
      .updateOne(
        { key: SCHEMA_KEY },
        { $set: { version: migration.version, appliedAt: new Date() } },
        { upsert: true }
      );
    current = migration.version;
  }

  return current;
}
