import {
  Bell,
  Bot,
  History,
  House,
  KanbanSquare,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  Plug,
  ShieldCheck,
  Users,
  type LucideIcon
} from "lucide-react";
import type { Tone } from "./utils";

/** Presentation of each permission module (labels, colors, icons). */
export const MODULE_LABELS: Record<string, string> = {
  users: "Users",
  roles: "Roles",
  permissions: "Permissions",
  notifications: "Notifications",
  audit: "Audit",
  dashboard: "Dashboards",
  integrations: "Integrations",
  monday: "Monday",
  willdoo: "Will Doo",
  refyt: "Refyt apps",
  feedback: "Feedback"
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
  willdoo: "violet",
  refyt: "brand",
  feedback: "amber"
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
  willdoo: Bot,
  refyt: House,
  feedback: MessageSquareText
};
