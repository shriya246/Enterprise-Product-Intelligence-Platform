"use client";

import { useFormState } from "react-dom";
import { createOrg, type OnboardingFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: OnboardingFormState = {};

export function CreateOrgForm() {
  const [state, formAction] = useFormState(createOrg, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Organization name
        <input
          name="name"
          type="text"
          required
          placeholder="Acme Inc."
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        URL slug
        <input
          name="slug"
          type="text"
          required
          placeholder="acme"
          pattern="[a-z0-9-]+"
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Creating...">Create organization</SubmitButton>
    </form>
  );
}
