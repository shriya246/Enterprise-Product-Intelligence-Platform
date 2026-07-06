import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { FlagsPanel } from "./flags-panel";
import { ExperimentsPanel } from "./experiments-panel";

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
      <div>
        <h1 className="text-xl font-semibold">Experiments</h1>
        <p className="text-sm text-neutral-500">
          Feature flags gate rollout; experiments check whether a variant difference is real.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Feature flags</h2>
        <FlagsPanel slug={slug} flags={flags ?? []} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-500">A/B experiments</h2>
        <ExperimentsPanel slug={slug} experiments={experiments ?? []} />
      </section>
    </div>
  );
}
