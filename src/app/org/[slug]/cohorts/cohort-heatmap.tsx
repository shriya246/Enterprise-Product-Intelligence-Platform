import type { CohortRow } from "@/lib/analytics";

// Sequential blue ramp, ordinal steps (nearest-surface step kept >= 2:1
// contrast per the palette's ordinal guidance).
const RAMP_STEPS = [
  { max: 20, bg: "#9ec5f4", text: "#0b0b0b" },
  { max: 40, bg: "#5598e7", text: "#0b0b0b" },
  { max: 60, bg: "#2a78d6", text: "#ffffff" },
  { max: 80, bg: "#1c5cab", text: "#ffffff" },
  { max: 101, bg: "#0d366b", text: "#ffffff" },
];

function cellStyle(pct: number | null) {
  if (pct === null) return { background: "transparent" };
  const step = RAMP_STEPS.find((s) => pct < s.max) ?? RAMP_STEPS[RAMP_STEPS.length - 1];
  return { background: step.bg, color: step.text };
}

export function CohortHeatmap({ rows }: { rows: CohortRow[] }) {
  const maxWeeks = rows[0].retentionByWeek.length - 1;
  const recentRows = rows.slice(-8).reverse();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left font-medium text-text-muted">Cohort week</th>
            <th className="px-2 py-1 text-left font-medium text-text-muted">Size</th>
            {Array.from({ length: maxWeeks + 1 }, (_, week) => (
              <th key={week} className="px-2 py-1 text-center font-medium text-text-muted">
                Wk {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentRows.map((row) => (
            <tr key={row.cohortWeekStart}>
              <td className="px-2 py-1 text-text-muted">{row.cohortWeekStart}</td>
              <td className="px-2 py-1 text-text-muted">{row.cohortSize}</td>
              {row.retentionByWeek.map((pct, week) => (
                <td
                  key={week}
                  className="min-w-[3rem] rounded px-2 py-1 text-center [font-variant-numeric:tabular-nums]"
                  style={cellStyle(pct)}
                >
                  {pct === null ? "" : `${pct}%`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
