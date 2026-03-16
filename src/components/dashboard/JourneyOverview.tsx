import { useNavigate } from "react-router-dom";
import { useBrand } from "@/hooks/useBrand";
import { JOURNEY_PHASES } from "@/lib/journey-phases";
import { Check, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function JourneyOverview() {
  const navigate = useNavigate();
  const { activeBrand } = useBrand();
  const currentStep = activeBrand?.current_step ?? 1;
  const completed = currentStep > 5;
  const pct = completed ? 100 : Math.round(((currentStep - 1) / 5) * 100);

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Founder Journey
            </p>
            {!completed && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Currently in <span className="font-semibold text-foreground">Phase {Math.min(currentStep, 5)}: {JOURNEY_PHASES[Math.min(currentStep, 5) - 1]?.title}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-bold text-success">
                <Check className="h-3 w-3" /> Complete
              </span>
            )}
            <span className="text-lg font-bold tabular-nums">{pct}%</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-2">
        {JOURNEY_PHASES.map((phase) => {
          const isDone = phase.phase < currentStep || completed;
          const isActive = phase.phase === Math.min(currentStep, 5) && !completed;
          const isLocked = phase.phase > currentStep && !completed;
          const PhaseIcon = phase.icon;

          const colorMap: Record<string, string> = {
            info: "border-info/30 bg-info/5",
            accent: "border-accent/30 bg-accent/5",
            warning: "border-warning/30 bg-warning/5",
            success: "border-success/30 bg-success/5",
            primary: "border-primary/30 bg-primary/5",
          };

          const iconColorMap: Record<string, string> = {
            info: "bg-info text-info-foreground",
            accent: "bg-accent text-accent-foreground",
            warning: "bg-warning text-warning-foreground",
            success: "bg-success text-success-foreground",
            primary: "bg-primary text-primary-foreground",
          };

          return (
            <button
              key={phase.phase}
              onClick={() => navigate(`/dashboard/journey/${phase.phase}`)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all group",
                isActive && colorMap[phase.color],
                isDone && "border-success/20 bg-success/5",
                isLocked && "opacity-50 border-border bg-card",
                !isActive && !isDone && !isLocked && "border-border bg-card hover:border-accent/20 hover:shadow-sm"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg shrink-0 transition-colors",
                isDone ? "bg-success text-success-foreground" :
                isActive ? iconColorMap[phase.color] :
                "bg-muted text-muted-foreground"
              )}>
                {isDone ? <Check className="h-4 w-4" /> :
                 isLocked ? <Lock className="h-4 w-4" /> :
                 <PhaseIcon className="h-4 w-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Phase {phase.phase}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-bold uppercase text-accent animate-pulse">Active</span>
                  )}
                </div>
                <p className="text-sm font-semibold truncate">{phase.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{phase.subtitle}</p>
              </div>

              <div className="shrink-0">
                {isDone ? (
                  <span className="text-[10px] font-bold text-success">Done</span>
                ) : isLocked ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
