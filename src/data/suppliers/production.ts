// ─── Production Suppliers ────────────────────────────────────────

export interface ProductionSupplier {
  name: string;
  region: "EU" | "Asia";
  categories: string[]; // canonical category ids
  estimatedMOQ: number;
  estimatedUnitCostRange: [number, number];
  leadTimeDays: number;
  positioning: "budget" | "mid" | "premium";
  notes: string;
  website?: string;
}

export const productionSuppliers: ProductionSupplier[] = [
  // ── Cosmetics ──
  { name: "Cosmetica Europa (DE)", region: "EU", categories: ["cosmetics"], estimatedMOQ: 100, estimatedUnitCostRange: [3.5, 8], leadTimeDays: 21, positioning: "premium", notes: "Kleine Serien, Naturkosmetik, schnelle Iteration" },
  { name: "Laboratoire Beauté (FR)", region: "EU", categories: ["cosmetics"], estimatedMOQ: 250, estimatedUnitCostRange: [2.8, 6], leadTimeDays: 28, positioning: "premium", notes: "Zertifizierte Bio-Kosmetik, EU-Compliance" },
  { name: "PolCosmetics (PL)", region: "EU", categories: ["cosmetics"], estimatedMOQ: 200, estimatedUnitCostRange: [1.8, 4.5], leadTimeDays: 18, positioning: "mid", notes: "Preis-Leistung, große Produktpalette" },
  { name: "Guangzhou Beauty Lab", region: "Asia", categories: ["cosmetics"], estimatedMOQ: 1000, estimatedUnitCostRange: [0.8, 2.5], leadTimeDays: 45, positioning: "budget", notes: "Hohe Stückzahlen, niedrige Kosten" },
  { name: "Shanghai Cosmetic OEM", region: "Asia", categories: ["cosmetics"], estimatedMOQ: 500, estimatedUnitCostRange: [1.2, 3], leadTimeDays: 40, positioning: "mid", notes: "Flexible Formulierungen, mittlere MOQs" },
  { name: "Korea Beauty Manufacturing", region: "Asia", categories: ["cosmetics"], estimatedMOQ: 300, estimatedUnitCostRange: [2, 5], leadTimeDays: 35, positioning: "premium", notes: "K-Beauty Trends, innovative Texturen" },

  // ── Supplements ──
  { name: "VitaWerk (DE)", region: "EU", categories: ["supplements"], estimatedMOQ: 150, estimatedUnitCostRange: [2, 6], leadTimeDays: 25, positioning: "premium", notes: "GMP-zertifiziert, Kapseln & Pulver" },
  { name: "NutriLab Italia (IT)", region: "EU", categories: ["supplements"], estimatedMOQ: 300, estimatedUnitCostRange: [1.5, 4], leadTimeDays: 30, positioning: "mid", notes: "Tabletten, EU-Novel-Food-konform" },
  { name: "BalticSupps (LT)", region: "EU", categories: ["supplements"], estimatedMOQ: 200, estimatedUnitCostRange: [1.2, 3.5], leadTimeDays: 20, positioning: "mid", notes: "Preiswert, schnelle Lieferung" },
  { name: "Xi'an Health Biotech", region: "Asia", categories: ["supplements"], estimatedMOQ: 1000, estimatedUnitCostRange: [0.5, 1.8], leadTimeDays: 45, positioning: "budget", notes: "Rohstoffe & Bulk-Kapseln" },
  { name: "Nanjing NutraChem", region: "Asia", categories: ["supplements"], estimatedMOQ: 500, estimatedUnitCostRange: [0.8, 2.5], leadTimeDays: 40, positioning: "mid", notes: "Custom-Formulierungen, Pulver" },
  { name: "Vietnam Pharma Works", region: "Asia", categories: ["supplements"], estimatedMOQ: 800, estimatedUnitCostRange: [0.6, 2], leadTimeDays: 42, positioning: "budget", notes: "Gummies, Softgels" },

  // ── Apparel ──
  { name: "TextilWerk Berlin (DE)", region: "EU", categories: ["apparel"], estimatedMOQ: 50, estimatedUnitCostRange: [12, 35], leadTimeDays: 21, positioning: "premium", notes: "Streetwear, Kleinserien, Print-on-Demand" },
  { name: "Porto Textile (PT)", region: "EU", categories: ["apparel"], estimatedMOQ: 150, estimatedUnitCostRange: [8, 25], leadTimeDays: 28, positioning: "premium", notes: "Nachhaltige Stoffe, Cut & Sew" },
  { name: "Istanbul Garment Co. (TR)", region: "EU", categories: ["apparel"], estimatedMOQ: 200, estimatedUnitCostRange: [5, 15], leadTimeDays: 25, positioning: "mid", notes: "Preis-Leistung, T-Shirts & Hoodies" },
  { name: "Guangzhou Apparel Factory", region: "Asia", categories: ["apparel"], estimatedMOQ: 500, estimatedUnitCostRange: [2, 8], leadTimeDays: 40, positioning: "budget", notes: "Große Stückzahlen, breite Palette" },
  { name: "Ho Chi Minh Textiles", region: "Asia", categories: ["apparel"], estimatedMOQ: 300, estimatedUnitCostRange: [3, 10], leadTimeDays: 35, positioning: "mid", notes: "Activewear, technische Stoffe" },
  { name: "Bangladesh Ready Garment", region: "Asia", categories: ["apparel"], estimatedMOQ: 1000, estimatedUnitCostRange: [1.5, 6], leadTimeDays: 50, positioning: "budget", notes: "Basics, maximale Kostenersparnis" },

  // ── Accessories ──
  { name: "SchmuckManufaktur (DE)", region: "EU", categories: ["accessories"], estimatedMOQ: 30, estimatedUnitCostRange: [5, 20], leadTimeDays: 14, positioning: "premium", notes: "Schmuck, Kleinserien, handgefertigt" },
  { name: "Accessory Atelier (IT)", region: "EU", categories: ["accessories"], estimatedMOQ: 100, estimatedUnitCostRange: [4, 15], leadTimeDays: 21, positioning: "premium", notes: "Lederwaren, Gürtel, Taschen" },
  { name: "Baltic Accessories (EE)", region: "EU", categories: ["accessories"], estimatedMOQ: 80, estimatedUnitCostRange: [2, 8], leadTimeDays: 18, positioning: "mid", notes: "Handyhüllen, Keychains, Basics" },
  { name: "Yiwu Small Goods Market", region: "Asia", categories: ["accessories"], estimatedMOQ: 500, estimatedUnitCostRange: [0.5, 3], leadTimeDays: 35, positioning: "budget", notes: "Bulk-Schmuck, Modeschmuck" },
  { name: "Dongguan Hardware Factory", region: "Asia", categories: ["accessories"], estimatedMOQ: 300, estimatedUnitCostRange: [1, 5], leadTimeDays: 30, positioning: "mid", notes: "Metallteile, Schnallen, Verschlüsse" },
  { name: "Shenzhen Gadget Works", region: "Asia", categories: ["accessories", "electronics"], estimatedMOQ: 200, estimatedUnitCostRange: [2, 8], leadTimeDays: 32, positioning: "mid", notes: "Tech-Accessories, Custom Cases" },

  // ── Food ──
  { name: "FoodManufaktur (DE)", region: "EU", categories: ["food"], estimatedMOQ: 200, estimatedUnitCostRange: [2, 7], leadTimeDays: 21, positioning: "premium", notes: "Snacks, Riegel, EU-Lebensmittelrecht" },
  { name: "BioFactory (AT)", region: "EU", categories: ["food"], estimatedMOQ: 300, estimatedUnitCostRange: [1.5, 5], leadTimeDays: 25, positioning: "premium", notes: "Bio-Zertifizierung, Trockenprodukte" },
  { name: "Holland Food Works (NL)", region: "EU", categories: ["food"], estimatedMOQ: 150, estimatedUnitCostRange: [1.8, 6], leadTimeDays: 18, positioning: "mid", notes: "Getränke, Saucen, Flüssigprodukte" },
  { name: "Shandong Food Processing", region: "Asia", categories: ["food"], estimatedMOQ: 1000, estimatedUnitCostRange: [0.4, 2], leadTimeDays: 50, positioning: "budget", notes: "Tee, Gewürze, getrocknete Produkte" },
  { name: "Thailand Snack Co.", region: "Asia", categories: ["food"], estimatedMOQ: 500, estimatedUnitCostRange: [0.6, 2.5], leadTimeDays: 42, positioning: "mid", notes: "Exotic Snacks, Kokosnuss-Produkte" },
  { name: "Vietnam Dry Goods", region: "Asia", categories: ["food"], estimatedMOQ: 800, estimatedUnitCostRange: [0.3, 1.5], leadTimeDays: 45, positioning: "budget", notes: "Nüsse, Trockenfrüchte, Bulk" },

  // ── Home & Living ──
  { name: "Nordic Home (SE)", region: "EU", categories: ["home"], estimatedMOQ: 100, estimatedUnitCostRange: [3, 10], leadTimeDays: 25, positioning: "premium", notes: "Premium Kerzen, Raumdüfte" },
  { name: "FMCG Solutions (DE)", region: "EU", categories: ["home"], estimatedMOQ: 200, estimatedUnitCostRange: [1.5, 6], leadTimeDays: 21, positioning: "mid", notes: "Haushaltsprodukte, Reinigungsmittel" },
  { name: "CleanTech Manufactur (PL)", region: "EU", categories: ["home"], estimatedMOQ: 300, estimatedUnitCostRange: [1, 4], leadTimeDays: 18, positioning: "mid", notes: "Private Label, Waschmittel, Seifen" },
  { name: "Zhongshan FMCG Plant", region: "Asia", categories: ["home"], estimatedMOQ: 1000, estimatedUnitCostRange: [0.3, 2], leadTimeDays: 40, positioning: "budget", notes: "Massenproduktion, Low-Cost" },
  { name: "Ningbo Daily Goods", region: "Asia", categories: ["home"], estimatedMOQ: 500, estimatedUnitCostRange: [0.5, 2.5], leadTimeDays: 35, positioning: "mid", notes: "Bad & Körper, Haushalt" },
  { name: "Hanoi Consumer Goods", region: "Asia", categories: ["home"], estimatedMOQ: 600, estimatedUnitCostRange: [0.4, 2], leadTimeDays: 38, positioning: "budget", notes: "Eco-Produkte, Bambus, Papier" },

  // ── Electronics ──
  { name: "Shenzhen Circuit Works", region: "Asia", categories: ["electronics"], estimatedMOQ: 500, estimatedUnitCostRange: [3, 15], leadTimeDays: 35, positioning: "mid", notes: "PCB Assembly, IoT-Geräte" },
  { name: "Dongguan Electronics OEM", region: "Asia", categories: ["electronics"], estimatedMOQ: 1000, estimatedUnitCostRange: [1.5, 8], leadTimeDays: 40, positioning: "budget", notes: "Consumer Electronics, Bulk" },
  { name: "TechForm Europe (CZ)", region: "EU", categories: ["electronics"], estimatedMOQ: 100, estimatedUnitCostRange: [8, 30], leadTimeDays: 28, positioning: "premium", notes: "Prototypen, Kleinserien, CE-konform" },

  // ── Print / Art ──
  { name: "Printful", region: "EU", categories: ["print_art"], estimatedMOQ: 1, estimatedUnitCostRange: [8, 25], leadTimeDays: 5, positioning: "mid", notes: "Print-on-Demand, Poster, Leinwände, T-Shirts", website: "https://www.printful.com" },
  { name: "Gelato", region: "EU", categories: ["print_art"], estimatedMOQ: 1, estimatedUnitCostRange: [6, 20], leadTimeDays: 5, positioning: "mid", notes: "Globaler Print-on-Demand, lokale Produktion", website: "https://www.gelato.com" },
  { name: "WHCC (White House Custom Colour)", region: "EU", categories: ["print_art"], estimatedMOQ: 1, estimatedUnitCostRange: [12, 50], leadTimeDays: 7, positioning: "premium", notes: "Fine Art Prints, Museum-Qualität", website: "https://www.whcc.com" },
  { name: "Hahnemühle FineArt", region: "EU", categories: ["print_art"], estimatedMOQ: 10, estimatedUnitCostRange: [15, 60], leadTimeDays: 14, positioning: "premium", notes: "Premium Fine Art Druckpapiere & Prints", website: "https://www.hahnemuehle.com" },
  { name: "Prodigi", region: "EU", categories: ["print_art"], estimatedMOQ: 1, estimatedUnitCostRange: [5, 18], leadTimeDays: 5, positioning: "budget", notes: "Print-on-Demand API, Wandbilder, Poster", website: "https://www.prodigi.com" },
  { name: "Shenzhen Canvas Factory", region: "Asia", categories: ["print_art"], estimatedMOQ: 50, estimatedUnitCostRange: [3, 12], leadTimeDays: 25, positioning: "budget", notes: "Bulk-Leinwände, gerahmte Drucke", website: undefined },
];
