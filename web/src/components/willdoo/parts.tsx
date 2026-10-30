import type { ReactNode } from "react";
import avatarUrl from "../../assets/will-doo.png";
import { cn } from "../../lib/utils";

export function WillDooAvatar({ className }: { className?: string }) {
  return <img src={avatarUrl} alt="" aria-hidden className={cn("shrink-0 rounded-full bg-brand-50 object-cover", className)} />;
}

/** Floating button that opens Will (bottom right, above the content). */
export function WillDooLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open Will Doo"
      title="Ask Will Doo"
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full border-[1.5px] border-brand-100 bg-surface shadow-sh3 transition-transform duration-200 ease-soft hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
    >
      <WillDooAvatar className="size-11" />
    </button>
  );
}

/** Panel: full screen on phones, a card at the bottom right on larger screens. */
export function WillDooPanel({ subtitle, actions, children }: { subtitle: string; actions: ReactNode; children: ReactNode }) {
  return (
    <section
      role="dialog"
      aria-label="Will Doo"
      className="fixed inset-0 z-50 flex animate-pop flex-col bg-surface sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(640px,calc(100svh-6rem))] sm:w-[400px] sm:rounded-modal sm:border sm:border-line sm:shadow-sh3"
    >
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <WillDooAvatar className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="leading-tight font-bold">Will Doo</p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
