// ─── Dynamic Roadmap Generator ──────────────────────────────────
// Replaces static roadmap arrays with BrandProfile-driven generation.

import type { BrandProfile } from "./brand-profile";

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  riskWeight: "low" | "medium" | "high";
  capitalImpact: string;
  timeEstimate: string;
  priorityScore: number; // 0–100
  dependencies: string[];
  category: "validation" | "branding" | "compliance" | "production" | "logistics" | "capital" | "launch";
}

export interface RoadmapWeek {
  weekKey: string;
  title: string;
  steps: RoadmapStep[];
}

function step(
  id: string, title: string, description: string,
  opts: Partial<Omit<RoadmapStep, "id" | "title" | "description">> = {},
): RoadmapStep {
  return {
    id, title, description,
    riskWeight: opts.riskWeight ?? "low",
    capitalImpact: opts.capitalImpact ?? "—",
    timeEstimate: opts.timeEstimate ?? "1–2 Tage",
    priorityScore: opts.priorityScore ?? 50,
    dependencies: opts.dependencies ?? [],
    category: opts.category ?? "launch",
  };
}

/**
 * Generates a personalised roadmap based on BrandProfile and plan tier.
 */
export function generateRoadmap(bp: BrandProfile, plan: string): RoadmapWeek[] {
  const isPro = plan === "pro" || plan === "execution";
  const isExecution = plan === "execution";

  // ── Week 1: Foundation & Validation ──────────────────────────
  const w1: RoadmapStep[] = [];

  if ((bp.budget ?? Infinity) < 10000) {
    w1.push(step("lean-validation", "Lean Validation durchführen",
      "Mit minimalem Budget Marktinteresse validieren, bevor Kapital gebunden wird.",
      { riskWeight: "high", capitalImpact: "0–500 €", priorityScore: 95, category: "validation", timeEstimate: "3–5 Tage" }));
  }

  if (bp.priceSegment === "premium" || bp.priceSegment === "luxury") {
    w1.push(step("brand-positioning", "Brand Positioning definieren",
      "Premium-Positionierung erfordert klare Markenidentität vor dem Launch.",
      { riskWeight: "medium", capitalImpact: "0–1.000 €", priorityScore: 90, category: "branding", timeEstimate: "2–3 Tage" }));
  }

  if (bp.cashRunwayMonths !== null && bp.cashRunwayMonths < 4) {
    w1.push(step("capital-warning", "Kapital-Risiko bewerten",
      `Cash Runway liegt bei ~${bp.cashRunwayMonths} Monaten. Budget-Plan anpassen oder Finanzierung sichern.`,
      { riskWeight: "high", capitalImpact: "Kritisch", priorityScore: 98, category: "capital", timeEstimate: "1 Tag" }));
  }

  w1.push(step("market-research", "Marktrecherche & Wettbewerb",
    "Zielgruppe, Wettbewerber und Preisbenchmarks analysieren.",
    { priorityScore: 80, category: "validation", timeEstimate: "2–3 Tage" }));

  if (!bp.differentiation) {
    w1.push(step("usp-define", "Alleinstellungsmerkmal definieren",
      "Ohne klare Differenzierung bleibst du austauschbar.",
      { riskWeight: "medium", priorityScore: 85, category: "branding", timeEstimate: "1–2 Tage" }));
  }

  // ── Week 2: Compliance & Production ──────────────────────────
  const w2: RoadmapStep[] = [];

  if (bp.targetRegion === "EU" || bp.targetRegion === "DE") {
    w2.push(step("eu-compliance", "EU-Compliance prüfen",
      "GPSR, VerpackG, VAT-Registrierung und ggf. CE-Kennzeichnung sicherstellen.",
      { riskWeight: "high", capitalImpact: "200–2.000 €", priorityScore: 92, category: "compliance", timeEstimate: "3–5 Tage" }));
  }

  if (bp.targetRegion === "US") {
    w2.push(step("fda-check", "FDA / US-Regulatorik prüfen",
      "US-Markt erfordert spezifische Produktzulassungen und Labeling-Vorschriften.",
      { riskWeight: "high", capitalImpact: "500–5.000 €", priorityScore: 90, category: "compliance", timeEstimate: "5–10 Tage" }));
  }

  const cosmetics = ["cosmetics", "kosmetik", "skincare", "beauty"];
  if (bp.categoryId && cosmetics.some(c => bp.categoryId!.toLowerCase().includes(c))) {
    w2.push(step("cpnp", "CPNP-Registrierung vorbereiten",
      "Kosmetikprodukte erfordern eine Notifizierung im CPNP-Portal der EU.",
      { riskWeight: "high", capitalImpact: "500–3.000 €", priorityScore: 95, category: "compliance", timeEstimate: "5–7 Tage" }));
  }

  const supplements = ["supplements", "nahrungsergaenzung", "supplement", "vitamine"];
  if (bp.categoryId && supplements.some(s => bp.categoryId!.toLowerCase().includes(s))) {
    w2.push(step("novel-food", "Novel Food Verordnung prüfen",
      "Nahrungsergänzungsmittel unterliegen der Novel-Food-Verordnung.",
      { riskWeight: "high", capitalImpact: "1.000–5.000 €", priorityScore: 93, category: "compliance", timeEstimate: "3–5 Tage" }));
  }

  if (bp.productionStage === "prototype" || bp.productionStage === "sampling") {
    w2.push(step("sampling-workflow", "Sampling & Qualitätsprüfung",
      "Muster bestellen, testen und Qualitätsstandards definieren.",
      { riskWeight: "medium", capitalImpact: "200–1.500 €", priorityScore: 85, category: "production", timeEstimate: "7–14 Tage" }));
  }

  if ((bp.launchQuantity ?? 0) > 2000) {
    w2.push(step("production-risk", "Produktionsrisiken absichern",
      "Bei >2.000 Einheiten: Qualitätssicherung, Inspektionen und Backup-Lieferant.",
      { riskWeight: "high", capitalImpact: "Hoch", priorityScore: 88, category: "production", timeEstimate: "3–5 Tage" }));
  }

  w2.push(step("supplier-confirm", "Lieferant bestätigen & MOQ verhandeln",
    "Finale Konditionen, Zahlungsbedingungen und Lieferzeitplan festlegen.",
    { riskWeight: "medium", capitalImpact: "Variabel", priorityScore: 82, category: "production", timeEstimate: "3–7 Tage" }));

  // ── Week 3: Logistics & Pre-Launch ──────────────────────────
  const w3: RoadmapStep[] = [];

  if (bp.fulfillmentModel === "3pl" || bp.fulfillmentModel === "fba") {
    w3.push(step("logistics-setup", "Fulfillment-Partner einrichten",
      `${bp.fulfillmentModel === "fba" ? "FBA" : "3PL"}-Anbindung: Wareneingang, Labeling und Versandkonditionen.`,
      { riskWeight: "medium", capitalImpact: "500–2.000 €", priorityScore: 85, category: "logistics", timeEstimate: "5–7 Tage" }));
  }

  if (bp.productionStage === "scaling") {
    w3.push(step("inventory-optimization", "Bestandsoptimierung",
      "Sicherheitsbestand, Nachbestellpunkt und Lagerkosten kalkulieren.",
      { riskWeight: "medium", capitalImpact: "Variabel", priorityScore: 80, category: "logistics", timeEstimate: "2–3 Tage" }));
  }

  w3.push(step("content-production", "Content & Produktfotos",
    "Produktbilder, Beschreibungen und Marketing-Assets erstellen.",
    { priorityScore: 78, category: "branding", timeEstimate: "3–5 Tage" }));

  w3.push(step("shop-setup", "Shop & Listing vorbereiten",
    "Online-Shop oder Marketplace-Listing aufsetzen und testen.",
    { priorityScore: 75, category: "launch", timeEstimate: "3–5 Tage" }));

  // ── Week 4: Launch & Monitor ────────────────────────────────
  const w4: RoadmapStep[] = [];

  w4.push(step("soft-launch", "Soft Launch starten",
    "Begrenzte Zielgruppe, erste Verkäufe, Feedback sammeln.",
    { priorityScore: 90, category: "launch", timeEstimate: "3–5 Tage" }));

  if (bp.margin !== null && bp.margin < 35) {
    w4.push(step("margin-review", "Margen-Review nach ersten Verkäufen",
      "Prüfe ob reale Kosten deine kalkulierte Marge halten.",
      { riskWeight: "high", priorityScore: 88, category: "capital", timeEstimate: "1–2 Tage" }));
  }

  w4.push(step("kpi-setup", "KPI-Tracking einrichten",
    "Conversion, CAC, ROAS und Retourenquote ab Tag 1 tracken.",
    { priorityScore: 82, category: "launch", timeEstimate: "1 Tag" }));

  w4.push(step("iterate", "Optimieren & Skalieren",
    "Basierend auf Daten: Preis, Ads und Fulfillment anpassen.",
    { priorityScore: 70, category: "launch", timeEstimate: "fortlaufend" }));

  // Sort each week by priority
  const sortByPriority = (a: RoadmapStep, b: RoadmapStep) => b.priorityScore - a.priorityScore;
  w1.sort(sortByPriority);
  w2.sort(sortByPriority);
  w3.sort(sortByPriority);
  w4.sort(sortByPriority);

  return [
    { weekKey: "w1", title: "Woche 1 — Foundation & Validation", steps: w1 },
    { weekKey: "w2", title: "Woche 2 — Compliance & Produktion", steps: w2 },
    { weekKey: "w3", title: "Woche 3 — Logistics & Pre-Launch", steps: w3 },
    { weekKey: "w4", title: "Woche 4 — Launch & Monitoring", steps: w4 },
  ];
}
