"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

export interface FeedbackItem {
  id: string;
  body: string;
  author: string | null;
  source: string;
  sentiment: string | null;
  theme: string | null;
}

const SENTIMENT_TONE: Record<string, StatusTone> = {
  positive: "good",
  neutral: "neutral",
  negative: "critical",
};

const SOURCE_FILTERS = ["all", "manual", "csv_import"] as const;
const SOURCE_LABEL: Record<string, string> = {
  all: "All sources",
  manual: "Manual",
  csv_import: "CSV import",
};

export function FeedbackList({ items }: { items: FeedbackItem[] }) {
  const [sourceFilter, setSourceFilter] = useState<(typeof SOURCE_FILTERS)[number]>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const sentiments = useMemo(
    () => ["all", ...new Set(items.map((i) => i.sentiment).filter((s): s is string => Boolean(s)))],
    [items]
  );

  const filtered = items.filter((item) => {
    if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
    if (sentimentFilter !== "all" && item.sentiment !== sentimentFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {SOURCE_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSourceFilter(s)}
            className={
              sourceFilter === s
                ? "rounded-full bg-gradient-brand px-3 py-1 text-xs font-medium text-white"
                : "rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-brand/40"
            }
          >
            {SOURCE_LABEL[s]}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        {sentiments.map((s) => (
          <button
            key={s}
            onClick={() => setSentimentFilter(s)}
            className={
              sentimentFilter === s
                ? "rounded-full bg-gradient-brand px-3 py-1 text-xs font-medium capitalize text-white"
                : "rounded-full border border-border px-3 py-1 text-xs capitalize text-text-secondary hover:border-brand/40"
            }
          >
            {s === "all" ? "All sentiment" : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-5 w-5" />}
          title="No feedback matches these filters"
          description="Try a different source or sentiment, or add new feedback above."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-sm text-text-primary">{item.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.author && <span className="text-xs text-text-muted">{item.author}</span>}
                <StatusBadge label={SOURCE_LABEL[item.source] ?? item.source} tone="neutral" />
                {item.sentiment && (
                  <StatusBadge
                    label={item.sentiment}
                    tone={SENTIMENT_TONE[item.sentiment] ?? "neutral"}
                  />
                )}
                {item.theme && <StatusBadge label={item.theme} tone="brand" />}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
