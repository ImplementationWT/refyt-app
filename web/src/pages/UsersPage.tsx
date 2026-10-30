import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, ListChecks, Pencil, Plus, Power, Search, Trash2, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "../auth/session";
import { Button, IconButton } from "../components/ui/button";
import { Avatar, FilterChips } from "../components/ui/data-display";
import { DataTable, type Column } from "../components/ui/data-table";
import { ConfirmDialog, Dialog, DialogFooter, Sheet } from "../components/ui/dialog";
import { Checkbox, Field, Input } from "../components/ui/form";
import { Alert, PageHeader, Pill, Spinner } from "../components/ui/misc";
import { useToast } from "../components/ui/toast";
import { api, ApiError, toQuery } from "../lib/api";
import { applyApiError, useListState } from "../lib/hooks";
import { passwordSchema } from "../lib/password";
import type { Page, Role, User } from "../lib/types";
import { formatDateTime } from "../lib/utils";
import { UserPermissionsSheet } from "./UserPermissionsSheet";

const USERS_KEY = ["users"] as const;
type StatusFilter = "all" | "active" | "disabled";

function StatusPills({ user, wrap = false }: { user: User; wrap?: boolean }) {
  return (
    <div className={wrap ? "flex flex-wrap gap-1.5" : "flex gap-1.5"}>
      <Pill tone={user.status === "active" ? "green" : "neutral"}>
        {user.status === "active" ? "Active" : "Disabled"}
      </Pill>
      {user.locked ? <Pill tone="red">Locked</Pill> : null}
      {user.mustChangePassword ? <Pill tone="amber" title="Must change the password on next sign-in">Password pending</Pill> : null}
    </div>
  );
}

function RolePills({ user }: { user: User }) {
  const added = user.grantedPermissionKeys.length;
  const removed = user.revokedPermissionKeys.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {user.roles.length ? (
        user.roles.map((role) => (
          <Pill key={role.id} tone={role.key === "admin" ? "brand" : "violet"}>
            {role.name}
          </Pill>
        ))
      ) : (
        <span className="text-faint">No roles</span>
      )}
      {added || removed ? (
        <Pill tone="teal" title="Permissions adjusted for this user only">
          {[added ? `+${added}` : null, removed ? `−${removed}` : null].filter(Boolean).join(" ")} permisos
        </Pill>
      ) : null}
    </div>
  );
}

