import { useEffect, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api";

export function useDebounced<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Server-side table state: page, debounced search and sort. */
export function useListState(defaultSort: string) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSortState] = useState(defaultSort);
  const q = useDebounced(search.trim());

  useEffect(() => setPage(1), [q]);

  return {
    page,
    setPage,
    search,
    setSearch,
    q,
    sort,
    setSort: (next: string) => {
      setSortState(next);
      setPage(1);
    }
  };
}

/**
 * Maps a backend validation error onto form fields; returns the message to
 * show at form level (or null if every issue matched a field).
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[]
): string | null {
  if (!(error instanceof ApiError)) {
    return "Ha ocurrido un error inesperado";
  }
  const unmatched = error.issues.filter((issue) => {
    const field = issue.path.split(".")[0] ?? "";
    if (fields.includes(field)) {
      setError(field as Path<T>, { message: issue.message });
      return false;
    }
    return true;
  });
  return error.issues.length > 0 && unmatched.length === 0 ? null : error.message;
}
