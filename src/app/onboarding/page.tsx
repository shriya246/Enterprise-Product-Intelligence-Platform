import Link from "next/link";
import { redirect } from "next/navigation";
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-4">
      {orgs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Your organizations</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {orgs.map((org) => (
              <li key={org.slug}>
                <Link
                  href={`/org/${org.slug}/dashboard`}
                  className="block rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
                >
                  {org.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">Create a new organization</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Organizations are how PulseAI keeps every team&apos;s data separate.
        </p>
        <div className="mt-3">
          <CreateOrgForm />
        </div>
      </section>
    </main>
  );
}
