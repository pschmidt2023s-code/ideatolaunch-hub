// ─── Packaging Suppliers ─────────────────────────────────────────

export interface PackagingSupplier {
  name: string;
  region: "EU" | "Asia";
  categories: string[];
  categoryTags: string[];
  estimatedMOQ: number;
  estimatedUnitCostRange: [number, number];
  leadTimeDays: number;
  positioning: "budget" | "mid" | "premium";
  notes: string;
  website?: string;
  euBased: boolean;
  riskScore: number;
  capitalLockScore: number;
  reliabilityScore: number;
  recommendedFor: string[];
  affiliateAvailable: boolean;
  affiliateUrl?: string;
  partnerId: string;
}

export const packagingSuppliers: PackagingSupplier[] = [
  // ── Cosmetics ──
  { partnerId: "ecopack", name: "EcoPack Solutions (DE)", region: "EU", categories: ["cosmetics"], categoryTags: ["Packaging", "Sustainable"], estimatedMOQ: 500, estimatedUnitCostRange: [0.4, 1.2], leadTimeDays: 14, positioning: "premium", notes: "Nachhaltige Verpackungen, Glastiegel", website: "https://www.ecopack-solutions.de", euBased: true, riskScore: 10, capitalLockScore: 20, reliabilityScore: 92, recommendedFor: ["Premium Brand"], affiliateAvailable: false },
  { partnerId: "yuyao-pack", name: "Yuyao Packaging Co.", region: "Asia", categories: ["cosmetics"], categoryTags: ["Packaging"], estimatedMOQ: 2000, estimatedUnitCostRange: [0.1, 0.5], leadTimeDays: 30, positioning: "budget", notes: "Bulk-Verpackungen, Kunststoff", euBased: false, riskScore: 50, capitalLockScore: 40, reliabilityScore: 65, recommendedFor: ["High Volume"], affiliateAvailable: false },

  // ── Supplements ──
  { partnerId: "pharmabox", name: "PharmaBox (AT)", region: "EU", categories: ["supplements"], categoryTags: ["Packaging", "Pharma"], estimatedMOQ: 300, estimatedUnitCostRange: [0.3, 0.9], leadTimeDays: 12, positioning: "premium", notes: "Dosen, Blister, pharmakonform", website: "https://www.pharmabox.at", euBased: true, riskScore: 8, capitalLockScore: 15, reliabilityScore: 95, recommendedFor: ["Premium Brand", "Fast Launch"], affiliateAvailable: false },
  { partnerId: "dg-label", name: "Dongguan Label & Pack", region: "Asia", categories: ["supplements"], categoryTags: ["Packaging"], estimatedMOQ: 3000, estimatedUnitCostRange: [0.05, 0.3], leadTimeDays: 25, positioning: "budget", notes: "Bulk-Etiketten, Faltschachteln", euBased: false, riskScore: 48, capitalLockScore: 35, reliabilityScore: 62, recommendedFor: ["High Volume"], affiliateAvailable: false },

  // ── Apparel ──
  { partnerId: "packstyle", name: "PackStyle (NL)", region: "EU", categories: ["apparel"], categoryTags: ["Packaging", "Fashion"], estimatedMOQ: 200, estimatedUnitCostRange: [0.5, 2], leadTimeDays: 10, positioning: "premium", notes: "Polybags, Hangtags, Tissue Paper", website: "https://www.packstyle.nl", euBased: true, riskScore: 10, capitalLockScore: 15, reliabilityScore: 90, recommendedFor: ["Premium Brand", "Fast Launch"], affiliateAvailable: false },
  { partnerId: "sz-pack-hub", name: "Shenzhen Packaging Hub", region: "Asia", categories: ["apparel"], categoryTags: ["Packaging"], estimatedMOQ: 2000, estimatedUnitCostRange: [0.1, 0.6], leadTimeDays: 28, positioning: "budget", notes: "Custom Boxen, Mailer", euBased: false, riskScore: 48, capitalLockScore: 40, reliabilityScore: 65, recommendedFor: ["High Volume"], affiliateAvailable: false },

  // ── Accessories ──
  { partnerId: "luxbox", name: "LuxBox (DE)", region: "EU", categories: ["accessories"], categoryTags: ["Packaging", "Premium"], estimatedMOQ: 100, estimatedUnitCostRange: [1, 4], leadTimeDays: 14, positioning: "premium", notes: "Premium-Boxen, Samtbeutel", website: "https://www.luxbox.de", euBased: true, riskScore: 8, capitalLockScore: 15, reliabilityScore: 95, recommendedFor: ["Premium Brand"], affiliateAvailable: false },
  { partnerId: "ningbo-pack", name: "Ningbo Pack Factory", region: "Asia", categories: ["accessories"], categoryTags: ["Packaging"], estimatedMOQ: 1000, estimatedUnitCostRange: [0.2, 1], leadTimeDays: 25, positioning: "mid", notes: "Standard-Boxen, Pouches", euBased: false, riskScore: 42, capitalLockScore: 35, reliabilityScore: 68, recommendedFor: ["High Volume"], affiliateAvailable: false },

  // ── Food ──
  { partnerId: "freshpack", name: "FreshPack (DE)", region: "EU", categories: ["food"], categoryTags: ["Packaging", "Food-Safe"], estimatedMOQ: 500, estimatedUnitCostRange: [0.3, 1], leadTimeDays: 12, positioning: "premium", notes: "Standbeutel, lebensmittelsicher", website: "https://www.freshpack.de", euBased: true, riskScore: 10, capitalLockScore: 20, reliabilityScore: 92, recommendedFor: ["Premium Brand", "Fast Launch"], affiliateAvailable: false },
  { partnerId: "foshan-flex", name: "Foshan Flexible Pack", region: "Asia", categories: ["food"], categoryTags: ["Packaging"], estimatedMOQ: 5000, estimatedUnitCostRange: [0.05, 0.3], leadTimeDays: 30, positioning: "budget", notes: "Bulk-Beutel, Folien", euBased: false, riskScore: 55, capitalLockScore: 50, reliabilityScore: 58, recommendedFor: ["High Volume"], affiliateAvailable: false },

  // ── Home & Living ──
  { partnerId: "greenpack", name: "GreenPack Europe (NL)", region: "EU", categories: ["home"], categoryTags: ["Packaging", "Eco"], estimatedMOQ: 300, estimatedUnitCostRange: [0.3, 1.2], leadTimeDays: 14, positioning: "premium", notes: "Recycelte Materialien, Kartons", website: "https://www.greenpack.eu", euBased: true, riskScore: 10, capitalLockScore: 18, reliabilityScore: 90, recommendedFor: ["Premium Brand"], affiliateAvailable: false },
  { partnerId: "wenzhou-label", name: "Wenzhou Label Co.", region: "Asia", categories: ["home"], categoryTags: ["Packaging"], estimatedMOQ: 3000, estimatedUnitCostRange: [0.05, 0.4], leadTimeDays: 28, positioning: "budget", notes: "Etiketten, Sleeves, Shrink-Wrap", euBased: false, riskScore: 48, capitalLockScore: 35, reliabilityScore: 62, recommendedFor: ["High Volume"], affiliateAvailable: false },

  // ── Electronics ──
  { partnerId: "safeship", name: "SafeShip Packaging (DE)", region: "EU", categories: ["electronics"], categoryTags: ["Packaging", "ESD"], estimatedMOQ: 200, estimatedUnitCostRange: [0.8, 2.5], leadTimeDays: 14, positioning: "premium", notes: "ESD-sicher, Schaumstoff-Inlays", website: "https://www.safeship.de", euBased: true, riskScore: 10, capitalLockScore: 18, reliabilityScore: 92, recommendedFor: ["Premium Brand"], affiliateAvailable: false },
  { partnerId: "sz-box", name: "Shenzhen Box Works", region: "Asia", categories: ["electronics"], categoryTags: ["Packaging"], estimatedMOQ: 1500, estimatedUnitCostRange: [0.1, 0.6], leadTimeDays: 25, positioning: "budget", notes: "Printed Boxes, Blister Packs", euBased: false, riskScore: 45, capitalLockScore: 38, reliabilityScore: 65, recommendedFor: ["High Volume"], affiliateAvailable: false },

  // ── Print / Art ──
  { partnerId: "rahmenwerk", name: "Rahmenwerk (DE)", region: "EU", categories: ["print_art"], categoryTags: ["Packaging", "Framing"], estimatedMOQ: 10, estimatedUnitCostRange: [2, 8], leadTimeDays: 10, positioning: "premium", notes: "Custom-Rahmen, Passepartouts, Versandkartons für Kunst", website: "https://www.rahmenwerk.de", euBased: true, riskScore: 8, capitalLockScore: 10, reliabilityScore: 95, recommendedFor: ["Premium Brand", "Low Budget"], affiliateAvailable: false },
  { partnerId: "artship", name: "ArtShip Packaging (NL)", region: "EU", categories: ["print_art"], categoryTags: ["Packaging", "Art Transport"], estimatedMOQ: 50, estimatedUnitCostRange: [1, 3.5], leadTimeDays: 8, positioning: "mid", notes: "Flatpack-Versandkartons, Kunsttransport-sicher", euBased: true, riskScore: 10, capitalLockScore: 12, reliabilityScore: 88, recommendedFor: ["Fast Launch"], affiliateAvailable: false },

  // ── Cross-category / General ──
  { partnerId: "multipack", name: "MultiPack (DE)", region: "EU", categories: ["cosmetics", "supplements", "accessories", "food", "home", "electronics", "apparel", "print_art", "other"], categoryTags: ["Packaging", "General"], estimatedMOQ: 250, estimatedUnitCostRange: [0.5, 2], leadTimeDays: 14, positioning: "mid", notes: "Breites Sortiment, schnelle Lieferung, Custom Print", website: "https://www.multipack.de", euBased: true, riskScore: 12, capitalLockScore: 18, reliabilityScore: 88, recommendedFor: ["Fast Launch", "Low Budget"], affiliateAvailable: true, affiliateUrl: "https://www.multipack.de/partner/brandos" },
];
