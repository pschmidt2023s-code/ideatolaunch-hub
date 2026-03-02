import { useState } from "react";
import { MetricCard } from "./MetricCard";
import { CardGrid } from "./CardGrid";
import { METRIC_EXPLANATIONS } from "@/lib/intelligenceEngine";
import type { StatusMetrics } from "@/lib/command-center-types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

function MetricTooltip({ metricKey }: { metricKey: string }) {
  const [open, setOpen] = useState(false);
  const explanation = METRIC_EXPLANATIONS[metricKey];
  if (!explanation) return null;

  if (open) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col rounded-lg border bg-popover p-3 shadow-lg animate-in fade-in-0 zoom-in-95">
        <button onClick={() => setOpen(false)} className="absolute right-2 top-2 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
        <p className="text-xs font-semibold">{explanation.title}</p>
        <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">{explanation.description}</p>
        <ul className="mt-1.5 space-y-0.5">
          {explanation.factors.map((f, i) => (
            <li key={i} className="text-[10px] text-muted-foreground">• {f}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            className="absolute right-2 top-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Warum dieser Wert?
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function StatusBar({ status }: { status: StatusMetrics }) {
  return (
    <CardGrid cols={3} className="lg:grid-cols-6">
      <div className="relative">
        <MetricCard
          label="Founder Risk Index"
          value={status.founderRiskIndex}
          sub="/ 100"
          level={status.founderRiskIndex <= 30 ? "high" : status.founderRiskIndex <= 60 ? "medium" : "low"}
        />
        <MetricTooltip metricKey="founderRiskIndex" />
      </div>
      <div className="relative">
        <MetricCard
          label="Confidence"
          value={status.confidenceScore}
          sub="/ 100"
          level={status.confidenceScore >= 70 ? "low" : status.confidenceScore >= 45 ? "medium" : "high"}
        />
        <MetricTooltip metricKey="confidenceScore" />
      </div>
      <div className="relative">
        <MetricCard
          label="Risk Status"
          value={status.riskLevel === "low" ? "Low" : status.riskLevel === "medium" ? "Medium" : "High"}
          level={status.riskLevel}
        />
        <MetricTooltip metricKey="riskStatus" />
      </div>
      <div className="relative">
        <MetricCard
          label="Runway"
          value={`${status.runwayMonths} Mo.`}
          level={status.runwayMonths >= 10 ? "low" : status.runwayMonths >= 5 ? "medium" : "high"}
        />
        <MetricTooltip metricKey="runway" />
      </div>
      <div className="relative">
        <MetricCard
          label="Capital Pressure"
          value={status.capitalPressure}
          sub="/ 100"
          level={status.capitalPressure <= 30 ? "low" : status.capitalPressure <= 60 ? "medium" : "high"}
        />
        <MetricTooltip metricKey="capitalPressure" />
      </div>
      <div className="relative">
        <MetricCard
          label="Break-even"
          value={status.breakEvenDate}
          sub={`Stand: ${status.lastUpdated}`}
        />
        <MetricTooltip metricKey="breakEven" />
      </div>
    </CardGrid>
  );
}
