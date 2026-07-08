import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton animate-shimmer rounded-lg", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <LoadingSkeleton className="h-3 w-24" />
      <LoadingSkeleton className="mt-3 h-7 w-16" />
      <LoadingSkeleton className="mt-4 h-8 w-full" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      {Array.from({ length: columns }, (_, i) => (
        <LoadingSkeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}
