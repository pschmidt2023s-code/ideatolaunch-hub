import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { LockedOverlay } from "@/components/LockedOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  ChevronRight,
  Crown,
  DollarSign,
  FileText,
  Gauge,
  HeartPulse,
  ListTodo,
  Percent,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

// ─── KPI Types ──────────────────────────────────────────────────

interface WeeklyKPI {
  revenue: number;
  margin: number;
  cashRunwayMonths: number;
  conversionRate: number;
  returnRate: number;
  inventoryValue: number;
  monthlyCosts: number;
}

interface ExecutionTask {
  id: string;
  title: string;
  done: boolean;
  priority: "high" | "medium" | "low";
}

const defaultKPIs: WeeklyKPI = {
  revenue: 8500,
  margin: 42,
  cashRunwayMonths: 4.2,
  conversionRate: 2.8,
  returnRate: 8,
  inventoryValue: 12000,
  monthlyCosts: 5200,
};

const defaultTasks: ExecutionTask[] = [
  { id: "t1", title: "Produktfotos für neuen Kanal optimieren", done: false, priority: "high" },
  { id: "t2", title: "Lieferantenangebot vergleichen", done: false, priority: "high" },
  { id: "t3", title: "Social-Media Content für nächste Woche planen", done: false, priority: "medium" },
  { id: "t4", title: "Retouren-Feedback analysieren", done: true, priority: "medium" },
  { id: "t5", title: "SEO-Keywords aktualisieren", done: false, priority: "low" },
];

// ─── Score Calculations ─────────────────────────────────────────

function calcHealthScore(kpi: WeeklyKPI): number {
  let score = 50;
  if (kpi.margin >= 50) score += 15; else if (kpi.margin >= 40) score += 10; else if (kpi.margin >= 30) score += 3; else score -= 10;
  if (kpi.cashRunwayMonths >= 6) score += 15; else if (kpi.cashRunwayMonths >= 3) score += 8; else score -= 10;
  if (kpi.conversionRate >= 3) score += 10; else if (kpi.conversionRate >= 2) score += 5; else score -= 5;
  if (kpi.returnRate <= 5) score += 10; else if (kpi.returnRate <= 12) score += 3; else score -= 10;
  return Math.max(0, Math.min(100, score));
}

function calcInventoryPressure(kpi: WeeklyKPI): number {
  if (kpi.revenue <= 0) return 100;
  const monthsOfStock = kpi.inventoryValue / (kpi.revenue * 0.6);
  if (monthsOfStock > 6) return 90;
  if (monthsOfStock > 4) return 65;
  if (monthsOfStock > 2) return 35;
  return 10;
}

function generateAlerts(kpi: WeeklyKPI): { label: string; severity: "critical" | "warning" | "info" }[] {
  const alerts: { label: string; severity: "critical" | "warning" | "info" }[] = [];
  if (kpi.cashRunwayMonths < 2) alerts.push({ label: `Cash Runway kritisch: ${kpi.cashRunwayMonths.toFixed(1)} Monate`, severity: "critical" });
  else if (kpi.cashRunwayMonths < 3) alerts.push({ label: `Cash Runway niedrig: ${kpi.cashRunwayMonths.toFixed(1)} Monate`, severity: "warning" });
  if (kpi.margin < 30) alerts.push({ label: `Marge unter 30%: ${kpi.margin}%`, severity: "critical" });
  else if (kpi.margin < 40) alerts.push({ label: `Marge unter Zielwert: ${kpi.margin}%`, severity: "warning" });
  if (kpi.conversionRate < 1.5) alerts.push({ label: `Conversion Rate Drop: ${kpi.conversionRate}%`, severity: "critical" });
  else if (kpi.conversionRate < 2) alerts.push({ label: `Conversion unter Durchschnitt: ${kpi.conversionRate}%`, severity: "warning" });
  if (kpi.returnRate > 15) alerts.push({ label: `Retourenquote kritisch: ${kpi.returnRate}%`, severity: "critical" });
  else if (kpi.returnRate > 12) alerts.push({ label: `Retouren über Zielwert: ${kpi.returnRate}%`, severity: "warning" });
  if (alerts.length === 0) alerts.push({ label: "Alle Systeme im grünen Bereich", severity: "info" });
  return alerts;
}

