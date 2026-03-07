// ── Command Center Types ──

export type RiskLevel = "low" | "medium" | "high";
export type ScenarioMode = "optimistic" | "realistic" | "worst-case";

export interface StatusMetrics {
  founderRiskIndex: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  runwayMonths: number;
  breakEvenDate: string;
  capitalPressure: number; // 0-100
  lastUpdated: string;
}

export interface MoneySummary {
  margin: number;
  breakEvenUnits: number;
  cashflowMonthly: number;
  totalCapital: number;
  capitalUsed: number;
  capitalDelta: number;
}

export interface RiskItem {
  id: string;
  title: string;
  impact: number;
  level: RiskLevel;
}

export interface ExecutionAction {
  id: string;
  label: string;
  priority: "critical" | "high" | "medium";
  blocker?: string;
}

export interface SimulationResult {
  runwayDelta: number;
  breakEvenShift: number;
  profitDelta: number;
  riskLevelChange: RiskLevel;
}

export interface FailureCost {
  id: string;
  mistake: string;
  impact: number;
  description: string;
  icon: string;
}

export interface BrandSuggestion {
  name: string;
  score: number;
  claim: string;
  tonality: string;
  colorSuggestion: string;
  reasoning: string;
  dataUsed: string[];
  confidence: RiskLevel;
  archetype: string;
  targetEmotion: string;
  pricePositioning: string;
  marginCompatibility: string;
}

export interface PhaseIntelligence {
  riskImpact: string;
  confidenceImpact: string;
  capitalEffect: string;
  riskLevel: RiskLevel;
}

// ── Phase Intelligence per step ──
export const PHASE_INTELLIGENCE: Record<number, PhaseIntelligence> = {
  1: { riskImpact: "Positionierungsfehler → -3.200 €", confidenceImpact: "+15 Punkte bei klarer Nische", capitalEffect: "Kein direkter Kapitaleinsatz", riskLevel: "medium" },
  2: { riskImpact: "Kalkulationsfehler → -5.400 €", confidenceImpact: "+20 Punkte bei validiertem Break-even", capitalEffect: "Entscheidet über Kapitalbedarf", riskLevel: "high" },
  3: { riskImpact: "Lieferantenausfall → -6.200 €", confidenceImpact: "+18 Punkte bei Backup-Supplier", capitalEffect: "-2.000 bis -8.000 € MOQ-Binding", riskLevel: "high" },
  4: { riskImpact: "Compliance-Bußgeld → -8.500 €", confidenceImpact: "+12 Punkte bei vollständiger Compliance", capitalEffect: "-500 bis -2.000 € Zertifizierungen", riskLevel: "medium" },
  5: { riskImpact: "Launch-Verzögerung → -1.800 €/Monat", confidenceImpact: "+10 Punkte bei Go-Live", capitalEffect: "Marketing-Budget aktiviert", riskLevel: "low" },
};

// ── Reference data: typical founder mistakes with estimated costs ──
export const FAILURE_COSTS: FailureCost[] = [
  { id: "f1", mistake: "Falsche MOQ-Kalkulation", impact: 4200, description: "Überbestellung bindet Kapital für Monate und frisst Runway.", icon: "calculator" },
  { id: "f2", mistake: "Fehlende CE-Markierung", impact: 8500, description: "Bußgeld + Rückruf + Vertrauensverlust bei Kunden.", icon: "shield" },
  { id: "f3", mistake: "Kein Retourenmanagement", impact: 3100, description: "Retouren ohne Prozess vernichten die Marge vollständig.", icon: "undo" },
  { id: "f4", mistake: "Lieferant ohne Backup", impact: 6200, description: "Ein Ausfall stoppt den gesamten Launch für Wochen.", icon: "truck" },
  { id: "f5", mistake: "Preis ohne Break-even", impact: 5400, description: "Jeder Verkauf kostet Geld statt es zu verdienen.", icon: "trending-down" },
];

export function simulateDecision(type: string): SimulationResult {
  switch (type) {
    case "price_plus_10":
      return { runwayDelta: 2, breakEvenShift: -30, profitDelta: 2200, riskLevelChange: "low" };
    case "ads_plus_20":
      return { runwayDelta: -2, breakEvenShift: -45, profitDelta: 1800, riskLevelChange: "medium" };
    case "delay_30_days":
      return { runwayDelta: -1, breakEvenShift: 30, profitDelta: -2400, riskLevelChange: "high" };
    case "returns_8_pct":
      return { runwayDelta: -1.5, breakEvenShift: 60, profitDelta: -1600, riskLevelChange: "medium" };
    default:
      return { runwayDelta: 0, breakEvenShift: 0, profitDelta: 0, riskLevelChange: "low" };
  }
}
