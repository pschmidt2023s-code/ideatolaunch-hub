import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StepGuidancePanel } from "@/components/StepGuidancePanel";
import { PhaseIntelligenceBar } from "@/components/dashboard/PhaseIntelligenceBar";
import { type StepHandle } from "@/components/workflow/StepIdeaFoundation";
import { AdaptiveWorkflowPanel } from "@/components/dashboard/AdaptiveWorkflowPanel";
import { StepValidationBrand } from "@/components/workflow/StepValidationBrand";
import { StepBusinessCalculator } from "@/components/workflow/StepBusinessCalculator";
import { StepProduction } from "@/components/workflow/StepProduction";
import { StepComplianceSales } from "@/components/workflow/StepComplianceSales";
import { StepLaunchRoadmap } from "@/components/workflow/StepLaunchRoadmap";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackEvent, trackCriticalEvent, startStepTimer, clearStepTimer } from "@/lib/analytics";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TOTAL_PHASES = 5;

const stepComponents = [
  StepValidationBrand,
  StepBusinessCalculator,
  StepProduction,
  StepComplianceSales,
  StepLaunchRoadmap,
];

const phaseMetadata = [
  { timeEstimate: "30–45 min", riskLevel: "medium" as const },
  { timeEstimate: "15–20 min", riskLevel: "high" as const },
  { timeEstimate: "20–30 min", riskLevel: "high" as const },
  { timeEstimate: "20–30 min", riskLevel: "medium" as const },
  { timeEstimate: "15–20 min", riskLevel: "low" as const },
];

const riskColors = {
  low: "text-green-600 bg-green-500/10",
  medium: "text-amber-600 bg-amber-500/10",
  high: "text-destructive bg-destructive/10",
};

const stepEventMap: Record<number, Parameters<typeof trackEvent>[0]> = {
  1: "idea_completed",
  2: "calculator_completed",
  3: "production_completed",
};

export default function StepPage() {
  const { stepNumber } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { plan } = useSubscription();
  const { activeBrand, refetchBrands } = useBrand();
  const step = parseInt(stepNumber || "1", 10);
  const StepComponent = stepComponents[step - 1];
  const stepRef = useRef<StepHandle>(null);
  const isDE = i18n.language === "de";

  const stepTitleKeys = ["p1", "p2", "p3", "p4", "p5"];

  const ctx = { step, plan, brandId: activeBrand?.id };

  const progress = Math.round(((step - 1) / TOTAL_PHASES) * 100);

  const advanceStep = async (nextStep: number) => {
    if (!activeBrand || nextStep <= activeBrand.current_step) return;
    await supabase
      .from("brands")
      .update({ current_step: nextStep })
      .eq("id", activeBrand.id);
    refetchBrands();
  };

  useEffect(() => {
    if (step < 1 || step > TOTAL_PHASES || !StepComponent) {
      navigate("/dashboard", { replace: true });
      return;
    }
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo(0, 0);
    window.scrollTo(0, 0);

    trackEvent("step_viewed", ctx);
    if (step === 2) trackEvent("entered_business_calculator", ctx);
    startStepTimer(step);
    return () => clearStepTimer();
  }, [step]);

  if (!StepComponent || step < 1 || step > TOTAL_PHASES) return null;

  const handleNext = async () => {
    try {
      await stepRef.current?.save();
      trackCriticalEvent("step_saved", { ...ctx, plan });
    } catch {
      // Continue even if save fails
    }
    await advanceStep(step + 1);
    navigate(`/dashboard/step/${step + 1}`);
  };

  const handleFinish = async () => {
    try {
      await stepRef.current?.save();
      toast.success(t("steps.brandSaved", "Marke gespeichert! Du findest sie im Dashboard."));
    } catch {
      // Continue even if save fails
    }
    await advanceStep(TOTAL_PHASES + 1);
    navigate("/dashboard");
  };

  const stepTitle = t(`steps.${stepTitleKeys[step - 1]}`);
  const meta = phaseMetadata[step - 1];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Phase progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{t("steps.phase", { n: step, total: TOTAL_PHASES })}</span>
              <span>·</span>
              <span>{stepTitle}</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 rounded-full" />
        </div>

        {/* Phase header with metadata */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{stepTitle}</h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              {meta.timeEstimate}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${riskColors[meta.riskLevel]}`}>
              {meta.riskLevel === "high" && <AlertTriangle className="h-3 w-3" />}
              {isDE
                ? meta.riskLevel === "high" ? "Hohes Risiko" : meta.riskLevel === "medium" ? "Mittleres Risiko" : "Niedriges Risiko"
                : meta.riskLevel === "high" ? "High Risk" : meta.riskLevel === "medium" ? "Medium Risk" : "Low Risk"
              }
            </span>
          </div>
        </div>

        <div className="mb-4">
          <PhaseIntelligenceBar step={step} />
        </div>

        <div className="mb-6">
          <StepGuidancePanel stepNumber={step} />
        </div>

        <div className="mb-6">
          <AdaptiveWorkflowPanel currentStep={step} />
        </div>

        <StepComponent ref={stepRef} />

        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? navigate(`/dashboard/step/${step - 1}`) : navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {step > 1 ? t("steps.back") : t("steps.dashboard")}
          </Button>
          {step < TOTAL_PHASES ? (
            <Button
              onClick={handleNext}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {t("steps.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("steps.finish", "Marke fertigstellen")}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
