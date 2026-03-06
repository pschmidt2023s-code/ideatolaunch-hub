import jsPDF from "jspdf";

// ─── Colors ────────────────────────────────────────────────────────
const DARK: [number, number, number] = [18, 18, 24];
const GOLD: [number, number, number] = [212, 175, 55];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_GRAY: [number, number, number] = [180, 180, 190];
const MID_GRAY: [number, number, number] = [120, 120, 130];
const CARD_BG: [number, number, number] = [28, 28, 36];

type RGB = [number, number, number];

// ─── Legacy interface (kept for backward compat) ───────────────────
interface BrandReportData {
  brandName: string;
  positioning?: string;
  values?: string;
  marketAngle?: string;
  differentiation?: string;
  production?: { cost: number; packaging: number; shipping: number; marketing: number };
  recommendedPrice?: number;
  margin?: number;
  breakEven?: number;
  complianceChecklist?: { item: string; checked: boolean }[];
  salesChannel?: string;
  fulfillment?: string;
  launchQuantity?: number;
}

// ─── Blueprint data ────────────────────────────────────────────────
export interface BlueprintData {
  brandName: string;
  // From brand profile
  positioning?: string;
  values?: string;
  marketAngle?: string;
  differentiation?: string;
  targetAudience?: string;
  productDescription?: string;
  country?: string;
  // From financial model
  productionCost?: number;
  packagingCost?: number;
  shippingCost?: number;
  marketingBudget?: number;
  recommendedPrice?: number;
  margin?: number;
  breakEvenUnits?: number;
  // From production plan
  productionRegion?: string;
  moqExpectation?: string;
  productCategory?: string;
  // From compliance
  complianceItems?: { label: string; done: boolean }[];
  complianceScore?: number;
  // From launch plan
  salesChannel?: string;
  fulfillment?: string;
  launchQuantity?: number;
  // Computed
  capitalSafetyLevel?: string;
  riskScore?: number;
  launchTimeline?: string;
}

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

