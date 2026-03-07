import { useState, useCallback, useMemo } from "react";
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
import { SignalPanel } from "@/components/dashboard/SignalPanel";
import { PortfolioForecastPanel } from "@/components/dashboard/ForecastPanel";
import { FinancialDisclaimer } from "@/components/dashboard/FinancialDisclaimer";
import { MetricOnboarding } from "@/components/dashboard/MetricOnboarding";
import { Activity, PieChart, Wallet, TrendingUp, ShieldAlert, ChevronDown, ChevronRight, Plus, Trash2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIPageInsights } from "@/components/AIPageInsights";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateCryptoSignals, generateEquitySignals, buildPortfolioForecast } from "@/lib/signal-engine";
import type { ScenarioMode } from "@/lib/command-center-types";
import {
  getInvestorDefaults,
  buildInvestorStatus,
  buildInvestorMoney,
  buildInvestorRisks,
  buildInvestorActions,
  calculatePortfolioRisk,
  recalcAllocations,
  autoConcentrationRisk,
  type InvestorInput,
  type CryptoAsset,
  type EquityAsset,
  type BondAsset,
  type RealEstateAsset,
} from "@/lib/investor-engine";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistisch" },
  { value: "realistic", label: "Realistisch" },
  { value: "worst-case", label: "Worst Case" },
];

const VOLATILITY_OPTIONS = [
  { value: "low", label: "Niedrig" },
  { value: "medium", label: "Mittel" },
  { value: "high", label: "Hoch" },
  { value: "extreme", label: "Extrem" },
] as const;

const EQUITY_TYPES = [
  { value: "etf", label: "ETF" },
  { value: "single_stock", label: "Einzelaktie" },
  { value: "index_fund", label: "Indexfonds" },
] as const;

const BOND_DURATIONS = [
  { value: "short", label: "Kurz (<3J)" },
  { value: "medium", label: "Mittel (3-7J)" },
  { value: "long", label: "Lang (>7J)" },
] as const;

const RE_TYPES = [
  { value: "reit", label: "REIT" },
  { value: "direct", label: "Direkt" },
  { value: "crowdfunding", label: "Crowdfunding" },
] as const;

function CollapsibleSection({ title, count, color, children, defaultOpen = false }: { title: string; count: number; color: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2">
          <div className={cn("h-3 w-3 rounded-full", color)} />
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">({count} Assets)</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t px-4 pb-4 pt-3 space-y-3">{children}</div>}
    </div>
  );
}

