// ─── Unboxing Add-on Suppliers ───────────────────────────────────

export interface AddonSupplier {
  name: string;
  region: "EU" | "Asia";
  categories: string[]; // canonical category ids (empty = all categories)
  estimatedMOQ: number;
  estimatedUnitCostRange: [number, number];
  leadTimeDays: number;
  positioning: "budget" | "mid" | "premium";
  addonType: "tissue_paper" | "sticker" | "thank_you_card" | "custom_box" | "sample_insert" | "ribbon" | "sleeve";
  notes: string;
  website?: string;
}

export const addonSuppliers: AddonSupplier[] = [
  // ── Tissue Paper / Seidenpapier ──
  { name: "SilkWrap (DE)", region: "EU", categories: [], estimatedMOQ: 500, estimatedUnitCostRange: [0.05, 0.15], leadTimeDays: 7, positioning: "mid", addonType: "tissue_paper", notes: "Seidenpapier mit Logo-Druck, recycelbar" },
  { name: "Yiwu Tissue Factory", region: "Asia", categories: [], estimatedMOQ: 5000, estimatedUnitCostRange: [0.01, 0.05], leadTimeDays: 20, positioning: "budget", addonType: "tissue_paper", notes: "Bulk Seidenpapier, Custom-Farben" },

  // ── Sticker / Labels ──
  { name: "StickerGiant (DE)", region: "EU", categories: [], estimatedMOQ: 100, estimatedUnitCostRange: [0.08, 0.25], leadTimeDays: 5, positioning: "mid", addonType: "sticker", notes: "Vinyl & Papier-Sticker, diverse Formen" },
  { name: "Dongguan Sticker Co.", region: "Asia", categories: [], estimatedMOQ: 3000, estimatedUnitCostRange: [0.01, 0.08], leadTimeDays: 18, positioning: "budget", addonType: "sticker", notes: "Hologramm, Gold-Folie, Custom Die-Cut" },

  // ── Thank-You Cards ──
  { name: "Papeterie Studio (DE)", region: "EU", categories: [], estimatedMOQ: 200, estimatedUnitCostRange: [0.1, 0.4], leadTimeDays: 7, positioning: "premium", addonType: "thank_you_card", notes: "Premium-Papier, Letterpress, Custom Design" },
  { name: "Wenzhou Card Print", region: "Asia", categories: [], estimatedMOQ: 2000, estimatedUnitCostRange: [0.02, 0.1], leadTimeDays: 15, positioning: "budget", addonType: "thank_you_card", notes: "Offset-Druck, CMYK, Veredelungen" },

  // ── Custom Boxes / Sleeves ──
  { name: "BoxUp (NL)", region: "EU", categories: [], estimatedMOQ: 100, estimatedUnitCostRange: [0.8, 3], leadTimeDays: 10, positioning: "premium", addonType: "custom_box", notes: "Mailer-Boxen, Magnetic Closure, Rigid Boxes" },
  { name: "Shenzhen Luxe Pack", region: "Asia", categories: [], estimatedMOQ: 500, estimatedUnitCostRange: [0.3, 1.5], leadTimeDays: 22, positioning: "mid", addonType: "custom_box", notes: "Custom Rigid Boxes, Spot UV, Folien-Prägung" },

  // ── Sample Inserts ──
  { name: "PromoInsert (DE)", region: "EU", categories: [], estimatedMOQ: 300, estimatedUnitCostRange: [0.15, 0.5], leadTimeDays: 8, positioning: "mid", addonType: "sample_insert", notes: "Proben-Beilagen, Flyer, Discount-Codes" },
  { name: "Guangzhou Print & Pack", region: "Asia", categories: [], estimatedMOQ: 2000, estimatedUnitCostRange: [0.03, 0.12], leadTimeDays: 18, positioning: "budget", addonType: "sample_insert", notes: "Bulk-Flyer, Coupons, Sample-Sachets" },

  // ── Ribbons / Bänder ──
  { name: "BandWerk (DE)", region: "EU", categories: [], estimatedMOQ: 100, estimatedUnitCostRange: [0.1, 0.35], leadTimeDays: 7, positioning: "premium", addonType: "ribbon", notes: "Satinband mit Logo, Geschenkband" },
];
