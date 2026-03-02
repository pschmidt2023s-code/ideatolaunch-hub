import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_FAILURE_COSTS } from "@/lib/command-center-types";
import { AlertOctagon, Calculator, Shield, Undo, Truck, TrendingDown } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  calculator: <Calculator className="h-5 w-5" />,
  shield: <Shield className="h-5 w-5" />,
  undo: <Undo className="h-5 w-5" />,
  truck: <Truck className="h-5 w-5" />,
  "trending-down": <TrendingDown className="h-5 w-5" />,
};

export function FailureCostCards() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertOctagon className="h-4 w-4 text-destructive" /> Typische Fehler & Kosten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_FAILURE_COSTS.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4"
            >
              <div className="flex items-center gap-2 text-destructive">
                {iconMap[f.icon] ?? <AlertOctagon className="h-5 w-5" />}
                <span className="text-lg font-bold tabular-nums">-{f.impact.toLocaleString("de-DE")} €</span>
              </div>
              <p className="text-sm font-medium">{f.mistake}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
