import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { SESSION_KEY, useSession } from "../auth/session";
import { useToast } from "../components/ui/toast";
import { api } from "../lib/api";
import { applyApiError } from "../lib/hooks";
import { passwordSchema } from "../lib/password";
import { AuthError, AuthField, AuthLayout } from "../refyt/AuthLayout";

export function ChangePasswordPage() {
  const { session, logout } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const forced = session?.user.mustChangePassword ?? false;
  const username = session?.user.username ?? "";

  const schema = z
    .object({
      currentPassword: z.string().min(1, { error: "Introduce tu contraseña actual" }),
      newPassword: passwordSchema(() => username),
      confirmPassword: z.string()
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      path: ["confirmPassword"],
      error: "Las contraseñas no coinciden"
    })
    .refine((values) => values.newPassword !== values.currentPassword, {
      path: ["newPassword"],
      error: "La nueva contraseña debe ser distinta de la actual"
    });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });
  const change = useMutation({
    mutationFn: ({ currentPassword, newPassword }: Values) =>
      api("/api/auth/change-password", { method: "POST", body: { currentPassword, newPassword } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_KEY });
      toast({ message: "Contraseña actualizada", tone: "success" });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setFormError(applyApiError(error, form.setError, []));
    }
  });

  // Standalone screen: while the change is forced there is no navigation.
  return (
    <AuthLayout
      title="Cambiar contraseña"
      subtitle={
        forced
          ? "Por seguridad debes establecer una contraseña nueva antes de continuar."
          : "Las demás sesiones abiertas se cerrarán al cambiarla."
      }
    >
      <form
        className="rf-auth-form"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          setFormError(null);
          change.mutate(values);
        })}
      >
        {formError ? <AuthError>{formError}</AuthError> : null}
        <AuthField
          label="Contraseña actual"
          type="password"
          autoComplete="current-password"
          error={form.formState.errors.currentPassword?.message}
          {...form.register("currentPassword")}
        />
        <AuthField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 10 caracteres; distinta de tu usuario."
          error={form.formState.errors.newPassword?.message}
          {...form.register("newPassword")}
        />
        <AuthField
          label="Repite la nueva contraseña"
          type="password"
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
        <div className="rf-auth-acts">
          {forced ? (
            <button type="button" className="btn sec lg" onClick={() => logout().then(() => navigate("/login", { replace: true }))}>
              Cerrar sesión
            </button>
          ) : (
            <button type="button" className="btn sec lg" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn pri lg" disabled={change.isPending}>
            {change.isPending ? "Guardando…" : "Guardar contraseña"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
