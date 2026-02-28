// ─── Business Recovery & Survival Engine ────────────────────────

export interface BusinessMetrics {
  conversionRate: number; // %
  margin: number; // %
  cashRunwayMonths: number;
  returnRate: number; // %
  monthlyRevenue: number;
  monthlyCosts: number;
  inventoryValue: number;
  sellingPrice: number;
  unitCost: number;
}

// ─── PART 1: Crisis Detection ───────────────────────────────────

export interface RiskAlert {
  id: string;
  category: "conversion" | "margin" | "runway" | "returns";
  severity: "warning" | "critical";
  label: string;
  description: string;
  value: number;
  threshold: number;
}

export function detectCrisis(metrics: BusinessMetrics): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  if (metrics.conversionRate < 2) {
    alerts.push({
      id: "low_conversion",
      category: "conversion",
      severity: metrics.conversionRate < 1 ? "critical" : "warning",
      label: "Niedrige Conversion Rate",
      description: `Deine Conversion Rate liegt bei ${metrics.conversionRate}%. Branchendurchschnitt ist 2-4%.`,
      value: metrics.conversionRate,
      threshold: 2,
    });
  }

  if (metrics.margin < 40) {
    alerts.push({
      id: "low_margin",
      category: "margin",
      severity: metrics.margin < 25 ? "critical" : "warning",
      label: "Marge unter Zielwert",
      description: `Deine Marge liegt bei ${metrics.margin}%. Für nachhaltiges Wachstum werden mind. 40% empfohlen.`,
      value: metrics.margin,
      threshold: 40,
    });
  }

  if (metrics.cashRunwayMonths < 3) {
    alerts.push({
      id: "low_runway",
      category: "runway",
      severity: metrics.cashRunwayMonths < 1.5 ? "critical" : "warning",
      label: "Kritischer Cash Runway",
      description: `Dein Cash Runway beträgt nur ${metrics.cashRunwayMonths.toFixed(1)} Monate. Mindestens 3 Monate werden empfohlen.`,
      value: metrics.cashRunwayMonths,
      threshold: 3,
    });
  }

  if (metrics.returnRate > 12) {
    alerts.push({
      id: "high_returns",
      category: "returns",
      severity: metrics.returnRate > 20 ? "critical" : "warning",
      label: "Hohe Retourenquote",
      description: `Deine Retourenquote liegt bei ${metrics.returnRate}%. Über 12% gefährdet deine Profitabilität.`,
      value: metrics.returnRate,
      threshold: 12,
    });
  }

  return alerts;
}

// ─── PART 2: Recovery Decision Tree ─────────────────────────────

export interface RecoveryAction {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedImpact: string;
  timeframe: string;
}

export type RecoveryIssue = "low_traffic" | "low_conversion" | "low_margin" | "high_returns" | "high_capital_lock";

