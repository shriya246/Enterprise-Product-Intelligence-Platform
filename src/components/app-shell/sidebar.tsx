"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Filter,
  Grid3x3,
  MessageSquare,
  Sparkles,
  Map,
  FileText,
  FlaskConical,
  Briefcase,
  Settings,
  KeyRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "overview", label: "Overview", icon: LayoutDashboard },
  { href: "analytics", label: "Analytics", icon: BarChart3 },
  { href: "funnels", label: "Funnels", icon: Filter },
  { href: "cohorts", label: "Cohorts", icon: Grid3x3 },
  { href: "feedback", label: "Feedback", icon: MessageSquare },
  { href: "chat", label: "AI Assistant", icon: Sparkles },
  { href: "roadmap", label: "Roadmap", icon: Map },
  { href: "prd-generator", label: "PRDs", icon: FileText },
  { href: "experiments", label: "Experiments", icon: FlaskConical },
  { href: "executive", label: "Executive", icon: Briefcase },
  { href: "settings", label: "Settings", icon: Settings },
  { href: "settings/api-keys", label: "API Keys", icon: KeyRound },
];

export function Sidebar({
  orgSlug,
  mobileOpen,
  onClose,
}: {
  orgSlug: string;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV_ITEMS.map((item) => {
        const href = `/org/${orgSlug}/${item.href}`;
        const isActive =
          item.href === "settings"
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={href}
            onClick={onClose}
            className={cn(
              "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-white"
                : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 rounded-lg bg-gradient-brand"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex h-full w-64 flex-col bg-surface"
          >
            <div className="flex items-center justify-between p-3">
              <span className="text-sm font-semibold">Menu</span>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-text-secondary hover:bg-surface-raised"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {content}
          </motion.div>
        </div>
      )}
    </>
  );
}
