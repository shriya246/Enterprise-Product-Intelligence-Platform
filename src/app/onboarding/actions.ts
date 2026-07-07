"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createOrgSchema } from "@/lib/validation/auth";

export interface OnboardingFormState {
  error?: string;
}

export async function createOrg(
  _prevState: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user) {
    redirect("/login");
  }

  let jwtClaims = "none";
  if (session?.access_token) {
    try {
      const payload = session.access_token.split(".")[1];
      const decoded = JSON.parse(
        Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
      );
      jwtClaims = `role=${decoded.role} sub=${decoded.sub} aud=${JSON.stringify(decoded.aud)} exp=${decoded.exp} iss=${decoded.iss}`;
    } catch (e) {
      jwtClaims = `decode failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  // Raw fetch straight to PostgREST, bypassing supabase-js, to isolate whether
  // the client library or the RLS policy itself is the problem.
  let rawResult = "not attempted";
  try {
    const rawRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${session?.access_token}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: `${parsed.data.name}-rawtest`,
        slug: `${parsed.data.slug}-rawtest-${Date.now()}`,
        created_by: user.id,
      }),
    });
    const rawBody = await rawRes.text();
    rawResult = `status=${rawRes.status} body=${rawBody.slice(0, 300)}`;
  } catch (e) {
    rawResult = `fetch failed: ${e instanceof Error ? e.message : String(e)}`;
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: parsed.data.name, slug: parsed.data.slug, created_by: user.id })
    .select("id, slug")
    .single();

  if (orgError || !org) {
    return {
      error: `[DEBUG] msg=${orgError?.message} | code=${orgError?.code} | jwt=${jwtClaims} | raw=${rawResult}`,
    };
  }

  const { error: memberError } = await supabase
    .from("org_members")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect(`/org/${org.slug}/dashboard`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
