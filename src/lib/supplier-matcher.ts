// ─── Supplier Matching Engine v2 (PRO FEATURE) ──────────────────
// Strict category-based filtering. Weighted scoring. No external API calls.

import { productionSuppliers, type ProductionSupplier } from "@/data/suppliers/production";
import { packagingSuppliers, type PackagingSupplier } from "@/data/suppliers/packaging";
import { addonSuppliers, type AddonSupplier } from "@/data/suppliers/addons";
import { CATEGORIES } from "@/lib/categories";

export interface SupplierMatchInput {
  categoryId: string;          // canonical category id
  budget: number;
  targetRegion: "EU" | "Asia" | "Global";
  launchQuantity: number;
  priceSegment: "budget" | "mid" | "premium";
  addonBudget?: number;        // optional separate budget for add-ons
}

export interface ScoredSupplier<T> {
  supplier: T;
  score: number;
}

export interface SupplierMatchResult {
  productionSuppliers: ScoredSupplier<ProductionSupplier>[];
  packagingSuppliers: ScoredSupplier<PackagingSupplier>[];
  addonSuppliers: ScoredSupplier<AddonSupplier>[];
  recommendedRegion: string;
  reasoning: string;
  riskNotes: string[];
  insufficientMatches: boolean;
  suggestedCategories: string[];
}

// ── Scoring weights ─────────────────────────────────────────────
const W = { budget: 25, moq: 25, region: 30, positioning: 20 };

function scoreBudgetFit(minCost: number, budget: number): number {
  if (minCost <= budget) return W.budget;
  if (minCost <= budget * 1.3) return W.budget * 0.4;
  return 0;
}

function scoreMOQFit(moq: number, qty: number): number {
  if (moq <= qty) return W.moq;
  if (moq <= qty * 1.5) return W.moq * 0.5;
  return 0;
}

function scoreRegionFit(supplierRegion: string, preferred: string, target: string): number {
  if (supplierRegion === preferred) return W.region;
  if (target === "Global") return W.region * 0.5;
  return 0;
}

function scorePositioningFit(supplierPos: string, desired: string): number {
  if (supplierPos === desired) return W.positioning;
  // adjacent segments get partial credit
  const order = ["budget", "mid", "premium"];
  const diff = Math.abs(order.indexOf(supplierPos) - order.indexOf(desired));
  if (diff === 1) return W.positioning * 0.4;
  return 0;
}

function computePreferredRegion(input: SupplierMatchInput): { region: string; reasoning: string; riskNotes: string[] } {
  const { budget, targetRegion, launchQuantity, priceSegment } = input;
  const riskNotes: string[] = [];
  let preferredRegion: string;
  let reasoning: string;

  if (budget < 10_000) {
    preferredRegion = "EU";
    reasoning = "Bei einem Budget unter 10.000 € empfehlen wir EU-Lieferanten: niedrigere MOQs, kürzere Vorlaufzeiten und kein Zollrisiko.";
    if (targetRegion === "Asia") {
      riskNotes.push("Dein Budget ist für asiatische Lieferanten knapp — hohe MOQs und Versandkosten können dein Budget übersteigen.");
    }
  } else if (launchQuantity < 300) {
    preferredRegion = "EU";
    reasoning = "Für Startmengen unter 300 Stück sind EU-Lieferanten besser geeignet. Asiatische Hersteller haben oft höhere Mindestmengen.";
  } else if (priceSegment === "premium") {
    preferredRegion = targetRegion === "Asia" ? "Asia" : "EU";
    reasoning = "Für Premium-Positionierung empfehlen wir Lieferanten mit hoher Qualitätskontrolle.";
  } else if (targetRegion === "Global") {
    preferredRegion = budget >= 15_000 && launchQuantity >= 500 ? "Asia" : "EU";
    reasoning = preferredRegion === "Asia"
      ? "Dein Budget und deine Menge rechtfertigen asiatische Lieferanten für maximale Kosteneffizienz."
      : "Bei deiner Menge sind EU-Lieferanten noch die bessere Wahl.";
  } else {
    preferredRegion = targetRegion;
    reasoning = targetRegion === "EU"
      ? "EU-Lieferanten bieten Compliance-Sicherheit und kürzere Lieferzeiten."
      : "Asiatische Lieferanten bieten die besten Stückpreise bei höheren Mengen.";
  }

  return { region: preferredRegion, reasoning, riskNotes };
}

