// ─── Supplier Risk Intelligence Engine (5-Layer) ────────────────
// Enterprise-grade risk assessment for supplier decisions.

export interface SupplierRiskInput {
  totalCapital: number;
  firstProductionCost: number;
  supplierRegion: "EU" | "Asia" | "Global";
  moq: number;
  unitCost: number;
  leadTimeDays: number;
  singleSupplier: boolean;
  monthlyBurnRate: number;
  cashRunwayMonths: number;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskDimension {
  name: string;
  nameEn: string;
  score: number; // 0-100
  level: RiskLevel;
  detail: string;
  detailEn: string;
}

export interface CapitalExposureSummary {
  currentRunway: number;
  runwayAfterUnderperformance: number;
  capitalAtRisk: number;
  capitalAtRiskPercent: number;
  message: string;
  messageEn: string;
}

export interface SupplierRiskResult {
  overallScore: number;
  overallLevel: RiskLevel;
  dimensions: RiskDimension[];
  capitalExposure: CapitalExposureSummary;
}

// Country volatility data (simplified deterministic)
const COUNTRY_VOLATILITY: Record<string, { political: number; logistics: number; currency: number; customs: number }> = {
  EU: { political: 15, logistics: 10, currency: 5, customs: 10 },
  Asia: { political: 45, logistics: 55, currency: 40, customs: 65 },
  Global: { political: 35, logistics: 40, currency: 30, customs: 45 },
};

function getLevel(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function computeSupplierRisk(input: SupplierRiskInput): SupplierRiskResult {
  const { totalCapital, firstProductionCost, supplierRegion, moq, unitCost, leadTimeDays, singleSupplier, monthlyBurnRate, cashRunwayMonths } = input;

  const dimensions: RiskDimension[] = [];

  // 1. MOQ Capital Lock Risk
  const capitalLockPercent = totalCapital > 0 ? (firstProductionCost / totalCapital) * 100 : 100;
  const moqScore = capitalLockPercent > 70 ? 90 : capitalLockPercent > 50 ? 65 : capitalLockPercent > 30 ? 35 : 15;
  dimensions.push({
    name: "MOQ-Kapitalbindung",
    nameEn: "MOQ Capital Lock",
    score: moqScore,
    level: getLevel(moqScore),
    detail: `${capitalLockPercent.toFixed(0)}% deines Kapitals sind in der ersten Produktion gebunden.`,
    detailEn: `${capitalLockPercent.toFixed(0)}% of your capital is locked in the first production run.`,
  });

  // 2. Country Volatility
  const vol = COUNTRY_VOLATILITY[supplierRegion] ?? COUNTRY_VOLATILITY.Global;
  const countryScore = Math.round((vol.political + vol.logistics + vol.currency + vol.customs) / 4);
  dimensions.push({
    name: "Länder-Volatilität",
    nameEn: "Country Volatility",
    score: countryScore,
    level: getLevel(countryScore),
    detail: `Politisch: ${vol.political}/100 · Logistik: ${vol.logistics}/100 · Währung: ${vol.currency}/100 · Zoll: ${vol.customs}/100`,
    detailEn: `Political: ${vol.political}/100 · Logistics: ${vol.logistics}/100 · Currency: ${vol.currency}/100 · Customs: ${vol.customs}/100`,
  });

  // 3. Customs & Import Risk
  const customsScore = supplierRegion === "Asia" ? 65 : supplierRegion === "Global" ? 45 : 15;
  dimensions.push({
    name: "Zoll- & Importrisiko",
    nameEn: "Customs & Import Risk",
    score: customsScore,
    level: getLevel(customsScore),
    detail: supplierRegion === "Asia"
      ? "HS-Code-Komplexität hoch. Geschätzte Zollverzögerung: 5–14 Tage. USt. + Zoll kalkulieren."
      : supplierRegion === "EU"
      ? "Innerhalb der EU: keine Zölle, minimale Verzögerungen."
      : "Gemischtes Risiko je nach Ursprungsland.",
    detailEn: supplierRegion === "Asia"
      ? "High HS code complexity. Estimated customs delay: 5–14 days. VAT + duty exposure."
      : supplierRegion === "EU"
      ? "Within EU: no tariffs, minimal delays."
      : "Mixed risk depending on country of origin.",
  });

  // 4. Supplier Dependency
  const depScore = singleSupplier ? 75 : 20;
  dimensions.push({
    name: "Lieferanten-Abhängigkeit",
    nameEn: "Supplier Dependency",
    score: depScore,
    level: getLevel(depScore),
    detail: singleSupplier
      ? "Komplettabhängigkeit von einem Lieferanten. Multi-Sourcing dringend empfohlen."
      : "Multi-Sourcing aktiv — geringeres Ausfallrisiko.",
    detailEn: singleSupplier
      ? "Complete dependency on single supplier. Multi-sourcing strongly recommended."
      : "Multi-sourcing active — lower failure risk.",
  });

  // 5. Production Delay Sensitivity
  const delayMonthsBurned = (30 / 30) * (monthlyBurnRate > 0 ? monthlyBurnRate : 1);
  const runwayImpact = cashRunwayMonths > 0 ? (delayMonthsBurned / (totalCapital || 1)) * 100 : 0;
  const delayScore = leadTimeDays > 45 ? 70 : leadTimeDays > 30 ? 50 : leadTimeDays > 14 ? 25 : 10;
  const adjustedDelay = Math.min(100, delayScore + (cashRunwayMonths < 3 ? 20 : 0));
  dimensions.push({
    name: "Produktionsverzögerung",
    nameEn: "Production Delay Sensitivity",
    score: adjustedDelay,
    level: getLevel(adjustedDelay),
    detail: `Bei 30 Tagen Verzögerung: ${monthlyBurnRate.toLocaleString("de-DE")} € zusätzliche Burn. Vorlaufzeit: ${leadTimeDays} Tage.`,
    detailEn: `30-day delay impact: €${monthlyBurnRate.toLocaleString("en-US")} additional burn. Lead time: ${leadTimeDays} days.`,
  });

  // Overall
  const overallScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);

  // Capital Exposure (Execution tier)
  const underperformancePct = 0.2;
  const lostRevenue = firstProductionCost * underperformancePct;
  const newCapital = totalCapital - lostRevenue;
  const newRunway = monthlyBurnRate > 0 ? newCapital / monthlyBurnRate : cashRunwayMonths;

  const capitalExposure: CapitalExposureSummary = {
    currentRunway: cashRunwayMonths,
    runwayAfterUnderperformance: Math.max(0, parseFloat(newRunway.toFixed(1))),
    capitalAtRisk: lostRevenue,
    capitalAtRiskPercent: totalCapital > 0 ? parseFloat(((lostRevenue / totalCapital) * 100).toFixed(1)) : 0,
    message: `Wenn die Produktion 20% unter Plan liegt, sinkt dein Runway von ${cashRunwayMonths.toFixed(1)} auf ${Math.max(0, newRunway).toFixed(1)} Monate.`,
    messageEn: `If production underperforms by 20%, your runway drops from ${cashRunwayMonths.toFixed(1)} to ${Math.max(0, newRunway).toFixed(1)} months.`,
  };

  return {
    overallScore,
    overallLevel: getLevel(overallScore),
    dimensions,
    capitalExposure,
  };
}