export default function InvestorDashboard() {
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const [input, setInput] = useState<InvestorInput>(getInvestorDefaults());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [forecastTarget, setForecastTarget] = useState(0);

  const sync = useCallback((next: InvestorInput) => {
    const recalced = recalcAllocations(next);
    recalced.concentrationRisk = autoConcentrationRisk(recalced);
    setInput(recalced);
  }, []);

  const update = (key: keyof InvestorInput, value: number) => {
    sync({ ...input, [key]: value });
  };

  // Sub-asset helpers
  const updateCrypto = (idx: number, patch: Partial<CryptoAsset>) => {
    const next = [...input.cryptoAssets];
    next[idx] = { ...next[idx], ...patch };
    sync({ ...input, cryptoAssets: next });
  };
  const addCrypto = () => sync({ ...input, cryptoAssets: [...input.cryptoAssets, { id: `c${Date.now()}`, name: "Neues Asset", allocation: 0, volatility: "medium" }] });
  const removeCrypto = (idx: number) => sync({ ...input, cryptoAssets: input.cryptoAssets.filter((_, i) => i !== idx) });

  const updateEquity = (idx: number, patch: Partial<EquityAsset>) => {
    const next = [...input.equityAssets];
    next[idx] = { ...next[idx], ...patch };
    sync({ ...input, equityAssets: next });
  };
  const addEquity = () => sync({ ...input, equityAssets: [...input.equityAssets, { id: `e${Date.now()}`, name: "Neues Asset", allocation: 0, type: "etf" }] });
  const removeEquity = (idx: number) => sync({ ...input, equityAssets: input.equityAssets.filter((_, i) => i !== idx) });

  const updateBond = (idx: number, patch: Partial<BondAsset>) => {
    const next = [...input.bondAssets];
    next[idx] = { ...next[idx], ...patch };
    sync({ ...input, bondAssets: next });
  };
  const addBond = () => sync({ ...input, bondAssets: [...input.bondAssets, { id: `b${Date.now()}`, name: "Neue Anleihe", allocation: 0, duration: "medium" }] });
  const removeBond = (idx: number) => sync({ ...input, bondAssets: input.bondAssets.filter((_, i) => i !== idx) });

  const updateRE = (idx: number, patch: Partial<RealEstateAsset>) => {
    const next = [...input.realEstateAssets];
    next[idx] = { ...next[idx], ...patch };
    sync({ ...input, realEstateAssets: next });
  };
  const addRE = () => sync({ ...input, realEstateAssets: [...input.realEstateAssets, { id: `r${Date.now()}`, name: "Neues Objekt", allocation: 0, type: "reit" }] });
  const removeRE = (idx: number) => sync({ ...input, realEstateAssets: input.realEstateAssets.filter((_, i) => i !== idx) });

  const status = buildInvestorStatus(input, mode);
  const money = buildInvestorMoney(input, mode);
  const risks = buildInvestorRisks(input);
  const actions = buildInvestorActions(input);
  const portfolioRisk = calculatePortfolioRisk(input);

  const cryptoSignals = useMemo(() => generateCryptoSignals(input), [input]);
  const equitySignals = useMemo(() => generateEquitySignals(input), [input]);
  const forecast = useMemo(() => buildPortfolioForecast(input, forecastTarget), [input, forecastTarget]);

  const totalAlloc = input.equityExposure + input.bondExposure + input.cryptoExposure + input.realEstateExposure + input.cashPosition;

  const allocations = [
    { label: "Aktien", pct: input.equityExposure, color: "bg-chart-1" },
    { label: "Anleihen", pct: input.bondExposure, color: "bg-chart-2" },
    { label: "Crypto", pct: input.cryptoExposure, color: "bg-chart-3" },
    { label: "Immobilien", pct: input.realEstateExposure, color: "bg-chart-4" },
    { label: "Cash", pct: input.cashPosition, color: "bg-muted-foreground" },
  ];

  return (
    <DashboardLayout>
      <SEO title="Investor Mode – BrandOS" description="Portfolio Risk Score, Asset Allocation, Capital Growth." path="/dashboard/investor" />
      <MetricOnboarding mode="investor" open={showOnboarding} onOpenChange={setShowOnboarding} />
      <div className="animate-fade-in space-y-8">
        <div className="flex items-center justify-between">
          <PageHeader title="Investor Mode" description="Portfolio Risk, Allocation & Capital Growth im Überblick." badge="INVESTOR" badgeVariant="warning" />
          <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)} className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Metriken lernen
          </Button>
        </div>

        <CEOSection>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span>Simulation – passe dein Portfolio an</span>
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

          {/* Asset Allocation Bar */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <PieChart className="h-4 w-4 text-accent" /> Asset Allocation
              </h3>
              {totalAlloc !== 100 && (
                <span className={cn("text-xs font-medium", totalAlloc > 100 ? "text-destructive" : "text-warning")}>
                  Gesamt: {totalAlloc}% {totalAlloc > 100 ? "⚠️ Überallokiert" : "– nicht voll investiert"}
                </span>
              )}
            </div>
            <div className="flex h-6 rounded-full overflow-hidden">
              {allocations.filter(a => a.pct > 0).map((a) => (
                <div key={a.label} className={cn("transition-all", a.color)} style={{ width: `${a.pct}%` }} title={`${a.label}: ${a.pct}%`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {allocations.map((a) => (
                <div key={a.label} className="flex items-center gap-1.5">
                  <div className={cn("h-2.5 w-2.5 rounded-full", a.color)} />
                  <span className="text-muted-foreground">{a.label}</span>
                  <span className="font-medium">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Portfolio Risk", value: `${portfolioRisk}/100`, icon: ShieldAlert, color: portfolioRisk > 70 ? "text-success" : portfolioRisk > 40 ? "text-warning" : "text-destructive" },
              { label: "Rendite p.a.", value: `${input.annualReturn}%`, icon: TrendingUp, color: input.annualReturn > 5 ? "text-success" : input.annualReturn > 0 ? "text-warning" : "text-destructive" },
              { label: "Dividende p.a.", value: `${input.dividendYield}%`, icon: Wallet, color: "text-chart-2" },
              { label: "Drawdown", value: `${input.portfolioDrawdown}%`, icon: ShieldAlert, color: input.portfolioDrawdown < 10 ? "text-success" : "text-destructive" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border bg-card p-4 text-center">
                <kpi.icon className={cn("h-5 w-5 mx-auto mb-2", kpi.color)} />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={cn("text-2xl font-bold tabular-nums", kpi.color)}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedCard index={0}><MoneyCard data={money} /></AnimatedCard>
            <AnimatedCard index={1}><RiskCard risks={risks} /></AnimatedCard>
            <AnimatedCard index={2}><ExecutionCard actions={actions} /></AnimatedCard>
          </div>
        </CEOSection>

        {/* ── Individual Asset Configuration ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Assets individuell konfigurieren</h3>

          {/* Crypto */}
          <CollapsibleSection title="Crypto Assets" count={input.cryptoAssets.length} color="bg-chart-3" defaultOpen>
            {input.cryptoAssets.map((asset, idx) => (
              <div key={asset.id} className="grid grid-cols-[1fr_80px_120px_32px] items-center gap-3">
                <Input value={asset.name} onChange={(e) => updateCrypto(idx, { name: e.target.value })} className="h-8 text-xs" />
                <div className="flex items-center gap-1">
                  <Input type="number" value={asset.allocation} onChange={(e) => updateCrypto(idx, { allocation: Number(e.target.value) })} className="h-8 text-xs w-16" min={0} max={100} />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <Select value={asset.volatility} onValueChange={(v) => updateCrypto(idx, { volatility: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{VOLATILITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCrypto(idx)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCrypto} className="text-xs"><Plus className="h-3 w-3 mr-1" /> Crypto Asset</Button>
          </CollapsibleSection>

          {/* Equity */}
          <CollapsibleSection title="Aktien & ETFs" count={input.equityAssets.length} color="bg-chart-1">
            {input.equityAssets.map((asset, idx) => (
              <div key={asset.id} className="grid grid-cols-[1fr_80px_120px_32px] items-center gap-3">
                <Input value={asset.name} onChange={(e) => updateEquity(idx, { name: e.target.value })} className="h-8 text-xs" />
                <div className="flex items-center gap-1">
                  <Input type="number" value={asset.allocation} onChange={(e) => updateEquity(idx, { allocation: Number(e.target.value) })} className="h-8 text-xs w-16" min={0} max={100} />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <Select value={asset.type} onValueChange={(v) => updateEquity(idx, { type: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{EQUITY_TYPES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeEquity(idx)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEquity} className="text-xs"><Plus className="h-3 w-3 mr-1" /> Aktie/ETF</Button>
          </CollapsibleSection>

          {/* Bonds */}
          <CollapsibleSection title="Anleihen" count={input.bondAssets.length} color="bg-chart-2">
            {input.bondAssets.map((asset, idx) => (
              <div key={asset.id} className="grid grid-cols-[1fr_80px_120px_32px] items-center gap-3">
                <Input value={asset.name} onChange={(e) => updateBond(idx, { name: e.target.value })} className="h-8 text-xs" />
                <div className="flex items-center gap-1">
                  <Input type="number" value={asset.allocation} onChange={(e) => updateBond(idx, { allocation: Number(e.target.value) })} className="h-8 text-xs w-16" min={0} max={100} />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <Select value={asset.duration} onValueChange={(v) => updateBond(idx, { duration: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{BOND_DURATIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeBond(idx)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addBond} className="text-xs"><Plus className="h-3 w-3 mr-1" /> Anleihe</Button>
          </CollapsibleSection>

          {/* Real Estate */}
          <CollapsibleSection title="Immobilien" count={input.realEstateAssets.length} color="bg-chart-4">
            {input.realEstateAssets.map((asset, idx) => (
              <div key={asset.id} className="grid grid-cols-[1fr_80px_120px_32px] items-center gap-3">
                <Input value={asset.name} onChange={(e) => updateRE(idx, { name: e.target.value })} className="h-8 text-xs" />
                <div className="flex items-center gap-1">
                  <Input type="number" value={asset.allocation} onChange={(e) => updateRE(idx, { allocation: Number(e.target.value) })} className="h-8 text-xs w-16" min={0} max={100} />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <Select value={asset.type} onValueChange={(v) => updateRE(idx, { type: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{RE_TYPES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRE(idx)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRE} className="text-xs"><Plus className="h-3 w-3 mr-1" /> Immobilie</Button>
          </CollapsibleSection>
        </div>

        {/* ── Signals ── */}
        <div className="grid gap-5 lg:grid-cols-2">
          <SignalPanel signals={cryptoSignals} title="Crypto Signale" />
          <SignalPanel signals={equitySignals} title="Aktien Signale" />
        </div>

        {/* ── Forecast ── */}
        <PortfolioForecastPanel forecast={forecast} targetInput={forecastTarget} onTargetChange={setForecastTarget} />

        {/* Global Parameters */}
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-6">
          <h3 className="text-sm font-semibold">Globale Portfolio-Parameter</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "totalPortfolio" as const, label: "Gesamtportfolio (€)", min: 5000, max: 1000000, step: 5000 },
              { key: "cashPosition" as const, label: "Cash (%)", min: 0, max: 100, step: 1 },
              { key: "annualReturn" as const, label: "Rendite p.a. (%)", min: -20, max: 50, step: 1 },
              { key: "portfolioDrawdown" as const, label: "Drawdown (%)", min: 0, max: 50, step: 1 },
              { key: "dividendYield" as const, label: "Dividendenrendite (%)", min: 0, max: 15, step: 0.5 },
            ].map((s) => (
              <div key={s.key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-muted-foreground">{s.label}</label>
                  <span className="text-xs font-medium tabular-nums">{input[s.key]}</span>
                </div>
                <Slider min={s.min} max={s.max} step={s.step} value={[input[s.key]]} onValueChange={([v]) => update(s.key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Insights ── */}
        <AIPageInsights pageContext="Investor Dashboard – Portfolio-Allokation, Risikometriken, Diversifikation" title="AI Investor Insights" />

        {/* ── Legal ── */}
        <FinancialDisclaimer />
      </div>
    </DashboardLayout>
  );
}
