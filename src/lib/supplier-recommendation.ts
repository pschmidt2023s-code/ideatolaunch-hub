// ─── Smart Supplier Recommendation Engine ───────────────────────
// Prioritizes suppliers based on user profile & capital situation.

import type { ProductionSupplier } from "@/data/suppliers/production";
import type { PackagingSupplier } from "@/data/suppliers/packaging";
import type { AddonSupplier } from "@/data/suppliers/addons";

export type AnyIntelligentSupplier = ProductionSupplier | PackagingSupplier | AddonSupplier;

export interface UserProfile {
  budget: number;
  riskTolerance?: string;    // "low" | "medium" | "high"
  archetype?: string;        // "cautious" | "balanced" | "aggressive"
  categoryId: string;
  priceSegment: "budget" | "mid" | "premium";
}

export interface SupplierFilter {
  euOnly: boolean;
  maxMOQ: number | null;
  fastDelivery: boolean;      // leadTime <= 14
  lowCapitalRisk: boolean;    // capitalLockScore <= 30
  affiliateOnly: boolean;
}

export const DEFAULT_FILTERS: SupplierFilter = {
  euOnly: false,
  maxMOQ: null,
  fastDelivery: false,
  lowCapitalRisk: false,
  affiliateOnly: false,
};

export function applyFilters<T extends AnyIntelligentSupplier>(suppliers: T[], filters: SupplierFilter): T[] {
  return suppliers.filter((s) => {
    if (filters.euOnly && !s.euBased) return false;
    if (filters.maxMOQ !== null && s.estimatedMOQ > filters.maxMOQ) return false;
    if (filters.fastDelivery && s.leadTimeDays > 14) return false;
    if (filters.lowCapitalRisk && s.capitalLockScore > 30) return false;
    if (filters.affiliateOnly && !s.affiliateAvailable) return false;
    return true;
  });
}

/** Score a supplier for smart ranking based on user profile */
export function computeSmartScore(supplier: AnyIntelligentSupplier, profile: UserProfile): number {
  let score = 0;
  const { budget, riskTolerance, archetype, priceSegment } = profile;

  // Budget fit: lower MOQ cost = better for low budget
  const minCost = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[0];
  if (minCost <= budget * 0.3) score += 30;
  else if (minCost <= budget * 0.6) score += 20;
  else if (minCost <= budget) score += 10;

  // Positioning match
  if (supplier.positioning === priceSegment) score += 20;
  else {
    const order = ["budget", "mid", "premium"];
    const diff = Math.abs(order.indexOf(supplier.positioning) - order.indexOf(priceSegment));
    if (diff === 1) score += 10;
  }

  // Risk tolerance matching
  if (riskTolerance === "low" || archetype === "cautious") {
    score += supplier.riskScore <= 20 ? 25 : supplier.riskScore <= 40 ? 10 : 0;
    score += supplier.reliabilityScore >= 85 ? 15 : supplier.reliabilityScore >= 70 ? 8 : 0;
  } else if (riskTolerance === "high" || archetype === "aggressive") {
    // Aggressive users want scale → reward low unit cost
    const avgUnit = (supplier.estimatedUnitCostRange[0] + supplier.estimatedUnitCostRange[1]) / 2;
    score += avgUnit < 3 ? 20 : avgUnit < 8 ? 10 : 0;
    score += supplier.estimatedMOQ >= 500 ? 10 : 0;
  } else {
    // balanced
    score += supplier.reliabilityScore >= 80 ? 15 : 5;
    score += supplier.riskScore <= 40 ? 10 : 0;
  }

  // EU bonus for cautious users
  if (supplier.euBased && (riskTolerance === "low" || archetype === "cautious")) {
    score += 10;
  }

  // Fast delivery bonus
  if (supplier.leadTimeDays <= 14) score += 5;

  return score;
}

/** Get fit recommendation label */
export function getFitLabel(supplier: AnyIntelligentSupplier, profile: UserProfile): string {
  const minCost = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[0];
  
  if (minCost <= profile.budget * 0.2 && supplier.riskScore <= 20) {
    return "Ideal für Low Capital Launch";
  }
  if (supplier.positioning === "premium" && supplier.reliabilityScore >= 90) {
    return "Ideal für Premium Positionierung";
  }
  if (supplier.estimatedMOQ >= 500 && supplier.riskScore <= 50) {
    return "Skalierbar für High Volume";
  }
  if (supplier.leadTimeDays <= 10) {
    return "Schnellstart möglich";
  }
  return "";
}

/** Get delay impact warning */
export function getDelayWarning(supplier: AnyIntelligentSupplier, cashRunwayMonths: number): string | null {
  if (supplier.leadTimeDays > 20 && cashRunwayMonths < 4) {
    return `⚠️ ${supplier.leadTimeDays} Tage Vorlaufzeit bei ${cashRunwayMonths.toFixed(1)} Mo. Runway — Verzögerungsrisiko!`;
  }
  if (supplier.leadTimeDays > 30) {
    return `Vorlaufzeit ${supplier.leadTimeDays} Tage — plane Puffer ein.`;
  }
  return null;
}
