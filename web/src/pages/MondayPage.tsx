import { useQuery } from "@tanstack/react-query";
import { CircleAlert, ExternalLink, KanbanSquare, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/form";
import { Card, EmptyState, IconTile, PageHeader } from "../components/ui/misc";
import { api } from "../lib/api";
import { INTEGRATION_ERROR_TEXT, integrationErrorCode } from "../lib/integrations";
import { isSafeMondayUrl } from "../lib/links";
import type { MondayBoard } from "../lib/types";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function MondayPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["monday", "boards"],
    queryFn: () => api<{ items: MondayBoard[]; total: number }>("/api/monday/boards"),
    retry: false
  });

  // Client-side search by name and alphabetical order.
  const boards = useMemo(() => {
    const needle = normalize(search.trim());
    return [...(query.data?.items ?? [])]
      .filter((board) => !needle || normalize(board.name).includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }, [query.data, search]);

  let content;
  if (query.isPending) {
    content = (
      <div role="status" aria-label="Loading boards…" className="space-y-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex items-center gap-3 rounded-btn border border-line bg-surface p-3.5">
            <span className="size-8 animate-pulse rounded-tile bg-n-100" />
            <span className="h-3.5 w-1/3 animate-pulse rounded-full bg-n-100" />
          </div>
        ))}
      </div>
    );
  } else if (query.isError) {
    const text = INTEGRATION_ERROR_TEXT[integrationErrorCode(query.error)];
    content = (
      <div role="alert" className="rounded-card border border-danger-100 bg-danger-25 p-5 text-danger-700">
        <p className="flex items-center gap-2 font-bold">
          <CircleAlert className="size-5" aria-hidden /> {text.title}
        </p>
        <p className="mt-1 text-sm">{text.message}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => query.refetch()} disabled={query.isFetching}>
          Reintentar
        </Button>
      </div>
    );
  } else if (query.data.items.length === 0) {
    content = <EmptyState icon={KanbanSquare} title="There are no boards in this account" />;
  } else if (boards.length === 0) {
    content = <EmptyState icon={Search} title="No board matches the search" />;
  } else {
    content = (
      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-line">
          {boards.map((board) => (
            <li key={board.id}>
              <BoardRow board={board} />
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        icon={KanbanSquare}
        tone="orange"
        title="Monday"
        description={
          query.data ? `${query.data.total} ${query.data.total === 1 ? "board" : "boards"} in the connected account` : "Boards of the connected account"
        }
      />
      <div className="relative mb-4 w-full max-w-sm">
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <Input
          aria-label="Search boards by name"
          placeholder="Search by name"
          className="pl-10"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={!query.data}
        />
      </div>
      {content}
    </div>
  );
}

function BoardRow({ board }: { board: MondayBoard }) {
  const body = (
    <>
      <IconTile icon={KanbanSquare} tone="orange" size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{board.name}</span>
        <span className="block truncate text-[13px] text-muted">{board.workspaceName ?? "Main workspace"}</span>
      </span>
    </>
  );

  // Re-checked here even though the server validates: never render an
  // unexpected scheme or host as a link.
  if (!isSafeMondayUrl(board.url)) {
    return (
      <div className="flex items-center gap-3 px-4 py-3" data-testid="board-without-link">
        {body}
      </div>
    );
  }
  return (
    <a
      href={board.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-25 focus-visible:bg-brand-25 focus-visible:outline-none"
    >
      {body}
      <ExternalLink className="size-4 shrink-0 text-faint transition-colors group-hover:text-brand-600" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
