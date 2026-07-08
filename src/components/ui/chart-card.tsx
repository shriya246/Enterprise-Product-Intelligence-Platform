"use client";

import { AnimatedCard } from "./animated-card";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <AnimatedCard delay={delay} hover={false} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </AnimatedCard>
  );
}
