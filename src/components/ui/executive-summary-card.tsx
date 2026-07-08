"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ExecutiveSummaryCard({
  headline,
  points,
}: {
  headline: string;
  points: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-brand p-6 text-white shadow-glow-brand"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/70">
        <Sparkles className="h-3.5 w-3.5" />
        AI executive summary
      </div>
      <p className="mt-3 text-lg font-semibold leading-snug">{headline}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/90">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/70" />
            {point}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
