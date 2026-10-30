import { hashPassword } from "../../auth/password.js";
import { DEFAULT_ADMIN_PASSWORD } from "../../auth/password-policy.js";
import { ADMIN_ROLE_KEY, ADMIN_USERNAME, USER_ROLE_KEY } from "../../auth/permissions.js";
import { collections } from "../collections.js";
import type { Migration } from "./types.js";

// Catalog as of this migration. Frozen on purpose: applied migrations never
// change; later permissions are added by later migrations.
const V1_PERMISSIONS = [
  { key: "users.read", module: "users", description: "Ver usuarios" },
  { key: "users.create", module: "users", description: "Crear usuarios" },
  { key: "users.update", module: "users", description: "Editar usuarios, roles asignados y contraseñas" },
  { key: "users.delete", module: "users", description: "Eliminar usuarios" },
  { key: "roles.read", module: "roles", description: "Ver roles" },
  { key: "roles.create", module: "roles", description: "Crear roles" },
  { key: "roles.update", module: "roles", description: "Editar roles" },
  { key: "roles.delete", module: "roles", description: "Eliminar roles" },
  { key: "permissions.read", module: "permissions", description: "Ver el catálogo de permisos" },
  { key: "notifications.read", module: "notifications", description: "Ver y marcar notificaciones propias" },
  { key: "notifications.manage", module: "notifications", description: "Enviar notificaciones a usuarios" },
  { key: "audit.read", module: "audit", description: "Ver el registro de auditoría" }
];

/**
 * Initial schema: indexes, permission catalog, system roles and the admin user.
 * Every step is idempotent (createIndex, upserts with $setOnInsert).
 * No collMod / validators: the app user only has readWrite.
 */
export const initialMigration: Migration = {
  version: 1,
  name: "initial",
  async up({ db, seed, log }) {
    const c = collections(db);

    await c.users.createIndex({ username: 1 }, { unique: true, name: "username_unique" });
    await c.users.createIndex(
      { email: 1 },
      { unique: true, name: "email_unique", partialFilterExpression: { email: { $type: "string" } } }
    );
    await c.users.createIndex({ roleIds: 1, status: 1 }, { name: "roles_status" });
    await c.roles.createIndex({ key: 1 }, { unique: true, name: "key_unique" });
    await c.permissions.createIndex({ key: 1 }, { unique: true, name: "key_unique" });
    await c.notifications.createIndex(
      { userId: 1, readAt: 1, createdAt: -1 },
      { name: "user_read_created" }
    );
    await c.auditLogs.createIndex({ createdAt: -1 }, { name: "created" });
    await c.auditLogs.createIndex({ actorId: 1, createdAt: -1 }, { name: "actor_created" });
    await c.sessions.createIndex({ sessionIdHash: 1 }, { unique: true, name: "id_hash_unique" });
    await c.sessions.createIndex({ userId: 1 }, { name: "user" });
    await c.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "expires_ttl" });

    for (const permission of V1_PERMISSIONS) {
      await c.permissions.updateOne(
        { key: permission.key },
        { $set: { module: permission.module, description: permission.description } },
        { upsert: true }
      );
    }

    const now = new Date();
    // The admin role always holds the full catalog; it cannot be edited via the API.
    await c.roles.updateOne(
      { key: ADMIN_ROLE_KEY },
      {
        $set: { permissionKeys: V1_PERMISSIONS.map((p) => p.key), isSystem: true, updatedAt: now },
        $setOnInsert: {
          name: "Administrador",
          description: "Acceso total al sistema",
          createdAt: now
        }
      },
      { upsert: true }
    );
    // Default role for regular users; editable afterwards, so only set on insert.
    await c.roles.updateOne(
      { key: USER_ROLE_KEY },
      {
        $setOnInsert: {
          name: "Usuario",
          description: "Permisos mínimos",
          permissionKeys: ["notifications.read"],
          isSystem: false,
          createdAt: now,
          updatedAt: now
        }
      },
      { upsert: true }
    );

    const adminRole = await c.roles.findOne({ key: ADMIN_ROLE_KEY }, { projection: { _id: 1 } });
    if (!adminRole) {
      throw new Error("Admin role missing after upsert");
    }

    // Never overwrite an existing admin: hash only if it is going to be inserted.
    if (await c.users.findOne({ username: ADMIN_USERNAME }, { projection: { _id: 1 } })) {
      return;
    }
    const usingDefault = seed.initialAdminPassword === undefined;
    const passwordHash = await hashPassword(seed.initialAdminPassword ?? DEFAULT_ADMIN_PASSWORD);
    const result = await c.users.updateOne(
      { username: ADMIN_USERNAME },
      {
        $setOnInsert: {
          username: ADMIN_USERNAME,
          displayName: "Administrador",
          passwordHash,
          roleIds: [adminRole._id],
          status: "active",
          mustChangePassword: seed.forceAdminPasswordChange,
          lastLoginAt: null,
          failedLoginCount: 0,
          lockedUntil: null,
          createdAt: now,
          updatedAt: now
        }
      },
      { upsert: true }
    );
    if (result.upsertedCount === 1) {
      log.info(
        { passwordSource: usingDefault ? "default" : "INITIAL_ADMIN_PASSWORD" },
        "initial admin user created"
      );
    }
  }
};
