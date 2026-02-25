import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getCapabilities, getFeatureAccess, type FeatureKey } from "@/lib/feature-flags";

const ALL_FEATURES: FeatureKey[] = [
  "insights", "pdfExport", "budgetPlanner", "scenarioSimulator",
  "supplierMatching", "supplierInsights", "guidedFounderMode",
  "adaptiveRoadmap", "executionReadiness", "riskDashboard", "fullRealityCheck",
];

export default function DebugGating() {
  const { user } = useAuth();
  const { plan, loading } = useSubscription();
  const caps = getCapabilities(plan);

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background p-6 font-mono text-sm max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Debug: Gating</h1>

      <div className="rounded-lg border bg-card p-4 mb-6 space-y-2">
        <div><span className="text-muted-foreground">User:</span> {user?.email ?? "not logged in"}</div>
        <div><span className="text-muted-foreground">User ID:</span> {user?.id?.slice(0, 12) ?? "—"}</div>
        <div><span className="text-muted-foreground">Plan:</span> <span className="font-bold text-accent">{plan}</span></div>
      </div>

      <div className="rounded-lg border bg-card p-4 mb-6">
        <h2 className="font-semibold mb-3">Capabilities</h2>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(caps).map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground">{key}</span>
              <span className={val ? "text-green-500" : "text-destructive"}>{val ? "✓" : "✗"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3">Feature Access</h2>
        <div className="space-y-1">
          {ALL_FEATURES.map((f) => {
            const access = getFeatureAccess(f, plan);
            const color = access === "enabled" ? "text-green-500" : access === "preview" ? "text-yellow-500" : "text-destructive";
            return (
              <div key={f} className="flex justify-between">
                <span className="text-muted-foreground">{f}</span>
                <span className={`font-medium ${color}`}>{access}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
