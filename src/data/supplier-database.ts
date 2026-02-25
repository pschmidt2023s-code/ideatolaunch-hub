// ─── Structured Supplier Database ───────────────────────────────
// Deterministic dataset. No external API calls.
// Categories: Cosmetics, Supplements, Apparel, Accessories, Food, General FMCG

export interface Supplier {
  name: string;
  region: string;
  estimatedMOQ: number;
  estimatedUnitCostRange: [number, number];
  leadTimeDays: number;
  bestFor: string;
  website?: string;
  type: "production" | "packaging";
  categories: string[];
  priceSegments: ("low" | "mid" | "premium")[];
}

export const suppliers: Supplier[] = [
  // ═══════════════════════════════════════════
  // COSMETICS — Production
  // ═══════════════════════════════════════════
  { name: "Cosmetica Europa (DE)", region: "EU", estimatedMOQ: 100, estimatedUnitCostRange: [3.5, 8], leadTimeDays: 21, bestFor: "Kleine Serien, Naturkosmetik, schnelle Iteration", type: "production", categories: ["Cosmetics"], priceSegments: ["mid", "premium"] },
  { name: "Laboratoire Beauté (FR)", region: "EU", estimatedMOQ: 250, estimatedUnitCostRange: [2.8, 6], leadTimeDays: 28, bestFor: "Zertifizierte Bio-Kosmetik, EU-Compliance", type: "production", categories: ["Cosmetics"], priceSegments: ["mid", "premium"] },
  { name: "PolCosmetics (PL)", region: "EU", estimatedMOQ: 200, estimatedUnitCostRange: [1.8, 4.5], leadTimeDays: 18, bestFor: "Preis-Leistung, große Produktpalette", type: "production", categories: ["Cosmetics"], priceSegments: ["low", "mid"] },
  { name: "Guangzhou Beauty Lab", region: "Asia", estimatedMOQ: 1000, estimatedUnitCostRange: [0.8, 2.5], leadTimeDays: 45, bestFor: "Hohe Stückzahlen, niedrige Kosten", type: "production", categories: ["Cosmetics"], priceSegments: ["low", "mid"] },
  { name: "Shanghai Cosmetic OEM", region: "Asia", estimatedMOQ: 500, estimatedUnitCostRange: [1.2, 3], leadTimeDays: 40, bestFor: "Flexible Formulierungen, mittlere MOQs", type: "production", categories: ["Cosmetics"], priceSegments: ["low", "mid"] },
  { name: "Korea Beauty Manufacturing", region: "Asia", estimatedMOQ: 300, estimatedUnitCostRange: [2, 5], leadTimeDays: 35, bestFor: "K-Beauty Trends, innovative Texturen", type: "production", categories: ["Cosmetics"], priceSegments: ["mid", "premium"] },

  // COSMETICS — Packaging
  { name: "EcoPack Solutions (DE)", region: "EU", estimatedMOQ: 500, estimatedUnitCostRange: [0.4, 1.2], leadTimeDays: 14, bestFor: "Nachhaltige Verpackungen, Glastiegel", type: "packaging", categories: ["Cosmetics"], priceSegments: ["mid", "premium"] },
  { name: "Yuyao Packaging Co.", region: "Asia", estimatedMOQ: 2000, estimatedUnitCostRange: [0.1, 0.5], leadTimeDays: 30, bestFor: "Bulk-Verpackungen, Kunststoff", type: "packaging", categories: ["Cosmetics"], priceSegments: ["low", "mid"] },

  // ═══════════════════════════════════════════
  // SUPPLEMENTS — Production
  // ═══════════════════════════════════════════
  { name: "VitaWerk (DE)", region: "EU", estimatedMOQ: 150, estimatedUnitCostRange: [2, 6], leadTimeDays: 25, bestFor: "GMP-zertifiziert, Kapseln & Pulver", type: "production", categories: ["Supplements"], priceSegments: ["mid", "premium"] },
  { name: "NutriLab Italia (IT)", region: "EU", estimatedMOQ: 300, estimatedUnitCostRange: [1.5, 4], leadTimeDays: 30, bestFor: "Tabletten, EU-Novel-Food-konform", type: "production", categories: ["Supplements"], priceSegments: ["mid", "premium"] },
  { name: "BalticSupps (LT)", region: "EU", estimatedMOQ: 200, estimatedUnitCostRange: [1.2, 3.5], leadTimeDays: 20, bestFor: "Preiswert, schnelle Lieferung", type: "production", categories: ["Supplements"], priceSegments: ["low", "mid"] },
  { name: "Xi'an Health Biotech", region: "Asia", estimatedMOQ: 1000, estimatedUnitCostRange: [0.5, 1.8], leadTimeDays: 45, bestFor: "Rohstoffe & Bulk-Kapseln", type: "production", categories: ["Supplements"], priceSegments: ["low"] },
  { name: "Nanjing NutraChem", region: "Asia", estimatedMOQ: 500, estimatedUnitCostRange: [0.8, 2.5], leadTimeDays: 40, bestFor: "Custom-Formulierungen, Pulver", type: "production", categories: ["Supplements"], priceSegments: ["low", "mid"] },
  { name: "Vietnam Pharma Works", region: "Asia", estimatedMOQ: 800, estimatedUnitCostRange: [0.6, 2], leadTimeDays: 42, bestFor: "Gummies, Softgels", type: "production", categories: ["Supplements"], priceSegments: ["low", "mid"] },

  // SUPPLEMENTS — Packaging
  { name: "PharmaBox (AT)", region: "EU", estimatedMOQ: 300, estimatedUnitCostRange: [0.3, 0.9], leadTimeDays: 12, bestFor: "Dosen, Blister, pharmakonform", type: "packaging", categories: ["Supplements"], priceSegments: ["mid", "premium"] },
  { name: "Dongguan Label & Pack", region: "Asia", estimatedMOQ: 3000, estimatedUnitCostRange: [0.05, 0.3], leadTimeDays: 25, bestFor: "Bulk-Etiketten, Faltschachteln", type: "packaging", categories: ["Supplements"], priceSegments: ["low", "mid"] },

  // ═══════════════════════════════════════════
  // APPAREL — Production
  // ═══════════════════════════════════════════
  { name: "TextilWerk Berlin (DE)", region: "EU", estimatedMOQ: 50, estimatedUnitCostRange: [12, 35], leadTimeDays: 21, bestFor: "Streetwear, Kleinserien, Print-on-Demand", type: "production", categories: ["Apparel"], priceSegments: ["mid", "premium"] },
  { name: "Porto Textile (PT)", region: "EU", estimatedMOQ: 150, estimatedUnitCostRange: [8, 25], leadTimeDays: 28, bestFor: "Nachhaltige Stoffe, Cut & Sew", type: "production", categories: ["Apparel"], priceSegments: ["mid", "premium"] },
  { name: "Istanbul Garment Co. (TR)", region: "EU", estimatedMOQ: 200, estimatedUnitCostRange: [5, 15], leadTimeDays: 25, bestFor: "Preis-Leistung, T-Shirts & Hoodies", type: "production", categories: ["Apparel"], priceSegments: ["low", "mid"] },
  { name: "Guangzhou Apparel Factory", region: "Asia", estimatedMOQ: 500, estimatedUnitCostRange: [2, 8], leadTimeDays: 40, bestFor: "Große Stückzahlen, breite Palette", type: "production", categories: ["Apparel"], priceSegments: ["low", "mid"] },
  { name: "Ho Chi Minh Textiles", region: "Asia", estimatedMOQ: 300, estimatedUnitCostRange: [3, 10], leadTimeDays: 35, bestFor: "Activewear, technische Stoffe", type: "production", categories: ["Apparel"], priceSegments: ["low", "mid"] },
  { name: "Bangladesh Ready Garment", region: "Asia", estimatedMOQ: 1000, estimatedUnitCostRange: [1.5, 6], leadTimeDays: 50, bestFor: "Basics, maximale Kostenersparnis", type: "production", categories: ["Apparel"], priceSegments: ["low"] },

  // APPAREL — Packaging
  { name: "PackStyle (NL)", region: "EU", estimatedMOQ: 200, estimatedUnitCostRange: [0.5, 2], leadTimeDays: 10, bestFor: "Polybags, Hangtags, Tissue Paper", type: "packaging", categories: ["Apparel"], priceSegments: ["mid", "premium"] },
  { name: "Shenzhen Packaging Hub", region: "Asia", estimatedMOQ: 2000, estimatedUnitCostRange: [0.1, 0.6], leadTimeDays: 28, bestFor: "Custom Boxen, Mailer", type: "packaging", categories: ["Apparel"], priceSegments: ["low", "mid"] },

  // ═══════════════════════════════════════════
  // ACCESSORIES — Production
  // ═══════════════════════════════════════════
  { name: "SchmuckManufaktur (DE)", region: "EU", estimatedMOQ: 30, estimatedUnitCostRange: [5, 20], leadTimeDays: 14, bestFor: "Schmuck, Kleinserien, handgefertigt", type: "production", categories: ["Accessories"], priceSegments: ["premium"] },
  { name: "Accessory Atelier (IT)", region: "EU", estimatedMOQ: 100, estimatedUnitCostRange: [4, 15], leadTimeDays: 21, bestFor: "Lederwaren, Gürtel, Taschen", type: "production", categories: ["Accessories"], priceSegments: ["mid", "premium"] },
  { name: "Baltic Accessories (EE)", region: "EU", estimatedMOQ: 80, estimatedUnitCostRange: [2, 8], leadTimeDays: 18, bestFor: "Handyhüllen, Keychains, Basics", type: "production", categories: ["Accessories"], priceSegments: ["low", "mid"] },
  { name: "Yiwu Small Goods Market", region: "Asia", estimatedMOQ: 500, estimatedUnitCostRange: [0.5, 3], leadTimeDays: 35, bestFor: "Bulk-Schmuck, Modeschmuck", type: "production", categories: ["Accessories"], priceSegments: ["low"] },
  { name: "Dongguan Hardware Factory", region: "Asia", estimatedMOQ: 300, estimatedUnitCostRange: [1, 5], leadTimeDays: 30, bestFor: "Metallteile, Schnallen, Verschlüsse", type: "production", categories: ["Accessories"], priceSegments: ["low", "mid"] },
  { name: "Shenzhen Gadget Works", region: "Asia", estimatedMOQ: 200, estimatedUnitCostRange: [2, 8], leadTimeDays: 32, bestFor: "Tech-Accessories, Custom Cases", type: "production", categories: ["Accessories"], priceSegments: ["mid"] },

  // ACCESSORIES — Packaging
  { name: "LuxBox (DE)", region: "EU", estimatedMOQ: 100, estimatedUnitCostRange: [1, 4], leadTimeDays: 14, bestFor: "Premium-Boxen, Samtbeutel", type: "packaging", categories: ["Accessories"], priceSegments: ["premium"] },
  { name: "Ningbo Pack Factory", region: "Asia", estimatedMOQ: 1000, estimatedUnitCostRange: [0.2, 1], leadTimeDays: 25, bestFor: "Standard-Boxen, Pouches", type: "packaging", categories: ["Accessories"], priceSegments: ["low", "mid"] },

  // ═══════════════════════════════════════════
  // FOOD — Production
  // ═══════════════════════════════════════════
  { name: "FoodManufaktur (DE)", region: "EU", estimatedMOQ: 200, estimatedUnitCostRange: [2, 7], leadTimeDays: 21, bestFor: "Snacks, Riegel, EU-Lebensmittelrecht", type: "production", categories: ["Food"], priceSegments: ["mid", "premium"] },
  { name: "BioFactory (AT)", region: "EU", estimatedMOQ: 300, estimatedUnitCostRange: [1.5, 5], leadTimeDays: 25, bestFor: "Bio-Zertifizierung, Trockenprodukte", type: "production", categories: ["Food"], priceSegments: ["mid", "premium"] },
  { name: "Holland Food Works (NL)", region: "EU", estimatedMOQ: 150, estimatedUnitCostRange: [1.8, 6], leadTimeDays: 18, bestFor: "Getränke, Saucen, Flüssigprodukte", type: "production", categories: ["Food"], priceSegments: ["low", "mid"] },
  { name: "Shandong Food Processing", region: "Asia", estimatedMOQ: 1000, estimatedUnitCostRange: [0.4, 2], leadTimeDays: 50, bestFor: "Tee, Gewürze, getrocknete Produkte", type: "production", categories: ["Food"], priceSegments: ["low"] },
  { name: "Thailand Snack Co.", region: "Asia", estimatedMOQ: 500, estimatedUnitCostRange: [0.6, 2.5], leadTimeDays: 42, bestFor: "Exotic Snacks, Kokosnuss-Produkte", type: "production", categories: ["Food"], priceSegments: ["low", "mid"] },
  { name: "Vietnam Dry Goods", region: "Asia", estimatedMOQ: 800, estimatedUnitCostRange: [0.3, 1.5], leadTimeDays: 45, bestFor: "Nüsse, Trockenfrüchte, Bulk", type: "production", categories: ["Food"], priceSegments: ["low"] },

  // FOOD — Packaging
  { name: "FreshPack (DE)", region: "EU", estimatedMOQ: 500, estimatedUnitCostRange: [0.3, 1], leadTimeDays: 12, bestFor: "Standbeutel, lebensmittelsicher", type: "packaging", categories: ["Food"], priceSegments: ["mid", "premium"] },
  { name: "Foshan Flexible Pack", region: "Asia", estimatedMOQ: 5000, estimatedUnitCostRange: [0.05, 0.3], leadTimeDays: 30, bestFor: "Bulk-Beutel, Folien", type: "packaging", categories: ["Food"], priceSegments: ["low"] },

  // ═══════════════════════════════════════════
  // GENERAL FMCG — Production
  // ═══════════════════════════════════════════
  { name: "FMCG Solutions (DE)", region: "EU", estimatedMOQ: 200, estimatedUnitCostRange: [1.5, 6], leadTimeDays: 21, bestFor: "Haushaltsprodukte, Reinigungsmittel", type: "production", categories: ["General FMCG"], priceSegments: ["mid"] },
  { name: "CleanTech Manufactur (PL)", region: "EU", estimatedMOQ: 300, estimatedUnitCostRange: [1, 4], leadTimeDays: 18, bestFor: "Private Label, Waschmittel, Seifen", type: "production", categories: ["General FMCG"], priceSegments: ["low", "mid"] },
  { name: "Nordic Home (SE)", region: "EU", estimatedMOQ: 100, estimatedUnitCostRange: [3, 10], leadTimeDays: 25, bestFor: "Premium Kerzen, Raumdüfte", type: "production", categories: ["General FMCG"], priceSegments: ["mid", "premium"] },
  { name: "Zhongshan FMCG Plant", region: "Asia", estimatedMOQ: 1000, estimatedUnitCostRange: [0.3, 2], leadTimeDays: 40, bestFor: "Massenproduktion, Low-Cost", type: "production", categories: ["General FMCG"], priceSegments: ["low"] },
  { name: "Ningbo Daily Goods", region: "Asia", estimatedMOQ: 500, estimatedUnitCostRange: [0.5, 2.5], leadTimeDays: 35, bestFor: "Bad & Körper, Haushalt", type: "production", categories: ["General FMCG"], priceSegments: ["low", "mid"] },
  { name: "Hanoi Consumer Goods", region: "Asia", estimatedMOQ: 600, estimatedUnitCostRange: [0.4, 2], leadTimeDays: 38, bestFor: "Eco-Produkte, Bambus, Papier", type: "production", categories: ["General FMCG"], priceSegments: ["low", "mid"] },

  // GENERAL FMCG — Packaging
  { name: "GreenPack Europe (NL)", region: "EU", estimatedMOQ: 300, estimatedUnitCostRange: [0.3, 1.2], leadTimeDays: 14, bestFor: "Recycelte Materialien, Kartons", type: "packaging", categories: ["General FMCG"], priceSegments: ["mid", "premium"] },
  { name: "Wenzhou Label Co.", region: "Asia", estimatedMOQ: 3000, estimatedUnitCostRange: [0.05, 0.4], leadTimeDays: 28, bestFor: "Etiketten, Sleeves, Shrink-Wrap", type: "packaging", categories: ["General FMCG"], priceSegments: ["low"] },
];

export function getSuppliersByCategory(category: string): Supplier[] {
  const normalised = category.toLowerCase();
  return suppliers.filter((s) =>
    s.categories.some((c) => c.toLowerCase().includes(normalised))
  );
}
