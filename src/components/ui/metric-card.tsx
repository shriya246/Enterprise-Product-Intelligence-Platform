"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { AnimatedCard } from "./animated-card";
import { cn } from "@/lib/utils";

function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export function MetricCard({
  label,
  value,
  deltaPct,
  sparkline,
  delay = 0,
}: {
  label: string;
  value: number;
  deltaPct?: number | null;
  sparkline?: number[];
  delay?: number;
}) {
  const animatedValue = useCountUp(value);
  const trend = deltaPct == null ? "flat" : deltaPct > 0 ? "up" : deltaPct < 0 ? "down" : "flat";

  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "text-status-good" : trend === "down" ? "text-status-critical" : "text-text-muted";

  const sparkData = (sparkline ?? []).map((v, i) => ({ i, v }));

  return (
    <AnimatedCard delay={delay} className="flex flex-col gap-1">
      <p className="text-sm text-text-secondary">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-3xl font-semibold tracking-tight text-text-primary [font-variant-numeric:tabular-nums]">
          {animatedValue.toLocaleString()}
        </p>
        {deltaPct != null && (
          <span className={cn("flex items-center gap-0.5 text-xs font-medium", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {Math.abs(deltaPct)}%
          </span>
        )}
      </div>
      {sparkData.length > 1 && (
        <div className="h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="var(--brand)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnimatedCard>
  );
}
