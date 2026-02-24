import type { Tables, Json } from "@/integrations/supabase/types";

// ─── Types ──────────────────────────────────────────────────────────

export interface BrandWarning {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  category: string;
}

export interface BrandInsight {
  type: "risk" | "optimization" | "strategy";
  title: string;
  description: string;
}

export interface BrandHealthResult {
  score: number;
  color: "red" | "yellow" | "green";
  label: string;
  explanation: string;
  biggestRisk: string;
  nextAction: string;
  warnings: BrandWarning[];
  insights: BrandInsight[];
}

// ─── Data Interfaces ────────────────────────────────────────────────

interface BrandData {
  brand: Tables<"brands"> | null;
  profile: {
    product_description?: string | null;
    target_audience?: string | null;
    price_level?: string | null;
    country?: string | null;
    budget?: string | null;
    timeline?: string | null;
    positioning_statement?: string | null;
    brand_values?: string | null;
    market_angle?: string | null;
    differentiation?: string | null;
  } | null;
  identity: {
    brand_name?: string | null;
    tagline?: string | null;
    tone?: string | null;
    visual_direction?: string | null;
  } | null;
  financial: {
    production_cost?: number | null;
    packaging_cost?: number | null;
    shipping_cost?: number | null;
    marketing_budget?: number | null;
    recommended_price?: number | null;
    margin?: number | null;
    break_even_units?: number | null;
  } | null;
  production: {
    product_category?: string | null;
    production_region?: string | null;
    moq_expectation?: string | null;
    checklist?: Json | null;
    supplier_questions?: Json | null;
    risk_warnings?: Json | null;
  } | null;
  compliance: {
    label_checklist?: Json | null;
    legal_summary?: string | null;
    barcode_guide?: string | null;
  } | null;
  launch: {
    sales_channel?: string | null;
    launch_quantity?: number | null;
    fulfillment_model?: string | null;
    roadmap?: Json | null;
    operational_checklist?: Json | null;
    launch_readiness_score?: number | null;
  } | null;
}

// ─── Engine ─────────────────────────────────────────────────────────

