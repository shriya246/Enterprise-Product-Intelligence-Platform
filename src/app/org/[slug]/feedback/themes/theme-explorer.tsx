"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { FeedbackItem } from "../feedback-list";

export interface ThemeCluster {
  theme: string;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
  severity: "high" | "medium" | "low";
  items: FeedbackItem[];
}

const SEVERITY_TONE: Record<ThemeCluster["severity"], StatusTone> = {
  high: "critical",
  medium: "warning",
  low: "good",
};

const SEVERITY_LABEL: Record<ThemeCluster["severity"], string> = {
  high: "High severity",
  medium: "Medium severity",
  low: "Low severity",
};

export function ThemeExplorer({ clusters }: { clusters: ThemeCluster[] }) {
  const [selected, setSelected] = useState<ThemeCluster | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clusters.map((cluster, i) => (
          <motion.button
            key={cluster.theme}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            onClick={() => setSelected(cluster)}
            className="rounded-2xl border border-border bg-surface p-5 text-left shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-text-primary">{cluster.theme}</p>
              {cluster.severity === "high" && (
                <AlertTriangle className="h-4 w-4 shrink-0 text-status-critical" />
              )}
            </div>
            <p className="mt-1 text-xs text-text-muted">{cluster.count} mentions</p>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
              <div className="flex h-full w-full">
                <div
                  className="bg-status-good"
                  style={{ width: `${(cluster.positive / cluster.count) * 100}%` }}
                />
                <div
                  className="bg-text-muted"
                  style={{ width: `${(cluster.neutral / cluster.count) * 100}%` }}
                />
                <div
                  className="bg-status-critical"
                  style={{ width: `${(cluster.negative / cluster.count) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-3">
              <StatusBadge label={SEVERITY_LABEL[cluster.severity]} tone={SEVERITY_TONE[cluster.severity]} />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative flex h-full w-full max-w-md flex-col bg-surface-raised shadow-soft-lg"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <p className="font-semibold text-text-primary">{selected.theme}</p>
                  <p className="text-xs text-text-muted">{selected.count} feedback items</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md p-1.5 text-text-secondary hover:bg-surface"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ul className="flex flex-col gap-3">
                  {selected.items.map((item) => (
                    <li key={item.id} className="rounded-lg border border-border p-3">
                      <p className="text-sm text-text-primary">{item.body}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {item.author && <span className="text-xs text-text-muted">{item.author}</span>}
                        {item.sentiment && (
                          <StatusBadge
                            label={item.sentiment}
                            tone={
                              item.sentiment === "positive"
                                ? "good"
                                : item.sentiment === "negative"
                                  ? "critical"
                                  : "neutral"
                            }
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