function getBenchmarkPercentile(value: number, type: "margin" | "runway" | "risk"): number {
  // Simulated anonymous benchmark percentiles
  const benchmarks: Record<string, { p25: number; p50: number; p75: number }> = {
    margin: { p25: 28, p50: 38, p75: 52 },
    runway: { p25: 2, p50: 4, p75: 8 },
    risk: { p25: 20, p50: 45, p75: 70 },
  };
  const b = benchmarks[type];
  if (value <= b.p25) return 25;
  if (value <= b.p50) return 50;
  if (value <= b.p75) return 75;
  return 90;
}

function getAIRecommendations(kpi: WeeklyKPI): { title: string; description: string; priority: "high" | "medium" }[] {
  const recs: { title: string; description: string; priority: "high" | "medium" }[] = [];
  if (kpi.margin < 40) recs.push({ title: "Margenoptimierung priorisieren", description: "Verhandele Einkaufspreise neu oder erhöhe den Verkaufspreis um 5-8%.", priority: "high" });
  if (kpi.cashRunwayMonths < 4) recs.push({ title: "Cashflow-Puffer aufbauen", description: "Reduziere Lagerbestand oder sichere kurzfristige Finanzierung.", priority: "high" });
  if (kpi.conversionRate < 2.5) recs.push({ title: "Conversion Rate steigern", description: "Trust-Elemente und Produktbewertungen auf der Produktseite ergänzen.", priority: "medium" });
  if (kpi.returnRate > 10) recs.push({ title: "Retourenquote senken", description: "Produktbeschreibungen präzisieren und QC verschärfen.", priority: "medium" });
  if (recs.length === 0) recs.push({ title: "Skalierung vorbereiten", description: "Deine KPIs sind solide. Fokussiere auf kontrolliertes Wachstum.", priority: "medium" });
  return recs;
}

// ─── Score Ring Component ───────────────────────────────────────

