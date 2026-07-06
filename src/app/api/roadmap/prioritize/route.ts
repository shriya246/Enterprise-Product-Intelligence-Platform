import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { isGroqConfigured } from "@/lib/ai/groq";
import { prioritizeRoadmap, type RoadmapItemForPrioritization } from "@/lib/ai/roadmap-prioritization";
import { featureAdoption, type UsageEvent } from "@/lib/analytics";

const bodySchema = z.object({ orgId: z.string().uuid() });

function themeMentionsForTitle(title: string, themes: string[]): number {
  const words = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  return themes.filter((theme) =>
    words.some((word) => theme.toLowerCase().includes(word))
  ).length;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { orgId } = parsed.data;

  const { data: membership } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
  }

  const { success } = await rateLimit(user.id, {
    prefix: "roadmap-prioritize",
    limit: 10,
    windowSeconds: 60,
  });
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!isGroqConfigured()) {
    return NextResponse.json(
      { error: "AI prioritization is not connected yet. Add GROQ_API_KEY to enable it." },
      { status: 501 }
    );
  }

  const [{ data: items }, { data: featureRows }, { data: eventRows }, { data: feedbackRows }] =
    await Promise.all([
      supabase
        .from("roadmap_items")
        .select("id, title, description, status, linked_feature_id")
        .eq("org_id", orgId),
      supabase.from("features").select("id, key, name").eq("org_id", orgId),
      supabase
        .from("events")
        .select("distinct_id, event_name, occurred_at")
        .eq("org_id", orgId)
        .limit(10000),
      supabase.from("feedback_items").select("theme").eq("org_id", orgId).not("theme", "is", null),
    ]);

  if (!items || items.length === 0) {
    return NextResponse.json({ ok: true, prioritized: 0 });
  }

  const events: UsageEvent[] = (eventRows ?? []).map((row) => ({
    distinctId: row.distinct_id,
    eventName: row.event_name,
    occurredAt: row.occurred_at,
  }));

  const asOf = new Date();
  const adoption = featureAdoption(events, featureRows ?? [], 30, asOf);
  const adoptionByFeatureId = new Map(
    (featureRows ?? []).map((f, i) => [f.id, adoption[i]?.adoptionPct ?? 0])
  );

  const themes = (feedbackRows ?? []).map((r) => r.theme).filter((t): t is string => Boolean(t));

  const itemsForAi: RoadmapItemForPrioritization[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    adoptionPct: item.linked_feature_id
      ? (adoptionByFeatureId.get(item.linked_feature_id) ?? null)
      : null,
    feedbackMentions: themeMentionsForTitle(item.title, themes),
  }));

  const results = await prioritizeRoadmap(itemsForAi);

  await Promise.all(
    results.map((result) =>
      supabase
        .from("roadmap_items")
        .update({ priority_score: result.priorityScore, priority_rationale: result.rationale })
        .eq("id", result.id)
        .eq("org_id", orgId)
    )
  );

  return NextResponse.json({ ok: true, prioritized: results.length });
}
