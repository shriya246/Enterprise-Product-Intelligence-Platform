import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapStatus } from "@/lib/supabase/database.types";
import { RoadmapForm } from "./roadmap-form";
import { StatusSelect } from "./status-select";
import { PrioritizeButton } from "./prioritize-button";

const STATUS_COLUMNS: { status: RoadmapStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "planned", label: "Planned" },
  { status: "in_progress", label: "In progress" },
  { status: "shipped", label: "Shipped" },
];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Roadmap</h1>
          <p className="text-sm text-neutral-500">
            Prioritize with real engagement and feedback signal, not just gut feel.
          </p>
        </div>
        <PrioritizeButton orgId={org.orgId} />
      </div>

      <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Add roadmap item</h2>
        <RoadmapForm
          slug={slug}
          features={features ?? []}
          existingItems={(items ?? []).map((i) => ({ id: i.id, title: i.title }))}
        />
      </section>

      {prioritized.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-neutral-500">AI-suggested priority</h2>
          <ol className="flex flex-col gap-2">
            {prioritized.map((item, i) => (
              <li
                key={item.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {i + 1}. {item.title}
                  </span>
                  <span className="text-xs text-neutral-500 [font-variant-numeric:tabular-nums]">
                    {item.priority_score}/100
                  </span>
                </div>
                {item.priority_rationale && (
                  <p className="mt-1 text-xs text-neutral-500">{item.priority_rationale}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Board</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {STATUS_COLUMNS.map((col) => (
            <div key={col.status} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase text-neutral-500">{col.label}</h3>
              {(items ?? [])
                .filter((item) => item.status === col.status)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                  >
                    <p className="font-medium">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 text-xs text-neutral-500">{item.description}</p>
                    )}
                    {item.target_quarter && (
                      <p className="mt-1 text-xs text-neutral-500">{item.target_quarter}</p>
                    )}
                    {(dependsOnByItem.get(item.id) ?? []).length > 0 && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Depends on:{" "}
                        {(dependsOnByItem.get(item.id) ?? [])
                          .map((id) => itemsById.get(id)?.title ?? "unknown")
                          .join(", ")}
                      </p>
                    )}
                    <div className="mt-2">
                      <StatusSelect slug={slug} itemId={item.id} status={item.status} />
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Timeline</h2>
        <div className="flex flex-col gap-3">
          {[...byQuarter.entries()].map(([quarter, quarterItems]) => (
            <div key={quarter}>
              <h3 className="text-xs font-semibold text-neutral-500">{quarter}</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {(quarterItems ?? []).map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.title}{" "}
                    <span className="text-xs text-neutral-500">({item.status.replace("_", " ")})</span>
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
