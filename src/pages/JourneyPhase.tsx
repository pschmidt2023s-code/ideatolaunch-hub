import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { JOURNEY_PHASES } from "@/lib/journey-phases";
import { useBrand } from "@/hooks/useBrand";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Lock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

const COLOR_MAP: Record<string, { header: string; badge: string; glow: string }> = {
  info:    { header: "from-info/10 to-info/5 border-info/20", badge: "bg-info text-info-foreground", glow: "shadow-[0_0_60px_-15px_hsl(217_91%_60%/0.15)]" },
  accent:  { header: "from-accent/10 to-accent/5 border-accent/20", badge: "bg-accent text-accent-foreground", glow: "shadow-[0_0_60px_-15px_hsl(142_71%_45%/0.15)]" },
  warning: { header: "from-warning/10 to-warning/5 border-warning/20", badge: "bg-warning text-warning-foreground", glow: "shadow-[0_0_60px_-15px_hsl(38_92%_50%/0.15)]" },
  success: { header: "from-success/10 to-success/5 border-success/20", badge: "bg-success text-success-foreground", glow: "shadow-[0_0_60px_-15px_hsl(142_71%_45%/0.15)]" },
  primary: { header: "from-primary/10 to-primary/5 border-primary/20", badge: "bg-primary text-primary-foreground", glow: "shadow-[0_0_60px_-15px_hsl(222_47%_11%/0.15)]" },
};

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
  const colors = COLOR_MAP[phase.color] || COLOR_MAP.primary;

  return (
    <DashboardLayout>
      <SEO
        title={`Phase ${num}: ${phase.title} – BrandOS`}
        description={phase.description}
        path={`/dashboard/journey/${num}`}
      />
      <div className="animate-fade-in space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => navigate("/dashboard")} className="hover:text-foreground transition-colors">
            Dashboard
          </button>
          <span>/</span>
          <button onClick={() => navigate("/dashboard")} className="hover:text-foreground transition-colors">
            Journey
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">Phase {num}</span>
        </div>

        {/* Phase header card */}
        <div className={cn("rounded-2xl border bg-gradient-to-br p-6 sm:p-8 relative overflow-hidden", colors.header, colors.glow)}>
          {/* Phase step indicator */}
          <div className="flex items-center gap-1.5 mb-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn(
                "h-1 rounded-full transition-all",
                i === num ? "w-8 bg-foreground/60" : "w-4 bg-foreground/10"
              )} />
            ))}
          </div>

          <div className="flex items-start gap-4 sm:gap-5">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shrink-0", colors.badge)}>
              <PhaseIcon className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] font-mono text-muted-foreground">
                  Phase {num} of 5
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-bold text-success">
                    <Check className="h-3 w-3" /> Completed
                  </span>
                )}
                {isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-accent">
                    Current Phase
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{phase.title}</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">{phase.description}</p>
            </div>
          </div>

          {/* Goal bar */}
          <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-background/60 backdrop-blur-sm px-4 py-3 border border-border/50">
            <Target className="h-4 w-4 text-accent shrink-0" />
            <p className="text-xs font-medium">
              <span className="text-muted-foreground">Goal:</span> {phase.goal}
            </p>
          </div>
        </div>

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Tools & Modules</h2>
            <span className="text-[10px] font-mono text-muted-foreground">{phase.modules.length} modules</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {phase.modules.map((mod, idx) => {
              const ModIcon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => !isLocked && navigate(mod.href)}
                  disabled={isLocked}
                  className={cn(
                    "group relative flex items-start gap-3.5 rounded-2xl border bg-card p-5 text-left transition-all duration-200",
                    isLocked
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:border-accent/30 hover:shadow-lg hover:-translate-y-1 card-interactive"
                  )}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-all duration-200",
                    isLocked ? "bg-muted" : "bg-muted group-hover:bg-accent/10"
                  )}>
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ModIcon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold group-hover:text-accent transition-colors">{mod.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.description}</p>
                  </div>
                  {!isLocked && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-accent group-hover:translate-x-0.5 shrink-0 mt-1 transition-all" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {num > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/journey/${num - 1}`)}
              className="gap-2 rounded-xl"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Phase {num - 1}: {JOURNEY_PHASES[num - 2]?.title}
            </Button>
          ) : <div />}
          {num < 5 ? (
            <Button
              size="sm"
              onClick={() => navigate(`/dashboard/journey/${num + 1}`)}
              className="gap-2 rounded-xl"
            >
              Phase {num + 1}: {JOURNEY_PHASES[num]?.title}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : <div />}
        </div>
      </div>
    </DashboardLayout>
  );
}
