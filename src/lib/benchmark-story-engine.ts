// ─── Benchmark Story Engine ─────────────────────────────────────
// Strategic interpretation layer with improvement projections.

export interface BenchmarkKPIs {
  margin: number;
  cashRunwayMonths: number;
  conversionRate: number;
  returnRate: number;
  healthScore: number;
}

export interface BenchmarkStory {
  narrative: string;
  narrativeEn: string;
  type: "strength" | "weakness" | "opportunity";
}

export interface ImprovementProjection {
  kpi: string;
  currentValue: number;
  targetValue: number;
  healthScoreImpact: number;
  action: string;
  actionEn: string;
}

export interface PeerHeatmapEntry {
  kpi: string;
  percentile: number;
  level: "top" | "mid" | "bottom";
}

export interface BenchmarkResult {
  stories: BenchmarkStory[];
  projections: ImprovementProjection[];
  heatmap: PeerHeatmapEntry[];
  strategicInsight: string;
  strategicInsightEn: string;
}

const BENCHMARKS = {
  margin: { p25: 28, p50: 38, p75: 52 },
  runway: { p25: 2, p50: 4, p75: 8 },
  conversion: { p25: 1.2, p50: 2.5, p75: 4.0 },
  returnRate: { p25: 5, p50: 10, p75: 18 },
};

function getPercentile(value: number, type: keyof typeof BENCHMARKS): number {
  const b = BENCHMARKS[type];
  if (value <= b.p25) return 25;
  if (value <= b.p50) return 50;
  if (value <= b.p75) return 75;
  return 90;
}

export function generateBenchmarkAnalysis(kpis: BenchmarkKPIs): BenchmarkResult {
  const mp = getPercentile(kpis.margin, "margin");
  const rp = getPercentile(kpis.cashRunwayMonths, "runway");
  const cp = getPercentile(kpis.conversionRate, "conversion");
  const rrp = 100 - getPercentile(kpis.returnRate, "returnRate"); // lower is better

  const stories: BenchmarkStory[] = [];
  const projections: ImprovementProjection[] = [];

  // Margin story
  if (mp >= 75) {
    stories.push({
      narrative: `Du bist Top ${100 - mp}% bei der Marge — besser als 3 von 4 Gründern in deinem Segment.`,
      narrativeEn: `You're in the top ${100 - mp}% for margin — better than 3 out of 4 founders in your segment.`,
      type: "strength",
    });
  } else if (mp <= 25) {
    stories.push({
      narrative: `Deine Marge liegt im Bottom ${mp}%. Eine Preiserhöhung von 5% würde dich auf Top 50% bringen.`,
      narrativeEn: `Your margin is in the bottom ${mp}%. A 5% price increase would put you in the top 50%.`,
      type: "weakness",
    });
    projections.push({
      kpi: "Marge",
      currentValue: kpis.margin,
      targetValue: BENCHMARKS.margin.p50,
      healthScoreImpact: 12,
      action: "Preise um 5% erhöhen oder Einkaufskosten um 8% senken.",
      actionEn: "Increase prices by 5% or reduce COGS by 8%.",
    });
  }

  // Runway story
  if (rp >= 75 && mp < 75) {
    stories.push({
      narrative: `Dein Cash Buffer ist stark (Top ${100 - rp}%), aber deine Marge hält nicht mit. Fokus: Profitabilität.`,
      narrativeEn: `Your cash buffer is strong (top ${100 - rp}%), but your margin doesn't match. Focus: profitability.`,
      type: "opportunity",
    });
  } else if (rp <= 25) {
    const impact = Math.round((4 - kpis.cashRunwayMonths) * 3);
    stories.push({
      narrative: `Dein Runway liegt im Bottom ${rp}%. Runway auf 4 Monate erhöhen = Health Score +${impact}.`,
      narrativeEn: `Your runway is in the bottom ${rp}%. Increasing runway to 4 months = health score +${impact}.`,
      type: "weakness",
    });
    projections.push({
      kpi: "Cash Runway",
      currentValue: kpis.cashRunwayMonths,
      targetValue: 4,
      healthScoreImpact: impact,
      action: "Variable Kosten um 15% reduzieren oder Umsatz steigern.",
      actionEn: "Reduce variable costs by 15% or increase revenue.",
    });
  }

  // Conversion story
  if (cp <= 25) {
    stories.push({
      narrative: `Deine Conversion (${kpis.conversionRate}%) liegt unter dem Median. Optimierung der Produktseite kann 1-2% bringen.`,
      narrativeEn: `Your conversion (${kpis.conversionRate}%) is below median. Product page optimization can yield 1-2%.`,
      type: "weakness",
    });
    projections.push({
      kpi: "Conversion",
      currentValue: kpis.conversionRate,
      targetValue: BENCHMARKS.conversion.p50,
      healthScoreImpact: 8,
      action: "Trust-Elemente und Bewertungen auf der Produktseite ergänzen.",
      actionEn: "Add trust elements and reviews to the product page.",
    });
  }

  // Combined strength
  if (mp >= 75 && rp >= 75) {
    stories.push({
      narrative: "Exzellent: Du gehörst zu den Top-Performern bei Marge UND Cashflow. Skalierungspotenzial ist gegeben.",
      narrativeEn: "Excellent: You're a top performer in both margin AND cashflow. Scaling potential is present.",
      type: "strength",
    });
  }

  if (stories.length === 0) {
    stories.push({
      narrative: "Deine KPIs liegen im soliden Mittelfeld. Kleine Optimierungen bringen dich in die Top 25%.",
      narrativeEn: "Your KPIs are in the solid midfield. Small optimizations will get you into the top 25%.",
      type: "opportunity",
    });
  }

  // Heatmap
  const heatmap: PeerHeatmapEntry[] = [
    { kpi: "Marge", percentile: mp, level: mp >= 75 ? "top" : mp >= 50 ? "mid" : "bottom" },
    { kpi: "Runway", percentile: rp, level: rp >= 75 ? "top" : rp >= 50 ? "mid" : "bottom" },
    { kpi: "Conversion", percentile: cp, level: cp >= 75 ? "top" : cp >= 50 ? "mid" : "bottom" },
    { kpi: "Retouren", percentile: rrp, level: rrp >= 75 ? "top" : rrp >= 50 ? "mid" : "bottom" },
  ];

  // Strategic insight (Execution tier)
  let strategicInsight: string;
  let strategicInsightEn: string;

  if (kpis.healthScore < 40) {
    strategicInsight = `Strategische Positionierung: Dein Health Score (${kpis.healthScore}) signalisiert Handlungsbedarf. Priorisiere: Marge stabilisieren → Runway aufbauen → dann erst skalieren.`;
    strategicInsightEn = `Strategic positioning: Your health score (${kpis.healthScore}) signals action needed. Prioritize: stabilize margin → build runway → then scale.`;
  } else if (kpis.healthScore >= 70) {
    strategicInsight = "Strategische Positionierung: Alle Kernmetriken im grünen Bereich. Fokus auf kontrollierte Skalierung und Marktexpansion.";
    strategicInsightEn = "Strategic positioning: All core metrics in the green zone. Focus on controlled scaling and market expansion.";
  } else {
    strategicInsight = "Strategische Positionierung: Solide Basis mit Optimierungspotenzial. Fokus auf die schwächste Dimension, um den größten Hebel zu nutzen.";
    strategicInsightEn = "Strategic positioning: Solid foundation with optimization potential. Focus on the weakest dimension for maximum leverage.";
  }

  return { stories, projections, heatmap, strategicInsight, strategicInsightEn };
}
