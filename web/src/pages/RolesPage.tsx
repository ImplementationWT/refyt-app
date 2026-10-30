import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Lock, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "../auth/session";
import { Button, IconButton } from "../components/ui/button";
import { DataTable, type Column } from "../components/ui/data-table";
import { ConfirmDialog, Dialog, DialogFooter } from "../components/ui/dialog";
import { Checkbox, Field, Input } from "../components/ui/form";
import { Alert, IconTile, PageHeader, Pill, Spinner } from "../components/ui/misc";
import { useToast } from "../components/ui/toast";
import { api, ApiError, toQuery } from "../lib/api";
import { applyApiError, useListState } from "../lib/hooks";
import type { Page, Permission, Role } from "../lib/types";
import { MODULE_ICONS, MODULE_LABELS, MODULE_TONES } from "../lib/modules";

const ROLES_KEY = ["roles"] as const;

export function RolesPage() {
  const { can } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const list = useListState("name");
  const [editing, setEditing] = useState<Role | "new" | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const query = useQuery({
    queryKey: [...ROLES_KEY, list.page, list.q, list.sort],
    queryFn: () => api<Page<Role>>(`/api/roles${toQuery({ page: list.page, pageSize: 20, q: list.q, sort: list.sort })}`),
    placeholderData: (previous) => previous
  });

  const remove = useMutation({
    mutationFn: (role: Role) => api(`/api/roles/${role.id}`, { method: "DELETE" }),
    onSuccess: (_data, role) => {
      setDeleting(null);
      toast({ tone: "success", message: `Se eliminó el rol ${role.name}` });
      return queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    }
  });

  const columns: Column<Role>[] = [
    {
      key: "name",
      header: "Rol",
      sortField: "name",
      cell: (role) => (
        <div className="flex items-center gap-3">
          <IconTile icon={role.isSystem ? Lock : ShieldCheck} tone={role.isSystem ? "brand" : "violet"} size="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold">
              {role.name}
              {role.isSystem ? <Pill tone="brand">Sistema</Pill> : null}
            </p>
            <p className="text-[13px] text-muted">
              <code>{role.key}</code>
            </p>
          </div>
        </div>
      )
    },
    {
      key: "description",
      header: "Descripción",
      className: "hidden md:table-cell text-muted",
      cell: (role) => role.description || "—"
    },
    {
      key: "permissions",
      header: "Permisos",
      cell: (role) => <Pill tone="teal">{role.permissionKeys.length}</Pill>
    },
    {
      key: "users",
      header: "Usuarios",
      cell: (role) => <Pill tone="blue">{role.userCount ?? "—"}</Pill>
    },
    {
      key: "actions",
      header: "Acciones",
      className: "text-right",
      cell: (role) =>
        role.isSystem ? null : (
          <div className="flex justify-end gap-0.5">
            {can("roles.update") ? (
              <IconButton size="sm" aria-label={`Editar ${role.name}`} onClick={() => setEditing(role)}>
                <Pencil />
              </IconButton>
            ) : null}
            {can("roles.delete") ? (
              <IconButton
                size="sm"
                className="hover:bg-danger-25 hover:text-danger-500"
                aria-label={`Eliminar ${role.name}`}
                onClick={() => setDeleting(role)}
              >
                <Trash2 />
              </IconButton>
            ) : null}
          </div>
        )
    }
  ];

  return (
    <div>
      <PageHeader
        icon={ShieldCheck}
        tone="violet"
        title="Roles"
        description="Agrupan permisos que luego se asignan a los usuarios."
        actions={
          can("roles.create") ? (
            <Button onClick={() => setEditing("new")}>
              <Plus /> Nuevo rol
            </Button>
          ) : null
        }
      />
      <div className="relative mb-4 w-full max-w-sm">
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <Input
          aria-label="Buscar roles"
          placeholder="Buscar por nombre o clave"
          className="pl-10"
          value={list.search}
          onChange={(event) => list.setSearch(event.target.value)}
        />
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(role) => role.id}
        isLoading={query.isPending}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyIcon={ShieldCheck}
        emptyMessage="No hay roles que mostrar"
        sort={list.sort}
        onSortChange={list.setSort}
        pagination={
          query.data && {
            page: query.data.page,
            pageSize: query.data.pageSize,
            total: query.data.total,
            onPageChange: list.setPage
          }
        }
      />
      {editing ? (
        <RoleFormDialog
          role={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(name, created) => {
            setEditing(null);
            toast({ tone: "success", message: created ? `Se creó el rol ${name}` : "Cambios guardados" });
          }}
        />
      ) : null}
      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar rol"
        description={`Se eliminará el rol «${deleting?.name}». No debe estar asignado a ningún usuario.`}
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        error={remove.error instanceof ApiError ? remove.error.message : null}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
      />
    </div>
  );
}

const roleSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z][a-z0-9_.-]{1,49}$/, {
      error: "Usa de 2 a 50 caracteres: letras minúsculas, números, punto, guion o guion bajo"
    }),
  name: z.string().trim().min(1, { error: "Introduce el nombre" }).max(100),
  description: z.string().trim().max(500),
  permissionKeys: z.array(z.string())
});
type RoleValues = z.infer<typeof roleSchema>;

function RoleFormDialog({
  role,
  onClose,
  onSaved
}: {
  role: Role | null;
  onClose: () => void;
  onSaved: (name: string, created: boolean) => void;
}) {
  const { can } = useSession();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const creating = role === null;

  const catalog = useQuery({
    queryKey: ["permissions"],
    queryFn: () => api<Page<Permission>>("/api/permissions"),
    enabled: can("permissions.read")
  });

  const form = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      key: role?.key ?? "",
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissionKeys: role?.permissionKeys ?? []
    }
  });

  const save = useMutation({
    mutationFn: (values: RoleValues) =>
      creating
        ? api("/api/roles", { method: "POST", body: values })
        : api(`/api/roles/${role.id}`, {
            method: "PATCH",
            body: { name: values.name, description: values.description, permissionKeys: values.permissionKeys }
          }),
    onSuccess: async (_data, values) => {
      await queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      onSaved(values.name, creating);
    },
    onError: (error) => setFormError(applyApiError(error, form.setError, ["key", "name", "description", "permissionKeys"]))
  });

  const grouped = new Map<string, Permission[]>();
  for (const permission of catalog.data?.items ?? []) {
    grouped.set(permission.module, [...(grouped.get(permission.module) ?? []), permission]);
  }
  const errors = form.formState.errors;
  const selected = form.watch("permissionKeys").length;

  return (
    <Dialog open onClose={onClose} title={creating ? "Nuevo rol" : `Editar ${role.name}`} wide>
      <form
        className="grid gap-4"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          setFormError(null);
          save.mutate(values);
        })}
      >
        {formError ? <Alert>{formError}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" error={errors.name?.message}>
            {(props) => <Input {...props} {...form.register("name")} />}
          </Field>
          <Field label="Clave" hint={creating ? "No se puede cambiar después." : undefined} error={errors.key?.message}>
            {(props) => <Input {...props} disabled={!creating} autoComplete="off" {...form.register("key")} />}
          </Field>
        </div>
        <Field label="Descripción" error={errors.description?.message}>
          {(props) => <Input {...props} {...form.register("description")} />}
        </Field>
        <fieldset>
          <legend className="mb-2 flex w-full items-center justify-between text-[13.5px] font-semibold">
            Permisos <Pill tone="teal">{selected} seleccionados</Pill>
          </legend>
          {!can("permissions.read") ? (
            <Alert>Necesitas el permiso «permissions.read» para ver el catálogo.</Alert>
          ) : catalog.isPending ? (
            <Spinner />
          ) : catalog.isError ? (
            <Alert>No se pudo cargar el catálogo de permisos.</Alert>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...grouped].map(([module, permissions]) => {
                const tone = MODULE_TONES[module] ?? "neutral";
                return (
                  <div key={module} className={`tone-${tone} rounded-[18px] border border-line bg-tone-25 p-3.5`}>
                    <p className="mb-2.5 flex items-center gap-2.5 text-sm font-bold">
                      <IconTile icon={MODULE_ICONS[module] ?? KeyRound} tone={tone} size="sm" />
                      {MODULE_LABELS[module] ?? module}
                    </p>
                    <div className="grid gap-1.5">
                      {permissions.map((permission) => (
                        <label
                          key={permission.key}
                          className="flex cursor-pointer items-start gap-2.5 rounded-[11px] px-1.5 py-1 text-sm hover:bg-surface"
                        >
                          <Checkbox className="mt-0.5" value={permission.key} {...form.register("permissionKeys")} />
                          <span>
                            {permission.description}
                            <code className="ml-1.5 text-xs text-faint">{permission.key}</code>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Guardando…" : creating ? "Crear rol" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
