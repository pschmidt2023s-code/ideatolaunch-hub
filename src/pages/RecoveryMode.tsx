import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { getCapabilities } from "@/lib/feature-flags";
import { LockedOverlay } from "@/components/LockedOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIPageInsights } from "@/components/AIPageInsights";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  RotateCcw,
  Target,
  HeartPulse,
  ChevronRight,
  Package,
  DollarSign,
  ArrowDownRight,
  Lightbulb,
} from "lucide-react";
import {
  detectCrisis,
  getRecoveryPlan,
  calculateLiquidation,
  generatePivotSuggestions,
  calculateSurvivalScore,
  type BusinessMetrics,
  type RecoveryIssue,
  type RiskAlert,
} from "@/lib/recovery-engine";

const defaultMetrics: BusinessMetrics = {
  conversionRate: 1.5,
  margin: 32,
  cashRunwayMonths: 2.5,
  returnRate: 14,
  monthlyRevenue: 5000,
  monthlyCosts: 4200,
  inventoryValue: 8000,
  sellingPrice: 29.99,
  unitCost: 12,
};

const issueOptions: { value: RecoveryIssue; label: string; icon: typeof TrendingDown }[] = [
  { value: "low_traffic", label: "Wenig Traffic", icon: TrendingDown },
  { value: "low_conversion", label: "Niedrige Conversion", icon: Target },
  { value: "low_margin", label: "Niedrige Marge", icon: DollarSign },
  { value: "high_returns", label: "Hohe Retouren", icon: Package },
  { value: "high_capital_lock", label: "Hohe Kapitalbindung", icon: ArrowDownRight },
];

