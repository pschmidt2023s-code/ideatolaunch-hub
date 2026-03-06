import { AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionPressureBannerProps {
  runwayMonths: number;
}

export function ExecutionPressureBanner({ runwayMonths }: ExecutionPressureBannerProps) {
  if (runwayMonths >= 4) return null;

  const isCritical = runwayMonths < 2;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex items-center gap-4 animate-fade-in",
        isCritical
          ? "bg-destructive/10 border-destructive/30 text-destructive"
          : "bg-warning/10 border-warning/30 text-warning"
      )}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
        isCritical ? "bg-destructive/20" : "bg-warning/20"
      )}>
        {isCritical ? <AlertTriangle className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
      </div>
      <div>
        <p className="text-sm font-semibold">
          {isCritical ? "🔴 Kritischer Kapitalstatus" : "🟡 Execution Pressure Mode aktiv"}
        </p>
        <p className="text-xs opacity-80 mt-0.5">
          {isCritical
            ? `Nur noch ${runwayMonths} Monate Runway. Sofortige Maßnahmen zur Kapitalerhaltung erforderlich.`
            : `${runwayMonths} Monate Runway. Fokus auf umsatzgenerierende Aufgaben empfohlen.`}
        </p>
      </div>
    </div>
  );
}
