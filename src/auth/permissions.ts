/** System permission catalog. Generic: no client or business permissions. */
export const PERMISSIONS = [
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
  { key: "audit.read", module: "audit", description: "Ver el registro de auditoría" },
  { key: "dashboard.read", module: "dashboard", description: "Ver los indicadores del dashboard" },
  { key: "integrations.read", module: "integrations", description: "Ver el estado de las integraciones" },
  { key: "integrations.manage", module: "integrations", description: "Probar la conexión de las integraciones" },
  { key: "monday.read", module: "monday", description: "Ver los tableros de Monday.com" },
  { key: "willdoo.use", module: "willdoo", description: "Conversar con Will Doo (co-pilot con IA)" },
  { key: "willdoo.audit", module: "willdoo", description: "Revisar las conversaciones y el gasto de Will Doo" }
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((permission) => permission.key);

export const ADMIN_ROLE_KEY = "admin";
export const USER_ROLE_KEY = "user";
export const ADMIN_USERNAME = "admin";

export function isPermissionKey(value: string): value is PermissionKey {
  return (ALL_PERMISSION_KEYS as string[]).includes(value);
}