export default function RecoveryMode() {
  const { plan } = useSubscription();
  const { activeBrand } = useBrand();
  const { health } = useBrandHealth();
  const caps = getCapabilities(plan);
  const isPro = plan === "pro" || plan === "execution" || plan === "trading";
  const isExecution = plan === "execution" || plan === "trading";

  const [metrics, setMetrics] = useState<BusinessMetrics>(() => {
    return defaultMetrics;
  });

  const [selectedIssue, setSelectedIssue] = useState<RecoveryIssue | null>(null);

  const updateMetric = (key: keyof BusinessMetrics, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) setMetrics((m) => ({ ...m, [key]: num }));
  };

  const alerts = useMemo(() => detectCrisis(metrics), [metrics]);
  const survival = useMemo(() => calculateSurvivalScore(metrics), [metrics]);
  const recoveryPlan = useMemo(() => selectedIssue ? getRecoveryPlan(selectedIssue) : [], [selectedIssue]);
  const liquidationScenarios = useMemo(
    () => calculateLiquidation(metrics.inventoryValue, Math.round(metrics.inventoryValue / metrics.unitCost), metrics.sellingPrice, metrics.unitCost),
    [metrics],
  );
  const pivotSuggestions = useMemo(() => generatePivotSuggestions(metrics), [metrics]);

  const severityColor = (s: RiskAlert["severity"]) =>
    s === "critical" ? "text-destructive" : "text-amber-500";
  const severityBg = (s: RiskAlert["severity"]) =>
    s === "critical" ? "bg-destructive/10 border-destructive/30" : "bg-amber-500/10 border-amber-500/30";

  const survivalColor =
    survival.survivalScore >= 70 ? "text-green-600" :
    survival.survivalScore >= 45 ? "text-amber-500" :
    survival.survivalScore >= 25 ? "text-orange-500" : "text-destructive";

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <HeartPulse className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Business Recovery & Survival Mode</h1>
            <p className="text-sm text-muted-foreground">Krisenfrüherkennung, Recovery-Pläne und Überlebensstrategien</p>
          </div>
        </div>

        {plan === "free" && (
          <LockedOverlay feature="scenarioSimulator">
            <div />
          </LockedOverlay>
        )}

        <div className={plan === "free" ? "pointer-events-none opacity-50 blur-[2px]" : ""}>
          {/* Metrics Input */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Deine Geschäftskennzahlen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { key: "conversionRate", label: "Conversion Rate (%)", step: "0.1" },
                  { key: "margin", label: "Marge (%)", step: "1" },
                  { key: "cashRunwayMonths", label: "Cash Runway (Monate)", step: "0.5" },
                  { key: "returnRate", label: "Retourenquote (%)", step: "1" },
                  { key: "monthlyRevenue", label: "Monatlicher Umsatz (€)", step: "100" },
                  { key: "monthlyCosts", label: "Monatliche Kosten (€)", step: "100" },
                  { key: "inventoryValue", label: "Warenwert Lager (€)", step: "100" },
                  { key: "sellingPrice", label: "Verkaufspreis (€)", step: "0.5" },
                  { key: "unitCost", label: "Stückkosten (€)", step: "0.5" },
                ].map(({ key, label, step }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      step={step}
                      value={metrics[key as keyof BusinessMetrics]}
                      onChange={(e) => updateMetric(key as keyof BusinessMetrics, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="crisis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="crisis" className="text-xs">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Krise
              </TabsTrigger>
              <TabsTrigger value="recovery" className="text-xs">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Recovery
              </TabsTrigger>
              <TabsTrigger value="liquidation" className="text-xs">
                <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                Liquidation
              </TabsTrigger>
              <TabsTrigger value="pivot" className="text-xs">
                <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
                Pivot
              </TabsTrigger>
              <TabsTrigger value="survival" className="text-xs">
                <HeartPulse className="mr-1.5 h-3.5 w-3.5" />
                Score
              </TabsTrigger>
            </TabsList>

            {/* PART 1: Crisis Detection */}
            <TabsContent value="crisis" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Automatische Krisenfrüherkennung
              </h2>
              {alerts.length === 0 ? (
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="flex items-center gap-3 p-6">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">Keine kritischen Risiken erkannt</p>
                      <p className="text-sm text-green-600/80">Alle Kennzahlen befinden sich im gesunden Bereich.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className={`${severityBg(alert.severity)}`}>
                      <CardContent className="flex items-start gap-3 p-4">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${severityColor(alert.severity)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{alert.label}</p>
                            <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">
                              {alert.severity === "critical" ? "KRITISCH" : "WARNUNG"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Aktuell: <strong className={severityColor(alert.severity)}>{alert.value}%</strong></span>
                            <span>|</span>
                            <span>Zielwert: {alert.category === "returns" ? `<${alert.threshold}%` : `≥${alert.threshold}${alert.category === "runway" ? " Monate" : "%"}`}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PART 2: Recovery Decision Tree */}
            <TabsContent value="recovery" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-accent" />
                Recovery-Aktionsplan
              </h2>
              <p className="text-sm text-muted-foreground">Wähle dein Hauptproblem für einen personalisierten Aktionsplan:</p>
              <div className="grid gap-2 sm:grid-cols-5">
                {issueOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={selectedIssue === value ? "default" : "outline"}
                    className={`flex-col gap-1 h-auto py-3 ${selectedIssue === value ? "bg-accent text-accent-foreground" : ""}`}
                    onClick={() => setSelectedIssue(value)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px]">{label}</span>
                  </Button>
                ))}
              </div>

              {recoveryPlan.length > 0 && (
                <div className="space-y-3 mt-4">
                  {recoveryPlan.map((action, i) => (
                    <Card key={action.id}>
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          action.priority === "high" ? "bg-destructive/10 text-destructive" :
                          action.priority === "medium" ? "bg-amber-500/10 text-amber-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{action.title}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {action.priority === "high" ? "Hohe Priorität" : action.priority === "medium" ? "Mittel" : "Niedrig"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                            <span>📈 {action.estimatedImpact}</span>
                            <span>⏱ {action.timeframe}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PART 3: Liquidation Strategy */}
            <TabsContent value="liquidation" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Liquidations-Strategie
              </h2>
              <p className="text-sm text-muted-foreground">Kapitalrückgewinnung bei Überbeständen simulieren.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {liquidationScenarios.map((s) => (
                  <Card key={s.strategy}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{s.strategy}</h3>
                        <Badge variant="outline" className={`text-xs ${
                          s.capitalRecovery >= 80 ? "border-green-500/30 text-green-600" :
                          s.capitalRecovery >= 50 ? "border-amber-500/30 text-amber-600" :
                          "border-destructive/30 text-destructive"
                        }`}>
                          {s.capitalRecovery}% Recovery
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Preis/Einheit</span>
                          <span className="font-medium">{s.pricePerUnit.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Verkaufte Einheiten</span>
                          <span className="font-medium">{s.estimatedUnits}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Brutto-Erlös</span>
                          <span className="font-bold">{s.grossRevenue.toFixed(0)} €</span>
                        </div>
                        <Progress value={s.capitalRecovery} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground text-right">⏱ {s.timeframe}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* PART 4: Pivot Engine */}
            <TabsContent value="pivot" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                Pivot-Strategien
              </h2>
              <div className="space-y-3">
                {pivotSuggestions.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <ChevronRight className="h-4 w-4 mt-1 shrink-0 text-accent" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{p.title}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {p.effortLevel === "low" ? "Geringer Aufwand" : p.effortLevel === "medium" ? "Mittlerer Aufwand" : "Hoher Aufwand"}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {p.category === "audience" ? "Zielgruppe" :
                               p.category === "positioning" ? "Positionierung" :
                               p.category === "packaging" ? "Verpackung" :
                               p.category === "cost" ? "Kosten" : "Geschäftsmodell"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                          <p className="text-xs text-accent mt-2 font-medium">💡 {p.potentialImpact}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* PART 5: Survival Score */}
            <TabsContent value="survival" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-accent" />
                Survival Score
              </h2>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${survivalColor}`}>
                      {survival.survivalScore}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">von 100 Punkten</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold text-destructive">{survival.bankruptcyRisk}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Insolvenzrisiko</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{survival.recoveryProbability}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Recovery-Chance</p>
                    </div>
                    <div className={`rounded-lg border p-4 text-center ${
                      survival.recommendedPath === "optimize" ? "border-green-500/30 bg-green-500/5" :
                      survival.recommendedPath === "stabilize" ? "border-amber-500/30 bg-amber-500/5" :
                      survival.recommendedPath === "pivot" ? "border-orange-500/30 bg-orange-500/5" :
                      "border-destructive/30 bg-destructive/5"
                    }`}>
                      <p className="text-sm font-bold">{survival.pathLabel}</p>
                      <p className="text-xs text-muted-foreground mt-1">Empfohlener Weg</p>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm">{survival.pathDescription}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AIPageInsights pageContext="Recovery Mode – Cashflow-Rettung, Kostenoptimierung, Notfall-Szenarien" title="AI Recovery Insights" />
          <LegalDisclaimer type="simulation" />
        </div>
      </div>
    </DashboardLayout>
  );
}
