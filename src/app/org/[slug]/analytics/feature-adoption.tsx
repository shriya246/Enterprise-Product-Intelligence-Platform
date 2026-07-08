"use client";

import { useFormState } from "react-dom";
import { motion } from "framer-motion";
import type { FeatureAdoptionResult } from "@/lib/analytics";
import { addFeature, type FeatureFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PackagePlus } from "lucide-react";

const initialState: FeatureFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none transition-colors focus:border-brand";

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
        <EmptyState
          icon={PackagePlus}
          title="No features registered yet"
          description="Add one below to start tracking adoption against your event stream."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((r, i) => (
            <motion.li
              key={r.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 text-sm"
            >
              <span className="w-40 shrink-0 truncate text-text-primary">{r.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(r.adoptionPct, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                  className="h-2 rounded-full bg-gradient-brand"
                />
              </div>
              <span className="w-16 shrink-0 text-right text-text-muted [font-variant-numeric:tabular-nums]">
                {r.adoptionPct}%
              </span>
            </motion.li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Feature name
          <input name="name" required placeholder="CSV export" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Event key
          <input
            name="key"
            required
            placeholder="used_export"
            pattern="[a-z0-9_]+"
            className={inputClass}
          />
        </label>
        <SubmitButton pendingText="Adding...">Add feature</SubmitButton>
      </form>
      {state.error && <p className="text-sm text-status-critical">{state.error}</p>}
    </div>
  );
}
