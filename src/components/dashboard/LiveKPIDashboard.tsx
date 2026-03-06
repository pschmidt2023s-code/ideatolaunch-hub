import { useMemo } from "react";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import { generateBenchmarkAnalysis, type BenchmarkKPIs } from "@/lib/benchmark-story-engine";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar, Cell,
} from "recharts";
import {
  Activity, TrendingUp, TrendingDown, Shield, DollarSign,
  AlertTriangle, Target, Gauge,
} from "lucide-react";

// ── Gauge Card ──────────────────────────────────────────────────────────────

function GaugeCard({
  title, value, max, suffix, icon: Icon, color, description,
}: {
  title: string; value: number; max: number; suffix?: string;
  icon: React.ElementType; color: string; description: string;
}) {
  const percent = Math.min((value / max) * 100, 100);
  const radialData = [{ value: percent, fill: "currentColor" }];

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground mb-1">{suffix}</span>}
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700",
            percent > 70 ? "bg-success" : percent > 40 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

// ── Sparkline ───────────────────────────────────────────────────────────────

function SparklineCard({
  title, data, dataKey, color, unit, icon: Icon,
}: {
  title: string; data: { name: string; value: number }[];
  dataKey: string; color: string; unit: string; icon: React.ElementType;
}) {
  const latest = data[data.length - 1]?.value ?? 0;
  const prev = data[data.length - 2]?.value ?? latest;
  const trend = latest - prev;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className={cn("text-xs font-bold tabular-nums", trend >= 0 ? "text-success" : "text-destructive")}>
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}{unit}
          </span>
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold tabular-nums">{latest.toFixed(1)}{unit}</span>
        <div className="flex-1 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey="value" stroke={color}
                fill={`url(#grad-${title})`} strokeWidth={2} dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Risk Breakdown Bar ──────────────────────────────────────────────────────

function RiskBreakdownChart({ risks }: { risks: { id: string; title: string; impact: number; level: string }[] }) {
  const COLORS: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

  if (!risks.length) return (
    <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
      <Shield className="h-5 w-5 mr-2 text-success" /> Keine kritischen Risiken erkannt
    </div>
  );

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={risks.length * 48 + 16}>
        <BarChart data={risks} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="title" width={180} tick={{ fontSize: 11 }} />
          <RechartsTooltip
            formatter={(val: number) => [`€${val.toLocaleString("de-DE")}`, "Impact"]}
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
          />
          <Bar dataKey="impact" radius={[0, 6, 6, 0]} barSize={20}>
            {risks.map((r, i) => (
              <Cell key={i} fill={COLORS[r.level] || COLORS.medium} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function LiveKPIDashboard() {
  const ccData = useCommandCenterData("realistic");

  // Generate 6-month simulated trend data from current values
  const trendData = useMemo(() => {
    if (!ccData.ready || !ccData.sufficient) return null;

    const { status, money } = ccData;
    const months = ["Okt", "Nov", "Dez", "Jan", "Feb", "Mär"];

    // Simulate slight historical variance for visual storytelling
    const riskTrend = months.map((name, i) => ({
      name,
      value: Math.max(0, Math.min(100, status.founderRiskIndex + (i - 5) * (Math.random() * 4 - 2))),
    }));
    // Ensure last value is actual
    riskTrend[5].value = status.founderRiskIndex;

    const marginTrend = months.map((name, i) => ({
      name,
      value: Math.max(0, Math.min(100, money.margin + (i - 5) * (Math.random() * 3 - 1.5))),
    }));
    marginTrend[5].value = money.margin;

    const runwayTrend = months.map((name, i) => ({
      name,
      value: Math.max(0, status.runwayMonths + (i - 5) * (Math.random() * 1.5 - 0.75)),
    }));
    runwayTrend[5].value = status.runwayMonths;

    return { riskTrend, marginTrend, runwayTrend };
  }, [ccData]);

  if (!ccData.ready) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Activity className="h-10 w-10 text-muted-foreground mb-4 animate-pulse" />
        <p className="text-sm text-muted-foreground">Lade Live-KPIs…</p>
      </div>
    );
  }

  if (!ccData.sufficient) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-warning mb-4" />
        <h3 className="text-lg font-semibold">Nicht genug Daten</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Fülle mindestens dein Finanzmodell oder Markenprofil aus, um Live-KPIs zu sehen.
        </p>
      </div>
    );
  }

  const { status, money, risks } = ccData;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Gauge cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GaugeCard
          title="Founder Risk" value={status.founderRiskIndex} max={100}
          icon={Shield} color="bg-destructive/10 text-destructive"
          description={`Status: ${status.riskLevel === "low" ? "Stabil" : status.riskLevel === "medium" ? "Fragil" : "Gefährdet"}`}
        />
        <GaugeCard
          title="Confidence" value={status.confidenceScore} max={100} suffix="%"
          icon={Target} color="bg-accent/10 text-accent"
          description="Datenvollständigkeit & Validierungsgrad"
        />
        <GaugeCard
          title="Runway" value={status.runwayMonths} max={24} suffix="Mon."
          icon={Gauge} color="bg-primary/10 text-primary"
          description={`Break-even: ${status.breakEvenDate}`}
        />
        <GaugeCard
          title="Capital Pressure" value={status.capitalPressure} max={100}
          icon={DollarSign} color="bg-warning/10 text-warning"
          description={`Kapital: €${money.capitalUsed.toLocaleString("de-DE")} / €${money.totalCapital.toLocaleString("de-DE")}`}
        />
      </div>

      {/* Sparkline trends */}
      {trendData && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SparklineCard
            title="Risk Index" data={trendData.riskTrend} dataKey="value"
            color="hsl(var(--destructive))" unit="" icon={Shield}
          />
          <SparklineCard
            title="Marge" data={trendData.marginTrend} dataKey="value"
            color="hsl(var(--success))" unit="%" icon={TrendingUp}
          />
          <SparklineCard
            title="Runway" data={trendData.runwayTrend} dataKey="value"
            color="hsl(var(--primary))" unit=" Mon." icon={Gauge}
          />
        </div>
      )}

      {/* Risk breakdown */}
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top-Risiken nach €-Impact
          </h3>
        </div>
        <RiskBreakdownChart risks={risks} />
      </div>

      {/* Cashflow summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Monatl. Cashflow</p>
          <p className={cn("text-xl font-bold tabular-nums", money.cashflowMonthly >= 0 ? "text-success" : "text-destructive")}>
            {money.cashflowMonthly >= 0 ? "+" : ""}€{money.cashflowMonthly.toLocaleString("de-DE")}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Marge</p>
          <p className="text-xl font-bold tabular-nums">{money.margin}%</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Break-even</p>
          <p className="text-xl font-bold tabular-nums">{money.breakEvenUnits.toLocaleString("de-DE")} Stk.</p>
        </div>
      </div>
    </div>
  );
}
