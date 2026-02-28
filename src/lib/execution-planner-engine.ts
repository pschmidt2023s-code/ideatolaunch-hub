// ─── Execution Planner — Behavioral Engine ──────────────────────
// KPI-reactive task generation, streak tracking, CEO review.

export interface KPIState {
  margin: number;
  runway: number;
  conversionRate: number;
  returnRate: number;
  weeklyStreak: number;
  overdueTasks: number;
}

export interface GeneratedTask {
  title: { de: string; en: string };
  priority: "critical" | "high" | "medium";
  deadlineDays: number;
  trigger: string;
}

export interface AccountabilityScore {
  score: number; // 0-100
  level: "excellent" | "good" | "needs_work" | "behind";
  streak: number;
}

export interface CEOReview {
  improved: { de: string; en: string }[];
  worsened: { de: string; en: string }[];
  nextActions: { de: string; en: string }[];
}

export function generateReactiveTasks(kpi: KPIState): GeneratedTask[] {
  const tasks: GeneratedTask[] = [];

  if (kpi.margin < 35) {
    tasks.push({
      title: {
        de: "Lieferantenpreise nachverhandeln",
        en: "Renegotiate supplier pricing",
      },
      priority: kpi.margin < 25 ? "critical" : "high",
      deadlineDays: 7,
      trigger: "margin_low",
    });
  }

  if (kpi.runway < 3) {
    tasks.push({
      title: {
        de: "Burn reduzieren oder Preis erhöhen",
        en: "Reduce burn or raise price",
      },
      priority: "critical",
      deadlineDays: 3,
      trigger: "runway_critical",
    });
  }

  if (kpi.conversionRate < 2) {
    tasks.push({
      title: {
        de: "Produktlisting optimieren",
        en: "Optimize product listing",
      },
      priority: "high",
      deadlineDays: 7,
      trigger: "conversion_low",
    });
  }

  if (kpi.returnRate > 12) {
    tasks.push({
      title: {
        de: "Qualitätskontrolle verschärfen",
        en: "Tighten quality control",
      },
      priority: "high",
      deadlineDays: 14,
      trigger: "returns_high",
    });
  }

  if (kpi.overdueTasks > 3) {
    tasks.push({
      title: {
        de: "Überfällige Aufgaben priorisieren",
        en: "Prioritize overdue tasks",
      },
      priority: "high",
      deadlineDays: 2,
      trigger: "overdue_tasks",
    });
  }

  return tasks;
}

export function computeAccountability(
  completedThisWeek: number,
  totalThisWeek: number,
  streak: number,
  overdue: number,
): AccountabilityScore {
  let score = 0;

  // Completion rate (max 50)
  const rate = totalThisWeek > 0 ? completedThisWeek / totalThisWeek : 0;
  score += Math.round(rate * 50);

  // Streak bonus (max 25)
  score += Math.min(25, streak * 5);

  // Overdue penalty
  score -= Math.min(25, overdue * 5);

  score = Math.max(0, Math.min(100, score));

  const level: AccountabilityScore["level"] =
    score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "needs_work" : "behind";

  return { score, level, streak };
}

export function generateCEOReview(
  currentKPI: KPIState,
  previousKPI: KPIState | null,
): CEOReview {
  const improved: CEOReview["improved"] = [];
  const worsened: CEOReview["worsened"] = [];
  const nextActions: CEOReview["nextActions"] = [];

  if (!previousKPI) {
    nextActions.push({
      de: "Erste Woche — setze deine 3 wichtigsten KPIs als Baseline.",
      en: "First week — set your 3 most important KPIs as baseline.",
    });
    return { improved, worsened, nextActions };
  }

  if (currentKPI.margin > previousKPI.margin) {
    improved.push({ de: `Marge verbessert: ${previousKPI.margin}% → ${currentKPI.margin}%`, en: `Margin improved: ${previousKPI.margin}% → ${currentKPI.margin}%` });
  } else if (currentKPI.margin < previousKPI.margin) {
    worsened.push({ de: `Marge gefallen: ${previousKPI.margin}% → ${currentKPI.margin}%`, en: `Margin declined: ${previousKPI.margin}% → ${currentKPI.margin}%` });
  }

  if (currentKPI.runway > previousKPI.runway) {
    improved.push({ de: `Runway verlängert: ${previousKPI.runway} → ${currentKPI.runway} Monate`, en: `Runway extended: ${previousKPI.runway} → ${currentKPI.runway} months` });
  } else if (currentKPI.runway < previousKPI.runway) {
    worsened.push({ de: `Runway verkürzt: ${previousKPI.runway} → ${currentKPI.runway} Monate`, en: `Runway shortened: ${previousKPI.runway} → ${currentKPI.runway} months` });
  }

  if (currentKPI.conversionRate > previousKPI.conversionRate) {
    improved.push({ de: `Conversion gestiegen`, en: `Conversion increased` });
  } else if (currentKPI.conversionRate < previousKPI.conversionRate) {
    worsened.push({ de: `Conversion gefallen`, en: `Conversion decreased` });
  }

  // Generate next actions
  if (currentKPI.margin < 35) {
    nextActions.push({ de: "Marge unter 35%: Preiserhöhung oder Kostenreduktion priorisieren", en: "Margin below 35%: Prioritize price increase or cost reduction" });
  }
  if (currentKPI.runway < 4) {
    nextActions.push({ de: "Runway unter 4 Monaten: Sofortige Burn-Rate Reduktion", en: "Runway under 4 months: Immediate burn rate reduction" });
  }
  if (worsened.length === 0 && improved.length > 0) {
    nextActions.push({ de: "Alle KPIs positiv — Fokus auf Skalierung", en: "All KPIs positive — focus on scaling" });
  }

  return { improved, worsened, nextActions };
}
