// ─── Reality Check Engine v2 ──────────────────────────────────
// Deterministic, rule-based feasibility assessment.
// No LLM. No AI. Just math and business logic.

export interface RealityCheckInput {
  unitCost: number;
  recommendedPrice: number;
  margin: number;
  marketingBudget: number;
  breakEvenUnits: number;
  budget: string;
}

export type RiskSeverity = "critical" | "warning" | "info";

export interface Risk {
  key: string;
  severity: RiskSeverity;
  message: string;
  fix: string;
}

export interface RealityCheckResult {
  feasibilityScore: number;
  status: "safe" | "risky" | "critical";
  risks: Risk[];
  whyItMatters: string;
  recommendedFix: string;
  topRisk: string;
}

const budgetNumeric: Record<string, number> = {
  "<1k": 800,
  "1k-5k": 3000,
  "5k-15k": 10000,
  "15k+": 20000,
};

export function evaluateRealityCheck(input: RealityCheckInput): RealityCheckResult {
  const { unitCost, recommendedPrice, margin, marketingBudget, breakEvenUnits, budget } = input;
  const budgetValue = budgetNumeric[budget] ?? 3000;
  const risks: Risk[] = [];
  let score = 100;

  // ── Rule 1: Margin ──
  if (margin < 25) {
    risks.push({ key: "margin_critical", severity: "critical", message: "Marge unter 25 % – kaum Spielraum für Fehler oder Rabatte.", fix: "Erhöhe deinen Verkaufspreis oder senke die Stückkosten. Ziel: mindestens 40 % Marge." });
    score -= 30;
  } else if (margin < 35) {
    risks.push({ key: "margin_low", severity: "warning", message: "Marge unter 35 % – wenig Puffer für unerwartete Kosten.", fix: "Versuche die Marge auf über 40 % zu bringen, um genug Spielraum zu haben." });
    score -= 15;
  }

  // ── Rule 2: Pricing realism ──
  const ratio = recommendedPrice / (unitCost || 1);
  const hasHealthyMarginAndBudget = margin > 40 && budgetValue >= 1000;

  if (ratio < 1.8) {
    risks.push({ key: "underpriced_critical", severity: "critical", message: "Preis deckt kaum die Kosten – nicht nachhaltig verkaufbar.", fix: "Dein Preis ist zu nah an den Kosten. Erhöhe den Preis oder senke die Produktionskosten." });
    score -= 25;
  } else if (ratio < 2.0 && !hasHealthyMarginAndBudget) {
    risks.push({ key: "underpriced_warning", severity: "warning", message: `Preis-Kosten-Ratio ${ratio.toFixed(2)}x – schwer profitabel zu skalieren.`, fix: "Strebe eine Ratio von mindestens 2.2x an, um nach Abzug aller Kosten profitabel zu bleiben." });
    score -= 12;
  } else if (ratio < 2.2) {
    risks.push({ key: "underpriced_info", severity: "info", message: `Preis-Kosten-Ratio ${ratio.toFixed(2)}x – akzeptabel, aber knapp.`, fix: "Langfristig lohnt es sich, die Ratio über 2.2x zu bringen." });
    score -= 5;
  }

  // ── Rule 3: MOQ / Budget pressure ──
  const estimatedMoqCost = unitCost * Math.max(breakEvenUnits, 50);
  const moqBudgetRatio = estimatedMoqCost / (budgetValue || 1);
  if (moqBudgetRatio > 0.7) {
    risks.push({ key: "moq_critical", severity: "critical", message: "Mindestbestellmenge frisst über 70 % des Budgets – kein Spielraum.", fix: "Suche Lieferanten mit niedrigerem MOQ oder starte mit weniger Varianten." });
    score -= 25;
  } else if (moqBudgetRatio > 0.5) {
    risks.push({ key: "moq_warning", severity: "warning", message: "MOQ-Kosten über 50 % des Budgets – Marketing und Puffer fehlen.", fix: "Versuche die MOQ-Kosten unter 50 % deines Budgets zu halten." });
    score -= 12;
  } else if (moqBudgetRatio > 0.3) {
    risks.push({ key: "moq_info", severity: "info", message: "MOQ-Kosten bei über 30 % des Budgets – im Auge behalten.", fix: "Noch vertretbar, aber plane Puffer für Marketing und Unvorhergesehenes ein." });
    score -= 5;
  }

  // ── Rule 4: Overstretch ──
  const totalStartCost = estimatedMoqCost + marketingBudget;
  if (totalStartCost > budgetValue * 1.2) {
    risks.push({ key: "overstretch", severity: "critical", message: "Gesamtkosten übersteigen das Budget deutlich – Risiko einer Überinvestition.", fix: "Reduziere die geplante Startmenge oder finde günstigere Produktionsoptionen." });
    score -= 20;
  }

  // ── Rule 5: Budget constraint ──
  if (budgetValue < 250) {
    risks.push({ key: "low_budget_critical", severity: "critical", message: "Budget unter 250 € – Produktstart extrem schwierig.", fix: "Sammle mehr Startkapital oder teste mit Print-on-Demand / Dropshipping." });
    score -= 20;
  } else if (budgetValue < 500) {
    risks.push({ key: "low_budget_warning", severity: "warning", message: "Budget unter 500 € – Startumfang stark begrenzt.", fix: "Starte mit max. 25–50 Einheiten und einem einzigen Vertriebskanal." });
    score -= 10;
  }

  // ── Rule 6: Break-even distance ──
  if (breakEvenUnits > 500) {
    risks.push({ key: "high_breakeven", severity: "warning", message: "Über 500 Einheiten bis zum Break-Even – langer Weg zur Rentabilität.", fix: "Prüfe ob du den Break-Even durch höhere Preise oder niedrigere Kosten schneller erreichst." });
    score -= 10;
  }

  // ── Rule 7: No marketing ──
  if (marketingBudget <= 0 && unitCost > 0) {
    if (budgetValue >= 1000) {
      risks.push({ key: "no_marketing_warning", severity: "warning", message: "Kein Marketing-Budget eingeplant – wie sollen Kunden dich finden?", fix: "Plane mindestens 15–20 % deines Budgets für Marketing ein." });
      score -= 10;
    } else {
      risks.push({ key: "no_marketing_info", severity: "info", message: "Kein Marketing-Budget – bei kleinem Budget kann Organic-Marketing reichen.", fix: "Nutze Social Media und persönliches Netzwerk für den Start." });
      score -= 5;
    }
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Sort by severity
  const severityOrder: Record<RiskSeverity, number> = { critical: 0, warning: 1, info: 2 };
  risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // ── Status logic v2 ──
  const hasCritical = risks.some((r) => r.severity === "critical");
  const warningCount = risks.filter((r) => r.severity === "warning").length;

  let status: "safe" | "risky" | "critical";
  if (hasCritical) {
    status = "critical";
  } else if (warningCount >= 2) {
    status = "risky";
  } else if (warningCount === 1 && score < 75) {
    status = "risky";
  } else {
    status = "safe";
  }

  const topRisk = risks.length > 0 ? risks[0].message : "Keine kritischen Risiken erkannt.";
  const recommendedFix = risks.length > 0 ? risks[0].fix : "Dein Setup sieht solide aus. Gehe weiter zur Produktionsplanung.";
  const whyItMatters = getWhyItMatters(status);

  return { feasibilityScore: score, status, risks, whyItMatters, recommendedFix, topRisk };
}

function getWhyItMatters(status: "safe" | "risky" | "critical"): string {
  if (status === "critical") {
    return "Dein aktuelles Setup hat ernsthafte Schwachstellen. Ohne Anpassungen riskierst du, Geld zu verlieren, bevor du dein Produkt überhaupt auf den Markt bringst.";
  }
  if (status === "risky") {
    return "Es gibt Stellschrauben, die du drehen solltest. Dein Plan kann funktionieren, aber das Risiko ist höher als nötig.";
  }
  return "Dein Setup ist finanziell stabil. Du hast genug Puffer für unerwartete Kosten und kannst selbstbewusst den nächsten Schritt gehen.";
}
