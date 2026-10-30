import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requirePermission } from "../../auth/context.js";
import type { Collections } from "../../db/collections.js";

interface Deps {
  collections: () => Promise<Collections>;
}

const DAY_MS = 86_400_000;

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const querySchema = z.object({
  days: z.coerce.number().int().refine((n) => [7, 14, 30].includes(n), { error: "Must be 7, 14 or 30" }).default(14),
  // IANA zone of the viewer so days match their calendar (e.g. America/Lima).
  tz: z
    .string()
    .max(64)
    .regex(/^[A-Za-z0-9_+\-/]+$/)
    .refine(isTimeZone, { error: "Invalid time zone" })
    .default("UTC")
});

/** The last `days` calendar dates (YYYY-MM-DD) in `tz`, oldest first. */
export function lastDays(days: number, tz: string, now = new Date()): string[] {
  const format = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const dates: string[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = format.format(new Date(now.getTime() - offset * DAY_MS));
    if (!dates.includes(date)) dates.push(date);
  }
  return dates;
}

export type DashboardDays = 7 | 14 | 30;

/** Indicators of the last `days` days in `tz`. Only aggregate counts: no personal data. */
export async function dashboardData(c: Collections, days: number, tz: string) {
  const dates = lastDays(days, tz);
  // One extra day of margin; exact bucketing happens on the local date.
  const since = new Date(Date.now() - (days + 1) * DAY_MS);

  const [activeUsers, disabledUsers, roles, activity] = await Promise.all([
    c.users.countDocuments({ status: "active" }),
    c.users.countDocuments({ status: "disabled" }),
    c.roles.countDocuments(),
    c.auditLogs
      .aggregate<{
        perDay: Array<{ _id: { day: string; action: string }; n: number }>;
        unique: Array<{ n: number }>;
      }>([
        {
          $match: {
            action: { $in: ["auth.login.success", "auth.login.failure"] },
            createdAt: { $gte: since }
          }
        },
        { $addFields: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: tz } } } },
        { $match: { day: { $in: dates } } },
        {
          $facet: {
            perDay: [{ $group: { _id: { day: "$day", action: "$action" }, n: { $sum: 1 } } }],
            unique: [
              { $match: { action: "auth.login.success" } },
              { $group: { _id: "$actorId" } },
              { $count: "n" }
            ]
          }
        }
      ])
      .next()
  ]);

  const byDay = new Map(dates.map((date) => [date, { date, logins: 0, failures: 0 }]));
  for (const row of activity?.perDay ?? []) {
    const bucket = byDay.get(row._id.day);
    if (!bucket) continue;
    if (row._id.action === "auth.login.success") bucket.logins = row.n;
    else bucket.failures = row.n;
  }
  const series = [...byDay.values()];

  return {
    range: { days, tz, from: dates[0], to: dates.at(-1) },
    kpis: {
      activeUsers,
      disabledUsers,
      roles,
      logins: series.reduce((sum, day) => sum + day.logins, 0),
      failedLogins: series.reduce((sum, day) => sum + day.failures, 0),
      uniqueUsers: activity?.unique[0]?.n ?? 0
    },
    series
  };
}

/** Accepts an IANA zone name (e.g. America/Lima). */
export { isTimeZone };

/**
 * Indicators for the Dashboards page. Only aggregate counts: no personal data.
 * Login activity comes from the audit log, which keeps recording even though
 * the template does not show an audit screen.
 */
export async function dashboardRoutes(app: FastifyInstance, deps: Deps) {
  app.get("/api/dashboard", { preHandler: requirePermission("dashboard.read") }, async (request) => {
    const { days, tz } = querySchema.parse(request.query);
    return dashboardData(await deps.collections(), days, tz);
  });
}
