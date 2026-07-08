import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ThemeExplorer, type ThemeCluster } from "./theme-explorer";
import type { FeedbackItem } from "../feedback-list";

function severityOf(negative: number, count: number): ThemeCluster["severity"] {
  const ratio = count === 0 ? 0 : negative / count;
  if (ratio >= 0.5) return "high";
  if (ratio >= 0.25) return "medium";
  return "low";
}

export default async function FeedbackThemesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  const supabase = await createClient();
  const { data } = await supabase
    .from("feedback_items")
    .select("id, body, author, source, sentiment, theme, created_at")
    .eq("org_id", org.orgId)
    .not("theme", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);

  const items = (data ?? []) as FeedbackItem[];

  const byTheme = new Map<string, FeedbackItem[]>();
  for (const item of items) {
    if (!item.theme) continue;
    if (!byTheme.has(item.theme)) byTheme.set(item.theme, []);
    byTheme.get(item.theme)!.push(item);
  }

  const clusters: ThemeCluster[] = [...byTheme.entries()]
    .map(([theme, themeItems]) => {
      const positive = themeItems.filter((i) => i.sentiment === "positive").length;
      const neutral = themeItems.filter((i) => i.sentiment === "neutral").length;
      const negative = themeItems.filter((i) => i.sentiment === "negative").length;
      return {
        theme,
        count: themeItems.length,
        positive,
        neutral,
        negative,
        severity: severityOf(negative, themeItems.length),
        items: themeItems,
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={`/org/${slug}/feedback`}
        className="flex w-fit items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to feedback
      </Link>

      <PageHeader
        title="Feedback themes"
        description="AI-clustered feedback, grouped by theme with sentiment breakdown and severity."
      />

      {clusters.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No themes yet"
          description="Run AI clustering from the Feedback page once you have some feedback items."
        />
      ) : (
        <ThemeExplorer clusters={clusters} />
      )}
    </div>
  );
}
