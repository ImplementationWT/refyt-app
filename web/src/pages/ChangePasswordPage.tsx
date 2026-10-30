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
      currentPassword: z.string().min(1, { error: "Enter your current password" }),
      newPassword: passwordSchema(() => username),
      confirmPassword: z.string()
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      path: ["confirmPassword"],
      error: "The passwords do not match"
    })
    .refine((values) => values.newPassword !== values.currentPassword, {
      path: ["newPassword"],
      error: "The new password must be different from the current one"
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
      toast({ message: "Password updated", tone: "success" });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setFormError(applyApiError(error, form.setError, []));
    }
  });

  // Standalone screen: while the change is forced there is no navigation.
  return (
    <AuthLayout
      title="Change password"
      subtitle={
        forced
          ? "For security, set a new password before you continue."
          : "Your other open sessions will be signed out when you change it."
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
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={form.formState.errors.currentPassword?.message}
          {...form.register("currentPassword")}
        />
        <AuthField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 10 characters, different from your username."
          error={form.formState.errors.newPassword?.message}
          {...form.register("newPassword")}
        />
        <AuthField
          label="Repeat the new password"
          type="password"
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
        <div className="rf-auth-acts">
          {forced ? (
            <button type="button" className="btn sec lg" onClick={() => logout().then(() => navigate("/login", { replace: true }))}>
              Sign out
            </button>
          ) : (
            <button type="button" className="btn sec lg" onClick={() => navigate(-1)}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn pri lg" disabled={change.isPending}>
            {change.isPending ? "Saving…" : "Save password"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
