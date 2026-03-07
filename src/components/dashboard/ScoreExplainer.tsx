import { cn } from "@/lib/utils";
import { HelpCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";

interface ScoreExplainerProps {
  score: number;
  maxScore?: number;
  label: string;
  level: string;
  levelColor: string;
  explanation: string;
  factors?: { label: string; impact: "positive" | "negative" | "neutral"; detail: string }[];
  nextStep?: string;
  className?: string;
}

/**
 * Reusable score explainer with "Why this score?" toggle.
 */
export function ScoreExplainer({
  score,
  maxScore = 100,
  label,
  level,
  levelColor,
  explanation,
  factors,
  nextStep,
  className,
}: ScoreExplainerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      {/* Score display */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", levelColor)}>
          {level}
        </span>
      </div>
      <p className="text-3xl font-bold tabular-nums font-display">
        {score}
        {maxScore !== 100 && <span className="text-base text-muted-foreground font-normal">/{maxScore}</span>}
      </p>

      {/* Explainer toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <Info className="h-3 w-3" />
        Warum dieser Score?
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>

          {factors && factors.length > 0 && (
            <div className="space-y-1.5">
              {factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className={cn(
                    "mt-0.5 h-1.5 w-1.5 rounded-full shrink-0",
                    f.impact === "positive" ? "bg-success" : f.impact === "negative" ? "bg-destructive" : "bg-muted-foreground"
                  )} />
                  <div>
                    <span className="font-medium">{f.label}:</span>{" "}
                    <span className="text-muted-foreground">{f.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {nextStep && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
              <p className="text-[11px] font-medium text-primary">
                → Nächster Schritt: {nextStep}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
