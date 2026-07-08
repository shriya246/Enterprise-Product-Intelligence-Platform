import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapStatus } from "@/lib/supabase/database.types";
import { RoadmapForm } from "./roadmap-form";
import { StatusSelect } from "./status-select";
import { PrioritizeButton } from "./prioritize-button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimatedCard } from "@/components/ui/animated-card";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { PriorityBadge, type Priority } from "@/components/ui/priority-badge";
import { Sparkles } from "lucide-react";

const STATUS_COLUMNS: { status: RoadmapStatus; label: string; tone: StatusTone }[] = [
  { status: "backlog", label: "Backlog", tone: "neutral" },
  { status: "planned", label: "Planned", tone: "brand" },
  { status: "in_progress", label: "In progress", tone: "warning" },
  { status: "shipped", label: "Shipped", tone: "good" },
];

function priorityOf(score: number | null): Priority | null {
  if (score === null) return null;
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export default async function RoadmapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();

  const [{ data: items }, { data: dependencies }, { data: features }] = await Promise.all([
    supabase
      .from("roadmap_items")
      .select("id, title, description, status, target_quarter, priority_score, priority_rationale")
      .eq("org_id", org.orgId)
      .order("created_at", { ascending: true }),
    supabase
      .from("roadmap_item_dependencies")
      .select("roadmap_item_id, depends_on_item_id")
      .eq("org_id", org.orgId),
    supabase.from("features").select("id, name").eq("org_id", org.orgId),
  ]);

  const itemsById = new Map((items ?? []).map((item) => [item.id, item]));
  const dependsOnByItem = new Map<string, string[]>();
  for (const dep of dependencies ?? []) {
    if (!dependsOnByItem.has(dep.roadmap_item_id)) dependsOnByItem.set(dep.roadmap_item_id, []);
    dependsOnByItem.get(dep.roadmap_item_id)!.push(dep.depends_on_item_id);
  }

  const prioritized = (items ?? [])
    .filter((item) => item.priority_score !== null)
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));

  const byQuarter = new Map<string, typeof items>();
  for (const item of items ?? []) {
    const key = item.target_quarter ?? "Unscheduled";
    if (!byQuarter.has(key)) byQuarter.set(key, []);
    byQuarter.get(key)!.push(item);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Roadmap"
        description="Prioritize with real engagement and feedback signal, not just gut feel."
        actions={<PrioritizeButton orgId={org.orgId} />}
      />

      <AnimatedCard hover={false}>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Add roadmap item</h2>
        <RoadmapForm
          slug={slug}
          features={features ?? []}
          existingItems={(items ?? []).map((i) => ({ id: i.id, title: i.title }))}
        />
      </AnimatedCard>

      {prioritized.length > 0 && (
        <section>
          <SectionHeader title="AI-suggested priority" />
          <div className="rounded-2xl border border-brand/20 bg-gradient-radial-brand p-5">
            <ol className="flex flex-col gap-3">
              {prioritized.map((item, i) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary">{item.title}</p>
                      <span className="shrink-0 text-xs text-text-muted [font-variant-numeric:tabular-nums]">
                        {item.priority_score}/100
                      </span>
                    </div>
                    {item.priority_rationale && (
                      <p className="mt-0.5 text-xs text-text-secondary">{item.priority_rationale}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Board" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {STATUS_COLUMNS.map((col) => (
            <div key={col.status} className="flex flex-col gap-3">
              <StatusBadge label={col.label} tone={col.tone} />
              {(items ?? [])
                .filter((item) => item.status === col.status)
                .map((item, i) => {
                  const priority = priorityOf(item.priority_score);
                  return (
                    <AnimatedCard key={item.id} delay={i * 0.03} className="p-4">
                      <p className="text-sm font-medium text-text-primary">{item.title}</p>
                      {item.description && (
                        <p className="mt-1 text-xs text-text-muted">{item.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {item.target_quarter && (
                          <span className="text-xs text-text-muted">{item.target_quarter}</span>
                        )}
                        {priority && <PriorityBadge priority={priority} />}
                        {item.priority_rationale && (
                          <Sparkles className="h-3 w-3 text-brand" aria-label="AI prioritized" />
                        )}
                      </div>
                      {(dependsOnByItem.get(item.id) ?? []).length > 0 && (
                        <p className="mt-2 text-xs text-text-muted">
                          Depends on:{" "}
                          {(dependsOnByItem.get(item.id) ?? [])
                            .map((id) => itemsById.get(id)?.title ?? "unknown")
                            .join(", ")}
                        </p>
                      )}
                      <div className="mt-3">
                        <StatusSelect slug={slug} itemId={item.id} status={item.status} />
                      </div>
                    </AnimatedCard>
                  );
                })}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Timeline" />
        <div className="flex flex-col gap-4">
          {[...byQuarter.entries()].map(([quarter, quarterItems]) => (
            <div key={quarter}>
              <p className="text-xs font-semibold text-text-muted">{quarter}</p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {(quarterItems ?? []).map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-text-primary">
                    {item.title}
                    <span className="text-xs text-text-muted">({item.status.replace("_", " ")})</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
