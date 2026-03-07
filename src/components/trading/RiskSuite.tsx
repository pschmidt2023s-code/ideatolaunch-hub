// Features 11(enhanced), 12, 13, 15, 16, 17, 19, 20
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Zap, Brain, Gauge, Target, TrendingDown, Activity } from "lucide-react";
import {
  runPortfolioStressTest,
  calculateDrawdownRecovery,
  calculateSentiment,
  detectTradePatterns,
  checkDailyLossLimit,
} from "@/lib/crypto-advanced-engines";
import { analyzeStrategyEdge } from "@/lib/trading-intelligence";

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-5", className)}>{children}</div>;
}

function BigNum({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn("text-2xl font-bold tabular-nums mt-1", color)}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface TradeRecord {
  win: boolean;
  pnl: number;
  size: number;
  holdTime: number;
  dayOfWeek: number;
  hour: number;
}

interface Props {
  winrate: number;
  riskPerTrade: number;
  rrr: number;
  accountSize: number;
  avgWin: number;
  avgLoss: number;
  tradesPerDay: number;
  leverage: number;
  volatility: number;
  trendDirection: number;
  volume: number;
  fundingRate: number;
  trades?: TradeRecord[];
  positions?: Array<{ symbol: string; size: number; leverage: number; isLong: boolean; entryPrice: number }>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <div className="text-center py-10">
        <Activity className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm mx-auto">{description}</p>
      </div>
    </Card>
  );
}

