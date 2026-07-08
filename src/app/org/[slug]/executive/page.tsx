import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ExecutiveSummaryCard } from "@/components/ui/executive-summary-card";
import { AlertTriangle, TrendingUp, FlaskConical } from "lucide-react";

function healthBand(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Healthy", color: "var(--status-good)" };
  if (score >= 45) return { label: "Needs attention", color: "var(--status-warning)" };
  return { label: "At risk", color: "var(--status-critical)" };
}

export default async function ExecutivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();
  const data = await getOrgAnalyticsData(supabase, org.orgId);

  const [{ data: feedbackRows }, { data: roadmapItems }, { data: experiments }] = await Promise.all([
    supabase.from("feedback_items").select("sentiment, theme").eq("org_id", org.orgId),
    supabase
      .from("roadmap_items")
      .select("title, status, priority_score, priority_rationale")
      .eq("org_id", org.orgId),
    supabase.from("experiments").select("name, is_significant, p_value").eq("org_id", org.orgId),
  ]);

  const week4Retention = data.retention[Math.min(4, data.retention.length - 1)]?.retentionPct ?? null;
  const adoption = [...data.adoption].sort((a, b) => b.adoptionPct - a.adoptionPct).slice(0, 5);

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  const negativeThemeCounts = new Map<string, number>();
  for (const row of feedbackRows ?? []) {
    if (row.sentiment === "positive") sentimentCounts.positive += 1;
    else if (row.sentiment === "negative") {
      sentimentCounts.negative += 1;
      if (row.theme) negativeThemeCounts.set(row.theme, (negativeThemeCounts.get(row.theme) ?? 0) + 1);
    } else if (row.sentiment === "neutral") sentimentCounts.neutral += 1;
  }
  const totalTagged = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
  const topNegativeTheme = [...negativeThemeCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  // Product health score: transparent composite of retention, sentiment, and adoption.
  const retentionComponent = week4Retention ?? 50;
  const sentimentComponent =
    totalTagged === 0
      ? 50
      : Math.max(0, Math.min(100, 50 + ((sentimentCounts.positive - sentimentCounts.negative) / totalTagged) * 50));
  const adoptionComponent =
    adoption.length === 0 ? 50 : adoption.reduce((s, a) => s + a.adoptionPct, 0) / adoption.length;
  const healthScore = Math.round((retentionComponent + sentimentComponent + adoptionComponent) / 3);
  const band = healthBand(healthScore);

  const items = roadmapItems ?? [];
  const shippedCount = items.filter((i) => i.status === "shipped").length;
  const roadmapProgressPct = items.length === 0 ? 0 : Math.round((shippedCount / items.length) * 100);
  const topOpportunity = [...items]
    .filter((i) => i.status !== "shipped" && i.priority_score !== null)
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))[0];

  const significantExperiments = (experiments ?? []).filter((e) => e.is_significant);

  const recommendations: string[] = [];
  if (topOpportunity) {
    recommendations.push(
      `Ship "${topOpportunity.title}" next — highest AI-prioritized roadmap item (${topOpportunity.priority_score}/100).`
    );
  }
  if (topNegativeTheme) {
    recommendations.push(
      `Address "${topNegativeTheme[0]}" — the top negative-sentiment feedback theme (${topNegativeTheme[1]} mentions).`
    );
  }
  if (week4Retention !== null && week4Retention < 50) {
    recommendations.push(`Week-4 retention is ${week4Retention}% — worth an activation experiment.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("No urgent signals this period — steady state across retention, sentiment, and roadmap.");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Executive summary"
        description={`Everything on one screen — last ${data.lookbackDays} days, no filters required.`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <AnimatedCard className="lg:col-span-1" hover={false}>
          <p className="text-sm text-text-secondary">Product health</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight" style={{ color: band.color }}>
            {healthScore}
          </p>
          <p className="mt-1 text-xs font-medium" style={{ color: band.color }}>
            {band.label}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Blend of retention, sentiment, and feature adoption.
          </p>
        </AnimatedCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
          <MetricCard label="Daily active users" value={data.dau} delay={0} />
          <MetricCard label="Weekly active users" value={data.wau} delay={0.05} />
          <MetricCard label="Monthly active users" value={data.mau} delay={0.1} />
        </div>
      </div>

      <ExecutiveSummaryCard
        headline={`Health score ${healthScore}/100 (${band.label.toLowerCase()}) — ${totalTagged} feedback items tagged, ${shippedCount}/${items.length || 0} roadmap items shipped.`}
        points={recommendations}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AnimatedCard hover={false}>
          <p className="text-sm text-text-secondary">Week-4 retention</p>
          <p className="mt-1 text-3xl font-semibold text-text-primary [font-variant-numeric:tabular-nums]">
            {week4Retention === null ? "—" : `${week4Retention}%`}
          </p>
        </AnimatedCard>

        <AnimatedCard hover={false}>
          <p className="text-sm text-text-secondary">NPS</p>
          <p className="mt-1 text-lg font-medium text-text-muted">Not yet collected</p>
          <p className="mt-1 text-xs text-text-muted">Placeholder — no survey source connected</p>
        </AnimatedCard>

        <AnimatedCard hover={false}>
          <p className="text-sm text-text-secondary">Feedback sentiment</p>
          {totalTagged === 0 ? (
            <p className="mt-1 text-sm text-text-muted">No feedback tagged yet</p>
          ) : (
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <span style={{ color: "var(--status-good)" }}>● Positive: {sentimentCounts.positive}</span>
              <span style={{ color: "var(--text-muted)" }}>● Neutral: {sentimentCounts.neutral}</span>
              <span style={{ color: "var(--status-critical)" }}>● Negative: {sentimentCounts.negative}</span>
            </div>
          )}
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatedCard hover={false}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-critical" />
            <p className="text-sm font-semibold text-text-primary">Top risk</p>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {topNegativeTheme
              ? `"${topNegativeTheme[0]}" — ${topNegativeTheme[1]} negative mentions this period.`
              : "No significant negative feedback themes right now."}
          </p>
        </AnimatedCard>

        <AnimatedCard hover={false}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-status-good" />
            <p className="text-sm font-semibold text-text-primary">Top opportunity</p>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {topOpportunity
              ? `"${topOpportunity.title}" — ${topOpportunity.priority_score}/100 priority, not yet shipped.`
              : "Run AI prioritization on the Roadmap page to surface an opportunity."}
          </p>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatedCard hover={false}>
          <p className="text-sm font-semibold text-text-primary">Roadmap progress</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-2 rounded-full bg-gradient-brand"
              style={{ width: `${roadmapProgressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {shippedCount} of {items.length} roadmap items shipped ({roadmapProgressPct}%)
          </p>
        </AnimatedCard>

        <AnimatedCard hover={false}>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-brand" />
            <p className="text-sm font-semibold text-text-primary">Active experiments</p>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {(experiments ?? []).length} experiment(s) running, {significantExperiments.length} with a
            statistically significant result.
          </p>
        </AnimatedCard>
      </div>

      <section>
        <SectionHeader title="Top feature adoption (30 days)" />
        {adoption.length === 0 ? (
          <p className="text-sm text-text-muted">No features registered yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {adoption.map((f) => (
              <li key={f.key} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-text-primary">{f.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-2 rounded-full bg-gradient-brand"
                    style={{ width: `${Math.min(f.adoptionPct, 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-text-muted [font-variant-numeric:tabular-nums]">
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
