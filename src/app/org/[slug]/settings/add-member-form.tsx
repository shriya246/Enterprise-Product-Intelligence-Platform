"use client";

import { useFormState } from "react-dom";
import { addMember, type SettingsFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: SettingsFormState = {};

export function AddMemberForm({ slug }: { slug: string }) {
  const boundAction = addMember.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-neutral-500">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="teammate@company.com"
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-500">
        Role
        <select
          name="role"
          defaultValue="member"
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <SubmitButton pendingText="Adding...">Add member</SubmitButton>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
