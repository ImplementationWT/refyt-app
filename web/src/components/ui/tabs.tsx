import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";
import { cn, type Tone } from "../../lib/utils";

export interface TabLink {
  to: string;
  label: string;
  icon: LucideIcon;
  tone?: Tone;
}

/** Segmented tabs that are links (each tab has its own URL). */
export function TabLinks({ tabs, label }: { tabs: TabLink[]; label: string }) {
  return (
    <nav aria-label={label} className="mb-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-btn border border-line bg-n-50 p-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            cn(
              `tone-${tab.tone ?? "brand"}`,
              "flex h-10 items-center gap-2.5 rounded-btn pr-4 pl-1.5 text-sm font-semibold whitespace-nowrap text-muted transition-colors duration-150",
              "hover:bg-surface hover:text-ink",
              isActive && "bg-surface text-ink shadow-sh1"
            )
          }
        >
          <span aria-hidden className="grid size-7 place-items-center rounded-[9px] bg-tone-50 text-tone-700 [&_svg]:size-4">
            <tab.icon />
          </span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