function matchesCategory(supplierCategories: string[], categoryId: string): boolean {
  if (supplierCategories.length === 0) return true; // add-ons with empty = universal
  return supplierCategories.includes(categoryId);
}

export function matchSuppliers(input: SupplierMatchInput): SupplierMatchResult {
  const { categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget } = input;
  const { region: preferredRegion, reasoning, riskNotes } = computePreferredRegion(input);

  // ── Strict category filter ────────────────────────────────
  const prodPool = productionSuppliers.filter((s) => matchesCategory(s.categories, categoryId));
  const packPool = packagingSuppliers.filter((s) => matchesCategory(s.categories, categoryId));
  const addonPool = addonSuppliers.filter((s) => matchesCategory(s.categories, categoryId));

  const insufficientMatches = prodPool.length < 2;

  // Suggest adjacent categories if insufficient
  const suggestedCategories: string[] = [];
  if (insufficientMatches) {
    const allCatsWithProd = [...new Set(productionSuppliers.flatMap((s) => s.categories))];
    suggestedCategories.push(
      ...allCatsWithProd
        .filter((c) => c !== categoryId)
        .map((c) => CATEGORIES.find((cat) => cat.id === c)?.labelDe ?? c)
        .slice(0, 3)
    );
  }

  // ── Score function ────────────────────────────────────────
  function scoreAny<T extends { estimatedMOQ: number; estimatedUnitCostRange: [number, number]; region: string; positioning: string }>(s: T): number {
    const minCost = s.estimatedMOQ * s.estimatedUnitCostRange[0];
    return (
      scoreBudgetFit(minCost, budget) +
      scoreMOQFit(s.estimatedMOQ, launchQuantity) +
      scoreRegionFit(s.region, preferredRegion, targetRegion) +
      scorePositioningFit(s.positioning, priceSegment)
    );
  }

  const rankedProd = prodPool
    .map((s) => ({ supplier: s, score: scoreAny(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const rankedPack = packPool
    .map((s) => ({ supplier: s, score: scoreAny(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Add-ons: filter by addon budget if provided
  let addonScored = addonPool
    .map((s) => ({ supplier: s, score: scoreAny(s) }))
    .sort((a, b) => b.score - a.score);

  if (addonBudget && addonBudget > 0) {
    addonScored = addonScored.filter((r) => {
      const minTotal = r.supplier.estimatedMOQ * r.supplier.estimatedUnitCostRange[0];
      return minTotal <= addonBudget;
    });
  }
  addonScored = addonScored.slice(0, 3);

  // ── Risk analysis ─────────────────────────────────────────
  for (const r of rankedProd) {
    const moqCost = r.supplier.estimatedMOQ * r.supplier.estimatedUnitCostRange[0];
    if (moqCost > budget * 0.6) {
      riskNotes.push(
        `MOQ-Risiko: ${r.supplier.name} benötigt mindestens ${moqCost.toLocaleString("de-DE")} € — das sind über 60 % deines Budgets.`
      );
    }
  }

  if (priceSegment === "premium" && rankedProd.some((r) => r.supplier.region === "Asia")) {
    riskNotes.push("Premium-Positionierung mit asiatischer Produktion erfordert strenge Qualitätskontrolle.");
  }

  if (launchQuantity > 0 && budget > 0 && budget / launchQuantity < 1) {
    riskNotes.push("Dein Budget pro Stück ist sehr knapp. Überprüfe ob deine Kalkulation realistisch ist.");
  }

  return {
    productionSuppliers: rankedProd,
    packagingSuppliers: rankedPack,
    addonSuppliers: addonScored,
    recommendedRegion: preferredRegion,
    reasoning,
    riskNotes,
    insufficientMatches,
    suggestedCategories,
  };
}
