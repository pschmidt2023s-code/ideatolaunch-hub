// ─── Guided Founder Mode (PRO — FEATURE FLAG) ──────────────────
// Rule-based contextual guidance moments.
// Uses readiness analysis + health engine + supplier intelligence.
// NO conversational AI. Structured mentor layer.

import type { ReadinessResult } from "@/lib/readiness-analyzer";
import type { BrandHealthResult } from "@/lib/brand-health-engine";

export interface GuidedMoment {
  id: string;
  trigger: string;
  step: number | null;          // null = global
  message: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

interface GuidedMomentInput {
  readiness: ReadinessResult;
  health: BrandHealthResult | null;
  currentStep: number;
  completedSteps: number[];    // step numbers the user has data for
}

export function generateGuidedMoments(input: GuidedMomentInput): GuidedMoment[] {
  const moments: GuidedMoment[] = [];
  const { readiness, health, currentStep, completedSteps } = input;

  // ── User stuck on step ──────────────────────────────────
  if (readiness.executionConfidence === "not_ready" && completedSteps.length < 2) {
    moments.push({
      id: "stuck_early",
      trigger: "user_stuck_on_step",
      step: currentStep,
      message: "Du bist noch am Anfang — das ist völlig normal. Fokussiere dich auf eine einzige Sache: Beschreibe dein Produkt und für wen es ist.",
      suggestion: "Starte mit Schritt 1 und beschreibe dein Produkt in 2-3 Sätzen.",
      priority: "high",
    });
  }

  // ── Margin risk detected ────────────────────────────────
  if (health?.warnings.some(w => w.id === "low-margin")) {
    moments.push({
      id: "margin_risk_guidance",
      trigger: "risk_detected",
      step: 3,
      message: "Deine Marge ist kritisch niedrig. Bevor du weitermachst, prüfe: Kannst du den Preis erhöhen? Oder die Produktionskosten senken?",
      suggestion: "Verhandle mit deinem Lieferanten oder repositioniere in ein höheres Preissegment.",
      priority: "high",
    });
  }

  // ── No differentiation ─────────────────────────────────
  if (health?.warnings.some(w => w.id === "no-differentiation")) {
    moments.push({
      id: "differentiation_missing",
      trigger: "missing_critical_data",
      step: 1,
      message: "Ohne klare Differenzierung wirst du über den Preis konkurrieren müssen — und das ist ein Rennen nach unten.",
      suggestion: "Definiere einen einzigen Grund, warum jemand DEIN Produkt kaufen sollte.",
      priority: "high",
    });
  }

  // ── Budget too thin ─────────────────────────────────────
  if (readiness.blockingRisks.some(r => r.id === "capital_overexposed")) {
    moments.push({
      id: "budget_thin",
      trigger: "risk_detected",
      step: 4,
      message: "Dein Budget wird durch die Produktion fast vollständig gebunden. Ohne Marketing-Reserven wird der Launch schwierig.",
      suggestion: "Reduziere die Erstbestellmenge oder suche einen Lieferanten mit niedrigerem MOQ.",
      priority: "high",
    });
  }

  // ── Skipped steps ───────────────────────────────────────
  if (currentStep >= 4 && !completedSteps.includes(1)) {
    moments.push({
      id: "skipped_foundation",
      trigger: "skipped_step",
      step: null,
      message: "Du bist schon bei der Produktion, aber dein Fundament (Produkt & Zielgruppe) fehlt noch. Ohne Basis baust du auf Sand.",
      suggestion: "Gehe zurück zu Schritt 1 und definiere deine Grundlagen.",
      priority: "medium",
    });
  }

  if (currentStep >= 6 && !completedSteps.includes(3)) {
    moments.push({
      id: "skipped_calculator",
      trigger: "skipped_step",
      step: null,
      message: "Du planst den Vertrieb, aber hast noch keine Kalkulation. Ohne zu wissen, ob dein Preis tragfähig ist, riskierst du Verluste.",
      suggestion: "Fülle den Business-Kalkulator in Schritt 3 aus.",
      priority: "medium",
    });
  }

  // ── Ready to launch ─────────────────────────────────────
  if (readiness.executionConfidence === "strong" || readiness.executionConfidence === "ready") {
    moments.push({
      id: "ready_to_go",
      trigger: "readiness_achieved",
      step: 7,
      message: "Deine Marke ist gut vorbereitet. Jetzt ist der wichtigste Schritt: Starten. Perfektionismus ist der Feind des Fortschritts.",
      suggestion: "Starte den 30-Tage Launch-Plan und setze die erste Woche um.",
      priority: "low",
    });
  }

  // ── Launch quantity mismatch ────────────────────────────
  if (readiness.blockingRisks.some(r => r.id === "launch_overambitious")) {
    moments.push({
      id: "launch_qty_warning",
      trigger: "risk_detected",
      step: 6,
      message: "Deine geplante Launch-Menge ist ambitioniert für dein Budget. Starte kleiner und validiere die Nachfrage zuerst.",
      suggestion: "Reduziere die Launch-Menge auf ein Level, das 50% deines Budgets nicht übersteigt.",
      priority: "medium",
    });
  }

  return moments.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
}
