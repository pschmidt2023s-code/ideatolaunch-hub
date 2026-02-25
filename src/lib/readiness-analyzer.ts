// ─── Readiness Analysis Layer ────────────────────────────────────
// Evaluates whether a user is ready to move forward.
// Deterministic, rule-based. No AI.

import type { BrandHealthResult } from "@/lib/brand-health-engine";

export interface BlockingRisk {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  description: string;
}

export interface ReadinessResult {
  readinessScore: number;          // 0-100
  blockingRisks: BlockingRisk[];
  recommendedNextAction: string;
  executionConfidence: "not_ready" | "risky" | "cautious" | "ready" | "strong";
}

interface ReadinessInput {
  health: BrandHealthResult | null;
  hasProfile: boolean;
  hasIdentity: boolean;
  hasFinancial: boolean;
  hasProduction: boolean;
  hasCompliance: boolean;
  hasLaunch: boolean;
  margin: number;
  budget: number;
  unitCost: number;
  launchQuantity: number;
  moq: number;
}

export function analyzeReadiness(input: ReadinessInput): ReadinessResult {
  const blockingRisks: BlockingRisk[] = [];
  let score = 100;

  // ── Completeness checks ─────────────────────────────────
  if (!input.hasProfile) {
    blockingRisks.push({
      id: "no_profile",
      title: "Produkt nicht definiert",
      severity: "critical",
      description: "Ohne Produktdefinition und Zielgruppe kann keine Marke gestartet werden.",
    });
    score -= 25;
  }

  if (!input.hasIdentity) {
    blockingRisks.push({
      id: "no_identity",
      title: "Markenidentität fehlt",
      severity: "high",
      description: "Kein Markenname oder visuelle Identität definiert.",
    });
    score -= 15;
  }

  if (!input.hasFinancial) {
    blockingRisks.push({
      id: "no_financials",
      title: "Keine Kalkulation",
      severity: "critical",
      description: "Ohne Kostenstruktur und Preiskalkulation ist ein profitabler Launch unmöglich.",
    });
    score -= 25;
  }

  // ── Margin strength ─────────────────────────────────────
  if (input.hasFinancial && input.margin > 0) {
    if (input.margin < 20) {
      blockingRisks.push({
        id: "margin_critical",
        title: "Marge kritisch niedrig",
        severity: "critical",
        description: "Unter 20% Marge ist kein nachhaltiges Geschäftsmodell möglich.",
      });
      score -= 20;
    } else if (input.margin < 30) {
      blockingRisks.push({
        id: "margin_low",
        title: "Marge zu niedrig für Marketing",
        severity: "high",
        description: "Unter 30% Marge kannst du kein bezahltes Marketing nachhaltig finanzieren.",
      });
      score -= 10;
    }
  }

  // ── Capital exposure ────────────────────────────────────
  if (input.moq > 0 && input.unitCost > 0 && input.budget > 0) {
    const moqCost = input.moq * input.unitCost;
    if (moqCost > input.budget * 0.7) {
      blockingRisks.push({
        id: "capital_overexposed",
        title: "Kapitalbindung zu hoch",
        severity: "high",
        description: `MOQ bindet ${Math.round((moqCost / input.budget) * 100)}% deines Budgets. Zu wenig Spielraum für Marketing und Unvorhergesehenes.`,
      });
      score -= 15;
    }
  }

  // ── Launch size realism ─────────────────────────────────
  if (input.launchQuantity > 0 && input.budget > 0) {
    const totalLaunchCost = input.launchQuantity * input.unitCost;
    if (totalLaunchCost > input.budget * 0.8) {
      blockingRisks.push({
        id: "launch_overambitious",
        title: "Launch-Menge überambitioniert",
        severity: "medium",
        description: "Deine Launch-Menge verbraucht fast dein gesamtes Budget. Kein Spielraum für Marketing.",
      });
      score -= 10;
    }
  }

  // ── Health-engine warnings ──────────────────────────────
  if (input.health) {
    const criticalWarnings = input.health.warnings.filter(w => w.severity === "critical");
    score -= criticalWarnings.length * 5;
  }

  // ── Missing steps penalty ───────────────────────────────
  if (!input.hasProduction) score -= 5;
  if (!input.hasCompliance) score -= 5;
  if (!input.hasLaunch) score -= 5;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // ── Confidence level ────────────────────────────────────
  const hasCritical = blockingRisks.some(r => r.severity === "critical");
  const hasHigh = blockingRisks.some(r => r.severity === "high");

  let executionConfidence: ReadinessResult["executionConfidence"];
  if (score < 30 || hasCritical) executionConfidence = "not_ready";
  else if (score < 50 || hasHigh) executionConfidence = "risky";
  else if (score < 70) executionConfidence = "cautious";
  else if (score < 85) executionConfidence = "ready";
  else executionConfidence = "strong";

  // ── Next action ─────────────────────────────────────────
  let recommendedNextAction: string;
  if (!input.hasProfile) recommendedNextAction = "Definiere dein Produkt und deine Zielgruppe in Schritt 1.";
  else if (!input.hasFinancial) recommendedNextAction = "Erstelle eine Kostenkalkulation in Schritt 3.";
  else if (hasCritical) recommendedNextAction = `Behebe kritisches Risiko: ${blockingRisks.find(r => r.severity === "critical")!.title}`;
  else if (!input.hasIdentity) recommendedNextAction = "Lege deinen Markennamen in Schritt 2 fest.";
  else if (!input.hasLaunch) recommendedNextAction = "Wähle deinen Vertriebskanal in Schritt 6.";
  else recommendedNextAction = "Du bist auf einem guten Weg. Prüfe verbleibende Warnungen.";

  return {
    readinessScore: score,
    blockingRisks,
    recommendedNextAction,
    executionConfidence,
  };
}
