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

const vizStyle = (
  <style>{`
    .viz-root {
      --surface-1: #fcfcfb;
      --text-primary: #0b0b0b;
      --text-secondary: #52514e;
      --text-muted: #898781;
      --gridline: #e1e0d9;
      --series-1: #2a78d6;
    }
    @media (prefers-color-scheme: dark) {
      .viz-root {
        --surface-1: #1a1a19;
        --text-primary: #ffffff;
        --text-secondary: #c3c2b7;
        --text-muted: #898781;
        --gridline: #2c2c2a;
        --series-1: #3987e5;
      }
    }
  `}</style>
);

export function StatTiles({
  dau,
  wau,
  mau,
}: {
  dau: number;
  wau: number;
  mau: number;
}) {
  const tiles = [
    { label: "Daily active users", value: dau },
    { label: "Weekly active users", value: wau },
    { label: "Monthly active users", value: mau },
  ];

  return (
    <div className="viz-root grid grid-cols-1 gap-4 sm:grid-cols-3">
      {vizStyle}
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--gridline)", background: "var(--surface-1)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {tile.label}
          </p>
          <p
            className="mt-1 text-3xl font-semibold [font-variant-numeric:tabular-nums]"
            style={{ color: "var(--text-primary)" }}
          >
            {tile.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DailyActiveUsersChart({ data }: { data: DailyActiveUsersPoint[] }) {
  return (
    <div className="viz-root h-64 w-full">
      {vizStyle}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--gridline)" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-1)",
              border: "1px solid var(--gridline)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            name="Active users"
            stroke="var(--series-1)"
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
    <div className="viz-root h-64 w-full">
      {vizStyle}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis
            dataKey="weeksSinceFirstSeen"
            tickFormatter={(week) => `Wk ${week}`}
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--gridline)" }}
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
            contentStyle={{
              background: "var(--surface-1)",
              border: "1px solid var(--gridline)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="retentionPct"
            name="Retention"
            stroke="var(--series-1)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--series-1)" }}
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
    <div className="viz-root">
      {vizStyle}
      <div className="mb-3 flex flex-wrap gap-2">
        {eventNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => toggle(name)}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: "var(--gridline)",
              background: selected.includes(name) ? "var(--series-1)" : "transparent",
              color: selected.includes(name) ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {funnel.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
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
              <CartesianGrid horizontal={false} stroke="var(--gridline)" />
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
                contentStyle={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--gridline)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="users" fill="var(--series-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
