import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { trackEventSchema } from "@/lib/validation/events";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = trackEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { writeKey, distinctId, eventName, properties, occurredAt } = parsed.data;

  const { success } = await rateLimit(writeKey, {
    prefix: "events-ingest",
    limit: 100,
    windowSeconds: 60,
  });

  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const supabase = createAdminClient();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("write_key", writeKey)
    .maybeSingle();

  if (orgError || !org) {
    return NextResponse.json({ error: "Unknown write key" }, { status: 401 });
  }

  const { error: insertError } = await supabase.from("events").insert({
    org_id: org.id,
    distinct_id: distinctId,
    event_name: eventName,
    properties,
    occurred_at: occurredAt ?? new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
