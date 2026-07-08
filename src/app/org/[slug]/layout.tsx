import { requireOrgMembership } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/onboarding/actions";
import { AppShell } from "@/components/app-shell/app-shell";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("org_members")
    .select("organizations(name, slug)")
    .eq("user_id", org.userId);

  const orgs = (memberships ?? [])
    .map((m) => m.organizations)
    .filter((o): o is { name: string; slug: string } => Boolean(o));

  return (
    <AppShell
      orgName={org.orgName}
      orgSlug={org.orgSlug}
      orgs={orgs}
      userEmail={user?.email ?? "unknown"}
      userRole={org.role}
      onSignOut={logout}
    >
      {children}
    </AppShell>
  );
}
