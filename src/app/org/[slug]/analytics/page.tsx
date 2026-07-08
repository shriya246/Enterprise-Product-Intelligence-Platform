import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { DailyActiveUsersChart, RetentionChart } from "@/components/charts/analytics-charts";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { FeatureAdoption } from "./feature-adoption";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();
  const data = await getOrgAnalyticsData(supabase, org.orgId);
  const sparkline = data.dailySeries.map((p) => p.activeUsers);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Analytics"
        description={`Last ${data.lookbackDays} days · ${data.events.length.toLocaleString()} events`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Daily active users" value={data.dau} sparkline={sparkline} delay={0} />
        <MetricCard label="Weekly active users" value={data.wau} sparkline={sparkline} delay={0.05} />
        <MetricCard label="Monthly active users" value={data.mau} sparkline={sparkline} delay={0.1} />
      </div>

      <ChartCard title="Daily active users" delay={0.1}>
        <DailyActiveUsersChart data={data.dailySeries} />
      </ChartCard>

      <ChartCard title="Weekly retention" subtitle="Pooled cohort curve" delay={0.15}>
        <RetentionChart data={data.retention} />
      </ChartCard>

      <section>
        <SectionHeader title="Top events" />
        {data.topEvents.length === 0 ? (
          <p className="text-sm text-text-muted">No events yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-xs text-text-muted">
                  <th className="px-4 py-2.5 font-medium">Event</th>
                  <th className="px-4 py-2.5 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.topEvents.map((e) => (
                  <tr key={e.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5">{e.name}</td>
                    <td className="px-4 py-2.5 [font-variant-numeric:tabular-nums]">
                      {e.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Feature adoption" />
        <FeatureAdoption slug={slug} results={data.adoption} />
      </section>
    </div>
  );
}
