"use client";

import { motion } from "framer-motion";

export function PromptChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-text-secondary transition-colors hover:border-brand/40 hover:text-brand"
    >
      {label}
    </motion.button>
  );
}
