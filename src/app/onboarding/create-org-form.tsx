"use client";

import { useFormState } from "react-dom";
import { createOrg, type OnboardingFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: OnboardingFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand";

export function CreateOrgForm() {
  const [state, formAction] = useFormState(createOrg, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
        Organization name
        <input name="name" type="text" required placeholder="Acme Inc." className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
        URL slug
        <input
          name="slug"
          type="text"
          required
          placeholder="acme"
          pattern="[a-z0-9-]+"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-status-critical">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Creating...">Create organization</SubmitButton>
    </form>
  );
}
