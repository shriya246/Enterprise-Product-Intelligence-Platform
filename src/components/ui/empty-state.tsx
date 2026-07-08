"use client";

import { motion } from "framer-motion";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-subtle text-brand">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      </div>
      {action}
    </motion.div>
  );
}
