import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedCard } from "@/components/ui/animated-card";
import { WriteKeyDisplay } from "./write-key-display";
import { CopyableCode } from "./copyable-code";

export default async function ApiKeysPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("write_key")
    .eq("id", org.orgId)
    .single();

  const writeKey = organization?.write_key ?? "unavailable";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-deployment.example.com";

  const snippet = `<script src="${appUrl}/pulseai-sdk.js"></script>
<script>
  pulseai.init("${writeKey}");
  pulseai.track("signed_up", { plan: "free" });
</script>`;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="API Keys"
        description="Your org's write key identifies event traffic from the tracking SDK — keep it out of public repos, but it's safe to embed client-side (same model as PostHog/Mixpanel)."
      />

      <AnimatedCard hover={false}>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Write key</h2>
        <WriteKeyDisplay writeKey={writeKey} />
      </AnimatedCard>

      <AnimatedCard hover={false}>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Tracking snippet</h2>
        <p className="mb-3 text-sm text-text-secondary">
          Drop this into your product&apos;s HTML to start sending events to this org.
        </p>
        <CopyableCode code={snippet} label="HTML" />
      </AnimatedCard>
    </div>
  );
}
