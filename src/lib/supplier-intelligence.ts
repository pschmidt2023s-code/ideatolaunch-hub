// ─── Supplier Intelligence Engine (PRO FEATURE) ─────────────────
// Reasoning engine — NOT a marketplace integration.
// Deterministic business logic. No external API calls.
// This module is gated behind the Pro feature flag.

export interface SupplierInput {
  productCategory: string;
  targetPrice: number;
  desiredMoq: number;
  budget: number;
  priceLevel: string; // budget | mid | premium | luxury
}

export interface SupplierInsight {
  supplierType: string;
  regionRecommendation: string;
  regionReasoning: string;
  realisticMoq: { min: number; max: number; note: string };
  typicalCostStructure: string;
  negotiationStrategy: string[];
  riskWarnings: string[];
  summary: string;
}

export function analyzeSupplierFit(input: SupplierInput): SupplierInsight {
  const { budget, desiredMoq, targetPrice, priceLevel } = input;

  // ── Region logic ────────────────────────────────────────
  let regionRecommendation: string;
  let regionReasoning: string;
  let supplierType: string;

  const unitBudget = budget > 0 && desiredMoq > 0 ? budget / desiredMoq : 0;
  const isPremium = priceLevel === "premium" || priceLevel === "luxury";

  if (budget < 5000) {
    regionRecommendation = "EU / Lokal";
    regionReasoning = "Bei deinem Budget sind asiatische Lieferanten wegen hoher MOQs und Versandkosten nicht wirtschaftlich. Lokale oder EU-Lieferanten bieten niedrigere MOQs und kürzere Vorlaufzeiten.";
    supplierType = "Kleine Kontraktfertiger / Manufakturen";
  } else if (budget < 15000) {
    if (isPremium) {
      regionRecommendation = "EU / Türkei";
      regionReasoning = "Für Premium-Positionierung empfehlen wir EU- oder türkische Lieferanten. Die höheren Stückkosten werden durch Qualitätswahrnehmung und 'Made in Europe' kompensiert.";
      supplierType = "Spezialisierte Kontraktfertiger";
    } else {
      regionRecommendation = "EU oder Türkei";
      regionReasoning = "Dein Budget ermöglicht sowohl EU- als auch türkische Lieferanten. Türkei bietet ein gutes Preis-Leistungs-Verhältnis bei akzeptabler Qualität.";
      supplierType = "Kontraktfertiger mittlerer Größe";
    }
  } else {
    if (desiredMoq >= 1000) {
      regionRecommendation = "Asien (China / Vietnam)";
      regionReasoning = "Bei deinem Budget und deiner gewünschten Menge sind asiatische Hersteller wirtschaftlich sinnvoll. Achte auf Qualitätskontrolle und plane 4-8 Wochen Vorlaufzeit ein.";
      supplierType = "Asiatische OEM/ODM-Hersteller";
    } else {
      regionRecommendation = "EU / Türkei";
      regionReasoning = "Trotz ausreichendem Budget ist deine Menge für asiatische Lieferanten zu klein. EU/Türkei bietet bessere Konditionen bei niedrigeren MOQs.";
      supplierType = "Mittelgroße Kontraktfertiger";
    }
  }

  // ── Realistic MOQ ───────────────────────────────────────
  let moqMin: number, moqMax: number, moqNote: string;

  if (regionRecommendation.includes("Asien")) {
    moqMin = 500;
    moqMax = 3000;
    moqNote = "Asiatische Lieferanten verlangen typisch 500-3.000 Stück MOQ. Unter 500 sind selten, über 1.000 wird der Stückpreis deutlich besser.";
  } else if (regionRecommendation.includes("Türkei")) {
    moqMin = 200;
    moqMax = 1000;
    moqNote = "Türkische Lieferanten bieten oft MOQs ab 200 Stück. Die besten Preise erhältst du ab 500 Stück.";
  } else {
    moqMin = 50;
    moqMax = 500;
    moqNote = "EU-Lieferanten und Manufakturen bieten teilweise MOQs ab 50 Stück. Erwarte höhere Stückpreise, aber niedrigeres Risiko.";
  }

  // ── Cost structure ──────────────────────────────────────
  let typicalCostStructure: string;
  if (regionRecommendation.includes("Asien")) {
    typicalCostStructure = "Produktionskosten: 20-40% vom VK · Versand/Zoll: 10-15% · Verpackung: 5-10% · Erwarte 4-8 Wochen Vorlaufzeit plus Versand.";
  } else if (regionRecommendation.includes("Türkei")) {
    typicalCostStructure = "Produktionskosten: 30-50% vom VK · Versand: 5-8% · Verpackung: 5-10% · Vorlaufzeit: 3-5 Wochen.";
  } else {
    typicalCostStructure = "Produktionskosten: 40-60% vom VK · Versand: 3-5% · Verpackung: 5-10% · Vorlaufzeit: 1-3 Wochen.";
  }

  // ── Negotiation ─────────────────────────────────────────
  const negotiationStrategy: string[] = [
    "Hole mindestens 3 Angebote ein, bevor du verhandelst.",
    "Frage nach gestaffelten Preisen für verschiedene Mengen.",
    "Bestelle immer erst ein Muster, bevor du die volle Menge ordnest.",
  ];

  if (regionRecommendation.includes("Asien")) {
    negotiationStrategy.push(
      "Nutze Alibaba nur zur Recherche — kontaktiere Lieferanten direkt.",
      "Vereinbare eine Qualitätskontrolle vor Versand (Pre-Shipment Inspection).",
    );
  }

  if (desiredMoq > moqMax) {
    negotiationStrategy.push(
      "Deine gewünschte Menge liegt über dem typischen MOQ. Nutze das als Verhandlungshebel für bessere Stückpreise.",
    );
  }

  // ── Risk warnings ───────────────────────────────────────
  const riskWarnings: string[] = [];

  if (desiredMoq > 0 && desiredMoq < moqMin) {
    riskWarnings.push(`Deine gewünschte Menge (${desiredMoq}) liegt unter dem typischen MOQ (${moqMin}+). Erwarte höhere Stückpreise oder suche nach Lieferanten mit niedrigerem MOQ.`);
  }

  if (budget > 0 && unitBudget > 0 && unitBudget < targetPrice * 0.3) {
    riskWarnings.push("Dein Budget pro Stück ist sehr knapp. Prüfe, ob dein Zielpreis realistisch ist.");
  }

  if (isPremium && regionRecommendation.includes("Asien")) {
    riskWarnings.push("Premium-Positionierung mit asiatischer Produktion erfordert besonders strenge Qualitätskontrolle und durchdachtes Branding.");
  }

  if (budget < 3000) {
    riskWarnings.push("Bei sehr kleinem Budget: Erwäge Print-on-Demand oder White-Label als erste Validierung, bevor du in eigene Produktion investierst.");
  }

  // ── Summary ─────────────────────────────────────────────
  const summary = `Basierend auf deinem Budget (${budget.toLocaleString("de-DE")} €), deiner Menge (${desiredMoq} Stück) und deiner ${priceLevel === "premium" ? "Premium" : priceLevel === "luxury" ? "Luxus" : "Standard"}-Positionierung empfehlen wir ${supplierType} aus der Region ${regionRecommendation}.`;

  return {
    supplierType,
    regionRecommendation,
    regionReasoning,
    realisticMoq: { min: moqMin, max: moqMax, note: moqNote },
    typicalCostStructure,
    negotiationStrategy,
    riskWarnings,
    summary,
  };
}
