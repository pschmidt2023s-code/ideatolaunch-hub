import { useBrand } from "@/hooks/useBrand";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL = 5;

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
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Founder Journey</p>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden mb-5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between">
        {Array.from({ length: TOTAL }, (_, i) => {
          const step = i + 1;
          const done = step < current || completed;
          const active = step === current && !completed;

          return (
            <button
              key={step}
              onClick={() => navigate(`/dashboard/step/${step}`)}
              className="group flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  done && "bg-accent text-accent-foreground",
                  active && "bg-accent/15 text-accent ring-2 ring-accent/30",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight text-center max-w-[72px] hidden sm:block",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t(`steps.p${step}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
