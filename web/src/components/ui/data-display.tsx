import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn, initials, toneFor, type Tone } from "../../lib/utils";
import { IconTile } from "./misc";

export function Avatar({
  name,
  seed,
  size = "md",
  className
}: {
  name: string;
  /** Stable value (e.g. id) that picks the color; defaults to the name. */
  seed?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      title={name}
      className={cn(
        `tone-${toneFor(seed ?? name)}`,
        "grid shrink-0 place-items-center bg-tone-100 font-extrabold text-tone-700",
        size === "xs" && "size-[22px] rounded-[8px] text-[9.5px]",
        size === "sm" && "size-[26px] rounded-[9px] text-[10.5px]",
        size === "md" && "size-9 rounded-[12px] text-[12.5px]",
        size === "lg" && "size-14 rounded-[18px] text-lg",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Single-choice filter chips; the selected one is inverted (dark). */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex h-[38px] items-center gap-2 rounded-btn border-[1.5px] px-[15px] text-sm font-semibold transition-colors duration-150",
            option.value === value
              ? "border-ink bg-ink text-surface"
              : "border-line bg-surface text-muted hover:border-line-2 hover:text-ink"
          )}
        >
          {option.label}
          {option.count !== undefined ? <span className="text-xs opacity-70">{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{children}</div>;
}

/** Metric card. With `to`, the whole card is a link. */
export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  to
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  to?: string;
}) {
  const body = (
    <div
      className={cn(
        `tone-${tone}`,
        "group flex h-full flex-col items-start gap-3 rounded-[18px] border border-line bg-surface p-4 shadow-sh1 transition-[background-color,border-color,transform,box-shadow] duration-200 ease-soft",
        "sm:flex-row sm:gap-3.5",
        to && "hover:-translate-y-0.5 hover:border-tone-100 hover:bg-tone-25 hover:shadow-sh2"
      )}
    >
      <IconTile icon={icon} tone={tone} className="group-hover:scale-105" />
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-muted">{label}</p>
        <p className="mt-0.5 text-2xl leading-tight font-extrabold tracking-[-0.02em]">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-faint">{hint}</p> : null}
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block rounded-[18px]">
      {body}
    </Link>
  ) : (
    body
  );
}
