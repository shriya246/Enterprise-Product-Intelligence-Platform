"use client";

import { useFormState } from "react-dom";
import { addMember, type SettingsFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: SettingsFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-brand";

export function AddMemberForm({ slug }: { slug: string }) {
  const boundAction = addMember.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="teammate@company.com"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Role
        <select name="role" defaultValue="member" className={inputClass}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <SubmitButton pendingText="Adding...">Add member</SubmitButton>
      {state.error && <p className="text-sm text-status-critical">{state.error}</p>}
    </form>
  );
}
