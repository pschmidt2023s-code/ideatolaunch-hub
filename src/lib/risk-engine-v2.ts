// ─── Risk Engine 2.0 ────────────────────────────────────────────
// Weighted risk calculation with €-impact, category-specific rules,
// and actionable remediation paths. Deterministic, no AI.

import type { BrandProfile } from "./brand-profile";

// ── Types ────────────────────────────────────────────────────────

export type RiskCategory = "financial" | "regulatory" | "operational" | "market" | "supplier";
export type RiskSeverity = "critical" | "high" | "medium" | "low";

export interface WeightedRisk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  euroImpact: number;          // estimated € loss if unmitigated
  probability: number;         // 0–100
  weightedScore: number;       // euroImpact * (probability / 100)
  fix: string;
  timeToFix: string;           // e.g. "1–2 Tage"
  regulatoryFlag: boolean;
  stepLink?: number;           // which step to navigate to
}

export interface RiskEngineResult {
  overallRiskScore: number;    // 0–100 (higher = more risk)
  totalExposure: number;       // total € at risk
  weightedExposure: number;    // probability-adjusted € at risk
  risks: WeightedRisk[];
  riskByCategory: Record<RiskCategory, number>;
  topRisk: WeightedRisk | null;
  riskLevel: "low" | "medium" | "high" | "critical";
}

// ── Input ────────────────────────────────────────────────────────

