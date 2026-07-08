import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { getOrgAnalyticsData } from "@/lib/get-org-analytics";
import { CohortHeatmap } from "./cohort-heatmap";

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
      <div>
        <h1 className="text-xl font-semibold">Cohorts</h1>
        <p className="text-sm text-neutral-500">
          Weekly cohorts, kept separate rather than pooled — see exactly which signup week is
          retaining and which isn&apos;t.
        </p>
      </div>

      <CohortHeatmap rows={data.cohorts} />
    </div>
  );
}
