import { CircleAlert, CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export interface ToastOptions {
  message: string;
  tone?: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
  durationMs?: number;
}

interface ToastState extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

/** One toast at a time, bottom center, dark; a new one replaces the previous. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    counter.current += 1;
    setToast({ ...options, id: counter.current });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.durationMs ?? 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const Icon = toast?.tone === "error" ? CircleAlert : CircleCheck;

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[90]">
        {toast ? (
          <div
            key={toast.id}
            className="pointer-events-auto fixed bottom-[calc(22px+env(safe-area-inset-bottom,0px))] left-1/2 flex max-w-[calc(100%-32px)] -translate-x-1/2 animate-toast items-center gap-3 rounded-btn bg-ink px-[18px] py-3 text-sm font-semibold text-surface shadow-sh3"
          >
            {toast.tone !== "info" ? (
              <Icon
                aria-hidden
                className={toast.tone === "error" ? "size-[18px] text-danger-100" : "size-[18px] text-ok-500"}
              />
            ) : null}
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className="font-bold whitespace-nowrap text-warn-300 hover:underline"
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return show;
}