function ScoreRing({ value, size = 120, label, color }: { value: number; size?: number; label: string; color: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function ExecutionOSDashboard() {
  const { plan } = useSubscription();
  const { activeBrand } = useBrand();
  const isExecution = plan === "execution";

  const [kpis, setKpis] = useState<WeeklyKPI>(defaultKPIs);
  const [tasks, setTasks] = useState<ExecutionTask[]>(defaultTasks);
  const [kpiEditOpen, setKpiEditOpen] = useState(false);

  const healthScore = useMemo(() => calcHealthScore(kpis), [kpis]);
  const inventoryPressure = useMemo(() => calcInventoryPressure(kpis), [kpis]);
  const alerts = useMemo(() => generateAlerts(kpis), [kpis]);
  const aiRecs = useMemo(() => getAIRecommendations(kpis), [kpis]);

  const marginPercentile = useMemo(() => getBenchmarkPercentile(kpis.margin, "margin"), [kpis.margin]);
  const runwayPercentile = useMemo(() => getBenchmarkPercentile(kpis.cashRunwayMonths, "runway"), [kpis.cashRunwayMonths]);

  const executionScore = useMemo(() => {
    const done = tasks.filter((t) => t.done).length;
    return tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  }, [tasks]);

  const updateKPI = (key: keyof WeeklyKPI, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) setKpis((k) => ({ ...k, [key]: num }));
  };

  const toggleTask = (id: string) => {
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const healthColor =
    healthScore >= 70 ? "hsl(152, 60%, 40%)" :
    healthScore >= 45 ? "hsl(38, 92%, 50%)" :
    healthScore >= 25 ? "hsl(25, 90%, 50%)" : "hsl(0, 72%, 51%)";

  const riskLevel =
    healthScore >= 70 ? "Niedrig" :
    healthScore >= 45 ? "Mittel" :
    healthScore >= 25 ? "Hoch" : "Kritisch";

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-yellow-500">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Execution OS</h1>
            <p className="text-sm text-muted-foreground">Founder Operating System – Run your business like a CEO</p>
          </div>
          {isExecution && (
            <Badge className="ml-auto bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Execution
            </Badge>
          )}
        </div>

        {!isExecution && (
          <LockedOverlay feature="executionOS">
            <div className="h-[600px]" />
          </LockedOverlay>
        )}

        <div className={isExecution ? "" : "pointer-events-none opacity-50 blur-[2px]"}>
          {/* Top Row: Health Score + Revenue/Margin/Cashflow + Risk Alerts */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Business Health Score */}
            <Card className="lg:col-span-3 border-border/50 bg-card">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <ScoreRing value={healthScore} size={140} label="Business Health" color={healthColor} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    Risiko: {riskLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Center: Revenue / Margin / Cashflow Panels */}
            <div className="lg:col-span-5 grid gap-3 sm:grid-cols-2">
              {/* Revenue */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" /> Umsatz/Monat
                    </span>
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{kpis.revenue.toLocaleString("de-DE")} €</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Monatlicher Bruttoumsatz</p>
                </CardContent>
              </Card>

              {/* Margin */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Percent className="h-3.5 w-3.5" /> Marge
                    </span>
                    {kpis.margin >= 40 ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                  </div>
                  <p className="text-2xl font-bold">{kpis.margin}%</p>
                  <Progress value={kpis.margin} className="h-1.5 mt-2" />
                </CardContent>
              </Card>

              {/* Cashflow Health */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5" /> Cash Runway
                    </span>
                    <Gauge className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <p className="text-2xl font-bold">{kpis.cashRunwayMonths.toFixed(1)} Mo.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{kpis.cashRunwayMonths >= 3 ? "Gesund" : "Achtung"}</p>
                </CardContent>
              </Card>

              {/* Inventory Pressure */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" /> Lager-Druck
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{inventoryPressure}</p>
                  <Progress value={inventoryPressure} className="h-1.5 mt-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{inventoryPressure > 60 ? "Hoch – Abverkauf prüfen" : "Normal"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Risk Alerts */}
            <Card className="lg:col-span-4 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Survival Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
                      a.severity === "critical" ? "border-destructive/30 bg-destructive/5 text-destructive" :
                      a.severity === "warning" ? "border-amber-500/30 bg-amber-500/5 text-amber-600" :
                      "border-green-500/30 bg-green-500/5 text-green-600"
                    }`}
                  >
                    {a.severity === "critical" ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> :
                     a.severity === "warning" ? <Shield className="h-3.5 w-3.5 shrink-0" /> :
                     <Shield className="h-3.5 w-3.5 shrink-0" />}
                    <span className="font-medium">{a.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* KPI Input Toggle */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setKpiEditOpen(!kpiEditOpen)} className="text-xs gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              {kpiEditOpen ? "KPIs ausblenden" : "KPIs bearbeiten"}
            </Button>
          </div>

          {kpiEditOpen && (
            <Card className="border-border/50 animate-fade-in">
              <CardContent className="p-4">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {([
                    { key: "revenue", label: "Monatl. Umsatz (€)", step: "100" },
                    { key: "margin", label: "Marge (%)", step: "1" },
                    { key: "cashRunwayMonths", label: "Cash Runway (Monate)", step: "0.5" },
                    { key: "conversionRate", label: "Conversion Rate (%)", step: "0.1" },
                    { key: "returnRate", label: "Retourenquote (%)", step: "1" },
                    { key: "inventoryValue", label: "Warenwert Lager (€)", step: "100" },
                    { key: "monthlyCosts", label: "Monatl. Kosten (€)", step: "100" },
                  ] as const).map(({ key, label, step }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
                      <Input type="number" step={step} value={kpis[key]} onChange={(e) => updateKPI(key, e.target.value)} className="h-8 text-sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Tabs */}
          <Tabs defaultValue="benchmark" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="benchmark" className="text-xs gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Benchmark
              </TabsTrigger>
              <TabsTrigger value="planner" className="text-xs gap-1.5">
                <ListTodo className="h-3.5 w-3.5" />
                Execution
              </TabsTrigger>
              <TabsTrigger value="investor" className="text-xs gap-1.5">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Investor
              </TabsTrigger>
              <TabsTrigger value="copilot" className="text-xs gap-1.5">
                <Brain className="h-3.5 w-3.5" />
                AI Copilot
              </TabsTrigger>
            </TabsList>

            {/* Benchmark Engine */}
            <TabsContent value="benchmark" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Benchmark Engine
              </h2>
              <p className="text-sm text-muted-foreground">Anonymer Vergleich deiner KPIs mit anderen Gründern.</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Marge", value: kpis.margin, unit: "%", percentile: marginPercentile, desc: "vs. andere Gründer" },
                  { label: "Cash Buffer", value: kpis.cashRunwayMonths, unit: " Mo.", percentile: runwayPercentile, desc: "vs. andere Gründer" },
                  { label: "Risk Score", value: 100 - healthScore, unit: "", percentile: getBenchmarkPercentile(100 - healthScore, "risk"), desc: "Risiko-Perzentil" },
                ].map((b) => (
                  <Card key={b.label} className="border-border/50">
                    <CardContent className="p-5 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">{b.label}</p>
                      <p className="text-3xl font-bold">{typeof b.value === "number" && b.value % 1 !== 0 ? b.value.toFixed(1) : b.value}{b.unit}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${
                          b.percentile >= 75 ? "border-green-500/30 text-green-600" :
                          b.percentile >= 50 ? "border-amber-500/30 text-amber-600" :
                          "border-destructive/30 text-destructive"
                        }`}>
                          Top {100 - b.percentile}%
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Execution Planner */}
            <TabsContent value="planner" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-accent" />
                  Execution Planner
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{executionScore}%</p>
                    <p className="text-[10px] text-muted-foreground">Execution Score</p>
                  </div>
                </div>
              </div>
              <Progress value={executionScore} className="h-2" />
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="border-border/50">
                    <CardContent className="flex items-center gap-3 p-3">
                      <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} />
                      <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${
                        task.priority === "high" ? "border-destructive/30 text-destructive" :
                        task.priority === "medium" ? "border-amber-500/30 text-amber-600" :
                        "border-border text-muted-foreground"
                      }`}>
                        {task.priority === "high" ? "Hoch" : task.priority === "medium" ? "Mittel" : "Niedrig"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Investor Mode */}
            <TabsContent value="investor" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-accent" />
                Investor Mode
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Financial Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Monatlicher Umsatz", value: `${kpis.revenue.toLocaleString("de-DE")} €` },
                      { label: "Bruttomarge", value: `${kpis.margin}%` },
                      { label: "Monatliche Kosten", value: `${kpis.monthlyCosts.toLocaleString("de-DE")} €` },
                      { label: "Warenwert Lager", value: `${kpis.inventoryValue.toLocaleString("de-DE")} €` },
                      { label: "Cash Runway", value: `${kpis.cashRunwayMonths.toFixed(1)} Monate` },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center py-2">
                      <p className="text-4xl font-bold" style={{ color: healthColor }}>{healthScore}</p>
                      <p className="text-xs text-muted-foreground mt-1">Business Health Score</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risikostufe</span>
                        <Badge variant="outline" className="text-[10px]">{riskLevel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversion Rate</span>
                        <span className="font-medium">{kpis.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retourenquote</span>
                        <span className="font-medium">{kpis.returnRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Investor-Ready Report als PDF exportieren (Demnächst verfügbar)
                  </p>
                  <Button variant="outline" className="mt-3 gap-2" disabled>
                    <FileText className="h-4 w-4" />
                    PDF Export
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced AI Copilot */}
            <TabsContent value="copilot" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                Advanced AI Copilot
              </h2>
              <p className="text-sm text-muted-foreground">CEO-Level Empfehlungen basierend auf deinen aktuellen KPIs.</p>
              <div className="space-y-3">
                {aiRecs.map((rec, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        rec.priority === "high" ? "bg-destructive/10" : "bg-accent/10"
                      }`}>
                        {rec.priority === "high" ? <Zap className="h-4 w-4 text-destructive" /> : <Target className="h-4 w-4 text-accent" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{rec.title}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {rec.priority === "high" ? "Priorität 1" : "Empfehlung"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
