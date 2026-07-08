"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -3, transition: { duration: 0.15 } } : undefined}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-soft transition-shadow",
        hover && "hover:shadow-soft-lg",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
