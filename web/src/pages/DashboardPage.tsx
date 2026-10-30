import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BarChart3, LayoutDashboard, LogIn, ShieldAlert, Table2, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { useSession } from "../auth/session";
import { ColumnChart, type ColumnDatum } from "../components/charts/ColumnChart";
import { Button } from "../components/ui/button";
import { FilterChips, KpiCard, KpiGrid } from "../components/ui/data-display";
import { Alert, Card, EmptyState, PageHeader } from "../components/ui/misc";
import { api, toQuery } from "../lib/api";
import type { DashboardData } from "../lib/types";
import { cn } from "../lib/utils";

type Range = "7" | "14" | "30";

// Series dates are calendar days (YYYY-MM-DD): format them in UTC so they
// are never shifted by the browser's offset.
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const number = new Intl.NumberFormat("en-GB");

function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function DashboardPage() {
  const { session, can } = useSession();
  const greeting = `Hi, ${session?.user.displayName ?? ""}. Here is your team's activity.`;

  return (
    <div>
      <PageHeader icon={LayoutDashboard} tone="brand" title="Dashboards" description={greeting} />
      {can("dashboard.read") ? (
        <Indicators />
      ) : (
        <EmptyState
          icon={BarChart3}
          title="You have no indicators available"
          message="Ask an administrator for the “dashboard.read” permission to see the indicators."
        />
      )}
    </div>
  );
}

function Indicators() {
  const { can } = useSession();
  const [range, setRange] = useState<Range>("14");
  const [asTable, setAsTable] = useState(false);

  const query = useQuery({
    queryKey: ["dashboard", range],
    queryFn: () => api<DashboardData>(`/api/dashboard${toQuery({ days: range, tz: timeZone() })}`),
    placeholderData: keepPreviousData
  });
  const data = query.data;
  const value = (n: number | undefined) => (n === undefined ? "…" : number.format(n));
  const periodLabel = `Last ${range} days`;

  const chartData: ColumnDatum[] =
    data?.series.map((day) => {
      const date = new Date(`${day.date}T00:00:00Z`);
      return {
        key: day.date,
        label: shortDate.format(date),
        fullLabel: longDate.format(date),
        value: day.logins,
        details: [{ label: "Failed attempts", value: day.failures }]
      };
    }) ?? [];

  return (
    <div className="space-y-6">
      {/* One filter row above everything it scopes. */}
      <FilterChips<Range>
        label="Period"
        value={range}
        onChange={setRange}
        options={[
          { value: "7", label: "7 days" },
          { value: "14", label: "14 days" },
          { value: "30", label: "30 days" }
        ]}
      />

      {query.isError && !data ? (
        <Alert>
          <p>No se pudieron cargar los indicadores. {query.error.message}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => query.refetch()}>
            Reintentar
          </Button>
        </Alert>
      ) : (
        <div className={cn("space-y-6 transition-opacity duration-200", query.isPlaceholderData && "opacity-60")}>
          <KpiGrid>
            <KpiCard
              label="Active users"
              value={value(data?.kpis.activeUsers)}
              hint={data ? `${number.format(data.kpis.disabledUsers)} disabled · current total` : undefined}
              icon={Users}
              tone="blue"
              to={can("users.read") ? "/users" : undefined}
            />
            <KpiCard label="Sign-ins" value={value(data?.kpis.logins)} hint={periodLabel} icon={LogIn} tone="brand" />
            <KpiCard
              label="People who signed in"
              value={value(data?.kpis.uniqueUsers)}
              hint={periodLabel}
              icon={UserCheck}
              tone="green"
            />
            <KpiCard
              label="Failed attempts"
              value={value(data?.kpis.failedLogins)}
              hint={periodLabel}
              icon={ShieldAlert}
              tone="red"
            />
          </KpiGrid>

          <Card className="p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Sign-ins per day</h2>
                <p className="text-sm text-muted">{periodLabel} · accesos correctos</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setAsTable((current) => !current)} aria-pressed={asTable}>
                {asTable ? <BarChart3 /> : <Table2 />}
                {asTable ? "Show chart" : "Show table"}
              </Button>
            </div>

            {!data ? (
              <div role="status" aria-label="Loading…" className="h-[256px] animate-pulse rounded-btn bg-n-50" />
            ) : asTable ? (
              <div className="max-h-[256px] overflow-y-auto rounded-btn border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-n-25 text-xs text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Fecha</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Sign-ins</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Failed attempts</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {[...chartData].reverse().map((day) => (
                      <tr key={day.key} className="border-t border-line">
                        <td className="px-4 py-2 first-letter:uppercase">{day.fullLabel}</td>
                        <td className="px-4 py-2 text-right font-semibold">{day.value}</td>
                        <td className="px-4 py-2 text-right text-muted">{day.details?.[0]?.value ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ColumnChart data={chartData} valueLabel="sign-ins" title={`Sign-ins per day, ${periodLabel.toLowerCase()}`} />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
