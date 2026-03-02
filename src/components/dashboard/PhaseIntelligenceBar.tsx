import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Shield, Wallet } from "lucide-react";
import type { PhaseIntelligence } from "@/lib/command-center-types";
import { PHASE_INTELLIGENCE } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

const levelColor = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

export function PhaseIntelligenceBar({ step }: { step: number }) {
  const intel = PHASE_INTELLIGENCE[step];
  if (!intel) return null;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <TrendingDown className={cn("h-4 w-4 mt-0.5 shrink-0", levelColor[intel.riskLevel])} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk Impact</p>
              <p className="text-sm font-medium">{intel.riskImpact}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 shrink-0 text-info" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Confidence Impact</p>
              <p className="text-sm font-medium">{intel.confidenceImpact}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Wallet className="h-4 w-4 mt-0.5 shrink-0 text-warning" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Kapital-Auswirkung</p>
              <p className="text-sm font-medium">{intel.capitalEffect}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