export interface RiskEngineInput {
  profile: BrandProfile;
  margin: number | null;
  recommendedPrice: number | null;
  productionCost: number | null;
  packagingCost: number | null;
  shippingCost: number | null;
  marketingBudget: number | null;
  breakEvenUnits: number | null;
  launchQuantity: number | null;
  complianceScore: number | null;
  openComplianceBlockers: number;
  supplierRiskWarnings: number;
  returnRate: number | null;
  hasSupplierContract: boolean;
  hasSampleApproval: boolean;
  plan: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function r(
  id: string, title: string, desc: string,
  category: RiskCategory, severity: RiskSeverity,
  euroImpact: number, probability: number,
  fix: string, timeToFix: string,
  opts: { regulatoryFlag?: boolean; stepLink?: number } = {}
): WeightedRisk {
  return {
    id, title, description: desc, category, severity,
    euroImpact, probability,
    weightedScore: Math.round(euroImpact * (probability / 100)),
    fix, timeToFix,
    regulatoryFlag: opts.regulatoryFlag ?? false,
    stepLink: opts.stepLink,
  };
}

// ── Category Detection ──────────────────────────────────────────

function getCatFlags(profile: BrandProfile) {
  const cat = (profile.categoryId || "").toLowerCase();
  return {
    isCosmetics: ["cosmetics", "kosmetik", "skincare", "beauty"].some(c => cat.includes(c)),
    isFood: ["food", "lebensmittel", "snacks", "getränke"].some(f => cat.includes(f)),
    isSupplements: ["supplements", "nahrungsergaenzung", "vitamine"].some(s => cat.includes(s)),
    isElectronics: ["electronics", "elektronik", "tech"].some(e => cat.includes(e)),
    isApparel: ["apparel", "textil", "fashion", "kleidung"].some(a => cat.includes(a)),
  };
}

// ── Main Engine ─────────────────────────────────────────────────

export function evaluateRisks(input: RiskEngineInput): RiskEngineResult {
  const risks: WeightedRisk[] = [];
  const { profile } = input;
  const cat = getCatFlags(profile);
  const isEU = profile.targetRegion === "DE" || profile.targetRegion === "EU";
  const budget = profile.budget ?? 0;
  const unitCost = (input.productionCost ?? 0) + (input.packagingCost ?? 0) + (input.shippingCost ?? 0);

  // ═══ FINANCIAL RISKS ═══════════════════════════════════════

  // Margin risk
  if (input.margin !== null) {
    if (input.margin < 15) {
      risks.push(r("fin_margin_critical", "Marge kritisch niedrig", `Aktuelle Marge: ${Math.round(input.margin)}%. Unter 15% ist kein nachhaltiges Geschäftsmodell möglich.`,
        "financial", "critical", 10000, 90, "Erhöhe deinen Verkaufspreis um mindestens 20% oder senke Produktionskosten.", "1–3 Tage", { stepLink: 2 }));
    } else if (input.margin < 25) {
      risks.push(r("fin_margin_low", "Marge zu niedrig", `Marge ${Math.round(input.margin)}% lässt kaum Spielraum für Marketing.`,
        "financial", "high", 5000, 70, "Ziel: mindestens 40% Marge für nachhaltiges Wachstum.", "1–2 Tage", { stepLink: 2 }));
    } else if (input.margin < 35) {
      risks.push(r("fin_margin_tight", "Marge knapp", `${Math.round(input.margin)}% Marge – wenig Puffer bei unerwarteten Kosten.`,
        "financial", "medium", 2500, 50, "Optimiere Kosten oder teste höhere Preispunkte.", "1 Woche", { stepLink: 2 }));
    }
  }

  // Budget overstretch
  if (budget > 0 && unitCost > 0 && input.launchQuantity) {
    const totalLaunchCost = unitCost * input.launchQuantity + (input.marketingBudget ?? 0);
    if (totalLaunchCost > budget * 1.2) {
      const overBy = Math.round(totalLaunchCost - budget);
      risks.push(r("fin_overstretch", "Budget-Überziehung", `Geplante Kosten übersteigen Budget um ${overBy.toLocaleString("de-DE")} €.`,
        "financial", "critical", overBy, 85, "Reduziere Launch-Menge oder finde günstigere Produktionsoptionen.", "2–5 Tage", { stepLink: 2 }));
    } else if (totalLaunchCost > budget * 0.85) {
      risks.push(r("fin_tight_budget", "Knappes Budget", "Weniger als 15% Reserve nach Launch-Kosten.",
        "financial", "high", Math.round(budget * 0.15), 60, "Halte mindestens 20% als Puffer zurück.", "1–2 Tage", { stepLink: 2 }));
    }
  }

  // Low budget
  if (budget > 0 && budget < 1000) {
    risks.push(r("fin_low_capital", "Sehr niedriges Startkapital", `Budget unter 1.000 € – extrem eingeschränkter Spielraum.`,
      "financial", "high", 3000, 75, "Starte mit Print-on-Demand oder Dropshipping, oder sammle mehr Kapital.", "1 Woche", { stepLink: 2 }));
  }

  // No marketing budget
  if ((input.marketingBudget ?? 0) <= 0 && budget > 2000) {
    risks.push(r("fin_no_marketing", "Kein Marketing-Budget", "Ohne Marketing-Invest wird die Kundenakquise sehr schwierig.",
      "financial", "medium", 3000, 55, "Plane 15–25% deines Budgets für Marketing ein.", "1 Tag", { stepLink: 2 }));
  }

  // ═══ REGULATORY RISKS ═════════════════════════════════════

  if (isEU) {
    // VerpackG
    risks.push(r("reg_verpackg", "VerpackG-Registrierung", "LUCID-Registrierung Pflicht – Bußgeld bis 200.000 €.",
      "regulatory", "critical", 200000, input.complianceScore && input.complianceScore > 50 ? 10 : 40,
      "Im LUCID-Register anmelden und Systembeteiligung abschließen.", "1–3 Tage",
      { regulatoryFlag: true, stepLink: 4 }));

    // Impressum
    if (input.openComplianceBlockers > 0) {
      risks.push(r("reg_compliance_blockers", `${input.openComplianceBlockers} Compliance-Blocker`, "Offene regulatorische Anforderungen können zum Verkaufsverbot führen.",
        "regulatory", "high", input.openComplianceBlockers * 5000, 60,
        "Alle offenen Compliance-Punkte in Phase 4 abarbeiten.", "3–7 Tage",
        { regulatoryFlag: true, stepLink: 4 }));
    }
  }

  // Category-specific regulatory
  if (cat.isCosmetics) {
    risks.push(r("reg_cosmetic_cpnp", "CPNP-Registrierung fehlt", "EU-Kosmetik ohne CPNP-Notifizierung = sofortiges Verkaufsverbot.",
      "regulatory", "critical", 50000, input.openComplianceBlockers > 0 ? 50 : 15,
      "Produkt im CPNP registrieren und Safety Assessment erstellen.", "2–4 Wochen",
      { regulatoryFlag: true, stepLink: 4 }));
    risks.push(r("reg_cosmetic_responsible", "Responsible Person (EU)", "Jedes Kosmetikprodukt braucht eine verantwortliche Person mit EU-Adresse.",
      "regulatory", "critical", 30000, 35,
      "Responsible Person benennen oder Dienstleister beauftragen.", "1–2 Wochen",
      { regulatoryFlag: true, stepLink: 4 }));
  }

  if (cat.isElectronics) {
    risks.push(r("reg_ce_marking", "CE-Kennzeichnung fehlt", "Elektronik ohne CE-Marking = Verkaufsverbot + Rückruf.",
      "regulatory", "critical", 100000, 40,
      "Konformitätsbewertung durchführen und Technische Dokumentation erstellen.", "4–8 Wochen",
      { regulatoryFlag: true, stepLink: 3 }));
    risks.push(r("reg_weee", "WEEE-Registrierung", "Elektrogeräte bei der stiftung ear registrieren.",
      "regulatory", "high", 100000, 30,
      "WEEE-Registrierung bei der stiftung ear beantragen.", "2–4 Wochen",
      { regulatoryFlag: true, stepLink: 4 }));
  }

  if (cat.isFood || cat.isSupplements) {
    risks.push(r("reg_food_labeling", "Lebensmittel-Kennzeichnung", "LMIV-konforme Etikettierung Pflicht – Bußgeld bis 50.000 €.",
      "regulatory", "critical", 50000, 45,
      "Nährwerttabelle, Allergene und Zutatenliste gemäß LMIV erstellen.", "1–2 Wochen",
      { regulatoryFlag: true, stepLink: 4 }));
  }

  if (cat.isSupplements) {
    risks.push(r("reg_health_claims", "Health Claims Verletzung", "Unzulässige gesundheitsbezogene Angaben – Abmahnung bis 25.000 €.",
      "regulatory", "critical", 25000, 55,
      "Nur zugelassene Health Claims gemäß VO 1924/2006 verwenden.", "3–5 Tage",
      { regulatoryFlag: true, stepLink: 4 }));
  }

  // ═══ SUPPLIER / OPERATIONAL RISKS ═════════════════════════

  if (!input.hasSupplierContract) {
    risks.push(r("sup_no_contract", "Kein Lieferantenvertrag", "Ohne Vertrag hast du keinen Schutz bei Qualitätsmängeln.",
      "supplier", "high", 8000, 50,
      "Lieferantenvertrag mit QC-Klauseln, Haftung und Lieferbedingungen.", "3–5 Tage",
      { stepLink: 3 }));
  }

  if (!input.hasSampleApproval) {
    risks.push(r("sup_no_sample", "Keine Musterfreigabe", "Produktion ohne geprüftes Muster = hohes Qualitätsrisiko.",
      "supplier", "high", 5000, 60,
      "Muster bestellen und schriftlich freigeben vor Großbestellung.", "1–3 Wochen",
      { stepLink: 3 }));
  }

  if (input.supplierRiskWarnings >= 3) {
    risks.push(r("sup_multiple_warnings", "Mehrere Lieferanten-Warnungen", `${input.supplierRiskWarnings} aktive Warnungen bei der Lieferkette.`,
      "supplier", "high", input.supplierRiskWarnings * 2000, 55,
      "Backup-Lieferant identifizieren und Qualitätskontrolle verschärfen.", "1–2 Wochen",
      { stepLink: 3 }));
  }

  // ═══ MARKET RISKS ═════════════════════════════════════════

  if (input.returnRate !== null && input.returnRate > 5) {
    const price = input.recommendedPrice ?? 0;
    const monthlyUnits = (input.launchQuantity ?? 0) / 12;
    const annualReturnCost = Math.round(price * monthlyUnits * (input.returnRate / 100) * 12);
    risks.push(r("mkt_returns", "Hohe Retourenquote", `${input.returnRate}% Retouren – geschätzter Verlust: ${annualReturnCost.toLocaleString("de-DE")} €/Jahr.`,
      "market", annualReturnCost > 5000 ? "high" : "medium", annualReturnCost, 70,
      "Produktbeschreibung verbessern, Sizing-Guides und Qualitätskontrolle.", "2–4 Wochen",
      { stepLink: 5 }));
  }

  // Break-even distance
  if (input.breakEvenUnits && input.breakEvenUnits > 500) {
    risks.push(r("mkt_breakeven_far", "Langer Weg zum Break-even", `${input.breakEvenUnits} Einheiten bis zum Break-even – hohe Kapitalbindung.`,
      "market", "medium", 3000, 45,
      "Preis erhöhen oder Kosten senken, um Break-even zu beschleunigen.", "1–2 Wochen",
      { stepLink: 2 }));
  }

  // ═══ SCORING ══════════════════════════════════════════════

  // Sort by weighted score
  risks.sort((a, b) => b.weightedScore - a.weightedScore);

  const totalExposure = risks.reduce((sum, r) => sum + r.euroImpact, 0);
  const weightedExposure = risks.reduce((sum, r) => sum + r.weightedScore, 0);

  // Risk by category
  const riskByCategory: Record<RiskCategory, number> = {
    financial: 0, regulatory: 0, operational: 0, market: 0, supplier: 0,
  };
  risks.forEach(risk => {
    riskByCategory[risk.category] += risk.weightedScore;
  });

  // Overall score (0–100, higher = more risk)
  const criticalCount = risks.filter(r => r.severity === "critical").length;
  const highCount = risks.filter(r => r.severity === "high").length;
  let overallRiskScore = Math.min(100, criticalCount * 20 + highCount * 10 + risks.length * 3);

  // Adjust based on weighted exposure
  if (weightedExposure > 50000) overallRiskScore = Math.min(100, overallRiskScore + 15);
  else if (weightedExposure > 20000) overallRiskScore = Math.min(100, overallRiskScore + 8);

  const riskLevel: RiskEngineResult["riskLevel"] =
    overallRiskScore >= 70 ? "critical" :
    overallRiskScore >= 45 ? "high" :
    overallRiskScore >= 25 ? "medium" : "low";

  return {
    overallRiskScore,
    totalExposure,
    weightedExposure,
    risks,
    riskByCategory,
    topRisk: risks[0] ?? null,
    riskLevel,
  };
}
