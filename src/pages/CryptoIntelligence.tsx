import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialDisclaimer } from "@/components/dashboard/FinancialDisclaimer";
import { cn } from "@/lib/utils";
import {
  calculateStrategySurvival,
  detectEdge,
  detectRegime,
  simulateCapitalTimeline,
  detectEmotionalTrading,
  scanLiquidationDistance,
  analyzeFundingRate,
  analyzeWhaleActivity,
  analyzeOrderbook,
  analyzePortfolioCorrelation,
  type SurvivalInput,
  type EdgeInput,
  type RegimeInput,
  type EmotionInput,
} from "@/lib/crypto-intelligence-engine";
import {
  Shield, Skull, TrendingUp, Activity, Zap, Brain, BarChart3,
  AlertTriangle, Target, Wallet, ArrowUpDown, Eye, GitBranch,
} from "lucide-react";

// ── Color helpers ──
const LEVEL = {
  low: { text: "text-success", bg: "bg-success/10 border-success/20" },
  medium: { text: "text-warning", bg: "bg-warning/10 border-warning/20" },
  high: { text: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
} as const;

function riskColor(score: number, invert = false) {
  const s = invert ? 100 - score : score;
  if (s >= 70) return LEVEL.high;
  if (s >= 40) return LEVEL.medium;
  return LEVEL.low;
}

// ── Section wrapper ──
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function CryptoIntelligence() {
  // ── Shared survival input ──
  const [survival, setSurvival] = useState<SurvivalInput>({
    accountSize: 10000, winrate: 55, riskPerTrade: 2, rrr: 2, fees: 2, slippage: 1,
  });

  // ── Edge input ──
  const [edge, setEdge] = useState<EdgeInput>({
    winrate: 55, avgWin: 200, avgLoss: 100, recentWinrate: 50, entryAccuracy: 70, fees: 2,
  });

  // ── Regime input ──
  const [regime, setRegime] = useState<RegimeInput>({
    volatility: 5, trendStrength: 5, trendDirection: 2, volume: 6,
  });

  // ── Emotion input ──
  const [emotion, setEmotion] = useState<EmotionInput>({
    tradesPlanned: 5, tradesExecuted: 7, riskPerTrade: 2, maxRiskAllowed: 2,
    consecutiveLosses: 2, tradedAfterLoss: false, dailyLossReached: false,
    tradedAfterDailyLimit: false, avgHoldTime: 30, plannedHoldTime: 60,
  });

  // ── Deep crypto inputs ──
  const [liqEntry, setLiqEntry] = useState(50000);
  const [liqLeverage, setLiqLeverage] = useState(10);
  const [liqIsLong, setLiqIsLong] = useState(true);
  const [fundingRate, setFundingRate] = useState(0.01);
  const [fundingSize, setFundingSize] = useState(10000);
  const [whaleRatio, setWhaleRatio] = useState(35);
  const [whaleFlow, setWhaleFlow] = useState(500000);
  const [bidVol, setBidVol] = useState(1200000);
  const [askVol, setAskVol] = useState(800000);

  // ── Calculations ──
  const survivalResult = useMemo(() => calculateStrategySurvival(survival), [survival]);
  const edgeResult = useMemo(() => detectEdge(edge), [edge]);
  const regimeResult = useMemo(() => detectRegime(regime), [regime]);
  const emotionResult = useMemo(() => detectEmotionalTrading(emotion), [emotion]);

  const [timelineResults, setTimelineResults] = useState<ReturnType<typeof simulateCapitalTimeline> | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const runTimeline = useCallback(() => {
    setSimRunning(true);
    requestAnimationFrame(() => {
      setTimelineResults(simulateCapitalTimeline(survival));
      setSimRunning(false);
    });
  }, [survival]);

  const liqResult = useMemo(() => scanLiquidationDistance(liqEntry, liqLeverage, liqIsLong), [liqEntry, liqLeverage, liqIsLong]);
  const fundingResult = useMemo(() => analyzeFundingRate(fundingRate, fundingSize), [fundingRate, fundingSize]);
  const whaleResult = useMemo(() => analyzeWhaleActivity(whaleRatio, whaleFlow), [whaleRatio, whaleFlow]);
  const orderbookResult = useMemo(() => analyzeOrderbook(bidVol, askVol), [bidVol, askVol]);

  const portfolioResult = useMemo(() => analyzePortfolioCorrelation([
    { name: "BTC", allocation: 40, type: "btc_correlated" },
    { name: "ETH", allocation: 25, type: "eth_correlated" },
    { name: "SOL", allocation: 15, type: "alt" },
    { name: "USDT", allocation: 10, type: "stablecoin" },
    { name: "UNI", allocation: 10, type: "defi" },
  ]), []);

  // ── Slider helper ──
  const SliderField = ({ label, value, onChange, min, max, step = 1 }: {
    label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
  }) => (
    <div className="space-y-2">
      <Label className="text-xs">{label}: <span className="font-bold">{value}</span></Label>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-16">
        <PageHeader
          title="Crypto Trading Intelligence"
          description="Risk · Strategy · Capital Intelligence"
          badge="Advanced"
          badgeVariant="warning"
        />

        <Tabs defaultValue="survival" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="survival" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Survival</TabsTrigger>
            <TabsTrigger value="edge" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Edge</TabsTrigger>
            <TabsTrigger value="regime" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Regime</TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Timeline</TabsTrigger>
            <TabsTrigger value="emotion" className="gap-1.5"><Brain className="h-3.5 w-3.5" /> Emotion</TabsTrigger>
            <TabsTrigger value="deep" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Deep Tools</TabsTrigger>
          </TabsList>

          {/* ═══ TAB 1: Strategy Survival ═══ */}
          <TabsContent value="survival" className="space-y-6">
            <Section title="Strategy Survival Engine" icon={<Shield className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Account Size ($)</Label>
                      <Input type="number" value={survival.accountSize} onChange={e => setSurvival(p => ({ ...p, accountSize: +e.target.value }))} />
                    </div>
                    <SliderField label="Winrate %" value={survival.winrate} onChange={v => setSurvival(p => ({ ...p, winrate: v }))} min={10} max={90} />
                    <SliderField label="Risk/Trade %" value={survival.riskPerTrade} onChange={v => setSurvival(p => ({ ...p, riskPerTrade: v }))} min={0.5} max={20} step={0.5} />
                    <SliderField label="RRR" value={survival.rrr} onChange={v => setSurvival(p => ({ ...p, rrr: v }))} min={0.5} max={10} step={0.1} />
                    <div className="space-y-2">
                      <Label className="text-xs">Fees ($)</Label>
                      <Input type="number" value={survival.fees} onChange={e => setSurvival(p => ({ ...p, fees: +e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Slippage ($)</Label>
                      <Input type="number" value={survival.slippage} onChange={e => setSurvival(p => ({ ...p, slippage: +e.target.value }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Survival Score"
                  value={`${survivalResult.survivalScore}/100`}
                  sub={`Grade: ${survivalResult.grade}`}
                  level={survivalResult.survivalScore > 70 ? "low" : survivalResult.survivalScore > 40 ? "medium" : "high"}
                  progress={survivalResult.survivalScore}
                />
                <MetricCard
                  label="Risk of Ruin"
                  value={`${survivalResult.riskOfRuin}%`}
                  sub="Probability of account wipeout"
                  level={survivalResult.riskOfRuin < 10 ? "low" : survivalResult.riskOfRuin < 40 ? "medium" : "high"}
                  progress={survivalResult.riskOfRuin}
                >
                  <Skull className={cn("mt-2 h-4 w-4", survivalResult.riskOfRuin < 10 ? "text-success" : "text-destructive")} />
                </MetricCard>
                <MetricCard
                  label="Survival Probability"
                  value={`${survivalResult.survivalProbability}%`}
                  sub={`Over ${survivalResult.expectedLifetimeTrades} trades`}
                  level={survivalResult.survivalProbability > 80 ? "low" : survivalResult.survivalProbability > 50 ? "medium" : "high"}
                  progress={survivalResult.survivalProbability}
                />
                <MetricCard
                  label="Max Consecutive Losses"
                  value={survivalResult.maxConsecutiveLosses}
                  sub="Worst streak in simulation"
                  level={survivalResult.maxConsecutiveLosses < 8 ? "low" : survivalResult.maxConsecutiveLosses < 15 ? "medium" : "high"}
                />
              </div>
            </Section>
          </TabsContent>

          {/* ═══ TAB 2: AI Edge Detector ═══ */}
          <TabsContent value="edge" className="space-y-6">
            <Section title="AI Edge Detector" icon={<Target className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <SliderField label="Winrate %" value={edge.winrate} onChange={v => setEdge(p => ({ ...p, winrate: v }))} min={10} max={90} />
                    <div className="space-y-2">
                      <Label className="text-xs">Avg Win ($)</Label>
                      <Input type="number" value={edge.avgWin} onChange={e => setEdge(p => ({ ...p, avgWin: +e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Avg Loss ($)</Label>
                      <Input type="number" value={edge.avgLoss} onChange={e => setEdge(p => ({ ...p, avgLoss: +e.target.value }))} />
                    </div>
                    <SliderField label="Recent Winrate %" value={edge.recentWinrate} onChange={v => setEdge(p => ({ ...p, recentWinrate: v }))} min={0} max={100} />
                    <SliderField label="Entry Accuracy %" value={edge.entryAccuracy} onChange={v => setEdge(p => ({ ...p, entryAccuracy: v }))} min={0} max={100} />
                    <div className="space-y-2">
                      <Label className="text-xs">Fees ($)</Label>
                      <Input type="number" value={edge.fees} onChange={e => setEdge(p => ({ ...p, fees: +e.target.value }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Edge Score"
                  value={`${edgeResult.edgeScore}/100`}
                  sub={`Strength: ${edgeResult.edgeStrength}`}
                  level={edgeResult.edgeScore > 60 ? "low" : edgeResult.edgeScore > 30 ? "medium" : "high"}
                  progress={edgeResult.edgeScore}
                />
                <MetricCard
                  label="Expectancy"
                  value={`$${edgeResult.expectancy}`}
                  sub="Expected profit per trade"
                  level={edgeResult.expectancy > 0 ? "low" : "high"}
                />
                <MetricCard
                  label="Profit Factor"
                  value={edgeResult.profitFactor}
                  sub={edgeResult.profitFactor > 1.5 ? "Strong" : edgeResult.profitFactor > 1 ? "Marginal" : "Losing"}
                  level={edgeResult.profitFactor > 1.5 ? "low" : edgeResult.profitFactor > 1 ? "medium" : "high"}
                />
                <MetricCard
                  label="Entry Quality"
                  value={edgeResult.entryQuality}
                  sub={edgeResult.edgeDecline ? "⚠ Edge declining" : "Edge stable"}
                  level={edgeResult.entryQuality === "excellent" ? "low" : edgeResult.entryQuality === "good" ? "medium" : "high"}
                />
              </div>
            </Section>
          </TabsContent>

          {/* ═══ TAB 3: Market Regime AI ═══ */}
          <TabsContent value="regime" className="space-y-6">
            <Section title="Market Regime AI" icon={<BarChart3 className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SliderField label="Volatility" value={regime.volatility} onChange={v => setRegime(p => ({ ...p, volatility: v }))} min={1} max={10} />
                    <SliderField label="Trend Strength" value={regime.trendStrength} onChange={v => setRegime(p => ({ ...p, trendStrength: v }))} min={1} max={10} />
                    <SliderField label="Trend Direction" value={regime.trendDirection} onChange={v => setRegime(p => ({ ...p, trendDirection: v }))} min={-10} max={10} />
                    <SliderField label="Volume" value={regime.volume} onChange={v => setRegime(p => ({ ...p, volume: v }))} min={1} max={10} />
                  </div>
                </CardContent>
              </Card>

              <Card className={cn("border-2", LEVEL[regimeResult.regime === "bear_market" || regimeResult.regime === "high_volatility" ? "high" : regimeResult.regime === "sideways" ? "medium" : "low"].bg)}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{regimeResult.icon}</span>
                    <div>
                      <p className="text-2xl font-bold capitalize">{regimeResult.regime.replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">Confidence: {regimeResult.confidence}%</p>
                    </div>
                  </div>
                  <p className="text-sm">{regimeResult.strategy}</p>
                  {regimeResult.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-warning">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {w}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Section>
          </TabsContent>

          {/* ═══ TAB 4: Capital Survival Timeline ═══ */}
          <TabsContent value="timeline" className="space-y-6">
            <Section title="Capital Survival Timeline" icon={<Activity className="h-5 w-5 text-accent" />}>
              <div className="flex items-center gap-3">
                <Button onClick={runTimeline} disabled={simRunning} size="sm">
                  {simRunning ? "Simulating…" : "Run 300 Simulations"}
                </Button>
                <p className="text-xs text-muted-foreground">Uses current survival parameters</p>
              </div>

              {timelineResults ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {timelineResults.map(sc => {
                    const lvl = sc.survivalRate > 80 ? "low" as const : sc.survivalRate > 50 ? "medium" as const : "high" as const;
                    return (
                      <Card key={sc.trades} className={cn("border", LEVEL[lvl].bg)}>
                        <CardContent className="pt-5 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sc.trades} Trades</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Survival</span><span className={cn("font-bold", LEVEL[lvl].text)}>{sc.survivalRate}%</span></div>
                            <div className="flex justify-between"><span>Median Balance</span><span className="font-bold">${sc.medianBalance.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Worst (5th %ile)</span><span className="text-destructive font-bold">${sc.worstBalance.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Best (95th %ile)</span><span className="text-success font-bold">${sc.bestBalance.toLocaleString()}</span></div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Click "Run 300 Simulations" to project account survival across 100, 250, and 500 trades.</p>
              )}
            </Section>
          </TabsContent>

          {/* ═══ TAB 5: Emotional Trading Detector ═══ */}
          <TabsContent value="emotion" className="space-y-6">
            <Section title="Emotional Trading Detector" icon={<Brain className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Trades Planned</Label>
                      <Input type="number" value={emotion.tradesPlanned} onChange={e => setEmotion(p => ({ ...p, tradesPlanned: +e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Trades Executed</Label>
                      <Input type="number" value={emotion.tradesExecuted} onChange={e => setEmotion(p => ({ ...p, tradesExecuted: +e.target.value }))} />
                    </div>
                    <SliderField label="Risk/Trade %" value={emotion.riskPerTrade} onChange={v => setEmotion(p => ({ ...p, riskPerTrade: v }))} min={0.5} max={20} step={0.5} />
                    <SliderField label="Max Risk Allowed %" value={emotion.maxRiskAllowed} onChange={v => setEmotion(p => ({ ...p, maxRiskAllowed: v }))} min={0.5} max={20} step={0.5} />
                    <SliderField label="Consecutive Losses" value={emotion.consecutiveLosses} onChange={v => setEmotion(p => ({ ...p, consecutiveLosses: v }))} min={0} max={20} />
                    <div className="flex flex-col gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={emotion.tradedAfterLoss} onChange={e => setEmotion(p => ({ ...p, tradedAfterLoss: e.target.checked }))} className="rounded" />
                        Traded after loss streak
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={emotion.dailyLossReached} onChange={e => setEmotion(p => ({ ...p, dailyLossReached: e.target.checked }))} className="rounded" />
                        Daily loss limit reached
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={emotion.tradedAfterDailyLimit} onChange={e => setEmotion(p => ({ ...p, tradedAfterDailyLimit: e.target.checked }))} className="rounded" />
                        Traded past daily limit
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Emotion Score"
                  value={`${emotionResult.emotionScore}/100`}
                  sub={`Grade: ${emotionResult.grade}`}
                  level={emotionResult.emotionScore > 70 ? "low" : emotionResult.emotionScore > 40 ? "medium" : "high"}
                  progress={emotionResult.emotionScore}
                />
                <MetricCard
                  label="Overtrading"
                  value={emotionResult.overtrading ? "Detected" : "Clear"}
                  level={emotionResult.overtrading ? "high" : "low"}
                />
                <MetricCard
                  label="Tilt Behavior"
                  value={emotionResult.tiltDetected ? "Detected" : "Clear"}
                  level={emotionResult.tiltDetected ? "high" : "low"}
                />
                <MetricCard
                  label="Risk Violation"
                  value={emotionResult.riskViolation ? "Yes" : "No"}
                  level={emotionResult.riskViolation ? "high" : "low"}
                />
              </div>

              {emotionResult.warnings.length > 0 && (
                <Card className="border border-warning/20 bg-warning/5">
                  <CardContent className="pt-5 space-y-2">
                    {emotionResult.warnings.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-warning">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {w}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Section>
          </TabsContent>

          {/* ═══ TAB 6: Deep Crypto Tools ═══ */}
          <TabsContent value="deep" className="space-y-8">
            {/* Liquidation Distance */}
            <Section title="Liquidation Distance Scanner" icon={<Skull className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Entry Price ($)</Label>
                      <Input type="number" value={liqEntry} onChange={e => setLiqEntry(+e.target.value)} />
                    </div>
                    <SliderField label="Leverage" value={liqLeverage} onChange={setLiqLeverage} min={1} max={125} />
                    <div className="flex items-end gap-2 pb-1">
                      <Button size="sm" variant={liqIsLong ? "default" : "outline"} onClick={() => setLiqIsLong(true)}>Long</Button>
                      <Button size="sm" variant={!liqIsLong ? "default" : "outline"} onClick={() => setLiqIsLong(false)}>Short</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Liquidation Price" value={`$${liqResult.liquidationPrice.toLocaleString()}`} sub={`Distance: ${liqResult.distancePercent}%`} level={liqResult.riskLevel === "safe" ? "low" : liqResult.riskLevel === "warning" ? "medium" : "high"} />
                <MetricCard label="Safety Buffer" value={`${liqResult.safetyBuffer}%`} level={liqResult.riskLevel === "safe" ? "low" : liqResult.riskLevel === "warning" ? "medium" : "high"} progress={Math.min(100, liqResult.safetyBuffer)} />
                <MetricCard label="Risk Level" value={liqResult.riskLevel.toUpperCase()} level={liqResult.riskLevel === "safe" ? "low" : liqResult.riskLevel === "warning" ? "medium" : "high"} />
              </div>
            </Section>

            {/* Funding Rate */}
            <Section title="Funding Rate Analyzer" icon={<Wallet className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Funding Rate (%)</Label>
                      <Input type="number" value={fundingRate} onChange={e => setFundingRate(+e.target.value)} step={0.001} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Position Size ($)</Label>
                      <Input type="number" value={fundingSize} onChange={e => setFundingSize(+e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Annualized Rate" value={`${fundingResult.annualizedRate}%`} sub={`Sentiment: ${fundingResult.sentiment}`} level={Math.abs(fundingResult.annualizedRate) > 50 ? "high" : Math.abs(fundingResult.annualizedRate) > 20 ? "medium" : "low"} />
                <MetricCard label="Cost / 24h" value={`$${fundingResult.costPer24h}`} level={fundingResult.costPer24h > 50 ? "high" : fundingResult.costPer24h > 10 ? "medium" : "low"} />
                <Card className="p-5"><p className="section-label mb-2">Recommendation</p><p className="text-sm">{fundingResult.recommendation}</p></Card>
              </div>
            </Section>

            {/* Whale Activity */}
            <Section title="Whale Activity Monitor" icon={<Eye className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SliderField label="Large Order Ratio %" value={whaleRatio} onChange={setWhaleRatio} min={0} max={100} />
                    <div className="space-y-2">
                      <Label className="text-xs">Net Flow ($)</Label>
                      <Input type="number" value={whaleFlow} onChange={e => setWhaleFlow(+e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Impact Score" value={`${whaleResult.impactScore}/100`} progress={whaleResult.impactScore} level={whaleResult.impactScore > 60 ? "high" : whaleResult.impactScore > 30 ? "medium" : "low"} />
                <MetricCard label="Direction" value={whaleResult.direction} level={whaleResult.direction === "distribution" ? "high" : whaleResult.direction === "accumulation" ? "low" : "medium"} />
                <Card className="p-5"><p className="section-label mb-2">Pressure</p><p className="text-sm">{whaleResult.pressure}</p></Card>
              </div>
            </Section>

            {/* Orderbook Imbalance */}
            <Section title="Orderbook Imbalance" icon={<ArrowUpDown className="h-5 w-5 text-accent" />}>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Bid Volume ($)</Label>
                      <Input type="number" value={bidVol} onChange={e => setBidVol(+e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Ask Volume ($)</Label>
                      <Input type="number" value={askVol} onChange={e => setAskVol(+e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Imbalance Ratio" value={orderbookResult.imbalanceRatio} sub={`Pressure: ${orderbookResult.pressure}`} level={orderbookResult.pressure === "sell" ? "high" : orderbookResult.pressure === "buy" ? "low" : "medium"} />
                <MetricCard label="Strength" value={`${orderbookResult.strength}%`} progress={orderbookResult.strength} level={orderbookResult.strength > 50 ? "high" : orderbookResult.strength > 20 ? "medium" : "low"} />
                <Card className="p-5"><p className="section-label mb-2">Signal</p><p className="text-sm">{orderbookResult.signal}</p></Card>
              </div>
            </Section>

            {/* Portfolio Correlation */}
            <Section title="Portfolio Correlation Map" icon={<GitBranch className="h-5 w-5 text-accent" />}>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Concentration Risk" value={`${portfolioResult.concentrationRisk}%`} progress={portfolioResult.concentrationRisk} level={portfolioResult.concentrationRisk > 60 ? "high" : portfolioResult.concentrationRisk > 30 ? "medium" : "low"} />
                <MetricCard label="Diversification Score" value={`${portfolioResult.diversificationScore}/100`} progress={portfolioResult.diversificationScore} level={portfolioResult.diversificationScore > 60 ? "low" : portfolioResult.diversificationScore > 30 ? "medium" : "high"} />
                <Card className="p-5"><p className="section-label mb-2">Recommendation</p><p className="text-sm">{portfolioResult.recommendation}</p></Card>
              </div>
              <div className="grid gap-2 sm:grid-cols-5">
                {portfolioResult.entries.map(e => (
                  <Card key={e.asset} className="p-4 text-center">
                    <p className="text-lg font-bold">{e.asset}</p>
                    <p className="text-xs text-muted-foreground">{e.allocation}%</p>
                    <Badge variant="outline" className={cn("mt-1 text-[10px]",
                      e.correlationGroup === "high" ? "border-destructive/30 text-destructive" :
                      e.correlationGroup === "medium" ? "border-warning/30 text-warning" :
                      "border-success/30 text-success"
                    )}>{e.correlationGroup} corr</Badge>
                  </Card>
                ))}
              </div>
            </Section>
          </TabsContent>
        </Tabs>

        <FinancialDisclaimer />
      </div>
    </DashboardLayout>
  );
}
