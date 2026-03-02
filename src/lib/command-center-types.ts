// ── Command Center Types & Mock Data ──

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

// ── Scenario-specific mock data ──
const MOCK_DATA: Record<ScenarioMode, {
  status: StatusMetrics;
  money: MoneySummary;
  risks: RiskItem[];
  actions: ExecutionAction[];
}> = {
  optimistic: {
    status: { founderRiskIndex: 22, confidenceScore: 82, riskLevel: "low", runwayMonths: 14, breakEvenDate: "Sep 2026", capitalPressure: 18, lastUpdated: "Heute" },
    money: { margin: 42, breakEvenUnits: 320, cashflowMonthly: 2800, totalCapital: 15000, capitalUsed: 5200, capitalDelta: 1200 },
    risks: [
      { id: "r1", title: "Lieferantenverzögerung", impact: 1200, level: "low" },
      { id: "r2", title: "Retourenquote > 5%", impact: 800, level: "low" },
      { id: "r3", title: "Preisdruck Wettbewerb", impact: 600, level: "low" },
    ],
    actions: [
      { id: "a1", label: "Muster bestellen", priority: "high" },
      { id: "a2", label: "Listing optimieren", priority: "medium" },
    ],
  },
  realistic: {
    status: { founderRiskIndex: 48, confidenceScore: 68, riskLevel: "medium", runwayMonths: 9, breakEvenDate: "Jan 2027", capitalPressure: 52, lastUpdated: "Heute" },
    money: { margin: 34, breakEvenUnits: 480, cashflowMonthly: 1400, totalCapital: 15000, capitalUsed: 7800, capitalDelta: -400 },
    risks: [
      { id: "r1", title: "Lieferantenverzögerung", impact: 2400, level: "medium" },
      { id: "r2", title: "Retourenquote > 5%", impact: 1600, level: "medium" },
      { id: "r3", title: "Compliance-Lücke", impact: 3200, level: "high" },
    ],
    actions: [
      { id: "a1", label: "Compliance prüfen", priority: "critical", blocker: "Fehlende CE-Markierung" },
      { id: "a2", label: "Muster bestellen", priority: "high" },
      { id: "a3", label: "Break-even validieren", priority: "medium" },
    ],
  },
  "worst-case": {
    status: { founderRiskIndex: 78, confidenceScore: 41, riskLevel: "high", runwayMonths: 4, breakEvenDate: "Jul 2027", capitalPressure: 84, lastUpdated: "Heute" },
    money: { margin: 18, breakEvenUnits: 920, cashflowMonthly: -600, totalCapital: 15000, capitalUsed: 12200, capitalDelta: -2800 },
    risks: [
      { id: "r1", title: "Lieferantenausfall", impact: 5800, level: "high" },
      { id: "r2", title: "Retourenquote > 12%", impact: 3400, level: "high" },
      { id: "r3", title: "Compliance-Bußgeld", impact: 8000, level: "high" },
    ],
    actions: [
      { id: "a1", label: "Sofort Backup-Lieferant", priority: "critical", blocker: "Kein Alternativkontakt" },
      { id: "a2", label: "Retourenanalyse starten", priority: "critical" },
      { id: "a3", label: "Cashflow-Notplan erstellen", priority: "high" },
    ],
  },
};

export function getMockData(mode: ScenarioMode) {
  return MOCK_DATA[mode];
}

export const MOCK_FAILURE_COSTS: FailureCost[] = [
  { id: "f1", mistake: "Falsche MOQ-Kalkulation", impact: 4200, description: "Überbestellung bindet Kapital für Monate und frisst Runway.", icon: "calculator" },
  { id: "f2", mistake: "Fehlende CE-Markierung", impact: 8500, description: "Bußgeld + Rückruf + Vertrauensverlust bei Kunden.", icon: "shield" },
  { id: "f3", mistake: "Kein Retourenmanagement", impact: 3100, description: "Retouren ohne Prozess vernichten die Marge vollständig.", icon: "undo" },
  { id: "f4", mistake: "Lieferant ohne Backup", impact: 6200, description: "Ein Ausfall stoppt den gesamten Launch für Wochen.", icon: "truck" },
  { id: "f5", mistake: "Preis ohne Break-even", impact: 5400, description: "Jeder Verkauf kostet Geld statt es zu verdienen.", icon: "trending-down" },
];

export const MOCK_BRAND_SUGGESTIONS: BrandSuggestion[] = [
  {
    name: "VORRA", score: 96, claim: "Ahead by design.", tonality: "Premium Minimal",
    colorSuggestion: "#1a1a2e / #e0a800",
    reasoning: "Kurz, international, klingt nach 'voran'. Premium-Feel.",
    dataUsed: ["Zielgruppe: Design-bewusst", "Kategorie: Lifestyle"],
    confidence: "low",
    archetype: "The Pioneer",
    targetEmotion: "Vorsprung & Selbstbewusstsein",
    pricePositioning: "Premium (€€€)",
    marginCompatibility: "Optimal bei Margen ≥ 35%",
  },
  {
    name: "NŌVA HAUS", score: 93, claim: "Neues Zuhause für deine Marke.", tonality: "Modern Warm",
    colorSuggestion: "#2d3436 / #fab005",
    reasoning: "Nova = Neu + Haus = Vertrauen. Deutsch-international.",
    dataUsed: ["Positionierung: EU-Markt", "Ton: Vertrauenswürdig"],
    confidence: "low",
    archetype: "The Caregiver",
    targetEmotion: "Geborgenheit & Neuanfang",
    pricePositioning: "Mid-Premium (€€)",
    marginCompatibility: "Funktioniert ab Marge ≥ 25%",
  },
  {
    name: "ELEVŌ", score: 91, claim: "Rise above ordinary.", tonality: "Bold Luxury",
    colorSuggestion: "#0d1b2a / #c9a227",
    reasoning: "Elevation + O-Endung. International aussprechbar.",
    dataUsed: ["Segment: Premium", "Audience: 25-40"],
    confidence: "medium",
    archetype: "The Hero",
    targetEmotion: "Ambition & Exzellenz",
    pricePositioning: "Luxury (€€€€)",
    marginCompatibility: "Erfordert Margen ≥ 45%",
  },
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
