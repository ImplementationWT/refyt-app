import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, KeyRound, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Avatar } from "../components/ui/data-display";
import { Sheet } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/form";
import { Alert, IconTile, Pill, Spinner } from "../components/ui/misc";
import { useToast } from "../components/ui/toast";
import { api, ApiError } from "../lib/api";
import { MODULE_ICONS, MODULE_LABELS, MODULE_TONES } from "../lib/modules";
import type { User, UserPermissionRow, UserPermissions } from "../lib/types";
import { cn } from "../lib/utils";

/**
 * Per-user permissions: what the roles give, plus what was added to or
 * removed from this user. Saving sends the desired effective set; the
 * backend stores the difference against the roles.
 */
export function UserPermissionsSheet({ user, onClose }: { user: User | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({
    queryKey: ["users", user?.id, "permissions"],
    queryFn: () => api<UserPermissions>(`/api/users/${user!.id}/permissions`),
    enabled: user !== null
  });
  const data = query.data;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data) setSelected(new Set(data.permissions.filter((row) => row.effective).map((row) => row.key)));
  }, [data]);

  const original = useMemo(
    () => new Set(data?.permissions.filter((row) => row.effective).map((row) => row.key) ?? []),
    [data]
  );
  const changes = data ? data.permissions.filter((row) => original.has(row.key) !== selected.has(row.key)).length : 0;

  const save = useMutation({
    mutationFn: () =>
      api(`/api/users/${user!.id}/permissions`, { method: "PUT", body: { permissionKeys: [...selected] } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ tone: "success", message: `Permissions of ${user?.displayName} updated` });
      onClose();
    }
  });

  const grouped = new Map<string, UserPermissionRow[]>();
  for (const row of data?.permissions ?? []) {
    grouped.set(row.module, [...(grouped.get(row.module) ?? []), row]);
  }
  const editable = data?.editable ?? false;
  const toggle = (key: string, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  // Back to exactly what the roles give (no per-user adjustments).
  const resetToRoles = () =>
    setSelected(new Set(data?.permissions.filter((row) => row.fromRoles.length > 0).map((row) => row.key)));

  return (
    <Sheet
      open={user !== null}
      onClose={onClose}
      title={user ? `Permissions of ${user.displayName}` : ""}
      description={data ? `${selected.size} of ${data.permissions.length} permissions active` : undefined}
      leading={user ? <Avatar name={user.displayName} seed={user.id} size="lg" /> : null}
      footer={
        editable ? (
          <>
            <p className="mr-auto self-center text-[13px] text-muted">
              {changes ? `${changes} unsaved ${changes === 1 ? "change" : "changes"}` : "No changes"}
            </p>
            <Button variant="ghost" onClick={resetToRoles} disabled={save.isPending}>
              <RotateCcw /> Role permissions only
            </Button>
            <Button onClick={() => save.mutate()} disabled={!changes || save.isPending}>
              {save.isPending ? "Saving…" : "Save permissions"}
            </Button>
          </>
        ) : undefined
      }
    >
      {query.isPending ? (
        <Spinner />
      ) : query.isError ? (
        <Alert>No se pudieron cargar los permisos. {query.error.message}</Alert>
      ) : (
        <div className="space-y-4">
          {!editable ? (
            <div className="flex items-start gap-2.5 rounded-field border border-brand-100 bg-brand-25 px-3.5 py-2.5 text-sm text-brand-700">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                {data?.isAdmin
                  ? "Administrators always have every permission."
                  : data?.isSelf
                    ? "You cannot change your own permissions."
                    : "Read only: you cannot change this user's permissions."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Permissions come from roles. You can add or remove some for this person only, without changing the role.
            </p>
          )}
          {save.error instanceof ApiError ? <Alert>{save.error.message}</Alert> : null}

          {[...grouped].map(([module, rows]) => {
            const tone = MODULE_TONES[module] ?? "neutral";
            return (
              <section key={module} className={`tone-${tone} rounded-btn border border-line bg-tone-25 p-3.5`}>
                <h3 className="mb-2 flex items-center gap-2.5 text-sm font-bold">
                  <IconTile icon={MODULE_ICONS[module] ?? KeyRound} tone={tone} size="sm" />
                  {MODULE_LABELS[module] ?? module}
                </h3>
                <div className="grid gap-1">
                  {rows.map((row) => {
                    const on = selected.has(row.key);
                    const fromRole = row.fromRoles.length > 0;
                    // Granting needs the permission yourself; removing is always allowed.
                    const disabled = !editable || (!on && !row.grantable);
                    return (
                      <label
                        key={row.key}
                        className={cn(
                          "flex items-start gap-2.5 rounded-btn px-1.5 py-1.5 text-sm",
                          disabled ? "cursor-default" : "cursor-pointer hover:bg-surface"
                        )}
                        title={!editable || row.grantable || on ? undefined : "You cannot grant a permission you do not have"}
                      >
                        <Checkbox
                          className="mt-0.5"
                          checked={on}
                          disabled={disabled}
                          onChange={(event) => toggle(row.key, event.target.checked)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={cn(!on && "text-muted")}>{row.description}</span>
                          <code className="ml-1.5 text-xs text-faint">{row.key}</code>
                          <span className="mt-1 flex flex-wrap gap-1">
                            {fromRole && on ? (
                              <Pill tone="neutral">Role: {row.fromRoles.join(", ")}</Pill>
                            ) : null}
                            {fromRole && !on ? <Pill tone="red">Removed (role: {row.fromRoles.join(", ")})</Pill> : null}
                            {!fromRole && on ? <Pill tone="green">Added</Pill> : null}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
