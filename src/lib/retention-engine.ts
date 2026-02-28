// ─── Behavioral Retention Engine ────────────────────────────────
// Momentum scoring, risk alerts, growth paths, upgrade triggers

export type Archetype = "conservative" | "aggressive" | "perfectionist" | "recovery" | null;

// ─── Momentum Score ─────────────────────────────────────────────

export interface MomentumInput {
  weeklyReviewStreak: number;
  tasksCompletedThisWeek: number;
  totalTasks: number;
  marginTrend: number; // positive = improving
  riskReduction: number; // 0-100, how much risk was reduced
  kpiTrackingWeeks: number;
}

export function calculateMomentumScore(input: MomentumInput): {
  score: number;
  label: string;
  trend: "improving" | "stable" | "declining";
} {
  let score = 0;

  // Streak consistency (max 30)
  score += Math.min(input.weeklyReviewStreak * 5, 30);

  // Task completion rate (max 25)
  const completionRate = input.totalTasks > 0 ? input.tasksCompletedThisWeek / Math.max(input.totalTasks, 1) : 0;
  score += Math.round(completionRate * 25);

  // Margin improvement (max 20)
  if (input.marginTrend > 0) score += Math.min(input.marginTrend * 4, 20);
  else if (input.marginTrend < 0) score += Math.max(input.marginTrend * 2, -10);

  // Risk reduction (max 15)
  score += Math.round((input.riskReduction / 100) * 15);

  // KPI tracking consistency (max 10)
  score += Math.min(input.kpiTrackingWeeks * 2, 10);

  score = Math.max(0, Math.min(100, Math.round(score)));

  const trend = score >= 60 ? "improving" : score >= 35 ? "stable" : "declining";
  const label = trend === "improving" ? "Momentum steigt" : trend === "stable" ? "Momentum stabil" : "Momentum sinkt";

  return { score, label, trend };
}

// ─── Risk Alerts ────────────────────────────────────────────────

export interface RiskAlertInput {
  marginHistory: number[]; // last N weeks
  runwayMonths: number;
  runwayThreshold: number;
  inventoryExposure: number; // 0-100
  previousInventoryExposure: number;
}

export interface RiskAlert {
  id: string;
  type: "margin_decline" | "runway_low" | "inventory_exposure";
  title: string;
  message: string;
  severity: "warning" | "critical";
}

export function generateRiskAlerts(input: RiskAlertInput): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Margin declining 2+ weeks
  if (input.marginHistory.length >= 3) {
    const last3 = input.marginHistory.slice(-3);
    if (last3[2] < last3[1] && last3[1] < last3[0]) {
      alerts.push({
        id: "margin_decline",
        type: "margin_decline",
        title: "Margin-Rückgang erkannt",
        message: `Deine Marge ist seit ${input.marginHistory.length >= 3 ? "3" : "2"} Wochen rückläufig. Prüfe deine Kostenstruktur.`,
        severity: last3[2] < 20 ? "critical" : "warning",
      });
    }
  }

  // Runway below threshold
  if (input.runwayMonths < input.runwayThreshold) {
    alerts.push({
      id: "runway_low",
      type: "runway_low",
      title: "Runway unter Schwellenwert",
      message: `Dein Cash Runway liegt bei ${input.runwayMonths.toFixed(1)} Monaten. Empfohlen: mindestens ${input.runwayThreshold} Monate.`,
      severity: input.runwayMonths < 2 ? "critical" : "warning",
    });
  }

  // Inventory exposure increasing
  if (input.inventoryExposure > input.previousInventoryExposure + 10) {
    alerts.push({
      id: "inventory_exposure",
      type: "inventory_exposure",
      title: "Erhöhte Kapitalbindung erkannt",
      message: `Deine Kapitalbindung im Lager ist um ${Math.round(input.inventoryExposure - input.previousInventoryExposure)}% gestiegen.`,
      severity: input.inventoryExposure > 70 ? "critical" : "warning",
    });
  }

  return alerts;
}

// ─── Growth Path by Archetype ───────────────────────────────────

export interface GrowthPath {
  focus: string;
  priority: string;
  dashboardOrder: string[];
  advice: string;
}

