// Pure, DB-agnostic analytics math. Kept separate from data fetching so it
// can be unit tested without a live Supabase connection.

export interface UsageEvent {
  distinctId: string;
  eventName: string;
  occurredAt: string; // ISO timestamp
}

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

/** Count of distinct users active within the trailing `windowDays` ending at `asOf` (inclusive). */
export function activeUsers(events: UsageEvent[], windowDays: number, asOf: Date): number {
  const start = new Date(asOf);
  start.setDate(start.getDate() - (windowDays - 1));
  const startKey = dayKey(start.toISOString());
  const endKey = dayKey(asOf.toISOString());

  const users = new Set<string>();
  for (const event of events) {
    const key = dayKey(event.occurredAt);
    if (key >= startKey && key <= endKey) {
      users.add(event.distinctId);
    }
  }
  return users.size;
}

export interface DailyActiveUsersPoint {
  date: string;
  activeUsers: number;
}

/** One point per day over the trailing `days` ending at `asOf`, each showing that day's unique active users. */
export function dailyActiveUsersSeries(
  events: UsageEvent[],
  days: number,
  asOf: Date
): DailyActiveUsersPoint[] {
  const byDay = new Map<string, Set<string>>();

  for (const event of events) {
    const key = dayKey(event.occurredAt);
    if (!byDay.has(key)) byDay.set(key, new Set());
    byDay.get(key)!.add(event.distinctId);
  }

  const series: DailyActiveUsersPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(asOf);
    d.setDate(d.getDate() - i);
    const key = dayKey(d.toISOString());
    series.push({ date: key, activeUsers: byDay.get(key)?.size ?? 0 });
  }
  return series;
}

export interface RetentionPoint {
  weeksSinceFirstSeen: number;
  retentionPct: number;
  cohortSize: number;
}

/**
 * Weekly cohort retention: for users whose first-ever event fell in a given
 * week, what fraction were still active N weeks later. Cohorts are pooled
 * together per week-offset so the result is a single curve, which is enough
 * signal for a v1 retention chart.
 */
export function weeklyRetentionCurve(events: UsageEvent[], maxWeeks = 8): RetentionPoint[] {
  const firstSeen = new Map<string, Date>();
  for (const event of events) {
    const occurred = new Date(event.occurredAt);
    const existing = firstSeen.get(event.distinctId);
    if (!existing || occurred < existing) {
      firstSeen.set(event.distinctId, occurred);
    }
  }

  const activeWeeksByUser = new Map<string, Set<number>>();
  for (const event of events) {
    const start = firstSeen.get(event.distinctId);
    if (!start) continue;
    const weekOffset = Math.floor(daysBetween(start, new Date(event.occurredAt)) / 7);
    if (!activeWeeksByUser.has(event.distinctId)) {
      activeWeeksByUser.set(event.distinctId, new Set());
    }
    activeWeeksByUser.get(event.distinctId)!.add(weekOffset);
  }

  const cohortSize = firstSeen.size;
  const points: RetentionPoint[] = [];

  for (let week = 0; week <= maxWeeks; week++) {
    let retainedCount = 0;
    for (const weeks of activeWeeksByUser.values()) {
      if (weeks.has(week)) retainedCount += 1;
    }
    points.push({
      weeksSinceFirstSeen: week,
      retentionPct: cohortSize === 0 ? 0 : Math.round((retainedCount / cohortSize) * 1000) / 10,
      cohortSize,
    });
  }

  return points;
}

export interface FunnelStepResult {
  step: string;
  users: number;
  conversionFromPreviousPct: number | null;
}

/** Ordered funnel: for each step, how many distinct users who completed the previous step also completed this one. */
export function funnelConversion(events: UsageEvent[], steps: string[]): FunnelStepResult[] {
  const usersByStep = steps.map(
    (step) => new Set(events.filter((e) => e.eventName === step).map((e) => e.distinctId))
  );

  const results: FunnelStepResult[] = [];
  let carryOver: Set<string> | null = null;

  steps.forEach((step, index) => {
    const stepUsers = usersByStep[index];
    const qualifying = carryOver
      ? new Set([...stepUsers].filter((id) => carryOver!.has(id)))
      : stepUsers;

    const previousCount = index === 0 ? null : results[index - 1].users;
    results.push({
      step,
      users: qualifying.size,
      conversionFromPreviousPct:
        previousCount === null || previousCount === 0
          ? null
          : Math.round((qualifying.size / previousCount) * 1000) / 10,
    });

    carryOver = qualifying;
  });

  return results;
}
