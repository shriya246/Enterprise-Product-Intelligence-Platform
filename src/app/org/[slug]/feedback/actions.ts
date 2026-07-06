"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgMembership } from "@/lib/org";
import { manualFeedbackSchema, feedbackImportSchema } from "@/lib/validation/feedback";

export interface FeedbackFormState {
  error?: string;
  success?: boolean;
  importedCount?: number;
}

export async function addFeedback(
  slug: string,
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const org = await requireOrgMembership(slug);

  const parsed = manualFeedbackSchema.safeParse({
    body: formData.get("body"),
    author: formData.get("author") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feedback_items").insert({
    org_id: org.orgId,
    source: "manual",
    body: parsed.data.body,
    author: parsed.data.author ?? null,
    created_by: org.userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${slug}/feedback`);
  return { success: true };
}

export async function importFeedback(
  slug: string,
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const org = await requireOrgMembership(slug);

  const raw = formData.get("rows");
  let rows: unknown;
  try {
    rows = JSON.parse(typeof raw === "string" ? raw : "[]");
  } catch {
    return { error: "Could not parse CSV rows" };
  }

  const parsed = feedbackImportSchema.safeParse({ rows });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid CSV data" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feedback_items").insert(
    parsed.data.rows.map((row) => ({
      org_id: org.orgId,
      source: "csv_import",
      body: row.body,
      author: row.author ?? null,
      created_by: org.userId,
    }))
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${slug}/feedback`);
  return { success: true, importedCount: parsed.data.rows.length };
}
