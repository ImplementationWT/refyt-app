import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { CHANGE_PASSWORD_PATH } from "../auth/guards";
import { useMeta, useSession } from "../auth/session";
import { Spinner } from "../components/ui/misc";
import { api, ApiError } from "../lib/api";
import type { Session } from "../lib/types";
import { AuthError, AuthField, AuthLayout } from "../refyt/AuthLayout";
import { TAB_TITLE } from "../refyt/RefytHeader";

const schema = z.object({
  username: z.string().trim().min(1, { error: "Enter your username" }),
  password: z.string().min(1, { error: "Enter your password" })
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const { session, isLoading, setSession } = useSession();
  const { data: meta } = useMeta();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const appName = meta?.appName ?? "Refyt";

  useEffect(() => {
    document.title = TAB_TITLE;
  }, []);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } });
  const login = useMutation({
    mutationFn: (values: Values) => api<Session>("/api/auth/login", { method: "POST", body: values }),
    onSuccess: (next) => {
      setSession(next);
      navigate(next.user.mustChangePassword ? CHANGE_PASSWORD_PATH : from, { replace: true });
    },
    onError: () => form.resetField("password")
  });

  if (isLoading) {
    return (
      <div className="rf-auth">
        <Spinner />
      </div>
    );
  }
  if (session) {
    return <Navigate to={session.user.mustChangePassword ? CHANGE_PASSWORD_PATH : "/"} replace />;
  }

  // The backend answers with the same generic message for unknown users,
  // wrong passwords, locked or disabled accounts.
  const errorMessage =
    login.error instanceof ApiError
      ? login.error.status === 401
        ? "Incorrect username or password"
        : login.error.message
      : login.error
        ? "Could not sign in"
        : null;

  return (
    <AuthLayout title={appName} subtitle="Welcome back. Sign in to continue.">
      <form className="rf-auth-form" noValidate onSubmit={form.handleSubmit((values) => login.mutate(values))}>
        {errorMessage ? <AuthError>{errorMessage}</AuthError> : null}
        <AuthField
          label="Username"
          autoComplete="username"
          autoFocus
          error={form.formState.errors.username?.message}
          {...form.register("username")}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        <button type="submit" className="btn pri lg" disabled={login.isPending}>
          <LogIn size={16} aria-hidden /> {login.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
