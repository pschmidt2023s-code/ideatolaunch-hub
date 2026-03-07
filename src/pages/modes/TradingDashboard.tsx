import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { SEO } from "@/components/SEO";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MoneyCard } from "@/components/dashboard/MoneyCard";
import { RiskCard } from "@/components/dashboard/RiskCard";
import { ExecutionCard } from "@/components/dashboard/ExecutionCard";
import { CEOSection } from "@/components/dashboard/CEOSection";
import { TradingForecastPanel } from "@/components/dashboard/ForecastPanel";
import { FinancialDisclaimer } from "@/components/dashboard/FinancialDisclaimer";
import { MetricOnboarding } from "@/components/dashboard/MetricOnboarding";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, Target, BarChart3, Shield, Plus, Trash2, ChevronDown, ChevronRight, BookOpen, Wallet, Loader2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildTradingForecast } from "@/lib/signal-engine";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { ScenarioMode } from "@/lib/command-center-types";
import {
  getTradingDefaults,
  buildTradingStatus,
  buildTradingMoney,
  buildTradingRisks,
  buildTradingActions,
  calculateProfitFactor,
  calculateExpectancy,
  calculateAccountSurvival,
  calculateNetMonthlyPnL,
  type TradingInput,
  type TradingPair,
  type TradingStrategy,
  type TradingMarket,
  type TradingSession,
} from "@/lib/trading-engine";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistisch" },
  { value: "realistic", label: "Realistisch" },
  { value: "worst-case", label: "Worst Case" },
];

const STRATEGIES: { value: TradingStrategy; label: string }[] = [
  { value: "scalping", label: "Scalping" },
  { value: "daytrading", label: "Daytrading" },
  { value: "swing", label: "Swing Trading" },
  { value: "position", label: "Position Trading" },
];

const MARKETS: { value: TradingMarket; label: string }[] = [
  { value: "forex", label: "Forex" },
  { value: "stocks", label: "Aktien" },
  { value: "crypto", label: "Crypto" },
  { value: "futures", label: "Futures" },
  { value: "options", label: "Optionen" },
];

const SESSIONS: { value: TradingSession; label: string }[] = [
  { value: "london", label: "London" },
  { value: "newyork", label: "New York" },
  { value: "asia", label: "Asien" },
  { value: "all", label: "Alle" },
];

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left">
        <span className="text-sm font-semibold">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t px-4 pb-4 pt-3 space-y-4">{children}</div>}
    </div>
  );
}

