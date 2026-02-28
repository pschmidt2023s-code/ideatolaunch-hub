// ─── 5-Layer Supplier Risk Intelligence Engine ─────────────────
// Enterprise-grade risk assessment for supplier decisions.

export interface SupplierRiskInput {
  moqUnits: number;
  unitCost: number;
  totalCapital: number;
  region: string;
  singleSupplier: boolean;
  leadTimeDays: number;
  monthlyBurn: number;
  cashRunwayMonths: number;
}

export interface RiskLayer {
  label: { de: string; en: string };
  score: number; // 0-100
  level: "low" | "medium" | "high" | "critical";
  details: { de: string; en: string }[];
}

export interface SupplierRiskReport {
  overallScore: number;
  overallLevel: "low" | "medium" | "high" | "critical";
  layers: {
    moqCapitalLock: RiskLayer;
    countryVolatility: RiskLayer;
    customsImport: RiskLayer;
    supplierDependency: RiskLayer;
    productionDelay: RiskLayer;
  };
  capitalExposureSummary: { de: string; en: string } | null;
}

const COUNTRY_DATA: Record<string, { political: number; logistics: number; currency: number; customs: number }> = {
  deutschland: { political: 5, logistics: 5, currency: 5, customs: 5 },
  germany: { political: 5, logistics: 5, currency: 5, customs: 5 },
  eu: { political: 10, logistics: 10, currency: 8, customs: 10 },
  china: { political: 55, logistics: 45, currency: 40, customs: 60 },
  indien: { political: 45, logistics: 55, currency: 50, customs: 55 },
  india: { political: 45, logistics: 55, currency: 50, customs: 55 },
  türkei: { political: 50, logistics: 35, currency: 65, customs: 40 },
  turkey: { political: 50, logistics: 35, currency: 65, customs: 40 },
  vietnam: { political: 35, logistics: 40, currency: 35, customs: 50 },
  usa: { political: 15, logistics: 15, currency: 10, customs: 20 },
};

function riskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function analyzeSupplierRisk(input: SupplierRiskInput): SupplierRiskReport {
  const { moqUnits, unitCost, totalCapital, region, singleSupplier, leadTimeDays, monthlyBurn, cashRunwayMonths } = input;
  const moqCost = moqUnits * unitCost;
  const capitalPct = totalCapital > 0 ? (moqCost / totalCapital) * 100 : 100;

  // Layer 1: MOQ Capital Lock
  const moqScore = Math.min(100, Math.round(capitalPct * 1.2));
  const moqCapitalLock: RiskLayer = {
    label: { de: "MOQ-Kapitalbindung", en: "MOQ Capital Lock" },
    score: moqScore,
    level: riskLevel(moqScore),
    details: [
      {
        de: `${capitalPct.toFixed(1)}% deines Kapitals in erster Produktion gebunden`,
        en: `${capitalPct.toFixed(1)}% of total capital locked in first production`,
      },
      {
        de: `MOQ-Kosten: ${moqCost.toLocaleString("de-DE")} € von ${totalCapital.toLocaleString("de-DE")} €`,
        en: `MOQ cost: €${moqCost.toLocaleString("de-DE")} of €${totalCapital.toLocaleString("de-DE")}`,
      },
    ],
  };

  // Layer 2: Country Volatility
  const cd = COUNTRY_DATA[region.toLowerCase()] ?? { political: 30, logistics: 30, currency: 30, customs: 30 };
  const countryScore = Math.round((cd.political * 0.3 + cd.logistics * 0.25 + cd.currency * 0.25 + cd.customs * 0.2));
  const countryVolatility: RiskLayer = {
    label: { de: "Länder-Volatilität", en: "Country Volatility" },
    score: countryScore,
    level: riskLevel(countryScore),
    details: [
      { de: `Politische Stabilität: ${cd.political}/100`, en: `Political stability risk: ${cd.political}/100` },
      { de: `Logistik-Risiko: ${cd.logistics}/100`, en: `Logistics risk: ${cd.logistics}/100` },
      { de: `Währungsschwankung: ${cd.currency}/100`, en: `Currency fluctuation: ${cd.currency}/100` },
      { de: `Zoll-Komplexität: ${cd.customs}/100`, en: `Customs complexity: ${cd.customs}/100` },
    ],
  };

  // Layer 3: Customs & Import
  const customsScore = Math.round(cd.customs * 0.6 + (leadTimeDays > 30 ? 25 : leadTimeDays > 14 ? 15 : 5));
  const customsImport: RiskLayer = {
    label: { de: "Zoll & Import", en: "Customs & Import" },
    score: Math.min(100, customsScore),
    level: riskLevel(customsScore),
    details: [
      {
        de: leadTimeDays > 30 ? "Hohe Verzögerungswahrscheinlichkeit bei Zollabwicklung" : "Moderate Zoll-Verzögerungswahrscheinlichkeit",
        en: leadTimeDays > 30 ? "High probability of customs-related delays" : "Moderate customs delay probability",
      },
      {
        de: `Geschätzte USt./Zoll-Belastung: ${cd.customs > 40 ? "Erheblich" : cd.customs > 20 ? "Moderat" : "Niedrig"}`,
        en: `Estimated VAT/duty exposure: ${cd.customs > 40 ? "Significant" : cd.customs > 20 ? "Moderate" : "Low"}`,
      },
    ],
  };

  // Layer 4: Supplier Dependency
  const depScore = singleSupplier ? 80 : 25;
  const supplierDependency: RiskLayer = {
    label: { de: "Lieferanten-Abhängigkeit", en: "Supplier Dependency" },
    score: depScore,
    level: riskLevel(depScore),
    details: singleSupplier
      ? [
          { de: "Kritisch: Einzelner Lieferant — kein Backup", en: "Critical: Single supplier — no backup" },
          { de: "Empfehlung: Multi-Sourcing-Strategie aufbauen", en: "Recommendation: Build multi-sourcing strategy" },
        ]
      : [
          { de: "Multi-Sourcing reduziert Abhängigkeitsrisiko", en: "Multi-sourcing reduces dependency risk" },
        ],
  };

  // Layer 5: Production Delay Sensitivity
  const delayDays = 30;
  const additionalBurn = (delayDays / 30) * monthlyBurn;
  const runwayAfterDelay = totalCapital > 0 && monthlyBurn > 0
    ? Math.max(0, ((totalCapital - moqCost - additionalBurn) / monthlyBurn))
    : cashRunwayMonths;
  const delayImpact = cashRunwayMonths > 0 ? Math.round(((cashRunwayMonths - runwayAfterDelay) / cashRunwayMonths) * 100) : 0;
  const delayScore = Math.min(100, Math.round(delayImpact * 1.5));
  const productionDelay: RiskLayer = {
    label: { de: "Produktionsverzögerung", en: "Production Delay Sensitivity" },
    score: delayScore,
    level: riskLevel(delayScore),
    details: [
      {
        de: `30-Tage-Verzögerung: Runway fällt von ${cashRunwayMonths.toFixed(1)} auf ${runwayAfterDelay.toFixed(1)} Monate`,
        en: `30-day delay: Runway drops from ${cashRunwayMonths.toFixed(1)} to ${runwayAfterDelay.toFixed(1)} months`,
      },
      {
        de: `Zusätzliche Kosten: ${additionalBurn.toLocaleString("de-DE")} €`,
        en: `Additional burn: €${additionalBurn.toLocaleString("de-DE")}`,
      },
    ],
  };

  // Overall
  const overallScore = Math.round(
    moqScore * 0.25 + countryScore * 0.2 + customsScore * 0.15 + depScore * 0.2 + delayScore * 0.2
  );

  // Capital Exposure Summary (Execution tier)
  const underperformPct = 20;
  const lostRevenue = moqCost * (underperformPct / 100);
  const runwayDrop = totalCapital > 0 && monthlyBurn > 0
    ? ((totalCapital - moqCost) / monthlyBurn)
    : cashRunwayMonths;
  const runwayDropAfter = totalCapital > 0 && monthlyBurn > 0
    ? ((totalCapital - moqCost - lostRevenue) / monthlyBurn)
    : cashRunwayMonths;

  const capitalExposureSummary = {
    de: `Wenn die Produktion um ${underperformPct}% unterperformt, fällt dein Runway von ${runwayDrop.toFixed(1)} auf ${runwayDropAfter.toFixed(1)} Monate.`,
    en: `If production underperforms by ${underperformPct}%, your runway drops from ${runwayDrop.toFixed(1)} to ${runwayDropAfter.toFixed(1)} months.`,
  };

  return {
    overallScore: Math.min(100, overallScore),
    overallLevel: riskLevel(overallScore),
    layers: { moqCapitalLock, countryVolatility, customsImport, supplierDependency, productionDelay },
    capitalExposureSummary,
  };
}
