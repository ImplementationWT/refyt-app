import { useQuery } from "@tanstack/react-query";
import { ChevronDown, KeyRound, LogOut, MessageSquarePlus, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CHANGE_PASSWORD_PATH } from "../auth/guards";
import { useSession } from "../auth/session";
import { FeedbackDialog } from "../components/feedback/FeedbackDialog";
import { api } from "../lib/api";
import { FEEDBACK_SETTINGS_KEY } from "../lib/feedback";
import type { FeedbackSettings } from "../lib/types";
import { ADMIN_GROUP_ID, visibleNavGroups } from "../navigation";
import { initials } from "./utils";

/** User section of the Refyt header: who is signed in and, in a dropdown, the admin screens. */
export function UserMenu() {
  const { session, can, hasFeature, logout } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
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

  // The feedback module can be switched off by an administrator (Feedback screen).
  const feedback = useQuery({
    queryKey: FEEDBACK_SETTINGS_KEY,
    queryFn: () => api<FeedbackSettings>("/api/feedback/settings"),
    enabled: Boolean(session?.user),
    staleTime: 60_000
  });

  const user = session?.user;
  if (!user) return null;
  const roleLabel = user.roles.map((role) => role.name).join(", ") || "No role";
  // Users, Roles, Integrations and Feedback, only those the user may open.
  const items = visibleNavGroups(can, hasFeature).find((group) => group.id === ADMIN_GROUP_ID)?.items ?? [];
  const close = () => setOpen(false);

  return (
    <div className="rf-um" ref={ref}>
      <button
        type="button"
        className="rf-umb"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="rf-uav" aria-hidden>
          {initials(user.displayName)}
        </span>
        <span className="rf-umn">
          <b>{user.displayName}</b>
          <small>{roleLabel}</small>
        </span>
        <ChevronDown size={14} aria-hidden />
      </button>
      {open ? (
        <div className="rf-pop rf-ump" role="menu" aria-label="User menu">
          <div className="rf-umh">
            <span className="rf-uav" aria-hidden>
              {initials(user.displayName)}
            </span>
            <div>
              <b>{user.displayName}</b>
              <small>{user.email ?? `@${user.username}`}</small>
            </div>
          </div>
          {items.length ? (
            <>
              <small className="rf-ph">Administration</small>
              {items.map((item) => (
                <MenuLink key={item.to} to={item.to} icon={item.icon} label={item.label} note={item.description} onSelect={close} />
              ))}
              <div className="rf-psep" />
            </>
          ) : null}
          {feedback.data?.enabled ? (
            <button
              type="button"
              role="menuitem"
              className="rf-pi"
              onClick={() => {
                close();
                setFeedbackOpen(true);
              }}
            >
              <span className="rf-ai">
                <MessageSquarePlus size={15} aria-hidden />
              </span>
              <b>Send feedback</b>
            </button>
          ) : null}
          <MenuLink to={CHANGE_PASSWORD_PATH} icon={KeyRound} label="Change password" onSelect={close} />
          <button
            type="button"
            role="menuitem"
            className="rf-pi danger"
            onClick={async () => {
              close();
              await logout();
              navigate("/login", { replace: true });
            }}
          >
            <span className="rf-ai">
              <LogOut size={15} aria-hidden />
            </span>
            <b>Sign out</b>
          </button>
        </div>
      ) : null}
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  note,
  onSelect
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  note?: string;
  onSelect: () => void;
}) {
  return (
    <Link to={to} role="menuitem" className="rf-pi" onClick={onSelect}>
      <span className="rf-ai">
        <Icon size={15} aria-hidden />
      </span>
      <b>{label}</b>
      {note ? <small>{note}</small> : null}
    </Link>
  );
}
