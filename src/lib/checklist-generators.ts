// ─── Dynamic Checklist Generators ───────────────────────────────
// Replaces all static checklist arrays with BrandProfile-driven generation.

import type { BrandProfile } from "./brand-profile";

// ── Types ───────────────────────────────────────────────────────

export interface ChecklistEntry {
  id: string;
  label: string;
  description: string;
  category: string;
  required: boolean;
  riskLevel?: "low" | "medium" | "high" | "critical";
  estimatedFine?: string;
  auditProbability?: number; // 0–100, execution tier
}

// ── SECTION 1: Label Checklist ──────────────────────────────────

export function generateLabelChecklist(bp: BrandProfile, plan: string): ChecklistEntry[] {
  const items: ChecklistEntry[] = [];
  const isExecution = plan === "execution" || plan === "trading";
  const cat = bp.categoryId?.toLowerCase() || "";
  const isCosmetics = ["cosmetics", "kosmetik", "skincare", "beauty"].some(c => cat.includes(c));
  const isSupplements = ["supplements", "nahrungsergaenzung", "supplement", "vitamine"].some(s => cat.includes(s));
  const isFood = ["food", "lebensmittel", "snacks", "getränke", "drinks"].some(f => cat.includes(f));
  const isElectronics = ["electronics", "elektronik", "tech"].some(e => cat.includes(e));
  const isApparel = ["apparel", "textil", "fashion", "kleidung", "mode"].some(a => cat.includes(a));
  const isEU = bp.targetRegion === "EU" || bp.targetRegion === "DE";
  const isPremium = bp.priceSegment === "premium" || bp.priceSegment === "luxury";
  const isBudget = bp.priceSegment === "budget";

  const e = (id: string, label: string, desc: string, opts: Partial<ChecklistEntry> = {}): ChecklistEntry => ({
    id, label, description: desc, category: opts.category ?? "label", required: opts.required ?? true,
    riskLevel: opts.riskLevel ?? "medium", estimatedFine: opts.estimatedFine, auditProbability: opts.auditProbability,
  });

  // Universal label items
  items.push(e("label_product_name", "Produktname & Beschreibung", "Produktname klar und korrekt auf der Verpackung angeben.", { required: true }));
  items.push(e("label_manufacturer", "Hersteller- / Importeuradresse", "Vollständige Anschrift des Herstellers oder EU-Importeurs.", { required: true, riskLevel: "high" }));
  items.push(e("label_net_content", "Nettofüllmenge", "Nettomenge in ml, g oder Stückzahl angeben.", { required: true }));
  items.push(e("label_batch_code", "Chargennummer / Batch-Code", "Jede Charge muss rückverfolgbar sein.", { required: true, riskLevel: "high" }));
  items.push(e("label_recycling", "Recycling-Symbole", "Korrekte Recycling- und Entsorgungssymbole.", { required: false, riskLevel: "low" }));

  // Cosmetics
  if (isCosmetics) {
    items.push(e("label_inci", "INCI-Inhaltsstoffe", "Vollständige INCI-Liste in absteigender Reihenfolge.", { category: "cosmetics", riskLevel: "critical",
      ...(isExecution && { estimatedFine: "Verkaufsverbot", auditProbability: 40 }) }));
    items.push(e("label_responsible_person", "Responsible Person (EU-Adresse)", "EU-Cosmetic-Regulation verlangt eine verantwortliche Person mit EU-Adresse.", { category: "cosmetics", riskLevel: "critical",
      ...(isExecution && { estimatedFine: "Verkaufsverbot in der EU", auditProbability: 35 }) }));
    items.push(e("label_pao", "PAO-Symbol (Mindesthaltbarkeit)", "Period After Opening oder MHD angeben.", { category: "cosmetics", riskLevel: "high" }));
    items.push(e("label_cpnp", "CPNP-Notifizierung", "Produkt im CPNP (Cosmetic Products Notification Portal) registrieren.", { category: "cosmetics", riskLevel: "critical",
      ...(isExecution && { estimatedFine: "Verkaufsverbot + Bußgeld", auditProbability: 30 }) }));
    items.push(e("label_warnings_cosmetic", "Warnhinweise (falls zutreffend)", "Besondere Warnhinweise bei bestimmten Inhaltsstoffen.", { category: "cosmetics", required: false, riskLevel: "medium" }));
    items.push(e("label_country_origin", "Herkunftsland", "Made in ... auf der Verpackung.", { category: "cosmetics", riskLevel: "medium" }));
  }

  // Supplements
  if (isSupplements) {
    items.push(e("label_nutrition_table", "Nährwerttabelle", "Vollständige Nährstoffangaben gemäß LMIV.", { category: "supplements", riskLevel: "critical" }));
    items.push(e("label_health_claims", "Health Claims Prüfung", "Nur zugelassene gesundheitsbezogene Angaben verwenden (VO 1924/2006).", { category: "supplements", riskLevel: "critical",
      ...(isExecution && { estimatedFine: "Abmahnung 5.000–25.000 €", auditProbability: 45 }) }));
    items.push(e("label_allergen", "Allergen-Deklaration", "Alle 14 Hauptallergene kennzeichnen.", { category: "supplements", riskLevel: "high" }));
    items.push(e("label_dosage", "Empfohlene Tagesdosis", "Empfohlene Verzehrmenge und Warnhinweis angeben.", { category: "supplements", riskLevel: "high" }));
    items.push(e("label_storage", "Lagerungshinweise", "Aufbewahrungshinweise (kühl, trocken etc.).", { category: "supplements", riskLevel: "medium" }));
  }

  // Food
  if (isFood) {
    items.push(e("label_ingredients", "Zutatenliste", "Alle Zutaten in absteigender Reihenfolge.", { category: "food", riskLevel: "critical" }));
    items.push(e("label_allergen_food", "Allergen-Kennzeichnung", "14 Hauptallergene hervorheben.", { category: "food", riskLevel: "critical" }));
    items.push(e("label_nutrition_food", "Nährwerttabelle", "Big 7 Nährwertangaben gemäß LMIV.", { category: "food", riskLevel: "critical" }));
    items.push(e("label_mhd", "MHD / Verbrauchsdatum", "Mindesthaltbarkeits- oder Verbrauchsdatum.", { category: "food", riskLevel: "critical" }));
    items.push(e("label_storage_food", "Lagerungshinweise", "Aufbewahrungshinweise angeben.", { category: "food", riskLevel: "medium" }));
  }

  // Apparel
  if (isApparel) {
    items.push(e("label_material", "Materialzusammensetzung", "Textilkennzeichnung gemäß EU-Verordnung.", { category: "apparel", riskLevel: "high" }));
    items.push(e("label_care", "Pflegehinweise", "Wasch- und Pflegesymbole anbringen.", { category: "apparel", riskLevel: "medium" }));
    items.push(e("label_size", "Größenangabe", "Größenkennzeichnung auf dem Etikett.", { category: "apparel", riskLevel: "low" }));
    items.push(e("label_origin_apparel", "Herkunftsland", "Country of Origin auf dem Etikett.", { category: "apparel", required: false, riskLevel: "low" }));
  }

  // Electronics
  if (isElectronics) {
    items.push(e("label_ce", "CE-Kennzeichnung", "CE-Marking korrekt auf Produkt und Verpackung.", { category: "electronics", riskLevel: "critical",
      ...(isExecution && { estimatedFine: "Verkaufsverbot + Rückruf", auditProbability: 50 }) }));
    items.push(e("label_weee", "WEEE-Symbol", "Elektroaltgeräte-Entsorgungssymbol.", { category: "electronics", riskLevel: "high" }));
    items.push(e("label_tech_specs", "Technische Spezifikationen", "Spannung, Leistung, technische Daten.", { category: "electronics", riskLevel: "medium" }));
    items.push(e("label_safety_warnings", "Sicherheitshinweise", "Sicherheitswarnungen gemäß Produktsicherheitsgesetz.", { category: "electronics", riskLevel: "high" }));
    items.push(e("label_rohs", "RoHS-Konformität", "RoHS-Konformitätshinweis auf Verpackung.", { category: "electronics", riskLevel: "high" }));
  }

  // EU market specifics
  if (isEU) {
    items.push(e("label_language", "Sprache Zielmarkt", "Etikettierung in der Sprache des Zielmarktes erforderlich.", { category: "eu", riskLevel: "high" }));
    items.push(e("label_verpackg", "VerpackG-Registrierung (LUCID)", "Verpackungen im LUCID-Register anmelden.", { category: "eu", riskLevel: "critical",
      ...(isExecution && { estimatedFine: "Bußgeld bis 200.000 €", auditProbability: 60 }) }));

    if (bp.fulfillmentModel !== "self" && bp.fulfillmentModel !== "3pl") {
      items.push(e("label_responsible_importer", "Verantwortlicher Importeur", "Bei Produktion außerhalb der EU: EU-Importeur auf dem Etikett.", { category: "eu", riskLevel: "critical" }));
    }
  }

  // Barcode logic
  const needsBarcode = bp.fulfillmentModel === "fba" || bp.businessModel === "own_brand";
  items.push(e("label_ean_barcode", "EAN-Barcode",
    needsBarcode ? "EAN-Barcode PFLICHT für Retail / Amazon / FBA." : "EAN-Barcode empfohlen, aber nicht zwingend für D2C.",
    { category: "barcode", required: needsBarcode, riskLevel: needsBarcode ? "high" : "low" }));

  // Premium positioning
  if (isPremium) {
    items.push(e("label_brand_consistency", "Marken-Konsistenz", "Einheitliche Farbgebung, Logo-Platzierung und Schrifthierarchie auf allen Materialien.", { category: "brand", required: false, riskLevel: "low" }));
    items.push(e("label_font_hierarchy", "Schrifthierarchie", "Primär-, Sekundär- und Fließtext-Schriften definiert.", { category: "brand", required: false, riskLevel: "low" }));
    items.push(e("label_luxury_compliance", "Luxury Compliance Note", "Premium-Verpackung und -Labeling konsistent mit Positionierung.", { category: "brand", required: false, riskLevel: "low" }));
  }

  // Budget positioning
  if (isBudget) {
    items.push(e("label_cost_optimized", "Kostenoptimierte Verpackung", "Verpackungslösung wählen, die Compliance erfüllt und Budget schont.", { category: "packaging", required: false, riskLevel: "low" }));
  }

  return items;
}