export function getGrowthPath(archetype: Archetype): GrowthPath {
  switch (archetype) {
    case "conservative":
      return {
        focus: "Kapitalstabilität",
        priority: "Risikominimierung vor Wachstum",
        dashboardOrder: ["health", "reality_check", "cashflow", "budget", "steps"],
        advice: "Sichere deine Liquidität ab, bevor du skalierst. Halte mindestens 4 Monate Runway.",
      };
    case "aggressive":
      return {
        focus: "Skalierungschancen",
        priority: "Schneller Launch, iteratives Verbessern",
        dashboardOrder: ["steps", "health", "supplier", "budget", "reality_check"],
        advice: "Fokussiere auf schnelle Marktvalidierung. Teste klein, skaliere schnell.",
      };
    case "perfectionist":
      return {
        focus: "Markenpositionierung",
        priority: "Qualität und Differenzierung",
        dashboardOrder: ["health", "steps", "unboxing", "compliance", "budget"],
        advice: "Deine Marke muss nicht perfekt sein, um zu starten. Launch > Perfektion.",
      };
    case "recovery":
      return {
        focus: "Burn-Rate-Reduktion",
        priority: "Kostensenkung und Stabilisierung",
        dashboardOrder: ["cashflow", "health", "reality_check", "budget", "steps"],
        advice: "Reduziere sofort unnötige Kosten. Fokussiere auf profitable Einheiten.",
      };
    default:
      return {
        focus: "Balanced Growth",
        priority: "Schritt-für-Schritt-Aufbau",
        dashboardOrder: ["health", "steps", "budget", "reality_check", "cashflow"],
        advice: "Folge dem 7-Schritte-Plan und lass dich von den Daten leiten.",
      };
  }
}

// ─── Upgrade Triggers ───────────────────────────────────────────

export interface UpgradeTrigger {
  id: string;
  message: string;
  targetPlan: "builder" | "pro" | "execution";
  condition: string;
}

export function getUpgradeTriggers(input: {
  kpiTrackingWeeks: number;
  manualRiskChecks: number;
  weeklyReviewStreak: number;
  plan: string;
}): UpgradeTrigger[] {
  const triggers: UpgradeTrigger[] = [];

  if (input.plan === "free" || input.plan === "builder") {
    if (input.kpiTrackingWeeks >= 3) {
      triggers.push({
        id: "auto_monitoring",
        message: "Execution OS schaltet automatisiertes Monitoring frei.",
        targetPlan: "execution",
        condition: `${input.kpiTrackingWeeks} Wochen manuelles KPI-Tracking`,
      });
    }

    if (input.manualRiskChecks >= 3) {
      triggers.push({
        id: "auto_risk",
        message: "Pro automatisiert diese Analyse.",
        targetPlan: "pro",
        condition: `${input.manualRiskChecks}x manuelle Risikoanalyse`,
      });
    }
  }

  if (input.plan !== "execution" && input.weeklyReviewStreak >= 4) {
    triggers.push({
      id: "discipline_upgrade",
      message: "Execution OS belohnt Disziplin mit CEO-Level Insights.",
      targetPlan: "execution",
      condition: `${input.weeklyReviewStreak} Wochen Review-Streak`,
    });
  }

  return triggers;
}

// ─── Badges ─────────────────────────────────────────────────────

export interface RetentionBadge {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
  description: string;
}

export function getRetentionBadges(streakWeeks: number, isExecution: boolean): RetentionBadge[] {
  const badges: RetentionBadge[] = [
    {
      id: "streak_3",
      label: "3-Wochen Tracker",
      emoji: "🔥",
      earned: streakWeeks >= 3,
      description: "3 Wochen in Folge CEO Review abgeschlossen.",
    },
    {
      id: "streak_6",
      label: "6-Wochen Disziplin",
      emoji: "💎",
      earned: streakWeeks >= 6,
      description: "6 Wochen in Folge CEO Review abgeschlossen.",
    },
  ];

  if (isExecution) {
    let level = "Starter";
    if (streakWeeks >= 12) level = "Master";
    else if (streakWeeks >= 8) level = "Advanced";
    else if (streakWeeks >= 4) level = "Committed";

    badges.push({
      id: "founder_discipline",
      label: `Founder Discipline: ${level}`,
      emoji: "🏆",
      earned: streakWeeks >= 4,
      description: `Aktuelles Disziplin-Level basierend auf ${streakWeeks} Wochen Streak.`,
    });
  }

  return badges;
}
