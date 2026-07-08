import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { FunnelBuilder } from "@/components/charts/analytics-charts";

export default async function FunnelsPage({
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
        <h1 className="text-xl font-semibold">Funnels</h1>
        <p className="text-sm text-neutral-500">
          Last {data.lookbackDays} days · build an ordered funnel from any events you&apos;re
          tracking.
        </p>
      </div>

      {data.eventNames.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No events yet. Send some with the tracking snippet to see a funnel here.
        </p>
      ) : (
        <FunnelBuilder events={data.events} eventNames={data.eventNames} />
      )}
    </div>
  );
}
