// Features 6-10: Equity Curve, Streak Analyzer, Risk-Adjusted Returns, Time Heatmap, Fee Impact
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Activity, Clock, DollarSign, BarChart3 } from "lucide-react";
import {
  calculateRiskAdjustedReturns,
  analyzeStreaks,
  analyzeTimePerformance,
  calculateFeeImpact,
} from "@/lib/crypto-advanced-engines";
import { simulateTrades } from "@/lib/trading-intelligence";

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
  tradesPerMonth: number;
  avgCommission: number;
  avgSlippage: number;
  trades?: TradeRecord[];
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

export function AdvancedAnalytics({ winrate, riskPerTrade, rrr, accountSize, tradesPerMonth, avgCommission, avgSlippage, trades = [] }: Props) {
  const [simTrades, setSimTrades] = useState(200);
  const hasTrades = trades.length > 0;

  // Equity Curve (simulation-based, always available)
  const simulation = useMemo(() => simulateTrades(winrate, rrr, riskPerTrade, accountSize, simTrades), [winrate, rrr, riskPerTrade, accountSize, simTrades]);
  const curveData = simulation.equityCurve.map((v, i) => ({ trade: i, balance: v }));

  // Streaks – from real trades only
  const streakResults = useMemo(() => trades.map(t => t.win ? "win" as const : "loss" as const), [trades]);
  const streaks = useMemo(() => hasTrades ? analyzeStreaks(streakResults) : null, [streakResults, hasTrades]);

  // Risk-Adjusted Returns – from real trades only
  const monthlyReturns = useMemo(() => {
    if (!hasTrades) return [];
    // Group trades by month and calculate returns
    const monthlyPnl: number[] = [];
    const perMonth = Math.max(1, Math.ceil(trades.length / 12));
    for (let i = 0; i < trades.length; i += perMonth) {
      const chunk = trades.slice(i, i + perMonth);
      const totalPnl = chunk.reduce((s, t) => s + t.pnl, 0);
      monthlyPnl.push(Math.round((totalPnl / accountSize) * 100 * 100) / 100);
    }
    return monthlyPnl;
  }, [trades, hasTrades, accountSize]);
  const riskAdj = useMemo(() => monthlyReturns.length > 0 ? calculateRiskAdjustedReturns(monthlyReturns) : null, [monthlyReturns]);

  // Time-of-Day – from real trades only
  const timePerf = useMemo(() => hasTrades ? analyzeTimePerformance(trades.map(t => ({ hour: t.hour, pnl: t.pnl, win: t.win }))) : [], [trades, hasTrades]);

  // Fee Impact (calculation-based, always available)
  const monthlyProfit = Math.round(simulation.avgReturn / 100 * accountSize / (simTrades / tradesPerMonth));
  const fees = useMemo(() => calculateFeeImpact(tradesPerMonth, avgCommission, avgSlippage, accountSize, monthlyProfit), [tradesPerMonth, avgCommission, avgSlippage, accountSize, monthlyProfit]);

  return (
    <Tabs defaultValue="equity" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="equity" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Equity Curve</TabsTrigger>
        <TabsTrigger value="streaks" className="text-xs gap-1"><Activity className="h-3 w-3" /> Streaks</TabsTrigger>
        <TabsTrigger value="risk-adj" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Risk-Adjusted</TabsTrigger>
        <TabsTrigger value="time" className="text-xs gap-1"><Clock className="h-3 w-3" /> Time Analysis</TabsTrigger>
        <TabsTrigger value="fees" className="text-xs gap-1"><DollarSign className="h-3 w-3" /> Fee Impact</TabsTrigger>
      </TabsList>

      {/* 6. Equity Curve (simulation) */}
      <TabsContent value="equity">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Equity Curve Simulation</h3>
            <div className="flex items-center gap-2 w-40">
              <span className="text-[10px] text-muted-foreground">{simTrades} Trades</span>
              <Slider value={[simTrades]} onValueChange={([v]) => setSimTrades(v)} min={50} max={500} step={50} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curveData}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="trade" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tickLine={false} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} />
                <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="url(#eqGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            <BigNum label="Final" value={`$${simulation.finalBalance.toLocaleString()}`} color={simulation.finalBalance > accountSize ? "text-green-500" : "text-destructive"} />
            <BigNum label="Return" value={`${simulation.avgReturn}%`} color={simulation.avgReturn > 0 ? "text-green-500" : "text-destructive"} />
            <BigNum label="Max DD" value={`${simulation.maxDrawdown}%`} color="text-yellow-500" />
            <BigNum label="Profit Prob." value={`${simulation.profitProbability}%`} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">Basiert auf deinen aktuellen Parametern (Winrate, RRR, Risk/Trade) – keine echten Trade-Daten.</p>
        </Card>
      </TabsContent>

      {/* 7. Streak Analyzer */}
      <TabsContent value="streaks">
        {!streaks ? (
          <EmptyState title="Keine Trade-Daten" description="Verbinde deinen Exchange-Account oder trage Trades im Journal ein, um Streak-Analysen zu sehen." />
        ) : (
          <Card>
            <h3 className="text-sm font-semibold mb-4">Win/Loss Streak Analyzer</h3>
            <div className="grid sm:grid-cols-4 gap-4 mb-4">
              <BigNum label="Aktuelle Serie" value={`${streaks.currentStreak} ${streaks.currentStreakType === "win" ? "W" : "L"}`} color={streaks.currentStreakType === "win" ? "text-green-500" : "text-destructive"} />
              <BigNum label="Längste Win" value={`${streaks.longestWinStreak}`} color="text-green-500" />
              <BigNum label="Längste Loss" value={`${streaks.longestLossStreak}`} color="text-destructive" />
              <BigNum label="Tilt Risiko" value={streaks.tiltRisk.toUpperCase()} color={streaks.tiltRisk === "low" ? "text-green-500" : streaks.tiltRisk === "medium" ? "text-yellow-500" : "text-destructive"} />
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {streakResults.slice(-50).map((r, i) => (
                <div key={i} className={cn("h-4 w-4 rounded-sm", r === "win" ? "bg-green-500" : "bg-destructive")} title={r} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{streaks.pattern}</p>
          </Card>
        )}
      </TabsContent>

      {/* 8. Risk-Adjusted Returns */}
      <TabsContent value="risk-adj">
        {!riskAdj ? (
          <EmptyState title="Keine Trade-Daten" description="Verbinde deinen Exchange-Account oder trage Trades im Journal ein, um Risk-Adjusted Returns zu berechnen." />
        ) : (
          <Card>
            <h3 className="text-sm font-semibold mb-4">Risk-Adjusted Returns</h3>
            <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <BigNum label="Sharpe" value={`${riskAdj.sharpeRatio}`} color={riskAdj.sharpeRatio > 1 ? "text-green-500" : riskAdj.sharpeRatio > 0 ? "text-yellow-500" : "text-destructive"} sub="Risk/Return" />
              <BigNum label="Sortino" value={`${riskAdj.sortinoRatio}`} color={riskAdj.sortinoRatio > 1.5 ? "text-green-500" : "text-yellow-500"} sub="Downside Risk" />
              <BigNum label="Calmar" value={`${riskAdj.calmarRatio}`} sub="Return/MaxDD" />
              <BigNum label="Ann. Return" value={`${riskAdj.annualizedReturn}%`} color={riskAdj.annualizedReturn > 0 ? "text-green-500" : "text-destructive"} />
              <BigNum label="Volatility" value={`${riskAdj.volatility}%`} />
              <BigNum label="Grade" value={riskAdj.grade} color={riskAdj.grade === "A" ? "text-green-500" : riskAdj.grade === "F" ? "text-destructive" : "text-yellow-500"} />
            </div>
          </Card>
        )}
      </TabsContent>

      {/* 9. Time-of-Day Performance */}
      <TabsContent value="time">
        {timePerf.length === 0 ? (
          <EmptyState title="Keine Trade-Daten" description="Verbinde deinen Exchange-Account oder trage Trades im Journal ein, um Performance nach Tageszeit zu analysieren." />
        ) : (
          <Card>
            <h3 className="text-sm font-semibold mb-4">Performance nach Tageszeit</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timePerf.filter(t => t.trades > 0)}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={v => `${v}h`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}€`} />
                  <Tooltip formatter={(v: number) => [`${v}€`, "Avg PnL"]} />
                  <Bar dataKey="avgPnl">
                    {timePerf.filter(t => t.trades > 0).map((t, i) => (
                      <Cell key={i} fill={t.avgPnl >= 0 ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-6 gap-1 mt-4">
              {timePerf.map(t => (
                <div key={t.hour} className="text-center" title={`${t.hour}:00 – ${t.trades} Trades, WR: ${t.winrate}%`}>
                  <div className="h-6 w-full rounded" style={{ backgroundColor: t.color, opacity: t.trades > 0 ? 0.8 : 0.15 }} />
                  <span className="text-[8px] text-muted-foreground">{t.hour}h</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </TabsContent>

      {/* 10. Fee Impact */}
      <TabsContent value="fees">
        <Card>
          <h3 className="text-sm font-semibold mb-4">Fee Impact Calculator</h3>
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <BigNum label="Monatl. Gebühren" value={`${fees.monthlyFees}€`} color="text-destructive" />
            <BigNum label="Jährl. Gebühren" value={`${fees.yearlyFees}€`} color="text-destructive" />
            <BigNum label="% vom Profit" value={`${fees.feeAsPercentOfProfit}%`} color={fees.feeAsPercentOfProfit > 20 ? "text-destructive" : "text-yellow-500"} />
            <BigNum label="% vom Account" value={`${fees.feeAsPercentOfAccount}%`} />
            <BigNum label="Break-Even Trades" value={`${fees.breakEvenTradesLost}`} sub="verloren durch Fees" />
          </div>
          <div className={cn("rounded-xl border p-3 text-sm", fees.feeAsPercentOfProfit > 30 ? "bg-destructive/10 border-destructive/20" : "bg-muted/30")}>
            <DollarSign className="h-4 w-4 inline mr-1" />
            {fees.recommendation}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