// ── SECTION 2: Legal Hints ──────────────────────────────────────

export function generateLegalHints(bp: BrandProfile, plan: string): ChecklistEntry[] {
  const items: ChecklistEntry[] = [];
  const isExecution = plan === "execution" || plan === "trading";
  const isEU = bp.targetRegion === "EU" || bp.targetRegion === "DE";
  const isDropship = bp.fulfillmentModel === "dropship" || bp.businessModel === "dropshipping";
  const isSelfWarehouse = bp.fulfillmentModel === "self";
  const cat = bp.categoryId?.toLowerCase() || "";
  const isElectronics = ["electronics", "elektronik", "tech"].some(e => cat.includes(e));

  const e = (id: string, label: string, desc: string, opts: Partial<ChecklistEntry> = {}): ChecklistEntry => ({
    id, label, description: desc, category: opts.category ?? "legal", required: opts.required ?? true,
    riskLevel: opts.riskLevel ?? "medium", estimatedFine: opts.estimatedFine, auditProbability: opts.auditProbability,
  });

  // Legal structure check
  if (!bp.legalStructure) {
    items.push(e("legal_gewerbe", "Gewerbeanmeldung erforderlich", "Keine Rechtsform hinterlegt — Gewerbeanmeldung ist der erste Schritt.",
      { riskLevel: "critical", ...(isExecution && { estimatedFine: "Bußgeld bis 50.000 €", auditProbability: 70 }) }));
  }

  // EU-specific
  if (isEU) {
    items.push(e("legal_vat", "Umsatzsteuer-Registrierung", "Umsatzsteuerliche Anmeldung beim Finanzamt.",
      { category: "tax", riskLevel: "critical", ...(isExecution && { estimatedFine: "Steuernachzahlung + Zinsen", auditProbability: 80 }) }));
    items.push(e("legal_oss", "OSS-Registrierung (Cross-Border)", "One-Stop-Shop für EU-weiten Versand an Endverbraucher.",
      { category: "tax", required: false, riskLevel: "high", ...(isExecution && { estimatedFine: "Doppelbesteuerung", auditProbability: 40 }) }));
    items.push(e("legal_verpackg", "VerpackG-Registrierung", "LUCID-Registrierung und Systembeteiligung Pflicht.",
      { category: "packaging", riskLevel: "critical", ...(isExecution && { estimatedFine: "Bußgeld bis 200.000 €", auditProbability: 55 }) }));

    if (isElectronics) {
      items.push(e("legal_weee", "WEEE-Registrierung", "Elektro- und Elektronikgeräte bei der stiftung ear registrieren.",
        { riskLevel: "critical", ...(isExecution && { estimatedFine: "Verkaufsverbot + Bußgeld bis 100.000 €", auditProbability: 45 }) }));
      items.push(e("legal_ce", "CE-Kennzeichnung Pflicht", "Konformitätsbewertung und CE-Marking für den EU-Markt.",
        { riskLevel: "critical", ...(isExecution && { estimatedFine: "Verkaufsverbot + Rückruf", auditProbability: 50 }) }));
    }
  }

  // Dropshipping
  if (isDropship) {
    items.push(e("legal_dropship_liability", "Haftungsübertragung Warnung", "Als Verkäufer haftest du für Produktsicherheit — auch ohne eigene Produktion.",
      { category: "liability", riskLevel: "critical", ...(isExecution && { estimatedFine: "Volle Produkthaftung", auditProbability: 25 }) }));
  }

  // Own warehouse
  if (isSelfWarehouse) {
    items.push(e("legal_betriebshaftpflicht", "Betriebshaftpflichtversicherung", "Empfohlen bei eigenem Lager / Fulfillment.",
      { category: "liability", required: false, riskLevel: "medium" }));
  }

  return items;
}

