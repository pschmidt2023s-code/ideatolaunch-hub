import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_name: string;
  metadata: Record<string, unknown>;
  session_id: string | null;
  created_at: string;
}

interface ErrorLog {
  id: string;
  user_id: string | null;
  message: string;
  stack: string | null;
  route: string | null;
  error_type: string;
  metadata: Record<string, unknown>;
  session_id: string | null;
  created_at: string;
}

export default function InternalAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const [evtRes, errRes] = await Promise.all([
        supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("error_logs").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      setEvents((evtRes.data as AnalyticsEvent[]) ?? []);
      setErrors((errRes.data as ErrorLog[]) ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  const fmt = (d: string) => format(new Date(d), "dd.MM.yy HH:mm:ss");

  // ── KPIs ──
  const now = Date.now();
  const last24h = events.filter((e) => now - new Date(e.created_at).getTime() < 86400000);
  const last7d = events.filter((e) => now - new Date(e.created_at).getTime() < 7 * 86400000);
  const activeUsers24h = new Set(last24h.map((e) => e.user_id)).size;

  const signups = events.filter((e) => e.event_name === "signup_completed" || e.event_name === "user_signed_up");
  const upgradeClicks = events.filter((e) => e.event_name === "upgrade_clicked" || e.event_name === "clicked_upgrade");
  const checkouts = events.filter((e) => e.event_name === "checkout_started");
  const checkoutSuccess = events.filter((e) => e.event_name === "checkout_success" || e.event_name === "subscription_started");

  // ── Step Funnel ──
  const stepFunnel = useMemo(() => {
    const steps = [1, 2, 3, 4, 5, 6, 7];
    return steps.map((s) => {
      const viewed = new Set(
        events.filter((e) => e.event_name === "step_viewed" && (e.metadata as any)?.step === s).map((e) => e.user_id)
      ).size;
      const saved = new Set(
        events.filter((e) => e.event_name === "step_saved" && (e.metadata as any)?.step === s).map((e) => e.user_id)
      ).size;
      return { step: s, viewed, saved };
    });
  }, [events]);

  // ── Upgrade Funnel ──
  const upgradeFunnel = useMemo(() => {
    const pricingViewed = new Set(events.filter((e) => e.event_name === "pricing_viewed").map((e) => e.user_id)).size;
    const clicked = new Set(upgradeClicks.map((e) => e.user_id)).size;
    const started = new Set(checkouts.map((e) => e.user_id)).size;
    const completed = new Set(checkoutSuccess.map((e) => e.user_id)).size;
    return [
      { label: "Pricing viewed", count: pricingViewed },
      { label: "Upgrade clicked", count: clicked },
      { label: "Checkout started", count: started },
      { label: "Checkout success", count: completed },
    ];
  }, [events, upgradeClicks, checkouts, checkoutSuccess]);

  // ── Upgrade trigger sources ──
  const triggerSources = useMemo(() => {
    const map: Record<string, number> = {};
    upgradeClicks.forEach((e) => {
      const source = (e.metadata as any)?.source || "unknown";
      map[source] = (map[source] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [upgradeClicks]);

  // ── Locked feature views ──
  const lockedViews = useMemo(() => {
    const map: Record<string, number> = {};
    events.filter((e) => e.event_name === "feature_locked_viewed").forEach((e) => {
      const feat = (e.metadata as any)?.feature || "unknown";
      map[feat] = (map[feat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [events]);

  // ── Drop-offs ──
  const dropOffs = useMemo(() => {
    const map: Record<number, number> = {};
    events.filter((e) => e.event_name === "step_abandoned").forEach((e) => {
      const step = (e.metadata as any)?.step;
      if (step) map[step] = (map[step] || 0) + 1;
    });
    return Object.entries(map).map(([s, c]) => ({ step: Number(s), count: c })).sort((a, b) => a.step - b.step);
  }, [events]);

  // ── Top drop-off ──
  const topDropOff = dropOffs.length > 0 ? dropOffs.reduce((a, b) => (b.count > a.count ? b : a)) : null;

  // ── Upgrades today vs last 7d ──
  const upgradesToday = checkoutSuccess.filter((e) => now - new Date(e.created_at).getTime() < 86400000).length;
  const upgrades7d = checkoutSuccess.filter((e) => now - new Date(e.created_at).getTime() < 7 * 86400000).length;

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 font-mono text-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Internal Analytics</h1>
        <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground hover:text-foreground">← Dashboard</button>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Active (24h)", value: activeUsers24h },
          { label: "Signups", value: signups.length },
          { label: "Upgrade Clicks", value: upgradeClicks.length },
          { label: "Checkouts", value: checkouts.length },
          { label: "Conversions", value: checkoutSuccess.length },
          { label: "Upgrades today", value: upgradesToday },
          { label: "Upgrades 7d", value: upgrades7d },
          { label: "Errors", value: errors.length },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-card p-3 shadow-card">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Step Funnel + Upgrade Funnel + Triggers */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Step Funnel (unique users)</h3>
          {stepFunnel.map((f) => (
            <div key={f.step} className="flex items-center justify-between py-1">
              <span className="text-xs">Step {f.step}</span>
              <span className="text-xs">
                <span className="font-bold">{f.viewed}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="font-bold text-accent">{f.saved}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Upgrade Funnel</h3>
          {upgradeFunnel.map((f, i) => (
            <div key={f.label} className="flex items-center justify-between py-1">
              <span className="text-xs">{f.label}</span>
              <span className="font-bold">{f.count}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Upgrade Sources</h3>
          {triggerSources.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data</p>
          ) : triggerSources.map(([source, count]) => (
            <div key={source} className="flex items-center justify-between py-1">
              <span className="text-xs truncate max-w-[120px]">{source}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Locked Feature Views</h3>
          {lockedViews.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data</p>
          ) : lockedViews.map(([feat, count]) => (
            <div key={feat} className="flex items-center justify-between py-1">
              <span className="text-xs truncate max-w-[120px]">{feat}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
          {topDropOff && (
            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground">Top drop-off: <span className="font-bold text-destructive">Step {topDropOff.step}</span> ({topDropOff.count})</p>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events (last 200)</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <div className="rounded-lg border overflow-auto max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.slice(0, 200).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs">{fmt(e.created_at)}</TableCell>
                    <TableCell className="font-medium text-xs">{e.event_name}</TableCell>
                    <TableCell className="max-w-[100px] truncate text-xs">{e.user_id?.slice(0, 8)}</TableCell>
                    <TableCell className="max-w-[80px] truncate text-xs text-muted-foreground">{e.session_id?.slice(0, 10)}</TableCell>
                    <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">{JSON.stringify(e.metadata)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="mt-4">
          <div className="rounded-lg border overflow-auto max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs">{fmt(e.created_at)}</TableCell>
                    <TableCell className="text-xs font-medium">{e.error_type}</TableCell>
                    <TableCell className="max-w-[350px] truncate text-xs text-destructive">{e.message}</TableCell>
                    <TableCell className="text-xs">{e.route}</TableCell>
                    <TableCell className="max-w-[100px] truncate text-xs">{e.user_id?.slice(0, 8)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
