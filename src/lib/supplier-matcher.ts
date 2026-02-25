// ─── Supplier Matching Engine (PRO FEATURE) ─────────────────────
// Deterministic matching. No external API calls.

import { type Supplier, suppliers } from "@/data/supplier-database";

export interface SupplierMatchInput {
  productCategory: string;
  budget: number;
  targetRegion: "EU" | "Asia" | "Global";
  launchQuantity: number;
  priceSegment: "low" | "mid" | "premium";
}

export interface SupplierMatchResult {
  productionSuppliers: Supplier[];
  packagingSuppliers: Supplier[];
  recommendedRegion: string;
  reasoning: string;
  riskNotes: string[];
}

export function matchSuppliers(input: SupplierMatchInput): SupplierMatchResult {
  const { productCategory, budget, targetRegion, launchQuantity, priceSegment } = input;

  const cat = productCategory.toLowerCase();
  const riskNotes: string[] = [];

  // ── Filter by category ──────────────────────────────────
  const categoryPool = suppliers.filter((s) =>
    s.categories.some((c) => c.toLowerCase().includes(cat))
  );

  // Fallback to full pool if category has no matches
  const pool = categoryPool.length > 0 ? categoryPool : suppliers;

  // ── Region preference ───────────────────────────────────
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
    if (targetRegion === "Asia") {
      riskNotes.push("Viele asiatische Lieferanten verlangen MOQs über 300 Stück. EU-Lieferanten sind flexibler bei kleinen Mengen.");
    }
  } else if (priceSegment === "premium") {
    preferredRegion = targetRegion === "Asia" ? "Asia" : "EU";
    reasoning = "Für Premium-Positionierung empfehlen wir Lieferanten mit hoher Qualitätskontrolle. EU bietet kürzere Kommunikationswege, Asien erfordert strengere QC.";
  } else if (targetRegion === "Global") {
    preferredRegion = budget >= 15_000 && launchQuantity >= 500 ? "Asia" : "EU";
    reasoning = preferredRegion === "Asia"
      ? "Dein Budget und deine Menge rechtfertigen asiatische Lieferanten für maximale Kosteneffizienz."
      : "Bei deiner Menge sind EU-Lieferanten noch die bessere Wahl — flexibler und ohne Importrisiko.";
  } else {
    preferredRegion = targetRegion;
    reasoning = targetRegion === "EU"
      ? "EU-Lieferanten bieten Compliance-Sicherheit, kürzere Lieferzeiten und einfachere Kommunikation."
      : "Asiatische Lieferanten bieten die besten Stückpreise bei höheren Mengen.";
  }

  // ── Score & rank suppliers ──────────────────────────────
  function scoreSupplier(s: Supplier): number {
    let score = 0;

    // Region match
    if (preferredRegion === s.region) score += 30;
    else if (targetRegion === "Global") score += 15;

    // Price segment match
    if (s.priceSegments.includes(priceSegment)) score += 25;

    // MOQ fit
    if (s.estimatedMOQ <= launchQuantity) score += 20;
    else if (s.estimatedMOQ <= launchQuantity * 1.5) score += 10;

    // Cost within budget
    const totalMinCost = s.estimatedMOQ * s.estimatedUnitCostRange[0];
    if (totalMinCost <= budget) score += 15;
    else if (totalMinCost <= budget * 1.3) score += 5;

    // Lead time bonus for shorter times
    if (s.leadTimeDays <= 21) score += 10;
    else if (s.leadTimeDays <= 30) score += 5;

    return score;
  }

  const production = pool
    .filter((s) => s.type === "production")
    .map((s) => ({ supplier: s, score: scoreSupplier(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.supplier);

  const packaging = pool
    .filter((s) => s.type === "packaging")
    .map((s) => ({ supplier: s, score: scoreSupplier(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((r) => r.supplier);

  // ── Risk analysis ───────────────────────────────────────
  for (const s of production) {
    const moqCost = s.estimatedMOQ * s.estimatedUnitCostRange[0];
    if (moqCost > budget * 0.6) {
      riskNotes.push(
        `MOQ-Risiko: ${s.name} benötigt mindestens ${moqCost.toLocaleString("de-DE")} € für die Erstbestellung — das sind über 60 % deines Budgets.`
      );
    }
  }

  if (priceSegment === "premium" && production.some((s) => s.region === "Asia")) {
    riskNotes.push("Premium-Positionierung mit asiatischer Produktion erfordert strenge Qualitätskontrolle und ggf. Vor-Ort-Inspektionen.");
  }

  if (launchQuantity > 0 && budget > 0) {
    const unitBudget = budget / launchQuantity;
    if (unitBudget < 1) {
      riskNotes.push("Dein Budget pro Stück ist sehr knapp. Überprüfe ob deine Kalkulation realistisch ist.");
    }
  }

  return {
    productionSuppliers: production,
    packagingSuppliers: packaging,
    recommendedRegion: preferredRegion,
    reasoning,
    riskNotes,
  };
}
