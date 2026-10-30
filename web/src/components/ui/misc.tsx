import { AlertCircle, Inbox, Loader2, type LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn, type Tone } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-line bg-surface shadow-sh1", className)} {...props} />;
}

/** Rounded square with a tinted icon; the color comes from the tone. */
export function IconTile({
  icon: Icon,
  tone = "brand",
  size = "md",
  className
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        `tone-${tone}`,
        "grid shrink-0 place-items-center bg-tone-50 text-tone-700 transition-transform duration-300 ease-soft",
        size === "sm" && "size-8 rounded-tile [&_svg]:size-4",
        size === "md" && "size-10 rounded-btn [&_svg]:size-[18px]",
        size === "lg" && "size-11 rounded-btn [&_svg]:size-5",
        className
      )}
    >
      <Icon />
    </span>
  );
}

/** Small status label. */
export function Pill({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        `tone-${tone}`,
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-tone-50 px-2.5 py-[3px] text-[12.5px] font-bold text-tone-700 [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  );
}

export function Spinner({ className, label = "Loading…" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <Loader2 className="size-4 animate-spin text-brand-500" aria-hidden />
      {label}
    </span>
  );
}

export function Alert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-field border border-danger-100 bg-danger-25 px-3.5 py-2.5 text-sm font-medium text-danger-700",
        className
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon = Inbox,
  action,
  className
}: {
  title: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border-[1.5px] border-dashed border-line-2 px-5 py-10 text-center", className)}>
      <IconTile icon={icon} tone="neutral" size="lg" className="mx-auto mb-3" />
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {message ? <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{message}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  icon,
  tone = "brand"
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {icon ? <IconTile icon={icon} tone={tone} size="lg" /> : null}
        <div>
          <h1 className="text-[26px] leading-tight font-extrabold tracking-[-0.025em]">{title}</h1>
          {description ? <p className="mt-0.5 text-[14.5px] text-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
