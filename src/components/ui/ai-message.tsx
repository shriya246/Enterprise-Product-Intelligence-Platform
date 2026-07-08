"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Evidence {
  label: string;
  value: string;
}

export function AIMessage({
  role,
  content,
  streaming = false,
  evidence,
  confidence,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  evidence?: Evidence[];
  confidence?: number;
}) {
  const [visibleChars, setVisibleChars] = useState(streaming ? 0 : content.length);

  useEffect(() => {
    if (!streaming) {
      setVisibleChars(content.length);
      return;
    }
    setVisibleChars(0);
    const step = Math.max(1, Math.round(content.length / 60));
    const interval = setInterval(() => {
      setVisibleChars((prev) => {
        const next = prev + step;
        if (next >= content.length) {
          clearInterval(interval);
          return content.length;
        }
        return next;
      });
    }, 12);
    return () => clearInterval(interval);
  }, [content, streaming]);

  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-surface-raised text-text-secondary" : "bg-gradient-brand text-white"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      </span>

      <div className={cn("flex max-w-2xl flex-col gap-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-brand text-white"
              : "border border-border bg-surface text-text-primary"
          )}
        >
          {content.slice(0, visibleChars)}
          {streaming && visibleChars < content.length && (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" />
          )}
        </div>

        {!isUser && confidence != null && visibleChars >= content.length && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand">
            {confidence}% confidence
          </span>
        )}

        {!isUser && evidence && evidence.length > 0 && visibleChars >= content.length && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {evidence.map((e) => (
              <div
                key={e.label}
                className="rounded-lg border border-border bg-surface-raised px-3 py-2"
              >
                <p className="text-xs text-text-muted">{e.label}</p>
                <p className="text-sm font-medium text-text-primary">{e.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
