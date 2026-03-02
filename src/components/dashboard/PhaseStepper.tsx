import { useNavigate } from "react-router-dom";
import { useBrand } from "@/hooks/useBrand";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const PHASES = [
  { step: 1, key: "steps.p1" },
  { step: 2, key: "steps.p2" },
  { step: 3, key: "steps.p3" },
  { step: 4, key: "steps.p4" },
  { step: 5, key: "steps.p5" },
];

export function PhaseStepper() {
  const navigate = useNavigate();
  const { activeBrand } = useBrand();
  const { t } = useTranslation();
  const currentStep = activeBrand?.current_step ?? 1;

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {PHASES.map(({ step, key }, i) => {
        const done = step < currentStep;
        const active = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <button
              onClick={() => navigate(`/dashboard/step/${step}`)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                done && "text-success hover:bg-success/10",
                active && "bg-primary text-primary-foreground",
                !done && !active && "text-muted-foreground hover:bg-muted"
              )}
            >
              {done ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className={cn("h-4 w-4", active && "fill-current")} />
              )}
              <span className="hidden sm:inline">{t(key)}</span>
              <span className="sm:hidden">{step}</span>
            </button>
            {i < PHASES.length - 1 && (
              <div className={cn("mx-1 h-px w-6 shrink-0", done ? "bg-success" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
