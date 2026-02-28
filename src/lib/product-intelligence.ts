// ─── Product Intelligence & Classification Engine ───────────────
// Dynamic checklists, compliance items, and roadmap based on product category.

export type ProductType = "physical" | "digital" | "service";

export interface RiskFlag {
  id: string;
  labelDe: string;
  labelEn: string;
}

export const RISK_FLAGS: RiskFlag[] = [
  { id: "chemical", labelDe: "Chemische Inhaltsstoffe", labelEn: "Chemical exposure" },
  { id: "ce_required", labelDe: "CE-Kennzeichnung erforderlich", labelEn: "CE marking required" },
  { id: "food_contact", labelDe: "Lebensmittelkontakt", labelEn: "Food contact" },
  { id: "child_safety", labelDe: "Kindersicherheit relevant", labelEn: "Child safety relevance" },
];

// ── Category-specific compliance checklists ──────────────────────

export interface ChecklistItem {
  id: string;
  labelDe: string;
  labelEn: string;
  required: boolean;
}

const UNIVERSAL_CHECKLIST: ChecklistItem[] = [
  { id: "gewerbeanmeldung", labelDe: "Gewerbeanmeldung", labelEn: "Business registration", required: true },
  { id: "widerruf", labelDe: "Widerrufsbelehrung", labelEn: "Cancellation policy", required: true },
  { id: "verpackg", labelDe: "Verpackungsgesetz (LUCID)", labelEn: "Packaging regulation (LUCID)", required: true },
  { id: "impressum", labelDe: "Impressum", labelEn: "Legal notice / Imprint", required: true },
  { id: "datenschutz", labelDe: "Datenschutzerklärung", labelEn: "Privacy policy", required: true },
  { id: "agb", labelDe: "AGB", labelEn: "Terms & conditions", required: false },
];

const COSMETICS_CHECKLIST: ChecklistItem[] = [
  { id: "eu_cosmetic_reg", labelDe: "EU Cosmetic Regulation (EC 1223/2009)", labelEn: "EU Cosmetic Regulation", required: true },
  { id: "cpnp", labelDe: "CPNP Registrierung", labelEn: "CPNP Registration", required: true },
  { id: "inci", labelDe: "INCI-Liste", labelEn: "INCI list", required: true },
  { id: "safety_assessment", labelDe: "Sicherheitsbewertung (Safety Assessment)", labelEn: "Safety assessment", required: true },
  { id: "stability_testing", labelDe: "Stabilitätstests", labelEn: "Stability testing", required: true },
  { id: "pao", labelDe: "PAO / Mindesthaltbarkeit", labelEn: "PAO / Shelf life", required: true },
  { id: "batch_code", labelDe: "Chargennummer / Batch-Code", labelEn: "Batch code", required: true },
  { id: "product_labeling", labelDe: "Produktkennzeichnung (EU)", labelEn: "Product labeling (EU)", required: true },
];

const FOOD_CHECKLIST: ChecklistItem[] = [
  { id: "lebensmittelrecht", labelDe: "EU-Lebensmittelrecht (VO 178/2002)", labelEn: "EU Food Law", required: true },
  { id: "lmiv", labelDe: "LMIV Kennzeichnung", labelEn: "LMIV Labeling", required: true },
  { id: "haccp", labelDe: "HACCP-Konzept", labelEn: "HACCP concept", required: true },
  { id: "allergen", labelDe: "Allergen-Kennzeichnung", labelEn: "Allergen labeling", required: true },
  { id: "mhd", labelDe: "MHD / Verbrauchsdatum", labelEn: "Best before / Expiry date", required: true },
  { id: "naehrwerte", labelDe: "Nährwertangaben", labelEn: "Nutritional values", required: true },
  { id: "novel_food", labelDe: "Novel Food Prüfung", labelEn: "Novel food check", required: false },
];

const TEXTILE_CHECKLIST: ChecklistItem[] = [
  { id: "textilkennzeichnung", labelDe: "Textilkennzeichnungsverordnung", labelEn: "Textile labeling regulation", required: true },
  { id: "reach", labelDe: "REACH Compliance", labelEn: "REACH Compliance", required: true },
  { id: "care_labels", labelDe: "Pflegekennzeichnung", labelEn: "Care labels", required: true },
  { id: "origin_label", labelDe: "Herkunftsangabe", labelEn: "Country of origin", required: false },
  { id: "oeko_tex", labelDe: "OEKO-TEX / GOTS Zertifizierung", labelEn: "OEKO-TEX / GOTS certification", required: false },
];

