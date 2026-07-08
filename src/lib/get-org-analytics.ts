import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  activeUsers,
  cohortRetentionTable,
  dailyActiveUsersSeries,
  featureAdoption,
  weeklyRetentionCurve,
  type UsageEvent,
} from "@/lib/analytics";

const LOOKBACK_DAYS = 90;

export async function getOrgAnalyticsData(supabase: SupabaseClient<Database>, orgId: string) {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const [{ data }, { data: featureRows }] = await Promise.all([
    supabase
      .from("events")
      .select("distinct_id, event_name, occurred_at")
      .eq("org_id", orgId)
      .gte("occurred_at", since.toISOString())
      .order("occurred_at", { ascending: true })
      .limit(10000),
    supabase
      .from("features")
      .select("key, name")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true }),
  ]);

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
  const cohorts = cohortRetentionTable(events, 6, asOf);
  const eventNames = [...new Set(events.map((e) => e.eventName))].sort();
  const adoption = featureAdoption(events, featureRows ?? [], 30, asOf);

  const eventCounts = new Map<string, number>();
  for (const event of events) {
    eventCounts.set(event.eventName, (eventCounts.get(event.eventName) ?? 0) + 1);
  }
  const topEvents = [...eventCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  return {
    lookbackDays: LOOKBACK_DAYS,
    events,
    dau,
    wau,
    mau,
    dailySeries,
    retention,
    cohorts,
    eventNames,
    adoption,
    topEvents,
  };
}
