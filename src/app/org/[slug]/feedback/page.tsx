import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { AddFeedbackForm, ImportCsvForm } from "./feedback-forms";
import { ClusterButton } from "./cluster-button";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("feedback_items")
    .select("id, body, author, source, sentiment, theme, created_at")
    .eq("org_id", org.orgId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Feedback</h1>
        <p className="text-sm text-neutral-500">
          Manual entries and CSV imports land here, then get clustered into themes with
          sentiment by the AI layer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="mb-3 text-sm font-medium text-neutral-500">Add feedback manually</h2>
          <AddFeedbackForm slug={slug} />
        </section>

        <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="mb-3 text-sm font-medium text-neutral-500">Import from CSV</h2>
          <p className="mb-3 text-xs text-neutral-500">
            Expects a header row with a <code>body</code> column (or <code>feedback</code>/
            <code>text</code>) and an optional <code>author</code> column.
          </p>
          <ImportCsvForm slug={slug} />
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-500">
            {items?.length ?? 0} feedback item(s)
          </h2>
          <ClusterButton orgId={org.orgId} />
        </div>
        <ul className="flex flex-col gap-3">
          {(items ?? []).map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <p className="text-sm">{item.body}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                {item.author && <span>{item.author}</span>}
                <span className="rounded-full border border-neutral-300 px-2 py-0.5 dark:border-neutral-700">
                  {item.source}
                </span>
                {item.sentiment && (
                  <span className="rounded-full border border-neutral-300 px-2 py-0.5 dark:border-neutral-700">
                    {item.sentiment}
                  </span>
                )}
                {item.theme && (
                  <span className="rounded-full border border-neutral-300 px-2 py-0.5 dark:border-neutral-700">
                    {item.theme}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
