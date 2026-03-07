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
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, AlertTriangle, Target, DollarSign, Package, Shield, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackEvent, trackCriticalEvent, startStepTimer, clearStepTimer } from "@/lib/analytics";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fireStepConfetti, fireCompletionConfetti } from "@/lib/confetti";

const TOTAL_PHASES = 5;

const stepComponents = [
  StepValidationBrand,
  StepBusinessCalculator,
  StepProduction,
  StepComplianceSales,
  StepLaunchRoadmap,
];

const phaseMetadata = [
  {
    timeEstimate: "30–45 min",
    riskLevel: "medium" as const,
    icon: Target,
    deliverables: ["Markenprofil", "Zielgruppe", "Positionierung"],
    description: "Validiere deine Idee und definiere dein Markenprofil",
  },
  {
    timeEstimate: "15–20 min",
    riskLevel: "high" as const,
    icon: DollarSign,
    deliverables: ["Finanzmodell", "Break-Even", "Preiskalkulation"],
    description: "Berechne Kosten, Marge und Kapitalbedarf",
  },
  {
    timeEstimate: "20–30 min",
    riskLevel: "high" as const,
    icon: Package,
    deliverables: ["Produktionsplan", "Lieferanten-Profil", "MOQ-Analyse"],
    description: "Plane Produktion, Sourcing und Qualitätssicherung",
  },
  {
    timeEstimate: "20–30 min",
    riskLevel: "medium" as const,
    icon: Shield,
    deliverables: ["Compliance-Score", "Rechtliche Checkliste", "Vertriebsplan"],
    description: "Sichere regulatorische Konformität und Vertriebskanäle",
  },
  {
    timeEstimate: "15–20 min",
    riskLevel: "low" as const,
    icon: Rocket,
    deliverables: ["Launch-Roadmap", "Fulfillment-Plan", "Readiness Score"],
    description: "Erstelle deinen Launch-Plan und starte durch",
  },
];

const riskColors = {
  low: "text-success bg-success/10",
  medium: "text-warning bg-warning/10",
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
  const PhaseIcon = meta.icon;
  const currentStep = activeBrand?.current_step ?? 1;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Phase stepper dots */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: TOTAL_PHASES }, (_, i) => {
              const s = i + 1;
              const done = s < currentStep;
              const active = s === step;
              return (
                <div key={s} className="flex items-center flex-1">
                  <button
                    onClick={() => navigate(`/dashboard/step/${s}`)}
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all",
                      done && "bg-success text-success-foreground",
                      active && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                      !done && !active && "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </button>
                  {i < TOTAL_PHASES - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-1.5", done ? "bg-success" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress percentage */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Phase {step} von {TOTAL_PHASES}
            </span>
            <span className="text-xs font-bold tabular-nums text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1 rounded-full" />
        </div>

        {/* Phase header card */}
        <div className="mb-6 rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <PhaseIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-bold">{stepTitle}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {meta.timeEstimate}
                </span>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium", riskColors[meta.riskLevel])}>
                  {meta.riskLevel === "high" && <AlertTriangle className="h-3 w-3" />}
                  {isDE
                    ? meta.riskLevel === "high" ? "Hohes Risiko" : meta.riskLevel === "medium" ? "Mittleres Risiko" : "Niedriges Risiko"
                    : meta.riskLevel === "high" ? "High Risk" : meta.riskLevel === "medium" ? "Medium Risk" : "Low Risk"
                  }
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{meta.description}</p>

              {/* Deliverables */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Outputs:</span>
                {meta.deliverables.map((d) => (
                  <span key={d} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {d}
                  </span>
                ))}
              </div>
            </div>
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

        {/* Navigation footer */}
        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? navigate(`/dashboard/step/${step - 1}`) : navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {step > 1 ? t("steps.back") : t("steps.dashboard")}
          </Button>

          <div className="flex items-center gap-3">
            {step < TOTAL_PHASES && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Nächste Phase: {t(`steps.${stepTitleKeys[step]}`)}
              </span>
            )}
            {step < TOTAL_PHASES ? (
              <Button
                onClick={handleNext}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t("steps.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="gap-2 bg-success text-success-foreground hover:bg-success/90"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("steps.finish", "Marke fertigstellen")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
