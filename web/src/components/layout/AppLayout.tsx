import { ChevronDown, KeyRound, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { CHANGE_PASSWORD_PATH } from "../../auth/guards";
import { useMeta, useSession } from "../../auth/session";
import { useTheme } from "../../lib/theme";
import { cn } from "../../lib/utils";
import { BRAND_ICON, visibleNavGroups } from "../../navigation";
import { IconButton } from "../ui/button";
import { Avatar } from "../ui/data-display";
import { WillDooChat } from "../willdoo/WillDoo";
import { WillDooBasic } from "../willdoo/WillDooBasic";
import { IconTile } from "../ui/misc";
import { Dropdown, MenuItem } from "./dropdown";

const COLLAPSED_KEY = "sidebar-collapsed";
const HEADER_HEIGHT = "h-[66px]";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function BrandMark({ className }: { className?: string }) {
  const Icon = BRAND_ICON;
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[12px] bg-[linear-gradient(145deg,#6b80f0,#3949c2)] text-white shadow-[0_6px_14px_-6px_rgb(57_73_194/0.7)]",
        className
      )}
    >
      <Icon className="size-5" strokeWidth={2.2} />
    </span>
  );
}

export function AppLayout() {
  const { data: meta } = useMeta();
  const { hasFeature } = useSession();
  const appName = meta?.appName ?? "Aplicación";
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.title = appName;
  }, [appName]);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, value ? "0" : "1");
      } catch {
        // Storage unavailable: keep the in-memory state only.
      }
      return !value;
    });
  };

  return (
    <div className="flex min-h-svh flex-col">
      <Header appName={appName} onOpenMenu={() => setMobileOpen(true)} />
      <div className="flex flex-1">
        {mobileOpen ? (
          <div className="fixed inset-0 z-30 bg-scrim md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
        ) : null}
        <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggleCollapsed={toggleCollapsed} />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div key={location.pathname} className="mx-auto max-w-[1400px] animate-view">
            <Outlet />
          </div>
        </main>
      </div>
      {/* Will Doo + Claude (chat) or Will Doo solo (quick queries); the backend decides. */}
      {hasFeature("willdoo-ai") ? <WillDooChat /> : hasFeature("willdoo") ? <WillDooBasic /> : null}
    </div>
  );
}

function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
}) {
  const { can, hasFeature } = useSession();
  const groups = visibleNavGroups(can, hasFeature);

  return (
    <aside
      aria-label="Navegación principal"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-line bg-surface transition-[transform,width] duration-300 ease-soft",
        "md:sticky md:top-[66px] md:z-10 md:h-[calc(100dvh-66px)] md:translate-x-0",
        mobileOpen ? "translate-x-0 shadow-sh3" : "-translate-x-full",
        collapsed ? "md:w-[78px]" : "md:w-[248px]"
      )}
    >
      <nav className="flex-1 overflow-y-auto px-3.5 py-5">
        {groups.map((group, index) => (
          <div key={group.id} className={cn(index > 0 && "mt-5")}>
            <p
              className={cn(
                "mb-2 px-3 text-[12.5px] font-bold text-faint",
                collapsed && "md:sr-only"
              )}
            >
              {group.label}
            </p>
            {collapsed && index > 0 ? <hr className="mx-3 mb-3 hidden border-line md:block" /> : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex min-h-[46px] items-center gap-3 rounded-[14px] px-2 text-[14.5px] font-semibold text-muted transition-colors duration-150",
                        "hover:bg-brand-25 hover:text-ink",
                        isActive && "bg-brand-50 text-brand-700 hover:bg-brand-50 hover:text-brand-700",
                        collapsed && "md:justify-center md:px-0"
                      )
                    }
                  >
                    <IconTile icon={item.icon} tone={item.tone} size="sm" className="group-hover:scale-105" />
                    <span className={cn("truncate", collapsed && "md:sr-only")}>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="hidden border-t border-line p-3 md:block">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
          aria-expanded={!collapsed}
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-btn px-3 text-sm font-semibold text-muted transition-colors hover:bg-n-50 hover:text-ink [&_svg]:size-[18px]",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {collapsed ? null : <span>Contraer menú</span>}
        </button>
      </div>
    </aside>
  );
}

function Header({ appName, onOpenMenu }: { appName: string; onOpenMenu: () => void }) {
  return (
    <header
      className={cn(
        HEADER_HEIGHT,
        "sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-md md:px-5"
      )}
    >
      <IconButton className="md:hidden" onClick={onOpenMenu} aria-label="Abrir menú">
        <Menu />
      </IconButton>
      <Link to="/" className="flex min-w-0 items-center gap-3 rounded-btn">
        <BrandMark />
        <div className="min-w-0">
          <p className="truncate text-[15.5px] leading-tight font-extrabold tracking-[-0.02em]">{appName}</p>
          <p className="hidden text-[12.5px] text-muted sm:block">Panel de gestión</p>
        </div>
      </Link>
      <div className="ml-auto flex items-center gap-2.5">
        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const { session, logout } = useSession();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const user = session?.user;
  if (!user) return null;
  const roleLabel = user.roles.map((role) => role.name).join(", ") || "Sin rol";

  return (
    <Dropdown
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Menú de usuario"
          className={cn(
            "flex items-center gap-2.5 rounded-[14px] p-1 pr-1 text-left transition-colors hover:bg-n-50 sm:pr-3",
            open && "bg-n-50"
          )}
        >
          <Avatar name={user.displayName} seed={user.id} />
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-40 truncate text-sm leading-tight font-bold">{user.displayName}</span>
            <span className="block max-w-40 truncate text-xs text-muted">{roleLabel}</span>
          </span>
          <ChevronDown className="hidden size-4 text-faint sm:block" aria-hidden />
        </button>
      )}
    >
      {(close) => (
        <div role="menu">
          <div className="mb-1 flex items-center gap-3 rounded-[13px] bg-n-25 p-2.5">
            <Avatar name={user.displayName} seed={user.id} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.displayName}</p>
              <p className="truncate text-xs text-muted">{user.email ?? `@${user.username}`}</p>
            </div>
          </div>
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-left text-[14px] font-medium transition-colors hover:bg-n-50"
          >
            <Moon className="size-4 text-muted" aria-hidden />
            Modo oscuro
            <span
              aria-hidden
              className={cn(
                "relative ml-auto h-6 w-10 rounded-full transition-colors duration-200",
                theme === "dark" ? "bg-brand-600" : "bg-n-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sh1 transition-transform duration-200 ease-soft",
                  theme === "dark" && "translate-x-4"
                )}
              />
            </span>
          </button>
          <MenuItem
            onSelect={() => {
              close();
              navigate(CHANGE_PASSWORD_PATH);
            }}
          >
            <KeyRound /> Cambiar contraseña
          </MenuItem>
          <hr className="my-1.5 border-line" />
          <MenuItem
            destructive
            onSelect={async () => {
              close();
              await logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut /> Cerrar sesión
          </MenuItem>
        </div>
      )}
    </Dropdown>
  );
}
