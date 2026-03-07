import { useBrand } from "@/hooks/useBrand";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Target, DollarSign, Package, Shield, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL = 5;

const PHASE_ICONS = [Target, DollarSign, Package, Shield, Rocket];
const PHASE_OUTPUTS = [
  "Markenprofil",
  "Finanzmodell",
  "Produktionsplan",
  "Compliance",
  "Launch-Plan",
];

export function PhaseProgressBar() {
  const { activeBrand } = useBrand();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!activeBrand) return null;

  const current = Math.min(activeBrand.current_step, TOTAL);
  const completed = activeBrand.current_step > TOTAL;
  const pct = completed ? 100 : Math.round(((current - 1) / TOTAL) * 100);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <p className="section-label">Founder Journey</p>
        <div className="flex items-center gap-2">
          {completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success">
              <Check className="h-3 w-3" /> Abgeschlossen
            </span>
          )}
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {pct}%
          </span>
        </div>
      </div>

      {/* Phase info */}
      {!completed && (
        <p className="text-xs text-muted-foreground mb-3">
          Aktuelle Phase: <span className="font-medium text-foreground">{t(`steps.p${current}`)}</span>
          {" · "}Output: <span className="font-medium text-foreground">{PHASE_OUTPUTS[current - 1]}</span>
        </p>
      )}

      {/* Track */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden mb-5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between">
        {Array.from({ length: TOTAL }, (_, i) => {
          const step = i + 1;
          const done = step < current || completed;
          const active = step === current && !completed;
          const Icon = PHASE_ICONS[i];

          return (
            <button
              key={step}
              onClick={() => navigate(`/dashboard/step/${step}`)}
              className="group flex flex-col items-center gap-1.5 focus-ring rounded-lg"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary/15 text-primary ring-2 ring-primary/30",
                  !done && !active && "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:scale-110"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="hidden sm:flex flex-col items-center">
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight text-center max-w-[80px] transition-colors",
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {t(`steps.p${step}`)}
                </span>
                <span className="text-[9px] text-muted-foreground/60 mt-0.5">{PHASE_OUTPUTS[i]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
