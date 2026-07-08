"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin, requireOrgMembership } from "@/lib/org";
import {
  createExperimentSchema,
  createFlagSchema,
  toggleFlagSchema,
  updateExperimentCountsSchema,
  updateFlagRolloutSchema,
} from "@/lib/validation/experiments";
import { twoProportionZTest } from "@/lib/stats/ab-test";

export interface ExperimentFormState {
  error?: string;
}

export async function createFlag(
  slug: string,
  _prevState: ExperimentFormState,
  formData: FormData
): Promise<ExperimentFormState> {
  const org = await requireOrgMembership(slug);

  try {
    assertAdmin(org.role);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Not authorized" };
  }

  const parsed = createFlagSchema.safeParse({
    name: formData.get("name"),
    key: formData.get("key"),
    rolloutPct: formData.get("rolloutPct") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feature_flags").insert({
    org_id: org.orgId,
    name: parsed.data.name,
    key: parsed.data.key,
    rollout_pct: parsed.data.rolloutPct,
    created_by: org.userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${slug}/experiments`);
  return {};
}

export async function toggleFlag(slug: string, formData: FormData): Promise<void> {
  const org = await requireOrgMembership(slug);
  assertAdmin(org.role);

  const parsed = toggleFlagSchema.safeParse({
    flagId: formData.get("flagId"),
    isEnabled: formData.get("isEnabled"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("feature_flags")
    .update({ is_enabled: parsed.data.isEnabled })
    .eq("id", parsed.data.flagId)
    .eq("org_id", org.orgId);

  revalidatePath(`/org/${slug}/experiments`);
}

export async function updateFlagRollout(slug: string, formData: FormData): Promise<void> {
  const org = await requireOrgMembership(slug);
  assertAdmin(org.role);

  const parsed = updateFlagRolloutSchema.safeParse({
    flagId: formData.get("flagId"),
    rolloutPct: formData.get("rolloutPct"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("feature_flags")
    .update({ rollout_pct: parsed.data.rolloutPct })
    .eq("id", parsed.data.flagId)
    .eq("org_id", org.orgId);

  revalidatePath(`/org/${slug}/experiments`);
}

export async function createExperiment(
  slug: string,
  _prevState: ExperimentFormState,
  formData: FormData
): Promise<ExperimentFormState> {
  const org = await requireOrgMembership(slug);

  const parsed = createExperimentSchema.safeParse({
    name: formData.get("name"),
    variantAName: formData.get("variantAName") || undefined,
    variantBName: formData.get("variantBName") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("experiments").insert({
    org_id: org.orgId,
    name: parsed.data.name,
    variant_a_name: parsed.data.variantAName,
    variant_b_name: parsed.data.variantBName,
    created_by: org.userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${slug}/experiments`);
  return {};
}

export async function updateExperimentCounts(
  slug: string,
  _prevState: ExperimentFormState,
  formData: FormData
): Promise<ExperimentFormState> {
  const org = await requireOrgMembership(slug);

  const parsed = updateExperimentCountsSchema.safeParse({
    experimentId: formData.get("experimentId"),
    visitorsA: formData.get("visitorsA"),
    conversionsA: formData.get("conversionsA"),
    visitorsB: formData.get("visitorsB"),
    conversionsB: formData.get("conversionsB"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = twoProportionZTest({
    visitorsA: parsed.data.visitorsA,
    conversionsA: parsed.data.conversionsA,
    visitorsB: parsed.data.visitorsB,
    conversionsB: parsed.data.conversionsB,
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("experiments")
    .update({
      visitors_a: parsed.data.visitorsA,
      conversions_a: parsed.data.conversionsA,
      visitors_b: parsed.data.visitorsB,
      conversions_b: parsed.data.conversionsB,
      p_value: result.pValue,
      is_significant: result.isSignificant,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.experimentId)
    .eq("org_id", org.orgId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${slug}/experiments`);
  return {};
}
