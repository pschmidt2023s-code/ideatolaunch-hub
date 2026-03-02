import { MetricCard } from "./MetricCard";
import { CardGrid } from "./CardGrid";
import type { StatusMetrics } from "@/lib/command-center-types";

export function StatusBar({ status }: { status: StatusMetrics }) {
  return (
    <CardGrid cols={4}>
      <MetricCard
        label="Confidence Score"
        value={status.confidenceScore}
        sub="/ 100"
        level={status.confidenceScore >= 70 ? "low" : status.confidenceScore >= 45 ? "medium" : "high"}
      />
      <MetricCard
        label="Risk Level"
        value={status.riskLevel === "low" ? "Low" : status.riskLevel === "medium" ? "Medium" : "High"}
        level={status.riskLevel}
      />
      <MetricCard
        label="Runway"
        value={`${status.runwayMonths} Mo.`}
        level={status.runwayMonths >= 10 ? "low" : status.runwayMonths >= 5 ? "medium" : "high"}
      />
      <MetricCard
        label="Break-even"
        value={status.breakEvenDate}
        sub={`Stand: ${status.lastUpdated}`}
      />
    </CardGrid>
  );
}
