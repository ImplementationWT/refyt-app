import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { verifyPassword } from "../src/auth/password.js";
import { ALL_PERMISSION_KEYS } from "../src/auth/permissions.js";
import { collections } from "../src/db/collections.js";
import {
  LATEST_SCHEMA_VERSION,
  readSchemaVersion,
  runMigrations,
  type MigrationContext
} from "../src/db/migrations/index.js";
import { initialMigration } from "../src/db/migrations/001-initial.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

const silentLog = { info: () => undefined };

function context(db: MigrationContext["db"], seed: Partial<MigrationContext["seed"]> = {}) {
  return {
    db,
    seed: { initialAdminPassword: undefined, forceAdminPasswordChange: true, ...seed },
    log: silentLog
  };
}

describe.skipIf(skipDb)("migrations", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  it("creates the catalog, system roles and the admin user", async () => {
    const db = mongo.freshDb();
    const version = await runMigrations(context(db));
    const c = collections(db);

    expect(version).toBe(LATEST_SCHEMA_VERSION);
    expect(await readSchemaVersion({ db })).toBe(LATEST_SCHEMA_VERSION);
    expect((await c.permissions.find().toArray()).map((p) => p.key).sort()).toEqual(
      [...ALL_PERMISSION_KEYS].sort()
    );

    const admin = await c.roles.findOne({ key: "admin" });
    expect(admin?.isSystem).toBe(true);
    expect(admin?.permissionKeys.sort()).toEqual([...ALL_PERMISSION_KEYS].sort());
    const userRole = await c.roles.findOne({ key: "user" });
    expect(userRole?.permissionKeys).toEqual(["notifications.read"]);

    const user = await c.users.findOne({ username: "admin" });
    expect(user?.mustChangePassword).toBe(true);
    expect(user?.roleIds.map(String)).toEqual([String(admin?._id)]);
    expect(await verifyPassword("admin123", user!.passwordHash)).toBe(true);

    const sessionIndexes = await c.sessions.indexes();
    expect(sessionIndexes.find((i) => i.name === "expires_ttl")?.expireAfterSeconds).toBe(0);
  });

  it("uses INITIAL_ADMIN_PASSWORD and FORCE_ADMIN_PASSWORD_CHANGE when given", async () => {
    const db = mongo.freshDb();
    await runMigrations(
      context(db, { initialAdminPassword: "provided-password-1", forceAdminPasswordChange: false })
    );
    const user = await collections(db).users.findOne({ username: "admin" });

    expect(user?.mustChangePassword).toBe(false);
    expect(await verifyPassword("provided-password-1", user!.passwordHash)).toBe(true);
    expect(await verifyPassword("admin123", user!.passwordHash)).toBe(false);
  });

  it("is idempotent and never overwrites an existing admin", async () => {
    const db = mongo.freshDb();
    const c = collections(db);
    await runMigrations(context(db));
    const before = await c.users.findOne({ username: "admin" });
    await c.users.updateOne(
      { _id: before!._id },
      { $set: { passwordHash: "changed-by-user", mustChangePassword: false } }
    );
    await c.roles.updateOne({ key: "user" }, { $set: { permissionKeys: ["audit.read"] } });

    // Runner twice, and the migration body itself twice (e.g. after a crash
    // between applying it and recording the version).
    await runMigrations(context(db, { initialAdminPassword: "another-password-1" }));
    await initialMigration.up(context(db, { initialAdminPassword: "another-password-1" }));
    await initialMigration.up(context(db));

    expect(await c.users.countDocuments()).toBe(1);
    // admin, user and the 13 roles of REFYT's process (migration 5).
    expect(await c.roles.countDocuments()).toBe(15);
    expect(await c.permissions.countDocuments()).toBe(ALL_PERMISSION_KEYS.length);
    expect(await c.metadata.countDocuments({ key: "schema" })).toBe(1);

    const after = await c.users.findOne({ username: "admin" });
    expect(after?.passwordHash).toBe("changed-by-user");
    expect(after?.mustChangePassword).toBe(false);
    expect(after?._id).toEqual(before?._id);
    // Customizations of the editable "user" role are preserved.
    expect((await c.roles.findOne({ key: "user" }))?.permissionKeys).toEqual(["audit.read"]);
  });

  it("migration 2 adds dashboard.read to the admin role only, keeping customizations", async () => {
    const db = mongo.freshDb();
    const c = collections(db);
    // A database created by template 1.1.0 (only migration 1 applied).
    await runMigrations(context(db), [initialMigration]);
    expect(await readSchemaVersion({ db })).toBe(1);
    expect((await c.roles.findOne({ key: "admin" }))?.permissionKeys).not.toContain("dashboard.read");
    await c.roles.updateOne({ key: "user" }, { $set: { permissionKeys: ["roles.read"] } });

    await runMigrations(context(db));
    await runMigrations(context(db));

    expect(await readSchemaVersion({ db })).toBe(LATEST_SCHEMA_VERSION);
    expect(await c.permissions.countDocuments({ key: "dashboard.read" })).toBe(1);
    const admin = await c.roles.findOne({ key: "admin" });
    expect(admin?.permissionKeys.filter((key) => key === "dashboard.read")).toHaveLength(1);
    expect((await c.roles.findOne({ key: "user" }))?.permissionKeys).toEqual(["roles.read"]);
  });

  it("migration 5 creates REFYT's process roles with the apps of their team, keeping edits", async () => {
    const db = mongo.freshDb();
    await runMigrations(context(db));
    const c = collections(db);

    const roles = await c.roles.find({ key: { $nin: ["admin", "user"] } }).sort({ key: 1 }).toArray();
    expect(roles.map((role) => role.key)).toEqual([
      "accounts", "assessment-approver", "assessor", "commercial", "design-approver", "designer", "director",
      "hsse-lead", "install-coordinator", "order-approver", "payment-approver", "site-manager", "survey-admin"
    ]);
    const byKey = new Map(roles.map((role) => [role.key, role]));
    expect(byKey.get("assessor")?.permissionKeys).toEqual(["notifications.read", "refyt.retrofit"]);
    expect(byKey.get("site-manager")?.permissionKeys).toEqual(["notifications.read", "refyt.delivery"]);
    expect(byKey.get("director")?.permissionKeys).toEqual(
      expect.arrayContaining(["refyt.director", "refyt.commercial", "refyt.accounts", "refyt.retrofit", "refyt.delivery", "refyt.view_as"])
    );
    expect(roles.every((role) => !role.isSystem)).toBe(true);
    const admin = await c.roles.findOne({ key: "admin" });
    expect(admin?.permissionKeys).toEqual(expect.arrayContaining(["refyt.director", "refyt.view_as"]));

    // Running it again keeps what an administrator changed.
    await c.roles.updateOne({ key: "assessor" }, { $set: { name: "Retrofit assessor", permissionKeys: ["refyt.retrofit"] } });
    await db.collection("app_metadata").updateOne({ key: "schema" }, { $set: { version: 4 } });
    await runMigrations(context(db));
    const assessor = await c.roles.findOne({ key: "assessor" });
    expect(assessor?.name).toBe("Retrofit assessor");
    expect(assessor?.permissionKeys).toEqual(["refyt.retrofit"]);
  });

  it("only runs migrations newer than the recorded version", async () => {
    const db = mongo.freshDb();
    await runMigrations(context(db));
    let calls = 0;
    const next = { version: LATEST_SCHEMA_VERSION + 1, name: "test", up: async () => void calls++ };

    await runMigrations(context(db), [initialMigration, next]);
    await runMigrations(context(db), [initialMigration, next]);

    expect(calls).toBe(1);
    expect(await readSchemaVersion({ db })).toBe(LATEST_SCHEMA_VERSION + 1);
  });
});
