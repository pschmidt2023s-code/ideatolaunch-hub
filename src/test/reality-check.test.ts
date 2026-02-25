import { describe, it, expect } from "vitest";
import { evaluateRealityCheck } from "@/lib/reality-check-engine";

describe("Reality Check Engine v2", () => {
  it("Test A: Critical – low margin + budget/MOQ stress", () => {
    const result = evaluateRealityCheck({
      unitCost: 20,
      recommendedPrice: 25,
      margin: 20,
      marketingBudget: 0,
      breakEvenUnits: 200,
      budget: "<1k",
    });
    expect(result.status).toBe("critical");
    expect(result.feasibilityScore).toBeLessThan(40);
    expect(result.risks.some((r) => r.severity === "critical")).toBe(true);
  });

  it("Test B: Safe – good margin, underpriced as info", () => {
    const result = evaluateRealityCheck({
      unitCost: 12,
      recommendedPrice: 25,
      margin: 52,
      marketingBudget: 100,
      breakEvenUnits: 100,
      budget: "1k-5k",
    });
    expect(result.status).toBe("safe");
    // ratio = 2.08, margin > 40 && budget >= 1000 => info
    const underpriced = result.risks.find((r) => r.key === "underpriced_info");
    expect(underpriced).toBeDefined();
    expect(underpriced!.severity).toBe("info");
    expect(underpriced!.message).toContain("2.08");
  });

  it("Test C: Safe – healthy setup, no risks", () => {
    const result = evaluateRealityCheck({
      unitCost: 7,
      recommendedPrice: 30,
      margin: 77,
      marketingBudget: 500,
      breakEvenUnits: 50,
      budget: "5k-15k",
    });
    expect(result.status).toBe("safe");
    expect(result.feasibilityScore).toBeGreaterThanOrEqual(90);
    expect(result.risks).toHaveLength(0);
  });

  it("Risky: two warnings, no critical", () => {
    const result = evaluateRealityCheck({
      unitCost: 10,
      recommendedPrice: 22,
      margin: 30, // warning (25-35%)
      marketingBudget: 0, // warning (budget >= 1000)
      breakEvenUnits: 80,
      budget: "1k-5k",
    });
    expect(result.status).toBe("risky");
    const warnings = result.risks.filter((r) => r.severity === "warning");
    expect(warnings.length).toBeGreaterThanOrEqual(2);
  });

  it("No marketing with low budget => info severity", () => {
    const result = evaluateRealityCheck({
      unitCost: 5,
      recommendedPrice: 20,
      margin: 75,
      marketingBudget: 0,
      breakEvenUnits: 30,
      budget: "<1k",
    });
    const noMktg = result.risks.find((r) => r.key === "no_marketing_info");
    expect(noMktg).toBeDefined();
    expect(noMktg!.severity).toBe("info");
  });

  it("MOQ pressure levels", () => {
    // 60% of budget => warning
    const result = evaluateRealityCheck({
      unitCost: 18,
      recommendedPrice: 50,
      margin: 64,
      marketingBudget: 200,
      breakEvenUnits: 100, // 18*100 = 1800, budget 3000 => 60%
      budget: "1k-5k",
    });
    const moq = result.risks.find((r) => r.key === "moq_warning");
    expect(moq).toBeDefined();
  });
});
