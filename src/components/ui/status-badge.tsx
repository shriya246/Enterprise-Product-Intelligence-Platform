import { cn } from "@/lib/utils";

export type StatusTone = "good" | "warning" | "serious" | "critical" | "neutral" | "brand";

const TONE_CLASSES: Record<StatusTone, string> = {
  good: "bg-status-good/10 text-status-good",
  warning: "bg-status-warning/15 text-[#8a5a00]",
  serious: "bg-status-serious/15 text-status-serious",
  critical: "bg-status-critical/10 text-status-critical",
  neutral: "bg-text-muted/10 text-text-secondary",
  brand: "bg-brand-subtle text-brand",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "currentColor" }}
        aria-hidden
      />
      {label}
    </span>
  );
}
