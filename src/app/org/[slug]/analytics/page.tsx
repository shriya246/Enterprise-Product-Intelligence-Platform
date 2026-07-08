import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { StatTiles, DailyActiveUsersChart, RetentionChart } from "@/components/charts/analytics-charts";
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-neutral-500">
          Last {data.lookbackDays} days · {data.events.length.toLocaleString()} events
        </p>
      </div>

      <StatTiles dau={data.dau} wau={data.wau} mau={data.mau} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Daily active users</h2>
        <DailyActiveUsersChart data={data.dailySeries} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Weekly retention</h2>
        <RetentionChart data={data.retention} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Top events</h2>
        {data.topEvents.length === 0 ? (
          <p className="text-sm text-neutral-500">No events yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 dark:border-neutral-800">
                <th className="py-2 font-medium">Event</th>
                <th className="py-2 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.topEvents.map((e) => (
                <tr key={e.name} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="py-2">{e.name}</td>
                  <td className="py-2 [font-variant-numeric:tabular-nums]">
                    {e.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Feature adoption</h2>
        <FeatureAdoption slug={slug} results={data.adoption} />
      </section>
    </div>
  );
}
