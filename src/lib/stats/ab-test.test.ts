import { describe, expect, it } from "vitest";
import { twoProportionZTest } from "./ab-test";

describe("twoProportionZTest", () => {
  it("flags a clear, large-sample difference as significant", () => {
    const result = twoProportionZTest({
      visitorsA: 1000,
      conversionsA: 100, // 10%
      visitorsB: 1000,
      conversionsB: 150, // 15%
    });

    expect(result.rateA).toBe(10);
    expect(result.rateB).toBe(15);
    expect(result.isSignificant).toBe(true);
    expect(result.pValue).not.toBeNull();
    expect(result.pValue!).toBeLessThan(0.05);
  });

  it("does not flag a tiny sample as significant even with a raw rate difference", () => {
    const result = twoProportionZTest({
      visitorsA: 10,
      conversionsA: 1,
      visitorsB: 10,
      conversionsB: 2,
    });

    expect(result.isSignificant).toBe(false);
  });

  it("handles zero-visitor variants without dividing by zero", () => {
    const result = twoProportionZTest({
      visitorsA: 0,
      conversionsA: 0,
      visitorsB: 10,
      conversionsB: 5,
    });

    expect(result.isSignificant).toBe(false);
    expect(result.pValue).toBeNull();
  });
});
