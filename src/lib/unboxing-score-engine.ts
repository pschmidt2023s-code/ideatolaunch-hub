// ─── Unboxing Score Engine (PRO FEATURE) ────────────────────────
// Deterministic scoring. No external API calls.

export type PackagingType = "poly_mailer" | "kraft_box" | "rigid_box" | "custom_box";

export interface UnboxingInput {
  packagingType: PackagingType;
  tissuePaper: boolean;
  stickerSeal: boolean;
  thankYouCard: boolean;
  insertSamples: boolean;
  customLabeling: boolean;
  returnFriendly: boolean;
  packagingBudget?: number;
  targetPositioning: "budget" | "mid" | "premium";
  productMarginBudget?: number; // optional: total margin budget for sanity check
}

export interface QuickWin {
  title: string;
  costHint: string;
  impact: "low" | "medium" | "high";
}

export interface UnboxingScoreResult {
  score: number;
  level: "basic" | "good" | "premium";
  strengths: string[];
  gaps: string[];
  quickWins: QuickWin[];
  recommendedKit: string[];
  riskNotes: string[];
}

// ── Point values ────────────────────────────────────────────────
const PACKAGING_POINTS: Record<PackagingType, number> = {
  poly_mailer: 5,
  kraft_box: 20,
  rigid_box: 35,
  custom_box: 45,
};

const ADDON_POINTS: Record<string, { points: number; label: string }> = {
  tissuePaper:    { points: 8,  label: "Seidenpapier" },
  stickerSeal:    { points: 6,  label: "Sticker-Siegel" },
  thankYouCard:   { points: 10, label: "Dankeskarte" },
  insertSamples:  { points: 12, label: "Produkt-Beilagen" },
  customLabeling: { points: 10, label: "Custom Labeling" },
  returnFriendly: { points: 8,  label: "Rücksendefreundlich" },
};

const PACKAGING_LABELS: Record<PackagingType, string> = {
  poly_mailer: "Polybag / Mailer",
  kraft_box: "Kraft-Box",
  rigid_box: "Rigid Box",
  custom_box: "Custom Box",
};

export function computeUnboxingScore(input: UnboxingInput): UnboxingScoreResult {
  const strengths: string[] = [];
  const gaps: string[] = [];
  const riskNotes: string[] = [];

  // ── Base score from packaging type ────────────────────────
  let raw = PACKAGING_POINTS[input.packagingType];
  strengths.push(`Verpackung: ${PACKAGING_LABELS[input.packagingType]} (+${PACKAGING_POINTS[input.packagingType]})`);

  // ── Add-on scoring ────────────────────────────────────────
  const addonKeys: (keyof typeof ADDON_POINTS)[] = [
    "tissuePaper", "stickerSeal", "thankYouCard",
    "insertSamples", "customLabeling", "returnFriendly",
  ];

  for (const key of addonKeys) {
    const { points, label } = ADDON_POINTS[key];
    if (input[key as keyof UnboxingInput]) {
      raw += points;
      strengths.push(`${label} (+${points})`);
    } else {
      gaps.push(`${label} fehlt (+${points} möglich)`);
    }
  }

  // ── Positioning alignment penalties / notes ───────────────
  if (input.targetPositioning === "premium" && input.packagingType === "poly_mailer") {
    raw = Math.max(0, raw - 20);
    gaps.unshift("Premium-Positionierung mit Polybag: -20 Punkte Strafe");
  }

  if (input.targetPositioning === "premium" && raw < 60) {
    gaps.unshift("Premium-Mismatch: Dein Score passt nicht zur Premium-Positionierung");
  }

  if (input.targetPositioning === "budget" && raw > 80) {
    riskNotes.push("Überinvestitions-Risiko: Dein Unboxing-Aufwand ist für ein Budget-Produkt möglicherweise zu hoch.");
  }

  // ── Budget sanity ─────────────────────────────────────────
  if (input.packagingBudget && input.productMarginBudget && input.productMarginBudget > 0) {
    const pct = input.packagingBudget / input.productMarginBudget;
    if (pct > 0.2) {
      riskNotes.push(`Packaging-Budget (${(pct * 100).toFixed(0)}% der Marge) übersteigt die empfohlenen 20%.`);
    }
  }

  // ── Clamp score ───────────────────────────────────────────
  const score = Math.min(100, Math.max(0, raw));

  // ── Level ─────────────────────────────────────────────────
  const level: "basic" | "good" | "premium" =
    score >= 70 ? "premium" : score >= 40 ? "good" : "basic";

  // ── Quick Wins ────────────────────────────────────────────
  const quickWins: QuickWin[] = [];

  if (!input.tissuePaper) {
    quickWins.push({ title: "Seidenpapier hinzufügen", costHint: "€0,01–€0,15 pro Bestellung", impact: "medium" });
  }
  if (!input.stickerSeal) {
    quickWins.push({ title: "Sticker-Siegel hinzufügen", costHint: "€0,01–€0,08 pro Stück", impact: "low" });
  }
  if (!input.thankYouCard) {
    quickWins.push({ title: "Dankeskarte beilegen", costHint: "€0,02–€0,10 pro Stück", impact: "high" });
  }
  if (!input.insertSamples) {
    quickWins.push({ title: "Produktbeilage / Sample", costHint: "€0,03–€0,50 pro Stück", impact: "high" });
  }
  if (!input.customLabeling) {
    quickWins.push({ title: "Custom Labeling / Branding", costHint: "€0,05–€0,30 pro Stück", impact: "medium" });
  }
  if (!input.returnFriendly && input.targetPositioning !== "budget") {
    quickWins.push({ title: "Rücksendefreundliche Verpackung", costHint: "€0,10–€0,50 pro Stück", impact: "medium" });
  }
  if (input.packagingType === "poly_mailer" && input.targetPositioning !== "budget") {
    quickWins.unshift({ title: "Upgrade auf Kraft- oder Custom-Box", costHint: "€0,30–€2,00 pro Stück", impact: "high" });
  }

  // Limit to top 3
  quickWins.splice(3);

  // ── Recommended Kit ───────────────────────────────────────
  const recommendedKit: string[] = [];

  if (input.targetPositioning === "premium") {
    recommendedKit.push("Custom Box oder Rigid Box", "Seidenpapier mit Logo", "Dankeskarte (Letterpress)", "Sticker-Siegel", "Produkt-Beilage");
  } else if (input.targetPositioning === "mid") {
    recommendedKit.push("Kraft-Box", "Seidenpapier", "Dankeskarte", "Sticker-Siegel");
  } else {
    recommendedKit.push("Bedruckter Mailer", "Sticker", "Dankeskarte (einfach)");
  }

  return { score, level, strengths, gaps, quickWins, recommendedKit, riskNotes };
}
