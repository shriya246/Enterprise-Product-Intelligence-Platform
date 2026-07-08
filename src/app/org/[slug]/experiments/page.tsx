import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { FlagsPanel } from "./flags-panel";
import { ExperimentsPanel } from "./experiments-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";

export default async function ExperimentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();

  const [{ data: flags }, { data: experiments }] = await Promise.all([
    supabase
      .from("feature_flags")
      .select("id, key, name, is_enabled, rollout_pct")
      .eq("org_id", org.orgId)
      .order("created_at", { ascending: true }),
    supabase
      .from("experiments")
      .select("*")
      .eq("org_id", org.orgId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Experiments"
        description="Feature flags gate rollout; experiments check whether a variant difference is real."
      />

      <section>
        <SectionHeader title="Feature flags" />
        <FlagsPanel slug={slug} flags={flags ?? []} />
      </section>

      <section>
        <SectionHeader title="A/B experiments" />
        <ExperimentsPanel slug={slug} experiments={experiments ?? []} />
      </section>
    </div>
  );
}
