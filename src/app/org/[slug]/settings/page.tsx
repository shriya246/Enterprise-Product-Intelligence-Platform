import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { MemberList } from "./member-list";
import { AddMemberForm } from "./add-member-form";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();

  const { data: memberRows } = await supabase
    .from("org_members")
    .select("user_id, role, profiles(email, full_name)")
    .eq("org_id", org.orgId);

  const members = (memberRows ?? []).map((row) => ({
    userId: row.user_id,
    role: row.role,
    email: row.profiles?.email ?? "unknown",
    fullName: row.profiles?.full_name ?? null,
  }));

  const isAdmin = org.role === "owner" || org.role === "admin";

  const { data: auditRows } = isAdmin
    ? await supabase
        .from("audit_log")
        .select("action, target_type, target_id, metadata, created_at")
        .eq("org_id", org.orgId)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-neutral-500">Org: {org.orgName}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Members</h2>
        <MemberList slug={slug} members={members} currentUserId={org.userId} />
      </section>

      {isAdmin && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-neutral-500">Add a member</h2>
          <p className="mb-2 text-xs text-neutral-500">
            They need an existing PulseAI account (sign up first) — invitations by email aren&apos;t
            wired up yet.
          </p>
          <AddMemberForm slug={slug} />
        </section>
      )}

      {isAdmin && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-neutral-500">Audit log</h2>
          {(auditRows ?? []).length === 0 ? (
            <p className="text-sm text-neutral-500">No sensitive actions recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {(auditRows ?? []).map((row, i) => (
                <li key={i} className="text-neutral-500">
                  <span className="text-neutral-900 dark:text-neutral-100">{row.action}</span>{" "}
                  on {row.target_type} · {new Date(row.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
