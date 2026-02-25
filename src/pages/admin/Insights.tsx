import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  checkIsAdmin,
  getStepDropOffRates,
  getMostFrequentRisks,
  getAverageCompletionTimePerStep,
  getUpgradeTriggerSources,
  getPlanDistribution,
  type StepDropOff,
  type RiskFrequency,
  type StepAvgTime,
  type UpgradeTrigger,
  type PlanDistribution,
} from "@/lib/founder-analytics";

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
        <div className="h-full rounded bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold w-10 text-right">{value}</span>
    </div>
  );
}

export default function AdminInsights() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [dropOffs, setDropOffs] = useState<StepDropOff[]>([]);
  const [risks, setRisks] = useState<RiskFrequency[]>([]);
  const [avgTimes, setAvgTimes] = useState<StepAvgTime[]>([]);
  const [triggers, setTriggers] = useState<UpgradeTrigger[]>([]);
  const [plans, setPlans] = useState<PlanDistribution[]>([]);

  // Auth + admin check
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    checkIsAdmin(user.id).then((isAdmin) => {
      if (!isAdmin) { navigate("/dashboard"); return; }
      setAuthorized(true);
    });
  }, [user, authLoading, navigate]);

  // Load data
  useEffect(() => {
    if (!authorized) return;
    setLoading(true);
    Promise.all([
      getStepDropOffRates(),
      getMostFrequentRisks(),
      getAverageCompletionTimePerStep(),
      getUpgradeTriggerSources(),
      getPlanDistribution(),
    ]).then(([d, r, a, t, p]) => {
      setDropOffs(d);
      setRisks(r);
      setAvgTimes(a);
      setTriggers(t);
      setPlans(p);
      setLoading(false);
    });
  }, [authorized]);

  if (authLoading || authorized === null || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  const totalUsers = plans.reduce((s, p) => s + p.count, 0);
  const totalAvgMin = avgTimes.length
    ? Math.round(avgTimes.reduce((s, a) => s + a.avgMinutes, 0) * 10) / 10
    : 0;
  const worstStep = dropOffs.length
    ? dropOffs.reduce((w, c) => (c.dropOffPct > w.dropOffPct ? c : w))
    : null;
  const maxDropOff = Math.max(...dropOffs.map((d) => d.dropOffPct), 1);
  const maxRisk = Math.max(...risks.map((r) => r.count), 1);
  const maxTrigger = Math.max(...triggers.map((t) => t.count), 1);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 font-mono text-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Founder Insights</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total Users" value={totalUsers} />
        <MetricCard
          label="Worst Drop-off"
          value={worstStep ? `Step ${worstStep.step}` : "—"}
          sub={worstStep ? `${worstStep.dropOffPct}% drop` : undefined}
        />
        <MetricCard label="Avg Wizard Time" value={`${totalAvgMin}m`} sub="sum of step avgs" />
        <MetricCard label="Upgrade Clicks" value={triggers.reduce((s, t) => s + t.count, 0)} />
      </div>

      {/* Detail panels */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Drop-off */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Step Drop-Off %
          </h3>
          {dropOffs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            dropOffs.map((d) => (
              <BarRow key={d.step} label={`Step ${d.step}`} value={d.dropOffPct} max={maxDropOff} />
            ))
          )}
        </div>

        {/* Top risks */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Top 3 Generated Risks
          </h3>
          {risks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            risks.slice(0, 3).map((r) => (
              <BarRow key={r.riskLevel} label={r.riskLevel} value={r.count} max={maxRisk} />
            ))
          )}
        </div>

        {/* Avg time */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Avg Completion Time / Step
          </h3>
          {avgTimes.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            avgTimes.map((a) => (
              <div key={a.step} className="flex items-center justify-between py-1">
                <span className="text-xs">Step {a.step}</span>
                <span className="font-bold text-xs">{a.avgMinutes}m</span>
              </div>
            ))
          )}
        </div>

        {/* Upgrade triggers */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Upgrade Trigger Sources
          </h3>
          {triggers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            triggers.map((t) => (
              <BarRow key={t.source} label={t.source} value={t.count} max={maxTrigger} />
            ))
          )}
        </div>

        {/* Plan distribution */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Plan Distribution
          </h3>
          {plans.map((p) => (
            <div key={p.plan} className="flex items-center justify-between py-1">
              <span className="text-xs capitalize">{p.plan}</span>
              <span className="font-bold text-xs">
                {p.count} ({totalUsers > 0 ? Math.round((p.count / totalUsers) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
