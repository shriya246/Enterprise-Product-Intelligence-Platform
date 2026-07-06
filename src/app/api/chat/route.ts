import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { isGroqConfigured } from "@/lib/ai/groq";
import { buildOrgContext } from "@/lib/ai/chat-context";
import { answerQuestion } from "@/lib/ai/chat";
import { chatRequestSchema } from "@/lib/validation/chat";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { orgId, question } = parsed.data;

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
    prefix: "chat",
    limit: 20,
    windowSeconds: 60,
  });
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!isGroqConfigured()) {
    return NextResponse.json(
      { error: "The AI assistant is not connected yet. Add GROQ_API_KEY to enable it." },
      { status: 501 }
    );
  }

  const context = await buildOrgContext(supabase, orgId);
  const answer = await answerQuestion(question, context);

  return NextResponse.json({ answer });
}
