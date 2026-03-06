// ─── Adaptive Workflow Engine ────────────────────────────────────
// Dynamic step/task generation based on product type, category, region, and risk profile.
// Replaces static checklists with context-aware, profile-driven tasks.

import type { BrandProfile } from "./brand-profile";

// ── Types ────────────────────────────────────────────────────────

export type ProductClass = "physical" | "digital" | "hybrid";

export interface AdaptiveTask {
  id: string;
  title: string;
  description: string;
  step: number;             // 1-5
  priority: "critical" | "high" | "medium" | "low";
  estimatedMinutes: number;
  requiredForLaunch: boolean;
  categorySpecific: boolean;
  riskImpact?: number;      // estimated € impact if skipped
  regulatoryFlag?: boolean;
}

export interface AdaptiveStepConfig {
  step: number;
  title: string;
  subtitle: string;
  tasks: AdaptiveTask[];
  timeEstimate: string;
  riskLevel: "low" | "medium" | "high";
  completionWeight: number; // 0-100, how much this step contributes to launch readiness
}

// ── Product Classification ──────────────────────────────────────

export function classifyProduct(profile: BrandProfile): ProductClass {
  const cat = profile.categoryId?.toLowerCase() || "";
  const type = profile.productType?.toLowerCase() || "";

  const digitalKeywords = ["digital", "ebook", "kurs", "course", "software", "saas", "template", "download"];
  const physicalKeywords = ["cosmetics", "kosmetik", "food", "lebensmittel", "electronics", "elektronik",
    "apparel", "textil", "fashion", "supplements", "nahrungsergaenzung", "home", "möbel",
    "schmuck", "jewelry", "spielzeug", "toys", "pet", "haustier"];

  const isDigital = digitalKeywords.some(k => cat.includes(k) || type.includes(k));
  const isPhysical = physicalKeywords.some(k => cat.includes(k) || type.includes(k));

  if (isDigital && isPhysical) return "hybrid";
  if (isDigital) return "digital";
  return "physical"; // default
}

// ── Category Detection ──────────────────────────────────────────

interface CategoryFlags {
  isCosmetics: boolean;
  isFood: boolean;
  isSupplements: boolean;
  isElectronics: boolean;
  isApparel: boolean;
  isDigital: boolean;
}

function detectCategory(profile: BrandProfile): CategoryFlags {
  const cat = (profile.categoryId || "").toLowerCase();
  return {
    isCosmetics: ["cosmetics", "kosmetik", "skincare", "beauty"].some(c => cat.includes(c)),
    isFood: ["food", "lebensmittel", "snacks", "getränke", "drinks"].some(f => cat.includes(f)),
    isSupplements: ["supplements", "nahrungsergaenzung", "supplement", "vitamine"].some(s => cat.includes(s)),
    isElectronics: ["electronics", "elektronik", "tech"].some(e => cat.includes(e)),
    isApparel: ["apparel", "textil", "fashion", "kleidung", "mode"].some(a => cat.includes(a)),
    isDigital: ["digital", "ebook", "kurs", "software", "saas"].some(d => cat.includes(d)),
  };
}

// ── Task Generation ─────────────────────────────────────────────

function t(id: string, title: string, desc: string, step: number, opts: Partial<AdaptiveTask> = {}): AdaptiveTask {
  return {
    id, title, description: desc, step,
    priority: opts.priority ?? "medium",
    estimatedMinutes: opts.estimatedMinutes ?? 10,
    requiredForLaunch: opts.requiredForLaunch ?? false,
    categorySpecific: opts.categorySpecific ?? false,
    riskImpact: opts.riskImpact,
    regulatoryFlag: opts.regulatoryFlag,
  };
}

