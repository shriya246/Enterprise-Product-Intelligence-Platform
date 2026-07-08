import Link from "next/link";
import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { StatTiles, DailyActiveUsersChart } from "@/components/charts/analytics-charts";

const QUICK_LINKS = [
  { href: "analytics", label: "Analytics", description: "KPIs, trends, feature adoption" },
  { href: "feedback", label: "Feedback", description: "Themes, sentiment, imports" },
  { href: "chat", label: "AI Assistant", description: "Ask questions about your data" },
  { href: "roadmap", label: "Roadmap", description: "Prioritized by real usage signal" },
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-neutral-500">
          {org.orgName} · last {data.lookbackDays} days · {data.events.length.toLocaleString()}{" "}
          events
        </p>
      </div>

      <StatTiles dau={data.dau} wau={data.wau} mau={data.mau} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Daily active users</h2>
        <DailyActiveUsersChart data={data.dailySeries} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Jump to</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`/org/${slug}/${link.href}`}
              className="rounded-lg border border-neutral-200 p-4 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              <p className="font-medium">{link.label}</p>
              <p className="mt-1 text-xs text-neutral-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
