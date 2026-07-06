import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { GeneratorPanel } from "./generator-panel";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-neutral-500">{title}</h4>
      <ul className="mt-1 list-inside list-disc text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function PrdGeneratorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  const supabase = await createClient();
  const { data: drafts } = await supabase
    .from("prd_drafts")
    .select("*")
    .eq("org_id", org.orgId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">PRD Generator</h1>
        <p className="text-sm text-neutral-500">
          Draft user stories, acceptance criteria, success metrics, and risks from a feature idea.
        </p>
      </div>

      <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <GeneratorPanel orgId={org.orgId} />
      </section>

      <section className="flex flex-col gap-4">
        {(drafts ?? []).map((draft) => (
          <article
            key={draft.id}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <h3 className="text-base font-semibold">{draft.title}</h3>
            <p className="mt-1 text-xs text-neutral-500">From: &ldquo;{draft.feature_idea}&rdquo;</p>
            <div className="mt-4 flex flex-col gap-3">
              <List title="User stories" items={draft.user_stories} />
              <List title="Acceptance criteria" items={draft.acceptance_criteria} />
              <List title="Success metrics" items={draft.success_metrics} />
              <List title="Risks" items={draft.risks} />
            </div>
          </article>
        ))}
        {(drafts ?? []).length === 0 && (
          <p className="text-sm text-neutral-500">
            No PRD drafts yet. Describe a feature idea above to generate the first one.
          </p>
        )}
      </section>
    </div>
  );
}
