import { describe, it, expect } from "vitest";
import { simulateScenario, applyPreset, SCENARIO_PRESETS } from "@/lib/scenario-simulator";
import { planBudget } from "@/lib/budget-planner";

describe("Scenario Simulator", () => {
  it("profitable scenario returns positive profit", () => {
    const result = simulateScenario({
      unitCost: 10,
      price: 30,
      budget: 5000,
      moq: 50,
      marketingBudget: 500,
      quantity: 200,
    });
    expect(result.projectedProfit).toBe(200 * 30 - 200 * 10 - 500); // 6000 - 2000 - 500 = 3500
    expect(result.projectedProfit).toBe(3500);
    expect(result.riskIndex).toBeLessThan(30);
    expect(result.breakEvenQuantity).toBe(25); // 500 / (30-10) = 25
  });

  it("unprofitable scenario returns negative profit", () => {
    const result = simulateScenario({
      unitCost: 25,
      price: 28,
      budget: 1000,
      moq: 100,
      marketingBudget: 500,
      quantity: 100,
    });
    expect(result.projectedProfit).toBeLessThan(0);
    expect(result.riskIndex).toBeGreaterThan(50);
  });

  it("aggressive preset multiplies quantity and marketing", () => {
    const aggressive = SCENARIO_PRESETS.find((p) => p.key === "aggressive")!;
    const input = applyPreset(
      { unitCost: 10, price: 30, budget: 5000, moq: 50, baseQuantity: 200, baseMarketing: 500 },
      aggressive
    );
    expect(input.quantity).toBe(360); // 200 * 1.8
    expect(input.marketingBudget).toBe(750); // 500 * 1.5
  });

  it("conservative preset reduces quantity and marketing", () => {
    const conservative = SCENARIO_PRESETS.find((p) => p.key === "conservative")!;
    const input = applyPreset(
      { unitCost: 10, price: 30, budget: 5000, moq: 50, baseQuantity: 200, baseMarketing: 500 },
      conservative
    );
    expect(input.quantity).toBe(100); // 200 * 0.5
    expect(input.marketingBudget).toBe(400); // 500 * 0.8
  });

  it("high capital ratio increases risk index", () => {
    const result = simulateScenario({
      unitCost: 20,
      price: 40,
      budget: 2000,
      moq: 50,
      marketingBudget: 500,
      quantity: 200, // capital = 20*200+500 = 4500, budget 2000 => ratio 2.25
    });
    expect(result.riskIndex).toBeGreaterThanOrEqual(35);
  });
});

describe("Budget Planner", () => {
  it("allocates budget correctly", () => {
    const result = planBudget(5000, 10, 100, 500);
    expect(result.allocation.production).toBe(1000); // 10 * 100
    expect(result.allocation.marketing).toBe(500);
    expect(result.allocation.logistics).toBe(200); // 100*1.5 + 50
    expect(result.allocation.reserve).toBe(3300); // 5000 - 1000 - 500 - 200
    expect(result.reserveWarning).toBe(false);
    expect(result.reservePercent).toBe(66);
  });

  it("warns when reserve < 20%", () => {
    const result = planBudget(1500, 10, 100, 300);
    // prod=1000, mktg=300, logistics=200, reserve=0
    expect(result.reserveWarning).toBe(true);
    expect(result.reservePercent).toBeLessThan(20);
  });

  it("adds suggestion when production > 60%", () => {
    const result = planBudget(2000, 15, 100, 100);
    // prod=1500 = 75%
    expect(result.suggestions.some((s) => s.includes("60"))).toBe(true);
  });

  it("handles over-budget scenario", () => {
    const result = planBudget(500, 10, 100, 200);
    // prod=1000, mktg=200, logistics=200 = 1400 > 500
    expect(result.allocation.reserve).toBe(0);
    expect(result.suggestions.some((s) => s.includes("übersteigen"))).toBe(true);
  });
});
