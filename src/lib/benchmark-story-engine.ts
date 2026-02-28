// ─── Benchmark Story Engine ─────────────────────────────────────
// Strategic interpretation instead of raw percentiles.

export interface BenchmarkInput {
  margin: number;
  runway: number;
  conversionRate: number;
  returnRate: number;
  moqEfficiency: number; // % of MOQ sold within 3 months
}

export interface BenchmarkStory {
  overallHealthScore: number;
  percentiles: {
    margin: { percentile: number; status: "strong" | "average" | "weak" };
    runway: { percentile: number; status: "strong" | "average" | "weak" };
    conversion: { percentile: number; status: "strong" | "average" | "weak" };
    returnRate: { percentile: number; status: "strong" | "average" | "weak" };
    moqEfficiency: { percentile: number; status: "strong" | "average" | "weak" };
  };
  narrative: { de: string; en: string };
  improvements: { kpi: string; current: number; target: number; healthImpact: number; action: { de: string; en: string } }[];
  strategicInsight: { de: string; en: string } | null;
}

// Simulated benchmark percentiles (deterministic based on value)
function calcPercentile(value: number, benchmarks: number[]): number {
  const sorted = [...benchmarks].sort((a, b) => a - b);
  const below = sorted.filter(b => b <= value).length;
  return Math.round((below / sorted.length) * 100);
}

const MARGIN_BENCHMARKS = [15, 20, 25, 28, 30, 33, 35, 38, 40, 42, 45, 50, 55, 60];
const RUNWAY_BENCHMARKS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24];
const CONV_BENCHMARKS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6];
const RETURN_BENCHMARKS = [2, 4, 6, 8, 10, 12, 15, 18, 22, 30]; // lower is better
const MOQ_BENCHMARKS = [20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95];

function kpiStatus(percentile: number): "strong" | "average" | "weak" {
  if (percentile >= 60) return "strong";
  if (percentile >= 30) return "average";
  return "weak";
}

export function generateBenchmarkStory(input: BenchmarkInput): BenchmarkStory {
  const marginPct = calcPercentile(input.margin, MARGIN_BENCHMARKS);
  const runwayPct = calcPercentile(input.runway, RUNWAY_BENCHMARKS);
  const convPct = calcPercentile(input.conversionRate, CONV_BENCHMARKS);
  const returnPct = 100 - calcPercentile(input.returnRate, RETURN_BENCHMARKS); // inverse: low return = good
  const moqPct = calcPercentile(input.moqEfficiency, MOQ_BENCHMARKS);

  const percentiles = {
    margin: { percentile: marginPct, status: kpiStatus(marginPct) },
    runway: { percentile: runwayPct, status: kpiStatus(runwayPct) },
    conversion: { percentile: convPct, status: kpiStatus(convPct) },
    returnRate: { percentile: returnPct, status: kpiStatus(returnPct) },
    moqEfficiency: { percentile: moqPct, status: kpiStatus(moqPct) },
  };

  const healthScore = Math.round(
    marginPct * 0.25 + runwayPct * 0.25 + convPct * 0.2 + returnPct * 0.15 + moqPct * 0.15
  );

  // Find strongest and weakest
  const kpis = [
    { key: "margin", pct: marginPct, label: { de: "Marge", en: "Margin" } },
    { key: "runway", pct: runwayPct, label: { de: "Runway", en: "Runway" } },
    { key: "conversion", pct: convPct, label: { de: "Conversion", en: "Conversion" } },
    { key: "returnRate", pct: returnPct, label: { de: "Retourenquote", en: "Return Rate" } },
    { key: "moqEfficiency", pct: moqPct, label: { de: "MOQ-Effizienz", en: "MOQ Efficiency" } },
  ];
  const sorted = [...kpis].sort((a, b) => b.pct - a.pct);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const narrative = {
    de: `Du bist Top ${100 - strongest.pct}% in ${strongest.label.de}, aber Bottom ${100 - weakest.pct}% in ${weakest.label.de}. ${weakest.label.de} verbessern kann deinen Health Score um +${Math.round((strongest.pct - weakest.pct) * 0.15)} Punkte steigern.`,
    en: `You are Top ${100 - strongest.pct}% in ${strongest.label.en} but Bottom ${100 - weakest.pct}% in ${weakest.label.en}. Improving ${weakest.label.en} could increase your health score by +${Math.round((strongest.pct - weakest.pct) * 0.15)} points.`,
  };

  // Improvements with impact
  const improvements = kpis
    .filter(k => k.pct < 60)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map(k => {
      const targetPct = Math.min(75, k.pct + 20);
      const healthImpact = Math.round((targetPct - k.pct) * 0.2);
      const actions: Record<string, { de: string; en: string }> = {
        margin: { de: "Verhandle Lieferantenpreise oder erhöhe VK-Preis um 5-10%", en: "Negotiate supplier pricing or increase selling price by 5-10%" },
        runway: { de: "Reduziere monatliche Fixkosten oder sichere zusätzliches Kapital", en: "Reduce monthly fixed costs or secure additional capital" },
        conversion: { de: "Optimiere Produktfotos und Listing-Qualität", en: "Optimize product photos and listing quality" },
        returnRate: { de: "Verbessere Produktbeschreibung und Qualitätskontrolle", en: "Improve product description and quality control" },
        moqEfficiency: { de: "Reduziere MOQ oder verstärke Pre-Launch Marketing", en: "Reduce MOQ or intensify pre-launch marketing" },
      };
      return {
        kpi: k.key,
        current: k.pct,
        target: targetPct,
        healthImpact,
        action: actions[k.key] || { de: "Optimiere diese KPI", en: "Optimize this KPI" },
      };
    });

  // Strategic insight (Execution tier)
  const strategicInsight = healthScore < 50
    ? {
        de: `Dein Gesamtprofil zeigt erhöhtes Kapitalrisiko. Fokussiere auf ${weakest.label.de} — hier liegt das größte Optimierungspotential bei geringstem Aufwand.`,
        en: `Your overall profile shows elevated capital risk. Focus on ${weakest.label.en} — this is where the biggest optimization potential meets the least effort.`,
      }
    : {
        de: `Dein Profil ist solide. Strategischer Nächster Schritt: ${strongest.label.de} nutzen als Wettbewerbsvorteil und ${weakest.label.de} auf Branchendurchschnitt heben.`,
        en: `Your profile is solid. Strategic next step: Leverage your ${strongest.label.en} as competitive advantage and bring ${weakest.label.en} up to industry average.`,
      };

  return {
    overallHealthScore: healthScore,
    percentiles,
    narrative,
    improvements,
    strategicInsight,
  };
}
