import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { CHANGE_PASSWORD_PATH, NotFound, RequireAuth, RequireFeature, RequirePermission } from "./auth/guards";
import { SESSION_KEY, SessionProvider } from "./auth/session";
import { AppLayout } from "./components/layout/AppLayout";
import { ToastProvider } from "./components/ui/toast";
import { ApiError } from "./lib/api";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { LoginPage } from "./pages/LoginPage";
import { MondayPage } from "./pages/MondayPage";
import { RefytPage } from "./pages/RefytPage";
import { RolesPage } from "./pages/RolesPage";
import { UsersPage } from "./pages/UsersPage";

export function createQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
        refetchOnWindowFocus: false
      }
    },
    // An expired session (401) or a pending forced password change (403)
    // anywhere refreshes the session, which makes the guards redirect.
    queryCache: new QueryCache({ onError: (error, query) => handleAuthError(client, error, query.queryKey) }),
    mutationCache: new MutationCache({ onError: (error) => handleAuthError(client, error) })
  });
  return client;
}

function handleAuthError(client: QueryClient, error: unknown, key?: readonly unknown[]) {
  if (!(error instanceof ApiError) || key?.[0] === SESSION_KEY[0]) return;
  if (error.status === 401 && error.code === "unauthorized") {
    client.setQueryData(SESSION_KEY, null);
  } else if (error.code === "password_change_required") {
    void client.invalidateQueries({ queryKey: SESSION_KEY });
  }
}

export function AppRoutes() {
  const page = (permission: string, element: ReactNode) => (
    <RequirePermission permission={permission}>{element}</RequirePermission>
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path={CHANGE_PASSWORD_PATH}
        element={
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
        }
      />
      {/* Refyt, the client-approved interface, full screen and without the admin layout. */}
      <Route
        index
        element={
          <RequireAuth>
            <RefytPage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="panel" element={<DashboardPage />} />
        <Route path="usuarios" element={page("users.read", <UsersPage />)} />
        <Route path="roles" element={page("roles.read", <RolesPage />)} />
        <Route path="integraciones" element={page("integrations.read", <IntegrationsPage />)} />
        <Route
          path="monday"
          element={
            <RequireFeature feature="monday">{page("monday.read", <MondayPage />)}</RequireFeature>
          }
        />
        {/* Permissions are managed per user from the Usuarios table. */}
        <Route path="usuarios/permisos" element={<Navigate to="/usuarios" replace />} />
        <Route path="permisos" element={<Navigate to="/usuarios" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export function App({ queryClient }: { queryClient?: QueryClient }) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <SessionProvider>
          <AppRoutes />
        </SessionProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
