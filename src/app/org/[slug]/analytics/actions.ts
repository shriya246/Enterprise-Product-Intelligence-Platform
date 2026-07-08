"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin, requireOrgMembership } from "@/lib/org";

const addFeatureSchema = z.object({
  name: z.string().trim().min(1).max(120),
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores only"),
});

export interface FeatureFormState {
  error?: string;
}

export async function addFeature(
  slug: string,
  _prevState: FeatureFormState,
  formData: FormData
): Promise<FeatureFormState> {
  const org = await requireOrgMembership(slug);

  try {
    assertAdmin(org.role);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Not authorized" };
  }

  const parsed = addFeatureSchema.safeParse({
    name: formData.get("name"),
    key: formData.get("key"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("features").insert({
    org_id: org.orgId,
    name: parsed.data.name,
    key: parsed.data.key,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${slug}/analytics`);
  return {};
}
