"use client";

import { useFormState } from "react-dom";
import type { FeatureAdoptionResult } from "@/lib/analytics";
import { addFeature, type FeatureFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FeatureFormState = {};

export function FeatureAdoption({
  slug,
  results,
}: {
  slug: string;
  results: FeatureAdoptionResult[];
}) {
  const boundAction = addFeature.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      {results.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No features registered yet. Add one below to start tracking adoption.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {results.map((r) => (
            <li key={r.key} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 truncate">{r.name}</span>
              <div className="h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${Math.min(r.adoptionPct, 100)}%`, background: "#2a78d6" }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-neutral-500 [font-variant-numeric:tabular-nums]">
                {r.adoptionPct}%
              </span>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Feature name
          <input
            name="name"
            required
            placeholder="CSV export"
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Event key
          <input
            name="key"
            required
            placeholder="used_export"
            pattern="[a-z0-9_]+"
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <SubmitButton pendingText="Adding...">Add feature</SubmitButton>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
