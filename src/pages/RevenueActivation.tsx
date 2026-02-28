import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Zap, Target, Calculator, Rocket, Package,
  AlertTriangle, CheckCircle, TrendingUp, ShieldAlert, DollarSign,
} from "lucide-react";

// ─── Offer Positioning Engine ───────────────────────────────────

function OfferPositioningEngine({ plan, isBuilder, isPro, isExecution }: { plan: string; isBuilder: boolean; isPro: boolean; isExecution: boolean }) {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const [price, setPrice] = useState("");
  const [cogs, setCogs] = useState("");
  const [competitorPrice, setCompetitorPrice] = useState("");
  const [positioning, setPositioning] = useState("mid");
  const [result, setResult] = useState<null | {
    positioningStrength: number;
    priceCompetitiveness: number;
    differentiationClarity: number;
    marginSafety: number;
    riskLevel: "safe" | "warning" | "critical";
    suggestions: string[];
    capitalWarning?: string;
  }>(null);

  const calculate = () => {
    const p = parseFloat(price) || 0;
    const c = parseFloat(cogs) || 0;
    const comp = parseFloat(competitorPrice) || 0;
    if (!p || !c) return;

    const margin = ((p - c) / p) * 100;
    const priceRatio = comp ? p / comp : 1;

    // Scores
    let priceCompetitiveness = 50;
    if (positioning === "budget") priceCompetitiveness = priceRatio < 0.9 ? 85 : priceRatio < 1.1 ? 60 : 30;
    else if (positioning === "mid") priceCompetitiveness = priceRatio > 0.8 && priceRatio < 1.2 ? 75 : 45;
    else priceCompetitiveness = priceRatio > 1.1 ? 80 : 40;

    const differentiationClarity = positioning === "premium" ? 80 : positioning === "mid" ? 55 : 40;
    const marginSafety = margin >= 50 ? 90 : margin >= 35 ? 65 : margin >= 20 ? 40 : 15;
    const positioningStrength = Math.round((priceCompetitiveness * 0.3 + differentiationClarity * 0.3 + marginSafety * 0.4));
    const riskLevel: "safe" | "warning" | "critical" = positioningStrength >= 65 ? "safe" : positioningStrength >= 40 ? "warning" : "critical";

    const allSuggestions = [
      margin < 35
        ? (isDE ? "Marge unter 35% — überprüfe COGS oder Preiserhöhung." : "Margin below 35% — review COGS or increase price.")
        : (isDE ? "Marge gesund. Spielraum für Marketing." : "Margin healthy. Room for marketing spend."),
      priceRatio > 1.3
        ? (isDE ? "Preis 30%+ über Wettbewerb — starke Differenzierung nötig." : "Price 30%+ above competition — strong differentiation required.")
        : (isDE ? "Preispositionierung wettbewerbsfähig." : "Price positioning competitive."),
      positioning === "budget" && margin < 25
        ? (isDE ? "Budget-Positionierung bei niedriger Marge ist riskant." : "Budget positioning with low margin is risky.")
        : (isDE ? "Positionierung passt zur Preisstruktur." : "Positioning aligns with price structure."),
    ];

    const maxSuggestions = isExecution || isPro ? 3 : 1;

    setResult({
      positioningStrength,
      priceCompetitiveness,
      differentiationClarity,
      marginSafety,
      riskLevel,
      suggestions: allSuggestions.slice(0, maxSuggestions),
      capitalWarning: margin < 35 && isExecution
        ? (isDE ? "⚠️ Kapitalrisiko: Bei dieser Marge ist dein Break-Even deutlich verzögert. Jede Retoure verstärkt den Verlust." : "⚠️ Capital risk: At this margin, your break-even is significantly delayed. Every return amplifies the loss.")
        : undefined,
    });
  };

  if (!isBuilder) {
    return (
      <LockedOverlay feature="budgetPlanner">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Offer Positioning Engine</CardTitle>
          </CardHeader>
          <CardContent className="h-32" />
        </Card>
      </LockedOverlay>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-accent" /> Offer Positioning Engine</CardTitle>
        <CardDescription>{isDE ? "Bewerte deine Preispositionierung und Margensicherheit." : "Evaluate your price positioning and margin safety."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">{isDE ? "Produktpreis (€)" : "Product Price (€)"}</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="29.90" /></div>
          <div><Label className="text-xs">COGS (€)</Label><Input type="number" value={cogs} onChange={e => setCogs(e.target.value)} placeholder="8.50" /></div>
          <div><Label className="text-xs">{isDE ? "Wettbewerberpreis (€)" : "Competitor Price (€)"}</Label><Input type="number" value={competitorPrice} onChange={e => setCompetitorPrice(e.target.value)} placeholder="24.90" /></div>
          <div>
            <Label className="text-xs">{isDE ? "Positionierung" : "Positioning"}</Label>
            <Select value={positioning} onValueChange={setPositioning}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="mid">Mid-Range</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={calculate} className="gap-1.5"><Calculator className="h-3.5 w-3.5" /> {isDE ? "Analysieren" : "Analyze"}</Button>

        {result && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{result.positioningStrength}</span>
              <span className="text-sm text-muted-foreground">/100 Positioning Strength</span>
              <RiskBadge level={result.riskLevel} />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <ScoreBar label={isDE ? "Preiswettbewerb" : "Price Competitiveness"} value={result.priceCompetitiveness} />
              <ScoreBar label={isDE ? "Differenzierung" : "Differentiation"} value={result.differentiationClarity} />
              <ScoreBar label={isDE ? "Margensicherheit" : "Margin Safety"} value={result.marginSafety} />
            </div>
            <div className="space-y-2">
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            {result.capitalWarning && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {result.capitalWarning}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Break-Even Ad Budget Calculator ────────────────────────────

function BreakEvenAdCalculator({ isBuilder, isPro, isExecution }: { isBuilder: boolean; isPro: boolean; isExecution: boolean }) {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const [margin, setMargin] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [targetRevenue, setTargetRevenue] = useState("");
  const [conversionRate, setConversionRate] = useState("");
  const [result, setResult] = useState<null | {
    maxCPA: number;
    breakEvenROAS: number;
    safeTestBudget: number;
    riskLevel: "safe" | "warning" | "critical";
    capitalBurnRisk?: string;
    worstCase?: string;
  }>(null);

  const calculate = () => {
    const m = parseFloat(margin) || 0;
    const fc = parseFloat(fixedCosts) || 0;
    const tr = parseFloat(targetRevenue) || 0;
    const cr = parseFloat(conversionRate) || 0;
    if (!m || !tr || !cr) return;

    const marginDecimal = m / 100;
    const breakEvenROAS = 1 / marginDecimal;
    const monthlyProfit = tr * marginDecimal - fc;
    const maxCPA = tr * marginDecimal / (tr * (cr / 100) / 50);
    const safeTestBudget = Math.max(500, Math.round(monthlyProfit * 0.3));
    const riskLevel: "safe" | "warning" | "critical" = monthlyProfit > safeTestBudget * 2 ? "safe" : monthlyProfit > 0 ? "warning" : "critical";

    setResult({
      maxCPA: Math.round(maxCPA * 100) / 100,
      breakEvenROAS: Math.round(breakEvenROAS * 100) / 100,
      safeTestBudget,
      riskLevel,
      capitalBurnRisk: isExecution && riskLevel !== "safe"
        ? (isDE ? "Bei diesem Setup verbrennst du ~" + Math.round(safeTestBudget * 1.5) + "€/Monat bevor du profitabel wirst." : "At this setup you'll burn ~€" + Math.round(safeTestBudget * 1.5) + "/month before profitability.")
        : undefined,
      worstCase: isExecution
        ? (isDE ? "Worst Case: Bei 50% der erwarteten Conversion verlierst du " + Math.round(fc + safeTestBudget) + "€/Monat." : "Worst case: At 50% expected conversion you lose €" + Math.round(fc + safeTestBudget) + "/month.")
        : undefined,
    });
  };

  if (!isBuilder) {
    return (
      <LockedOverlay feature="budgetPlanner">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Calculator className="h-4 w-4" /> Break-Even Ad Budget</CardTitle></CardHeader>
          <CardContent className="h-32" />
        </Card>
      </LockedOverlay>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Calculator className="h-4 w-4 text-accent" /> Break-Even Ad Budget</CardTitle>
        <CardDescription>{isDE ? "Berechne deinen maximalen CPA und sicheres Testbudget." : "Calculate your max CPA and safe test budget."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">{isDE ? "Marge (%)" : "Margin (%)"}</Label><Input type="number" value={margin} onChange={e => setMargin(e.target.value)} placeholder="45" /></div>
          <div><Label className="text-xs">{isDE ? "Fixkosten/Monat (€)" : "Monthly Fixed Costs (€)"}</Label><Input type="number" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} placeholder="2000" /></div>
          <div><Label className="text-xs">{isDE ? "Ziel-Umsatz/Monat (€)" : "Target Monthly Revenue (€)"}</Label><Input type="number" value={targetRevenue} onChange={e => setTargetRevenue(e.target.value)} placeholder="10000" /></div>
          <div><Label className="text-xs">{isDE ? "Conversion Rate (%)" : "Conversion Rate (%)"}</Label><Input type="number" value={conversionRate} onChange={e => setConversionRate(e.target.value)} placeholder="2.5" /></div>
        </div>
        <Button onClick={calculate} className="gap-1.5"><Calculator className="h-3.5 w-3.5" /> {isDE ? "Berechnen" : "Calculate"}</Button>
        {result && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricBox label="Max CPA" value={"€" + result.maxCPA} />
              <MetricBox label="Break-Even ROAS" value={result.breakEvenROAS + "x"} />
              <MetricBox label={isDE ? "Sicheres Testbudget" : "Safe Test Budget"} value={"€" + result.safeTestBudget} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{isDE ? "Risikostufe:" : "Risk Level:"}</span>
              <RiskBadge level={result.riskLevel} />
            </div>
            {result.capitalBurnRisk && <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-600 dark:text-amber-400">{result.capitalBurnRisk}</div>}
            {result.worstCase && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{result.worstCase}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Launch Test Framework ──────────────────────────────────────

function LaunchTestFramework({ isBuilder, isExecution }: { isBuilder: boolean; isExecution: boolean }) {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const [testBudget, setTestBudget] = useState("");
  const [testDuration, setTestDuration] = useState("");
  const [kpiGoal, setKpiGoal] = useState("conversion");
  const [result, setResult] = useState<null | {
    stopLoss: number;
    goNoGo: string[];
    checklist: string[];
    capitalProtection?: string;
  }>(null);

  const calculate = () => {
    const budget = parseFloat(testBudget) || 0;
    const duration = parseInt(testDuration) || 7;
    if (!budget) return;

    const dailyBudget = budget / duration;
    const stopLoss = Math.round(budget * 0.6);

    const goNoGo = [
      isDE ? "GO: ROAS > 2x nach " + Math.ceil(duration * 0.6) + " Tagen" : "GO: ROAS > 2x after " + Math.ceil(duration * 0.6) + " days",
      isDE ? "PAUSE: CPA > " + Math.round(dailyBudget * 3) + "€ pro Conversion" : "PAUSE: CPA > €" + Math.round(dailyBudget * 3) + " per conversion",
      isDE ? "STOP: Kein Sale nach " + Math.round(budget * 0.4) + "€ Spend" : "STOP: No sale after €" + Math.round(budget * 0.4) + " spend",
    ];

    const checklist = [
      isDE ? "Pixel und Tracking verifiziert" : "Pixel and tracking verified",
      isDE ? "Landingpage A/B-Test bereit" : "Landing page A/B test ready",
      isDE ? "Tägliches Reporting aktiviert" : "Daily reporting activated",
      isDE ? "Stop-Loss bei €" + stopLoss + " gesetzt" : "Stop-loss set at €" + stopLoss,
    ];

    setResult({
      stopLoss,
      goNoGo,
      checklist,
      capitalProtection: isExecution
        ? (isDE ? "Capital Protection: Automatischer Stopp bei " + stopLoss + "€ Verlust. Tägliche Alerts wenn CPA > Ziel." : "Capital Protection: Auto-stop at €" + stopLoss + " loss. Daily alerts when CPA > target.")
        : undefined,
    });
  };

  if (!isBuilder) {
    return (
      <LockedOverlay feature="budgetPlanner">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Rocket className="h-4 w-4" /> Launch Test Framework</CardTitle></CardHeader>
          <CardContent className="h-32" />
        </Card>
      </LockedOverlay>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Rocket className="h-4 w-4 text-accent" /> Launch Test Framework</CardTitle>
        <CardDescription>{isDE ? "Strukturierter Launch-Test mit Stop-Loss und Go/No-Go Logik." : "Structured launch test with stop-loss and go/no-go logic."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label className="text-xs">{isDE ? "Testbudget (€)" : "Test Budget (€)"}</Label><Input type="number" value={testBudget} onChange={e => setTestBudget(e.target.value)} placeholder="1000" /></div>
          <div><Label className="text-xs">{isDE ? "Testdauer (Tage)" : "Test Duration (days)"}</Label><Input type="number" value={testDuration} onChange={e => setTestDuration(e.target.value)} placeholder="14" /></div>
          <div>
            <Label className="text-xs">KPI</Label>
            <Select value={kpiGoal} onValueChange={setKpiGoal}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="conversion">Conversion Rate</SelectItem>
                <SelectItem value="roas">ROAS</SelectItem>
                <SelectItem value="cpa">CPA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={calculate} className="gap-1.5"><Rocket className="h-3.5 w-3.5" /> {isDE ? "Framework generieren" : "Generate Framework"}</Button>
        {result && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div>
              <h4 className="text-sm font-semibold mb-2">{isDE ? "Go/No-Go Entscheidungslogik" : "Go/No-Go Decision Logic"}</h4>
              {result.goNoGo.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground mb-1">
                  <span className={cn("font-mono text-xs px-1.5 py-0.5 rounded", i === 0 ? "bg-emerald-500/10 text-emerald-500" : i === 1 ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive")}>{item.split(":")[0]}</span>
                  <span>{item.split(":").slice(1).join(":")}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">{isDE ? "Performance Checklist" : "Performance Checklist"}</h4>
              {result.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-3.5 w-3.5 text-accent" />{item}</div>
              ))}
            </div>
            {result.capitalProtection && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm font-medium flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                {result.capitalProtection}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Pre-Order Capital Strategy ─────────────────────────────────

function PreOrderStrategy({ isBuilder, isExecution }: { isBuilder: boolean; isExecution: boolean }) {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const [moq, setMoq] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [plannedPrice, setPlannedPrice] = useState("");
  const [cashReserve, setCashReserve] = useState("");
  const [result, setResult] = useState<null | {
    capitalExposure: number;
    totalInvestment: number;
    strategy: string;
    overproductionRisk: "safe" | "warning" | "critical";
    runwayImpact?: string;
  }>(null);

  const calculate = () => {
    const m = parseInt(moq) || 0;
    const uc = parseFloat(unitCost) || 0;
    const pp = parseFloat(plannedPrice) || 0;
    const cr = parseFloat(cashReserve) || 0;
    if (!m || !uc || !cr) return;

    const totalInvestment = m * uc;
    const capitalExposure = Math.round((totalInvestment / cr) * 100);
    const breakEvenUnits = Math.ceil(totalInvestment / (pp - uc));
    const overproductionRisk: "safe" | "warning" | "critical" = capitalExposure < 40 ? "safe" : capitalExposure < 70 ? "warning" : "critical";

    let strategy = "";
    if (capitalExposure < 30) strategy = isDE ? "Sichere Position. Pre-Order als Bonus, nicht als Notwendigkeit." : "Safe position. Pre-order as bonus, not necessity.";
    else if (capitalExposure < 60) strategy = isDE ? "Pre-Order empfohlen: Mindestens " + Math.round(breakEvenUnits * 0.3) + " Einheiten vor Produktion sichern." : "Pre-order recommended: Secure at least " + Math.round(breakEvenUnits * 0.3) + " units before production.";
    else strategy = isDE ? "⚠️ Hohe Kapitalexposition. Pre-Order zwingend notwendig. Ziel: " + Math.round(breakEvenUnits * 0.5) + " Vorbestellungen." : "⚠️ High capital exposure. Pre-order mandatory. Target: " + Math.round(breakEvenUnits * 0.5) + " pre-orders.";

    setResult({
      capitalExposure,
      totalInvestment,
      strategy,
      overproductionRisk,
      runwayImpact: isExecution
        ? (isDE ? "Runway-Impact: Bei 50% Verkauf sinkt dein Runway um " + Math.round((totalInvestment * 0.5) / (cr / 6)) + " Monate." : "Runway impact: At 50% sell-through, your runway decreases by " + Math.round((totalInvestment * 0.5) / (cr / 6)) + " months.")
        : undefined,
    });
  };

  if (!isBuilder) {
    return (
      <LockedOverlay feature="budgetPlanner">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4" /> Pre-Order Capital Strategy</CardTitle></CardHeader>
          <CardContent className="h-32" />
        </Card>
      </LockedOverlay>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4 text-accent" /> Pre-Order Capital Strategy</CardTitle>
        <CardDescription>{isDE ? "Kapitalexposition und Pre-Order-Strategie berechnen." : "Calculate capital exposure and pre-order strategy."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">MOQ</Label><Input type="number" value={moq} onChange={e => setMoq(e.target.value)} placeholder="500" /></div>
          <div><Label className="text-xs">{isDE ? "Stückkosten (€)" : "Unit Cost (€)"}</Label><Input type="number" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="8.50" /></div>
          <div><Label className="text-xs">{isDE ? "Geplanter Preis (€)" : "Planned Price (€)"}</Label><Input type="number" value={plannedPrice} onChange={e => setPlannedPrice(e.target.value)} placeholder="29.90" /></div>
          <div><Label className="text-xs">{isDE ? "Cash-Reserve (€)" : "Cash Reserve (€)"}</Label><Input type="number" value={cashReserve} onChange={e => setCashReserve(e.target.value)} placeholder="15000" /></div>
        </div>
        <Button onClick={calculate} className="gap-1.5"><DollarSign className="h-3.5 w-3.5" /> {isDE ? "Strategie berechnen" : "Calculate Strategy"}</Button>
        {result && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricBox label={isDE ? "Kapitalexposition" : "Capital Exposure"} value={result.capitalExposure + "%"} accent={result.capitalExposure > 60} />
              <MetricBox label={isDE ? "Gesamtinvestment" : "Total Investment"} value={"€" + result.totalInvestment.toLocaleString()} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{isDE ? "Überproduktionsrisiko:" : "Overproduction Risk:"}</span>
                <RiskBadge level={result.overproductionRisk} />
              </div>
            </div>
            <div className="rounded-lg border bg-card/50 p-3 text-sm">{result.strategy}</div>
            {result.runwayImpact && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{result.runwayImpact}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Shared UI components ───────────────────────────────────────

function RiskBadge({ level }: { level: "safe" | "warning" | "critical" }) {
  const map = {
    safe: { label: "Safe", cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
    warning: { label: "Warning", cls: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
    critical: { label: "Critical", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  const { label, cls } = map[level];
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", cls)}>{label}</span>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 65 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>
      <div className="h-1.5 w-full rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function MetricBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-3", accent ? "border-destructive/30 bg-destructive/5" : "bg-card/50")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-bold", accent ? "text-destructive" : "")}>{value}</p>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function RevenueActivation() {
  const { plan, isBuilder, isPro, isExecution } = useSubscription();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Revenue Activation</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isDE ? "Produkt in Umsatz verwandeln" : "Turn Your Product Into Revenue"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {isDE
            ? "Kapitalgeschützte Revenue-Strategie — ohne Kapital zu verbrennen."
            : "Capital-protected revenue strategy — without burning capital."}
        </p>
      </div>

      <div className="space-y-6">
        <OfferPositioningEngine plan={plan} isBuilder={isBuilder} isPro={isPro} isExecution={isExecution} />
        <BreakEvenAdCalculator isBuilder={isBuilder} isPro={isPro} isExecution={isExecution} />
        <LaunchTestFramework isBuilder={isBuilder} isExecution={isExecution} />
        <PreOrderStrategy isBuilder={isBuilder} isExecution={isExecution} />
      </div>
    </DashboardLayout>
  );
}
