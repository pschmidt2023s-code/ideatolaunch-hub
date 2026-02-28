// ─── Unboxing Add-on Suppliers ───────────────────────────────────

export interface AddonSupplier {
  name: string;
  region: "EU" | "Asia";
  categories: string[];
  categoryTags: string[];
  estimatedMOQ: number;
  estimatedUnitCostRange: [number, number];
  leadTimeDays: number;
  positioning: "budget" | "mid" | "premium";
  addonType: "tissue_paper" | "sticker" | "thank_you_card" | "custom_box" | "sample_insert" | "ribbon" | "sleeve";
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

export const addonSuppliers: AddonSupplier[] = [
  { partnerId: "silkwrap", name: "SilkWrap (DE)", region: "EU", categories: [], categoryTags: ["Add-on", "Tissue"], estimatedMOQ: 500, estimatedUnitCostRange: [0.05, 0.15], leadTimeDays: 7, positioning: "mid", addonType: "tissue_paper", notes: "Seidenpapier mit Logo-Druck, recycelbar", website: "https://www.silkwrap.de", euBased: true, riskScore: 5, capitalLockScore: 5, reliabilityScore: 90, recommendedFor: ["Premium Brand", "Fast Launch"], affiliateAvailable: false },
  { partnerId: "yiwu-tissue", name: "Yiwu Tissue Factory", region: "Asia", categories: [], categoryTags: ["Add-on", "Tissue"], estimatedMOQ: 5000, estimatedUnitCostRange: [0.01, 0.05], leadTimeDays: 20, positioning: "budget", addonType: "tissue_paper", notes: "Bulk Seidenpapier, Custom-Farben", euBased: false, riskScore: 40, capitalLockScore: 20, reliabilityScore: 65, recommendedFor: ["High Volume"], affiliateAvailable: false },

  { partnerId: "stickergiant", name: "StickerGiant (DE)", region: "EU", categories: [], categoryTags: ["Add-on", "Sticker"], estimatedMOQ: 100, estimatedUnitCostRange: [0.08, 0.25], leadTimeDays: 5, positioning: "mid", addonType: "sticker", notes: "Vinyl & Papier-Sticker, diverse Formen", website: "https://www.stickergiant.de", euBased: true, riskScore: 5, capitalLockScore: 5, reliabilityScore: 92, recommendedFor: ["Low Budget", "Fast Launch"], affiliateAvailable: true, affiliateUrl: "https://www.stickergiant.de/ref/brandos" },
  { partnerId: "dg-sticker", name: "Dongguan Sticker Co.", region: "Asia", categories: [], categoryTags: ["Add-on", "Sticker"], estimatedMOQ: 3000, estimatedUnitCostRange: [0.01, 0.08], leadTimeDays: 18, positioning: "budget", addonType: "sticker", notes: "Hologramm, Gold-Folie, Custom Die-Cut", euBased: false, riskScore: 42, capitalLockScore: 20, reliabilityScore: 65, recommendedFor: ["High Volume"], affiliateAvailable: false },

  { partnerId: "papeterie", name: "Papeterie Studio (DE)", region: "EU", categories: [], categoryTags: ["Add-on", "Cards"], estimatedMOQ: 200, estimatedUnitCostRange: [0.1, 0.4], leadTimeDays: 7, positioning: "premium", addonType: "thank_you_card", notes: "Premium-Papier, Letterpress, Custom Design", website: "https://www.papeterie-studio.de", euBased: true, riskScore: 5, capitalLockScore: 8, reliabilityScore: 95, recommendedFor: ["Premium Brand"], affiliateAvailable: false },
  { partnerId: "wenzhou-card", name: "Wenzhou Card Print", region: "Asia", categories: [], categoryTags: ["Add-on", "Cards"], estimatedMOQ: 2000, estimatedUnitCostRange: [0.02, 0.1], leadTimeDays: 15, positioning: "budget", addonType: "thank_you_card", notes: "Offset-Druck, CMYK, Veredelungen", euBased: false, riskScore: 40, capitalLockScore: 15, reliabilityScore: 65, recommendedFor: ["High Volume"], affiliateAvailable: false },

  { partnerId: "boxup", name: "BoxUp (NL)", region: "EU", categories: [], categoryTags: ["Add-on", "Custom Box"], estimatedMOQ: 100, estimatedUnitCostRange: [0.8, 3], leadTimeDays: 10, positioning: "premium", addonType: "custom_box", notes: "Mailer-Boxen, Magnetic Closure, Rigid Boxes", website: "https://www.boxup.nl", euBased: true, riskScore: 8, capitalLockScore: 12, reliabilityScore: 92, recommendedFor: ["Premium Brand", "Fast Launch"], affiliateAvailable: true, affiliateUrl: "https://www.boxup.nl/partner/brandos" },
  { partnerId: "sz-luxe", name: "Shenzhen Luxe Pack", region: "Asia", categories: [], categoryTags: ["Add-on", "Custom Box"], estimatedMOQ: 500, estimatedUnitCostRange: [0.3, 1.5], leadTimeDays: 22, positioning: "mid", addonType: "custom_box", notes: "Custom Rigid Boxes, Spot UV, Folien-Prägung", euBased: false, riskScore: 42, capitalLockScore: 30, reliabilityScore: 70, recommendedFor: ["High Volume"], affiliateAvailable: false },

  { partnerId: "promoinsert", name: "PromoInsert (DE)", region: "EU", categories: [], categoryTags: ["Add-on", "Inserts"], estimatedMOQ: 300, estimatedUnitCostRange: [0.15, 0.5], leadTimeDays: 8, positioning: "mid", addonType: "sample_insert", notes: "Proben-Beilagen, Flyer, Discount-Codes", website: "https://www.promoinsert.de", euBased: true, riskScore: 5, capitalLockScore: 8, reliabilityScore: 88, recommendedFor: ["Fast Launch"], affiliateAvailable: false },
  { partnerId: "gz-print", name: "Guangzhou Print & Pack", region: "Asia", categories: [], categoryTags: ["Add-on", "Inserts"], estimatedMOQ: 2000, estimatedUnitCostRange: [0.03, 0.12], leadTimeDays: 18, positioning: "budget", addonType: "sample_insert", notes: "Bulk-Flyer, Coupons, Sample-Sachets", euBased: false, riskScore: 40, capitalLockScore: 15, reliabilityScore: 65, recommendedFor: ["High Volume"], affiliateAvailable: false },

  { partnerId: "bandwerk", name: "BandWerk (DE)", region: "EU", categories: [], categoryTags: ["Add-on", "Ribbon"], estimatedMOQ: 100, estimatedUnitCostRange: [0.1, 0.35], leadTimeDays: 7, positioning: "premium", addonType: "ribbon", notes: "Satinband mit Logo, Geschenkband", website: "https://www.bandwerk.de", euBased: true, riskScore: 5, capitalLockScore: 5, reliabilityScore: 95, recommendedFor: ["Premium Brand"], affiliateAvailable: false },
];
