import { useState } from "react";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/command-center-types";

interface ExplainabilityPanelProps {
  reasoning: string;
  dataUsed: string[];
  confidence: RiskLevel;
  className?: string;
}

const confidenceLabel: Record<RiskLevel, string> = { low: "Hoch", medium: "Mittel", high: "Niedrig" };
const confidenceColor: Record<RiskLevel, string> = { low: "text-success", medium: "text-warning", high: "text-destructive" };

export function ExplainabilityPanel({ reasoning, dataUsed, confidence, className }: ExplainabilityPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("rounded-md border bg-muted/40 text-xs", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Brain className="h-3 w-3" />
          Warum wir das sagen
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="space-y-2 border-t px-3 py-2.5 animate-fade-in">
          <p className="text-muted-foreground">{reasoning}</p>

          <div>
            <p className="font-medium text-foreground">Verwendete Daten:</p>
            <ul className="mt-1 list-disc list-inside text-muted-foreground">
              {dataUsed.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Confidence:</span>
            <span className={cn("font-semibold", confidenceColor[confidence])}>
              {confidenceLabel[confidence]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
