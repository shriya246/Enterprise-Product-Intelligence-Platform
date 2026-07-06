"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgMembership } from "@/lib/org";
import { createRoadmapItemSchema, updateRoadmapStatusSchema } from "@/lib/validation/roadmap";
import type { RoadmapStatus } from "@/lib/supabase/database.types";

export interface RoadmapFormState {
  error?: string;
}

export async function createRoadmapItem(
  slug: string,
  _prevState: RoadmapFormState,
  formData: FormData
): Promise<RoadmapFormState> {
  const org = await requireOrgMembership(slug);

  const dependsOnRaw = formData.get("dependsOnItemIds");
  const dependsOnItemIds =
    typeof dependsOnRaw === "string" && dependsOnRaw.length > 0
      ? (JSON.parse(dependsOnRaw) as string[])
      : [];

  const parsed = createRoadmapItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    targetQuarter: formData.get("targetQuarter") || undefined,
    linkedFeatureId: formData.get("linkedFeatureId") || undefined,
    dependsOnItemIds,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: item, error } = await supabase
    .from("roadmap_items")
    .insert({
      org_id: org.orgId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      target_quarter: parsed.data.targetQuarter ?? null,
      linked_feature_id: parsed.data.linkedFeatureId ?? null,
      created_by: org.userId,
    })
    .select("id")
    .single();

  if (error || !item) {
    return { error: error?.message ?? "Could not create roadmap item" };
  }

  if (parsed.data.dependsOnItemIds.length > 0) {
    await supabase.from("roadmap_item_dependencies").insert(
      parsed.data.dependsOnItemIds.map((dependsOnId) => ({
        roadmap_item_id: item.id,
        depends_on_item_id: dependsOnId,
        org_id: org.orgId,
      }))
    );
  }

  revalidatePath(`/org/${slug}/roadmap`);
  return {};
}

export async function updateRoadmapStatus(slug: string, formData: FormData): Promise<void> {
  const org = await requireOrgMembership(slug);

  const parsed = updateRoadmapStatusSchema.safeParse({
    itemId: formData.get("itemId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("roadmap_items")
    .update({ status: parsed.data.status as RoadmapStatus, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.itemId)
    .eq("org_id", org.orgId);

  revalidatePath(`/org/${slug}/roadmap`);
}
