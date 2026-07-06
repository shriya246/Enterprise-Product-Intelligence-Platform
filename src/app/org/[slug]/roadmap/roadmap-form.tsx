"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { createRoadmapItem, type RoadmapFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: RoadmapFormState = {};

export function RoadmapForm({
  slug,
  features,
  existingItems,
}: {
  slug: string;
  features: { id: string; name: string }[];
  existingItems: { id: string; title: string }[];
}) {
  const boundAction = createRoadmapItem.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);
  const [dependsOn, setDependsOn] = useState<string[]>([]);

  function toggleDependsOn(id: string) {
    setDependsOn((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="title"
        required
        placeholder="Roadmap item title"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <textarea
        name="description"
        rows={2}
        placeholder="Description (optional)"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />

      <div className="flex gap-3">
        <select
          name="status"
          defaultValue="backlog"
          className="flex-1 rounded-md border border-neutral-300 px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="backlog">Backlog</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="shipped">Shipped</option>
        </select>
        <input
          name="targetQuarter"
          placeholder="2026 Q3"
          className="w-28 rounded-md border border-neutral-300 px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {features.length > 0 && (
        <select
          name="linkedFeatureId"
          defaultValue=""
          className="rounded-md border border-neutral-300 px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">No linked feature</option>
          {features.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      )}

      {existingItems.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-neutral-500">Depends on</p>
          <div className="flex flex-wrap gap-2">
            {existingItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleDependsOn(item.id)}
                className="rounded-full border px-2 py-1 text-xs"
                style={{
                  borderColor: dependsOn.includes(item.id) ? "#2a78d6" : "#d4d4d4",
                  background: dependsOn.includes(item.id) ? "#2a78d6" : "transparent",
                  color: dependsOn.includes(item.id) ? "#ffffff" : undefined,
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <input type="hidden" name="dependsOnItemIds" value={JSON.stringify(dependsOn)} />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton pendingText="Adding...">Add roadmap item</SubmitButton>
    </form>
  );
}
