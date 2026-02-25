// ─── Reality Check Engine ─────────────────────────────────────
// Deterministic, rule-based feasibility assessment.
// No LLM. No AI. Just math and business logic.

export interface RealityCheckInput {
  unitCost: number;         // production + packaging + shipping
  recommendedPrice: number;
  margin: number;           // percentage
  marketingBudget: number;
  breakEvenUnits: number;
  budget: string;           // "<1k" | "1k-5k" | "5k-15k" | "15k+"
}

export interface RealityCheckResult {
  feasibilityScore: number;
  status: "safe" | "risky" | "critical";
  keyRisks: { id: string; label: string; severity: "low" | "medium" | "high" }[];
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

  const risks: { id: string; label: string; severity: "low" | "medium" | "high" }[] = [];
  let score = 100;

  // ── Rule 1: Margin check ──
  if (margin < 15) {
    risks.push({ id: "margin_critical", label: "Marge unter 15 % – kaum Spielraum für Fehler oder Rabatte.", severity: "high" });
    score -= 30;
  } else if (margin < 25) {
    risks.push({ id: "margin_low", label: "Marge unter 25 % – lässt wenig Puffer für unerwartete Kosten.", severity: "medium" });
    score -= 15;
  }

  // ── Rule 2: Pricing realism ──
  const priceToUnitRatio = recommendedPrice / (unitCost || 1);
  if (priceToUnitRatio < 1.8) {
    risks.push({ id: "underpriced_critical", label: "Preis deckt kaum die Kosten – nicht nachhaltig verkaufbar.", severity: "high" });
    score -= 25;
  } else if (priceToUnitRatio < 2.2) {
    risks.push({ id: "underpriced", label: "Preis unter 2,2× Stückkosten – schwer profitabel zu skalieren.", severity: "medium" });
    score -= 12;
  }

  // ── Rule 3: MOQ / Budget pressure ──
  const estimatedMoqCost = unitCost * Math.max(breakEvenUnits, 50);
  const moqBudgetRatio = estimatedMoqCost / (budgetValue || 1);
  if (moqBudgetRatio > 0.85) {
    risks.push({ id: "moq_critical", label: "Mindestbestellmenge frisst über 85 % des Budgets – kein Spielraum.", severity: "high" });
    score -= 25;
  } else if (moqBudgetRatio > 0.7) {
    risks.push({ id: "moq_tight", label: "MOQ-Kosten über 70 % des Budgets – Marketing und Puffer fehlen.", severity: "medium" });
    score -= 12;
  }

  // ── Rule 4: Overstretch risk ──
  const totalStartCost = estimatedMoqCost + marketingBudget;
  if (totalStartCost > budgetValue * 1.2) {
    risks.push({ id: "overstretch", label: "Gesamtkosten übersteigen das Budget deutlich – Risiko einer Überinvestition.", severity: "high" });
    score -= 20;
  }

  // ── Rule 5: Budget constraint ──
  if (budgetValue < 1500) {
    risks.push({ id: "low_budget", label: "Budget unter 1.500 € – Startumfang stark begrenzt.", severity: "low" });
    score -= 8;
  }

  // ── Rule 6: Break-even distance ──
  if (breakEvenUnits > 500) {
    risks.push({ id: "high_breakeven", label: "Über 500 Einheiten bis zum Break-Even – langer Weg zur Rentabilität.", severity: "medium" });
    score -= 10;
  }

  // ── Rule 7: No marketing budget ──
  if (marketingBudget <= 0 && unitCost > 0) {
    risks.push({ id: "no_marketing", label: "Kein Marketing-Budget eingeplant – wie sollen Kunden dich finden?", severity: "medium" });
    score -= 10;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine status
  const status: "safe" | "risky" | "critical" =
    score >= 70 ? "safe" : score >= 40 ? "risky" : "critical";

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Generate top risk and recommendation
  const topRisk = risks.length > 0
    ? risks[0].label
    : "Keine kritischen Risiken erkannt.";

  const recommendedFix = getRecommendedFix(risks, margin, moqBudgetRatio, budgetValue);
  const whyItMatters = getWhyItMatters(status, score);

  return { feasibilityScore: score, status, keyRisks: risks, whyItMatters, recommendedFix, topRisk };
}

function getRecommendedFix(
  risks: { id: string }[],
  margin: number,
  moqRatio: number,
  budget: number
): string {
  if (risks.length === 0) return "Dein Setup sieht solide aus. Gehe weiter zur Produktionsplanung.";

  const topId = risks[0].id;
  switch (topId) {
    case "margin_critical":
    case "margin_low":
      return `Erhöhe deinen Verkaufspreis oder senke die Stückkosten. Ziel: mindestens 40 % Marge für genug Puffer.`;
    case "underpriced_critical":
    case "underpriced":
      return "Dein Preis ist zu nah an den Kosten. Prüfe, ob du Produktionskosten senken oder den Preis anheben kannst.";
    case "moq_critical":
    case "moq_tight":
      return "Suche nach Lieferanten mit niedrigerem MOQ oder starte mit einer kleineren Produktlinie.";
    case "overstretch":
      return "Reduziere die geplante Startmenge oder finde günstigere Produktionsoptionen.";
    case "low_budget":
      return `Mit ${budget} € Budget: Starte mit max. 50–100 Einheiten und einem einzigen Vertriebskanal.`;
    case "no_marketing":
      return "Plane mindestens 15–20 % deines Budgets für Marketing ein – ohne Sichtbarkeit kein Umsatz.";
    case "high_breakeven":
      return "Prüfe, ob du den Break-Even durch höhere Preise oder niedrigere Kosten schneller erreichst.";
    default:
      return "Überprüfe deine Zahlen noch einmal und passe kritische Werte an.";
  }
}

function getWhyItMatters(status: "safe" | "risky" | "critical", score: number): string {
  if (status === "critical") {
    return "Dein aktuelles Setup hat ernsthafte Schwachstellen. Ohne Anpassungen riskierst du, Geld zu verlieren, bevor du dein Produkt überhaupt auf den Markt bringst.";
  }
  if (status === "risky") {
    return "Es gibt Stellschrauben, die du drehen solltest. Dein Plan kann funktionieren, aber das Risiko ist höher als nötig.";
  }
  return "Dein Setup ist finanziell stabil. Du hast genug Puffer für unerwartete Kosten und kannst selbstbewusst den nächsten Schritt gehen.";
}
