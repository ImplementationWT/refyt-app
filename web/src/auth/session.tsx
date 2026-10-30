import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import type { Meta, Session } from "../lib/types";

export const SESSION_KEY = ["session"] as const;

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  can: (permission: string) => boolean;
  /** Integration feature enabled for this user by the backend. */
  hasFeature: (feature: string) => boolean;
  setSession: (session: Session | null) => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchSession(): Promise<Session | null> {
  try {
    return await api<Session>("/api/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: SESSION_KEY, queryFn: fetchSession, staleTime: 60_000 });

  const logoutMutation = useMutation({
    mutationFn: () => api("/api/auth/logout", { method: "POST" }),
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(SESSION_KEY, null);
    }
  });

  const value = useMemo<SessionContextValue>(() => {
    const session = query.data ?? null;
    const permissions = new Set(session?.permissions ?? []);
    const features = new Set(session?.features ?? []);
    return {
      session,
      isLoading: query.isPending,
      can: (permission) => permissions.has(permission),
      hasFeature: (feature) => features.has(feature),
      setSession: (next) => {
        // A slower in-flight /me (started before login) must not overwrite
        // the new session with its stale 401 result.
        void queryClient.cancelQueries({ queryKey: SESSION_KEY });
        queryClient.setQueryData(SESSION_KEY, next);
      },
      logout: async () => {
        await logoutMutation.mutateAsync().catch(() => undefined);
      }
    };
  }, [query.data, query.isPending, queryClient, logoutMutation]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return value;
}

/** Public app metadata (name, client). Never contains secrets. */
export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: () => api<Meta>("/api/meta"),
    staleTime: 5 * 60_000,
    retry: 1
  });
}