const ELECTRONICS_CHECKLIST: ChecklistItem[] = [
  { id: "ce_marking", labelDe: "CE-Kennzeichnung", labelEn: "CE marking", required: true },
  { id: "rohs", labelDe: "RoHS Konformität", labelEn: "RoHS compliance", required: true },
  { id: "weee", labelDe: "WEEE Registrierung", labelEn: "WEEE registration", required: true },
  { id: "emv", labelDe: "EMV-Prüfung", labelEn: "EMC testing", required: true },
  { id: "battery_reg", labelDe: "Batteriegesetz (BattG)", labelEn: "Battery regulation", required: false },
  { id: "product_safety", labelDe: "Produktsicherheitsgesetz", labelEn: "Product safety act", required: true },
];

const PRINT_ART_CHECKLIST: ChecklistItem[] = [
  { id: "urheberrecht", labelDe: "Urheberrecht / Copyright", labelEn: "Copyright", required: true },
  { id: "plattformregeln", labelDe: "Plattformregeln (Etsy, Amazon etc.)", labelEn: "Platform rules", required: false },
  { id: "reproduktionsrechte", labelDe: "Reproduktionsrechte", labelEn: "Reproduction rights", required: true },
  { id: "kunsturhebergesetz", labelDe: "KUG (Kunsturhebergesetz)", labelEn: "Art copyright act", required: false },
];

const GENERAL_CHECKLIST: ChecklistItem[] = [
  { id: "ce_check", labelDe: "CE-Prüfung (falls zutreffend)", labelEn: "CE check (if applicable)", required: false },
  { id: "product_labeling_general", labelDe: "Produktkennzeichnung", labelEn: "Product labeling", required: true },
  { id: "recycling_symbols", labelDe: "Recycling-Symbole", labelEn: "Recycling symbols", required: false },
];

// ── Get checklist for category ──────────────────────────────────

export function getChecklistForCategory(categoryId: string): ChecklistItem[] {
  const base = [...UNIVERSAL_CHECKLIST];

  switch (categoryId) {
    case "cosmetics":
      return [...base, ...COSMETICS_CHECKLIST];
    case "food":
    case "supplements":
      return [...base, ...FOOD_CHECKLIST];
    case "apparel":
      return [...base, ...TEXTILE_CHECKLIST];
    case "electronics":
      return [...base, ...ELECTRONICS_CHECKLIST];
    case "print_art":
      return [...base, ...PRINT_ART_CHECKLIST];
    default:
      return [...base, ...GENERAL_CHECKLIST];
  }
}

// ── Label checklist (packaging/labeling) per category ───────────

