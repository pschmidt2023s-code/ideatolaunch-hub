import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StepGuidancePanel } from "@/components/StepGuidancePanel";
import { StepIdeaFoundation, type StepHandle } from "@/components/workflow/StepIdeaFoundation";
import { StepBrandStructure } from "@/components/workflow/StepBrandStructure";
import { StepBusinessCalculator } from "@/components/workflow/StepBusinessCalculator";
import { StepProduction } from "@/components/workflow/StepProduction";
import { StepCompliance } from "@/components/workflow/StepCompliance";
import { StepSales } from "@/components/workflow/StepSales";
import { StepLaunchRoadmap } from "@/components/workflow/StepLaunchRoadmap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackEvent, trackCriticalEvent, startStepTimer, clearStepTimer } from "@/lib/analytics";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { toast } from "sonner";

const stepComponents = [
  StepIdeaFoundation,
  StepBrandStructure,
  StepBusinessCalculator,
  StepProduction,
  StepCompliance,
  StepSales,
  StepLaunchRoadmap,
];

const stepEventMap: Record<number, Parameters<typeof trackEvent>[0]> = {
  1: "idea_completed",
  3: "calculator_completed",
  4: "production_completed",
};

export default function StepPage() {
  const { stepNumber } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { plan } = useSubscription();
  const { activeBrand } = useBrand();
  const step = parseInt(stepNumber || "1", 10);
  const StepComponent = stepComponents[step - 1];
  const stepRef = useRef<StepHandle>(null);

  const stepTitleKeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

  const ctx = { step, plan, brandId: activeBrand?.id };

  useEffect(() => {
    if (step >= 1 && step <= 7) {
      trackEvent("step_viewed", ctx);
      if (step === 3) trackEvent("entered_business_calculator", ctx);
      startStepTimer(step);
    }
    return () => clearStepTimer();
  }, [step]);

  if (!StepComponent || step < 1 || step > 7) {
    navigate("/dashboard");
    return null;
  }

  const handleNext = async () => {
    try {
      await stepRef.current?.save();
      trackCriticalEvent("step_saved", { ...ctx, plan });
    } catch {
      // Continue navigation even if save fails
    }
    navigate(`/dashboard/step/${step + 1}`);
  };

  const handleFinish = async () => {
    try {
      await stepRef.current?.save();
      toast.success(t("steps.brandSaved", "Marke gespeichert! Du findest sie im Dashboard."));
    } catch {
      // Continue even if save fails
    }
    navigate("/dashboard");
  };

  const stepTitle = t(`steps.${stepTitleKeys[step - 1]}`);

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{t("steps.step", { n: step })}</span>
          <span>·</span>
          <span>{stepTitle}</span>
        </div>

        <h1 className="mb-6 text-2xl font-bold">{stepTitle}</h1>

        <div className="mb-6">
          <StepGuidancePanel stepNumber={step} />
        </div>

        <StepComponent ref={stepRef} />

        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("steps.dashboard")}
          </Button>
          {step < 7 ? (
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
