import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Bell, History, LogIn, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { CHANGE_PASSWORD_PATH } from "../auth/guards";
import { useMeta, useSession } from "../auth/session";
import { BrandMark } from "../components/layout/AppLayout";
import { Button } from "../components/ui/button";
import { Field, Input } from "../components/ui/form";
import { Alert, Spinner } from "../components/ui/misc";
import { api, ApiError } from "../lib/api";
import type { Session } from "../lib/types";

const schema = z.object({
  username: z.string().trim().min(1, { error: "Introduce tu usuario" }),
  password: z.string().min(1, { error: "Introduce tu contraseña" })
});
type Values = z.infer<typeof schema>;

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Cada persona ve solo lo que su rol permite" },
  { icon: Bell, text: "Avisos al instante para todo el equipo" },
  { icon: History, text: "Registro de actividad siempre disponible" }
];

export function LoginPage() {
  const { session, isLoading, setSession } = useSession();
  const { data: meta } = useMeta();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const appName = meta?.appName ?? "Aplicación";

  useEffect(() => {
    document.title = `Iniciar sesión · ${appName}`;
  }, [appName]);

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
      <div className="flex min-h-svh items-center justify-center">
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
        ? "Usuario o contraseña incorrectos"
        : login.error.message
      : login.error
        ? "No se pudo iniciar sesión"
        : null;

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Welcome panel (decorative) */}
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#4960de_0%,#3949c2_45%,#2b3799_100%)] p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -bottom-32 -left-20 size-96 rounded-full bg-[#6b80f0]/40 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <BrandMark className="bg-white/15 bg-none shadow-none ring-1 ring-white/25" />
          <p className="text-lg font-extrabold tracking-[-0.02em]">{appName}</p>
        </div>
        <div className="relative mt-auto max-w-md">
          <p className="text-[34px] leading-[1.15] font-extrabold tracking-[-0.03em]">Todo tu equipo, en un solo lugar.</p>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] text-white/90">
                <span className="grid size-9 place-items-center rounded-[12px] bg-white/15" aria-hidden>
                  <Icon className="size-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-[400px] animate-view">
          <BrandMark className="mb-6 size-12 rounded-[15px] lg:hidden" />
          <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.03em]">{appName}</h1>
          <p className="mt-1.5 mb-8 text-[15px] text-muted">Hola de nuevo. Inicia sesión para continuar.</p>
          <form className="grid gap-4" noValidate onSubmit={form.handleSubmit((values) => login.mutate(values))}>
            {errorMessage ? <Alert>{errorMessage}</Alert> : null}
            <Field label="Usuario" error={form.formState.errors.username?.message}>
              {(props) => <Input {...props} autoComplete="username" autoFocus {...form.register("username")} />}
            </Field>
            <Field label="Contraseña" error={form.formState.errors.password?.message}>
              {(props) => (
                <Input {...props} type="password" autoComplete="current-password" {...form.register("password")} />
              )}
            </Field>
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={login.isPending}>
              <LogIn /> {login.isPending ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
