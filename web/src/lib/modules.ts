import { Bell, Bot, History, KanbanSquare, KeyRound, LayoutDashboard, Plug, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import type { Tone } from "./utils";

/** Presentation of each permission module (labels, colors, icons). */
export const MODULE_LABELS: Record<string, string> = {
  users: "Usuarios",
  roles: "Roles",
  permissions: "Permisos",
  notifications: "Notificaciones",
  audit: "Auditoría",
  dashboard: "Dashboards",
  integrations: "Integraciones",
  monday: "Monday",
  willdoo: "Will Doo"
};

export const MODULE_TONES: Record<string, Tone> = {
  users: "blue",
  roles: "violet",
  permissions: "teal",
  notifications: "amber",
  audit: "pink",
  dashboard: "brand",
  integrations: "teal",
  monday: "orange",
  willdoo: "violet"
};

export const MODULE_ICONS: Record<string, LucideIcon> = {
  users: Users,
  roles: ShieldCheck,
  permissions: KeyRound,
  notifications: Bell,
  audit: History,
  dashboard: LayoutDashboard,
  integrations: Plug,
  monday: KanbanSquare,
  willdoo: Bot
};
