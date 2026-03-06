import { useState } from "react";
import { ChevronDown, ChevronUp, Brain, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/command-center-types";

interface ExplainabilityPanelProps {
  reasoning: string;
  dataUsed: string[];
  confidence: RiskLevel;
  className?: string;
}

const confidenceLabel: Record<RiskLevel, string> = { low: "Hoch", medium: "Mittel", high: "Niedrig" };
const confidenceStyle: Record<RiskLevel, string> = {
  low: "text-success bg-success/10",
  medium: "text-warning bg-warning/10",
  high: "text-destructive bg-destructive/10",
};

export function ExplainabilityPanel({ reasoning, dataUsed, confidence, className }: ExplainabilityPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("rounded-xl border bg-muted/30 text-xs overflow-hidden", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5" />
          <span className="font-medium">Warum wir das sagen</span>
        </span>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", confidenceStyle[confidence])}>
            {confidenceLabel[confidence]}
          </span>
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t px-4 py-3 animate-fade-in">
          <p className="text-muted-foreground leading-relaxed">{reasoning}</p>

          <div>
            <p className="font-medium text-foreground mb-1.5">Verwendete Daten:</p>
            <div className="grid gap-1">
              {dataUsed.map((d, i) => {
                const isPresent = d.startsWith("✓");
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    {isPresent ? (
                      <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={cn(isPresent ? "text-foreground" : "text-muted-foreground/60")}>
                      {d.replace(/^[✓✗]\s*/, "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
