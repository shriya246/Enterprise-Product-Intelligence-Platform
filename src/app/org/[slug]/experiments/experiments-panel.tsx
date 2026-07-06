"use client";

import { useFormState } from "react-dom";
import { createExperiment, updateExperimentCounts, type ExperimentFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: ExperimentFormState = {};

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

function ExperimentCard({ slug, experiment }: { slug: string; experiment: Experiment }) {
  const boundAction = updateExperimentCounts.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="font-medium">{experiment.name}</p>

      <form action={formAction} className="mt-3 grid grid-cols-2 gap-4">
        <input type="hidden" name="experimentId" value={experiment.id} />
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold text-neutral-500">
            Variant {experiment.variant_a_name}
          </legend>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Visitors
            <input
              name="visitorsA"
              type="number"
              min={0}
              defaultValue={experiment.visitors_a}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Conversions
            <input
              name="conversionsA"
              type="number"
              min={0}
              defaultValue={experiment.conversions_a}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold text-neutral-500">
            Variant {experiment.variant_b_name}
          </legend>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Visitors
            <input
              name="visitorsB"
              type="number"
              min={0}
              defaultValue={experiment.visitors_b}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Conversions
            <input
              name="conversionsB"
              type="number"
              min={0}
              defaultValue={experiment.conversions_b}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
        </fieldset>

        <div className="col-span-2">
          <SubmitButton pendingText="Calculating...">Update results</SubmitButton>
        </div>
      </form>

      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}

      {experiment.p_value !== null && (
        <div className="mt-3 rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p>
            p-value: <span className="[font-variant-numeric:tabular-nums]">{experiment.p_value}</span>
          </p>
          <p
            className="mt-1 font-medium"
            style={{ color: experiment.is_significant ? "#0ca30c" : "#898781" }}
          >
            {experiment.is_significant
              ? "Statistically significant difference (p < 0.05)"
              : "Not statistically significant yet"}
          </p>
        </div>
      )}
    </div>
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
      <div className="flex flex-col gap-4">
        {experiments.map((experiment) => (
          <ExperimentCard key={experiment.id} slug={slug} experiment={experiment} />
        ))}
        {experiments.length === 0 && (
          <p className="text-sm text-neutral-500">No experiments yet.</p>
        )}
      </div>

      <form action={createFormAction} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Experiment name
          <input
            name="name"
            required
            placeholder="New onboarding flow"
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Variant A name
          <input
            name="variantAName"
            defaultValue="Control"
            className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Variant B name
          <input
            name="variantBName"
            defaultValue="Treatment"
            className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <SubmitButton pendingText="Creating...">Create experiment</SubmitButton>
      </form>
      {createState.error && <p className="text-sm text-red-600">{createState.error}</p>}
    </div>
  );
}
