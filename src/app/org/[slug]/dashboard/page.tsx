import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import {
  activeUsers,
  dailyActiveUsersSeries,
  weeklyRetentionCurve,
  type UsageEvent,
} from "@/lib/analytics";
import { DailyActiveUsersChart, FunnelBuilder, RetentionChart, StatTiles } from "./charts";

const LOOKBACK_DAYS = 90;

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const { data } = await supabase
    .from("events")
    .select("distinct_id, event_name, occurred_at")
    .eq("org_id", org.orgId)
    .gte("occurred_at", since.toISOString())
    .order("occurred_at", { ascending: true })
    .limit(10000);

  const events: UsageEvent[] = (data ?? []).map((row) => ({
    distinctId: row.distinct_id,
    eventName: row.event_name,
    occurredAt: row.occurred_at,
  }));

  const asOf = new Date();
  const dau = activeUsers(events, 1, asOf);
  const wau = activeUsers(events, 7, asOf);
  const mau = activeUsers(events, 30, asOf);
  const dailySeries = dailyActiveUsersSeries(events, 30, asOf);
  const retention = weeklyRetentionCurve(events, 8);

  const eventNames = [...new Set(events.map((e) => e.eventName))].sort();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-neutral-500">
          Last {LOOKBACK_DAYS} days · {events.length.toLocaleString()} events
        </p>
      </div>

      <StatTiles dau={dau} wau={wau} mau={mau} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Daily active users</h2>
        <DailyActiveUsersChart data={dailySeries} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Weekly retention</h2>
        <RetentionChart data={retention} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Funnel builder</h2>
        {eventNames.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No events yet. Send some with the tracking snippet to see a funnel here.
          </p>
        ) : (
          <FunnelBuilder events={events} eventNames={eventNames} />
        )}
      </section>
    </div>
  );
}