export default function TradingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const [input, setInput] = useState<TradingInput>(getTradingDefaults());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null); // null = loading
  const [accountCount, setAccountCount] = useState(0);

  // Check if user has connected trading accounts
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data, error } = await (supabase as any)
        .from("trading_accounts")
        .select("id, account_data, balances, risk_metrics")
        .eq("user_id", user.id);
      if (error || !data || data.length === 0) {
        setHasAccounts(false);
        setAccountCount(0);
        return;
      }
      setHasAccounts(true);
      setAccountCount(data.length);

      // Populate input from real account data
      const totalEquity = data.reduce((s: number, a: any) => s + (a.account_data?.totalEquity || 0), 0);
      if (totalEquity > 0) {
        setInput(prev => ({ ...prev, accountBalance: Math.round(totalEquity) }));
      }
    };
    check();
  }, [user]);

  const update = (key: keyof TradingInput, value: number | string) => setInput((p) => ({ ...p, [key]: value }));

  const updatePair = (idx: number, patch: Partial<TradingPair>) => {
    const next = [...input.tradingPairs];
    next[idx] = { ...next[idx], ...patch };
    setInput(p => ({ ...p, tradingPairs: next }));
  };
  const addPair = () => setInput(p => ({ ...p, tradingPairs: [...p.tradingPairs, { id: `p${Date.now()}`, name: "Neues Paar", market: p.primaryMarket, avgSpread: 1, allocation: 0 }] }));
  const removePair = (idx: number) => setInput(p => ({ ...p, tradingPairs: p.tradingPairs.filter((_, i) => i !== idx) }));

  const status = buildTradingStatus(input, mode);
  const money = buildTradingMoney(input, mode);
  const risks = buildTradingRisks(input);
  const actions = buildTradingActions(input);
  const pf = calculateProfitFactor(input);
  const expectancy = calculateExpectancy(input);
  const survival = calculateAccountSurvival(input);
  const netMonthly = calculateNetMonthlyPnL(input);
  const tradingForecast = useMemo(() => buildTradingForecast(input), [input]);

  // Loading state
  if (hasAccounts === null) {
    return (
      <DashboardLayout>
        <SEO title="Trading Mode – BrandOS" description="Trading Risk Score, Drawdown, Winrate, Profit Factor." path="/dashboard/trading" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Empty state — no connected accounts
  if (!hasAccounts) {
    return (
      <DashboardLayout>
        <SEO title="Trading Mode – BrandOS" description="Trading Risk Score, Drawdown, Winrate, Profit Factor." path="/dashboard/trading" />
        <div className="animate-fade-in space-y-8">
          <PageHeader title="Trading Mode" description="Risk, Performance & Account Survival auf einen Blick." badge="TRADER" badgeVariant="warning" />
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Wallet className="h-14 w-14 text-muted-foreground/30 mb-5" />
              <h3 className="text-xl font-semibold">Kein Trading Account verbunden</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Verbinde deinen ersten Exchange-Account um dein Portfolio, Risiko und Performance in Echtzeit analysieren zu lassen.
              </p>
              <div className="flex gap-3 mt-8">
                <Button onClick={() => navigate("/dashboard/accounts")}>
                  <Link2 className="h-4 w-4 mr-2" />Exchange verbinden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Trading Mode – BrandOS" description="Trading Risk Score, Drawdown, Winrate, Profit Factor." path="/dashboard/trading" />
      <MetricOnboarding mode="trading" open={showOnboarding} onOpenChange={setShowOnboarding} />
      <div className="animate-fade-in space-y-8">
        <div className="flex items-center justify-between">
          <PageHeader title="Trading Mode" description="Risk, Performance & Account Survival auf einen Blick." badge="TRADER" badgeVariant="warning" />
          <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)} className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Metriken lernen
          </Button>
        </div>

        <CEOSection>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span>Simulation – passe deine Werte an</span>
            </div>
          </div>

          <StatusBar status={status} />

          {/* Mode Toggle */}
          <div className="flex items-center gap-4">
            <span className="section-label">Reality Mode</span>
            <div className="inline-flex rounded-2xl bg-muted p-1">
              {MODES.map(({ value, label }) => (
                <button key={value} onClick={() => setMode(value)} className={cn("rounded-xl px-5 py-2 text-xs font-medium transition-all", mode === value ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Profit Factor", value: pf.toFixed(2), icon: TrendingUp, color: pf >= 1.5 ? "text-success" : pf >= 1 ? "text-warning" : "text-destructive" },
              { label: "Expectancy", value: `${expectancy > 0 ? "+" : ""}${expectancy} €`, icon: Target, color: expectancy > 0 ? "text-success" : "text-destructive" },
              { label: "Account Survival", value: `${survival}%`, icon: Shield, color: survival > 80 ? "text-success" : survival > 50 ? "text-warning" : "text-destructive" },
              { label: "Drawdown", value: `${input.currentDrawdown}%`, icon: BarChart3, color: input.currentDrawdown < 10 ? "text-success" : input.currentDrawdown < 20 ? "text-warning" : "text-destructive" },
              { label: "Netto/Monat", value: `${netMonthly > 0 ? "+" : ""}${netMonthly} €`, icon: TrendingUp, color: netMonthly > 0 ? "text-success" : "text-destructive" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border bg-card p-4 text-center">
                <kpi.icon className={cn("h-5 w-5 mx-auto mb-2", kpi.color)} />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={cn("text-2xl font-bold tabular-nums", kpi.color)}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Top 3 Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedCard index={0}><MoneyCard data={money} /></AnimatedCard>
            <AnimatedCard index={1}><RiskCard risks={risks} /></AnimatedCard>
            <AnimatedCard index={2}><ExecutionCard actions={actions} /></AnimatedCard>
          </div>
        </CEOSection>

        {/* ── Trading Setup ── */}
        <CollapsibleSection title="Trading Setup" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Strategie</label>
              <Select value={input.strategy} onValueChange={(v) => update("strategy", v)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STRATEGIES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Primärer Markt</label>
              <Select value={input.primaryMarket} onValueChange={(v) => update("primaryMarket", v)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{MARKETS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Session</label>
              <Select value={input.session} onValueChange={(v) => update("session", v)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{SESSIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Leverage</label>
              <div className="flex items-center gap-2">
                <Input type="number" value={input.leverage} onChange={(e) => update("leverage", Number(e.target.value))} className="h-9 text-xs" min={1} max={500} />
                <span className="text-xs text-muted-foreground">x</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ── Trading Pairs ── */}
        <CollapsibleSection title={`Trading Pairs (${input.tradingPairs.length})`} defaultOpen>
          {input.tradingPairs.map((pair, idx) => (
            <div key={pair.id} className="grid grid-cols-[1fr_100px_80px_80px_32px] items-center gap-3">
              <Input value={pair.name} onChange={(e) => updatePair(idx, { name: e.target.value })} className="h-8 text-xs" placeholder="z.B. EUR/USD" />
              <Select value={pair.market} onValueChange={(v) => updatePair(idx, { market: v as TradingMarket })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{MARKETS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Input type="number" value={pair.avgSpread} onChange={(e) => updatePair(idx, { avgSpread: Number(e.target.value) })} className="h-8 text-xs w-14" min={0} step={0.1} />
                <span className="text-[10px] text-muted-foreground">Sprd</span>
              </div>
              <div className="flex items-center gap-1">
                <Input type="number" value={pair.allocation} onChange={(e) => updatePair(idx, { allocation: Number(e.target.value) })} className="h-8 text-xs w-14" min={0} max={100} />
                <span className="text-[10px] text-muted-foreground">%</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePair(idx)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addPair} className="text-xs"><Plus className="h-3 w-3 mr-1" /> Trading Pair</Button>
        </CollapsibleSection>

        {/* ── Risk Management ── */}
        <CollapsibleSection title="Risk Management" defaultOpen>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "accountBalance" as const, label: "Account Balance (€)", min: 500, max: 500000, step: 500 },
              { key: "riskPerTrade" as const, label: "Risk/Trade (%)", min: 0.25, max: 10, step: 0.25 },
              { key: "maxOpenPositions" as const, label: "Max. offene Positionen", min: 1, max: 20, step: 1 },
              { key: "dailyLossLimit" as const, label: "Daily Loss Limit (%)", min: 1, max: 20, step: 0.5 },
              { key: "currentDrawdown" as const, label: "Aktueller Drawdown (%)", min: 0, max: 50, step: 1 },
              { key: "maxDrawdown" as const, label: "Max. Drawdown (%)", min: 5, max: 50, step: 1 },
            ].map((s) => (
              <div key={s.key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-muted-foreground">{s.label}</label>
                  <span className="text-xs font-medium tabular-nums">{input[s.key]}</span>
                </div>
                <Slider min={s.min} max={s.max} step={s.step} value={[input[s.key] as number]} onValueChange={([v]) => update(s.key, v)} />
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ── Performance Stats ── */}
        <CollapsibleSection title="Performance-Parameter">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "winrate" as const, label: "Winrate (%)", min: 20, max: 90, step: 1 },
              { key: "avgWin" as const, label: "Ø Win (€)", min: 10, max: 5000, step: 10 },
              { key: "avgLoss" as const, label: "Ø Loss (€)", min: 10, max: 5000, step: 10 },
              { key: "tradesPerMonth" as const, label: "Trades/Monat", min: 1, max: 500, step: 1 },
              { key: "commissionPerTrade" as const, label: "Kommission/Trade (€)", min: 0, max: 50, step: 0.5 },
              { key: "slippageAvg" as const, label: "Ø Slippage (€)", min: 0, max: 20, step: 0.5 },
              { key: "weeklyTarget" as const, label: "Wochenziel (€)", min: 0, max: 10000, step: 50 },
            ].map((s) => (
              <div key={s.key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-muted-foreground">{s.label}</label>
                  <span className="text-xs font-medium tabular-nums">{input[s.key]}</span>
                </div>
                <Slider min={s.min} max={s.max} step={s.step} value={[input[s.key] as number]} onValueChange={([v]) => update(s.key, v)} />
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ── Forecast ── */}
        <TradingForecastPanel forecast={tradingForecast} />

        {/* ── Legal ── */}
        <FinancialDisclaimer />
      </div>
    </DashboardLayout>
  );
}
