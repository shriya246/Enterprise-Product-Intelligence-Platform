import { describe, expect, it } from "vitest";
import {
  activeUsers,
  dailyActiveUsersSeries,
  funnelConversion,
  weeklyRetentionCurve,
  type UsageEvent,
} from "./analytics";

const asOf = new Date("2026-01-15T00:00:00.000Z");

const events: UsageEvent[] = [
  { distinctId: "u1", eventName: "app_opened", occurredAt: "2026-01-15T09:00:00.000Z" },
  { distinctId: "u2", eventName: "app_opened", occurredAt: "2026-01-14T09:00:00.000Z" },
  { distinctId: "u3", eventName: "app_opened", occurredAt: "2026-01-01T09:00:00.000Z" },
];

describe("activeUsers", () => {
  it("counts distinct users active in the trailing window", () => {
    expect(activeUsers(events, 1, asOf)).toBe(1);
    expect(activeUsers(events, 2, asOf)).toBe(2);
    expect(activeUsers(events, 30, asOf)).toBe(3);
  });
});

describe("dailyActiveUsersSeries", () => {
  it("returns one point per day with correct counts", () => {
    const series = dailyActiveUsersSeries(events, 3, asOf);
    expect(series).toHaveLength(3);
    expect(series[series.length - 1]).toEqual({ date: "2026-01-15", activeUsers: 1 });
    expect(series[series.length - 2]).toEqual({ date: "2026-01-14", activeUsers: 1 });
  });
});

describe("weeklyRetentionCurve", () => {
  it("week 0 retention is always 100% of the cohort", () => {
    const curve = weeklyRetentionCurve(events, 2);
    expect(curve[0].retentionPct).toBe(100);
    expect(curve[0].cohortSize).toBe(3);
  });

  it("drops off for users who never return", () => {
    const oneShotEvents: UsageEvent[] = [
      { distinctId: "a", eventName: "x", occurredAt: "2026-01-01T00:00:00.000Z" },
    ];
    const curve = weeklyRetentionCurve(oneShotEvents, 2);
    expect(curve[1].retentionPct).toBe(0);
  });
});

describe("funnelConversion", () => {
  it("only counts users who completed steps in order", () => {
    const funnelEvents: UsageEvent[] = [
      { distinctId: "u1", eventName: "signed_up", occurredAt: "2026-01-01T00:00:00.000Z" },
      { distinctId: "u1", eventName: "activated", occurredAt: "2026-01-02T00:00:00.000Z" },
      { distinctId: "u2", eventName: "signed_up", occurredAt: "2026-01-01T00:00:00.000Z" },
    ];

    const result = funnelConversion(funnelEvents, ["signed_up", "activated"]);
    expect(result[0].users).toBe(2);
    expect(result[1].users).toBe(1);
    expect(result[1].conversionFromPreviousPct).toBe(50);
  });
});
