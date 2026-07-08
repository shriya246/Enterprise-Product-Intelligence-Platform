import { cn } from "@/lib/utils";

export type Priority = "high" | "medium" | "low";

const PRIORITY_CLASSES: Record<Priority, string> = {
  high: "border-status-critical/30 bg-status-critical/10 text-status-critical",
  medium: "border-status-warning/30 bg-status-warning/15 text-[#8a5a00]",
  low: "border-border bg-surface-raised text-text-secondary",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        PRIORITY_CLASSES[priority],
        className
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
