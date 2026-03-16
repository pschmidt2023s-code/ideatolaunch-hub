import { useNavigate } from "react-router-dom";
import { useBrand } from "@/hooks/useBrand";
import { JOURNEY_PHASES } from "@/lib/journey-phases";
import { Check, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, { border: string; bg: string; icon: string }> = {
  info:    { border: "border-info/30",    bg: "bg-info/5",    icon: "bg-info text-info-foreground" },
  accent:  { border: "border-accent/30",  bg: "bg-accent/5",  icon: "bg-accent text-accent-foreground" },
  warning: { border: "border-warning/30", bg: "bg-warning/5", icon: "bg-warning text-warning-foreground" },
  success: { border: "border-success/30", bg: "bg-success/5", icon: "bg-success text-success-foreground" },
  primary: { border: "border-primary/30", bg: "bg-primary/5", icon: "bg-primary text-primary-foreground" },
};

export function JourneyOverview() {
  const navigate = useNavigate();
  const { activeBrand } = useBrand();
  const currentStep = activeBrand?.current_step ?? 1;
  const completed = currentStep > 5;
  const pct = completed ? 100 : Math.round(((currentStep - 1) / 5) * 100);

  return (
    <div className="space-y-5">
      {/* Progress card */}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight">Gründer-Journey</h2>
            {!completed && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Phase {Math.min(currentStep, 5)} von 5 · <span className="font-medium text-foreground">{JOURNEY_PHASES[Math.min(currentStep, 5) - 1]?.title}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success">
                <Check className="h-3 w-3" /> Abgeschlossen
              </span>
            )}
            <div className="text-right">
              <span className="text-2xl font-bold tabular-nums tracking-tight">{pct}</span>
              <span className="text-xs font-medium text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => {
            const isDone = i < currentStep || completed;
            const isActive = i === Math.min(currentStep, 5) && !completed;
            return (
              <div key={i} className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    isDone ? "bg-accent w-full" :
                    isActive ? "bg-accent/50 w-1/2" :
                    "w-0"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Phase labels under segments */}
        <div className="flex gap-1 mt-1.5">
          {JOURNEY_PHASES.map((phase) => {
            const isDone = phase.phase < currentStep || completed;
            const isActive = phase.phase === Math.min(currentStep, 5) && !completed;
            return (
              <div key={phase.phase} className="flex-1 text-center">
                <span className={cn(
                  "text-[9px] font-medium leading-none",
                  isDone ? "text-accent" : isActive ? "text-foreground" : "text-muted-foreground/40"
                )}>
                  P{phase.phase}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase cards */}
      <div className="grid gap-3 sm:grid-cols-1">
        {JOURNEY_PHASES.map((phase, idx) => {
          const isDone = phase.phase < currentStep || completed;
          const isActive = phase.phase === Math.min(currentStep, 5) && !completed;
          const isLocked = phase.phase > currentStep && !completed;
          const PhaseIcon = phase.icon;
          const colors = COLOR_MAP[phase.color] || COLOR_MAP.primary;

          return (
            <button
              key={phase.phase}
              onClick={() => navigate(`/dashboard/journey/${phase.phase}`)}
              className={cn(
                "w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 group",
                isActive && [colors.border, colors.bg],
                isDone && "border-success/20 bg-success/5 hover:bg-success/8",
                isLocked && "opacity-40 border-border bg-card cursor-default",
                !isActive && !isDone && !isLocked && "border-border bg-card hover:border-accent/20 hover:shadow-md hover:-translate-y-0.5"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-all duration-200",
                isDone ? "bg-success text-success-foreground" :
                isActive ? colors.icon :
                "bg-muted text-muted-foreground"
              )}>
                {isDone ? <Check className="h-5 w-5" /> :
                 isLocked ? <Lock className="h-4 w-4" /> :
                 <PhaseIcon className="h-5 w-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Phase {phase.phase}
                  </span>
                  {isActive && (
                    <span className="inline-flex h-4 items-center rounded-full bg-accent/20 px-1.5 text-[9px] font-bold text-accent animate-pulse">
                      AKTIV
                    </span>
                  )}
                  {isDone && (
                    <span className="inline-flex h-4 items-center rounded-full bg-success/20 px-1.5 text-[9px] font-bold text-success">
                      FERTIG
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold">{phase.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{phase.subtitle} · {phase.modules.length} Tools</p>
              </div>

              {!isLocked && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 shrink-0 transition-all" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
