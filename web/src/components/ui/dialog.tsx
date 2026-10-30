import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button, IconButton } from "./button";

/** Opens/closes a native <dialog> as modal (focus trap, Esc, top layer). */
function useNativeDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // jsdom does not implement showModal; fall back to the open attribute.
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);
  return ref;
}

function Header({
  titleId,
  title,
  description,
  onClose,
  leading
}: {
  titleId: string;
  title: string;
  description?: string;
  onClose: () => void;
  leading?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-6 pt-[22px] pb-3.5">
      {leading}
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className="text-[22px] leading-tight tracking-[-0.025em]">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <IconButton size="sm" onClick={onClose} aria-label="Cerrar">
        <X />
      </IconButton>
    </div>
  );
}

/** Centered modal. Put actions in <DialogFooter>. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  wide = false
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useNativeDialog(open);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby={titleId}
      className={cn(
        "m-auto max-h-[calc(100%-40px)] rounded-modal border-0 bg-surface p-0 text-ink shadow-sh3 open:animate-pop",
        wide ? "w-[min(760px,calc(100%-24px))]" : "w-[min(600px,calc(100%-24px))]"
      )}
    >
      {open ? (
        <>
          <Header titleId={titleId} title={title} description={description} onClose={onClose} />
          <div className="px-6 pb-5">{children}</div>
        </>
      ) : null}
    </dialog>
  );
}

export function DialogFooter({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="-mx-6 mt-6 -mb-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-line px-6 py-4">
      {note ? <p className="mr-auto text-[13px] text-muted">{note}</p> : null}
      {children}
    </div>
  );
}

/** Panel sliding in from the right, for details of a record. */
export function Sheet({
  open,
  onClose,
  title,
  description,
  leading,
  children,
  footer
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  leading?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useNativeDialog(open);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby={titleId}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[min(560px,100%)] max-w-none rounded-l-[24px] border-0 bg-surface p-0 text-ink shadow-sh3 open:flex open:animate-sheet open:flex-col"
    >
      {open ? (
        <>
          <Header titleId={titleId} title={title} description={description} onClose={onClose} leading={leading} />
          <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          {footer ? (
            <div className="flex flex-wrap gap-2.5 border-t border-line px-6 py-4">{footer}</div>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  destructive = false,
  pending = false,
  error,
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      {error ? (
        <p className="text-sm font-medium text-danger-500" role="alert">
          {error}
        </p>
      ) : null}
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm} disabled={pending}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