const recoveryPlans: Record<RecoveryIssue, RecoveryAction[]> = {
  low_traffic: [
    { id: "lt1", title: "SEO-Grundlagen optimieren", description: "Meta-Tags, Alt-Texte und Produktbeschreibungen für Suchmaschinen optimieren.", priority: "high", estimatedImpact: "+30-50% organischer Traffic in 3 Monaten", timeframe: "1-2 Wochen" },
    { id: "lt2", title: "Social Media Ads starten", description: "Gezielte Meta/Instagram Ads mit A/B-Testing für deine Zielgruppe.", priority: "high", estimatedImpact: "+200-500 Besucher/Monat", timeframe: "Sofort" },
    { id: "lt3", title: "Influencer-Kooperationen", description: "Micro-Influencer (5-20K Follower) in deiner Nische kontaktieren.", priority: "medium", estimatedImpact: "+100-300 Besucher pro Kooperation", timeframe: "2-4 Wochen" },
    { id: "lt4", title: "Content-Marketing starten", description: "Blog-Artikel und Ratgeber zu deinem Produktbereich erstellen.", priority: "medium", estimatedImpact: "Langfristig +50% organischer Traffic", timeframe: "1-3 Monate" },
    { id: "lt5", title: "Google Shopping aktivieren", description: "Produktfeed einrichten und Shopping-Anzeigen schalten.", priority: "low", estimatedImpact: "+15-25% kaufbereiter Traffic", timeframe: "1 Woche" },
  ],
  low_conversion: [
    { id: "lc1", title: "Produktseite optimieren", description: "Bessere Fotos, Video-Reviews und klare Nutzenaussagen hinzufügen.", priority: "high", estimatedImpact: "+0.5-1.5% Conversion Rate", timeframe: "1 Woche" },
    { id: "lc2", title: "Trust-Elemente einbauen", description: "Kundenbewertungen, Gütesiegel und Garantie-Badges prominent platzieren.", priority: "high", estimatedImpact: "+0.3-0.8% Conversion Rate", timeframe: "2-3 Tage" },
    { id: "lc3", title: "Checkout vereinfachen", description: "Weniger Schritte, Gast-Checkout und Express-Zahlungen anbieten.", priority: "medium", estimatedImpact: "-15-30% Warenkorbabbrecher", timeframe: "1 Woche" },
    { id: "lc4", title: "Retargeting einrichten", description: "Besucher mit dynamischen Anzeigen zurückholen.", priority: "medium", estimatedImpact: "+10-20% Wiederkäufer", timeframe: "3-5 Tage" },
    { id: "lc5", title: "Exit-Intent Popups", description: "Rabattcode oder kostenloser Versand für Abbrecher anbieten.", priority: "low", estimatedImpact: "+2-5% der Abbrecher konvertieren", timeframe: "1 Tag" },
  ],
  low_margin: [
    { id: "lm1", title: "Preise strategisch erhöhen", description: "5-10% Preiserhöhung mit verbessertem Wertversprechen testen.", priority: "high", estimatedImpact: "+5-10% Marge direkt", timeframe: "Sofort" },
    { id: "lm2", title: "Lieferantenverhandlung", description: "Bei höheren Abnahmemengen bessere Einkaufspreise verhandeln.", priority: "high", estimatedImpact: "-10-20% Einkaufskosten", timeframe: "2-4 Wochen" },
    { id: "lm3", title: "Verpackungskosten senken", description: "Günstigere Verpackungslösung ohne Qualitätsverlust finden.", priority: "medium", estimatedImpact: "-0.50-2€ pro Einheit", timeframe: "2-3 Wochen" },
    { id: "lm4", title: "Upselling & Cross-Selling", description: "Ergänzende Produkte oder Premium-Varianten anbieten.", priority: "medium", estimatedImpact: "+15-25% Durchschnitts-Bestellwert", timeframe: "1-2 Wochen" },
    { id: "lm5", title: "Fulfillment optimieren", description: "Versandkosten vergleichen und günstigere Logistikpartner prüfen.", priority: "low", estimatedImpact: "-0.50-1.50€ pro Sendung", timeframe: "1-2 Wochen" },
  ],
  high_returns: [
    { id: "hr1", title: "Produktbeschreibung präzisieren", description: "Genaue Maße, Materialien und realistische Fotos verwenden.", priority: "high", estimatedImpact: "-20-40% Retouren", timeframe: "2-3 Tage" },
    { id: "hr2", title: "Qualitätskontrolle verschärfen", description: "Stichproben-Tests vor Versand und bei Lieferanteneingang einführen.", priority: "high", estimatedImpact: "-30-50% defektbedingte Retouren", timeframe: "1-2 Wochen" },
    { id: "hr3", title: "Größenberatung hinzufügen", description: "Interaktive Größentabellen oder Fit-Finder einbauen.", priority: "medium", estimatedImpact: "-25-35% größenbedingte Retouren", timeframe: "1 Woche" },
    { id: "hr4", title: "Kundenfeedback analysieren", description: "Retourengründe systematisch erfassen und Muster erkennen.", priority: "medium", estimatedImpact: "Datenbasierte Optimierung", timeframe: "Laufend" },
    { id: "hr5", title: "Verpackung verbessern", description: "Besseren Versandschutz und Unboxing-Erlebnis bieten.", priority: "low", estimatedImpact: "-10-15% Transportschäden", timeframe: "2-3 Wochen" },
  ],
  high_capital_lock: [
    { id: "hc1", title: "MOQ reduzieren", description: "Kleinere Mindestbestellmengen mit Lieferanten verhandeln.", priority: "high", estimatedImpact: "-30-50% gebundenes Kapital", timeframe: "2-4 Wochen" },
    { id: "hc2", title: "Dropshipping testen", description: "Für neue Varianten Dropshipping nutzen, um Kapitalbindung zu vermeiden.", priority: "medium", estimatedImpact: "0€ Vorab-Investition", timeframe: "1-2 Wochen" },
    { id: "hc3", title: "Pre-Order Modell", description: "Vorbestellungen nutzen, um Nachfrage vor Produktion zu validieren.", priority: "medium", estimatedImpact: "Risikominimierung bei Neuware", timeframe: "2-3 Wochen" },
    { id: "hc4", title: "Bestandsmanagement optimieren", description: "Automatische Nachbestellpunkte basierend auf Verkaufsdaten setzen.", priority: "high", estimatedImpact: "-20-30% Überbestände", timeframe: "1 Woche" },
    { id: "hc5", title: "Zahlungsziele verhandeln", description: "Net-30 oder Net-60 Zahlungsziele mit Lieferanten vereinbaren.", priority: "low", estimatedImpact: "+30-60 Tage Cashflow-Puffer", timeframe: "2-4 Wochen" },
  ],
};

