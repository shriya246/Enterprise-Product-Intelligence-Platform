"use client";

import { useTransition } from "react";
import { changeRole, removeMember } from "./actions";
import type { OrgRole } from "@/lib/supabase/database.types";

export interface Member {
  userId: string;
  email: string;
  fullName: string | null;
  role: OrgRole;
}

const ROLES: OrgRole[] = ["owner", "admin", "member"];

export function MemberList({
  slug,
  members,
  currentUserId,
}: {
  slug: string;
  members: Member[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <ul className="flex flex-col gap-2">
      {members.map((member) => {
        const isSelf = member.userId === currentUserId;
        return (
          <li
            key={member.userId}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
          >
            <div>
              <p className="font-medium">{member.fullName ?? member.email}</p>
              <p className="text-xs text-neutral-500">{member.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                defaultValue={member.role}
                disabled={isSelf || pending}
                onChange={(e) => {
                  const formData = new FormData();
                  formData.set("userId", member.userId);
                  formData.set("role", e.target.value);
                  startTransition(() => {
                    changeRole(slug, formData);
                  });
                }}
                className="rounded-md border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isSelf || pending}
                onClick={() => {
                  const formData = new FormData();
                  formData.set("userId", member.userId);
                  startTransition(() => {
                    removeMember(slug, formData);
                  });
                }}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-red-600 disabled:opacity-40 dark:border-neutral-700"
              >
                Remove
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
