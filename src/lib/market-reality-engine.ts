// Market Reality Engine – deterministic market validation scoring

export interface MarketInput {
  productCategory: string;
  targetPrice: number;
  competitorCount: number;
  estimatedSearchVolume: number; // monthly
  averageMarketPrice: number;
  topCompetitorPrices: number[]; // up to 5
  margin: number; // percentage
  capitalSafetyMonths: number;
}

export interface DemandAnalysis {
  searchVolume: number;
  trendDirection: "up" | "stable" | "down";
  competitionDensity: number; // 0–100
  demandIndex: number; // 0–100
}

export interface PriceBenchmark {
  averageMarketPrice: number;
  priceRange: { min: number; max: number };
  priceDeviation: number; // percentage vs market avg
  deviationLabel: string;
}

export interface MarketRealityResult {
  demand: DemandAnalysis;
  priceBenchmark: PriceBenchmark;
  launchProbability: number; // 0–100
  launchProbabilityLevel: "high" | "medium" | "low";
  marketRisk: "low" | "medium" | "high";
  factors: { label: string; score: number; max: number }[];
  insights: string[];
}

const CATEGORY_DEMAND: Record<string, { base: number; trend: "up" | "stable" | "down" }> = {
  skincare: { base: 74000, trend: "up" },
  supplements: { base: 61000, trend: "up" },
  food: { base: 45000, trend: "stable" },
  fashion: { base: 82000, trend: "stable" },
  home: { base: 38000, trend: "stable" },
  pet: { base: 29000, trend: "up" },
  tech: { base: 55000, trend: "down" },
  beauty: { base: 68000, trend: "up" },
  fitness: { base: 42000, trend: "up" },
};

export function analyzeMarket(input: MarketInput): MarketRealityResult {
  const catData = CATEGORY_DEMAND[input.productCategory.toLowerCase()] ?? { base: 30000, trend: "stable" };

  // Demand Analysis
  const searchVolume = input.estimatedSearchVolume || catData.base;
  const trendDirection = catData.trend;
  const competitionDensity = Math.min(100, Math.round((input.competitorCount / 50) * 100));
  const demandIndex = Math.min(100, Math.round(
    (searchVolume / 100000) * 50 +
    (trendDirection === "up" ? 30 : trendDirection === "stable" ? 15 : 0) +
    Math.max(0, 20 - competitionDensity * 0.2)
  ));

  // Price Benchmark
  const prices = input.topCompetitorPrices.length > 0
    ? input.topCompetitorPrices
    : [input.averageMarketPrice * 0.8, input.averageMarketPrice, input.averageMarketPrice * 1.2];
  const avgMarket = input.averageMarketPrice || prices.reduce((a, b) => a + b, 0) / prices.length;
  const priceDeviation = avgMarket > 0 ? ((input.targetPrice - avgMarket) / avgMarket) * 100 : 0;
  const deviationLabel = priceDeviation > 15
    ? `+${Math.round(priceDeviation)}% über Marktdurchschnitt`
    : priceDeviation < -15
    ? `${Math.round(priceDeviation)}% unter Marktdurchschnitt`
    : "Im Marktdurchschnitt";

  // Launch Probability Factors
  const demandScore = Math.min(30, demandIndex * 0.3);
  const competitionScore = Math.min(25, (100 - competitionDensity) * 0.25);
  const marginScore = Math.min(25, input.margin * 0.5);
  const capitalScore = Math.min(20, input.capitalSafetyMonths * 3.3);

  const launchProbability = Math.round(demandScore + competitionScore + marginScore + capitalScore);
  const launchProbabilityLevel = launchProbability >= 70 ? "high" : launchProbability >= 45 ? "medium" : "low";

  // Market Risk
  const riskScore = (competitionDensity * 0.3) + (Math.abs(priceDeviation) * 0.3) +
    (trendDirection === "down" ? 20 : 0) + (input.margin < 30 ? 15 : 0);
  const marketRisk = riskScore > 50 ? "high" : riskScore > 25 ? "medium" : "low";

  // Insights
  const insights: string[] = [];
  if (trendDirection === "up") insights.push("Markt zeigt Aufwärtstrend – guter Einstiegszeitpunkt");
  if (trendDirection === "down") insights.push("Markt zeigt Abwärtstrend – erhöhtes Risiko");
  if (priceDeviation > 20) insights.push("Dein Preis liegt deutlich über dem Markt – differenziere durch Qualität");
  if (priceDeviation < -15) insights.push("Aggressiver Preis – achte auf ausreichende Marge");
  if (competitionDensity > 60) insights.push("Hohe Wettbewerbsdichte – fokussiere auf Nische oder USP");
  if (input.margin < 25) insights.push("Marge unter 25% – risikobehaftet bei unerwarteten Kosten");
  if (input.capitalSafetyMonths < 3) insights.push("Kapitalpuffer unter 3 Monaten – Liquiditätsrisiko");

  return {
    demand: { searchVolume, trendDirection, competitionDensity, demandIndex },
    priceBenchmark: {
      averageMarketPrice: avgMarket,
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
      priceDeviation: Math.round(priceDeviation),
      deviationLabel,
    },
    launchProbability,
    launchProbabilityLevel,
    marketRisk,
    factors: [
      { label: "Nachfrage", score: Math.round(demandScore), max: 30 },
      { label: "Wettbewerb", score: Math.round(competitionScore), max: 25 },
      { label: "Marge", score: Math.round(marginScore), max: 25 },
      { label: "Kapitaldeckung", score: Math.round(capitalScore), max: 20 },
    ],
    insights,
  };
}