class BlueprintPDF {
  private doc: jsPDF;
  private y = 0;
  private pageNum = 0;
  private readonly margin = 20;
  private readonly pageW = 210;
  private readonly pageH = 297;
  private readonly contentW: number;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.contentW = this.pageW - this.margin * 2;
    this.pageNum = 1;
    this.y = this.margin;
  }

  // ── Page background & footer ──────────────────────────────────
  private drawPageBg() {
    this.doc.setFillColor(...DARK);
    this.doc.rect(0, 0, this.pageW, this.pageH, "F");
    // Footer line
    this.doc.setDrawColor(...GOLD);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.pageH - 12, this.pageW - this.margin, this.pageH - 12);
    // Footer text
    this.doc.setFontSize(7);
    this.doc.setTextColor(...MID_GRAY);
    this.doc.text("buildyourbrand.de", this.margin, this.pageH - 7);
    this.doc.text(`Seite ${this.pageNum}`, this.pageW - this.margin, this.pageH - 7, { align: "right" });
    this.doc.text("Eigenmarke Starter Blueprint 2026", this.pageW / 2, this.pageH - 7, { align: "center" });
  }

  newPage() {
    this.doc.addPage();
    this.pageNum++;
    this.y = this.margin;
    this.drawPageBg();
  }

  ensureSpace(needed: number) {
    if (this.y + needed > this.pageH - 20) {
      this.newPage();
    }
  }

  // ── Cover page ────────────────────────────────────────────────
  drawCover(brandName: string) {
    this.drawPageBg();
    // Gold accent bar
    this.doc.setFillColor(...GOLD);
    this.doc.rect(this.margin, 60, 4, 50, "F");

    // Title
    this.doc.setFontSize(28);
    this.doc.setTextColor(...WHITE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Eigenmarke Starter", this.margin + 12, 78);
    this.doc.text("Blueprint 2026", this.margin + 12, 90);

    // Brand name
    this.doc.setFontSize(14);
    this.doc.setTextColor(...GOLD);
    this.doc.text(brandName, this.margin + 12, 104);

    // Date
    this.doc.setFontSize(10);
    this.doc.setTextColor(...LIGHT_GRAY);
    this.doc.text(`Erstellt am ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}`, this.margin + 12, 114);

    // Bottom badge
    this.doc.setFillColor(...CARD_BG);
    this.doc.roundedRect(this.margin, 200, this.contentW, 40, 3, 3, "F");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...GOLD);
    this.doc.text("DEIN STRATEGISCHER FAHRPLAN", this.margin + 8, 214);
    this.doc.setTextColor(...LIGHT_GRAY);
    this.doc.setFontSize(8);
    const desc = "Dieser Blueprint fasst deine gesamte Eigenmarken-Strategie zusammen — von der Marktvalidierung bis zum Launch. Nutze ihn als Handlungsleitfaden für die nächsten Monate.";
    const descLines = this.doc.splitTextToSize(desc, this.contentW - 16);
    this.doc.text(descLines, this.margin + 8, 222);

    // buildyourbrand.de watermark
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MID_GRAY);
    this.doc.text("buildyourbrand.de", this.pageW / 2, this.pageH - 15, { align: "center" });
  }

  // ── Section header ────────────────────────────────────────────
  sectionHeader(num: number, title: string) {
    this.newPage();
    // Number badge
    this.doc.setFillColor(...GOLD);
    this.doc.roundedRect(this.margin, this.y, 10, 10, 2, 2, "F");
    this.doc.setFontSize(14);
    this.doc.setTextColor(...DARK);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${num}`, this.margin + 5, this.y + 7.5, { align: "center" });

    // Title
    this.doc.setFontSize(18);
    this.doc.setTextColor(...WHITE);
    this.doc.text(title, this.margin + 14, this.y + 7.5);
    this.y += 18;

    // Separator
    this.doc.setDrawColor(...GOLD);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.y, this.margin + 60, this.y);
    this.y += 8;
  }

  // ── Subsection ────────────────────────────────────────────────
  subTitle(text: string) {
    this.ensureSpace(12);
    this.doc.setFontSize(11);
    this.doc.setTextColor(...GOLD);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(text, this.margin, this.y);
    this.y += 7;
  }

  // ── Body text ─────────────────────────────────────────────────
  body(text: string, color: RGB = LIGHT_GRAY) {
    this.ensureSpace(8);
    this.doc.setFontSize(9);
    this.doc.setTextColor(...color);
    this.doc.setFont("helvetica", "normal");
    const lines = this.doc.splitTextToSize(text, this.contentW);
    for (const line of lines) {
      this.ensureSpace(5);
      this.doc.text(line, this.margin, this.y);
      this.y += 4.5;
    }
    this.y += 3;
  }

  // ── Bullet point ──────────────────────────────────────────────
  bullet(text: string) {
    this.ensureSpace(6);
    this.doc.setFontSize(9);
    this.doc.setTextColor(...LIGHT_GRAY);
    this.doc.setFont("helvetica", "normal");
    // Gold bullet dot
    this.doc.setFillColor(...GOLD);
    this.doc.circle(this.margin + 2, this.y - 1, 1, "F");
    const lines = this.doc.splitTextToSize(text, this.contentW - 8);
    this.doc.text(lines, this.margin + 6, this.y);
    this.y += lines.length * 4.5 + 2;
  }

  // ── Key-Value pair ────────────────────────────────────────────
  kv(key: string, value: string) {
    this.ensureSpace(7);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...GOLD);
    this.doc.text(key, this.margin, this.y);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...WHITE);
    this.doc.text(value, this.margin + 55, this.y);
    this.y += 6;
  }

  // ── Card box ──────────────────────────────────────────────────
  card(title: string, content: string) {
    const lines = this.doc.splitTextToSize(content, this.contentW - 16);
    const cardH = 14 + lines.length * 4.5;
    this.ensureSpace(cardH + 4);
    this.doc.setFillColor(...CARD_BG);
    this.doc.roundedRect(this.margin, this.y, this.contentW, cardH, 2, 2, "F");

    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...GOLD);
    this.doc.text(title, this.margin + 8, this.y + 8);

    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...LIGHT_GRAY);
    this.doc.text(lines, this.margin + 8, this.y + 14);

    this.y += cardH + 5;
  }

  // ── Callout / CTA ─────────────────────────────────────────────
  callout(text: string) {
    this.ensureSpace(18);
    this.doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    this.doc.roundedRect(this.margin, this.y, this.contentW, 14, 2, 2, "F");
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...DARK);
    this.doc.text(`→ ${text}`, this.margin + 6, this.y + 9);
    this.y += 20;
  }

  // ── Checklist item ────────────────────────────────────────────
  checkItem(label: string, done: boolean) {
    this.ensureSpace(7);
    this.doc.setFontSize(9);
    if (done) {
      this.doc.setTextColor(100, 200, 100);
      this.doc.text("✓", this.margin, this.y);
    } else {
      this.doc.setTextColor(200, 80, 80);
      this.doc.text("○", this.margin, this.y);
    }
    this.doc.setTextColor(...LIGHT_GRAY);
    this.doc.text(label, this.margin + 6, this.y);
    this.y += 5.5;
  }

  // ── Metric row ────────────────────────────────────────────────
  metricRow(metrics: { label: string; value: string; highlight?: boolean }[]) {
    this.ensureSpace(22);
    const colW = this.contentW / metrics.length;
    metrics.forEach((m, i) => {
      const x = this.margin + i * colW;
      this.doc.setFillColor(...CARD_BG);
      this.doc.roundedRect(x + 1, this.y, colW - 2, 18, 2, 2, "F");

      this.doc.setFontSize(7);
      this.doc.setTextColor(...MID_GRAY);
      this.doc.text(m.label, x + colW / 2, this.y + 6, { align: "center" });

      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...(m.highlight ? GOLD : WHITE));
      this.doc.text(m.value, x + colW / 2, this.y + 14, { align: "center" });
      this.doc.setFont("helvetica", "normal");
    });
    this.y += 24;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  BLUEPRINT GENERATOR
// ═══════════════════════════════════════════════════════════════════

export function generateBlueprint(data: BlueprintData): void {
  const pdf = new BlueprintPDF();

  // ── COVER ─────────────────────────────────────────────────────
  pdf.drawCover(data.brandName);

  // ── 1. Executive Summary ──────────────────────────────────────
  pdf.sectionHeader(1, "Executive Summary");
  pdf.body("Dieser Blueprint gibt dir einen vollständigen Überblick über die strategische Planung deiner Eigenmarke — von der Positionierung über Finanzen bis hin zum Launch.");

  if (data.positioning || data.productDescription) {
    pdf.subTitle("Deine Marke auf einen Blick");
    if (data.positioning) pdf.kv("Positionierung", data.positioning);
    if (data.targetAudience) pdf.kv("Zielgruppe", data.targetAudience);
    if (data.productDescription) pdf.kv("Produkt", data.productDescription);
    if (data.country) pdf.kv("Zielmarkt", data.country);
  }

  // KPI overview
  const metrics: { label: string; value: string; highlight?: boolean }[] = [];
  if (data.margin != null) metrics.push({ label: "Marge", value: `${data.margin.toFixed(0)}%`, highlight: data.margin >= 40 });
  if (data.breakEvenUnits != null) metrics.push({ label: "Break-even", value: `${data.breakEvenUnits} Stk` });
  if (data.complianceScore != null) metrics.push({ label: "Compliance", value: `${data.complianceScore}%`, highlight: data.complianceScore >= 80 });
  if (data.riskScore != null) metrics.push({ label: "Risiko-Score", value: `${data.riskScore}/100` });
  if (metrics.length > 0) {
    pdf.subTitle("Kennzahlen");
    pdf.metricRow(metrics);
  }

  // ── 2. Marktvalidierung ───────────────────────────────────────
  pdf.sectionHeader(2, "Marktvalidierung");
  pdf.body("Eine gründliche Marktvalidierung ist die Grundlage jeder erfolgreichen Eigenmarke. Vor der ersten Bestellung musst du sicherstellen, dass echte Nachfrage existiert.");

  pdf.subTitle("Strategische Empfehlungen");
  pdf.bullet("Analysiere 5–10 direkte Wettbewerber auf Amazon/Google und identifiziere Lücken in deren Angebot");
  pdf.bullet("Teste deine Produktidee mit einer Landing Page und messe die Conversion Rate vor der Produktion");
  pdf.bullet("Validiere deine Preisstrategie durch Kundenbefragungen — mindestens 50 qualifizierte Antworten");
  pdf.bullet("Recherchiere Suchvolumen für deine Produktkategorie (Google Trends, Amazon-Suchvorschläge)");

  if (data.marketAngle) {
    pdf.subTitle("Dein Marktwinkel");
    pdf.body(data.marketAngle);
  }
  if (data.differentiation) {
    pdf.subTitle("Differenzierung");
    pdf.body(data.differentiation);
  }

  pdf.subTitle("Aktionsschritte");
  pdf.bullet("Erstelle eine Wettbewerbsmatrix mit Preis, USP und Bewertungen");
  pdf.bullet("Definiere dein Alleinstellungsmerkmal in einem Satz");
  pdf.bullet("Identifiziere 3 unterbediente Kundenbedürfnisse in deiner Nische");

  pdf.callout("Für präzise Marktanalysen nutze den Pro Scenario Engine auf buildyourbrand.de");

  // ── 3. Finanzstrategie ────────────────────────────────────────
  pdf.sectionHeader(3, "Finanzstrategie");
  pdf.body("Deine Finanzzahlen entscheiden über Erfolg oder Scheitern. Eine realistische Kalkulation schützt dich vor den häufigsten Gründerfehlern.");

  if (data.productionCost != null || data.recommendedPrice != null) {
    pdf.subTitle("Deine Kalkulationsdaten");
    if (data.productionCost != null) pdf.kv("Produktionskosten", `${data.productionCost.toFixed(2)} €/Stk`);
    if (data.packagingCost != null) pdf.kv("Verpackungskosten", `${data.packagingCost.toFixed(2)} €/Stk`);
    if (data.shippingCost != null) pdf.kv("Versandkosten", `${data.shippingCost.toFixed(2)} €/Stk`);
    if (data.marketingBudget != null) pdf.kv("Marketing-Budget", `${data.marketingBudget.toFixed(0)} €/Monat`);
    if (data.recommendedPrice != null) pdf.kv("Empfohlener VK-Preis", `${data.recommendedPrice.toFixed(2)} €`);
    if (data.margin != null) pdf.kv("Kalkulierte Marge", `${data.margin.toFixed(1)}%`);
    if (data.breakEvenUnits != null) pdf.kv("Break-even Punkt", `${data.breakEvenUnits} Stück`);
    if (data.capitalSafetyLevel) pdf.kv("Kapital-Sicherheit", data.capitalSafetyLevel);
  }

  pdf.subTitle("Strategische Empfehlungen");
  pdf.bullet("Mindestmarge von 40% anstreben — alles darunter lässt keinen Raum für Fehler");
  pdf.bullet("Marketing-Budget: 15–25% des geplanten Monatsumsatzes einplanen");
  pdf.bullet("Kapitalreserve für mindestens 6 Monate Fixkosten vorhalten");
  pdf.bullet("Break-even innerhalb der ersten 3–4 Monate als Ziel setzen");

  if (data.margin != null && data.margin < 40) {
    pdf.card("⚠️ Marge-Warnung", `Deine aktuelle Marge von ${data.margin.toFixed(1)}% liegt unter dem empfohlenen Minimum von 40%. Prüfe: Kannst du den VK-Preis erhöhen oder die Produktionskosten durch größere MOQ senken?`);
  }

  pdf.callout("Simuliere verschiedene Preis-/Mengen-Szenarien im Pro Scenario Engine");

  // ── 4. Produktionsstrategie ───────────────────────────────────
  pdf.sectionHeader(4, "Produktionsstrategie");
  pdf.body("Die richtige Produktionsstrategie minimiert dein Risiko und stellt sicher, dass dein Produkt qualitativ und termingerecht geliefert wird.");

  if (data.productionRegion || data.moqExpectation || data.productCategory) {
    pdf.subTitle("Deine Produktionsdaten");
    if (data.productionRegion) pdf.kv("Produktionsregion", data.productionRegion);
    if (data.moqExpectation) pdf.kv("MOQ-Erwartung", data.moqExpectation);
    if (data.productCategory) pdf.kv("Produktkategorie", data.productCategory);
  }

  pdf.subTitle("Strategische Empfehlungen");
  pdf.bullet("Fordere immer 2–3 Muster von verschiedenen Lieferanten an, bevor du bestellst");
  pdf.bullet("Verhandle MOQ — viele Hersteller reduzieren bei Erstbestellern um 30–50%");
  pdf.bullet("Dokumentiere jede Spezifikation schriftlich: Material, Farbe, Maße, Gewicht");
  pdf.bullet("Plane 2–4 Wochen Puffer auf die angegebene Lieferzeit ein");
  pdf.bullet("Prüfe Zertifizierungen des Herstellers (ISO 9001, BSCI, etc.)");

  pdf.subTitle("Aktionsschritte");
  pdf.bullet("Lieferanten-Shortlist mit 3 Kandidaten erstellen");
  pdf.bullet("Qualitätscheckliste für Musterprüfung definieren");
  pdf.bullet("Produktionszeitplan mit Meilensteinen aufsetzen");
  pdf.bullet("Zahlungsbedingungen verhandeln (30% Anzahlung / 70% vor Versand ist Standard)");

  pdf.callout("Nutze den Supplier Risk Score im Strategic Dashboard für datenbasierte Lieferantenauswahl");

  // ── 5. Compliance Check ───────────────────────────────────────
  pdf.sectionHeader(5, "Compliance Check");
  pdf.body("Rechtliche Compliance ist keine Option, sondern Pflicht. Fehlende Dokumente können zu Abmahnungen, Bußgeldern oder Verkaufsverboten führen.");

  if (data.complianceItems && data.complianceItems.length > 0) {
    pdf.subTitle("Dein Compliance-Status");
    if (data.complianceScore != null) {
      pdf.metricRow([
        { label: "Compliance Score", value: `${data.complianceScore}%`, highlight: data.complianceScore >= 80 },
        { label: "Erledigt", value: `${data.complianceItems.filter(i => i.done).length}/${data.complianceItems.length}` },
        { label: "Status", value: data.complianceScore >= 80 ? "Bereit" : data.complianceScore >= 50 ? "In Arbeit" : "Kritisch" },
      ]);
    }
    pdf.subTitle("Checkliste");
    for (const item of data.complianceItems) {
      pdf.checkItem(item.label, item.done);
    }
  } else {
    pdf.subTitle("Pflicht-Checkliste");
    const defaultItems = [
      "Gewerbeanmeldung", "DSGVO Basis-Assessment", "Impressum", "Datenschutzerklärung",
      "Widerrufsbelehrung", "VerpackG Registrierung (LUCID)", "Produktkennzeichnung", "AGB",
    ];
    for (const item of defaultItems) {
      pdf.checkItem(item, false);
    }
  }

  pdf.subTitle("Strategische Empfehlungen");
  pdf.bullet("Impressum und Datenschutzerklärung VOR dem Shop-Launch fertigstellen");
  pdf.bullet("LUCID-Registrierung frühzeitig beantragen — Bearbeitungszeit einplanen");
  pdf.bullet("CE-Kennzeichnung bei Elektro-, Kosmetik- oder Spielzeugprodukten prüfen lassen");
  pdf.bullet("AGB von einem Fachanwalt oder einem spezialisierten Generator erstellen lassen");

  pdf.callout("Nutze den interaktiven Compliance Wizard auf buildyourbrand.de/dashboard/compliance");

  // ── 6. Launch Plan ────────────────────────────────────────────
  pdf.sectionHeader(6, "Launch Plan");
  pdf.body("Ein strukturierter Launch-Plan erhöht deine Erfolgschancen dramatisch. Die ersten 30 Tage entscheiden über die Dynamik deiner Marke.");

  if (data.salesChannel || data.launchQuantity) {
    pdf.subTitle("Deine Launch-Daten");
    if (data.salesChannel) pdf.kv("Vertriebskanal", data.salesChannel);
    if (data.fulfillment) pdf.kv("Fulfillment-Modell", data.fulfillment);
    if (data.launchQuantity) pdf.kv("Launch-Menge", `${data.launchQuantity} Stück`);
    if (data.launchTimeline) pdf.kv("Geplanter Launch", data.launchTimeline);
  }

  pdf.subTitle("4-Wochen Launch-Fahrplan");
  pdf.card("Woche 1 — Vorbereitung", "Social-Media-Profile erstellen · Content-Kalender planen · Teaser-Content produzieren · E-Mail-Liste aufbauen · Influencer recherchieren");
  pdf.card("Woche 2 — Pre-Launch", "Landing Page live schalten · Erste Teaser posten · Warteliste bewerben · Pressemitteilung vorbereiten · Produktfotos finalisieren");
  pdf.card("Woche 3 — Launch", "Shop live schalten · Launch-Announcement posten · E-Mail an Warteliste senden · Erste Ads schalten · PR-Outreach starten");
  pdf.card("Woche 4 — Optimierung", "Kundenfeedback sammeln · Ads optimieren · Retargeting einrichten · Review-Kampagne starten · Erste Analyse & Learnings");

  pdf.callout("Die adaptive Launch-Roadmap im Dashboard passt sich dynamisch an deine Fortschritte an");

  // ── 7. Risikominimierung ──────────────────────────────────────
  pdf.sectionHeader(7, "Risikominimierung");
  pdf.body("Jeder erfolgreiche Gründer plant für das Worst-Case-Szenario. Diese Strategien schützen dein Kapital und deine Marke.");

  if (data.riskScore != null) {
    pdf.subTitle("Dein Risiko-Profil");
    const riskLabel = data.riskScore <= 30 ? "Niedrig" : data.riskScore <= 60 ? "Mittel" : "Hoch";
    pdf.metricRow([
      { label: "Risiko-Score", value: `${data.riskScore}/100`, highlight: data.riskScore <= 30 },
      { label: "Risikostufe", value: riskLabel },
    ]);
  }

  pdf.subTitle("Top-Strategien zur Risikominimierung");
  pdf.bullet("Starte mit der kleinstmöglichen MOQ — validiere den Markt, bevor du skalierst");
  pdf.bullet("Diversifiziere: Arbeite mit mindestens 2 Lieferanten oder halte einen Backup bereit");
  pdf.bullet("Halte 20% des Gesamtbudgets als Notfallreserve zurück");
  pdf.bullet("Plane einen realistischen Worst-Case: Was passiert, wenn du nur 50% der geplanten Menge verkaufst?");
  pdf.bullet("Versichere teure Lieferungen und prüfe Incoterms genau");
  pdf.bullet("Dokumentiere alle Vereinbarungen schriftlich — auch informelle Absprachen");

  pdf.subTitle("Häufigste Fehler vermeiden");
  pdf.card("❌ Fehler #1: Zu hohe Erstbestellung", "Viele Gründer bestellen 5.000+ Stück, bevor der Markt validiert ist. Starte mit der minimalen MOQ und skaliere nach Bedarf.");
  pdf.card("❌ Fehler #2: Kein finanzieller Puffer", "Unerwartete Kosten (Zoll, Nachproduktion, Marketing) können den Launch gefährden. Plane 25–30% Budget-Puffer ein.");
  pdf.card("❌ Fehler #3: Compliance ignoriert", "Eine einzige Abmahnung kann 5.000–15.000 € kosten. Erledige alle rechtlichen Anforderungen VOR dem Launch.");

  pdf.callout("Vermeide €5.000–€20.000 teure Fehler — nutze das Strategic Intelligence Dashboard auf buildyourbrand.de");

  // ── Save ──────────────────────────────────────────────────────
  pdf.save(`${data.brandName.replace(/\s+/g, "_")}_Blueprint_2026.pdf`);
}

// ═══════════════════════════════════════════════════════════════════
//  WORKFLOW STEP PDF EXPORT
// ═══════════════════════════════════════════════════════════════════

export interface WorkflowPdfSection {
  title: string;
  items: { label: string; checked: boolean; detail?: string }[];
}

export function generateWorkflowPdf(
  brandName: string,
  pageTitle: string,
  sections: WorkflowPdfSection[]
): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > 270) { doc.addPage(); y = margin; }
  };

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${pageTitle} — ${brandName}`, margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Erstellt am ${new Date().toLocaleDateString("de-DE")}`, margin, y);
  y += 6;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, 190, y);
  y += 8;

  for (const section of sections) {
    ensureSpace(14);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 7;

    for (const item of section.items) {
      ensureSpace(item.detail ? 12 : 7);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const icon = item.checked ? "✓" : "○";
      doc.setTextColor(item.checked ? 60 : 160, item.checked ? 160 : 80, item.checked ? 60 : 80);
      doc.text(icon, margin, y);
      doc.setTextColor(0, 0, 0);
      doc.text(item.label, margin + 6, y);
      y += 5;

      if (item.detail) {
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        const lines = doc.splitTextToSize(item.detail, 160);
        doc.text(lines, margin + 6, y);
        y += lines.length * 4;
        doc.setTextColor(0, 0, 0);
      }
      y += 1;
    }
    y += 4;
  }

  // Summary
  const totalItems = sections.flatMap(s => s.items);
  const doneCount = totalItems.filter(i => i.checked).length;
  ensureSpace(14);
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, 190, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Fortschritt: ${doneCount}/${totalItems.length} erledigt (${totalItems.length > 0 ? Math.round((doneCount / totalItems.length) * 100) : 0}%)`, margin, y);

  doc.save(`${brandName.replace(/\s+/g, "_")}_${pageTitle.replace(/\s+/g, "_")}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════
//  LEGACY: keep old function for backward compat
// ═══════════════════════════════════════════════════════════════════

export function generateBrandReport(data: BrandReportData): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const addTitle = (text: string) => {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += 10;
  };

  const addSection = (title: string) => {
    if (y > 260) { doc.addPage(); y = margin; }
    y += 6;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 7;
  };

  const addText = (text: string) => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  };

  const addKeyValue = (key: string, value: string) => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${key}: `, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + doc.getTextWidth(`${key}: `), y);
    y += 6;
  };

  addTitle(`Brand Report — ${data.brandName}`);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Erstellt am ${new Date().toLocaleDateString("de-DE")}`, margin, y);
  y += 10;
  doc.line(margin, y, 190, y);
  y += 6;

  if (data.positioning) { addSection("Positionierung"); addText(data.positioning); }
  if (data.values) { addSection("Markenwerte"); addText(data.values); }
  if (data.marketAngle) { addSection("Marktwinkel"); addText(data.marketAngle); }
  if (data.differentiation) { addSection("Differenzierung"); addText(data.differentiation); }

  if (data.production) {
    addSection("Finanzen");
    addKeyValue("Produktionskosten", `${data.production.cost} €`);
    addKeyValue("Verpackung", `${data.production.packaging} €`);
    addKeyValue("Versand", `${data.production.shipping} €`);
    addKeyValue("Marketing", `${data.production.marketing} €`);
    if (data.recommendedPrice) addKeyValue("Empf. Preis", `${data.recommendedPrice.toFixed(2)} €`);
    if (data.margin) addKeyValue("Marge", `${data.margin.toFixed(1)}%`);
    if (data.breakEven) addKeyValue("Break-even", `${data.breakEven} Stück`);
  }

  if (data.complianceChecklist?.length) {
    addSection("Compliance-Checkliste");
    data.complianceChecklist.forEach(({ item, checked }) => {
      addText(`${checked ? "✓" : "○"} ${item}`);
    });
  }

  if (data.salesChannel) {
    addSection("Vertrieb");
    addKeyValue("Kanal", data.salesChannel);
    if (data.fulfillment) addKeyValue("Fulfillment", data.fulfillment);
    if (data.launchQuantity) addKeyValue("Launch-Menge", `${data.launchQuantity}`);
  }

  doc.save(`${data.brandName.replace(/\s+/g, "_")}_Report.pdf`);
}
