"use client";

import { useTransition } from "react";
import { changeRole, removeMember } from "./actions";
import type { OrgRole } from "@/lib/supabase/database.types";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

export interface Member {
  userId: string;
  email: string;
  fullName: string | null;
  role: OrgRole;
}

const ROLES: OrgRole[] = ["owner", "admin", "member"];
const ROLE_TONE: Record<OrgRole, StatusTone> = {
  owner: "brand",
  admin: "good",
  member: "neutral",
};

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
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-subtle text-xs font-semibold text-brand">
                {(member.fullName ?? member.email).slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-text-primary">{member.fullName ?? member.email}</p>
                <p className="text-xs text-text-muted">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge label={member.role} tone={ROLE_TONE[member.role]} className="capitalize" />
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
                className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-secondary outline-none focus:border-brand"
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
                className="rounded-md border border-border px-2 py-1 text-xs text-status-critical disabled:opacity-40"
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
