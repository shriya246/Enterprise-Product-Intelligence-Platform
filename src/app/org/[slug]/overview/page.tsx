import Link from "next/link";
import { BarChart3, MessageSquare, Sparkles, Map } from "lucide-react";
import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { DailyActiveUsersChart } from "@/components/charts/analytics-charts";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { InsightCard } from "@/components/ui/insight-card";

const QUICK_LINKS = [
  { href: "analytics", label: "Analytics", description: "KPIs, trends, feature adoption", icon: BarChart3 },
  { href: "feedback", label: "Feedback", description: "Themes, sentiment, imports", icon: MessageSquare },
  { href: "chat", label: "AI Assistant", description: "Ask questions about your data", icon: Sparkles },
  { href: "roadmap", label: "Roadmap", description: "Prioritized by real usage signal", icon: Map },
];

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();
  const data = await getOrgAnalyticsData(supabase, org.orgId);

  const sparkline = data.dailySeries.map((p) => p.activeUsers);
  const week1 = data.dailySeries.slice(0, Math.ceil(data.dailySeries.length / 2));
  const week2 = data.dailySeries.slice(Math.ceil(data.dailySeries.length / 2));
  const avg = (arr: typeof week1) =>
    arr.length === 0 ? 0 : arr.reduce((s, p) => s + p.activeUsers, 0) / arr.length;
  const trendPct =
    avg(week1) === 0 ? null : Math.round(((avg(week2) - avg(week1)) / avg(week1)) * 1000) / 10;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Overview"
        description={`${org.orgName} · last ${data.lookbackDays} days · ${data.events.length.toLocaleString()} events`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Daily active users" value={data.dau} sparkline={sparkline} delay={0} />
        <MetricCard
          label="Weekly active users"
          value={data.wau}
          deltaPct={trendPct}
          sparkline={sparkline}
          delay={0.05}
        />
        <MetricCard label="Monthly active users" value={data.mau} sparkline={sparkline} delay={0.1} />
      </div>

      <ChartCard title="Daily active users" subtitle="Last 30 days">
        <DailyActiveUsersChart data={data.dailySeries} />
      </ChartCard>

      {data.events.length > 0 && (
        <InsightCard title="Worth a look">
          {data.dau === 0
            ? "No activity in the last 24 hours — check that the tracking snippet is still firing."
            : `${data.dau} users active today out of ${data.mau} over the last 30 days. Check Analytics for the full retention picture.`}
        </InsightCard>
      )}

      <section>
        <SectionHeader title="Jump to" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`/org/${slug}/${link.href}`}
              className="group rounded-xl border border-border bg-surface p-4 text-sm transition-colors hover:border-brand/30 hover:bg-brand-subtle"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle text-brand group-hover:bg-white">
                <link.icon className="h-4 w-4" />
              </span>
              <p className="mt-2.5 font-medium text-text-primary">{link.label}</p>
              <p className="mt-0.5 text-xs text-text-muted">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
