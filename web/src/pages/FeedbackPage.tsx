import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, Save, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Avatar, FilterChips } from "../components/ui/data-display";
import { DataTable, type Column } from "../components/ui/data-table";
import { Sheet } from "../components/ui/dialog";
import { Field, Input, Select, Switch, Textarea } from "../components/ui/form";
import { Alert, PageHeader, Pill } from "../components/ui/misc";
import { useToast } from "../components/ui/toast";
import { api, ApiError, toQuery } from "../lib/api";
import { FEEDBACK_KEY, FEEDBACK_SETTINGS_KEY, FEEDBACK_STATUSES, FEEDBACK_TYPES } from "../lib/feedback";
import { useListState } from "../lib/hooks";
import type { Feedback, FeedbackSettings, FeedbackStatus, Page } from "../lib/types";
import { formatDateTime } from "../lib/utils";

type StatusFilter = "all" | FeedbackStatus;

function TypePill({ item }: { item: Feedback }) {
  const type = FEEDBACK_TYPES[item.type];
  return <Pill tone={type.tone}>{type.label}</Pill>;
}

function StatusPill({ status }: { status: FeedbackStatus }) {
  return <Pill tone={FEEDBACK_STATUSES[status].tone}>{FEEDBACK_STATUSES[status].label}</Pill>;
}

/** Inbox of what users send from "Send feedback", and the switch that turns the module on or off. */
export function FeedbackPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const list = useListState("-createdAt");
  const [status, setStatus] = useState<StatusFilter>("new");
  const [detail, setDetail] = useState<Feedback | null>(null);

  const settings = useQuery({
    queryKey: FEEDBACK_SETTINGS_KEY,
    queryFn: () => api<FeedbackSettings>("/api/feedback/settings")
  });
  const query = useQuery({
    queryKey: [...FEEDBACK_KEY, list.page, list.q, list.sort, status],
    queryFn: () =>
      api<Page<Feedback>>(
        `/api/feedback${toQuery({
          page: list.page,
          pageSize: 20,
          q: list.q,
          sort: list.sort,
          status: status === "all" ? undefined : status
        })}`
      ),
    placeholderData: (previous) => previous
  });

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => api<{ enabled: boolean }>("/api/feedback/settings", { method: "PUT", body: { enabled } }),
    onSuccess: ({ enabled }) => {
      toast({
        tone: "success",
        message: enabled ? "Feedback is on: users can send it from their menu" : "Feedback is off: users no longer see it"
      });
      return queryClient.invalidateQueries({ queryKey: FEEDBACK_SETTINGS_KEY });
    }
  });

  const enabled = settings.data?.enabled ?? false;

  const columns: Column<Feedback>[] = [
    { key: "type", header: "Type", sortField: "type", cell: (item) => <TypePill item={item} /> },
    {
      key: "message",
      header: "Message",
      cell: (item) => (
        <div className="max-w-[460px] min-w-0">
          <p className="line-clamp-2 font-semibold">{item.message}</p>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {item.userName} · @{item.username}
          </p>
        </div>
      )
    },
    {
      key: "where",
      header: "Where",
      className: "hidden lg:table-cell text-muted",
      cell: (item) => (
        <div className="max-w-[240px] min-w-0">
          <p className="truncate">{item.screen ?? "—"}</p>
          <p className="truncate font-mono text-[12px] text-faint">{item.page}</p>
        </div>
      )
    },
    {
      key: "createdAt",
      header: "Received",
      sortField: "createdAt",
      className: "hidden md:table-cell whitespace-nowrap text-muted",
      cell: (item) => formatDateTime(item.createdAt)
    },
    { key: "status", header: "Status", sortField: "status", cell: (item) => <StatusPill status={item.status} /> }
  ];

  return (
    <div>
      <PageHeader
        icon={MessageSquareText}
        tone="amber"
        title="Feedback"
        description="What users report from Refyt, for the implementation team to review and fix."
        actions={
          settings.data ? (
            <div className="flex h-[46px] items-center gap-3 rounded-btn border-[1.5px] border-line-2 bg-surface px-4">
              <span className="text-sm font-semibold">{enabled ? "Accepting feedback" : "Feedback is off"}</span>
              <Switch
                checked={enabled}
                label="Users can send feedback"
                onChange={(next) => {
                  if (!toggle.isPending) toggle.mutate(next);
                }}
              />
            </div>
          ) : null
        }
      />
      {settings.data && !enabled ? (
        <Alert className="mb-4">
          The module is off: users do not see “Send feedback” in their menu. What was already sent stays here.
        </Alert>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            aria-label="Search feedback"
            placeholder="Search by message, person or screen"
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
            { value: "new", label: "New", count: settings.data?.newCount },
            { value: "in_progress", label: "In progress" },
            { value: "fixed", label: "Fixed" },
            { value: "wont_fix", label: "Won't fix" },
            { value: "all", label: "All" }
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(item) => item.id}
        isLoading={query.isPending}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyIcon={MessageSquareText}
        emptyMessage={list.q || status !== "all" ? "Nothing matches the filter" : "No feedback yet"}
        sort={list.sort}
        onSortChange={list.setSort}
        onRowClick={setDetail}
        rowLabel={(item) => `Open feedback from ${item.userName}`}
        pagination={
          query.data && {
            page: query.data.page,
            pageSize: query.data.pageSize,
            total: query.data.total,
            onPageChange: list.setPage
          }
        }
      />

      {detail ? (
        <FeedbackSheet
          key={detail.id}
          item={detail}
          onClose={() => setDetail(null)}
          onSaved={(saved) => {
            setDetail(null);
            toast({ tone: "success", message: `Marked as ${FEEDBACK_STATUSES[saved.status].label.toLowerCase()}` });
            void queryClient.invalidateQueries({ queryKey: FEEDBACK_SETTINGS_KEY });
            return queryClient.invalidateQueries({ queryKey: FEEDBACK_KEY });
          }}
        />
      ) : null}
    </div>
  );
}

