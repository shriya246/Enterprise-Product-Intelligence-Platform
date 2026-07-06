import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OrgRole } from "@/lib/supabase/database.types";

export interface OrgContext {
  orgId: string;
  orgName: string;
  orgSlug: string;
  role: OrgRole;
  userId: string;
}

/** Resolves the org by slug and confirms the current user is a member. Redirects otherwise. */
export async function requireOrgMembership(slug: string): Promise<OrgContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!org) {
    redirect("/onboarding");
  }

  const { data: membership } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  return {
    orgId: org.id,
    orgName: org.name,
    orgSlug: org.slug,
    role: membership.role,
    userId: user.id,
  };
}

/** Throws when the current role can't perform an admin-only action (defense in depth alongside RLS). */
export function assertAdmin(role: OrgRole) {
  if (role !== "owner" && role !== "admin") {
    throw new Error("This action requires an admin or owner role.");
  }
}
