"use client";

import { useTransition } from "react";
import { updateRoadmapStatus } from "./actions";
import type { RoadmapStatus } from "@/lib/supabase/database.types";

const STATUSES: RoadmapStatus[] = ["backlog", "planned", "in_progress", "shipped"];

export function StatusSelect({
  slug,
  itemId,
  status,
}: {
  slug: string;
  itemId: string;
  status: RoadmapStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("itemId", itemId);
        formData.set("status", e.target.value);
        startTransition(() => {
          updateRoadmapStatus(slug, formData);
        });
      }}
      className="rounded-md border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
