// ─── Compliance Engine ────────────────────────────────────────────────
// Computes compliance score and generates recommendations

export interface ComplianceItem {
  key: string;
  label: string;
  description: string;
  category: "legal" | "product" | "data" | "packaging";
  required: boolean;
}

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { key: "gewerbeanmeldung", label: "Gewerbeanmeldung", description: "Gewerbeanmeldung beim zuständigen Gewerbeamt abschließen", category: "legal", required: true },
  { key: "dsgvo_assessment", label: "DSGVO Basis-Assessment", description: "Datenschutz-Grundverordnung Prüfung und Maßnahmen dokumentieren", category: "data", required: true },
  { key: "impressum_ready", label: "Impressum", description: "Vollständiges Impressum nach § 5 TMG erstellen", category: "legal", required: true },
  { key: "datenschutz_ready", label: "Datenschutzerklärung", description: "DSGVO-konforme Datenschutzerklärung erstellen", category: "data", required: true },
  { key: "widerruf_ready", label: "Widerrufsbelehrung", description: "Widerrufsrecht & Muster-Widerrufsformular bereitstellen", category: "legal", required: true },
  { key: "verpackg_registered", label: "VerpackG Registrierung", description: "Registrierung bei LUCID (Zentrale Stelle Verpackungsregister)", category: "packaging", required: true },
  { key: "ce_marking_checked", label: "CE-Kennzeichnung", description: "CE-Konformität für relevante Produktkategorien prüfen", category: "product", required: false },
  { key: "product_labeling_done", label: "Produktkennzeichnung", description: "Pflichtangaben auf Verpackung und Etikett sicherstellen", category: "product", required: true },
  { key: "agb_ready", label: "AGB", description: "Allgemeine Geschäftsbedingungen erstellen lassen", category: "legal", required: false },
];

export interface ComplianceState {
  [key: string]: boolean;
}

export interface ComplianceResult {
  score: number;
  completedCount: number;
  totalCount: number;
  requiredCompleted: number;
  requiredTotal: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFlags: string[];
  recommendations: string[];
  categoryScores: Record<string, { completed: number; total: number }>;
}

export function computeComplianceScore(state: ComplianceState): ComplianceResult {
  const totalCount = COMPLIANCE_ITEMS.length;
  let completedCount = 0;
  let requiredCompleted = 0;
  const requiredTotal = COMPLIANCE_ITEMS.filter((i) => i.required).length;
  const riskFlags: string[] = [];
  const recommendations: string[] = [];
  const categoryScores: Record<string, { completed: number; total: number }> = {};

  for (const item of COMPLIANCE_ITEMS) {
    if (!categoryScores[item.category]) {
      categoryScores[item.category] = { completed: 0, total: 0 };
    }
    categoryScores[item.category].total++;

    if (state[item.key]) {
      completedCount++;
      categoryScores[item.category].completed++;
      if (item.required) requiredCompleted++;
    } else {
      if (item.required) {
        riskFlags.push(`${item.label} fehlt (Pflicht)`);
        recommendations.push(`⚠️ ${item.label}: ${item.description}`);
      } else {
        recommendations.push(`💡 ${item.label}: ${item.description}`);
      }
    }
  }

  const score = Math.round((completedCount / totalCount) * 100);

  const riskLevel: ComplianceResult["riskLevel"] =
    requiredCompleted === requiredTotal
      ? score === 100
        ? "low"
        : "low"
      : requiredCompleted >= requiredTotal * 0.7
        ? "medium"
        : requiredCompleted >= requiredTotal * 0.4
          ? "high"
          : "critical";

  return {
    score,
    completedCount,
    totalCount,
    requiredCompleted,
    requiredTotal,
    riskLevel,
    riskFlags,
    recommendations,
    categoryScores,
  };
}

// ─── Launch Risk Score ───────────────────────────────────────────────

export interface LaunchRiskInput {
  complianceScore: number;
  financialReady: boolean;
  supplierConfirmed: boolean;
  productionStarted: boolean;
  capitalSafetyMonths: number;
  marginPercent: number;
}

export function computeLaunchRiskScore(input: LaunchRiskInput): {
  score: number;
  level: "ready" | "caution" | "not_ready";
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];

  // Compliance (max 30 points)
  const compliancePoints = Math.round(input.complianceScore * 0.3);
  score += compliancePoints;
  if (input.complianceScore < 60) factors.push("Compliance unter 60%");

  // Financial (max 25 points)
  if (input.financialReady) {
    score += 25;
  } else {
    factors.push("Finanzplan unvollständig");
  }

  // Supplier (max 20 points)
  if (input.supplierConfirmed) {
    score += 20;
  } else {
    factors.push("Kein bestätigter Lieferant");
  }

  // Capital safety (max 15 points)
  if (input.capitalSafetyMonths >= 6) {
    score += 15;
  } else if (input.capitalSafetyMonths >= 3) {
    score += 10;
    factors.push("Kapitalreserve unter 6 Monaten");
  } else {
    score += 5;
    factors.push("Kritisch: Kapitalreserve unter 3 Monaten");
  }

  // Margin (max 10 points)
  if (input.marginPercent >= 40) {
    score += 10;
  } else if (input.marginPercent >= 25) {
    score += 7;
  } else {
    score += 3;
    factors.push("Marge unter 25%");
  }

  const level: "ready" | "caution" | "not_ready" =
    score >= 75 ? "ready" : score >= 50 ? "caution" : "not_ready";

  return { score, level, factors };
}
