import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { isGroqConfigured } from "@/lib/ai/groq";
import { clusterFeedback } from "@/lib/ai/feedback-clustering";
import { z } from "zod";

const bodySchema = z.object({ orgId: z.string().uuid() });

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
    prefix: "feedback-cluster",
    limit: 10,
    windowSeconds: 60,
  });
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!isGroqConfigured()) {
    return NextResponse.json(
      { error: "AI clustering is not connected yet. Add GROQ_API_KEY to enable it." },
      { status: 501 }
    );
  }

  const { data: items, error: fetchError } = await supabase
    .from("feedback_items")
    .select("id, body")
    .eq("org_id", orgId)
    .is("theme", null)
    .limit(50);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ ok: true, clustered: 0 });
  }

  const results = await clusterFeedback(items);

  await Promise.all(
    results.map((result) =>
      supabase
        .from("feedback_items")
        .update({ sentiment: result.sentiment, theme: result.theme })
        .eq("id", result.id)
        .eq("org_id", orgId)
    )
  );

  return NextResponse.json({ ok: true, clustered: results.length });
}