export function getLabelChecklistForCategory(categoryId: string, lang: "de" | "en" = "de"): string[] {
  const universal = [
    lang === "de" ? "Produktname & Beschreibung" : "Product name & description",
    lang === "de" ? "Hersteller- / Importeuradresse" : "Manufacturer / importer address",
    lang === "de" ? "Nettofüllmenge" : "Net content",
    lang === "de" ? "Chargennummer / Batch-Code" : "Batch code",
    lang === "de" ? "Recycling-Symbole" : "Recycling symbols",
  ];

  switch (categoryId) {
    case "cosmetics":
      return [
        ...universal,
        lang === "de" ? "Inhaltsstoffe / INCI-Liste" : "Ingredients / INCI list",
        lang === "de" ? "Mindesthaltbarkeitsdatum / PAO" : "Best before / PAO",
        lang === "de" ? "Verwendungshinweise" : "Usage instructions",
        lang === "de" ? "Warnhinweise" : "Warnings",
        lang === "de" ? "CE-Kennzeichnung (falls zutreffend)" : "CE marking (if applicable)",
      ];
    case "food":
    case "supplements":
      return [
        ...universal,
        lang === "de" ? "Zutatenliste" : "Ingredients list",
        lang === "de" ? "Allergen-Kennzeichnung" : "Allergen labeling",
        lang === "de" ? "Nährwerttabelle" : "Nutrition facts",
        lang === "de" ? "MHD / Verbrauchsdatum" : "Best before / expiry date",
        lang === "de" ? "Lagerungshinweise" : "Storage instructions",
      ];
    case "apparel":
      return [
        ...universal,
        lang === "de" ? "Materialzusammensetzung" : "Material composition",
        lang === "de" ? "Pflegehinweise" : "Care instructions",
        lang === "de" ? "Größenangabe" : "Size label",
        lang === "de" ? "Herkunftsland" : "Country of origin",
      ];
    case "electronics":
      return [
        ...universal,
        lang === "de" ? "CE-Kennzeichnung" : "CE marking",
        lang === "de" ? "Technische Spezifikationen" : "Technical specifications",
        lang === "de" ? "Sicherheitshinweise" : "Safety warnings",
        lang === "de" ? "WEEE-Symbol" : "WEEE symbol",
        lang === "de" ? "RoHS-Konformität" : "RoHS compliance",
      ];
    case "print_art":
      return [
        ...universal.slice(0, 2), // Only name & address
        lang === "de" ? "Urheberrecht-Vermerk" : "Copyright notice",
        lang === "de" ? "Drucktechnik / Material" : "Print technique / Material",
        lang === "de" ? "Maße & Gewicht" : "Dimensions & weight",
      ];
    default:
      return [
        ...universal,
        lang === "de" ? "Verwendungshinweise" : "Usage instructions",
        lang === "de" ? "Warnhinweise" : "Warnings",
        lang === "de" ? "CE-Kennzeichnung (falls zutreffend)" : "CE marking (if applicable)",
      ];
  }
}

// ── Production checklist per category ───────────────────────────

export function getProductionChecklistForCategory(categoryId: string, lang: "de" | "en" = "de"): string[] {
  const universal = [
    lang === "de" ? "Produktspezifikationen definiert" : "Product specifications defined",
    lang === "de" ? "Qualitätsstandards dokumentiert" : "Quality standards documented",
    lang === "de" ? "Musterproduktion geplant" : "Sample production planned",
    lang === "de" ? "Produktionszeitplan erstellt" : "Production timeline created",
    lang === "de" ? "Verpackungsanforderungen geklärt" : "Packaging requirements clarified",
  ];

  switch (categoryId) {
    case "cosmetics":
      return [
        ...universal,
        lang === "de" ? "Formulierung finalisiert" : "Formulation finalized",
        lang === "de" ? "Sicherheitsbewertung beauftragt" : "Safety assessment commissioned",
        lang === "de" ? "CPNP-Registrierung vorbereitet" : "CPNP registration prepared",
        lang === "de" ? "Stabilitätstests eingeplant" : "Stability tests scheduled",
      ];
    case "food":
    case "supplements":
      return [
        ...universal,
        lang === "de" ? "Rezeptur / Formulierung finalisiert" : "Recipe / formulation finalized",
        lang === "de" ? "HACCP-Konzept erstellt" : "HACCP concept created",
        lang === "de" ? "Laboranalysen geplant" : "Lab analyses planned",
        lang === "de" ? "Haltbarkeitstests eingeplant" : "Shelf life tests scheduled",
      ];
    case "apparel":
      return [
        ...universal,
        lang === "de" ? "Materialanforderungen festgelegt" : "Material requirements set",
        lang === "de" ? "Größentabelle erstellt" : "Size chart created",
        lang === "de" ? "Wash-Tests eingeplant" : "Wash tests scheduled",
      ];
    case "electronics":
      return [
        ...universal,
        lang === "de" ? "Schaltplan / PCB-Design finalisiert" : "Circuit / PCB design finalized",
        lang === "de" ? "CE-Prüfung geplant" : "CE testing planned",
        lang === "de" ? "Firmware / Software getestet" : "Firmware / software tested",
      ];
    case "print_art":
      return [
        ...universal.filter((_, i) => i !== 1), // Remove "Materialanforderungen"
        lang === "de" ? "Druckvorlage finalisiert" : "Print template finalized",
        lang === "de" ? "Farbprofile kalibriert" : "Color profiles calibrated",
        lang === "de" ? "Papier / Material ausgewählt" : "Paper / material selected",
        lang === "de" ? "Testdruck bestellt" : "Test print ordered",
      ];
    default:
      return [
        ...universal,
        lang === "de" ? "Materialanforderungen festgelegt" : "Material requirements set",
      ];
  }
}

