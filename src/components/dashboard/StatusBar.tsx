import { MetricCard } from "./MetricCard";
import { CardGrid } from "./CardGrid";
import type { StatusMetrics } from "@/lib/command-center-types";

export function StatusBar({ status }: { status: StatusMetrics }) {
  return (
    <CardGrid cols={3} className="lg:grid-cols-6">
      <MetricCard
        label="Founder Risk Index"
        value={status.founderRiskIndex}
        sub="/ 100"
        level={status.founderRiskIndex <= 30 ? "low" : status.founderRiskIndex <= 60 ? "medium" : "high"}
      />
      <MetricCard
        label="Confidence"
        value={status.confidenceScore}
        sub="/ 100"
        level={status.confidenceScore >= 70 ? "low" : status.confidenceScore >= 45 ? "medium" : "high"}
      />
      <MetricCard
        label="Risk Status"
        value={status.riskLevel === "low" ? "Low" : status.riskLevel === "medium" ? "Medium" : "High"}
        level={status.riskLevel}
      />
      <MetricCard
        label="Runway"
        value={`${status.runwayMonths} Mo.`}
        level={status.runwayMonths >= 10 ? "low" : status.runwayMonths >= 5 ? "medium" : "high"}
      />
      <MetricCard
        label="Capital Pressure"
        value={status.capitalPressure}
        sub="/ 100"
        level={status.capitalPressure <= 30 ? "low" : status.capitalPressure <= 60 ? "medium" : "high"}
      />
      <MetricCard
        label="Break-even"
        value={status.breakEvenDate}
        sub={`Stand: ${status.lastUpdated}`}
      />
    </CardGrid>
  );
}
