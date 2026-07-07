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
    error: getUserError,
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user) {
    redirect("/login");
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: parsed.data.name, slug: parsed.data.slug, created_by: user.id })
    .select("id, slug")
    .single();

  if (orgError || !org) {
    return {
      error: `[DEBUG] msg=${orgError?.message} | code=${orgError?.code} | details=${orgError?.details} | hint=${orgError?.hint} | user.id=${user.id} | sessionPresent=${Boolean(session)} | role=${session?.user?.role ?? "none"} | aud=${session?.user?.aud ?? "none"}`,
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
