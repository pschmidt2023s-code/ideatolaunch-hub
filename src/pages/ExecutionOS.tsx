import { useState, useMemo, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, BarChart3, Brain,
  BriefcaseBusiness, CalendarCheck, CheckCircle2, ChevronRight, Clock,
  Crown, DollarSign, FileText, Flame, Gauge, HeartPulse, ListTodo,
  Percent, Shield, Sparkles, Target, TrendingDown, TrendingUp, Zap,
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

// ─── Action-Driven Alerts (Part 2) ─────────────────────────────

interface ActionAlert {
  issue: string;
  action: string;
  deadline: string;
  severity: "critical" | "warning" | "info";
}

function generateActionAlerts(kpi: WeeklyKPI): ActionAlert[] {
  const alerts: ActionAlert[] = [];
  if (kpi.cashRunwayMonths < 2) alerts.push({ issue: `⛔ STOP: Cash Runway bei ${kpi.cashRunwayMonths.toFixed(1)} Monaten`, action: "Sofort alle nicht-essentiellen Ausgaben stoppen. Liquiditätspuffer aufbauen.", deadline: "Sofort", severity: "critical" });
  else if (kpi.cashRunwayMonths < 3) alerts.push({ issue: `Action Required: Runway unter 3 Monaten (${kpi.cashRunwayMonths.toFixed(1)})`, action: "Variable Kosten um 15% reduzieren oder Umsatz steigern.", deadline: "7 Tage", severity: "warning" });

  if (kpi.margin < 30) alerts.push({ issue: `⛔ STOP: Marge unter 30% (${kpi.margin}%)`, action: "Preis um 5–8% erhöhen oder Lieferantenkonditionen nachverhandeln.", deadline: "7 Tage", severity: "critical" });
  else if (kpi.margin < 40) alerts.push({ issue: `Action Required: Marge unter 40% (${kpi.margin}%)`, action: "Pricing Review durchführen. Bundle-Strategie prüfen.", deadline: "14 Tage", severity: "warning" });

  if (kpi.conversionRate < 1.5) alerts.push({ issue: `⛔ STOP: Conversion Rate bei ${kpi.conversionRate}%`, action: "Produktseite überarbeiten. Trust-Elemente und Bewertungen ergänzen.", deadline: "Sofort", severity: "critical" });
  else if (kpi.conversionRate < 2) alerts.push({ issue: `Attention: Conversion unter Benchmark (${kpi.conversionRate}%)`, action: "A/B-Test der Produktseite starten.", deadline: "14 Tage", severity: "warning" });

  if (kpi.returnRate > 15) alerts.push({ issue: `⛔ STOP: Retourenquote bei ${kpi.returnRate}%`, action: "Produktbeschreibungen und Größentabelle überarbeiten. QC verschärfen.", deadline: "Sofort", severity: "critical" });
  else if (kpi.returnRate > 12) alerts.push({ issue: `Attention: Retouren über Zielwert (${kpi.returnRate}%)`, action: "Retouren-Feedback analysieren und Ursachen abstellen.", deadline: "14 Tage", severity: "warning" });

  if (alerts.length === 0) alerts.push({ issue: "✅ Alle Systeme im grünen Bereich", action: "Kurs halten. Fokus auf kontrolliertes Wachstum.", deadline: "—", severity: "info" });
  return alerts;
}

function getBenchmarkPercentile(value: number, type: "margin" | "runway" | "risk"): number {
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

// ─── Benchmark Story (Part 4) ───────────────────────────────────

function getBenchmarkStories(kpi: WeeklyKPI, healthScore: number): string[] {
  const stories: string[] = [];
  const mp = getBenchmarkPercentile(kpi.margin, "margin");
  const rp = getBenchmarkPercentile(kpi.cashRunwayMonths, "runway");

  if (mp >= 75) stories.push(`Du bist Top ${100 - mp}% bei der Marge – besser als 3 von 4 Gründern.`);
  else if (mp <= 25) stories.push(`Deine Marge liegt im unteren Viertel. Eine Preiserhöhung von 3–5% würde dich in die Top 50% bringen.`);

  if (rp >= 75 && mp < 75) stories.push(`Dein Cash Buffer ist stark (Top ${100 - rp}%), aber deine Marge hält nicht mit. Fokus: Profitabilität.`);
  else if (rp <= 25) stories.push(`Dein Cash Buffer liegt im Bottom 50%. Wenn du den Runway auf 4 Monate erhöhst, verbessert sich dein Health Score um ca. +12.`);

  if (mp >= 75 && rp >= 75) stories.push(`Exzellent: Du gehörst zu den Top-Performern bei Marge UND Cashflow. Skalierungspotenzial ist gegeben.`);
  if (healthScore < 45) stories.push(`Dein Business Health Score (${healthScore}) liegt unter dem Median. Priorisiere: Marge stabilisieren → Runway aufbauen → dann skalieren.`);

  if (stories.length === 0) stories.push("Deine KPIs liegen im soliden Mittelfeld. Kleine Optimierungen bringen dich in die Top 25%.");
  return stories;
}

function getAIRecommendations(kpi: WeeklyKPI): { title: string; description: string; priority: "high" | "medium"; category: string }[] {
  const recs: { title: string; description: string; priority: "high" | "medium"; category: string }[] = [];
  if (kpi.margin < 40) recs.push({ title: "Margenoptimierung priorisieren", description: "Verhandele Einkaufspreise neu oder erhöhe den Verkaufspreis um 5-8%.", priority: "high", category: "Optimierung" });
  if (kpi.cashRunwayMonths < 4) recs.push({ title: "Cashflow-Puffer aufbauen", description: "Reduziere Lagerbestand oder sichere kurzfristige Finanzierung.", priority: "high", category: "Liquidität" });
  if (kpi.conversionRate < 2.5) recs.push({ title: "Conversion Rate steigern", description: "Trust-Elemente und Produktbewertungen auf der Produktseite ergänzen.", priority: "medium", category: "Optimierung" });
  if (kpi.returnRate > 10) recs.push({ title: "Retourenquote senken", description: "Produktbeschreibungen präzisieren und QC verschärfen.", priority: "medium", category: "Optimierung" });

  const monthsOfStock = kpi.inventoryValue / (kpi.revenue * 0.6 || 1);
  const profitPerMonth = kpi.revenue * (kpi.margin / 100) - kpi.monthlyCosts;

  if (kpi.margin >= 40 && kpi.conversionRate >= 2.5 && kpi.cashRunwayMonths >= 4) {
    recs.push({ title: "🚀 Scaling: Ads-Budget erhöhen", description: `Deine Marge (${kpi.margin}%) und Conversion (${kpi.conversionRate}%) sind stabil. Erhöhe Ads schrittweise um 15-20% pro Woche.`, priority: "medium", category: "Skalierung" });
  }
  if (monthsOfStock < 2 && kpi.conversionRate >= 2) {
    recs.push({ title: "🚀 Scaling: Jetzt nachbestellen", description: `Lagerreichweite nur ${monthsOfStock.toFixed(1)} Monate. Nachbestellung auslösen, um Stockouts zu vermeiden.`, priority: "high", category: "Skalierung" });
  } else if (monthsOfStock > 5) {
    recs.push({ title: "⚠️ NICHT nachproduzieren", description: `Lagerreichweite ${monthsOfStock.toFixed(1)} Monate. Fokus auf Abverkauf.`, priority: "high", category: "Skalierung" });
  }
  if (kpi.cashRunwayMonths < 3 && profitPerMonth < 0) {
    recs.push({ title: "🔒 Liquidität sichern", description: `Monatlicher Verlust: ${Math.abs(profitPerMonth).toFixed(0)} €. Variable Kosten sofort reduzieren.`, priority: "high", category: "Liquidität" });
  }
  if (kpi.conversionRate >= 3 && kpi.margin >= 45) {
    recs.push({ title: "🚀 Neuen Kanal testen", description: "Unit Economics sind solide. Zusätzlichen Verkaufskanal testen.", priority: "medium", category: "Skalierung" });
  }
  if (recs.length === 0) recs.push({ title: "Kurs halten", description: "Deine KPIs sind solide. Fokus auf kontrolliertes Wachstum.", priority: "medium", category: "Skalierung" });
  return recs;
}

// ─── Score Ring ──────────────────────────────────────────────────

function ScoreRing({ value, size = 120, label, color }: { value: number; size?: number; label: string; color: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Weekly Check-In Component (Part 3) ─────────────────────────

function WeeklyCheckIn({ kpis, onKPIUpdate, healthScore }: { kpis: WeeklyKPI; onKPIUpdate: (k: keyof WeeklyKPI, v: string) => void; healthScore: number }) {
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState("profitability");
  const [completed, setCompleted] = useState(false);
  const [streak] = useState(3); // Would be persisted

  const focusOptions = [
    { value: "profitability", label: "Profitabilität", icon: DollarSign, desc: "Marge & Unit Economics optimieren" },
    { value: "launch", label: "Launch", icon: Target, desc: "Produkt & Kanal live bringen" },
    { value: "scale", label: "Scale", icon: TrendingUp, desc: "Umsatz & Reichweite steigern" },
    { value: "survival", label: "Survival", icon: Shield, desc: "Kosten senken & Runway sichern" },
  ];

  const generatedTasks = useMemo(() => {
    const tasks: string[] = [];
    if (focus === "profitability") {
      if (kpis.margin < 45) tasks.push("Pricing Review: Top 3 Produkte auf Preiserhöhung prüfen");
      tasks.push("Lieferanten-Konditionen für nächste Bestellung verhandeln");
      tasks.push("Retourenkosten pro Produkt analysieren und Top-Verursacher fixen");
    } else if (focus === "launch") {
      tasks.push("Produktseite finalisieren und live schalten");
      tasks.push("Launch-Kampagne für Social Media vorbereiten");
      tasks.push("Erste 10 Bewertungen durch Early Adopters sammeln");
    } else if (focus === "scale") {
      tasks.push("Ads-Budget um 15% erhöhen und ROAS tracken");
      tasks.push("Neuen Verkaufskanal evaluieren (Marketplace/B2B)");
      tasks.push("Bestandsplanung für nächste 8 Wochen erstellen");
    } else {
      tasks.push("Alle nicht-essentiellen Ausgaben identifizieren und kürzen");
      tasks.push("Zahlungsziele mit Lieferanten auf 60 Tage verlängern");
      tasks.push("Lagerbestand auf Slow Mover prüfen und Abverkauf planen");
    }
    return tasks.slice(0, 3);
  }, [focus, kpis.margin]);

  if (completed) {
    return (
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-transparent shadow-lg">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-yellow-500">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold">Weekly Check-In abgeschlossen</p>
            <p className="text-sm text-muted-foreground mt-1">Execution Score: {healthScore}%</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Wochen-Streak</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{Math.round(streak / 4 * 100)}%</p>
              <p className="text-[10px] text-muted-foreground">Consistency</p>
            </div>
          </div>
          <p className="text-xs font-medium text-amber-600 italic">"Execution builds advantage."</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-transparent shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-amber-500" />
          Weekly CEO Check-In
          <Badge className="ml-auto bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
            <Flame className="h-3 w-3 mr-1" /> Streak: {streak} Wochen
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress steps */}
        <div className="flex items-center gap-2 text-[10px]">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step > s ? "bg-amber-500 text-white" : step === s ? "border-2 border-amber-500 text-amber-500" : "border border-border text-muted-foreground"
              }`}>{step > s ? "✓" : s}</div>
              {s < 3 && <div className={`w-8 h-px ${step > s ? "bg-amber-500" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Schritt 1: KPIs aktualisieren</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                { key: "revenue" as const, label: "Umsatz (€)", step: "100" },
                { key: "margin" as const, label: "Marge (%)", step: "1" },
                { key: "cashRunwayMonths" as const, label: "Runway (Monate)", step: "0.5" },
              ]).map(({ key, label, step: s }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
                  <Input type="number" step={s} value={kpis[key]} onChange={(e) => onKPIUpdate(key, e.target.value)} className="h-8 text-sm" />
                </div>
              ))}
            </div>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600" onClick={() => setStep(2)}>
              Weiter <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Schritt 2: Wochenfokus wählen</p>
            <RadioGroup value={focus} onValueChange={setFocus} className="grid gap-2 sm:grid-cols-2">
              {focusOptions.map((opt) => (
                <label key={opt.value} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                  focus === opt.value ? "border-amber-500/50 bg-amber-500/5" : "border-border/50 hover:border-border"
                }`}>
                  <RadioGroupItem value={opt.value} />
                  <opt.icon className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>Zurück</Button>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600" onClick={() => setStep(3)}>
                Weiter <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Schritt 3: Deine 3 Priority Tasks</p>
            <div className="space-y-2">
              {generatedTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-600">{i + 1}</div>
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>Zurück</Button>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600" onClick={() => setCompleted(true)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Check-In abschließen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function ExecutionOSDashboard() {
  const { plan } = useSubscription();
  const { activeBrand } = useBrand();
  const isExecution = plan === "execution";
  const isPro = plan === "pro" || isExecution;

  const [kpis, setKpis] = useState<WeeklyKPI>(defaultKPIs);
  const [tasks, setTasks] = useState<ExecutionTask[]>(defaultTasks);
  const [kpiEditOpen, setKpiEditOpen] = useState(false);
  const [lastUpdate] = useState(new Date());

  const healthScore = useMemo(() => calcHealthScore(kpis), [kpis]);
  const inventoryPressure = useMemo(() => calcInventoryPressure(kpis), [kpis]);
  const actionAlerts = useMemo(() => generateActionAlerts(kpis), [kpis]);
  const aiRecs = useMemo(() => getAIRecommendations(kpis), [kpis]);
  const benchmarkStories = useMemo(() => getBenchmarkStories(kpis, healthScore), [kpis, healthScore]);

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

  const riskTrend = healthScore >= 60 ? "up" : healthScore >= 40 ? "stable" : "down";

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">

        {/* ═══ PART 1: HEADER — CEO MODE ═══ */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-yellow-500 shadow-lg shadow-amber-500/20">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Execution OS
              {isExecution && <Crown className="h-4 w-4 text-amber-500" />}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isExecution ? "For founders with real capital at risk." : "Founder Operating System – Run your business like a CEO"}
            </p>
          </div>
          {isExecution && (
            <Badge className="ml-auto bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0 text-xs shadow-md shadow-amber-500/20">
              <Crown className="h-3 w-3 mr-1" />
              Execution OS – CEO Mode
            </Badge>
          )}
        </div>

        {!isPro && (
          <LockedOverlay feature="executionOS">
            <div className="h-[600px]" />
          </LockedOverlay>
        )}

        <div className={isPro ? "" : "pointer-events-none opacity-50 blur-[2px]"}>

          {/* ═══ PART 1: STICKY HEALTH BAR (Execution only) ═══ */}
          {isExecution && (
            <div className="sticky top-0 z-20 -mx-4 px-4 py-2.5 mb-4 rounded-b-xl border-b border-amber-500/20 bg-card/95 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${healthColor}15` }}>
                      <HeartPulse className="h-5 w-5" style={{ color: healthColor }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold" style={{ color: healthColor }}>{healthScore}</span>
                        <span className="text-[10px] text-muted-foreground">/100</span>
                        {riskTrend === "up" && <ArrowUp className="h-3.5 w-3.5 text-green-500" />}
                        {riskTrend === "down" && <ArrowDown className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Business Health</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-border" />

                  <Badge variant="outline" className={`text-[10px] ${
                    riskLevel === "Niedrig" ? "border-green-500/30 text-green-600" :
                    riskLevel === "Mittel" ? "border-amber-500/30 text-amber-600" :
                    riskLevel === "Hoch" ? "border-orange-500/30 text-orange-600" :
                    "border-destructive/30 text-destructive"
                  }`}>
                    Risk: {riskLevel}
                  </Badge>

                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lastUpdate.toLocaleDateString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Top Row: Health Score + KPIs + Alerts */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Business Health Score */}
            <Card className={`lg:col-span-3 ${isExecution ? "border-amber-500/15 bg-gradient-to-br from-amber-500/[0.03] to-transparent shadow-lg shadow-amber-500/5 backdrop-blur-sm" : "border-border/50 bg-card"}`}>
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

            {/* Center: Revenue / Margin / Cashflow / Inventory */}
            <div className="lg:col-span-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Umsatz/Monat", icon: DollarSign, value: `${kpis.revenue.toLocaleString("de-DE")} €`, trend: true, sub: "Monatlicher Bruttoumsatz" },
                { label: "Marge", icon: Percent, value: `${kpis.margin}%`, trend: kpis.margin >= 40, sub: kpis.margin < 40 ? "Unter Zielwert" : "Im Zielbereich" },
                { label: "Cash Runway", icon: HeartPulse, value: `${kpis.cashRunwayMonths.toFixed(1)} Mo.`, trend: kpis.cashRunwayMonths >= 3, sub: kpis.cashRunwayMonths >= 3 ? "Gesund" : "Achtung" },
                { label: "Lager-Druck", icon: Activity, value: `${inventoryPressure}`, trend: inventoryPressure <= 60, sub: inventoryPressure > 60 ? "Hoch – Abverkauf prüfen" : "Normal" },
              ].map((item) => (
                <Card key={item.label} className={`${isExecution ? "border-amber-500/10 shadow-sm" : "border-border/50"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <item.icon className="h-3.5 w-3.5" /> {item.label}
                      </span>
                      {item.trend ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{item.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right: Action-Driven Alerts (Part 2) */}
            <Card className={`lg:col-span-4 ${isExecution ? "border-amber-500/15 shadow-lg shadow-amber-500/5" : "border-border/50"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  {isExecution ? "Action Center" : "Survival Monitoring"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {actionAlerts.map((a, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 text-xs space-y-1.5 ${
                      a.severity === "critical" ? "border-destructive/30 bg-destructive/5" :
                      a.severity === "warning" ? "border-amber-500/30 bg-amber-500/5" :
                      "border-green-500/30 bg-green-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {a.severity === "critical" ? <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" /> :
                       a.severity === "warning" ? <Shield className="h-3.5 w-3.5 text-amber-600 shrink-0" /> :
                       <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                      <span className={`font-semibold ${
                        a.severity === "critical" ? "text-destructive" : a.severity === "warning" ? "text-amber-600" : "text-green-600"
                      }`}>{a.issue}</span>
                    </div>
                    {isExecution && a.severity !== "info" && (
                      <>
                        <p className="text-muted-foreground pl-5">→ {a.action}</p>
                        <p className="text-muted-foreground pl-5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Deadline: {a.deadline}
                        </p>
                      </>
                    )}
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
                    { key: "revenue" as const, label: "Monatl. Umsatz (€)", step: "100" },
                    { key: "margin" as const, label: "Marge (%)", step: "1" },
                    { key: "cashRunwayMonths" as const, label: "Cash Runway (Monate)", step: "0.5" },
                    { key: "conversionRate" as const, label: "Conversion Rate (%)", step: "0.1" },
                    { key: "returnRate" as const, label: "Retourenquote (%)", step: "1" },
                    { key: "inventoryValue" as const, label: "Warenwert Lager (€)", step: "100" },
                    { key: "monthlyCosts" as const, label: "Monatl. Kosten (€)", step: "100" },
                  ]).map(({ key, label, step: s }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
                      <Input type="number" step={s} value={kpis[key]} onChange={(e) => updateKPI(key, e.target.value)} className="h-8 text-sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ PART 3: WEEKLY CHECK-IN (Execution only) ═══ */}
          {isExecution ? (
            <WeeklyCheckIn kpis={kpis} onKPIUpdate={updateKPI} healthScore={healthScore} />
          ) : (
            <LockedOverlay feature="executionOS" message="Weekly CEO Check-In – Nur im Execution OS">
              <div className="h-48 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Weekly CEO Check-In</p>
              </div>
            </LockedOverlay>
          )}

          {/* Bottom Tabs */}
          <Tabs defaultValue="benchmark" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="benchmark" className="text-xs gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Benchmark</TabsTrigger>
              <TabsTrigger value="planner" className="text-xs gap-1.5"><ListTodo className="h-3.5 w-3.5" /> Execution</TabsTrigger>
              <TabsTrigger value="investor" className="text-xs gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5" /> Investor</TabsTrigger>
              <TabsTrigger value="copilot" className="text-xs gap-1.5"><Brain className="h-3.5 w-3.5" /> AI Copilot</TabsTrigger>
            </TabsList>

            {/* ═══ PART 4: BENCHMARK WITH STORY MODE ═══ */}
            <TabsContent value="benchmark" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" /> Benchmark Engine
              </h2>
              <p className="text-sm text-muted-foreground">Anonymer Vergleich deiner KPIs mit anderen Gründern.</p>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Marge", value: kpis.margin, unit: "%", percentile: marginPercentile, desc: "vs. andere Gründer" },
                  { label: "Cash Buffer", value: kpis.cashRunwayMonths, unit: " Mo.", percentile: runwayPercentile, desc: "vs. andere Gründer" },
                  { label: "Risk Score", value: 100 - healthScore, unit: "", percentile: getBenchmarkPercentile(100 - healthScore, "risk"), desc: "Risiko-Perzentil" },
                ].map((b) => (
                  <Card key={b.label} className={`${isExecution ? "border-amber-500/15" : "border-border/50"}`}>
                    <CardContent className="p-5 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">{b.label}</p>
                      <p className="text-3xl font-bold">{typeof b.value === "number" && b.value % 1 !== 0 ? b.value.toFixed(1) : b.value}{b.unit}</p>
                      <Badge variant="outline" className={`text-[10px] ${
                        b.percentile >= 75 ? "border-green-500/30 text-green-600" :
                        b.percentile >= 50 ? "border-amber-500/30 text-amber-600" :
                        "border-destructive/30 text-destructive"
                      }`}>Top {100 - b.percentile}%</Badge>
                      <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Story Mode — Execution only */}
              {isExecution ? (
                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Strategische Einordnung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {benchmarkStories.map((story, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-600 mt-0.5">{i + 1}</div>
                        <p className="text-muted-foreground leading-relaxed">{story}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <LockedOverlay feature="benchmarkEngine" message="Benchmark Story Mode – Nur im Execution OS">
                  <div className="h-32 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Strategische Einordnung</p>
                  </div>
                </LockedOverlay>
              )}
            </TabsContent>

            {/* Execution Planner */}
            <TabsContent value="planner" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-accent" /> Execution Planner
                </h2>
                <div className="text-right">
                  <p className="text-2xl font-bold">{executionScore}%</p>
                  <p className="text-[10px] text-muted-foreground">Execution Score</p>
                </div>
              </div>
              <Progress value={executionScore} className="h-2" />
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="border-border/50">
                    <CardContent className="flex items-center gap-3 p-3">
                      <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} />
                      <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                      <Badge variant="outline" className={`text-[10px] ${
                        task.priority === "high" ? "border-destructive/30 text-destructive" :
                        task.priority === "medium" ? "border-amber-500/30 text-amber-600" :
                        "border-border text-muted-foreground"
                      }`}>{task.priority === "high" ? "Hoch" : task.priority === "medium" ? "Mittel" : "Niedrig"}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ═══ PART 5: INVESTOR MODE WITH 1-PAGE SUMMARY ═══ */}
            <TabsContent value="investor" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-accent" /> Investor Mode
              </h2>

              {/* 1-Page Summary (Execution only) */}
              {isExecution && (
                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] to-transparent shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-500" /> 1-Page Investor Summary
                      </CardTitle>
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">CEO View</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Brand</p>
                        <p className="text-lg font-bold">{activeBrand?.name || "Meine Marke"}</p>
                      </div>
                      {[
                        { label: "Revenue", value: `${kpis.revenue.toLocaleString("de-DE")} €/mo` },
                        { label: "Margin", value: `${kpis.margin}%` },
                        { label: "Monthly Costs", value: `${kpis.monthlyCosts.toLocaleString("de-DE")} €` },
                        { label: "Cash Runway", value: `${kpis.cashRunwayMonths.toFixed(1)} Monate` },
                        { label: "Risk Level", value: riskLevel },
                      ].map((r) => (
                        <div key={r.label} className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</p>
                          <p className="text-lg font-bold">{r.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-500/10">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Key Recommendation</p>
                      <p className="text-sm text-muted-foreground">{aiRecs[0]?.description || "KPIs stabil. Kontrolliertes Wachstum fortsetzen."}</p>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/5" disabled>
                        <FileText className="h-4 w-4" />
                        Download Investor Report (Coming Soon)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Financial Overview</CardTitle></CardHeader>
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
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Risk Assessment</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center py-2">
                      <p className="text-4xl font-bold" style={{ color: healthColor }}>{healthScore}</p>
                      <p className="text-xs text-muted-foreground mt-1">Business Health Score</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Risikostufe</span><Badge variant="outline" className="text-[10px]">{riskLevel}</Badge></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Conversion Rate</span><span className="font-medium">{kpis.conversionRate}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Retourenquote</span><span className="font-medium">{kpis.returnRate}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Copilot */}
            <TabsContent value="copilot" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" /> Advanced AI Copilot & Scaling Mode
              </h2>
              <p className="text-sm text-muted-foreground">CEO-Level Empfehlungen + Skalierungsentscheidungen basierend auf deinen KPIs.</p>

              {["Skalierung", "Optimierung", "Liquidität"].map((cat) => {
                const catRecs = aiRecs.filter((r) => r.category === cat);
                if (catRecs.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-2">
                      {cat === "Skalierung" ? "🚀" : cat === "Liquidität" ? "🔒" : "⚡"} {cat}
                    </h3>
                    {catRecs.map((rec, i) => (
                      <Card key={i} className={`${isExecution ? "border-amber-500/10" : "border-border/50"}`}>
                        <CardContent className="flex items-start gap-3 p-4">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${rec.priority === "high" ? "bg-destructive/10" : "bg-accent/10"}`}>
                            {rec.priority === "high" ? <Zap className="h-4 w-4 text-destructive" /> : <Target className="h-4 w-4 text-accent" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{rec.title}</p>
                              <Badge variant="outline" className="text-[10px]">{rec.priority === "high" ? "Priorität 1" : "Empfehlung"}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        {/* Execution OS Roadmap */}
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-card/80 backdrop-blur-sm p-6 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Execution OS Roadmap – What's Next
            </h2>
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">Coming Soon</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Execution evolves continuously. These features are in development.</p>

          <div className="flex items-center gap-1 mb-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">Q2</span>
            <div className="flex-1 h-px bg-border" />
            <span className="px-2 py-0.5 rounded bg-muted">Q3</span>
            <div className="flex-1 h-px bg-border" />
            <span className="px-2 py-0.5 rounded bg-muted">Q4</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Failure Simulator", tag: "Growth Engine", release: "Q2", desc: "Simulate 3 typical founder mistakes in seconds. See how wrong MOQ, pricing, or return rates impact your capital.", cta: "Execution Members get early access." },
              { title: "Founder Risk Profile", tag: "Personalization", release: "Q2", desc: "Choose your founder risk style: conservative, balanced, aggressive. Execution OS adapts recommendations to your profile.", cta: "Personalized strategy layer." },
              { title: "Protection Layer", tag: "Risk Shield", release: "Q3", desc: "Production contract checklist. Quality control reminders. Payment condition negotiation guidance.", cta: "Enterprise-level protection for founders." },
              { title: "Working Capital Engine", tag: "Capital Intelligence", release: "Q4", desc: "Capital binding analysis. Reorder timing optimizer. Liquidity gap forecasting.", cta: "Advanced capital forecasting system." },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl border p-5 space-y-3 transition-all ${isExecution ? "border-amber-500/20 bg-amber-500/[0.03] shadow-sm" : "border-border/50 bg-card/50"}`}>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">{item.tag}</Badge>
                  <span className="text-[10px] font-semibold text-muted-foreground">{item.release}</span>
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                <p className="text-[10px] font-medium text-amber-600">{item.cta}</p>
              </div>
            ))}
          </div>

          {/* ═══ PART 6: COMMITMENT FOOTER ═══ */}
          <p className="mt-6 text-[11px] text-muted-foreground text-center leading-relaxed">
            Execution OS is built for serious founders.<br />
            Execution OS continuously evolves to protect your capital.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
