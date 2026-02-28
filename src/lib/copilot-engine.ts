// Rule-based Founder Copilot – instant deterministic recommendations

export interface CopilotContext {
  margin: number;
  capitalSafetyMonths: number;
  riskScore: number; // 0–100 from supplier risk
  monthlyBurnRate: number;
  returnRate: number;
  launchProbability: number;
  moq: number;
  budget: number;
  productionCost: number;
  targetPrice: number;
}

export interface CopilotRecommendation {
  id: string;
  category: "pricing" | "moq" | "budget" | "launch" | "risk" | "cashflow";
  priority: "high" | "medium" | "low";
  title: string;
  reasoning: string;
  action: string;
  impact: string;
  confidence: number; // 0–100
}

export function generateRecommendations(ctx: CopilotContext): CopilotRecommendation[] {
  const recs: CopilotRecommendation[] = [];

  // MOQ Risk
  const moqCapitalRatio = (ctx.moq * ctx.productionCost) / ctx.budget;
  if (moqCapitalRatio > 0.6) {
    recs.push({
      id: "moq_high",
      category: "moq",
      priority: "high",
      title: "MOQ reduzieren",
      reasoning: `Deine MOQ bindet ${Math.round(moqCapitalRatio * 100)}% deines Kapitals. Das erhöht das Insolvenzrisiko erheblich.`,
      action: `Verhandle die MOQ um 15–30% nach unten oder suche alternative Lieferanten mit niedrigerer MOQ.`,
      impact: `Eine Reduktion um 15% senkt dein Insolvenzrisiko um ~${Math.round(moqCapitalRatio * 28)}%.`,
      confidence: 85,
    });
  }

  // Margin Warning
  if (ctx.margin < 25) {
    recs.push({
      id: "margin_low",
      category: "pricing",
      priority: "high",
      title: "Marge erhöhen",
      reasoning: `Mit ${Math.round(ctx.margin)}% Marge hast du kaum Puffer für unerwartete Kosten oder Retouren.`,
      action: `Erhöhe den Preis um 10–15% oder senke Produktionskosten durch Verhandlung.`,
      impact: `Jeder Prozentpunkt Marge erhöht deinen monatlichen Profit um ~€${Math.round(ctx.targetPrice * 0.01 * ctx.moq / 6)}.`,
      confidence: 90,
    });
  }

  // Capital Safety
  if (ctx.capitalSafetyMonths < 4) {
    recs.push({
      id: "capital_low",
      category: "cashflow",
      priority: "high",
      title: "Kapitalpuffer aufstocken",
      reasoning: `Dein Runway von ${ctx.capitalSafetyMonths.toFixed(1)} Monaten ist kritisch niedrig.`,
      action: `Reduziere Marketing-Ausgaben um 20% oder sichere zusätzliches Kapital.`,
      impact: `Ein zusätzlicher Monat Runway reduziert das Scheitern-Risiko um ~15%.`,
      confidence: 88,
    });
  }

  // Marketing Budget
  if (ctx.monthlyBurnRate > 0 && ctx.budget > 0) {
    const burnRatio = ctx.monthlyBurnRate / ctx.budget;
    if (burnRatio > 0.15) {
      recs.push({
        id: "burn_high",
        category: "budget",
        priority: "medium",
        title: "Burn Rate reduzieren",
        reasoning: `Deine monatliche Burn Rate beträgt ${Math.round(burnRatio * 100)}% deines Budgets.`,
        action: `Fokussiere Marketing auf organische Kanäle und reduziere Paid Ads in den ersten 3 Monaten.`,
        impact: `Eine 20% Reduktion verlängert deinen Runway um ~${Math.round(ctx.capitalSafetyMonths * 0.25 * 10) / 10} Monate.`,
        confidence: 75,
      });
    }
  }

  // Return Rate
  if (ctx.returnRate > 8) {
    recs.push({
      id: "returns_high",
      category: "risk",
      priority: "medium",
      title: "Retourenquote senken",
      reasoning: `${ctx.returnRate}% Retouren kosten dich monatlich ~€${Math.round(ctx.targetPrice * ctx.returnRate / 100 * ctx.moq / 6)}.`,
      action: `Verbessere Produktbeschreibungen, Fotos und Größentabellen. Biete Live-Chat Support.`,
      impact: `Jeder Prozentpunkt weniger Retouren spart ~€${Math.round(ctx.targetPrice * 0.01 * ctx.moq / 6)}/Monat.`,
      confidence: 72,
    });
  }

  // Launch Timing
  if (ctx.launchProbability >= 65) {
    recs.push({
      id: "launch_go",
      category: "launch",
      priority: "low",
      title: "Launch-Bereitschaft hoch",
      reasoning: `Deine Launch-Wahrscheinlichkeit liegt bei ${ctx.launchProbability}% – gute Voraussetzungen.`,
      action: `Starte mit einer kleinen Testcharge und skaliere basierend auf Early Feedback.`,
      impact: `Ein schneller Markteintritt sichert First-Mover-Vorteil in deiner Nische.`,
      confidence: 80,
    });
  } else if (ctx.launchProbability < 40) {
    recs.push({
      id: "launch_wait",
      category: "launch",
      priority: "high",
      title: "Launch verzögern",
      reasoning: `Mit ${ctx.launchProbability}% Launch-Wahrscheinlichkeit ist das Risiko zu hoch.`,
      action: `Optimiere zuerst Marge, Kapitalpuffer und Lieferantenauswahl.`,
      impact: `3 Monate Vorbereitung können das Erfolgsrisiko um 40% senken.`,
      confidence: 82,
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}
