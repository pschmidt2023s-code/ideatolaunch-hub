// ─── Dynamic Legal Map Generator ────────────────────────────────
// Replaces static compliance checklists with BrandProfile-driven generation.

import type { BrandProfile } from "./brand-profile";

export interface LegalRequirement {
  id: string;
  label: string;
  description: string;
  category: "legal" | "product" | "data" | "packaging" | "tax" | "liability";
  required: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  estimatedCost: string;
  complianceProbability?: number; // 0–100, execution tier
  financialExposure?: string; // execution tier
}

export interface LegalMap {
  requirements: LegalRequirement[];
  totalRequired: number;
  regionLabel: string;
}

function req(
  id: string, label: string, description: string,
  opts: Partial<Omit<LegalRequirement, "id" | "label" | "description">> = {},
): LegalRequirement {
  return {
    id, label, description,
    category: opts.category ?? "legal",
    required: opts.required ?? true,
    riskLevel: opts.riskLevel ?? "medium",
    estimatedCost: opts.estimatedCost ?? "0–500 €",
    complianceProbability: opts.complianceProbability,
    financialExposure: opts.financialExposure,
  };
}

/**
 * Generate a personalised legal requirements map based on BrandProfile.
 */
export function generateLegalMap(bp: BrandProfile, plan: string): LegalMap {
  const isExecution = plan === "execution" || plan === "trading";
  const items: LegalRequirement[] = [];

  const isEU = bp.targetRegion === "EU" || bp.targetRegion === "DE";
  const isUS = bp.targetRegion === "US";
  const isDropship = bp.fulfillmentModel === "dropship" || bp.businessModel === "dropshipping";
  const isDigital = bp.businessModel === "digital";
  const cat = bp.categoryId?.toLowerCase() || "";
  const isCosmetics = ["cosmetics", "kosmetik", "skincare", "beauty"].some(c => cat.includes(c));
  const isSupplements = ["supplements", "nahrungsergaenzung", "supplement", "vitamine"].some(s => cat.includes(s));
  const isFoodRelated = ["food", "lebensmittel", "snacks", "getränke", "drinks"].some(f => cat.includes(f));

  // ── Universal requirements ──────────────────────────────────
  items.push(req("gewerbeanmeldung", "Gewerbeanmeldung",
    "Gewerbeanmeldung beim zuständigen Gewerbeamt abschließen.",
    { category: "legal", riskLevel: "critical", estimatedCost: "20–60 €",
      ...(isExecution && { complianceProbability: 95, financialExposure: "Bußgeld bis 50.000 €" }) }));

  items.push(req("impressum", "Impressum",
    "Vollständiges Impressum nach § 5 TMG erstellen.",
    { category: "legal", riskLevel: "critical", estimatedCost: "0 €",
      ...(isExecution && { complianceProbability: 90, financialExposure: "Abmahnung 1.500–5.000 €" }) }));

  items.push(req("datenschutz", "Datenschutzerklärung",
    "DSGVO-konforme Datenschutzerklärung für Website und Shop.",
    { category: "data", riskLevel: "critical", estimatedCost: "0–300 €",
      ...(isExecution && { complianceProbability: 85, financialExposure: "Bußgeld bis 20 Mio. € (DSGVO)" }) }));

  items.push(req("widerruf", "Widerrufsbelehrung",
    "Widerrufsrecht & Muster-Widerrufsformular bereitstellen.",
    { category: "legal", riskLevel: "high", estimatedCost: "0 €",
      ...(isExecution && { complianceProbability: 88, financialExposure: "Verlängertes Widerrufsrecht (12 Monate)" }) }));

  items.push(req("agb", "AGB erstellen",
    "Allgemeine Geschäftsbedingungen für den Online-Verkauf.",
    { category: "legal", required: false, riskLevel: "low", estimatedCost: "0–500 €" }));

  items.push(req("dsgvo-assessment", "DSGVO Basis-Assessment",
    "Verarbeitungsverzeichnis und technische Maßnahmen dokumentieren.",
    { category: "data", riskLevel: "high", estimatedCost: "0–500 €" }));

  // ── EU / DE specific ────────────────────────────────────────
  if (isEU) {
    items.push(req("gpsr", "GPSR (General Product Safety Regulation)",
      "Ab 2024: Verantwortliche Person in der EU benennen, Produktsicherheitsdokumentation.",
      { category: "product", riskLevel: "critical", estimatedCost: "200–2.000 €",
        ...(isExecution && { complianceProbability: 70, financialExposure: "Verkaufsverbot + Rückruf" }) }));

    items.push(req("verpackg", "VerpackG Registrierung",
      "LUCID-Registrierung und Systembeteiligung für Verpackungslizenzierung.",
      { category: "packaging", riskLevel: "critical", estimatedCost: "50–500 €/Jahr",
        ...(isExecution && { complianceProbability: 80, financialExposure: "Bußgeld bis 200.000 €" }) }));

    items.push(req("vat-eu", "Umsatzsteuer / VAT",
      "Steuerliche Registrierung und OSS-Verfahren für EU-weiten Versand.",
      { category: "tax", riskLevel: "high", estimatedCost: "0–300 €",
        ...(isExecution && { complianceProbability: 75, financialExposure: "Steuernachzahlung + Zinsen" }) }));

    items.push(req("ce-marking", "CE-Kennzeichnung prüfen",
      "CE-Konformität für relevante Produktkategorien sicherstellen.",
      { category: "product", required: false, riskLevel: "medium", estimatedCost: "100–5.000 €" }));

    items.push(req("product-labeling", "Produktkennzeichnung",
      "Pflichtangaben auf Verpackung: Herkunft, Inhaltsstoffe, Warnhinweise.",
      { category: "product", riskLevel: "high", estimatedCost: "0–200 €" }));
  }

  // ── US market ───────────────────────────────────────────────
  if (isUS) {
    items.push(req("fda", "FDA Compliance",
      "FDA-Registrierung und Labeling-Anforderungen für den US-Markt.",
      { category: "product", riskLevel: "critical", estimatedCost: "1.000–10.000 €",
        ...(isExecution && { complianceProbability: 60, financialExposure: "Import-Sperre + Strafen" }) }));

    items.push(req("us-labeling", "US Labeling Standards",
      "FTC-konforme Produktbeschreibungen und Verpackungsinformationen.",
      { category: "product", riskLevel: "high", estimatedCost: "200–2.000 €" }));
  }

  // ── Category-specific ──────────────────────────────────────
  if (isCosmetics) {
    items.push(req("cpnp", "CPNP-Registrierung",
      "Kosmetikprodukte müssen im Cosmetic Products Notification Portal notifiziert werden.",
      { category: "product", riskLevel: "critical", estimatedCost: "500–3.000 €",
        ...(isExecution && { complianceProbability: 65, financialExposure: "Verkaufsverbot in der EU" }) }));

    items.push(req("safety-assessment", "Sicherheitsbewertung (Kosmetik)",
      "Toxikologische Bewertung durch zugelassene Sachverständige.",
      { category: "product", riskLevel: "critical", estimatedCost: "1.000–5.000 €" }));
  }

  if (isSupplements) {
    items.push(req("novel-food", "Novel Food Verordnung",
      "Prüfen ob Inhaltsstoffe unter die Novel-Food-Verordnung fallen.",
      { category: "product", riskLevel: "critical", estimatedCost: "500–5.000 €",
        ...(isExecution && { complianceProbability: 55, financialExposure: "Produktverbot + Rückruf" }) }));

    items.push(req("health-claims", "Health Claims Verordnung",
      "Nährwert- und gesundheitsbezogene Angaben müssen zugelassen sein.",
      { category: "product", riskLevel: "high", estimatedCost: "200–1.000 €" }));
  }

  if (isFoodRelated) {
    items.push(req("lmiv", "LMIV Kennzeichnung",
      "Lebensmittelinformationsverordnung: Allergene, Nährwerte, Herkunft.",
      { category: "product", riskLevel: "critical", estimatedCost: "100–1.000 €" }));
  }

  // ── Business model specific ────────────────────────────────
  if (isDigital) {
    items.push(req("vat-moss", "VAT MOSS / OSS",
      "Digitale Produkte: Umsatzsteuer im Bestimmungsland des Kunden.",
      { category: "tax", riskLevel: "high", estimatedCost: "0–200 €" }));
  }

  if (isDropship) {
    items.push(req("dropship-liability", "Dropshipping-Haftung",
      "Als Verkäufer haftest du für Produktsicherheit, auch wenn du nicht produzierst.",
      { category: "liability", riskLevel: "critical", estimatedCost: "0 € (Bewusstsein)",
        ...(isExecution && { complianceProbability: 50, financialExposure: "Volle Produkthaftung" }) }));

    items.push(req("import-compliance", "Importvorschriften",
      "Zollnummer, EORI und Einfuhrbestimmungen für Dropshipping-Waren.",
      { category: "legal", riskLevel: "high", estimatedCost: "0–500 €" }));
  }

  const totalRequired = items.filter(i => i.required).length;
  const regionLabel = isEU ? "EU / Deutschland" : isUS ? "USA" : "Global";

  return { requirements: items, totalRequired, regionLabel };
}
