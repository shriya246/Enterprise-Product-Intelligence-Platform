import { Grid3x3 } from "lucide-react";
import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { CohortHeatmap } from "./cohort-heatmap";
import { PageHeader } from "@/components/ui/page-header";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CohortsPage({
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
        title="Cohorts"
        description="Weekly cohorts, kept separate rather than pooled — see exactly which signup week is retaining and which isn't."
      />

      {data.cohorts.length === 0 ? (
        <EmptyState
          icon={<Grid3x3 className="h-5 w-5" />}
          title="No cohorts yet"
          description="Cohorts appear once users start generating events."
        />
      ) : (
        <ChartCard title="Weekly cohort retention">
          <CohortHeatmap rows={data.cohorts} />
        </ChartCard>
      )}
    </div>
  );
}
