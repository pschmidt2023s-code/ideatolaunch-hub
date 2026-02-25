// ─── Packaging Suppliers ─────────────────────────────────────────

export interface PackagingSupplier {
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

export const packagingSuppliers: PackagingSupplier[] = [
  // ── Cosmetics ──
  { name: "EcoPack Solutions (DE)", region: "EU", categories: ["cosmetics"], estimatedMOQ: 500, estimatedUnitCostRange: [0.4, 1.2], leadTimeDays: 14, positioning: "premium", notes: "Nachhaltige Verpackungen, Glastiegel" },
  { name: "Yuyao Packaging Co.", region: "Asia", categories: ["cosmetics"], estimatedMOQ: 2000, estimatedUnitCostRange: [0.1, 0.5], leadTimeDays: 30, positioning: "budget", notes: "Bulk-Verpackungen, Kunststoff" },

  // ── Supplements ──
  { name: "PharmaBox (AT)", region: "EU", categories: ["supplements"], estimatedMOQ: 300, estimatedUnitCostRange: [0.3, 0.9], leadTimeDays: 12, positioning: "premium", notes: "Dosen, Blister, pharmakonform" },
  { name: "Dongguan Label & Pack", region: "Asia", categories: ["supplements"], estimatedMOQ: 3000, estimatedUnitCostRange: [0.05, 0.3], leadTimeDays: 25, positioning: "budget", notes: "Bulk-Etiketten, Faltschachteln" },

  // ── Apparel ──
  { name: "PackStyle (NL)", region: "EU", categories: ["apparel"], estimatedMOQ: 200, estimatedUnitCostRange: [0.5, 2], leadTimeDays: 10, positioning: "premium", notes: "Polybags, Hangtags, Tissue Paper" },
  { name: "Shenzhen Packaging Hub", region: "Asia", categories: ["apparel"], estimatedMOQ: 2000, estimatedUnitCostRange: [0.1, 0.6], leadTimeDays: 28, positioning: "budget", notes: "Custom Boxen, Mailer" },

  // ── Accessories ──
  { name: "LuxBox (DE)", region: "EU", categories: ["accessories"], estimatedMOQ: 100, estimatedUnitCostRange: [1, 4], leadTimeDays: 14, positioning: "premium", notes: "Premium-Boxen, Samtbeutel" },
  { name: "Ningbo Pack Factory", region: "Asia", categories: ["accessories"], estimatedMOQ: 1000, estimatedUnitCostRange: [0.2, 1], leadTimeDays: 25, positioning: "mid", notes: "Standard-Boxen, Pouches" },

  // ── Food ──
  { name: "FreshPack (DE)", region: "EU", categories: ["food"], estimatedMOQ: 500, estimatedUnitCostRange: [0.3, 1], leadTimeDays: 12, positioning: "premium", notes: "Standbeutel, lebensmittelsicher" },
  { name: "Foshan Flexible Pack", region: "Asia", categories: ["food"], estimatedMOQ: 5000, estimatedUnitCostRange: [0.05, 0.3], leadTimeDays: 30, positioning: "budget", notes: "Bulk-Beutel, Folien" },

  // ── Home & Living ──
  { name: "GreenPack Europe (NL)", region: "EU", categories: ["home"], estimatedMOQ: 300, estimatedUnitCostRange: [0.3, 1.2], leadTimeDays: 14, positioning: "premium", notes: "Recycelte Materialien, Kartons" },
  { name: "Wenzhou Label Co.", region: "Asia", categories: ["home"], estimatedMOQ: 3000, estimatedUnitCostRange: [0.05, 0.4], leadTimeDays: 28, positioning: "budget", notes: "Etiketten, Sleeves, Shrink-Wrap" },

  // ── Electronics ──
  { name: "SafeShip Packaging (DE)", region: "EU", categories: ["electronics"], estimatedMOQ: 200, estimatedUnitCostRange: [0.8, 2.5], leadTimeDays: 14, positioning: "premium", notes: "ESD-sicher, Schaumstoff-Inlays" },
  { name: "Shenzhen Box Works", region: "Asia", categories: ["electronics"], estimatedMOQ: 1500, estimatedUnitCostRange: [0.1, 0.6], leadTimeDays: 25, positioning: "budget", notes: "Printed Boxes, Blister Packs" },

  // ── Cross-category / General ──
  { name: "MultiPack (DE)", region: "EU", categories: ["cosmetics", "supplements", "accessories", "food", "home", "electronics", "apparel", "other"], estimatedMOQ: 250, estimatedUnitCostRange: [0.5, 2], leadTimeDays: 14, positioning: "mid", notes: "Breites Sortiment, schnelle Lieferung, Custom Print" },
];
