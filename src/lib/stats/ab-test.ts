import { cumulativeStdNormalProbability } from "simple-statistics";

export interface AbTestInput {
  visitorsA: number;
  conversionsA: number;
  visitorsB: number;
  conversionsB: number;
}

export interface AbTestResult {
  rateA: number;
  rateB: number;
  upliftPct: number | null;
  zScore: number | null;
  pValue: number | null;
  isSignificant: boolean;
}

/**
 * Two-proportion z-test, two-tailed, alpha = 0.05. Uses simple-statistics'
 * standard normal CDF rather than a hand-rolled distribution implementation.
 */
export function twoProportionZTest(input: AbTestInput): AbTestResult {
  const { visitorsA, conversionsA, visitorsB, conversionsB } = input;

  const rateA = visitorsA === 0 ? 0 : conversionsA / visitorsA;
  const rateB = visitorsB === 0 ? 0 : conversionsB / visitorsB;

  if (visitorsA === 0 || visitorsB === 0) {
    return { rateA, rateB, upliftPct: null, zScore: null, pValue: null, isSignificant: false };
  }

  const pooled = (conversionsA + conversionsB) / (visitorsA + visitorsB);
  const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / visitorsA + 1 / visitorsB));

  if (standardError === 0) {
    return { rateA, rateB, upliftPct: 0, zScore: 0, pValue: 1, isSignificant: false };
  }

  const zScore = (rateB - rateA) / standardError;
  const pValue = 2 * (1 - cumulativeStdNormalProbability(Math.abs(zScore)));
  const upliftPct = rateA === 0 ? null : Math.round(((rateB - rateA) / rateA) * 1000) / 10;

  return {
    rateA: Math.round(rateA * 1000) / 10,
    rateB: Math.round(rateB * 1000) / 10,
    upliftPct,
    zScore: Math.round(zScore * 100) / 100,
    pValue: Math.round(pValue * 1000) / 1000,
    isSignificant: pValue < 0.05,
  };
}
