import type { RoleDoc, UserDoc } from "../../db/collections.js";

export interface RoleSummary {
  id: string;
  key: string;
  name: string;
}

/** Explicit allow-list: passwordHash and lockout internals are never exposed. */
export function toPublicUser(user: UserDoc, rolesById: ReadonlyMap<string, RoleDoc>) {
  const roles: RoleSummary[] = user.roleIds
    .map((id) => rolesById.get(String(id)))
    .filter((role): role is RoleDoc => role !== undefined)
    .map((role) => ({ id: String(role._id), key: role.key, name: role.name }));

  return {
    id: String(user._id),
    username: user.username,
    email: user.email ?? null,
    displayName: user.displayName,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
    roles,
    grantedPermissionKeys: user.grantedPermissionKeys ?? [],
    revokedPermissionKeys: user.revokedPermissionKeys ?? [],
    locked: user.lockedUntil !== null && user.lockedUntil > new Date(),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;

export function rolesMap(roles: RoleDoc[]): Map<string, RoleDoc> {
  return new Map(roles.map((role) => [String(role._id), role]));
}
