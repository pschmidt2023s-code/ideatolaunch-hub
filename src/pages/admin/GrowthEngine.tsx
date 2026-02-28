import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, DollarSign, ArrowUpRight, BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubRow {
  status: string;
  created_at: string;
  current_period_end: string | null;
}

interface ProfileRow {
  archetype: string | null;
}

export default function GrowthEngine() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const check = async () => {
      const { data } = await supabase.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
      if (!data) { navigate("/dashboard"); return; }
      setAuthorized(true);

      const [subRes, profRes] = await Promise.all([
        supabase.from("subscriptions").select("status, created_at, current_period_end"),
        supabase.from("profiles").select("archetype"),
      ]);
      setSubs((subRes.data as SubRow[]) || []);
      setProfiles((profRes.data as ProfileRow[]) || []);
      setLoading(false);
    };
    check();
  }, [user, navigate]);

  if (!authorized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Metrics
  const total = subs.length || 1;
  const planDist = subs.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const free = planDist["free"] || 0;
  const builder = planDist["builder"] || 0;
  const pro = planDist["pro"] || 0;
  const execution = planDist["execution"] || 0;

  const paid = builder + pro + execution;
  const conversionRate = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";
  const upgradeBuilderPro = builder > 0 ? ((pro / (builder + pro)) * 100).toFixed(1) : "0";
  const upgradeProExec = pro > 0 ? ((execution / (pro + execution)) * 100).toFixed(1) : "0";

  // Estimated MRR (simplified)
  const mrr = builder * 29 + pro * 79 + execution * 159;
  const arpu = paid > 0 ? Math.round(mrr / paid) : 0;
  const ltv = arpu * 8; // estimated 8 month avg lifetime

  // Archetype distribution
  const archetypeDist = profiles.reduce((acc, p) => {
    const a = p.archetype || "unset";
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Capital risk users (estimation from high-risk archetypes)
  const recoveryCount = archetypeDist["recovery_founder"] || 0;
  const capitalRiskRatio = total > 0 ? ((recoveryCount / total) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Growth Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-1">90-Day Monetization Growth Engine</h1>
        <p className="text-muted-foreground mb-8">Revenue metrics, upgrade funnels, and growth optimization.</p>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <KPICard icon={DollarSign} label="MRR" value={"€" + mrr.toLocaleString()} sub="Monthly Recurring Revenue" />
          <KPICard icon={Users} label="ARPU" value={"€" + arpu} sub="Average Revenue Per User" />
          <KPICard icon={TrendingUp} label="Est. LTV" value={"€" + ltv} sub="8-month avg lifetime" />
          <KPICard icon={BarChart3} label="Conversion" value={conversionRate + "%"} sub="Free → Paid" accent />
        </div>

        {/* Plan Distribution */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-base">Plan Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <BarRow label="Free" value={free} max={total} color="bg-muted-foreground" />
              <BarRow label="Builder (€29)" value={builder} max={total} color="bg-sky-500" />
              <BarRow label="Pro (€79)" value={pro} max={total} color="bg-amber-500" />
              <BarRow label="Execution (€159)" value={execution} max={total} color="bg-accent" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Upgrade Funnels</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Builder → Pro</p>
                <p className="text-xl font-bold">{upgradeBuilderPro}%</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Pro → Execution</p>
                <p className="text-xl font-bold">{upgradeProExec}%</p>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Capital Risk Users</p>
                <p className="text-xl font-bold text-destructive">{capitalRiskRatio}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Archetype Distribution */}
        <Card className="mb-8">
          <CardHeader><CardTitle className="text-base">Founder Archetype Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: "conservative_planner", label: "Conservative Planner", color: "bg-sky-500" },
                { key: "aggressive_scaler", label: "Aggressive Scaler", color: "bg-emerald-500" },
                { key: "brand_perfectionist", label: "Brand Perfectionist", color: "bg-violet-500" },
                { key: "recovery_founder", label: "Recovery Founder", color: "bg-destructive" },
              ].map(({ key, label, color }) => (
                <div key={key} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("h-2 w-2 rounded-full", color)} />
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                  <p className="text-lg font-bold">{archetypeDist[key] || 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Optimization Triggers */}
        <Card>
          <CardHeader><CardTitle className="text-base">Growth Optimization Triggers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <TriggerRow
              label="Feature Limit Upgrade Nudge"
              desc="Triggered when user hits free tier limits → Contextual upgrade with ROI framing"
              active
            />
            <TriggerRow
              label="Annual Plan Push (30-day)"
              desc="After 30 days on monthly → 'Switch to annual and save 15%'"
              active
            />
            <TriggerRow
              label="Capital Risk Upgrade"
              desc="If inventory risk or burn rate high → 'Execution OS protects capital exposure'"
              active
            />
            <TriggerRow
              label="Margin Warning Trigger"
              desc="If margin < 35% → Suggest Pro for full risk analysis"
              active
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <Card className={accent ? "border-accent/30" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("h-4 w-4", accent ? "text-accent" : "text-muted-foreground")} />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1"><span>{label}</span><span className="font-semibold">{value}</span></div>
      <div className="h-2 w-full rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function TriggerRow({ label, desc, active }: { label: string; desc: string; active: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", active ? "bg-emerald-500" : "bg-muted-foreground")} />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
    </div>
  );
}