// ── Roadmap focus per category ──────────────────────────────────

export interface RoadmapFocus {
  primaryFocusDe: string;
  primaryFocusEn: string;
  priorityTasks: { de: string; en: string }[];
}

export function getRoadmapFocus(categoryId: string, archetype?: string): RoadmapFocus {
  const categoryFocus: Record<string, RoadmapFocus> = {
    cosmetics: {
      primaryFocusDe: "Compliance & Sicherheit zuerst",
      primaryFocusEn: "Compliance & safety first",
      priorityTasks: [
        { de: "Sicherheitsbewertung beauftragen", en: "Commission safety assessment" },
        { de: "CPNP-Registrierung abschließen", en: "Complete CPNP registration" },
        { de: "Stabilitätstests starten", en: "Start stability tests" },
        { de: "INCI-Liste finalisieren", en: "Finalize INCI list" },
      ],
    },
    food: {
      primaryFocusDe: "Lebensmittelsicherheit & Zertifizierung",
      primaryFocusEn: "Food safety & certification",
      priorityTasks: [
        { de: "HACCP-Konzept erstellen", en: "Create HACCP concept" },
        { de: "Laboranalysen durchführen", en: "Conduct lab analyses" },
        { de: "LMIV-konforme Etiketten", en: "LMIV-compliant labels" },
        { de: "Haltbarkeitstests durchführen", en: "Conduct shelf life tests" },
      ],
    },
    supplements: {
      primaryFocusDe: "Novel Food & GMP-Compliance",
      primaryFocusEn: "Novel food & GMP compliance",
      priorityTasks: [
        { de: "Novel Food Status prüfen", en: "Check novel food status" },
        { de: "GMP-zertifizierten Hersteller wählen", en: "Choose GMP-certified manufacturer" },
        { de: "Laboranalysen beauftragen", en: "Commission lab analyses" },
      ],
    },
    print_art: {
      primaryFocusDe: "Nachfragevalidierung & Pricing",
      primaryFocusEn: "Demand validation & pricing",
      priorityTasks: [
        { de: "Testkollektion erstellen", en: "Create test collection" },
        { de: "Print-on-Demand evaluieren", en: "Evaluate print-on-demand" },
        { de: "Pricing-Strategie festlegen", en: "Set pricing strategy" },
        { de: "Portfolio auf Plattform testen", en: "Test portfolio on platform" },
      ],
    },
    apparel: {
      primaryFocusDe: "Passform & Materialqualität",
      primaryFocusEn: "Fit & material quality",
      priorityTasks: [
        { de: "Größentabelle & Fit Samples", en: "Size chart & fit samples" },
        { de: "Stoff-Qualitätstests", en: "Fabric quality tests" },
        { de: "Textilkennzeichnung prüfen", en: "Check textile labeling" },
      ],
    },
    electronics: {
      primaryFocusDe: "CE-Zertifizierung & Sicherheit",
      primaryFocusEn: "CE certification & safety",
      priorityTasks: [
        { de: "CE-Prüfung beauftragen", en: "Commission CE testing" },
        { de: "EMV-Test einplanen", en: "Schedule EMC testing" },
        { de: "WEEE-Registrierung", en: "WEEE registration" },
      ],
    },
  };

  return categoryFocus[categoryId] || {
    primaryFocusDe: "Produktvalidierung & Launch",
    primaryFocusEn: "Product validation & launch",
    priorityTasks: [
      { de: "Produkt-Markt-Fit validieren", en: "Validate product-market fit" },
      { de: "Testcharge produzieren", en: "Produce test batch" },
      { de: "Erste Kundenfeedbacks sammeln", en: "Collect first customer feedback" },
    ],
  };
}

// ── Auto-detect risk flags from category ────────────────────────

export function getDefaultRiskFlags(categoryId: string): string[] {
  switch (categoryId) {
    case "cosmetics":
      return ["chemical"];
    case "food":
    case "supplements":
      return ["food_contact"];
    case "electronics":
      return ["ce_required"];
    default:
      return [];
  }
}
