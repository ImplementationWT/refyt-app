import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Small disclosure menu: closes on outside click and Escape. */
export function Dropdown({
  trigger,
  children,
  align = "end",
  className
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open ? (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] z-50 w-72 animate-pop rounded-[18px] border border-line bg-surface p-1.5 text-ink shadow-sh2",
            align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            className
          )}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({
  children,
  onSelect,
  destructive
}: {
  children: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-left text-[14px] font-medium transition-colors hover:bg-n-50 [&_svg]:size-4 [&_svg]:text-muted",
        destructive && "text-danger-500 hover:bg-danger-25 [&_svg]:text-danger-500"
      )}
    >
      {children}
    </button>
  );
}
