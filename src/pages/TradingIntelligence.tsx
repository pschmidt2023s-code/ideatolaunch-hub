import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FinancialDisclaimer } from "@/components/dashboard/FinancialDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Shield, TrendingUp, Activity, BarChart3, Target, Zap,
  Brain, AlertTriangle, Crosshair, PieChart, Gauge, Loader2,
  Skull, ArrowDown, DollarSign, LineChart,
} from "lucide-react";
import {
  runAccountSurvival,
  analyzeStrategyEdge,
  predictDrawdown,
  calculatePositionSize,
  scanLiquidationRisk,
  calculatePortfolioExposure,
  detectMarketRegime,
  monitorDiscipline,
  simulateTrades,
  type SurvivalResult,
  type StrategyEdge,
  type DrawdownPrediction,
  type PositionSize,
  type LiquidationRisk,
  type RegimeResult,
  type DisciplineReport,
  type SimulationResult,
} from "@/lib/trading-intelligence";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart as RPieChart, Pie } from "recharts";

// ── Shared ──
function BigNumber({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn("text-3xl font-bold tabular-nums mt-1", color)}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step, suffix }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-xs font-medium tabular-nums">{value}{suffix}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-5", className)}>{children}</div>;
}

function StatusPill({ label, level }: { label: string; level: "safe" | "warning" | "danger" | "critical" | "strong" | "moderate" | "weak" | "negative" | string }) {
  const colors: Record<string, string> = {
    safe: "bg-green-500/10 text-green-600", strong: "bg-green-500/10 text-green-600",
    warning: "bg-yellow-500/10 text-yellow-600", moderate: "bg-yellow-500/10 text-yellow-600", weak: "bg-yellow-500/10 text-yellow-600",
    danger: "bg-orange-500/10 text-orange-600",
    critical: "bg-destructive/10 text-destructive", negative: "bg-destructive/10 text-destructive",
  };
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", colors[level] ?? colors.warning)}>{label}</span>;
}

