import Link from "next/link";
import { requireOrgMembership } from "@/lib/org";
import { logout } from "@/app/onboarding/actions";

const NAV_ITEMS = [
  { href: "dashboard", label: "Analytics" },
  { href: "feedback", label: "Feedback" },
  { href: "chat", label: "AI Assistant" },
  { href: "roadmap", label: "Roadmap" },
  { href: "prd-generator", label: "PRD Generator" },
  { href: "experiments", label: "Experiments" },
  { href: "executive", label: "Executive" },
  { href: "settings", label: "Settings" },
];

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col justify-between border-r border-neutral-200 p-4 dark:border-neutral-800">
        <div>
          <p className="mb-4 truncate text-sm font-semibold">{org.orgName}</p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={`/org/${org.orgSlug}/${item.href}`}
                className="rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
