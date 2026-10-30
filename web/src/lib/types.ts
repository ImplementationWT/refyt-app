// Shapes returned by the backend API (see docs/TEMPLATE_CONTRACT.md).

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Meta {
  appName: string;
  clientId: string | null;
  templateVersion: string | number | null;
  schemaVersion: number | null;
}

export interface RoleSummary {
  id: string;
  key: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  displayName: string;
  status: "active" | "disabled";
  mustChangePassword: boolean;
  roles: RoleSummary[];
  /** Per-user adjustments on top of the roles. */
  grantedPermissionKeys: string[];
  revokedPermissionKeys: string[];
  locked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  permissions: string[];
  /** Optional integrations available to this user (e.g. "monday"). */
  features?: string[];
}

export interface IntegrationStatus {
  id: string;
  label: string;
  configured: boolean;
}

export type IntegrationErrorCode = "auth_failed" | "timeout" | "rate_limited" | "unavailable";

export type ConnectionTestResult = { ok: true } | { ok: false; error: IntegrationErrorCode };

export interface MondayBoard {
  id: string;
  name: string;
  workspaceName: string | null;
  url: string | null;
}

export interface Role {
  id: string;
  key: string;
  name: string;
  description: string;
  permissionKeys: string[];
  isSystem: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  key: string;
  module: string;
  description: string;
}

export interface UserPermissionRow extends Permission {
  fromRoles: string[];
  granted: boolean;
  revoked: boolean;
  effective: boolean;
  /** The current user may grant it (they hold it themselves). */
  grantable: boolean;
}

export interface UserPermissions {
  user: { id: string; username: string; displayName: string };
  isAdmin: boolean;
  isSelf: boolean;
  editable: boolean;
  permissions: UserPermissionRow[];
}

export interface DashboardDay {
  date: string;
  logins: number;
  failures: number;
}

export interface DashboardData {
  range: { days: number; tz: string; from: string; to: string };
  kpis: {
    activeUsers: number;
    disabledUsers: number;
    roles: number;
    logins: number;
    failedLogins: number;
    uniqueUsers: number;
  };
  series: DashboardDay[];
}

export type FeedbackType = "bug" | "idea" | "question";
export type FeedbackStatus = "new" | "in_progress" | "fixed" | "wont_fix";

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  username: string;
  type: FeedbackType;
  message: string;
  page: string;
  screen: string | null;
  status: FeedbackStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/feedback/settings; newCount only for those who review it (feedback.manage). */
export interface FeedbackSettings {
  enabled: boolean;
  newCount?: number;
}