// ── COLORS for charts ──
const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(142 76% 36%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"];

export default function TradingIntelligence() {
  // ── Shared inputs ──
  const [winrate, setWinrate] = useState(55);
  const [riskPerTrade, setRiskPerTrade] = useState(2);
  const [rrr, setRrr] = useState(2);
  const [accountSize, setAccountSize] = useState(10000);
  const [avgWin, setAvgWin] = useState(200);
  const [avgLoss, setAvgLoss] = useState(100);
  const [commission, setCommission] = useState(3);
  const [leverage, setLeverage] = useState(10);

  // Position size
  const [entryPrice, setEntryPrice] = useState(50000);
  const [stopLoss, setStopLoss] = useState(49000);

  // Liquidation
  const [isLong, setIsLong] = useState(true);
  const [posSize, setPosSize] = useState(0.1);

  // Market regime
  const [volatility, setVolatility] = useState(5);
  const [trendStrength, setTrendStrength] = useState(5);

  // Discipline
  const [tradesPlanned, setTradesPlanned] = useState(5);
  const [tradesExecuted, setTradesExecuted] = useState(7);
  const [consLosses, setConsLosses] = useState(2);
  const [tradedAfterLoss, setTradedAfterLoss] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [tradedAfterLimit, setTradedAfterLimit] = useState(false);

  // Simulation
  const [simTrades, setSimTrades] = useState(100);

  // AI Review
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReview, setAiReview] = useState("");

  // Pairs for exposure – populated from connected accounts
  const pairs: Array<{ name: string; market: string; allocation: number }> = [];

  // ── Calculations ──
  const survival = useMemo(() => runAccountSurvival(winrate, riskPerTrade, rrr, accountSize), [winrate, riskPerTrade, rrr, accountSize]);
  const edge = useMemo(() => analyzeStrategyEdge(winrate, avgWin, avgLoss, commission), [winrate, avgWin, avgLoss, commission]);
  const drawdown = useMemo(() => predictDrawdown(winrate, riskPerTrade, rrr), [winrate, riskPerTrade, rrr]);
  const position = useMemo(() => calculatePositionSize(accountSize, riskPerTrade, entryPrice, stopLoss), [accountSize, riskPerTrade, entryPrice, stopLoss]);
  const liquidation = useMemo(() => scanLiquidationRisk(entryPrice, leverage, isLong, accountSize, posSize), [entryPrice, leverage, isLong, accountSize, posSize]);
  const exposure = useMemo(() => calculatePortfolioExposure(pairs), []);
  const regime = useMemo(() => detectMarketRegime(volatility, trendStrength, 1.5), [volatility, trendStrength]);
  const discipline = useMemo(() => monitorDiscipline(tradesPlanned, tradesExecuted, riskPerTrade, 3, consLosses, tradedAfterLoss, dailyLimitReached, tradedAfterLimit),
    [tradesPlanned, tradesExecuted, riskPerTrade, consLosses, tradedAfterLoss, dailyLimitReached, tradedAfterLimit]);
  const simulation = useMemo(() => simulateTrades(winrate, rrr, riskPerTrade, accountSize, simTrades), [winrate, rrr, riskPerTrade, accountSize, simTrades]);

  // AI Review handler
  const requestAiReview = async () => {
    setAiLoading(true);
    setAiReview("");

    const tradeData = {
      winrate, riskPerTrade, rrr, accountSize, avgWin, avgLoss,
      profitFactor: edge.profitFactor,
      expectancy: edge.expectancy,
      survivalProbability: survival.survivalProbability,
      maxDrawdown: drawdown.expectedMaxDrawdown,
      disciplineGrade: discipline.disciplineGrade,
      warnings: discipline.warnings,
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-trade-review`;
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ trades: tradeData, strategy: "Custom", context: "Trading Intelligence Dashboard Review" }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Fehler" }));
        toast.error(err.error || "AI Fehler");
        setAiLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { full += content; setAiReview(full); }
          } catch { /* partial */ }
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    }
    setAiLoading(false);
  };

  return (
    <DashboardLayout>
      <SEO title="Trading Intelligence – BrandOS" description="Crypto, Futures & Portfolio Trading Tools" path="/trading" />

      <div className="animate-fade-in space-y-8">
        <PageHeader
          title="Trading Intelligence"
          description="Account Survival · Strategy Edge · Risk Analysis · AI Review"
          badge="TRADING"
          badgeVariant="warning"
        />

        {/* ── Global Inputs ── */}
        <Card>
          <h3 className="text-sm font-semibold mb-4">Deine Trading-Parameter</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SliderField label="Winrate" value={winrate} onChange={setWinrate} min={20} max={90} step={1} suffix="%" />
            <SliderField label="Risk/Trade" value={riskPerTrade} onChange={setRiskPerTrade} min={0.5} max={10} step={0.25} suffix="%" />
            <SliderField label="RRR" value={rrr} onChange={setRrr} min={0.5} max={5} step={0.25} suffix=":1" />
            <SliderField label="Account Size" value={accountSize} onChange={setAccountSize} min={500} max={500000} step={500} suffix="€" />
          </div>
        </Card>

        {/* ── Top KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="text-center">
            <Shield className={cn("h-5 w-5 mx-auto mb-1", survival.survivalProbability > 80 ? "text-green-500" : "text-destructive")} />
            <p className="text-[10px] text-muted-foreground">SURVIVAL</p>
            <p className={cn("text-3xl font-bold", survival.survivalProbability > 80 ? "text-green-500" : "text-destructive")}>{survival.survivalProbability}%</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className={cn("h-5 w-5 mx-auto mb-1", edge.edgeQuality === "strong" ? "text-green-500" : edge.edgeQuality === "negative" ? "text-destructive" : "text-yellow-500")} />
            <p className="text-[10px] text-muted-foreground">EDGE</p>
            <p className="text-3xl font-bold">{edge.edge}%</p>
          </Card>
          <Card className="text-center">
            <ArrowDown className={cn("h-5 w-5 mx-auto mb-1", drawdown.expectedMaxDrawdown < 15 ? "text-green-500" : "text-destructive")} />
            <p className="text-[10px] text-muted-foreground">MAX DD</p>
            <p className="text-3xl font-bold">{drawdown.expectedMaxDrawdown}%</p>
          </Card>
          <Card className="text-center">
            <Gauge className={cn("h-5 w-5 mx-auto mb-1", edge.profitFactor >= 1.5 ? "text-green-500" : "text-yellow-500")} />
            <p className="text-[10px] text-muted-foreground">PROFIT FACTOR</p>
            <p className="text-3xl font-bold">{edge.profitFactor}</p>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="survival" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="survival" className="text-xs gap-1"><Shield className="h-3 w-3" /> Survival</TabsTrigger>
            <TabsTrigger value="edge" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Edge</TabsTrigger>
            <TabsTrigger value="drawdown" className="text-xs gap-1"><ArrowDown className="h-3 w-3" /> Drawdown</TabsTrigger>
            <TabsTrigger value="position" className="text-xs gap-1"><Target className="h-3 w-3" /> Position</TabsTrigger>
            <TabsTrigger value="liquidation" className="text-xs gap-1"><Skull className="h-3 w-3" /> Liquidation</TabsTrigger>
            <TabsTrigger value="exposure" className="text-xs gap-1"><PieChart className="h-3 w-3" /> Exposure</TabsTrigger>
            <TabsTrigger value="regime" className="text-xs gap-1"><Activity className="h-3 w-3" /> Regime</TabsTrigger>
            <TabsTrigger value="discipline" className="text-xs gap-1"><Crosshair className="h-3 w-3" /> Disziplin</TabsTrigger>
            <TabsTrigger value="simulation" className="text-xs gap-1"><LineChart className="h-3 w-3" /> Simulation</TabsTrigger>
            <TabsTrigger value="ai-review" className="text-xs gap-1"><Brain className="h-3 w-3" /> AI Review</TabsTrigger>
          </TabsList>

          {/* 1 ── Account Survival ── */}
          <TabsContent value="survival">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><Shield className="h-4 w-4" /> Account Survival Engine</h3>
              <div className="grid sm:grid-cols-4 gap-6">
                <BigNumber label="Überlebensrate" value={`${survival.survivalProbability}%`} color={survival.survivalProbability > 80 ? "text-green-500" : "text-destructive"} />
                <BigNumber label="Ruin-Wahrsch." value={`${survival.ruinProbability}%`} color={survival.ruinProbability < 10 ? "text-green-500" : "text-destructive"} />
                <BigNumber label="Max Cons. Losses" value={String(survival.maxConsecutiveLosses)} />
                <BigNumber label="Erw. Lifetime" value={`${survival.expectedLifetimeTrades} Trades`} />
              </div>
              <div className="mt-6 rounded-xl bg-muted/30 border p-4 text-center">
                <p className="text-xs text-muted-foreground">Confidence Interval (P10 – P90)</p>
                <p className="text-lg font-bold mt-1">{survival.confidenceInterval.low}€ – {survival.confidenceInterval.high}€</p>
              </div>
            </Card>
          </TabsContent>

          {/* 2 ── Strategy Edge ── */}
          <TabsContent value="edge">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Strategy Edge Analyzer</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                <SliderField label="Avg Win (€)" value={avgWin} onChange={setAvgWin} min={10} max={5000} step={10} />
                <SliderField label="Avg Loss (€)" value={avgLoss} onChange={setAvgLoss} min={10} max={5000} step={10} />
                <SliderField label="Commission (€)" value={commission} onChange={setCommission} min={0} max={50} step={0.5} />
              </div>
              <div className="grid sm:grid-cols-4 gap-6 mt-6">
                <BigNumber label="Expectancy" value={`${edge.expectancy > 0 ? "+" : ""}${edge.expectancy}€`} color={edge.expectancy > 0 ? "text-green-500" : "text-destructive"} />
                <BigNumber label="Edge" value={`${edge.edge}%`} sub={edge.edgeQuality} />
                <BigNumber label="Profit Factor" value={String(edge.profitFactor)} color={edge.profitFactor >= 1.5 ? "text-green-500" : "text-yellow-500"} />
                <BigNumber label="Kelly %" value={`${edge.kellyPercent}%`} sub="Optimale Position" />
              </div>
              <div className="mt-4 flex justify-center"><StatusPill label={edge.edgeQuality.toUpperCase()} level={edge.edgeQuality} /></div>
            </Card>
          </TabsContent>

          {/* 3 ── Drawdown ── */}
          <TabsContent value="drawdown">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><ArrowDown className="h-4 w-4" /> Drawdown Predictor</h3>
              <div className="grid sm:grid-cols-4 gap-6">
                <BigNumber label="Worst Case DD" value={`${drawdown.worstCaseDrawdown}%`} color="text-destructive" />
                <BigNumber label="Expected Max DD" value={`${drawdown.expectedMaxDrawdown}%`} color={drawdown.expectedMaxDrawdown < 20 ? "text-yellow-500" : "text-destructive"} />
                <BigNumber label="DD Dauer" value={`${drawdown.drawdownDuration} Trades`} />
                <BigNumber label="Recovery" value={`${drawdown.recoveryTrades} Trades`} />
              </div>
            </Card>
          </TabsContent>

          {/* 4 ── Position Size ── */}
          <TabsContent value="position">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><Target className="h-4 w-4" /> Risk Per Trade Calculator</h3>
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <Label className="text-xs">Entry Price</Label>
                  <Input type="number" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Stop Loss</Label>
                  <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid sm:grid-cols-4 gap-6">
                <BigNumber label="Position Size" value={`${position.positionSize}`} sub="Units" />
                <BigNumber label="Risk Amount" value={`${position.riskAmount}€`} color="text-yellow-500" />
                <BigNumber label="Lot Size" value={String(position.lotSize)} />
                <BigNumber label="Max Loss" value={`${position.maxLoss}€`} color="text-destructive" />
              </div>
            </Card>
          </TabsContent>

          {/* 5 ── Liquidation ── */}
          <TabsContent value="liquidation">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><Skull className="h-4 w-4" /> Liquidation Risk Scanner</h3>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <SliderField label="Leverage" value={leverage} onChange={setLeverage} min={1} max={125} step={1} suffix="x" />
                <div className="flex items-center gap-3">
                  <Label className="text-xs">Direction</Label>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs", isLong ? "text-green-500 font-bold" : "text-muted-foreground")}>Long</span>
                    <Switch checked={!isLong} onCheckedChange={(v) => setIsLong(!v)} />
                    <span className={cn("text-xs", !isLong ? "text-destructive font-bold" : "text-muted-foreground")}>Short</span>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-4 gap-6">
                <BigNumber label="Liquidation Price" value={`$${liquidation.liquidationPrice}`} color="text-destructive" />
                <BigNumber label="Distance" value={`${liquidation.liquidationDistance}%`} />
                <BigNumber label="Margin Used" value={`$${liquidation.marginUsed}`} />
                <BigNumber label="Safety Buffer" value={`${liquidation.safetyBuffer}%`} color={liquidation.riskLevel === "safe" ? "text-green-500" : "text-destructive"} />
              </div>
              <div className="mt-4 flex justify-center"><StatusPill label={liquidation.riskLevel.toUpperCase()} level={liquidation.riskLevel} /></div>
            </Card>
          </TabsContent>

          {/* 6 ── Portfolio Exposure ── */}
          <TabsContent value="exposure">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><PieChart className="h-4 w-4" /> Portfolio Exposure Map</h3>
              {exposure.exposures.length === 0 ? (
                <div className="text-center py-10">
                  <PieChart className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Kein Portfolio verbunden.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Verbinde deinen Exchange-Account, um deine Exposure zu analysieren.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie data={exposure.exposures} dataKey="allocation" nameKey="asset" cx="50%" cy="50%" outerRadius={80} label={({ asset, allocation }) => `${asset} ${allocation}%`}>
                          {exposure.exposures.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <BigNumber label="Diversification Score" value={`${exposure.diversificationScore}`} color={exposure.diversificationScore > 60 ? "text-green-500" : "text-yellow-500"} />
                    <BigNumber label="Concentration Risk" value={`${exposure.concentrationRisk}%`} color={exposure.concentrationRisk > 40 ? "text-destructive" : "text-green-500"} />
                    <div className="space-y-2 mt-4">
                      {exposure.exposures.map((e, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span>{e.asset}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{e.allocation}%</span>
                            <StatusPill label={e.risk} level={e.risk === "high" ? "danger" : e.risk === "low" ? "safe" : "warning"} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* 7 ── Market Regime ── */}
          <TabsContent value="regime">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><Activity className="h-4 w-4" /> Market Regime Detector</h3>
              <div className="grid gap-4 sm:grid-cols-2 mb-8">
                <SliderField label="Volatilität" value={volatility} onChange={setVolatility} min={1} max={10} step={1} />
                <SliderField label="Trend-Stärke" value={trendStrength} onChange={setTrendStrength} min={1} max={10} step={1} />
              </div>
              <div className="text-center space-y-4">
                <p className="text-5xl">{regime.icon}</p>
                <h2 className="text-2xl font-bold capitalize">{regime.regime.replace("_", " ")}</h2>
                <p className="text-sm text-muted-foreground">Confidence: {regime.confidence}%</p>
                <div className="rounded-xl bg-muted/30 border p-4 max-w-md mx-auto">
                  <p className="text-sm">{regime.suggestion}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 8 ── Discipline Monitor ── */}
          <TabsContent value="discipline">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><Crosshair className="h-4 w-4" /> Discipline Monitor</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                <SliderField label="Geplante Trades" value={tradesPlanned} onChange={setTradesPlanned} min={1} max={20} step={1} />
                <SliderField label="Ausgeführte Trades" value={tradesExecuted} onChange={setTradesExecuted} min={0} max={30} step={1} />
                <SliderField label="Consecutive Losses" value={consLosses} onChange={setConsLosses} min={0} max={10} step={1} />
                <div className="flex items-center gap-3">
                  <Switch checked={tradedAfterLoss} onCheckedChange={setTradedAfterLoss} />
                  <Label className="text-xs">Nach Verlustserie weiter getradet</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={dailyLimitReached} onCheckedChange={setDailyLimitReached} />
                  <Label className="text-xs">Daily Limit erreicht</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={tradedAfterLimit} onCheckedChange={setTradedAfterLimit} />
                  <Label className="text-xs">Nach Limit weiter getradet</Label>
                </div>
              </div>
              <div className="grid sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">GRADE</p>
                  <p className={cn("text-5xl font-black mt-1",
                    discipline.disciplineGrade === "A" ? "text-green-500" :
                    discipline.disciplineGrade === "B" ? "text-green-400" :
                    discipline.disciplineGrade === "C" ? "text-yellow-500" :
                    "text-destructive"
                  )}>{discipline.disciplineGrade}</p>
                </div>
                <BigNumber label="Overtrading" value={`${discipline.overtradingScore}%`} color={discipline.overtrading ? "text-destructive" : "text-green-500"} />
                <BigNumber label="Tilt Score" value={`${discipline.tiltScore}`} color={discipline.tiltScore > 30 ? "text-destructive" : "text-green-500"} />
                <BigNumber label="Risk Violations" value={String(discipline.riskViolations)} color={discipline.riskViolations > 0 ? "text-destructive" : "text-green-500"} />
              </div>
              {discipline.warnings.length > 0 && (
                <div className="mt-6 space-y-2">
                  {discipline.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* 9 ── Trade Simulation ── */}
          <TabsContent value="simulation">
            <Card>
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2"><LineChart className="h-4 w-4" /> Trade Simulation Lab</h3>
              <SliderField label="Anzahl Trades" value={simTrades} onChange={setSimTrades} min={20} max={500} step={10} />
              <div className="grid sm:grid-cols-4 gap-6 mt-6">
                <BigNumber label="Endbalance" value={`${simulation.finalBalance.toLocaleString("de-DE")}€`} color={simulation.finalBalance > accountSize ? "text-green-500" : "text-destructive"} />
                <BigNumber label="Profit Prob." value={`${simulation.profitProbability}%`} color={simulation.profitProbability > 60 ? "text-green-500" : "text-yellow-500"} />
                <BigNumber label="Avg Return" value={`${simulation.avgReturn > 0 ? "+" : ""}${simulation.avgReturn}%`} color={simulation.avgReturn > 0 ? "text-green-500" : "text-destructive"} />
                <BigNumber label="Max Drawdown" value={`${simulation.maxDrawdown}%`} color="text-yellow-500" />
              </div>
              {simulation.equityCurve.length > 1 && (
                <div className="mt-6 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulation.equityCurve.map((v, i) => ({ trade: i, balance: v }))}>
                      <defs>
                        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="trade" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => `${v.toLocaleString("de-DE")}€`} />
                      <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="url(#eqGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* 10 ── AI Trade Review ── */}
          <TabsContent value="ai-review">
            <Card>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Brain className="h-4 w-4" /> AI Trade Review</h3>
              <p className="text-sm text-muted-foreground mb-6">
                KI analysiert deine Trading-Metriken und gibt dir eine personalisierte Bewertung mit konkreten Verbesserungsvorschlägen.
              </p>
              <Button onClick={requestAiReview} disabled={aiLoading} className="gap-2 mb-6">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {aiLoading ? "Analyse läuft…" : "Trade Review starten"}
              </Button>
              {aiReview && (
                <div className="rounded-xl bg-muted/30 border p-5 prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
                  {aiReview}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <FinancialDisclaimer />
      </div>
    </DashboardLayout>
  );
}
