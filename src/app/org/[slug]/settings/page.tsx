import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { MemberList } from "./member-list";
import { AddMemberForm } from "./add-member-form";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimatedCard } from "@/components/ui/animated-card";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);
  const supabase = await createClient();

  const { data: memberRows } = await supabase
    .from("org_members")
    .select("user_id, role, profiles!org_members_user_id_fkey(email, full_name)")
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
      <PageHeader title="Settings" description={`Org: ${org.orgName}`} />

      <section>
        <SectionHeader title="Members" />
        <MemberList slug={slug} members={members} currentUserId={org.userId} />
      </section>

      {isAdmin && (
        <AnimatedCard hover={false}>
          <h2 className="mb-1 text-sm font-semibold text-text-primary">Add a member</h2>
          <p className="mb-3 text-xs text-text-muted">
            They need an existing PulseAI account (sign up first) — invitations by email
            aren&apos;t wired up yet.
          </p>
          <AddMemberForm slug={slug} />
        </AnimatedCard>
      )}

      {isAdmin && (
        <section>
          <SectionHeader title="Audit log" />
          {(auditRows ?? []).length === 0 ? (
            <p className="text-sm text-text-muted">No sensitive actions recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {(auditRows ?? []).map((row, i) => (
                <li key={i} className="text-text-muted">
                  <span className="font-medium text-text-primary">{row.action}</span> on{" "}
                  {row.target_type} · {new Date(row.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