function FeedbackSheet({ item, onClose, onSaved }: { item: Feedback; onClose: () => void; onSaved: (saved: Feedback) => void }) {
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [note, setNote] = useState(item.note);
  const save = useMutation({
    mutationFn: () => api<{ feedback: Feedback }>(`/api/feedback/${item.id}`, { method: "PATCH", body: { status, note } }),
    onSuccess: ({ feedback }) => onSaved(feedback)
  });
  const unchanged = status === item.status && note.trim() === item.note;

  return (
    <Sheet
      open
      onClose={onClose}
      title={FEEDBACK_TYPES[item.type].label}
      description={`From ${item.userName} · ${formatDateTime(item.createdAt)}`}
      leading={<Avatar name={item.userName} seed={item.userId} size="lg" />}
      footer={
        <Button onClick={() => save.mutate()} disabled={unchanged || save.isPending}>
          <Save /> {save.isPending ? "Saving…" : "Save"}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-1.5">
          <TypePill item={item} />
          <StatusPill status={item.status} />
        </div>
        <p className="whitespace-pre-wrap rounded-btn border border-line bg-n-25 p-4 text-[14.5px] leading-relaxed">{item.message}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <DetailRow label="Sent by">
            {item.userName} · @{item.username}
          </DetailRow>
          <DetailRow label="Screen">{item.screen ?? "—"}</DetailRow>
          <DetailRow label="Page">
            <span className="font-mono text-[13px]">{item.page}</span>
          </DetailRow>
          <DetailRow label="Updated">{formatDateTime(item.updatedAt)}</DetailRow>
        </dl>
        <Field label="Status">
          {(props) => (
            <Select {...props} value={status} onChange={(event) => setStatus(event.target.value as FeedbackStatus)}>
              {(Object.keys(FEEDBACK_STATUSES) as FeedbackStatus[]).map((key) => (
                <option key={key} value={key}>
                  {FEEDBACK_STATUSES[key].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Team note" hint="Only the team sees it: what was done, or why not.">
          {(props) => <Textarea {...props} value={note} maxLength={4000} onChange={(event) => setNote(event.target.value)} />}
        </Field>
        {save.error ? <Alert>{save.error instanceof ApiError ? save.error.message : "The changes could not be saved"}</Alert> : null}
      </div>
    </Sheet>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-muted">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}
