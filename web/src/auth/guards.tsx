import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { EmptyState, Spinner } from "../components/ui/misc";
import { useSession } from "./session";

export const CHANGE_PASSWORD_PATH = "/change-password";

function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner />
    </div>
  );
}

/**
 * Client-side guard for UX only: the backend enforces sessions and
 * permissions on every request regardless of what the UI shows.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return <FullPageSpinner />;
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (session.user.mustChangePassword && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }
  return <>{children}</>;
}

export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { can } = useSession();
  return can(permission) ? <>{children}</> : <Forbidden />;
}

function HomeLink() {
  return (
    <Link
      to="/"
      className="inline-flex h-[38px] items-center rounded-btn border-[1.5px] border-line-2 bg-surface px-[15px] text-sm font-semibold hover:bg-n-25"
    >
      Back to home
    </Link>
  );
}

/** Integration screens: only when the backend enabled the feature for this user. */
export function RequireFeature({ feature, children }: { feature: string; children: ReactNode }) {
  const { hasFeature } = useSession();
  return hasFeature(feature) ? <>{children}</> : <NotFound />;
}

export function Forbidden() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <EmptyState
        icon={ShieldAlert}
        title="Access denied"
        message="You do not have permission to see this section. Ask an administrator if you need it."
        action={<HomeLink />}
      />
    </div>
  );
}

export function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <EmptyState title="Page not found" message="This address does not exist or has moved." action={<HomeLink />} />
    </div>
  );
}
