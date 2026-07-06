import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { evaluateFlagSchema } from "@/lib/validation/experiments";

/** Deterministic 0-99 bucket for a distinctId + flag key, stable across calls (no randomness/state needed). */
function bucketOf(distinctId: string, flagKey: string): number {
  const input = `${flagKey}:${distinctId}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = evaluateFlagSchema.safeParse({
    writeKey: searchParams.get("writeKey"),
    flagKey: searchParams.get("flagKey"),
    distinctId: searchParams.get("distinctId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { writeKey, flagKey, distinctId } = parsed.data;

  const { success } = await rateLimit(writeKey, {
    prefix: "flags-evaluate",
    limit: 300,
    windowSeconds: 60,
  });
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("write_key", writeKey)
    .maybeSingle();

  if (!org) {
    return NextResponse.json({ error: "Unknown write key" }, { status: 401 });
  }

  const { data: flag } = await supabase
    .from("feature_flags")
    .select("is_enabled, rollout_pct")
    .eq("org_id", org.id)
    .eq("key", flagKey)
    .maybeSingle();

  if (!flag) {
    return NextResponse.json({ enabled: false });
  }

  const enabled = flag.is_enabled && bucketOf(distinctId, flagKey) < flag.rollout_pct;
  return NextResponse.json({ enabled });
}
