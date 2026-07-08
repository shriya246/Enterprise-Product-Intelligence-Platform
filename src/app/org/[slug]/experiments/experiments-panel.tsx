"use client";

import { useFormState } from "react-dom";
import { FlaskConical } from "lucide-react";
import { createExperiment, updateExperimentCounts, type ExperimentFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { AnimatedCard } from "@/components/ui/animated-card";
import { StatusBadge } from "@/components/ui/status-badge";

const initialState: ExperimentFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-brand";

interface Experiment {
  id: string;
  name: string;
  variant_a_name: string;
  variant_b_name: string;
  visitors_a: number;
  conversions_a: number;
  visitors_b: number;
  conversions_b: number;
  p_value: number | null;
  is_significant: boolean | null;
}

function rate(conversions: number, visitors: number): number {
  return visitors === 0 ? 0 : Math.round((conversions / visitors) * 1000) / 10;
}

function ExperimentCard({ slug, experiment }: { slug: string; experiment: Experiment }) {
  const boundAction = updateExperimentCounts.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);

  const rateA = rate(experiment.conversions_a, experiment.visitors_a);
  const rateB = rate(experiment.conversions_b, experiment.visitors_b);
  const hasResults = experiment.p_value !== null;

  return (
    <AnimatedCard hover={false}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">{experiment.name}</p>
        {hasResults && (
          <StatusBadge
            label={experiment.is_significant ? "Significant" : "Not significant yet"}
            tone={experiment.is_significant ? "good" : "neutral"}
          />
        )}
      </div>

      {hasResults && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-text-muted">{experiment.variant_a_name}</p>
            <p className="text-xl font-semibold text-text-primary">{rateA}%</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-text-muted">{experiment.variant_b_name}</p>
            <p className="text-xl font-semibold text-text-primary">
              {rateB}%
              {rateB !== rateA && (
                <span className={`ml-1.5 text-xs font-medium ${rateB > rateA ? "text-status-good" : "text-status-critical"}`}>
                  {rateB > rateA ? "+" : ""}
                  {Math.round((rateB - rateA) * 10) / 10}pt
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <form action={formAction} className="mt-4 grid grid-cols-2 gap-4">
        <input type="hidden" name="experimentId" value={experiment.id} />
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold text-text-muted">
            Variant {experiment.variant_a_name}
          </legend>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Visitors
            <input name="visitorsA" type="number" min={0} defaultValue={experiment.visitors_a} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Conversions
            <input name="conversionsA" type="number" min={0} defaultValue={experiment.conversions_a} className={inputClass} />
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold text-text-muted">
            Variant {experiment.variant_b_name}
          </legend>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Visitors
            <input name="visitorsB" type="number" min={0} defaultValue={experiment.visitors_b} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Conversions
            <input name="conversionsB" type="number" min={0} defaultValue={experiment.conversions_b} className={inputClass} />
          </label>
        </fieldset>

        <div className="col-span-2">
          <SubmitButton pendingText="Calculating...">Update results</SubmitButton>
        </div>
      </form>

      {state.error && <p className="mt-2 text-sm text-status-critical">{state.error}</p>}

      {hasResults && (
        <p className="mt-3 text-xs text-text-muted">
          p-value:{" "}
          <span className="[font-variant-numeric:tabular-nums]">{experiment.p_value}</span>
          {" · "}
          {experiment.is_significant
            ? "Statistically significant difference (p < 0.05)"
            : "Not statistically significant yet"}
        </p>
      )}
    </AnimatedCard>
  );
}

export function ExperimentsPanel({
  slug,
  experiments,
}: {
  slug: string;
  experiments: Experiment[];
}) {
  const boundCreate = createExperiment.bind(null, slug);
  const [createState, createFormAction] = useFormState(boundCreate, initialState);

  return (
    <div className="flex flex-col gap-6">
      {experiments.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="h-5 w-5" />}
          title="No experiments yet"
          description="Create one below and record variant results to check significance."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {experiments.map((experiment) => (
            <ExperimentCard key={experiment.id} slug={slug} experiment={experiment} />
          ))}
        </div>
      )}

      <form action={createFormAction} className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Experiment name
          <input name="name" required placeholder="New onboarding flow" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Variant A name
          <input name="variantAName" defaultValue="Control" className={`w-28 ${inputClass}`} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Variant B name
          <input name="variantBName" defaultValue="Treatment" className={`w-28 ${inputClass}`} />
        </label>
        <SubmitButton pendingText="Creating...">Create experiment</SubmitButton>
      </form>
      {createState.error && <p className="text-sm text-status-critical">{createState.error}</p>}
    </div>
  );
}