// ── SECTION 3: Operational Checklist ────────────────────────────

export function generateOperationalChecklist(bp: BrandProfile, plan: string): ChecklistEntry[] {
  const items: ChecklistEntry[] = [];
  const isExecution = plan === "execution";
  const isAsiaProduction = bp.targetRegion === "global" || bp.fulfillmentModel === "dropship";

  const e = (id: string, label: string, desc: string, cat: string, opts: Partial<ChecklistEntry> = {}): ChecklistEntry => ({
    id, label, description: desc, category: cat, required: opts.required ?? true,
    riskLevel: opts.riskLevel ?? "medium", estimatedFine: opts.estimatedFine, auditProbability: opts.auditProbability,
  });

  // 1. Business Setup
  items.push(e("ops_gewerbe", "Gewerbeanmeldung beantragt", "Gewerbe beim Ordnungsamt anmelden.", "business"));
  items.push(e("ops_steuernummer", "Steuernummer erhalten", "Fragebogen zur steuerlichen Erfassung ausgefüllt.", "business"));
  items.push(e("ops_ustid", "USt-ID beantragt", "Umsatzsteuer-Identifikationsnummer beim BZSt beantragen.", "business"));
  items.push(e("ops_geschaeftskonto", "Geschäftskonto eröffnet", "Separates Geschäftskonto für alle Transaktionen.", "business"));

  // 2. Production
  items.push(e("ops_supplier_contract", "Lieferantenvertrag unterzeichnet", "Vertragliche Vereinbarung mit Hauptlieferant.", "production", { riskLevel: "high" }));
  items.push(e("ops_moq_confirmed", "MOQ bestätigt", "Mindestbestellmenge mit Lieferant abgestimmt.", "production"));
  items.push(e("ops_qc_checklist", "Qualitätskontroll-Checkliste", "QC-Kriterien definiert und dokumentiert.", "production"));
  items.push(e("ops_sample_approved", "Musterfreigabe dokumentiert", "Produktmuster geprüft und freigegeben.", "production", { riskLevel: "high" }));

  // 3. Packaging
  items.push(e("ops_packaging_supplier", "Verpackungslieferant ausgewählt", "Packaging-Partner identifiziert und beauftragt.", "packaging"));
  items.push(e("ops_label_compliance", "Label-Compliance geprüft", "Etiketten auf alle Pflichtangaben geprüft.", "packaging", { riskLevel: "high" }));
  items.push(e("ops_barcode_generated", "Barcode generiert", "EAN/UPC-Barcode erstellt und auf Verpackung.", "packaging"));
  items.push(e("ops_gs1", "GS1-Registrierung (falls nötig)", "GS1-Mitgliedschaft für offizielle EAN-Nummern.", "packaging", { required: false, riskLevel: "low" }));

  // 4. Logistics
  items.push(e("ops_fulfillment", "Fulfillment-Modell entschieden", `Aktuell: ${bp.fulfillmentModel || "Noch nicht festgelegt"}.`, "logistics"));
  items.push(e("ops_shipping_carrier", "Versanddienstleister verhandelt", "Konditionen mit DHL, DPD, GLS etc. verhandeln.", "logistics"));

  if (isAsiaProduction) {
    items.push(e("ops_customs", "Zollpapiere (Asien-Produktion)", "Zolltarifnummer, Ursprungszeugnis, Einfuhrdokumente vorbereiten.", "logistics", { riskLevel: "high",
      ...(isExecution && { estimatedFine: "Zoll-Nachzahlung + Verzögerung", auditProbability: 35 }) }));
  }

  // 5. Financial
  items.push(e("ops_breakeven", "Break-even berechnet", bp.margin ? `Aktuelle Marge: ${bp.margin}%.` : "Break-even-Punkt bestimmen.", "financial"));
  items.push(e("ops_runway", "Cash Runway berechnet", bp.cashRunwayMonths ? `Aktuell: ~${bp.cashRunwayMonths} Monate.` : "Wie lange reicht das Kapital?", "financial",
    { riskLevel: bp.cashRunwayMonths && bp.cashRunwayMonths < 4 ? "critical" : "medium" }));
  items.push(e("ops_capital_buffer", "Kapitalpuffer definiert", "Reserve für unvorhergesehene Kosten einplanen.", "financial",
    { riskLevel: bp.budget && bp.budget < 5000 ? "high" : "medium" }));

  return items;
}
