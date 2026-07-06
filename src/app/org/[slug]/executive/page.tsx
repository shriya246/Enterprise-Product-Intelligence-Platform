import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import {
  activeUsers,
  featureAdoption,
  weeklyRetentionCurve,
  type UsageEvent,
} from "@/lib/analytics";
import { StatTiles } from "../dashboard/charts";

const LOOKBACK_DAYS = 90;

const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
  neutral: "#898781",
};

export default async function ExecutivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const [{ data: eventRows }, { data: featureRows }, { data: feedbackRows }] = await Promise.all([
    supabase
      .from("events")
      .select("distinct_id, event_name, occurred_at")
      .eq("org_id", org.orgId)
      .gte("occurred_at", since.toISOString())
      .limit(10000),
    supabase.from("features").select("key, name").eq("org_id", org.orgId),
    supabase.from("feedback_items").select("sentiment").eq("org_id", org.orgId),
  ]);

  const events: UsageEvent[] = (eventRows ?? []).map((row) => ({
    distinctId: row.distinct_id,
    eventName: row.event_name,
    occurredAt: row.occurred_at,
  }));

  const asOf = new Date();
  const dau = activeUsers(events, 1, asOf);
  const wau = activeUsers(events, 7, asOf);
  const mau = activeUsers(events, 30, asOf);

  const retention = weeklyRetentionCurve(events, 4);
  const week4Retention = retention[retention.length - 1]?.retentionPct ?? null;

  const adoption = featureAdoption(events, featureRows ?? [], 30, asOf)
    .sort((a, b) => b.adoptionPct - a.adoptionPct)
    .slice(0, 5);

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  for (const row of feedbackRows ?? []) {
    if (row.sentiment === "positive") sentimentCounts.positive += 1;
    else if (row.sentiment === "negative") sentimentCounts.negative += 1;
    else if (row.sentiment === "neutral") sentimentCounts.neutral += 1;
  }
  const totalTagged = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Executive summary</h1>
        <p className="text-sm text-neutral-500">
          Everything on one screen — last {LOOKBACK_DAYS} days, no filters required.
        </p>
      </div>

      <StatTiles dau={dau} wau={wau} mau={mau} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Week-4 retention</p>
          <p className="mt-1 text-3xl font-semibold [font-variant-numeric:tabular-nums]">
            {week4Retention === null ? "—" : `${week4Retention}%`}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">NPS</p>
          <p className="mt-1 text-lg font-medium text-neutral-400">Not yet collected</p>
          <p className="mt-1 text-xs text-neutral-500">Placeholder — no survey source connected</p>
        </div>

        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Feedback sentiment</p>
          {totalTagged === 0 ? (
            <p className="mt-1 text-sm text-neutral-500">No feedback tagged yet</p>
          ) : (
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <span style={{ color: STATUS_COLORS.good }}>● Positive: {sentimentCounts.positive}</span>
              <span style={{ color: STATUS_COLORS.neutral }}>● Neutral: {sentimentCounts.neutral}</span>
              <span style={{ color: STATUS_COLORS.critical }}>● Negative: {sentimentCounts.negative}</span>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Top feature adoption (30 days)</h2>
        {adoption.length === 0 ? (
          <p className="text-sm text-neutral-500">No features registered yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {adoption.map((f) => (
              <li key={f.key} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate">{f.name}</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${Math.min(f.adoptionPct, 100)}%`, background: "#2a78d6" }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-neutral-500 [font-variant-numeric:tabular-nums]">
                  {f.adoptionPct}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
