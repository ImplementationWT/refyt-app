/** System permission catalog: the template's generic permissions plus access to the Refyt apps. */
export const PERMISSIONS = [
  { key: "users.read", module: "users", description: "See users" },
  { key: "users.create", module: "users", description: "Create users" },
  { key: "users.update", module: "users", description: "Edit users, assigned roles and passwords" },
  { key: "users.delete", module: "users", description: "Delete users" },
  { key: "roles.read", module: "roles", description: "See roles" },
  { key: "roles.create", module: "roles", description: "Create roles" },
  { key: "roles.update", module: "roles", description: "Edit roles" },
  { key: "roles.delete", module: "roles", description: "Delete roles" },
  { key: "permissions.read", module: "permissions", description: "See the permission catalog" },
  { key: "notifications.read", module: "notifications", description: "See and mark your own notifications" },
  { key: "notifications.manage", module: "notifications", description: "Send notifications to users" },
  { key: "audit.read", module: "audit", description: "See the audit log" },
  { key: "dashboard.read", module: "dashboard", description: "See the dashboard indicators" },
  { key: "integrations.read", module: "integrations", description: "See the status of the integrations" },
  { key: "integrations.manage", module: "integrations", description: "Test the integrations' connection" },
  { key: "monday.read", module: "monday", description: "See the Monday.com boards" },
  { key: "willdoo.use", module: "willdoo", description: "Chat with Will Doo (AI co-pilot)" },
  { key: "willdoo.audit", module: "willdoo", description: "Review Will Doo's conversations and spending" },
  { key: "refyt.director", module: "refyt", description: "Open the Refyt Director app" },
  { key: "refyt.commercial", module: "refyt", description: "Open the Refyt Commercial app" },
  { key: "refyt.accounts", module: "refyt", description: "Open the Refyt Accounts app" },
  { key: "refyt.retrofit", module: "refyt", description: "Open the Refyt Retrofit app" },
  { key: "refyt.delivery", module: "refyt", description: "Open the Refyt Delivery app" },
  { key: "refyt.view_as", module: "refyt", description: "See Refyt as any role (the “Viewing as” selector)" }
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((permission) => permission.key);

export const ADMIN_ROLE_KEY = "admin";
export const USER_ROLE_KEY = "user";
export const ADMIN_USERNAME = "admin";

export function isPermissionKey(value: string): value is PermissionKey {
  return (ALL_PERMISSION_KEYS as string[]).includes(value);
}
