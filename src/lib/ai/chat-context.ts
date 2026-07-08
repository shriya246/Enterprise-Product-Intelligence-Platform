import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { activeUsers, weeklyRetentionCurve, type UsageEvent } from "@/lib/analytics";

const LOOKBACK_DAYS = 90;

export interface Evidence {
  label: string;
  value: string;
}

export interface OrgContext {
  contextText: string;
  evidence: Evidence[];
}

/**
 * Summarizes an org's own analytics + feedback into a compact text block the
 * AI assistant can ground its answer in, so questions like "why is retention
 * dropping" are answered from the org's real numbers rather than a generic
 * response. Also returns the same headline numbers as structured evidence,
 * for the UI to display alongside the answer — not a separate AI call, just
 * the same figures already computed for the prompt.
 */
export async function buildOrgContext(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<OrgContext> {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const [{ data: eventRows }, { data: feedbackRows }] = await Promise.all([
    supabase
      .from("events")
      .select("distinct_id, event_name, occurred_at")
      .eq("org_id", orgId)
      .gte("occurred_at", since.toISOString())
      .limit(10000),
    supabase
      .from("feedback_items")
      .select("sentiment, theme")
      .eq("org_id", orgId)
      .limit(2000),
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

  const sentimentCounts = new Map<string, number>();
  const themeCounts = new Map<string, number>();
  for (const row of feedbackRows ?? []) {
    if (row.sentiment) sentimentCounts.set(row.sentiment, (sentimentCounts.get(row.sentiment) ?? 0) + 1);
    if (row.theme) themeCounts.set(row.theme, (themeCounts.get(row.theme) ?? 0) + 1);
  }

  const topThemes = [...themeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme, count]) => `${theme} (${count})`)
    .join(", ") || "none yet";

  const sentimentSummary =
    [...sentimentCounts.entries()].map(([s, c]) => `${s}: ${c}`).join(", ") || "none tagged yet";

  const retentionSummary = retention
    .map((p) => `week ${p.weeksSinceFirstSeen}: ${p.retentionPct}%`)
    .join(", ");

  const contextText = [
    `Usage over the last ${LOOKBACK_DAYS} days (${events.length} events):`,
    `- Daily active users: ${dau}`,
    `- Weekly active users: ${wau}`,
    `- Monthly active users: ${mau}`,
    `- Weekly cohort retention: ${retentionSummary}`,
    ``,
    `Feedback (${feedbackRows?.length ?? 0} items):`,
    `- Sentiment breakdown: ${sentimentSummary}`,
    `- Top themes: ${topThemes}`,
  ].join("\n");

  const latestRetention = retention[retention.length - 1];

  const evidence: Evidence[] = [
    { label: "Daily active users", value: String(dau) },
    { label: "Weekly active users", value: String(wau) },
    { label: "Monthly active users", value: String(mau) },
    ...(latestRetention
      ? [{ label: `Wk ${latestRetention.weeksSinceFirstSeen} retention`, value: `${latestRetention.retentionPct}%` }]
      : []),
    { label: "Feedback items", value: String(feedbackRows?.length ?? 0) },
  ];

  return { contextText, evidence };
}
