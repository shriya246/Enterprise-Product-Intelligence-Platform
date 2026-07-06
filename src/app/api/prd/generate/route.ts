import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { isGroqConfigured } from "@/lib/ai/groq";
import { generatePrd } from "@/lib/ai/prd-generator";
import { generatePrdSchema } from "@/lib/validation/prd";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = generatePrdSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { orgId, featureIdea } = parsed.data;

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
    prefix: "prd-generate",
    limit: 10,
    windowSeconds: 60,
  });
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!isGroqConfigured()) {
    return NextResponse.json(
      { error: "The PRD generator is not connected yet. Add GROQ_API_KEY to enable it." },
      { status: 501 }
    );
  }

  const draft = await generatePrd(featureIdea);

  const { data: saved, error } = await supabase
    .from("prd_drafts")
    .insert({
      org_id: orgId,
      feature_idea: featureIdea,
      title: draft.title,
      user_stories: draft.userStories,
      acceptance_criteria: draft.acceptanceCriteria,
      success_metrics: draft.successMetrics,
      risks: draft.risks,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draft: saved });
}
