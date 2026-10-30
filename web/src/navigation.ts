import { House, KanbanSquare, LayoutDashboard, Plug, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import type { Tone } from "./lib/utils";

/** Brand mark shown in the header and login. Each project may replace it. */
export const BRAND_ICON: LucideIcon = Sparkles;

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  tone: Tone;
  /** Required permission (any of them if a list); none = every user. */
  permission?: string | string[];
  /** Integration feature that must be enabled for the user (from /api/auth/me). */
  feature?: string;
  /** One line for the dashboard shortcut card. */
  description?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Single source for the sidebar and the dashboard shortcuts. Projects add
 * their own groups between "General" and "Configuración"
 * (e.g. { id: "ventas", label: "Ventas", items: [...] }).
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "general",
    label: "General",
    items: [
      { to: "/", label: "Refyt", icon: House, tone: "brand", description: "Directores, Comercial, Cuentas, Retrofit y Delivery" },
      { to: "/panel", label: "Dashboards", icon: LayoutDashboard, tone: "brand", description: "Indicadores y actividad" }
    ]
  },
  // ── Project groups go here ──
  {
    id: "integrations",
    label: "Integraciones",
    items: [
      {
        to: "/monday",
        label: "Monday",
        icon: KanbanSquare,
        tone: "orange",
        permission: "monday.read",
        feature: "monday",
        description: "Tableros de Monday.com"
      }
    ]
  },
  {
    id: "config",
    label: "Configuración",
    items: [
      {
        to: "/usuarios",
        label: "Usuarios",
        icon: Users,
        tone: "blue",
        permission: "users.read",
        description: "Cuentas, accesos y permisos"
      },
      { to: "/roles", label: "Roles", icon: ShieldCheck, tone: "violet", permission: "roles.read", description: "Agrupa permisos por función" },
      {
        to: "/integraciones",
        label: "Integraciones",
        icon: Plug,
        tone: "teal",
        permission: "integrations.read",
        description: "Servicios externos conectados"
      }
    ]
  }
];

type Can = (permission: string) => boolean;
type HasFeature = (feature: string) => boolean;
const noFeatures: HasFeature = () => false;

export function canSee(item: Pick<NavItem, "permission" | "feature">, can: Can, hasFeature: HasFeature = noFeatures): boolean {
  if (item.feature && !hasFeature(item.feature)) return false;
  if (!item.permission) return true;
  const required = Array.isArray(item.permission) ? item.permission : [item.permission];
  return required.some(can);
}

/** Groups with only the items the user may see; empty groups are dropped. */
export function visibleNavGroups(can: Can, hasFeature: HasFeature = noFeatures): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canSee(item, can, hasFeature))
  })).filter(
    (group) => group.items.length > 0
  );
}

export function visibleNavItems(can: Can, hasFeature: HasFeature = noFeatures): NavItem[] {
  return visibleNavGroups(can, hasFeature).flatMap((group) => group.items);
}
