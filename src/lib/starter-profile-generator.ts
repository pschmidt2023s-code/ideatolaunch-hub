export interface StarterAnswers {
  productType: string;
  budget: string;
  targetMarket: string;
  launchGoal: string;
  riskTolerance: string;
}

export interface StarterProfile {
  positioning: string;
  quantityRange: { min: number; max: number };
  pricingLogic: string;
  strategy: string;
  prefill: {
    product_description: string;
    target_audience: string;
    price_level: string;
    budget: string;
    timeline: string;
  };
}

const positioningMap: Record<string, Record<string, string>> = {
  mass: {
    "test-idea": "Günstiges Einsteigerprodukt zum Markttest",
    "side-income": "Solides Massenprodukt mit bewährtem Konzept",
    "build-brand": "Preis-Leistungs-Marke mit klarem Wiedererkennungswert",
  },
  niche: {
    "test-idea": "Spezialisiertes Produkt für eine klar definierte Zielgruppe",
    "side-income": "Nischenprodukt mit loyaler Community-Basis",
    "build-brand": "Expertenbrand mit starkem Alleinstellungsmerkmal",
  },
  premium: {
    "test-idea": "Hochwertige Kleinserie für anspruchsvolle Käufer",
    "side-income": "Premium-Produkt mit hohen Margen",
    "build-brand": "Luxusmarke mit Story und exklusiver Positionierung",
  },
};

const quantityMap: Record<string, Record<string, { min: number; max: number }>> = {
  "<1k": {
    low: { min: 25, max: 50 },
    medium: { min: 50, max: 100 },
    high: { min: 100, max: 200 },
  },
  "1k-5k": {
    low: { min: 50, max: 150 },
    medium: { min: 150, max: 300 },
    high: { min: 300, max: 500 },
  },
  "5k-15k": {
    low: { min: 200, max: 500 },
    medium: { min: 500, max: 1000 },
    high: { min: 1000, max: 2000 },
  },
  "15k+": {
    low: { min: 500, max: 1000 },
    medium: { min: 1000, max: 3000 },
    high: { min: 3000, max: 5000 },
  },
};

const pricingMap: Record<string, Record<string, string>> = {
  mass: {
    "<1k": "Preispunkt: 10–25 €. Fokus auf Volumen und niedrige Stückkosten.",
    "1k-5k": "Preispunkt: 12–30 €. Größere Stückzahlen senken den Einkaufspreis.",
    "5k-15k": "Preispunkt: 15–35 €. Gute Verhandlungsbasis bei Lieferanten.",
    "15k+": "Preispunkt: 10–30 €. Skaleneffekte nutzen für maximale Marge.",
  },
  niche: {
    "<1k": "Preispunkt: 25–50 €. Höhere Marge kompensiert kleinere Stückzahl.",
    "1k-5k": "Preispunkt: 30–60 €. Zielgruppe zahlt für Spezialisierung.",
    "5k-15k": "Preispunkt: 35–70 €. Community-Building rechtfertigt Premium-Aufschlag.",
    "15k+": "Preispunkt: 30–80 €. Marktführerposition in der Nische anstreben.",
  },
  premium: {
    "<1k": "Preispunkt: 50–120 €. Exklusivität durch limitierte Auflage.",
    "1k-5k": "Preispunkt: 60–150 €. Qualität und Verpackung müssen stimmen.",
    "5k-15k": "Preispunkt: 70–200 €. Markenstory ist entscheidend.",
    "15k+": "Preispunkt: 80–250 €. Full-Brand-Experience aufbauen.",
  },
};

const strategyMap: Record<string, Record<string, string>> = {
  low: {
    "test-idea": "Starte mit der kleinsten möglichen Bestellung. Teste über Freunde, Familie und eine einfache Landingpage, bevor du skalierst.",
    "side-income": "Beginne mit einem bewährten Produktkonzept. Verkaufe erst über einen Kanal (z.B. Etsy oder eigener Shop), bevor du erweiterst.",
    "build-brand": "Fokussiere dich auf ein einziges Produkt und perfektioniere es. Marke kommt vor Sortiment.",
  },
  medium: {
    "test-idea": "Teste 2–3 Varianten gleichzeitig. Nutze Social Media für schnelles Feedback, bevor du nachbestellst.",
    "side-income": "Starte mit einer soliden Erstbestellung und plane direkt den zweiten Kanal mit ein.",
    "build-brand": "Investiere in Branding und Verpackung von Anfang an. Der erste Eindruck zählt.",
  },
  high: {
    "test-idea": "Größere Testmenge, aber mit klarer Ausstiegsstrategie. Definiere vorher: Ab wann lohnt es sich?",
    "side-income": "Aggressive Preisstrategie zum Markteintritt. Plane Marketing-Budget von Anfang an ein.",
    "build-brand": "Vollständiges Brand-Paket: Design, Verpackung, Social Media, Influencer-Seeding parallel aufbauen.",
  },
};

const priceLevelFromMarket: Record<string, string> = {
  mass: "budget",
  niche: "mid",
  premium: "premium",
};

const timelineFromRisk: Record<string, string> = {
  low: "6+",
  medium: "3-6",
  high: "1-3",
};

export function generateStarterProfile(answers: StarterAnswers): StarterProfile {
  const { productType, budget, targetMarket, launchGoal, riskTolerance } = answers;

  const positioning =
    positioningMap[targetMarket]?.[launchGoal] ??
    "Klares Produkt mit definierter Zielgruppe";

  const quantityRange =
    quantityMap[budget]?.[riskTolerance] ?? { min: 50, max: 200 };

  const pricingLogic =
    pricingMap[targetMarket]?.[budget] ??
    "Kalkuliere mit mindestens 50 % Marge auf den Einkaufspreis.";

  const strategy =
    strategyMap[riskTolerance]?.[launchGoal] ??
    "Starte klein, lerne schnell, und skaliere bewusst.";

  const prefill = {
    product_description: productType,
    target_audience:
      targetMarket === "mass"
        ? "Breites Publikum, preisbewusst"
        : targetMarket === "niche"
        ? "Spezialisierte Zielgruppe mit klarem Bedarf"
        : "Anspruchsvolle Käufer, qualitätsbewusst",
    price_level: priceLevelFromMarket[targetMarket] ?? "mid",
    budget,
    timeline: timelineFromRisk[riskTolerance] ?? "3-6",
  };

  return { positioning, quantityRange, pricingLogic, strategy, prefill };
}