export function generateAdaptiveTasks(profile: BrandProfile, plan: string): AdaptiveTask[] {
  const tasks: AdaptiveTask[] = [];
  const productClass = classifyProduct(profile);
  const cat = detectCategory(profile);
  const isEU = profile.targetRegion === "DE" || profile.targetRegion === "EU";
  const isPro = plan === "pro" || plan === "execution";
  const isExecution = plan === "execution";

  // ── Step 1: Validation & Brand ────────────────────────────
  tasks.push(t("val_product", "Produkt definieren", "Beschreibe dein Produkt, Zielgruppe und Preisniveau.", 1,
    { priority: "critical", requiredForLaunch: true, estimatedMinutes: 15 }));
  tasks.push(t("val_market", "Marktsegment validieren", "Bestätige die Nachfrage in deinem Zielmarkt.", 1,
    { priority: "high", estimatedMinutes: 20, riskImpact: 3000 }));
  tasks.push(t("val_brand_name", "Markennamen festlegen", "Wähle einen einprägsamen, verfügbaren Markennamen.", 1,
    { priority: "high", requiredForLaunch: true, estimatedMinutes: 30 }));
  tasks.push(t("val_positioning", "Positionierung schärfen", "Definiere dein Alleinstellungsmerkmal und Tonalität.", 1,
    { priority: "medium", estimatedMinutes: 20 }));

  if (cat.isCosmetics) {
    tasks.push(t("val_cosmetic_reg", "Kosmetik-Regulierung prüfen", "EU Cosmetic Regulation 1223/2009 Anforderungen klären.", 1,
      { priority: "critical", categorySpecific: true, regulatoryFlag: true, riskImpact: 15000, requiredForLaunch: true }));
  }
  if (cat.isFood || cat.isSupplements) {
    tasks.push(t("val_food_safety", "Lebensmittelsicherheit prüfen", "LMIV, Health Claims Verordnung und HACCP-Konzept.", 1,
      { priority: "critical", categorySpecific: true, regulatoryFlag: true, riskImpact: 25000, requiredForLaunch: true }));
  }

  // ── Step 2: Financial Model ───────────────────────────────
  tasks.push(t("fin_costs", "Kostenstruktur erfassen", "Produktions-, Verpackungs-, Versand- und Marketingkosten.", 2,
    { priority: "critical", requiredForLaunch: true, estimatedMinutes: 20 }));
  tasks.push(t("fin_pricing", "Preiskalkulation", "Verkaufspreis unter Berücksichtigung der Marge festlegen.", 2,
    { priority: "critical", requiredForLaunch: true, estimatedMinutes: 15, riskImpact: 5000 }));
  tasks.push(t("fin_breakeven", "Break-even berechnen", "Ab wann wird dein Produkt profitabel?", 2,
    { priority: "high", estimatedMinutes: 10 }));

  if (profile.budget !== null && profile.budget < 5000) {
    tasks.push(t("fin_bootstrap", "Bootstrap-Strategie entwickeln", "Mit < 5.000 € Budget brauchst du eine schlanke Startstrategie.", 2,
      { priority: "high", riskImpact: 2000 }));
  }

  if (isPro) {
    tasks.push(t("fin_scenario", "Szenario-Simulation durchführen", "Teste optimistische, realistische und worst-case Szenarien.", 2,
      { priority: "medium", estimatedMinutes: 15 }));
  }

  // ── Step 3: Production & Sourcing ─────────────────────────
  if (productClass !== "digital") {
    tasks.push(t("prod_supplier", "Lieferanten identifizieren", "Mindestens 2-3 Lieferanten kontaktieren und vergleichen.", 3,
      { priority: "critical", requiredForLaunch: true, estimatedMinutes: 45, riskImpact: 8000 }));
    tasks.push(t("prod_sample", "Muster bestellen", "Qualitätsmuster vor Großbestellung prüfen.", 3,
      { priority: "high", requiredForLaunch: true, estimatedMinutes: 15 }));
    tasks.push(t("prod_moq", "MOQ verhandeln", "Mindestbestellmenge mit Budget abstimmen.", 3,
      { priority: "high", estimatedMinutes: 20, riskImpact: 4000 }));
    tasks.push(t("prod_qc", "QC-Checkliste erstellen", "Qualitätskriterien für die Produktion definieren.", 3,
      { priority: "medium", estimatedMinutes: 20 }));

    if (cat.isElectronics) {
      tasks.push(t("prod_ce", "CE-Konformität sicherstellen", "Konformitätsbewertung und technische Dokumentation.", 3,
        { priority: "critical", categorySpecific: true, regulatoryFlag: true, riskImpact: 20000, requiredForLaunch: true }));
    }
    if (cat.isCosmetics) {
      tasks.push(t("prod_cpnp", "CPNP-Registrierung planen", "Produkt im Cosmetic Products Notification Portal anmelden.", 3,
        { priority: "critical", categorySpecific: true, regulatoryFlag: true, riskImpact: 10000, requiredForLaunch: true }));
    }
  } else {
    tasks.push(t("prod_digital_platform", "Hosting / Plattform wählen", "Wo wird dein digitales Produkt gehostet und verkauft?", 3,
      { priority: "high", requiredForLaunch: true, estimatedMinutes: 30 }));
    tasks.push(t("prod_digital_delivery", "Automatisierte Auslieferung", "Download-Links, Kursplattform oder API-Zugang einrichten.", 3,
      { priority: "high", requiredForLaunch: true, estimatedMinutes: 45 }));
  }

  // ── Step 4: Compliance & Sales ────────────────────────────
  if (isEU) {
    tasks.push(t("comp_verpackg", "VerpackG (LUCID) registrieren", "Pflicht für alle Verpackungen im deutschen Markt.", 4,
      { priority: "critical", requiredForLaunch: true, regulatoryFlag: true, riskImpact: 200000, estimatedMinutes: 30 }));
    tasks.push(t("comp_impressum", "Impressum & AGB erstellen", "Rechtssichere Angaben für Online-Vertrieb.", 4,
      { priority: "critical", requiredForLaunch: true, regulatoryFlag: true, riskImpact: 10000 }));
    tasks.push(t("comp_dsgvo", "DSGVO-Konformität prüfen", "Datenschutzerklärung und Cookie-Consent.", 4,
      { priority: "high", regulatoryFlag: true, riskImpact: 5000 }));
    tasks.push(t("comp_widerruf", "Widerrufsbelehrung", "14-tägiges Widerrufsrecht korrekt abbilden.", 4,
      { priority: "high", requiredForLaunch: true, regulatoryFlag: true }));
  }

  tasks.push(t("sales_channel", "Vertriebskanal wählen", "Amazon, eigener Shop, Retail oder Marktplatz?", 4,
    { priority: "high", requiredForLaunch: true, estimatedMinutes: 20 }));

  if (cat.isFood || cat.isSupplements) {
    tasks.push(t("comp_labeling", "Etikettierung prüfen", "Nährwerttabelle, Allergen-Deklaration, MHD.", 4,
      { priority: "critical", categorySpecific: true, regulatoryFlag: true, riskImpact: 25000, requiredForLaunch: true }));
  }

  // ── Step 5: Launch Roadmap ────────────────────────────────
  tasks.push(t("launch_quantity", "Launch-Menge festlegen", "Erste Bestellmenge basierend auf Budget und Nachfrage.", 5,
    { priority: "high", requiredForLaunch: true, estimatedMinutes: 15 }));
  tasks.push(t("launch_fulfillment", "Fulfillment-Modell wählen", "Self-Fulfillment, 3PL oder FBA?", 5,
    { priority: "high", requiredForLaunch: true, estimatedMinutes: 20 }));
  tasks.push(t("launch_timeline", "Launch-Timeline erstellen", "Meilensteine und Deadlines für den Go-Live.", 5,
    { priority: "medium", estimatedMinutes: 20 }));
  tasks.push(t("launch_marketing", "Marketing-Plan erstellen", "Erste Kampagne und Kanäle für den Launch.", 5,
    { priority: "high", estimatedMinutes: 30, riskImpact: 3000 }));

  if (isExecution) {
    tasks.push(t("launch_kpi", "KPI-Tracking einrichten", "Conversion Rate, CAC, ROAS und Retourenquote tracken.", 5,
      { priority: "medium", estimatedMinutes: 20 }));
  }

  return tasks;
}