export function getRecoveryPlan(issue: RecoveryIssue): RecoveryAction[] {
  return recoveryPlans[issue] ?? [];
}

// ─── PART 3: Liquidation Strategy ───────────────────────────────

export interface LiquidationScenario {
  strategy: string;
  description: string;
  pricePerUnit: number;
  estimatedUnits: number;
  grossRevenue: number;
  capitalRecovery: number; // % of inventory value recovered
  timeframe: string;
}

export function calculateLiquidation(
  inventoryValue: number,
  totalUnits: number,
  currentPrice: number,
  unitCost: number,
): LiquidationScenario[] {
  if (totalUnits <= 0 || currentPrice <= 0) return [];

  const scenarios: LiquidationScenario[] = [
    {
      strategy: "Preissenkung (-30%)",
      description: "Moderater Rabatt zur schnellen Lagerräumung.",
      pricePerUnit: currentPrice * 0.7,
      estimatedUnits: Math.round(totalUnits * 0.85),
      grossRevenue: currentPrice * 0.7 * Math.round(totalUnits * 0.85),
      capitalRecovery: Math.round(((currentPrice * 0.7 * Math.round(totalUnits * 0.85)) / inventoryValue) * 100),
      timeframe: "2-4 Wochen",
    },
    {
      strategy: "Bundle-Strategie (2 für 1.5x)",
      description: "Zwei Produkte zum 1.5-fachen Einzelpreis bündeln.",
      pricePerUnit: (currentPrice * 1.5) / 2,
      estimatedUnits: totalUnits,
      grossRevenue: (currentPrice * 1.5 / 2) * totalUnits,
      capitalRecovery: Math.round(((currentPrice * 1.5 / 2 * totalUnits) / inventoryValue) * 100),
      timeframe: "3-6 Wochen",
    },
    {
      strategy: "Wholesale (B2B, -50%)",
      description: "Großhandelsverkauf an Einzelhändler oder Reseller.",
      pricePerUnit: currentPrice * 0.5,
      estimatedUnits: totalUnits,
      grossRevenue: currentPrice * 0.5 * totalUnits,
      capitalRecovery: Math.round(((currentPrice * 0.5 * totalUnits) / inventoryValue) * 100),
      timeframe: "1-2 Wochen",
    },
    {
      strategy: "Flash Sale (-50%, 48h)",
      description: "Zeitlich begrenzter Ausverkauf mit Dringlichkeit.",
      pricePerUnit: currentPrice * 0.5,
      estimatedUnits: Math.round(totalUnits * 0.7),
      grossRevenue: currentPrice * 0.5 * Math.round(totalUnits * 0.7),
      capitalRecovery: Math.round(((currentPrice * 0.5 * Math.round(totalUnits * 0.7)) / inventoryValue) * 100),
      timeframe: "48 Stunden",
    },
  ];

  return scenarios;
}

// ─── PART 4: Pivot Engine ───────────────────────────────────────

export interface PivotSuggestion {
  id: string;
  title: string;
  description: string;
  effortLevel: "low" | "medium" | "high";
  potentialImpact: string;
  category: "audience" | "positioning" | "packaging" | "cost" | "model";
}

