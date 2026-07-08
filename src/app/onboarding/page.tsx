import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CreateOrgForm } from "./create-org-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("org_members")
    .select("role, organizations(name, slug)")
    .eq("user_id", user.id);

  const orgs = (memberships ?? [])
    .map((m) => m.organizations)
    .filter((o): o is { name: string; slug: string } => Boolean(o));

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <Link href="/" className="mx-auto flex items-center gap-2 font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        PulseAI
      </Link>

      {orgs.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-text-secondary">Your organizations</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {orgs.map((org) => (
              <li key={org.slug}>
                <Link
                  href={`/org/${org.slug}/overview`}
                  className="flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brand/30 hover:bg-brand-subtle"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-brand text-xs font-bold text-white">
                    {org.name.slice(0, 1).toUpperCase()}
                  </span>
                  {org.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle text-brand">
            <Building2 className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold text-text-primary">Create a new organization</h2>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          Organizations are how PulseAI keeps every team&apos;s data separate.
        </p>
        <div className="mt-4">
          <CreateOrgForm />
        </div>
      </section>
    </main>
  );
}
