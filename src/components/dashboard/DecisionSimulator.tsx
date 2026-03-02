import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, TrendingDown, Clock, RotateCcw, DollarSign } from "lucide-react";
import { simulateDecision, type SimulationResult } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  { key: "ads_plus_20", label: "Ads +20%", icon: TrendingDown },
  { key: "delay_30_days", label: "Lieferzeit +30 Tage", icon: Clock },
  { key: "returns_8_pct", label: "Retouren 8%", icon: RotateCcw },
  { key: "price_minus_10", label: "Preis -10%", icon: DollarSign },
] as const;

export function DecisionSimulator() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const run = (key: string) => {
    setActiveKey(key);
    setResult(simulateDecision(key));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Beaker className="h-4 w-4 text-info" /> Decision Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              size="sm"
              variant={activeKey === key ? "default" : "outline"}
              onClick={() => run(key)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>

        {result && (
          <div className="grid grid-cols-3 gap-3 animate-fade-in">
            <ImpactCard
              label="Runway Delta"
              value={`${result.runwayDelta > 0 ? "+" : ""}${result.runwayDelta} Mo.`}
              negative={result.runwayDelta < 0}
            />
            <ImpactCard
              label="Break-even Shift"
              value={`${result.breakEvenShift > 0 ? "+" : ""}${result.breakEvenShift} Tage`}
              negative={result.breakEvenShift > 0}
            />
            <ImpactCard
              label="Profit Delta"
              value={`${result.profitDelta > 0 ? "+" : ""}${result.profitDelta.toLocaleString("de-DE")} €`}
              negative={result.profitDelta < 0}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImpactCard({ label, value, negative }: { label: string; value: string; negative: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-bold tabular-nums", negative ? "text-destructive" : "text-success")}>
        {value}
      </p>
    </div>
  );
}
