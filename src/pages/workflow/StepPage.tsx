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

const stepComponents = [
  StepIdeaFoundation,
  StepBrandStructure,
  StepBusinessCalculator,
  StepProduction,
  StepCompliance,
  StepSales,
  StepLaunchRoadmap,
];

const stepTitles = [
  "Ideen-Fundament",
  "Markenstruktur",
  "Business-Kalkulator",
  "Produktionsplanung",
  "Verpackung & Compliance",
  "Vertriebsbasis",
  "Launch-Roadmap",
];

export default function StepPage() {
  const { stepNumber } = useParams();
  const navigate = useNavigate();
  const step = parseInt(stepNumber || "1", 10);
  const StepComponent = stepComponents[step - 1];

  if (!StepComponent || step < 1 || step > 7) {
    navigate("/dashboard");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">Schritt {step}/7</span>
          <span>·</span>
          <span>{stepTitles[step - 1]}</span>
        </div>

        <h1 className="mb-8 text-2xl font-bold">{stepTitles[step - 1]}</h1>

        <StepComponent />

        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? navigate(`/dashboard/step/${step - 1}`) : navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {step > 1 ? "Zurück" : "Dashboard"}
          </Button>
          {step < 7 && (
            <Button
              onClick={() => navigate(`/dashboard/step/${step + 1}`)}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Weiter
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
