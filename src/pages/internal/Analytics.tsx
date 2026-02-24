import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
        supabase
          .from("analytics_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("error_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      setEvents((evtRes.data as AnalyticsEvent[]) ?? []);
      setErrors((errRes.data as ErrorLog[]) ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  const fmt = (d: string) => format(new Date(d), "dd.MM.yy HH:mm:ss");

  // ── Computed metrics ──
  const now = Date.now();
  const last24h = events.filter(
    (e) => now - new Date(e.created_at).getTime() < 24 * 60 * 60 * 1000
  );
  const activeUsers24h = new Set(last24h.map((e) => e.user_id)).size;

  const upgradeClicks = events.filter((e) => e.event_name === "clicked_upgrade");
  const signups = events.filter((e) => e.event_name === "user_signed_up");
  const checkouts = events.filter((e) => e.event_name === "checkout_started");
  const subscriptions = events.filter((e) => e.event_name === "subscription_started");

  // Funnel rates
  const funnelSteps = [
    { name: "Idea", event: "idea_completed" },
    { name: "Calculator", event: "calculator_completed" },
    { name: "Production", event: "production_completed" },
    { name: "Insights", event: "viewed_insights" },
  ];
  const funnelCounts = funnelSteps.map((s) => ({
    ...s,
    count: new Set(events.filter((e) => e.event_name === s.event).map((e) => e.user_id)).size,
  }));

  // Drop-offs
  const dropOffs = events.filter((e) => e.event_name === "step_abandoned");
  const dropOffByStep = useMemo(() => {
    const map: Record<number, number> = {};
    dropOffs.forEach((e) => {
      const step = (e.metadata as any)?.step;
      if (step) map[step] = (map[step] || 0) + 1;
    });
    return Object.entries(map)
      .map(([step, count]) => ({ step: Number(step), count }))
      .sort((a, b) => a.step - b.step);
  }, [dropOffs]);

  // Avg time per step (from sessions)
  const stepEvents = events.filter((e) => e.event_name === "step_completed");
  const avgTimePerStep = useMemo(() => {
    const sessions: Record<string, { step: number; time: number }[]> = {};
    stepEvents.forEach((e) => {
      const sid = e.session_id;
      if (!sid) return;
      if (!sessions[sid]) sessions[sid] = [];
      sessions[sid].push({
        step: (e.metadata as any)?.step ?? 0,
        time: new Date(e.created_at).getTime(),
      });
    });

    const stepTimes: Record<number, number[]> = {};
    Object.values(sessions).forEach((entries) => {
      entries.sort((a, b) => a.time - b.time);
      for (let i = 1; i < entries.length; i++) {
        const diff = (entries[i].time - entries[i - 1].time) / 1000 / 60;
        if (diff < 60) {
          const step = entries[i - 1].step;
          if (!stepTimes[step]) stepTimes[step] = [];
          stepTimes[step].push(diff);
        }
      }
    });

    return Object.entries(stepTimes)
      .map(([step, times]) => ({
        step: Number(step),
        avg: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10,
      }))
      .sort((a, b) => a.step - b.step);
  }, [stepEvents]);

  // Performance warnings
  const perfWarnings = events.filter((e) => e.event_name === "performance_warning");

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 font-mono text-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Internal Analytics</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </button>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Active (24h)", value: activeUsers24h },
          { label: "Signups", value: signups.length },
          { label: "Upgrade Clicks", value: upgradeClicks.length },
          { label: "Checkouts", value: checkouts.length },
          { label: "Subscriptions", value: subscriptions.length },
          { label: "Errors", value: errors.length },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border bg-card p-3 shadow-card"
          >
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel + Drop-off + Avg Time */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Funnel Completion (unique users)
          </h3>
          {funnelCounts.map((f) => (
            <div key={f.event} className="flex items-center justify-between py-1">
              <span className="text-xs">{f.name}</span>
              <span className="font-bold">{f.count}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Drop-offs per Step
          </h3>
          {dropOffByStep.length === 0 ? (
            <p className="text-xs text-muted-foreground">No drop-offs yet</p>
          ) : (
            dropOffByStep.map((d) => (
              <div key={d.step} className="flex items-center justify-between py-1">
                <span className="text-xs">Step {d.step}</span>
                <span className="font-bold text-destructive">{d.count}</span>
              </div>
            ))
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Avg. Time per Step (min)
          </h3>
          {avgTimePerStep.length === 0 ? (
            <p className="text-xs text-muted-foreground">Not enough data</p>
          ) : (
            avgTimePerStep.map((s) => (
              <div key={s.step} className="flex items-center justify-between py-1">
                <span className="text-xs">Step {s.step}</span>
                <span className="font-bold">{s.avg}m</span>
              </div>
            ))
          )}
        </div>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
                    <TableCell className="whitespace-nowrap text-xs">
                      {fmt(e.created_at)}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {e.event_name}
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate text-xs">
                      {e.user_id?.slice(0, 8)}
                    </TableCell>
                    <TableCell className="max-w-[80px] truncate text-xs text-muted-foreground">
                      {e.session_id?.slice(0, 10)}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">
                      {JSON.stringify(e.metadata)}
                    </TableCell>
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
                    <TableCell className="whitespace-nowrap text-xs">
                      {fmt(e.created_at)}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{e.error_type}</TableCell>
                    <TableCell className="max-w-[350px] truncate text-xs text-destructive">
                      {e.message}
                    </TableCell>
                    <TableCell className="text-xs">{e.route}</TableCell>
                    <TableCell className="max-w-[100px] truncate text-xs">
                      {e.user_id?.slice(0, 8)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="rounded-lg border overflow-auto max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Time</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Duration (ms)</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perfWarnings.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {fmt(e.created_at)}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {(e.metadata as any)?.label ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs font-bold">
                      {(e.metadata as any)?.duration_ms ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate text-xs">
                      {e.user_id?.slice(0, 8)}
                    </TableCell>
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