export function UsersPage() {
  const { session, can } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const list = useListState("username");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [detail, setDetail] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const [confirm, setConfirm] = useState<{ user: User; action: "delete" | "toggle" } | null>(null);
  const [permissionsOf, setPermissionsOf] = useState<User | null>(null);

  const query = useQuery({
    queryKey: [...USERS_KEY, list.page, list.q, list.sort, status],
    queryFn: () =>
      api<Page<User>>(
        `/api/users${toQuery({
          page: list.page,
          pageSize: 20,
          q: list.q,
          sort: list.sort,
          status: status === "all" ? undefined : status
        })}`
      ),
    placeholderData: (previous) => previous
  });
  // Counters for the status chips (same search, one item each).
  const counts = useQuery({
    queryKey: [...USERS_KEY, "counts", list.q],
    queryFn: async () => {
      const total = (s?: string) =>
        api<Page<User>>(`/api/users${toQuery({ pageSize: 1, q: list.q, status: s })}`).then((page) => page.total);
      const [all, active, disabled] = await Promise.all([total(), total("active"), total("disabled")]);
      return { all, active, disabled };
    }
  });

  const confirmMutation = useMutation({
    mutationFn: ({ user, action }: { user: User; action: "delete" | "toggle" }) =>
      action === "delete"
        ? api(`/api/users/${user.id}`, { method: "DELETE" })
        : api(`/api/users/${user.id}`, {
            method: "PATCH",
            body: { status: user.status === "active" ? "disabled" : "active" }
          }),
    onSuccess: (_data, { user, action }) => {
      setConfirm(null);
      setDetail(null);
      toast({
        tone: "success",
        message:
          action === "delete"
            ? `${user.displayName} was deleted`
            : user.status === "active"
              ? `${user.displayName} is now disabled`
              : `${user.displayName} is now active`
      });
      return queryClient.invalidateQueries({ queryKey: USERS_KEY });
    }
  });

  const isSelf = (user: User) => user.id === session?.user.id;

  const rowActions = (user: User) => (
    <div className="flex justify-end gap-0.5">
      <IconButton
        size="sm"
        className="hover:bg-brand-50 hover:text-brand-600"
        aria-label={`Permissions of ${user.username}`}
        title="See and adjust permissions"
        onClick={() => setPermissionsOf(user)}
      >
        <ListChecks />
      </IconButton>
      {can("users.update") ? (
        <>
          <IconButton size="sm" aria-label={`Edit ${user.username}`} onClick={() => setEditing(user)}>
            <Pencil />
          </IconButton>
          {!isSelf(user) ? (
            <>
              <IconButton
                size="sm"
                aria-label={`${user.status === "active" ? "Disable" : "Enable"} ${user.username}`}
                onClick={() => setConfirm({ user, action: "toggle" })}
              >
                <Power />
              </IconButton>
              <IconButton size="sm" aria-label={`Reset password of ${user.username}`} onClick={() => setResetting(user)}>
                <KeyRound />
              </IconButton>
            </>
          ) : null}
        </>
      ) : null}
      {can("users.delete") && !isSelf(user) ? (
        <IconButton
          size="sm"
          className="hover:bg-danger-25 hover:text-danger-500"
          aria-label={`Delete ${user.username}`}
          onClick={() => setConfirm({ user, action: "delete" })}
        >
          <Trash2 />
        </IconButton>
      ) : null}
    </div>
  );

  const columns: Column<User>[] = [
    {
      key: "username",
      header: "User",
      sortField: "displayName",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.displayName} seed={user.id} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.displayName}</p>
            <p className="truncate text-[13px] text-muted">@{user.username}</p>
          </div>
        </div>
      )
    },
    {
      key: "email",
      header: "Email",
      sortField: "email",
      className: "hidden lg:table-cell",
      cell: (user) => user.email ?? <span className="text-faint">—</span>
    },
    { key: "roles", header: "Roles", className: "hidden md:table-cell", cell: (user) => <RolePills user={user} /> },
    { key: "status", header: "Status", sortField: "status", cell: (user) => <StatusPills user={user} /> },
    {
      key: "lastLoginAt",
      header: "Last sign-in",
      sortField: "lastLoginAt",
      className: "hidden xl:table-cell whitespace-nowrap text-muted",
      cell: (user) => formatDateTime(user.lastLoginAt)
    },
    { key: "actions", header: "Actions", className: "text-right", cell: rowActions }
  ];

  return (
    <div>
      <PageHeader
        icon={Users}
        tone="blue"
        title="Users"
        description="Manage sign-in accounts and their roles."
        actions={
          can("users.create") ? (
            <Button onClick={() => setEditing("new")}>
              <Plus /> New user
            </Button>
          ) : null
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            aria-label="Search users"
            placeholder="Search by name, username or email"
            className="pl-10"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
          />
        </div>
        <FilterChips<StatusFilter>
          label="Filter by status"
          value={status}
          onChange={(next) => {
            setStatus(next);
            list.setPage(1);
          }}
          options={[
            { value: "all", label: "All", count: counts.data?.all },
            { value: "active", label: "Active", count: counts.data?.active },
            { value: "disabled", label: "Disabled", count: counts.data?.disabled }
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(user) => user.id}
        isLoading={query.isPending}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyIcon={Users}
        emptyMessage={list.q || status !== "all" ? "No user matches the search" : "No users yet"}
        sort={list.sort}
        onSortChange={list.setSort}
        onRowClick={setDetail}
        rowLabel={(user) => `See details of ${user.displayName}`}
        pagination={
          query.data && {
            page: query.data.page,
            pageSize: query.data.pageSize,
            total: query.data.total,
            onPageChange: list.setPage
          }
        }
      />

      <Sheet
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.displayName ?? ""}
        description={detail ? `@${detail.username}` : undefined}
        leading={detail ? <Avatar name={detail.displayName} seed={detail.id} size="lg" /> : null}
        footer={
          detail ? (
            <>
              <Button variant="secondary" onClick={() => setPermissionsOf(detail)}>
                <ListChecks /> Permissions
              </Button>
              {can("users.update") ? (
              <>
              <Button
                variant="soft"
                onClick={() => {
                  setEditing(detail);
                }}
              >
                <Pencil /> Edit
              </Button>
              {!isSelf(detail) ? (
                <>
                  <Button variant="secondary" onClick={() => setResetting(detail)}>
                    <KeyRound /> Reset password
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirm({ user: detail, action: "toggle" })}>
                    <Power /> {detail.status === "active" ? "Disable" : "Enable"}
                  </Button>
                </>
              ) : null}
              </>
              ) : null}
            </>
          ) : undefined
        }
      >
        {detail ? (
          <div className="space-y-6">
            <StatusPills user={detail} wrap />
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-btn border border-line bg-n-25 p-4 text-sm">
              <DetailRow label="Username">@{detail.username}</DetailRow>
              <DetailRow label="Email">{detail.email ?? "—"}</DetailRow>
              <DetailRow label="Last sign-in">{formatDateTime(detail.lastLoginAt)}</DetailRow>
              <DetailRow label="Created">{formatDateTime(detail.createdAt)}</DetailRow>
              <DetailRow label="Updated">{formatDateTime(detail.updatedAt)}</DetailRow>
            </dl>
            <div>
              <h3 className="mb-2 text-sm font-bold">Assigned roles</h3>
              <RolePills user={detail} />
            </div>
          </div>
        ) : null}
      </Sheet>

      {editing ? (
        <UserFormDialog
          user={editing === "new" ? null : editing}
          canAssignRoles={can("roles.read")}
          onClose={() => setEditing(null)}
          onSaved={(saved, created) => {
            setEditing(null);
            setDetail((current) => (current && current.id === saved.id ? saved : current));
            toast({ tone: "success", message: created ? `${saved.displayName} was created` : "Changes saved" });
          }}
        />
      ) : null}
      <UserPermissionsSheet user={permissionsOf} onClose={() => setPermissionsOf(null)} />
      {resetting ? (
        <ResetPasswordDialog
          user={resetting}
          onClose={() => setResetting(null)}
          onDone={() => {
            setResetting(null);
            toast({ tone: "success", message: `Password of ${resetting.displayName} reset` });
          }}
        />
      ) : null}
      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.action === "delete"
            ? "Delete user"
            : confirm?.user.status === "active"
              ? "Disable user"
              : "Enable user"
        }
        description={
          confirm?.action === "delete"
            ? `“${confirm.user.username}” will be deleted permanently.`
            : confirm?.user.status === "active"
              ? `“${confirm?.user.username}” will not be able to sign in and their sessions will be closed.`
              : `“${confirm?.user.username}” will be able to sign in again.`
        }
        confirmLabel={confirm?.action === "delete" ? "Delete" : "Confirm"}
        destructive={confirm?.action === "delete"}
        pending={confirmMutation.isPending}
        error={confirmMutation.error instanceof ApiError ? confirmMutation.error.message : null}
        onConfirm={() => confirm && confirmMutation.mutate(confirm)}
        onClose={() => {
          setConfirm(null);
          confirmMutation.reset();
        }}
      />
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-muted">{label}</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </>
  );
}

