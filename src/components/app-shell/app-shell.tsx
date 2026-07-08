"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { TopNav, type OrgOption } from "./top-nav";

export function AppShell({
  orgName,
  orgSlug,
  orgs,
  userEmail,
  userRole,
  onSignOut,
  children,
}: {
  orgName: string;
  orgSlug: string;
  orgs: OrgOption[];
  userEmail: string;
  userRole: string;
  onSignOut: () => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar orgSlug={orgSlug} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          orgName={orgName}
          orgSlug={orgSlug}
          orgs={orgs}
          userEmail={userEmail}
          userRole={userRole}
          onMenuClick={() => setMobileOpen(true)}
          onSignOut={onSignOut}
        />

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
