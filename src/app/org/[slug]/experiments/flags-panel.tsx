"use client";

import { useFormState } from "react-dom";
import { useTransition } from "react";
import { createFlag, toggleFlag, type ExperimentFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: ExperimentFormState = {};

interface Flag {
  id: string;
  key: string;
  name: string;
  is_enabled: boolean;
  rollout_pct: number;
}

export function FlagsPanel({ slug, flags }: { slug: string; flags: Flag[] }) {
  const boundAction = createFlag.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);
  const [pending, startTransition] = useTransition();

  function handleToggle(flag: Flag) {
    const formData = new FormData();
    formData.set("flagId", flag.id);
    formData.set("isEnabled", (!flag.is_enabled).toString());
    startTransition(() => {
      toggleFlag(slug, formData);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {flags.map((flag) => (
          <li
            key={flag.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
          >
            <div>
              <p className="font-medium">{flag.name}</p>
              <p className="text-xs text-neutral-500">
                {flag.key} · {flag.rollout_pct}% rollout
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleToggle(flag)}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: flag.is_enabled ? "#0ca30c" : "#e1e0d9",
                color: flag.is_enabled ? "#ffffff" : "#52514e",
              }}
            >
              {flag.is_enabled ? "Enabled" : "Disabled"}
            </button>
          </li>
        ))}
        {flags.length === 0 && (
          <p className="text-sm text-neutral-500">No feature flags yet.</p>
        )}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Name
          <input
            name="name"
            required
            placeholder="New checkout flow"
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Key
          <input
            name="key"
            required
            placeholder="new_checkout"
            pattern="[a-z0-9_]+"
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Rollout %
          <input
            name="rolloutPct"
            type="number"
            min={0}
            max={100}
            defaultValue={100}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <SubmitButton pendingText="Adding...">Add flag</SubmitButton>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
