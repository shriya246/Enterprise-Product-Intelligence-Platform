import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { AddFeedbackForm, ImportCsvForm } from "./feedback-forms";
import { ClusterButton } from "./cluster-button";
import { FeedbackList } from "./feedback-list";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedCard } from "@/components/ui/animated-card";
import { InsightCard } from "@/components/ui/insight-card";
import { SectionHeader } from "@/components/ui/section-header";

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

  const list = items ?? [];
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  const themeCounts = new Map<string, number>();
  for (const item of list) {
    if (item.sentiment === "positive") sentimentCounts.positive += 1;
    else if (item.sentiment === "neutral") sentimentCounts.neutral += 1;
    else if (item.sentiment === "negative") sentimentCounts.negative += 1;
    if (item.theme) themeCounts.set(item.theme, (themeCounts.get(item.theme) ?? 0) + 1);
  }
  const taggedCount = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
  const topTheme = [...themeCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Feedback"
        description="Manual entries and CSV imports land here, then get clustered into themes with sentiment by the AI layer."
      />

      {taggedCount > 0 && (
        <InsightCard
          title="Feedback summary"
          action={
            <Link
              href={`/org/${slug}/feedback/themes`}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View themes
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          {taggedCount} of {list.length} items tagged — {sentimentCounts.positive} positive,{" "}
          {sentimentCounts.neutral} neutral, {sentimentCounts.negative} negative.
          {topTheme && ` Top theme: "${topTheme[0]}" (${topTheme[1]} mentions).`}
        </InsightCard>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AnimatedCard hover={false}>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Add feedback manually</h2>
          <AddFeedbackForm slug={slug} />
        </AnimatedCard>

        <AnimatedCard hover={false} delay={0.05}>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Import from CSV</h2>
          <p className="mb-3 text-xs text-text-muted">
            Expects a header row with a <code>body</code> column (or <code>feedback</code>/
            <code>text</code>) and an optional <code>author</code> column.
          </p>
          <ImportCsvForm slug={slug} />
        </AnimatedCard>
      </div>

      <section>
        <SectionHeader
          title={`${list.length} feedback item(s)`}
          action={<ClusterButton orgId={org.orgId} />}
        />
        <FeedbackList items={list} />
      </section>
    </div>
  );
}