export function analyzeBrandHealth(data: BrandData): BrandHealthResult {
  const warnings: BrandWarning[] = [];
  const insights: BrandInsight[] = [];
  let scoreDeductions = 0;

  const { profile, identity, financial, production, compliance, launch } = data;

  // Track whether user has entered ANY data at all
  const hasProfile = !!profile?.product_description || !!profile?.target_audience || !!profile?.differentiation;
  const hasIdentity = !!identity?.brand_name || !!identity?.tagline;
  const hasFinancial = !!(financial?.production_cost || financial?.packaging_cost || financial?.shipping_cost || financial?.recommended_price);
  const hasProduction = !!production?.production_region || !!production?.moq_expectation;
  const hasLaunch = !!launch?.sales_channel || !!launch?.launch_quantity;
  const hasAnyData = hasProfile || hasIdentity || hasFinancial || hasProduction || hasLaunch;

  // If user hasn't entered any data, return a neutral starting state
  if (!hasAnyData) {
    return {
      score: 0,
      color: "yellow",
      label: "Keine Daten",
      explanation: "Fülle die ersten Schritte aus, um deinen Brand Health Score zu berechnen.",
      biggestRisk: "Noch keine Analyse möglich",
      nextAction: "Beschreibe dein Produkt in Step 1.",
      warnings: [],
      insights: [],
    };
  }

  // ── Pricing vs Cost ────────────────────────────────────────
  const unitCost = (financial?.production_cost ?? 0) + (financial?.packaging_cost ?? 0) + (financial?.shipping_cost ?? 0);
  const price = financial?.recommended_price ?? 0;
  const margin = price > 0 ? ((price - unitCost) / price) * 100 : 0;

  if (unitCost > 0 && margin < 30) {
    warnings.push({
      id: "low-margin",
      severity: "critical",
      title: "Marge zu niedrig",
      message: "Deine Marge liegt unter 30%. Bezahltes Marketing wird damit nicht nachhaltig finanzierbar.",
      category: "pricing",
    });
    scoreDeductions += 20;
  } else if (unitCost > 0 && margin < 50) {
    warnings.push({
      id: "moderate-margin",
      severity: "warning",
      title: "Marge könnte höher sein",
      message: "Eine Marge unter 50% limitiert dein Wachstumspotenzial und deine Marketingoptionen.",
      category: "pricing",
    });
    scoreDeductions += 10;
  }

  // ── Budget Realism ─────────────────────────────────────────
  const budgetStr = profile?.budget || "";
  const budgetNum = parseFloat(budgetStr.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
  const marketingBudget = financial?.marketing_budget ?? 0;

  if (budgetNum > 0 && marketingBudget > budgetNum * 0.7) {
    warnings.push({
      id: "budget-overallocated",
      severity: "warning",
      title: "Marketing-Budget überproportional",
      message: "Mehr als 70% deines Gesamtbudgets fließt ins Marketing. Das lässt wenig Spielraum für Unvorhergesehenes.",
      category: "budget",
    });
    scoreDeductions += 10;
  }

  if (budgetNum > 0 && budgetNum < 2000) {
    warnings.push({
      id: "budget-too-low",
      severity: "warning",
      title: "Budget möglicherweise zu knapp",
      message: "Mit unter 2.000 € Gesamtbudget wird ein professioneller Markenstart schwierig.",
      category: "budget",
    });
    scoreDeductions += 10;
  }

  // ── Launch Quantity vs Margin ──────────────────────────────
  const launchQty = launch?.launch_quantity ?? 0;
  const profitPerUnit = price - unitCost;

  if (launchQty > 0 && profitPerUnit > 0) {
    const totalProfit = launchQty * profitPerUnit;
    if (totalProfit < marketingBudget) {
      warnings.push({
        id: "launch-qty-unprofitable",
        severity: "critical",
        title: "Launch-Menge deckt Fixkosten nicht",
        message: `Bei ${launchQty} Einheiten erreichst du nur ${Math.round(totalProfit)}€ Deckungsbeitrag — das reicht nicht für dein Marketing-Budget.`,
        category: "launch",
      });
      scoreDeductions += 15;
    }
  }

  // ── MOQ vs Budget ──────────────────────────────────────────
  const moq = parseInt((production?.moq_expectation || "0").replace(/[^0-9]/g, "")) || 0;
  if (moq > 0 && unitCost > 0 && budgetNum > 0) {
    const moqCost = moq * unitCost;
    if (moqCost > budgetNum * 0.6) {
      warnings.push({
        id: "moq-capital-lock",
        severity: "warning",
        title: "MOQ bindet zu viel Kapital",
        message: `Die Mindestbestellmenge kostet ca. ${Math.round(moqCost)}€ — das sind mehr als 60% deines Budgets.`,
        category: "production",
      });
      scoreDeductions += 10;
    }
  }

  // ── Production Risk ────────────────────────────────────────
  if (production?.production_region === "asia" && !production?.supplier_questions) {
    warnings.push({
      id: "asia-no-questions",
      severity: "info",
      title: "Lieferantenfragen fehlen",
      message: "Bei Produktion in Asien solltest du strukturierte Fragen an Lieferanten vorbereiten.",
      category: "production",
    });
    scoreDeductions += 5;
  }

  // ── Missing Critical Steps (only warn if user has started the relevant area) ─
  if (hasProfile && !profile?.product_description) {
    warnings.push({
      id: "no-product",
      severity: "critical",
      title: "Produkt nicht definiert",
      message: "Ohne Produktbeschreibung kann keine sinnvolle Planung stattfinden.",
      category: "foundation",
    });
    scoreDeductions += 20;
  }

  if (hasProfile && !profile?.differentiation) {
    warnings.push({
      id: "no-differentiation",
      severity: "critical",
      title: "Positionierung unklar",
      message: "Ohne klare Differenzierung steigt das Risiko, im Markt unterzugehen.",
      category: "positioning",
    });
    scoreDeductions += 15;
  }

  if (hasIdentity && !identity?.brand_name) {
    warnings.push({
      id: "no-brand-name",
      severity: "warning",
      title: "Kein Markenname",
      message: "Ein Markenname ist essentiell für Marketing und Wiedererkennung.",
      category: "brand",
    });
    scoreDeductions += 10;
  }

  if (hasProfile && !profile?.target_audience) {
    warnings.push({
      id: "no-audience",
      severity: "warning",
      title: "Zielgruppe nicht definiert",
      message: "Ohne klare Zielgruppe wird Marketing ineffizient und teuer.",
      category: "foundation",
    });
    scoreDeductions += 10;
  }

  if (hasFinancial && unitCost === 0 && !financial?.production_cost) {
    scoreDeductions += 10;
  }

  // ── Insights Generation ────────────────────────────────────
  // Risks
  if (margin > 0 && margin < 40) {
    insights.push({
      type: "risk",
      title: "Margendruck",
      description: `Bei ${Math.round(margin)}% Marge bleibt wenig Raum für Rabatte, Retouren oder Preisanpassungen.`,
    });
  }

  if (!profile?.differentiation) {
    insights.push({
      type: "risk",
      title: "Fehlende Differenzierung",
      description: "Ohne klares Alleinstellungsmerkmal riskierst du einen reinen Preiswettbewerb.",
    });
  }

  if (launchQty > 500 && budgetNum < 5000) {
    insights.push({
      type: "risk",
      title: "Überambitionierter Launch",
      description: "Hohe Launch-Menge bei geringem Budget kann zu Cashflow-Problemen führen.",
    });
  }

  // Add generic risk if we have less than 3
  if (insights.filter((i) => i.type === "risk").length < 3) {
    if (!launch?.sales_channel) {
      insights.push({ type: "risk", title: "Vertriebskanal offen", description: "Ohne gewählten Vertriebskanal ist die Go-to-Market-Strategie unvollständig." });
    }
    if (!compliance?.label_checklist) {
      insights.push({ type: "risk", title: "Compliance ungeprüft", description: "Label- und Verpackungsanforderungen könnten zu Verzögerungen beim Launch führen." });
    }
  }

  // Optimizations
  if (margin > 0 && margin < 60) {
    insights.push({
      type: "optimization",
      title: "Preisoptimierung prüfen",
      description: `Teste einen höheren Preis. Dein Preissegment "${profile?.price_level || "k.A."}" könnte eine Preiserhöhung um 10-20% tolerieren.`,
    });
  }

  if (marketingBudget > 0 && !launch?.sales_channel) {
    insights.push({
      type: "optimization",
      title: "Kanal vor Budget",
      description: "Wähle zuerst den Vertriebskanal — dann allokiere das Marketing-Budget kanalspezifisch.",
    });
  }

  if (budgetNum > 0 && budgetNum < 10000) {
    insights.push({
      type: "optimization",
      title: "Lean Launch empfohlen",
      description: "Bei deinem Budget empfehlen wir einen fokussierten Launch auf einem einzigen Kanal.",
    });
  }

  // Strategy
  const strategyReco = generateStrategy(data, margin, budgetNum);
  insights.push({
    type: "strategy",
    title: "Strategische Empfehlung",
    description: strategyReco,
  });

  // ── Score Calculation ──────────────────────────────────────
  const rawScore = Math.max(0, Math.min(100, 100 - scoreDeductions));
  const color = rawScore >= 70 ? "green" : rawScore >= 40 ? "yellow" : "red";
  const label = rawScore >= 70 ? "Gesund" : rawScore >= 40 ? "Verbesserungsbedarf" : "Kritisch";

  const criticalWarnings = warnings.filter((w) => w.severity === "critical");
  const biggestRisk = criticalWarnings.length > 0
    ? criticalWarnings[0].title
    : warnings.length > 0
    ? warnings[0].title
    : "Keine kritischen Risiken erkannt";

  const nextAction = getNextAction(data, warnings);

  return {
    score: rawScore,
    color,
    label,
    explanation: getExplanation(rawScore, warnings.length),
    biggestRisk,
    nextAction,
    warnings,
    insights,
  };
}

function generateStrategy(data: BrandData, margin: number, budget: number): string {
  if (!data.profile?.product_description) {
    return "Definiere zuerst dein Produkt und deine Zielgruppe — ohne diese Basis kann keine sinnvolle Strategie entwickelt werden.";
  }
  if (margin < 30) {
    return "Fokussiere dich auf Kostenoptimierung: verhandle Produktionspreise, reduziere Verpackungskosten, oder repositioniere in ein höheres Preissegment.";
  }
  if (budget < 3000) {
    return "Starte mit einem Minimal Viable Brand: ein Produkt, ein Kanal, organisches Marketing. Nutze den Cashflow für Skalierung.";
  }
  if (margin > 60) {
    return "Deine Margen sind stark. Investiere aggressiv in Markenaufbau und nutze die Marge für Premium-Positionierung.";
  }
  return "Balanciere zwischen Markenaufbau und Performance-Marketing. Teste mit kleinen Budgets, skaliere was funktioniert.";
}

function getExplanation(score: number, warningCount: number): string {
  if (score >= 80) return "Deine Marke ist gut aufgestellt. Wenige Optimierungen nötig.";
  if (score >= 60) return `${warningCount} Punkte erfordern Aufmerksamkeit, aber die Basis steht.`;
  if (score >= 40) return "Mehrere Bereiche brauchen Überarbeitung bevor du launchen solltest.";
  return "Kritische Lücken in deiner Planung. Fülle zuerst die fehlenden Grundlagen aus.";
}

function getNextAction(data: BrandData, warnings: BrandWarning[]): string {
  if (!data.profile?.product_description) return "Beschreibe dein Produkt in Step 1.";
  if (!data.profile?.differentiation) return "Starte die KI-Analyse für deine Positionierung.";
  if (!data.identity?.brand_name) return "Wähle einen Markennamen in Step 2.";
  if (!data.financial?.production_cost) return "Gib deine Kosten im Business-Kalkulator ein.";
  const critical = warnings.find((w) => w.severity === "critical");
  if (critical) return `Behebe: ${critical.title}`;
  if (!data.launch?.sales_channel) return "Wähle deinen Vertriebskanal in Step 6.";
  return "Prüfe deine Compliance-Checkliste in Step 5.";
}

// ─── Price Range Suggestion ──────────────────────────────────────

export function suggestPriceRange(unitCost: number, priceLevel?: string | null): { min: number; max: number; sweet: number } {
  const multipliers: Record<string, { min: number; max: number; sweet: number }> = {
    budget: { min: 1.8, max: 2.5, sweet: 2.0 },
    mid: { min: 2.5, max: 3.5, sweet: 2.8 },
    premium: { min: 3.5, max: 5.0, sweet: 4.0 },
    luxury: { min: 5.0, max: 10.0, sweet: 6.0 },
  };

  const m = multipliers[priceLevel || "mid"] || multipliers.mid;

  return {
    min: Math.round(unitCost * m.min * 100) / 100,
    max: Math.round(unitCost * m.max * 100) / 100,
    sweet: Math.round(unitCost * m.sweet * 100) / 100,
  };
}

// ─── Profit Sensitivity ─────────────────────────────────────────

export interface SensitivityPoint {
  price: number;
  margin: number;
  profitAt100: number;
  profitAt500: number;
  breakEven: number;
}

export function calculateSensitivity(unitCost: number, marketingBudget: number, steps: number = 7): SensitivityPoint[] {
  if (unitCost <= 0) return [];

  const basePrice = unitCost * 2;
  const priceStep = unitCost * 0.5;

  return Array.from({ length: steps }, (_, i) => {
    const price = Math.round((basePrice + (i - 3) * priceStep) * 100) / 100;
    if (price <= unitCost) return null;
    const m = ((price - unitCost) / price) * 100;
    const profitPerUnit = price - unitCost;
    return {
      price,
      margin: Math.round(m),
      profitAt100: Math.round(100 * profitPerUnit - marketingBudget),
      profitAt500: Math.round(500 * profitPerUnit - marketingBudget),
      breakEven: profitPerUnit > 0 ? Math.ceil(marketingBudget / profitPerUnit) : 9999,
    };
  }).filter(Boolean) as SensitivityPoint[];
}
