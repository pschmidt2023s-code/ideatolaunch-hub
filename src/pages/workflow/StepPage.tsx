import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StepIdeaFoundation } from "@/components/workflow/StepIdeaFoundation";
import { StepBrandStructure } from "@/components/workflow/StepBrandStructure";
import { StepBusinessCalculator } from "@/components/workflow/StepBusinessCalculator";
import { StepProduction } from "@/components/workflow/StepProduction";
import { StepCompliance } from "@/components/workflow/StepCompliance";
import { StepSales } from "@/components/workflow/StepSales";
import { StepLaunchRoadmap } from "@/components/workflow/StepLaunchRoadmap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const stepComponents = [
  StepIdeaFoundation,
  StepBrandStructure,
  StepBusinessCalculator,
  StepProduction,
  StepCompliance,
  StepSales,
  StepLaunchRoadmap,
];

export default function StepPage() {
  const { stepNumber } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const step = parseInt(stepNumber || "1", 10);
  const StepComponent = stepComponents[step - 1];

  const stepTitleKeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

  if (!StepComponent || step < 1 || step > 7) {
    navigate("/dashboard");
    return null;
  }

  const stepTitle = t(`steps.${stepTitleKeys[step - 1]}`);

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{t("steps.step", { n: step })}</span>
          <span>·</span>
          <span>{stepTitle}</span>
        </div>

        <h1 className="mb-8 text-2xl font-bold">{stepTitle}</h1>

        <StepComponent />

        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("steps.dashboard")}
          </Button>
          {step < 7 && (
            <Button
              onClick={() => navigate(`/dashboard/step/${step + 1}`)}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {t("steps.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
