import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { GeneratorPanel } from "./generator-panel";
import { CopyMarkdownButton } from "./copy-markdown-button";
import { QualityChecklist } from "./quality-checklist";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedCard } from "@/components/ui/animated-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h4>
      <ul className="mt-1.5 list-inside list-disc text-sm text-text-primary">
        {items.map((item, i) => (
          <li key={i} className="mb-0.5">
            {item}
          </li>
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
  const [{ data: drafts }, { data: feedbackRows }] = await Promise.all([
    supabase
      .from("prd_drafts")
      .select("*")
      .eq("org_id", org.orgId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("feedback_items").select("theme").eq("org_id", org.orgId).not("theme", "is", null),
  ]);

  const themes = [...new Set((feedbackRows ?? []).map((r) => r.theme).filter((t): t is string => Boolean(t)))];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="PRD Generator"
        description="Draft user stories, acceptance criteria, success metrics, and risks from a feature idea."
      />

      <AnimatedCard hover={false}>
        <GeneratorPanel orgId={org.orgId} themes={themes} />
      </AnimatedCard>

      <section className="flex flex-col gap-4">
        {(drafts ?? []).length === 0 && (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No PRD drafts yet"
            description="Describe a feature idea above to generate the first one."
          />
        )}
        {(drafts ?? []).map((draft, i) => (
          <AnimatedCard key={draft.id} delay={i * 0.05} hover={false}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{draft.title}</h3>
                <p className="mt-1 text-xs text-text-muted">
                  From: &ldquo;{draft.feature_idea}&rdquo;
                </p>
              </div>
              <CopyMarkdownButton draft={draft} />
            </div>

            <div className="mt-3">
              <QualityChecklist draft={draft} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <List title="User stories" items={draft.user_stories} />
              <List title="Acceptance criteria" items={draft.acceptance_criteria} />
              <List title="Success metrics" items={draft.success_metrics} />
              <List title="Risks" items={draft.risks} />
            </div>
          </AnimatedCard>
        ))}
      </section>
    </div>
  );
}
