"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin, requireOrgMembership } from "@/lib/org";
import { addMemberSchema, changeRoleSchema, removeMemberSchema } from "@/lib/validation/org-settings";

export interface SettingsFormState {
  error?: string;
}

async function writeAuditLog(
  orgId: string,
  actorId: string,
  action: string,
  targetId: string,
  metadata: Record<string, unknown>
) {
  const supabase = await createClient();
  await supabase.from("audit_log").insert({
    org_id: orgId,
    actor_id: actorId,
    action,
    target_type: "org_member",
    target_id: targetId,
    metadata,
  });
}

export async function addMember(
  slug: string,
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const org = await requireOrgMembership(slug);

  try {
    assertAdmin(org.role);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Not authorized" };
  }

  const parsed = addMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Looking up another user's profile by email requires the service-role
  // client since profiles RLS only allows reading your own row.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (!profile) {
    return {
      error: "No PulseAI account exists for that email yet. They need to sign up first.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("org_members").insert({
    org_id: org.orgId,
    user_id: profile.id,
    role: parsed.data.role,
    invited_by: org.userId,
  });

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(org.orgId, org.userId, "member_added", profile.id, {
    role: parsed.data.role,
  });

  revalidatePath(`/org/${slug}/settings`);
  return {};
}

export async function changeRole(slug: string, formData: FormData): Promise<void> {
  const org = await requireOrgMembership(slug);
  assertAdmin(org.role);

  const parsed = changeRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success || parsed.data.userId === org.userId) return;

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", org.orgId)
    .eq("user_id", parsed.data.userId)
    .maybeSingle();

  await supabase
    .from("org_members")
    .update({ role: parsed.data.role })
    .eq("org_id", org.orgId)
    .eq("user_id", parsed.data.userId);

  await writeAuditLog(org.orgId, org.userId, "role_changed", parsed.data.userId, {
    from: before?.role,
    to: parsed.data.role,
  });

  revalidatePath(`/org/${slug}/settings`);
}

export async function removeMember(slug: string, formData: FormData): Promise<void> {
  const org = await requireOrgMembership(slug);
  assertAdmin(org.role);

  const parsed = removeMemberSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success || parsed.data.userId === org.userId) return;

  const supabase = await createClient();
  await supabase
    .from("org_members")
    .delete()
    .eq("org_id", org.orgId)
    .eq("user_id", parsed.data.userId);

  await writeAuditLog(org.orgId, org.userId, "member_removed", parsed.data.userId, {});

  revalidatePath(`/org/${slug}/settings`);
}
