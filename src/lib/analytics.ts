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

export interface CohortRow {
  cohortWeekStart: string; // YYYY-MM-DD, Monday of the cohort's first-seen week
  cohortSize: number;
  retentionByWeek: (number | null)[]; // index = weeks since cohort start; null = not enough time has passed
}

function weekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * A cohort-by-week retention grid: each row is the group of users first seen
 * in a given week, and each column is what fraction of that cohort was still
 * active N weeks later. Unlike `weeklyRetentionCurve`, cohorts are kept
 * separate rather than pooled, matching the classic cohort-table view.
 */
export function cohortRetentionTable(
  events: UsageEvent[],
  maxWeeks = 6,
  asOf: Date = new Date()
): CohortRow[] {
  const firstSeen = new Map<string, Date>();
  for (const event of events) {
    const occurred = new Date(event.occurredAt);
    const existing = firstSeen.get(event.distinctId);
    if (!existing || occurred < existing) {
      firstSeen.set(event.distinctId, occurred);
    }
  }

  const cohortOf = new Map<string, string>(); // distinctId -> cohort week key
  const cohortSizes = new Map<string, number>();
  for (const [distinctId, first] of firstSeen) {
    const key = weekStart(first).toISOString().slice(0, 10);
    cohortOf.set(distinctId, key);
    cohortSizes.set(key, (cohortSizes.get(key) ?? 0) + 1);
  }

  const activeWeeksByUser = new Map<string, Set<number>>();
  for (const event of events) {
    const cohortKey = cohortOf.get(event.distinctId);
    if (!cohortKey) continue;
    const cohortStartDate = new Date(`${cohortKey}T00:00:00.000Z`);
    const weekOffset = Math.floor(daysBetween(cohortStartDate, new Date(event.occurredAt)) / 7);
    if (!activeWeeksByUser.has(event.distinctId)) activeWeeksByUser.set(event.distinctId, new Set());
    activeWeeksByUser.get(event.distinctId)!.add(weekOffset);
  }

  const cohortKeys = [...cohortSizes.keys()].sort();

  return cohortKeys.map((cohortKey) => {
    const cohortStartDate = new Date(`${cohortKey}T00:00:00.000Z`);
    const size = cohortSizes.get(cohortKey)!;
    const weeksElapsed = Math.floor(daysBetween(cohortStartDate, asOf) / 7);

    const retentionByWeek: (number | null)[] = [];
    for (let week = 0; week <= maxWeeks; week++) {
      if (week > weeksElapsed) {
        retentionByWeek.push(null);
        continue;
      }
      let retained = 0;
      for (const [distinctId, cKey] of cohortOf) {
        if (cKey === cohortKey && activeWeeksByUser.get(distinctId)?.has(week)) {
          retained += 1;
        }
      }
      retentionByWeek.push(size === 0 ? 0 : Math.round((retained / size) * 1000) / 10);
    }

    return { cohortWeekStart: cohortKey, cohortSize: size, retentionByWeek };
  });
}

export interface FeatureAdoptionInput {
  key: string;
  name: string;
}

export interface FeatureAdoptionResult {
  key: string;
  name: string;
  adoptedUsers: number;
  adoptionPct: number; // adoptedUsers / activeUsers in the same window
}

/** For each registered feature, what fraction of active users fired its event at least once in the window. */
export function featureAdoption(
  events: UsageEvent[],
  features: FeatureAdoptionInput[],
  windowDays: number,
  asOf: Date
): FeatureAdoptionResult[] {
  const totalActive = activeUsers(events, windowDays, asOf);
  const start = new Date(asOf);
  start.setDate(start.getDate() - (windowDays - 1));
  const startKey = dayKey(start.toISOString());
  const endKey = dayKey(asOf.toISOString());

  return features.map((feature) => {
    const adopters = new Set<string>();
    for (const event of events) {
      const key = dayKey(event.occurredAt);
      if (event.eventName === feature.key && key >= startKey && key <= endKey) {
        adopters.add(event.distinctId);
      }
    }
    return {
      key: feature.key,
      name: feature.name,
      adoptedUsers: adopters.size,
      adoptionPct: totalActive === 0 ? 0 : Math.round((adopters.size / totalActive) * 1000) / 10,
    };
  });
}
