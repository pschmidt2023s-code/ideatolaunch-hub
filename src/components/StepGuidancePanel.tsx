import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Lightbulb, AlertCircle, Target, Sparkles } from "lucide-react";
import { getStepGuidance } from "@/lib/guidance-engine";
import { useSubscription } from "@/hooks/useSubscription";
import { getCapabilities } from "@/lib/feature-flags";
import { useTranslation } from "react-i18next";

interface StepGuidancePanelProps {
  stepNumber: number;
}

export function StepGuidancePanel({ stepNumber }: StepGuidancePanelProps) {
  const { plan } = useSubscription();
  const caps = getCapabilities(plan);
  const { i18n, t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  // Only available for Pro (via capabilities)
  if (!caps.canUseGuidedFounderMode) return null;

  const guidance = getStepGuidance(stepNumber, i18n.language);
  if (!guidance) return null;

  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">{t("guidance.explainStep")}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Lightbulb className="h-3 w-3" />
              {t("guidance.whatIsThis")}
            </div>
            <p className="text-sm">{guidance.what_is_this}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Target className="h-3 w-3" />
              {t("guidance.whyMatters")}
            </div>
            <p className="text-sm">{guidance.why_it_matters}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <AlertCircle className="h-3 w-3" />
              {t("guidance.commonMistakes")}
            </div>
            <ul className="space-y-1">
              {guidance.common_mistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive/60 shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Sparkles className="h-3 w-3" />
              {t("guidance.howToDecide")}
            </div>
            <p className="text-sm">{guidance.how_to_decide}</p>
          </div>

          <div className="rounded-lg bg-accent/5 border border-accent/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-accent">💡 Tipp:</span> {guidance.confidence_tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
