import { Filter } from "lucide-react";
import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { FunnelBuilder } from "@/components/charts/analytics-charts";
import { PageHeader } from "@/components/ui/page-header";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";

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
      <PageHeader
        title="Funnels"
        description={`Last ${data.lookbackDays} days · build an ordered funnel from any events you're tracking.`}
      />

      {data.eventNames.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No events yet"
          description="Send some with the tracking snippet to see a funnel here."
        />
      ) : (
        <ChartCard title="Conversion funnel" subtitle="Click event names to add or remove steps">
          <FunnelBuilder events={data.events} eventNames={data.eventNames} />
        </ChartCard>
      )}
    </div>
  );
}
