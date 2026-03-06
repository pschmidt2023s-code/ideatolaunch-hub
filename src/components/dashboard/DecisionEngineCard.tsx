import { Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DecisionSuggestion {
  action: string;
  impact: string;
  route?: string;
}

const MOCK_DECISIONS: DecisionSuggestion[] = [
  { action: "Erhöhe Verkaufspreis um 4 €", impact: "Marge steigt auf 42%", route: "/dashboard/step/2" },
  { action: "Zweiten Lieferanten evaluieren", impact: "Lieferrisiko sinkt um 35%", route: "/dashboard/step/3" },
  { action: "Retourenquote unter 5% bringen", impact: "+1.200 € Jahresprofit", route: "/dashboard/step/5" },
];

export function DecisionEngineCard() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
        <Lightbulb className="h-4 w-4 text-accent" />
        Decision Engine
      </h3>

      <div className="space-y-4">
        {MOCK_DECISIONS.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl bg-muted/50 p-4 hover:bg-muted/80 transition-colors cursor-pointer"
            onClick={() => d.route && navigate(d.route)}
          >
            <div>
              <p className="text-sm font-medium">{d.action}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{d.impact}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
