import { AlertTriangle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";
import logo from "./assets/refyt-logo.png";

/** Full-page frame for signing in and changing the password, in Refyt's greens. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rf-auth rfx">
      <img className="rf-auth-logo" src={logo} alt="REFYT" />
      <main className="rf-auth-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </main>
    </div>
  );
}

/** Refyt's form field: label above, input below (.tsel + .um-in), with error or hint. */
export const AuthField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }
>(({ label, error, hint, ...props }, ref) => {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="tsel">
      <label htmlFor={id}>
        <small>{label}</small>
      </label>
      <input
        ref={ref}
        id={id}
        className="um-in"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <span id={`${id}-error`} className="rf-ferr">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="rf-fhint">
          {hint}
        </span>
      ) : null}
    </div>
  );
});
AuthField.displayName = "AuthField";

/** Refyt's red notice (.ds-w.stop). */
export function AuthError({ children }: { children: ReactNode }) {
  return (
    <div className="ds-w stop" role="alert">
      <AlertTriangle size={17} aria-hidden />
      <div>
        <b>{children}</b>
      </div>
    </div>
  );
}
