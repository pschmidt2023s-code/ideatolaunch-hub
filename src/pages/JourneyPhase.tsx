import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { JOURNEY_PHASES } from "@/lib/journey-phases";
import { useBrand } from "@/hooks/useBrand";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

export default function JourneyPhase() {
  const { phaseNumber } = useParams();
  const navigate = useNavigate();
  const { activeBrand } = useBrand();
  const num = Number(phaseNumber) || 1;
  const phase = JOURNEY_PHASES[num - 1];

  if (!phase) {
    navigate("/dashboard");
    return null;
  }

  const currentStep = activeBrand?.current_step ?? 1;
  const isCompleted = num < currentStep;
  const isActive = num === Math.min(currentStep, 5);
  const isLocked = num > currentStep;
  const PhaseIcon = phase.icon;

  const colorMap: Record<string, string> = {
    info: "bg-info/10 text-info border-info/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    success: "bg-success/10 text-success border-success/20",
    primary: "bg-primary/10 text-primary border-primary/20",
  };

  const badgeColorMap: Record<string, string> = {
    info: "bg-info text-info-foreground",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-warning text-warning-foreground",
    success: "bg-success text-success-foreground",
    primary: "bg-primary text-primary-foreground",
  };

  return (
    <DashboardLayout>
      <SEO
        title={`Phase ${num}: ${phase.title} – BrandOS`}
        description={phase.description}
        path={`/dashboard/journey/${num}`}
      />
      <div className="animate-fade-in space-y-6 max-w-4xl">
        {/* Back nav */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </button>

        {/* Phase header */}
        <div className={cn("rounded-2xl border p-6 sm:p-8", colorMap[phase.color])}>
          <div className="flex items-start gap-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shrink-0", badgeColorMap[phase.color])}>
              <PhaseIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-70">
                  Phase {num} of 5
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">
                    <Check className="h-3 w-3" /> Completed
                  </span>
                )}
                {isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent animate-pulse">
                    Current Phase
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{phase.title}</h1>
              <p className="text-sm opacity-80 mt-1">{phase.subtitle}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed opacity-80">{phase.description}</p>
          <div className="mt-4 rounded-lg bg-background/50 px-4 py-2.5">
            <p className="text-xs font-medium">
              <span className="font-bold">Goal:</span> {phase.goal}
            </p>
          </div>
        </div>

        {/* Modules grid */}
        <div>
          <h2 className="text-sm font-bold mb-3">Tools & Modules</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {phase.modules.map((mod) => {
              const ModIcon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => !isLocked && navigate(mod.href)}
                  disabled={isLocked}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all",
                    isLocked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-accent/30 hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0 group-hover:bg-accent/10 transition-colors">
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ModIcon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{mod.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mod.description}</p>
                  </div>
                  {!isLocked && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent shrink-0 mt-1 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase navigation */}
        <div className="flex items-center justify-between pt-2">
          {num > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/journey/${num - 1}`)}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Phase {num - 1}
            </Button>
          ) : <div />}
          {num < 5 ? (
            <Button
              size="sm"
              onClick={() => navigate(`/dashboard/journey/${num + 1}`)}
              className="gap-1.5"
            >
              Phase {num + 1}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : <div />}
        </div>
      </div>
    </DashboardLayout>
  );
}
