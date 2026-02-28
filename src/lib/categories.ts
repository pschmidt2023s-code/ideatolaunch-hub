// ─── Controlled Category Taxonomy ───────────────────────────────
// Single source of truth for product categories.

export interface Category {
  id: string;
  labelDe: string;
  labelEn: string;
}

export const CATEGORIES: Category[] = [
  { id: "cosmetics", labelDe: "Kosmetik / Parfüm", labelEn: "Cosmetics / Fragrance" },
  { id: "supplements", labelDe: "Supplements", labelEn: "Supplements" },
  { id: "apparel", labelDe: "Textil / Streetwear", labelEn: "Apparel / Streetwear" },
  { id: "accessories", labelDe: "Accessoires", labelEn: "Accessories" },
  { id: "food", labelDe: "Food / FMCG", labelEn: "Food / FMCG" },
  { id: "home", labelDe: "Home & Living", labelEn: "Home & Living" },
  { id: "electronics", labelDe: "Elektronik", labelEn: "Electronics" },
  { id: "print_art", labelDe: "Print / Kunst", labelEn: "Print / Art" },
  { id: "other", labelDe: "Sonstiges", labelEn: "Other" },
];

/** Map legacy free-text category strings to canonical IDs */
export function normalizeCategoryId(freeText: string): string {
  if (!freeText) return "";
  const lower = freeText.toLowerCase();

  const mapping: Record<string, string[]> = {
    cosmetics: ["kosmetik", "cosmetic", "beauty", "parfüm", "fragrance", "skincare", "hautpflege"],
    supplements: ["supplement", "nahrungsergänzung", "vitamin", "protein"],
    apparel: ["textil", "apparel", "streetwear", "kleidung", "fashion", "mode", "clothing"],
    accessories: ["accessor", "schmuck", "jewelry", "taschen", "bag"],
    food: ["food", "fmcg", "lebensmittel", "snack", "getränk", "drink"],
    home: ["home", "living", "wohnen", "kerze", "candle", "haushalt", "household"],
    electronics: ["elektro", "electronic", "tech", "gadget"],
    print_art: ["print", "kunst", "art", "poster", "druck", "bild", "leinwand", "canvas", "fine art"],
  };

  for (const [id, keywords] of Object.entries(mapping)) {
    if (keywords.some((kw) => lower.includes(kw))) return id;
  }

  return "other";
}

export function getCategoryLabel(id: string, lang: "de" | "en"): string {
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return id;
  return lang === "de" ? cat.labelDe : cat.labelEn;
}
