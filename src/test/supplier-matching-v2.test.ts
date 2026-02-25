import { describe, it, expect } from "vitest";
import { matchSuppliers, type SupplierMatchInput } from "@/lib/supplier-matcher";
import { normalizeCategoryId, CATEGORIES } from "@/lib/categories";

const baseInput: SupplierMatchInput = {
  categoryId: "cosmetics",
  budget: 10000,
  targetRegion: "EU",
  launchQuantity: 500,
  priceSegment: "mid",
};

describe("Supplier Matcher v2", () => {
  it("cosmetics returns only cosmetics production suppliers", () => {
    const result = matchSuppliers({ ...baseInput, categoryId: "cosmetics" });
    for (const r of result.productionSuppliers) {
      expect(r.supplier.categories).toContain("cosmetics");
    }
  });

  it("apparel returns only apparel production suppliers", () => {
    const result = matchSuppliers({ ...baseInput, categoryId: "apparel" });
    for (const r of result.productionSuppliers) {
      expect(r.supplier.categories).toContain("apparel");
    }
  });

  it("electronics does NOT return textiles", () => {
    const result = matchSuppliers({ ...baseInput, categoryId: "electronics" });
    for (const r of result.productionSuppliers) {
      expect(r.supplier.categories).not.toContain("apparel");
      expect(r.supplier.categories).not.toContain("cosmetics");
    }
  });

  it("shows insufficient matches + suggestions for unknown category", () => {
    const result = matchSuppliers({ ...baseInput, categoryId: "nonexistent" });
    expect(result.insufficientMatches).toBe(true);
    expect(result.suggestedCategories.length).toBeGreaterThan(0);
  });

  it("returns addon suppliers when available", () => {
    const result = matchSuppliers({ ...baseInput, categoryId: "cosmetics" });
    expect(result.addonSuppliers.length).toBeGreaterThan(0);
  });

  it("filters addon suppliers by addon budget", () => {
    const result = matchSuppliers({ ...baseInput, categoryId: "cosmetics", addonBudget: 10 });
    for (const r of result.addonSuppliers) {
      const minCost = r.supplier.estimatedMOQ * r.supplier.estimatedUnitCostRange[0];
      expect(minCost).toBeLessThanOrEqual(10);
    }
  });

  it("returns max 3 production, 3 packaging, 3 addons", () => {
    const result = matchSuppliers(baseInput);
    expect(result.productionSuppliers.length).toBeLessThanOrEqual(3);
    expect(result.packagingSuppliers.length).toBeLessThanOrEqual(3);
    expect(result.addonSuppliers.length).toBeLessThanOrEqual(3);
  });

  it("generates risk notes for high MOQ cost", () => {
    const result = matchSuppliers({ ...baseInput, budget: 500, categoryId: "apparel" });
    // With 500€ budget, most suppliers should trigger risk
    expect(result.riskNotes.length).toBeGreaterThan(0);
  });
});

describe("Category normalization", () => {
  it("maps 'Kosmetik' to cosmetics", () => {
    expect(normalizeCategoryId("Kosmetik")).toBe("cosmetics");
  });

  it("maps 'electronics' to electronics", () => {
    expect(normalizeCategoryId("electronics")).toBe("electronics");
  });

  it("maps unknown text to 'other'", () => {
    expect(normalizeCategoryId("xyz123")).toBe("other");
  });

  it("maps empty string to empty string", () => {
    expect(normalizeCategoryId("")).toBe("");
  });

  it("all CATEGORIES have unique ids", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
