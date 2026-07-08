"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { createRoadmapItem, type RoadmapFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: RoadmapFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand";

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
      <input name="title" required placeholder="Roadmap item title" className={inputClass} />
      <textarea
        name="description"
        rows={2}
        placeholder="Description (optional)"
        className={inputClass}
      />

      <div className="flex gap-3">
        <select name="status" defaultValue="backlog" className={`flex-1 ${inputClass}`}>
          <option value="backlog">Backlog</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="shipped">Shipped</option>
        </select>
        <input name="targetQuarter" placeholder="2026 Q3" className={`w-28 ${inputClass}`} />
      </div>

      {features.length > 0 && (
        <select name="linkedFeatureId" defaultValue="" className={inputClass}>
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
          <p className="mb-1.5 text-xs text-text-muted">Depends on</p>
          <div className="flex flex-wrap gap-2">
            {existingItems.map((item) => {
              const active = dependsOn.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleDependsOn(item.id)}
                  className={
                    active
                      ? "rounded-full bg-gradient-brand px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary hover:border-brand/40"
                  }
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <input type="hidden" name="dependsOnItemIds" value={JSON.stringify(dependsOn)} />

      {state.error && <p className="text-sm text-status-critical">{state.error}</p>}
      <SubmitButton pendingText="Adding...">Add roadmap item</SubmitButton>
    </form>
  );
}
