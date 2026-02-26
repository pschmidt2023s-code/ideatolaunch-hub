import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { checkIsAdmin, getPlanDistribution, getUpgradeTriggerSources, getStepDropOffRates, type PlanDistribution, type UpgradeTrigger, type StepDropOff } from "@/lib/founder-analytics";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Mail, CreditCard, BarChart3, MousePointerClick, ArrowLeft, Gift, Handshake, MessageCircle, ShieldAlert, Activity } from "lucide-react";

// ── Types ──
interface LeadRow { id: string; email: string; source: string; trigger_type: string | null; page: string | null; converted: boolean; created_at: string; }
interface EventRow { event_name: string; metadata: any; created_at: string; }
interface SubRow { status: string; stripe_subscription_id: string | null; created_at: string; current_period_end: string | null; }
interface ReferralRow { referral_count: number; reward_builder_months: number; }
interface AffiliateRow { total_clicks: number; total_conversions: number; total_earnings: number; }
interface WaitlistRow { id: string; email: string; niche: string | null; created_at: string; }
interface SecurityEventRow { id: string; event_type: string; route: string | null; metadata: any; created_at: string; }

// ── Metric Card ──
function MetricCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "bg-accent/5 border-accent/20" : "bg-card"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-muted-foreground"}`} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold w-10 text-right">{value}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [plans, setPlans] = useState<PlanDistribution[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([]);
  const [triggers, setTriggers] = useState<UpgradeTrigger[]>([]);
  const [dropOffs, setDropOffs] = useState<StepDropOff[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [affiliatesData, setAffiliatesData] = useState<AffiliateRow[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEventRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    checkIsAdmin(user.id).then((isAdmin) => {
      if (!isAdmin) { navigate("/dashboard"); return; }
      setAuthorized(true);
    });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authorized) return;
    setLoading(true);
    Promise.all([
      getPlanDistribution(),
      supabase.from("leads" as any).select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("analytics_events").select("event_name, metadata, created_at").order("created_at", { ascending: false }).limit(1000),
      supabase.from("subscriptions").select("status, stripe_subscription_id, created_at, current_period_end"),
      getUpgradeTriggerSources(),
      getStepDropOffRates(),
      supabase.from("referrals" as any).select("referral_count, reward_builder_months"),
      supabase.from("affiliates" as any).select("total_clicks, total_conversions, total_earnings"),
      supabase.from("community_waitlist" as any).select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("security_events" as any).select("*").order("created_at", { ascending: false }).limit(200),
    ]).then(([planData, leadRes, eventRes, subRes, triggerData, dropOffData, refRes, affRes, waitRes, secRes]) => {
      setPlans(planData);
      setLeads((leadRes.data ?? []) as unknown as LeadRow[]);
      setEvents((eventRes.data ?? []) as EventRow[]);
      setSubscriptions((subRes.data ?? []) as SubRow[]);
      setTriggers(triggerData);
      setDropOffs(dropOffData);
      setReferrals((refRes.data ?? []) as unknown as ReferralRow[]);
      setAffiliatesData((affRes.data ?? []) as unknown as AffiliateRow[]);
      setWaitlist((waitRes.data ?? []) as unknown as WaitlistRow[]);
      setSecurityEvents((secRes.data ?? []) as unknown as SecurityEventRow[]);
      setLoading(false);
    });
  }, [authorized]);

  if (authLoading || authorized === null || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Computed metrics ──
  const totalUsers = plans.reduce((s, p) => s + p.count, 0);
  const freeUsers = plans.find(p => p.plan === "free")?.count ?? 0;
  const builderUsers = plans.find(p => ["builder", "active"].includes(p.plan))?.count ?? 0;
  const proUsers = plans.find(p => p.plan === "pro")?.count ?? 0;
  const paidUsers = builderUsers + proUsers;

  // Conversion rates
  const freeToBuilder = freeUsers + builderUsers > 0 ? Math.round((builderUsers / (freeUsers + builderUsers)) * 100) : 0;
  const builderToPro = builderUsers + proUsers > 0 ? Math.round((proUsers / (builderUsers + proUsers)) * 100) : 0;

  // Leads
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.converted).length;
  const leadsBySource: Record<string, number> = {};
  leads.forEach(l => { const s = l.trigger_type || l.source; leadsBySource[s] = (leadsBySource[s] || 0) + 1; });
  const leadsByPage: Record<string, number> = {};
  leads.forEach(l => { const p = l.page || "unknown"; leadsByPage[p] = (leadsByPage[p] || 0) + 1; });

  // Stripe / Revenue
  const activeSubs = subscriptions.filter(s => s.stripe_subscription_id);
  const mrr = builderUsers * 29 + proUsers * 79;

  // Events
  const eventCounts: Record<string, number> = {};
  events.forEach(e => { eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1; });
  const toolEvents = events.filter(e => ["calculated_price", "entered_business_calculator", "scenario_simulation_used"].includes(e.event_name)).length;
  const pricingClicks = eventCounts["pricing_viewed"] ?? 0;
  const upgradeAttempts = (eventCounts["upgrade_clicked"] ?? 0) + (eventCounts["clicked_upgrade"] ?? 0);

  // Intelligence module usage
  const copilotUsage = events.filter(e => e.event_name === "copilot_message_sent" || e.event_name === "copilot_opened").length;
  const stressTestUsage = events.filter(e => e.event_name === "stress_test_used" || e.event_name === "scenario_simulation_used").length;
  const marketRealityUsage = events.filter(e => e.event_name === "market_reality_viewed" || e.event_name === "market_analysis_run").length;
  const cashflowUsage = events.filter(e => e.event_name === "cashflow_viewed" || e.event_name === "cashflow_analysis_run").length;

  // Builder vs Pro usage from events metadata
  const builderEvents = events.filter(e => {
    const meta = e.metadata as any;
    return meta?.plan === "builder" || meta?.source === "builder";
  }).length;
  const proEvents = events.filter(e => {
    const meta = e.metadata as any;
    return meta?.plan === "pro" || meta?.source === "pro";
  }).length;

  // Top pages (from events metadata)
  const pageVisits: Record<string, number> = {};
  events.forEach(e => {
    const page = (e.metadata as any)?.page || (e.metadata as any)?.url;
    if (page) pageVisits[page] = (pageVisits[page] || 0) + 1;
  });

  // Growth metrics
  const totalReferrals = referrals.reduce((s, r) => s + r.referral_count, 0);
  const totalAffClicks = affiliatesData.reduce((s, a) => s + a.total_clicks, 0);
  const totalAffConversions = affiliatesData.reduce((s, a) => s + a.total_conversions, 0);
  const totalAffEarnings = affiliatesData.reduce((s, a) => s + a.total_earnings, 0);
  const waitlistCount = waitlist.length;

  const maxTrigger = Math.max(...triggers.map(t => t.count), 1);
  const maxLeadSource = Math.max(...Object.values(leadsBySource), 1);
  const maxLeadPage = Math.max(...Object.values(leadsByPage), 1);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Übersicht über Nutzer, Leads, Revenue und Events</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
          <MetricCard icon={Users} label="Total Users" value={totalUsers} />
          <MetricCard icon={Users} label="Paid Users" value={paidUsers} accent sub={`${freeToBuilder}% Conversion`} />
          <MetricCard icon={Mail} label="Total Leads" value={totalLeads} sub={`${convertedLeads} converted`} />
          <MetricCard icon={CreditCard} label="MRR (est.)" value={`${mrr} €`} accent />
          <MetricCard icon={MousePointerClick} label="Pricing Clicks" value={pricingClicks} />
          <MetricCard icon={TrendingUp} label="Upgrade Attempts" value={upgradeAttempts} />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Distribution */}
          <SectionCard title="Nutzer nach Plan">
            {plans.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Daten</p>
            ) : (
              <div className="space-y-3">
                {plans.map(p => (
                  <div key={p.plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${p.plan === "free" ? "bg-muted-foreground" : p.plan === "pro" ? "bg-accent" : "bg-primary"}`} />
                      <span className="text-sm capitalize">{p.plan}</span>
                    </div>
                    <span className="text-sm font-bold">{p.count} <span className="text-muted-foreground font-normal">({totalUsers > 0 ? Math.round((p.count / totalUsers) * 100) : 0}%)</span></span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Conversion Metrics */}
          <SectionCard title="Conversion Rates">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Free → Builder</span>
                  <span className="text-sm font-bold">{freeToBuilder}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${freeToBuilder}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Builder → Pro</span>
                  <span className="text-sm font-bold">{builderToPro}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${builderToPro}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tool Usage Events</span>
                  <span className="font-bold text-foreground">{toolEvents}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Revenue */}
          <SectionCard title="Stripe / Revenue">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Subscriptions</span>
                <span className="text-sm font-bold">{activeSubs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Est. MRR</span>
                <span className="text-sm font-bold text-accent">{mrr} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Builder Users</span>
                <span className="text-sm font-bold">{builderUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pro Users</span>
                <span className="text-sm font-bold">{proUsers}</span>
              </div>
            </div>
          </SectionCard>

          {/* Lead Overview */}
          <SectionCard title="Lead-Quellen">
            {Object.keys(leadsBySource).length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Leads bisher</p>
            ) : (
              Object.entries(leadsBySource)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <BarRow key={source} label={source} value={count} max={maxLeadSource} />
                ))
            )}
          </SectionCard>

          {/* Leads by Page */}
          <SectionCard title="Leads nach Seite">
            {Object.keys(leadsByPage).length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Daten</p>
            ) : (
              Object.entries(leadsByPage)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([page, count]) => (
                  <BarRow key={page} label={page} value={count} max={maxLeadPage} />
                ))
            )}
          </SectionCard>

          {/* Upgrade Triggers */}
          <SectionCard title="Upgrade-Trigger Quellen">
            {triggers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Daten</p>
            ) : (
              triggers.slice(0, 8).map(t => (
                <BarRow key={t.source} label={t.source} value={t.count} max={maxTrigger} />
              ))
            )}
          </SectionCard>

          {/* Event Tracking */}
          <SectionCard title="Top Events">
            {Object.keys(eventCounts).length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Events</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(eventCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 15)
                  .map(([name, count]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{name}</span>
                      <span className="font-bold shrink-0">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </SectionCard>

          {/* Step Drop-Off */}
          <SectionCard title="Step Drop-Off %">
            {dropOffs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Daten</p>
            ) : (
              dropOffs.map(d => (
                <BarRow key={d.step} label={`Step ${d.step}`} value={d.dropOffPct} max={Math.max(...dropOffs.map(x => x.dropOffPct), 1)} />
              ))
            )}
          </SectionCard>

          {/* Recent Leads */}
          <SectionCard title="Neueste Leads">
            {leads.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Leads</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leads.slice(0, 10).map(l => (
                  <div key={l.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-1.5">
                    <div className="truncate mr-2">
                      <span className="text-foreground">{l.email}</span>
                      <span className="text-xs text-muted-foreground ml-2">{l.trigger_type || l.source}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(l.created_at).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Growth Engine ── */}
          <SectionCard title="Referral Programm">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gesamt Referrals</span>
                <span className="font-bold">{totalReferrals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aktive Empfehler</span>
                <span className="font-bold">{referrals.filter(r => r.referral_count > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vergebene Builder-Monate</span>
                <span className="font-bold text-accent">{referrals.reduce((s, r) => s + r.reward_builder_months, 0)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Affiliate Programm">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gesamt Klicks</span>
                <span className="font-bold">{totalAffClicks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversions</span>
                <span className="font-bold">{totalAffConversions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Affiliate Einnahmen</span>
                <span className="font-bold text-accent">{totalAffEarnings.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aktive Affiliates</span>
                <span className="font-bold">{affiliatesData.length}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Community Warteliste">
            <div className="space-y-3">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Wartelisten-Einträge</span>
                <span className="font-bold text-accent">{waitlistCount}</span>
              </div>
              {waitlist.length === 0 ? (
                <p className="text-xs text-muted-foreground">Noch keine Einträge</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {waitlist.slice(0, 8).map(w => (
                    <div key={w.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-1.5">
                      <div className="truncate mr-2">
                        <span className="text-foreground">{w.email}</span>
                        {w.niche && <span className="text-xs text-muted-foreground ml-2">{w.niche}</span>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(w.created_at).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Security Control Center ── */}
          <SectionCard title="Security Events">
            {securityEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Security Events</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-center">
                    <p className="text-lg font-bold text-destructive">
                      {securityEvents.filter(e => e.event_type === "failed_login").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed Logins</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-lg font-bold">
                      {securityEvents.filter(e => e.event_type === "rate_limited").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Rate Limited</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {securityEvents.slice(0, 10).map(e => (
                    <div key={e.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-1.5">
                      <div className="truncate mr-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                          e.event_type === "failed_login" ? "bg-destructive/10 text-destructive" :
                          e.event_type === "rate_limited" ? "bg-yellow-500/10 text-yellow-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {e.event_type}
                        </span>
                        <span className="text-muted-foreground text-xs">{e.route}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(e.created_at).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Performance Overview */}
          <SectionCard title="Performance & SEO">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Indexierte Seiten</span>
                <span className="font-bold">~28</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sitemap Einträge</span>
                <span className="font-bold">30+</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Schema Types</span>
                <span className="font-bold text-accent">7 aktiv</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Security Headers</span>
                <span className="font-bold text-accent">6 / 6</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Core Web Vitals werden clientseitig getrackt. Lighthouse-Score manuell eintragen.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* ── Founder Intelligence Metrics ── */}
          <SectionCard title="Intelligence Module Usage">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI Copilot Nutzung</span>
                <span className="font-bold text-accent">{copilotUsage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stress Test Sim.</span>
                <span className="font-bold">{stressTestUsage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Market Reality</span>
                <span className="font-bold">{marketRealityUsage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cashflow Engine</span>
                <span className="font-bold">{cashflowUsage}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Builder vs Pro Usage">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Builder Events</span>
                  <span className="text-sm font-bold">{builderEvents}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${builderEvents + proEvents > 0 ? Math.round((builderEvents / (builderEvents + proEvents)) * 100) : 50}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Pro Events</span>
                  <span className="text-sm font-bold">{proEvents}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${builderEvents + proEvents > 0 ? Math.round((proEvents / (builderEvents + proEvents)) * 100) : 50}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Builder → Pro Conversion</span>
                  <span className="font-bold text-foreground">{builderToPro}%</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