export function generatePivotSuggestions(metrics: BusinessMetrics): PivotSuggestion[] {
  const suggestions: PivotSuggestion[] = [];

  // Always include core pivots
  suggestions.push({
    id: "p_audience",
    title: "Neue Zielgruppe ansprechen",
    description: "Analysiere, ob dein Produkt für eine andere Zielgruppe attraktiver ist (z.B. B2B statt B2C, andere Altersgruppe).",
    effortLevel: "medium",
    potentialImpact: "Neue Umsatzquelle ohne Produktänderung",
    category: "audience",
  });

  suggestions.push({
    id: "p_repositioning",
    title: "Positionierung ändern",
    description: "Reposioniere dein Produkt als Premium- oder Budget-Variante basierend auf deiner aktuellen Marge.",
    effortLevel: "low",
    potentialImpact: metrics.margin < 30 ? "Premium-Positionierung kann Marge auf 50%+ steigern" : "Budget-Positionierung kann Volumen 3x steigern",
    category: "positioning",
  });

  suggestions.push({
    id: "p_packaging",
    title: "Verpackung vereinfachen",
    description: "Reduziere die Verpackungskomplexität um Kosten zu senken und den Versandprozess zu beschleunigen.",
    effortLevel: "low",
    potentialImpact: "-15-25% Verpackungskosten pro Einheit",
    category: "packaging",
  });

  if (metrics.margin < 40) {
    suggestions.push({
      id: "p_cost",
      title: "Kostenstruktur radikal überarbeiten",
      description: "Alternative Materialien, Lieferanten aus anderen Regionen oder vereinfachte Produktvarianten prüfen.",
      effortLevel: "high",
      potentialImpact: "-20-40% Produktionskosten möglich",
      category: "cost",
    });
  }

  suggestions.push({
    id: "p_subscription",
    title: "Abo-Modell testen",
    description: "Wiederkehrende Bestellungen mit Rabatt anbieten (z.B. monatliche Lieferung, Refill-Service).",
    effortLevel: "medium",
    potentialImpact: "+40-60% Customer Lifetime Value",
    category: "model",
  });

  return suggestions;
}

// ─── PART 5: Survival Score ─────────────────────────────────────

export interface SurvivalAnalysis {
  survivalScore: number; // 0-100
  bankruptcyRisk: number; // 0-100%
  recoveryProbability: number; // 0-100%
  recommendedPath: "optimize" | "pivot" | "liquidate" | "stabilize";
  pathLabel: string;
  pathDescription: string;
}

export function calculateSurvivalScore(metrics: BusinessMetrics): SurvivalAnalysis {
  // Weighted scoring model
  let score = 50; // Start at neutral

  // Margin impact (weight: 30)
  if (metrics.margin >= 50) score += 20;
  else if (metrics.margin >= 40) score += 15;
  else if (metrics.margin >= 30) score += 5;
  else if (metrics.margin >= 20) score -= 5;
  else score -= 15;

  // Cash runway impact (weight: 30)
  if (metrics.cashRunwayMonths >= 6) score += 20;
  else if (metrics.cashRunwayMonths >= 3) score += 10;
  else if (metrics.cashRunwayMonths >= 1.5) score -= 5;
  else score -= 20;

  // Conversion impact (weight: 20)
  if (metrics.conversionRate >= 4) score += 10;
  else if (metrics.conversionRate >= 2) score += 5;
  else if (metrics.conversionRate >= 1) score -= 5;
  else score -= 10;

  // Return rate impact (weight: 20)
  if (metrics.returnRate <= 5) score += 10;
  else if (metrics.returnRate <= 12) score += 5;
  else if (metrics.returnRate <= 20) score -= 5;
  else score -= 15;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Derive probabilities
  const bankruptcyRisk = Math.max(0, Math.min(100, Math.round(100 - score * 1.1)));
  const recoveryProbability = Math.max(0, Math.min(100, Math.round(score * 0.9 + 10)));

  // Determine recommended path
  let recommendedPath: SurvivalAnalysis["recommendedPath"];
  let pathLabel: string;
  let pathDescription: string;

  if (score >= 70) {
    recommendedPath = "optimize";
    pathLabel = "Optimieren & Skalieren";
    pathDescription = "Dein Business ist grundsätzlich gesund. Fokussiere dich auf Optimierung der bestehenden Prozesse und vorsichtiges Skalieren.";
  } else if (score >= 45) {
    recommendedPath = "stabilize";
    pathLabel = "Stabilisieren";
    pathDescription = "Dein Business hat Schwachstellen. Priorisiere die kritischsten Risiken und stabilisiere Cashflow und Margen.";
  } else if (score >= 25) {
    recommendedPath = "pivot";
    pathLabel = "Pivot empfohlen";
    pathDescription = "Grundlegende Änderungen sind nötig. Überdenke Zielgruppe, Preismodell oder Produktstrategie.";
  } else {
    recommendedPath = "liquidate";
    pathLabel = "Liquidation prüfen";
    pathDescription = "Kritische Lage. Prüfe, ob eine geordnete Bestandsliquidation sinnvoller ist als weiterer Kapitaleinsatz.";
  }

  return {
    survivalScore: score,
    bankruptcyRisk,
    recoveryProbability,
    recommendedPath,
    pathLabel,
    pathDescription,
  };
}
