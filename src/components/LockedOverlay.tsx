import { useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type ReactNode } from "react";
import { getUpgradeMessage, getRequiredPlan, type FeatureKey } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";

interface LockedOverlayProps {
  children: ReactNode;
  /** Feature key for contextual messaging */
  feature: FeatureKey;
  /** Override the required plan (auto-detected from feature if omitted) */
  requiredPlan?: "builder" | "pro";
  /** Override message */
  message?: string;
}

export function LockedOverlay({ children, feature, message, requiredPlan }: LockedOverlayProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isDE = i18n.language === "de";

  const plan = requiredPlan ?? getRequiredPlan(feature);

  // Track when a locked feature is viewed
  useEffect(() => {
    trackEvent("feature_locked_viewed", { feature, requiredPlan: plan });
  }, [feature, plan]);

  const upgradeMsg = getUpgradeMessage(feature);
  const title = message || (isDE ? upgradeMsg.title.de : upgradeMsg.title.en);
  const desc = isDE ? upgradeMsg.desc.de : upgradeMsg.desc.en;

  const ctaLabel = plan === "execution"
    ? (isDE ? "Upgrade auf Execution OS" : "Upgrade to Execution OS")
    : plan === "pro"
    ? (isDE ? "Upgrade auf Pro" : "Upgrade to Pro")
    : (isDE ? "Upgrade auf Builder" : "Upgrade to Builder");

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-3">
          <Lock className="h-6 w-6 text-accent" />
        </div>
        <p className="text-sm font-semibold mb-1">{title}</p>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs text-center">{desc}</p>
        <Button
          size="sm"
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            trackEvent("clicked_upgrade", { source: "locked_overlay", feature });
            navigate("/dashboard/pricing");
          }}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
