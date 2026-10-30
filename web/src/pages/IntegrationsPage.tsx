import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, CircleAlert, CircleCheck, KanbanSquare, Plug, PlugZap, type LucideIcon } from "lucide-react";
import { useSession } from "../auth/session";
import { Button } from "../components/ui/button";
import { Card, IconTile, PageHeader, Pill, Alert } from "../components/ui/misc";
import { api } from "../lib/api";
import { INTEGRATION_ERROR_TEXT } from "../lib/integrations";
import type { ConnectionTestResult, IntegrationStatus } from "../lib/types";
import type { Tone } from "../lib/utils";

/** Presentation per provider id; unknown providers get a generic look. */
const PROVIDER_LOOK: Record<string, { icon: LucideIcon; tone: Tone; description: string }> = {
  monday: { icon: KanbanSquare, tone: "orange", description: "Consulta los tableros de la cuenta conectada." },
  anthropic: { icon: Bot, tone: "violet", description: "Will Doo, el co-pilot: responde con los datos del sistema según los permisos de cada persona." }
};

export function IntegrationsPage() {
  const query = useQuery({
    queryKey: ["integrations"],
    queryFn: () => api<{ items: IntegrationStatus[] }>("/api/integrations")
  });

  return (
    <div className="max-w-4xl">
      <PageHeader
        icon={Plug}
        tone="teal"
        title="Integraciones"
        description="Servicios externos disponibles para esta aplicación."
      />
      {query.isPending ? (
        <div role="status" aria-label="Cargando…" className="h-40 animate-pulse rounded-card bg-n-50" />
      ) : query.isError ? (
        <Alert>
          <p>No se pudieron cargar las integraciones.</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => query.refetch()}>
            Reintentar
          </Button>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {query.data.items.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderCard({ provider }: { provider: IntegrationStatus }) {
  const { can } = useSession();
  const look = PROVIDER_LOOK[provider.id] ?? { icon: Plug, tone: "neutral" as Tone, description: "" };
  const test = useMutation({
    mutationFn: () => api<ConnectionTestResult>(`/api/integrations/${encodeURIComponent(provider.id)}/test`, { method: "POST" })
  });
  const result = test.data;
  const failed = result && !result.ok ? INTEGRATION_ERROR_TEXT[result.error] : null;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start gap-4">
        <IconTile icon={look.icon} tone={look.tone} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">{provider.label}</h2>
            {provider.configured ? <Pill tone="green">Configurada</Pill> : <Pill tone="neutral">No configurada</Pill>}
          </div>
          {look.description ? <p className="mt-0.5 text-sm text-muted">{look.description}</p> : null}
          {!provider.configured ? (
            <p className="mt-3 text-sm text-muted">
              La credencial la gestiona quien administra la plataforma. Cuando esté configurada, aparecerá aquí como
              disponible.
            </p>
          ) : null}
        </div>
        {provider.configured && can("integrations.manage") ? (
          <Button variant="secondary" onClick={() => test.mutate()} disabled={test.isPending}>
            <PlugZap /> {test.isPending ? "Probando…" : "Probar conexión"}
          </Button>
        ) : null}
      </div>

      <div aria-live="polite">
        {result?.ok ? (
          <p className="mt-4 flex items-center gap-2 rounded-field border border-ok-50 bg-ok-50 px-3.5 py-2.5 text-sm font-medium text-ok-700">
            <CircleCheck className="size-4" aria-hidden /> Conexión correcta.
          </p>
        ) : failed ? (
          <div className="mt-4 flex items-start gap-2 rounded-field border border-danger-100 bg-danger-25 px-3.5 py-2.5 text-sm text-danger-700">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              <strong className="font-semibold">{failed.title}.</strong> {failed.message}
            </p>
          </div>
        ) : test.isError ? (
          <Alert className="mt-4">No se pudo probar la conexión. Inténtalo de nuevo.</Alert>
        ) : null}
      </div>
    </Card>
  );
}
