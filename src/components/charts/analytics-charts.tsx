"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  funnelConversion,
  type DailyActiveUsersPoint,
  type RetentionPoint,
  type UsageEvent,
} from "@/lib/analytics";

const tooltipStyle = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

export function DailyActiveUsersChart({ data }: { data: DailyActiveUsersPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="activeUsers"
            name="Active users"
            stroke="var(--brand)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RetentionChart({ data }: { data: RetentionPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="weeksSinceFirstSeen"
            tickFormatter={(week) => `Wk ${week}`}
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Retained"]}
            labelFormatter={(week) => `Week ${week}`}
            contentStyle={tooltipStyle}
          />
          <Line
            type="monotone"
            dataKey="retentionPct"
            name="Retention"
            stroke="var(--brand)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--brand)" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelBuilder({
  events,
  eventNames,
}: {
  events: UsageEvent[];
  eventNames: string[];
}) {
  const [selected, setSelected] = useState<string[]>(eventNames.slice(0, 3));

  const funnel = useMemo(
    () => (selected.length >= 2 ? funnelConversion(events, selected) : []),
    [events, selected]
  );

  function toggle(name: string) {
    setSelected((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name]
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {eventNames.map((name) => {
          const isSelected = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={
                isSelected
                  ? "rounded-full bg-gradient-brand px-3 py-1 text-xs font-medium text-white"
                  : "rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-brand/40"
              }
            >
              {name}
            </button>
          );
        })}
      </div>

      {funnel.length === 0 ? (
        <p className="text-sm text-text-muted">
          Select at least two events, in order, to build a funnel.
        </p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnel}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="step"
                width={120}
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, _name, item) => {
                  const conversion = (
                    item?.payload as { conversionFromPreviousPct: number | null } | undefined
                  )?.conversionFromPreviousPct;
                  return [
                    `${value} users${conversion !== null && conversion !== undefined ? ` (${conversion}% of previous step)` : ""}`,
                    "Users",
                  ];
                }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="users" fill="var(--brand)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
