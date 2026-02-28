import { useEffect } from "react";
import { Lock, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type ReactNode } from "react";
import { getUpgradeMessage, getRequiredPlan, type FeatureKey } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";

interface LockedOverlayProps {
  children: ReactNode;
  feature: FeatureKey;
  requiredPlan?: "builder" | "pro" | "execution";
  message?: string;
}

// Psychological framing: Risk → Financial Impact → Benefit → CTA
const psychFraming: Record<string, {
  risk: { de: string; en: string };
  financial: { de: string; en: string };
  benefit: { de: string; en: string };
}> = {
  builder: {
    risk: { de: "Ohne dieses Tool fehlt dir Struktur.", en: "Without this tool, you lack structure." },
    financial: { de: "1 vermiedener Fehler = 3.000–10.000 € gespart.", en: "1 prevented mistake = €3,000–€10,000 saved." },
    benefit: { de: "Strukturierte Planung schützt dein Kapital.", en: "Structured planning protects your capital." },
  },
  pro: {
    risk: { de: "Entscheidungen ohne Daten kosten Geld.", en: "Decisions without data cost money." },
    financial: { de: "Datenlose Skalierung kostet Gründer durchschnittlich 5.000–15.000 €.", en: "Scaling without data costs founders €5,000–€15,000 on average." },
    benefit: { de: "Datenbasierte Entscheidungen statt teure Vermutungen.", en: "Data-backed decisions instead of costly guesswork." },
  },
  execution: {
    risk: { de: "Hohes Kapitalrisiko ohne Monitoring.", en: "High capital risk without monitoring." },
    financial: { de: "Eine falsche Produktionsentscheidung kostet 8.000–20.000 €.", en: "One wrong production decision costs €8,000–€20,000." },
    benefit: { de: "Execution OS schützt dein Kapital vor vermeidbaren Verlusten.", en: "Execution OS protects your capital from avoidable losses." },
  },
};

export function LockedOverlay({ children, feature, message, requiredPlan }: LockedOverlayProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isDE = i18n.language === "de";

  const plan = requiredPlan ?? getRequiredPlan(feature);

  useEffect(() => {
    trackEvent("feature_locked_viewed", { feature, requiredPlan: plan });
  }, [feature, plan]);

  const upgradeMsg = getUpgradeMessage(feature);
  const title = message || (isDE ? upgradeMsg.title.de : upgradeMsg.title.en);
  const framing = psychFraming[plan] || psychFraming.builder;

  const ctaLabel = plan === "execution"
    ? (isDE ? "Kapital schützen — Execution OS" : "Protect Capital — Execution OS")
    : plan === "pro"
    ? (isDE ? "Daten nutzen — Upgrade auf Pro" : "Use Data — Upgrade to Pro")
    : (isDE ? "Struktur aufbauen — Upgrade auf Builder" : "Build Structure — Upgrade to Builder");

  const isCritical = plan === "execution";

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-background/70 backdrop-blur-[3px]">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full mb-3 ${
          isCritical ? "bg-destructive/10" : "bg-accent/10"
        }`}>
          {isCritical ? (
            <AlertTriangle className="h-6 w-6 text-destructive" />
          ) : (
            <Lock className="h-6 w-6 text-accent" />
          )}
        </div>
        {/* 1) Risk Statement */}
        <p className={`text-xs font-medium mb-1 ${isCritical ? "text-destructive" : "text-muted-foreground"}`}>
          {isDE ? framing.risk.de : framing.risk.en}
        </p>
        {/* Feature Title */}
        <p className="text-sm font-semibold mb-1">{title}</p>
        {/* 2) Financial Framing */}
        <p className="text-[11px] text-muted-foreground mb-1 max-w-xs text-center">
          {isDE ? framing.financial.de : framing.financial.en}
        </p>
        {/* 3) Benefit */}
        <p className="text-[11px] text-foreground mb-3 max-w-xs text-center flex items-center justify-center gap-1">
          <Shield className="h-3 w-3 text-accent shrink-0" />
          {isDE ? framing.benefit.de : framing.benefit.en}
        </p>
        {/* 4) CTA */}
        <Button
          size="sm"
          className={`gap-2 ${
            isCritical
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }`}
          onClick={() => {
            trackEvent("clicked_upgrade", { source: "locked_overlay", feature });
            navigate("/dashboard/pricing");
          }}
        >
          <Shield className="h-3.5 w-3.5" />
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