function UserFormDialog({
  user,
  canAssignRoles,
  onClose,
  onSaved
}: {
  user: User | null;
  canAssignRoles: boolean;
  onClose: () => void;
  onSaved: (user: User, created: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const creating = user === null;

  const roles = useQuery({
    queryKey: ["roles", "all"],
    queryFn: () => api<Page<Role>>(`/api/roles${toQuery({ pageSize: 100, sort: "name" })}`),
    enabled: canAssignRoles
  });

  const schema = z
    .object({
      username: z.string().trim(),
      displayName: z.string().trim().min(1, { error: "Enter the name" }).max(100),
      email: z.union([z.literal(""), z.email({ error: "Invalid email" })]),
      password: z.string(),
      roleIds: z.array(z.string()),
      status: z.enum(["active", "disabled"])
    })
    .superRefine((values, ctx) => {
      if (!creating) return;
      if (!/^[a-z0-9._-]{3,50}$/.test(values.username.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "Use 3 to 50 characters: letters, numbers, dot, hyphen or underscore"
        });
      }
      const result = passwordSchema(() => values.username).safeParse(values.password);
      if (!result.success) {
        ctx.addIssue({ code: "custom", path: ["password"], message: result.error.issues[0]!.message });
      }
    });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username ?? "",
      displayName: user?.displayName ?? "",
      email: user?.email ?? "",
      password: "",
      roleIds: user?.roles.map((role) => role.id) ?? [],
      status: user?.status ?? "active"
    }
  });

  const save = useMutation({
    mutationFn: (values: Values) =>
      creating
        ? api<{ user: User }>("/api/users", {
            method: "POST",
            body: {
              username: values.username,
              displayName: values.displayName,
              ...(values.email ? { email: values.email } : {}),
              password: values.password,
              status: values.status,
              ...(canAssignRoles ? { roleIds: values.roleIds } : {})
            }
          })
        : api<{ user: User }>(`/api/users/${user.id}`, {
            method: "PATCH",
            body: {
              displayName: values.displayName,
              email: values.email || null,
              ...(canAssignRoles ? { roleIds: values.roleIds } : {})
            }
          }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: USERS_KEY });
      onSaved(result.user, creating);
    },
    onError: (error) =>
      setFormError(applyApiError(error, form.setError, ["username", "displayName", "email", "password", "roleIds"]))
  });

  const errors = form.formState.errors;

  return (
    <Dialog
      open
      onClose={onClose}
      title={creating ? "New user" : `Edit ${user.displayName}`}
      description={creating ? "They must change the password on first sign-in." : `@${user.username}`}
    >
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
          {creating ? (
            <Field label="Username" error={errors.username?.message}>
              {(props) => <Input {...props} autoComplete="off" {...form.register("username")} />}
            </Field>
          ) : null}
          <Field label="Name" error={errors.displayName?.message}>
            {(props) => <Input {...props} {...form.register("displayName")} />}
          </Field>
          <div className={creating ? "sm:col-span-2" : undefined}>
            <Field label="Email (optional)" error={errors.email?.message}>
              {(props) => <Input {...props} type="email" {...form.register("email")} />}
            </Field>
          </div>
        </div>
        {creating ? (
          <Field label="Temporary password" hint="At least 10 characters." error={errors.password?.message}>
            {(props) => <Input {...props} type="password" autoComplete="new-password" {...form.register("password")} />}
          </Field>
        ) : null}
        {canAssignRoles ? (
          <fieldset>
            <legend className="mb-2 text-[13.5px] font-semibold">Roles</legend>
            {roles.isPending ? (
              <Spinner />
            ) : roles.isError ? (
              <Alert>Could not load the roles.</Alert>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.data.items.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-start gap-2.5 rounded-btn border-[1.5px] border-line p-3 text-sm transition-colors hover:border-brand-200 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-25"
                  >
                    <Checkbox className="mt-0.5" value={role.id} {...form.register("roleIds")} />
                    <span>
                      <span className="block font-semibold">{role.name}</span>
                      {role.description ? <span className="block text-[13px] text-muted">{role.description}</span> : null}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        ) : null}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : creating ? "Create user" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function ResetPasswordDialog({ user, onClose, onDone }: { user: User; onClose: () => void; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const schema = z.object({ password: passwordSchema(() => user.username) });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "" } });

  const reset = useMutation({
    mutationFn: (values: Values) => api(`/api/users/${user.id}/reset-password`, { method: "POST", body: values }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USERS_KEY });
      onDone();
    },
    onError: (error) => setFormError(applyApiError(error, form.setError, ["password"]))
  });

  return (
    <Dialog
      open
      onClose={onClose}
      title="Reset password"
      description={`The sessions of “${user.username}” will be closed and they must change it on sign-in.`}
    >
      <form
        className="grid gap-4"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          setFormError(null);
          reset.mutate(values);
        })}
      >
        {formError ? <Alert>{formError}</Alert> : null}
        <Field label="Temporary password" error={form.formState.errors.password?.message}>
          {(props) => <Input {...props} type="password" autoComplete="new-password" {...form.register("password")} />}
        </Field>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={reset.isPending}>
            Restablecer
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
