import type { BrandHealthResult } from "@/lib/brand-health-engine";

export interface SmartTask {
  id: string;
  label: string;
  reason: string;
  triggeredByRisk: boolean;
  riskId?: string;
}

export interface SmartWeek {
  weekKey: string;
  titleKey: string;
  staticTasks: string[];
  dynamicTasks: SmartTask[];
}

/**
 * Generates personalised weekly tasks based on Brand Health Engine warnings/insights.
 * Only used for Builder plan.
 */
export function generateSmartRoadmap(health: BrandHealthResult): SmartWeek[] {
  const warnings = health.warnings;
  const insights = health.insights;

  const hasRisk = (id: string) => warnings.some((w) => w.id === id);
  const hasCategory = (cat: string) => warnings.some((w) => w.category === cat);

  // ── Week 1 – Preparation (fix foundations before launch) ────────
  const w1Dynamic: SmartTask[] = [];

  if (hasRisk("low-margin") || hasRisk("moderate-margin")) {
    w1Dynamic.push({
      id: "fix-margin",
      label: "Preisstruktur überarbeiten & Marge optimieren",
      reason: "Deine aktuelle Marge gefährdet die Nachhaltigkeit deines Marketings. Ohne Anpassung wird jeder verkaufte Artikel weniger profitabel als nötig.",
      triggeredByRisk: true,
      riskId: "low-margin",
    });
  }

  if (hasRisk("no-differentiation")) {
    w1Dynamic.push({
      id: "fix-differentiation",
      label: "Alleinstellungsmerkmal klar definieren",
      reason: "Ohne klare Differenzierung konkurrierst du nur über den Preis — das ist langfristig nicht tragfähig.",
      triggeredByRisk: true,
      riskId: "no-differentiation",
    });
  }

  if (hasRisk("no-audience")) {
    w1Dynamic.push({
      id: "fix-audience",
      label: "Zielgruppen-Profil schärfen",
      reason: "Unpräzises Targeting führt zu hohen Streuverlusten und ineffizientem Ad-Spend.",
      triggeredByRisk: true,
      riskId: "no-audience",
    });
  }

  if (hasRisk("budget-too-low")) {
    w1Dynamic.push({
      id: "lean-plan",
      label: "Lean-Launch-Plan erstellen (1 Kanal, organisch)",
      reason: "Dein Budget ist knapp — ein fokussierter Launch auf einem einzigen Kanal maximiert deine Erfolgschancen.",
      triggeredByRisk: true,
      riskId: "budget-too-low",
    });
  }

  // ── Week 2 – Pre-Launch ────────────────────────────────────────
  const w2Dynamic: SmartTask[] = [];

  if (hasRisk("moq-capital-lock")) {
    w2Dynamic.push({
      id: "moq-negotiate",
      label: "MOQ mit Lieferant neu verhandeln oder Pre-Orders nutzen",
      reason: "Die aktuelle Mindestbestellmenge bindet zu viel Kapital und reduziert deine finanzielle Flexibilität.",
      triggeredByRisk: true,
      riskId: "moq-capital-lock",
    });
  }

  if (hasRisk("budget-overallocated")) {
    w2Dynamic.push({
      id: "budget-rebalance",
      label: "Budget-Allokation überprüfen (Marketing vs. Reserve)",
      reason: "Mehr als 70% deines Budgets fließt ins Marketing — du brauchst einen Puffer für unvorhergesehene Kosten.",
      triggeredByRisk: true,
      riskId: "budget-overallocated",
    });
  }

  if (insights.some((i) => i.title === "Preisoptimierung prüfen")) {
    w2Dynamic.push({
      id: "test-pricing",
      label: "A/B-Test für Preispunkte vorbereiten",
      reason: "Dein Preissegment könnte eine 10-20% Erhöhung tolerieren — ein Test vor dem Launch gibt Sicherheit.",
      triggeredByRisk: false,
    });
  }

  // ── Week 3 – Launch ────────────────────────────────────────────
  const w3Dynamic: SmartTask[] = [];

  if (hasRisk("launch-qty-unprofitable")) {
    w3Dynamic.push({
      id: "adjust-launch-qty",
      label: "Launch-Menge anpassen oder Fixkosten senken",
      reason: "Bei der aktuellen Menge deckt dein Deckungsbeitrag nicht die Fixkosten — du startest mit Verlust.",
      triggeredByRisk: true,
      riskId: "launch-qty-unprofitable",
    });
  }

  if (hasCategory("production")) {
    w3Dynamic.push({
      id: "production-risk-check",
      label: "Produktionsrisiken final prüfen (Lieferkette, QS)",
      reason: "Offene Produktionsrisiken können deinen Launch verzögern oder die Produktqualität beeinträchtigen.",
      triggeredByRisk: true,
    });
  }

  if (insights.some((i) => i.title === "Lean Launch empfohlen")) {
    w3Dynamic.push({
      id: "focus-channel",
      label: "Launch auf einen Primärkanal fokussieren",
      reason: "Bei deinem Budget empfehlen wir maximale Fokussierung statt Streuung über mehrere Kanäle.",
      triggeredByRisk: false,
    });
  }

  // ── Week 4 – Post-Launch ───────────────────────────────────────
  const w4Dynamic: SmartTask[] = [];

  if (hasRisk("low-margin") || hasRisk("moderate-margin")) {
    w4Dynamic.push({
      id: "margin-review",
      label: "Margen-Review nach ersten Verkäufen durchführen",
      reason: "Prüfe ob reale Kosten (Retouren, Rabatte) deine kalkulierte Marge halten oder weiter drücken.",
      triggeredByRisk: true,
      riskId: "low-margin",
    });
  }

  if (hasRisk("no-differentiation")) {
    w4Dynamic.push({
      id: "positioning-feedback",
      label: "Kundenfeedback zur Positionierung auswerten",
      reason: "Ohne klares USP solltest du früh validieren, ob Kunden deine Marke als einzigartig wahrnehmen.",
      triggeredByRisk: true,
      riskId: "no-differentiation",
    });
  }

  w4Dynamic.push({
    id: "health-recheck",
    label: "Brand Health Score nach Launch neu bewerten",
    reason: "Dein Health Score verändert sich mit echten Daten — ein Re-Check zeigt dir die nächsten Prioritäten.",
    triggeredByRisk: false,
  });

  // ── Assemble ───────────────────────────────────────────────────
  const staticWeeks = [
    {
      weekKey: "w1", titleKey: "w1t",
      staticTasks: [
        "Social-Media-Profile erstellen",
        "Content-Kalender planen",
        "Teaser-Content produzieren",
        "E-Mail-Liste aufbauen",
        "Influencer recherchieren",
      ],
    },
    {
      weekKey: "w2", titleKey: "w2t",
      staticTasks: [
        "Landing Page live schalten",
        "Erste Teaser posten",
        "Warteliste bewerben",
        "Pressemitteilung vorbereiten",
        "Produktfotos finalisieren",
      ],
    },
    {
      weekKey: "w3", titleKey: "w3t",
      staticTasks: [
        "Shop live schalten",
        "Launch-Announcement posten",
        "E-Mail an Warteliste senden",
        "Erste Ads schalten",
        "PR-Outreach starten",
      ],
    },
    {
      weekKey: "w4", titleKey: "w4t",
      staticTasks: [
        "Kundenfeedback sammeln",
        "Ads optimieren",
        "Retargeting einrichten",
        "Review-Kampagne starten",
        "Erste Analyse & Learnings",
      ],
    },
  ];

  const dynamicPerWeek = [w1Dynamic, w2Dynamic, w3Dynamic, w4Dynamic];

  return staticWeeks.map((w, i) => ({
    ...w,
    dynamicTasks: dynamicPerWeek[i],
  }));
}
