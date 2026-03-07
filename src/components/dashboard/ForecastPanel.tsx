import { cn } from "@/lib/utils";
import { type ForecastPoint, type PortfolioForecast, type TradingForecast } from "@/lib/signal-engine";
import { TrendingUp, Target, AlertTriangle, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PortfolioProps {
  forecast: PortfolioForecast;
  targetInput: number;
  onTargetChange: (v: number) => void;
}

export function PortfolioForecastPanel({ forecast, targetInput, onTargetChange }: PortfolioProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Portfolio Prognose (24 Monate)
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Prognose</span>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast.points} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <defs>
              <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={3} />
            <YAxis tick={{ fontSize: 10 }} width={50} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              formatter={(value: number) => [`${value.toLocaleString("de-DE")}€`, ""]}
            />
            <ReferenceLine y={forecast.targetValue} stroke="hsl(var(--warning))" strokeDasharray="4 4" label={{ value: "Ziel", fontSize: 10, fill: "hsl(var(--warning))" }} />
            <Area type="monotone" dataKey="optimistic" stroke="hsl(var(--success))" fill="url(#colorOpt)" strokeWidth={1} dot={false} name="Optimistisch" />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorBase)" strokeWidth={2} dot={false} name="Realistisch" />
            <Area type="monotone" dataKey="pessimistic" stroke="hsl(var(--destructive))" fill="url(#colorPess)" strokeWidth={1} dot={false} name="Pessimistisch" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Target & Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-warning" />
          <p className="text-[10px] text-muted-foreground">Zielwert</p>
          <input
            type="number"
            value={targetInput}
            onChange={(e) => onTargetChange(Number(e.target.value))}
            className="w-full text-center text-sm font-bold bg-transparent border-none focus:outline-none tabular-nums"
          />
          <p className="text-[10px] text-muted-foreground">€</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <Calendar className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-[10px] text-muted-foreground">Zeitraum</p>
          <p className="text-sm font-bold">{forecast.targetDate}</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-success" />
          <p className="text-[10px] text-muted-foreground">Wahrscheinlichkeit</p>
          <p className={cn("text-sm font-bold", forecast.probability > 60 ? "text-success" : forecast.probability > 30 ? "text-warning" : "text-destructive")}>
            {forecast.probability}%
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-[10px] text-muted-foreground">Worst Case (24M)</p>
          <p className="text-sm font-bold tabular-nums">
            {forecast.points[forecast.points.length - 1]?.pessimistic.toLocaleString("de-DE")}€
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Trading Forecast Panel ─────────────────────────────────

interface TradingProps {
  forecast: TradingForecast;
}

export function TradingForecastPanel({ forecast }: TradingProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trading Prognose (12 Monate)
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Simuliert</span>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast.points} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <defs>
              <linearGradient id="tColorOpt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tColorBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tColorPess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} width={50} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              formatter={(value: number) => [`${value.toLocaleString("de-DE")}€`, ""]}
            />
            <Area type="monotone" dataKey="optimistic" stroke="hsl(var(--success))" fill="url(#tColorOpt)" strokeWidth={1} dot={false} name="Best Case" />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#tColorBase)" strokeWidth={2} dot={false} name="Erwartet" />
            <Area type="monotone" dataKey="pessimistic" stroke="hsl(var(--destructive))" fill="url(#tColorPess)" strokeWidth={1} dot={false} name="Worst Case" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Monatsziel</p>
          <p className={cn("text-lg font-bold tabular-nums", forecast.monthlyTarget > 0 ? "text-success" : "text-destructive")}>
            {forecast.monthlyTarget > 0 ? "+" : ""}{forecast.monthlyTarget.toLocaleString("de-DE")}€
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground">12-Monats-Projektion</p>
          <p className={cn("text-lg font-bold tabular-nums", forecast.yearlyProjection > 0 ? "text-success" : "text-destructive")}>
            {forecast.yearlyProjection > 0 ? "+" : ""}{forecast.yearlyProjection.toLocaleString("de-DE")}€
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Break-even DD</p>
          <p className="text-lg font-bold">
            {forecast.breakEvenMonth !== null ? `${forecast.breakEvenMonth} Mon.` : "–"}
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Risk of Ruin</p>
          <p className={cn("text-lg font-bold", forecast.riskOfRuin < 5 ? "text-success" : forecast.riskOfRuin < 20 ? "text-warning" : "text-destructive")}>
            {forecast.riskOfRuin}%
          </p>
        </div>
      </div>
    </div>
  );
}
