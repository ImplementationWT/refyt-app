import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Inbox, type LucideIcon } from "lucide-react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Alert, IconTile } from "./misc";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Server-side sort field; omit for unsortable columns. */
  sortField?: string;
  className?: string;
}

/**
 * Table card with loading (skeleton), empty and error states, sortable
 * headers, optional clickable rows and pagination. Sorting and paging are
 * delegated to the server through the callbacks.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  error,
  onRetry,
  emptyMessage = "No results",
  emptyIcon = Inbox,
  sort,
  onSortChange,
  onRowClick,
  rowLabel,
  pagination
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  sort?: string;
  onSortChange?: (sort: string) => void;
  onRowClick?: (row: T) => void;
  /** Accessible name for clickable rows. */
  rowLabel?: (row: T) => string;
  pagination?: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void };
}) {
  const sortIcon = (field: string) => {
    if (sort === field) return <ArrowUp aria-hidden />;
    if (sort === `-${field}`) return <ArrowDown aria-hidden />;
    return <ArrowUpDown aria-hidden className="opacity-40" />;
  };
  const ariaSort = (field?: string) =>
    !field ? undefined : sort === field ? "ascending" : sort === `-${field}` ? "descending" : "none";

  let body: ReactNode;
  if (isLoading) {
    body = [0, 1, 2, 3].map((index) => (
      <tr key={index} className="border-t border-line">
        {columns.map((column) => (
          <td key={column.key} className={cn("px-4 py-3.5", column.className)}>
            <span className="block h-3.5 w-3/4 animate-pulse rounded-full bg-n-100" />
          </td>
        ))}
      </tr>
    ));
  } else if (error) {
    body = (
      <tr>
        <td colSpan={columns.length} className="p-5">
          <Alert>
            <p>No se pudieron cargar los datos. {error.message}</p>
            {onRetry ? (
              <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
                Reintentar
              </Button>
            ) : null}
          </Alert>
        </td>
      </tr>
    );
  } else if (!rows || rows.length === 0) {
    body = (
      <tr>
        <td colSpan={columns.length} className="px-5 py-12 text-center">
          <IconTile icon={emptyIcon} tone="neutral" size="lg" className="mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-muted">{emptyMessage}</p>
        </td>
      </tr>
    );
  } else {
    body = rows.map((row) => (
      <tr
        key={rowKey(row)}
        className={cn(
          "border-t border-line transition-colors duration-150",
          onRowClick ? "cursor-pointer hover:bg-brand-25 focus-visible:bg-brand-25" : "hover:bg-n-25"
        )}
        {...(onRowClick
          ? {
              tabIndex: 0,
              "aria-label": rowLabel?.(row),
              onClick: (event: MouseEvent) => {
                // Buttons inside the row keep their own behavior.
                if (!(event.target as HTMLElement).closest("button, a, input")) onRowClick(row);
              },
              onKeyDown: (event: KeyboardEvent) => {
                if (event.key === "Enter" && event.target === event.currentTarget) onRowClick(row);
              }
            }
          : {})}
      >
        {columns.map((column) => (
          <td key={column.key} className={cn("px-4 py-3 align-middle text-[14px]", column.className)}>
            {column.cell(row)}
          </td>
        ))}
      </tr>
    ));
  }

  const pages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sh1">
      {isLoading ? <span role="status" className="sr-only">Loading…</span> : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-n-25">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort(column.sortField)}
                  className={cn("h-11 px-4 text-xs font-semibold whitespace-nowrap text-muted", column.className)}
                >
                  {column.sortField && onSortChange ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md hover:text-ink [&_svg]:size-3.5"
                      onClick={() =>
                        onSortChange(sort === column.sortField ? `-${column.sortField}` : column.sortField!)
                      }
                    >
                      {column.header}
                      {sortIcon(column.sortField)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {pagination && !isLoading && !error && pagination.total > 0 ? (
        <Pagination {...pagination} pages={pages} />
      ) : null}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  total,
  onPageChange
}: {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-[13px] text-muted">
      <span>
        <strong className="font-semibold text-ink">{total}</strong> {total === 1 ? "result" : "results"} · Page{" "}
        {page} of {pages}
      </span>
      <div className="flex gap-1.5">
        <Button variant="secondary" size="sm" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
        </Button>
        <Button variant="secondary" size="sm" aria-label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
