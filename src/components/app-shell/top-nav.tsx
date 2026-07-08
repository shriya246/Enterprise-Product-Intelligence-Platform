"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, LogOut, Menu, Plus } from "lucide-react";
import { CommandSearch, type CommandSearchItem } from "@/components/ui/command-search";

export interface OrgOption {
  name: string;
  slug: string;
}

const SEARCH_ITEMS: Omit<CommandSearchItem, "href">[] = [
  { label: "Overview", description: "DAU/WAU/MAU snapshot" },
  { label: "Analytics", description: "KPIs, trends, feature adoption" },
  { label: "Funnels", description: "Build a conversion funnel" },
  { label: "Cohorts", description: "Weekly cohort retention" },
  { label: "Feedback", description: "Themes, sentiment, imports" },
  { label: "AI Assistant", description: "Ask questions about your data" },
  { label: "Roadmap", description: "Prioritized by usage + feedback" },
  { label: "PRDs", description: "Generate a PRD draft" },
  { label: "Experiments", description: "Feature flags and A/B tests" },
  { label: "Executive", description: "Single-screen KPI rollup" },
  { label: "Settings", description: "Members and org settings" },
  { label: "API Keys", description: "SDK write key" },
];

export function TopNav({
  orgName,
  orgSlug,
  orgs,
  userEmail,
  userRole,
  onMenuClick,
  onSignOut,
}: {
  orgName: string;
  orgSlug: string;
  orgs: OrgOption[];
  userEmail: string;
  userRole: string;
  onMenuClick: () => void;
  onSignOut: () => void;
}) {
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchItems: CommandSearchItem[] = SEARCH_ITEMS.map((item) => ({
    ...item,
    href: `/org/${orgSlug}/${item.label === "API Keys" ? "settings/api-keys" : item.label === "PRDs" ? "prd-generator" : item.label.toLowerCase().replace(/\s+/g, "-")}`,
  }));

  const otherOrgs = orgs.filter((o) => o.slug !== orgSlug);
  const initials = userEmail.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md">
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-text-secondary hover:bg-surface-raised md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Org switcher */}
      <div className="relative">
        <button
          onClick={() => setOrgMenuOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold hover:bg-surface-raised"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-brand text-xs font-bold text-white">
            {orgName.slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[10rem] truncate">{orgName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
        </button>

        <AnimatePresence>
          {orgMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOrgMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-surface-raised p-1.5 shadow-soft-lg"
              >
                {otherOrgs.length > 0 && (
                  <div className="mb-1 border-b border-border pb-1">
                    {otherOrgs.map((o) => (
                      <Link
                        key={o.slug}
                        href={`/org/${o.slug}/overview`}
                        className="block rounded-lg px-2.5 py-1.5 text-sm hover:bg-surface"
                      >
                        {o.name}
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href="/onboarding"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-brand hover:bg-surface"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create or join org
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-2 flex-1">
        <CommandSearch items={searchItems} />
      </div>

      <button
        className="relative rounded-md p-2 text-text-secondary hover:bg-surface-raised"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-status-critical" />
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-subtle text-xs font-semibold text-brand"
        >
          {initials}
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-surface-raised p-1.5 shadow-soft-lg"
              >
                <div className="px-2.5 py-1.5">
                  <p className="truncate text-sm font-medium">{userEmail}</p>
                  <p className="text-xs capitalize text-text-muted">{userRole}</p>
                </div>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={onSignOut}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-text-secondary hover:bg-surface"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