// ── Step Config Generator ───────────────────────────────────────

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Validierung & Marke", subtitle: "Produkt, Markt und Markenidentität definieren" },
  2: { title: "Finanzkalkulation", subtitle: "Kosten, Preise und Profitabilität berechnen" },
  3: { title: "Produktion & Sourcing", subtitle: "Lieferanten, Qualität und Beschaffung planen" },
  4: { title: "Compliance & Vertrieb", subtitle: "Rechtliche Pflichten erfüllen und Kanal wählen" },
  5: { title: "Launch-Roadmap", subtitle: "Go-Live vorbereiten und Meilensteine setzen" },
};

export function generateAdaptiveSteps(profile: BrandProfile, plan: string): AdaptiveStepConfig[] {
  const tasks = generateAdaptiveTasks(profile, plan);

  return [1, 2, 3, 4, 5].map(step => {
    const stepTasks = tasks.filter(t => t.step === step);
    const criticalCount = stepTasks.filter(t => t.priority === "critical").length;
    const totalMinutes = stepTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const totalRiskImpact = stepTasks.reduce((sum, t) => sum + (t.riskImpact ?? 0), 0);
    const riskLevel: "low" | "medium" | "high" =
      criticalCount >= 3 || totalRiskImpact > 50000 ? "high" :
      criticalCount >= 1 || totalRiskImpact > 10000 ? "medium" : "low";

    const hours = Math.round(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeEstimate = hours > 0 ? `${hours}h ${mins > 0 ? mins + "min" : ""}` : `${mins} min`;

    const { title, subtitle } = STEP_TITLES[step];

    return {
      step,
      title,
      subtitle,
      tasks: stepTasks,
      timeEstimate: timeEstimate.trim(),
      riskLevel,
      completionWeight: Math.round(100 / 5),
    };
  });
}

// ── Summary Stats ───────────────────────────────────────────────

export interface WorkflowSummary {
  totalTasks: number;
  criticalTasks: number;
  regulatoryTasks: number;
  categorySpecificTasks: number;
  totalRiskExposure: number;
  estimatedTotalMinutes: number;
  productClass: ProductClass;
}

export function getWorkflowSummary(profile: BrandProfile, plan: string): WorkflowSummary {
  const tasks = generateAdaptiveTasks(profile, plan);
  return {
    totalTasks: tasks.length,
    criticalTasks: tasks.filter(t => t.priority === "critical").length,
    regulatoryTasks: tasks.filter(t => t.regulatoryFlag).length,
    categorySpecificTasks: tasks.filter(t => t.categorySpecific).length,
    totalRiskExposure: tasks.reduce((sum, t) => sum + (t.riskImpact ?? 0), 0),
    estimatedTotalMinutes: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
    productClass: classifyProduct(profile),
  };
}
