import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskItem, RiskLevel } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

const dot: Record<RiskLevel, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
};

export function RiskCard({ risks }: { risks: RiskItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-warning" /> Risk
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn("h-2 w-2 rounded-full shrink-0", dot[r.level])} />
              <span className="text-sm truncate">{r.title}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-destructive shrink-0">
              -{r.impact.toLocaleString("de-DE")} €
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