export function RiskSuite({
  winrate, riskPerTrade, rrr, accountSize, avgWin, avgLoss,
  tradesPerDay, leverage, volatility, trendDirection, volume, fundingRate,
  trades = [], positions = []
}: Props) {
  const [currentDrawdown, setCurrentDrawdown] = useState(12);
  const [dailyLoss, setDailyLoss] = useState(150);
  const [dailyLimitPct, setDailyLimitPct] = useState(3);
  const hasTrades = trades.length > 0;
  const hasPositions = positions.length > 0;

  // AI Position Sizer (Kelly) – calculation-based, always available
  const edge = useMemo(() => analyzeStrategyEdge(winrate, avgWin, avgLoss), [winrate, avgWin, avgLoss]);
  const kellySize = Math.round(edge.kellyPercent * accountSize / 100);
  const halfKelly = Math.round(kellySize / 2);

  // Sentiment – calculation-based, always available
  const sentiment = useMemo(() => calculateSentiment(volatility, trendDirection, volume, fundingRate), [volatility, trendDirection, volume, fundingRate]);

  // Pattern Recognition – requires real trades
  const patterns = useMemo(() => hasTrades ? detectTradePatterns(trades) : [], [trades, hasTrades]);

  // Daily Loss Limit – calculation-based
  const lossLimit = useMemo(() => checkDailyLossLimit(dailyLoss, dailyLimitPct, accountSize), [dailyLoss, dailyLimitPct, accountSize]);

  // Stress Test – requires positions
  const stressResults = useMemo(() => hasPositions ? runPortfolioStressTest(positions, accountSize) : [], [positions, accountSize, hasPositions]);

  // Drawdown Recovery – calculation-based
  const recovery = useMemo(() => calculateDrawdownRecovery(currentDrawdown, riskPerTrade * rrr, winrate, tradesPerDay), [currentDrawdown, riskPerTrade, rrr, winrate, tradesPerDay]);

  return (
    <Tabs defaultValue="loss-limit" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="loss-limit" className="text-xs gap-1"><Shield className="h-3 w-3" /> Loss Limit</TabsTrigger>
        <TabsTrigger value="stress" className="text-xs gap-1"><Zap className="h-3 w-3" /> Stress Test</TabsTrigger>
        <TabsTrigger value="sentiment" className="text-xs gap-1"><Gauge className="h-3 w-3" /> Sentiment</TabsTrigger>
        <TabsTrigger value="position-sizer" className="text-xs gap-1"><Target className="h-3 w-3" /> Position Sizer</TabsTrigger>
        <TabsTrigger value="patterns" className="text-xs gap-1"><Brain className="h-3 w-3" /> Patterns</TabsTrigger>
        <TabsTrigger value="recovery" className="text-xs gap-1"><TrendingDown className="h-3 w-3" /> Recovery</TabsTrigger>
      </TabsList>

      {/* 16. Daily Loss Limit Guardian */}
      <TabsContent value="loss-limit">
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Shield className="h-4 w-4" /> Daily Loss Limit Guardian</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Aktueller Tagesverlust (€)</label>
              <Slider value={[dailyLoss]} onValueChange={([v]) => setDailyLoss(v)} min={0} max={accountSize * 0.1} step={10} />
              <span className="text-xs font-medium">{dailyLoss}€</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Daily Limit (%)</label>
              <Slider value={[dailyLimitPct]} onValueChange={([v]) => setDailyLimitPct(v)} min={1} max={10} step={0.5} />
              <span className="text-xs font-medium">{dailyLimitPct}%</span>
            </div>
          </div>
          <div className={cn("rounded-xl border-2 p-6 text-center", 
            lossLimit.status === "safe" ? "border-green-500/30 bg-green-500/5" :
            lossLimit.status === "approaching" ? "border-yellow-500/30 bg-yellow-500/5" :
            lossLimit.status === "reached" ? "border-orange-500/30 bg-orange-500/5" :
            "border-destructive/30 bg-destructive/5"
          )}>
            <p className="text-4xl mb-2">{lossLimit.icon}</p>
            <p className="text-lg font-bold">{lossLimit.percentUsed}% verbraucht</p>
            <Progress value={Math.min(100, lossLimit.percentUsed)} className="mt-3 h-3" />
            <p className="text-sm mt-3">{lossLimit.message}</p>
            <p className="text-xs text-muted-foreground mt-1">Restbudget: {lossLimit.remainingBudget}€ von {lossLimit.dailyLimit}€</p>
          </div>
        </Card>
      </TabsContent>

      {/* 17. Portfolio Stress Test */}
      <TabsContent value="stress">
        {!hasPositions ? (
          <EmptyState title="Keine offenen Positionen" description="Verbinde deinen Exchange-Account, um deine echten Positionen einem Stress Test zu unterziehen." />
        ) : (
          <Card>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Zap className="h-4 w-4" /> Portfolio Stress Test</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stressResults.map(sc => (
                <div key={sc.scenario} className={cn("rounded-xl border p-4",
                  sc.liquidationTriggered ? "bg-destructive/10 border-destructive/20" :
                  sc.marginCallTriggered ? "bg-yellow-500/10 border-yellow-500/20" :
                  sc.portfolioImpact > 0 ? "bg-green-500/5 border-green-500/20" : "bg-muted/30"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{sc.icon}</span>
                    <span className="text-xs font-semibold">{sc.scenario}</span>
                  </div>
                  <p className={cn("text-2xl font-bold tabular-nums", sc.portfolioImpact >= 0 ? "text-green-500" : "text-destructive")}>
                    {sc.portfolioImpact >= 0 ? "+" : ""}{sc.portfolioImpact}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Neues Balance: ${sc.newBalance.toLocaleString()}</p>
                  {sc.liquidationTriggered && <p className="text-[10px] text-destructive font-bold mt-1">⚠ LIQUIDATION</p>}
                  {sc.marginCallTriggered && !sc.liquidationTriggered && <p className="text-[10px] text-yellow-600 font-bold mt-1">⚠ MARGIN CALL</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </TabsContent>

      {/* 13. Sentiment Pulse */}
      <TabsContent value="sentiment">
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Gauge className="h-4 w-4" /> Sentiment Pulse</h3>
          <div className="flex flex-col items-center py-6">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 100 60" className="w-full h-full">
                <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round" />
                <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={sentiment.fearGreedIndex >= 60 ? "hsl(142 76% 36%)" : sentiment.fearGreedIndex >= 40 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)"} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${sentiment.fearGreedIndex * 1.26} 126`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <span className="text-3xl font-bold">{sentiment.fearGreedIndex}</span>
                <span className="text-xs text-muted-foreground">{sentiment.label}</span>
              </div>
            </div>
            <p className="text-sm mt-4 text-center max-w-md">{sentiment.suggestion}</p>
          </div>
        </Card>
      </TabsContent>

      {/* 12. AI Position Sizer */}
      <TabsContent value="position-sizer">
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Target className="h-4 w-4" /> AI Position Sizer (Kelly Criterion)</h3>
          <div className="grid sm:grid-cols-4 gap-4 mb-4">
            <BigNum label="Kelly %" value={`${edge.kellyPercent}%`} color={edge.kellyPercent > 0 ? "text-green-500" : "text-destructive"} sub="Optimale Allokation" />
            <BigNum label="Full Kelly" value={`${kellySize}€`} sub="Aggressive Sizing" />
            <BigNum label="Half Kelly" value={`${halfKelly}€`} color="text-green-500" sub="★ Empfohlen" />
            <BigNum label="Profit Factor" value={`${edge.profitFactor}`} color={edge.profitFactor >= 1.5 ? "text-green-500" : "text-yellow-500"} />
          </div>
          <div className="rounded-xl bg-muted/30 border p-4 text-sm">
            <p>💡 <strong>Half Kelly</strong> ist der goldene Standard: Maximaler langfristiger Kapitalzuwachs bei halbem Risiko im Vergleich zu Full Kelly.</p>
            <p className="text-xs text-muted-foreground mt-2">Edge Quality: <span className="font-medium capitalize">{edge.edgeQuality}</span> · Expectancy: {edge.expectancy}€/Trade</p>
          </div>
        </Card>
      </TabsContent>

      {/* 15. Pattern Recognition */}
      <TabsContent value="patterns">
        {!hasTrades ? (
          <EmptyState title="Keine Trade-Daten" description="Verbinde deinen Exchange-Account oder trage Trades im Journal ein, um Trading-Patterns zu erkennen." />
        ) : (
          <Card>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Brain className="h-4 w-4" /> Pattern Recognition</h3>
            <div className="space-y-3">
              {patterns.map((p, i) => (
                <div key={i} className={cn("rounded-xl border p-4 flex items-start gap-3",
                  p.severity === "critical" ? "bg-destructive/10 border-destructive/20" :
                  p.severity === "warning" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-muted/30"
                )}>
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{p.pattern}</p>
                      {p.frequency > 0 && <span className="text-[10px] font-medium bg-muted rounded-full px-2 py-0.5">{p.frequency}%</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                  </div>
                  {p.severity !== "info" && <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-1", p.severity === "critical" ? "text-destructive" : "text-yellow-500")} />}
                </div>
              ))}
            </div>
          </Card>
        )}
      </TabsContent>

      {/* 19. Drawdown Recovery */}
      <TabsContent value="recovery">
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Drawdown Recovery Calculator</h3>
          <div className="mb-4 space-y-2">
            <label className="text-xs text-muted-foreground">Aktueller Drawdown (%)</label>
            <Slider value={[currentDrawdown]} onValueChange={([v]) => setCurrentDrawdown(v)} min={1} max={80} step={1} />
            <span className="text-xs font-medium">{currentDrawdown}%</span>
          </div>
          <div className="grid sm:grid-cols-4 gap-4 mb-4">
            <BigNum label="Benötigter Gain" value={`+${recovery.requiredGain}%`} color={recovery.requiredGain < 30 ? "text-yellow-500" : "text-destructive"} />
            <BigNum label="Trades nötig" value={`${recovery.tradesNeeded}`} />
            <BigNum label="Geschätzte Tage" value={`${recovery.estimatedDays}`} />
            <BigNum label="Schwierigkeit" value={recovery.difficulty.toUpperCase()} color={
              recovery.difficulty === "easy" ? "text-green-500" : recovery.difficulty === "moderate" ? "text-yellow-500" : "text-destructive"
            } />
          </div>
          <div className="rounded-xl bg-muted/30 border p-4">
            <p className="text-sm">
              {recovery.difficulty === "extreme"
                ? "🚨 Bei >50% Drawdown ist eine vollständige Recovery extrem unwahrscheinlich. Account-Reset erwägen."
                : recovery.difficulty === "hard"
                ? "⚠️ Erheblicher Drawdown – Positionsgrößen reduzieren und diszipliniert traden."
                : "✅ Recovery ist realistisch bei konsequentem Risikomanagement."}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Beispiel: Bei {currentDrawdown}% Verlust muss das Konto um {recovery.requiredGain}% steigen, um Break-Even zu erreichen.
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
