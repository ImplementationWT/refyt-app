import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { SESSION_KEY, useSession } from "../auth/session";
import { Button } from "../components/ui/button";
import { Field, Input } from "../components/ui/form";
import { Alert, Card, IconTile } from "../components/ui/misc";
import { useToast } from "../components/ui/toast";
import { api } from "../lib/api";
import { applyApiError } from "../lib/hooks";
import { passwordSchema } from "../lib/password";

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
    <div className="flex min-h-svh items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md animate-view p-7 shadow-sh2">
        <IconTile icon={KeyRound} tone="amber" size="lg" className="mb-4" />
        <h1 className="text-2xl font-extrabold tracking-[-0.025em]">Cambiar contraseña</h1>
        <p className="mt-1 mb-6 text-[14.5px] text-muted">
          {forced
            ? "Por seguridad debes establecer una contraseña nueva antes de continuar."
            : "Las demás sesiones abiertas se cerrarán al cambiarla."}
        </p>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={form.handleSubmit((values) => {
            setFormError(null);
            change.mutate(values);
          })}
        >
          {formError ? <Alert>{formError}</Alert> : null}
          <Field label="Contraseña actual" error={form.formState.errors.currentPassword?.message}>
            {(props) => (
              <Input {...props} type="password" autoComplete="current-password" {...form.register("currentPassword")} />
            )}
          </Field>
          <Field
            label="Nueva contraseña"
            hint="Mínimo 10 caracteres; distinta de tu usuario."
            error={form.formState.errors.newPassword?.message}
          >
            {(props) => <Input {...props} type="password" autoComplete="new-password" {...form.register("newPassword")} />}
          </Field>
          <Field label="Repite la nueva contraseña" error={form.formState.errors.confirmPassword?.message}>
            {(props) => (
              <Input {...props} type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
            )}
          </Field>
          <div className="mt-2 flex justify-end gap-2.5">
            {forced ? (
              <Button variant="ghost" onClick={() => logout().then(() => navigate("/login", { replace: true }))}>
                Cerrar sesión
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
