import { useEffect, useState } from "react";
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
  created_at: string;
}

interface ErrorLog {
  id: string;
  user_id: string | null;
  message: string;
  stack: string | null;
  route: string | null;
  created_at: string;
}

export default function InternalAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
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
          .limit(200),
        supabase
          .from("error_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      setEvents((evtRes.data as AnalyticsEvent[]) ?? []);
      setErrors((errRes.data as ErrorLog[]) ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  const upgradeClicks = events.filter((e) => e.event_name === "clicked_upgrade");
  const signups = events.filter((e) => e.event_name === "user_signed_up");
  const stepEvents = events.filter((e) => e.event_name === "step_completed");

  const fmt = (d: string) => format(new Date(d), "dd.MM.yy HH:mm");

  return (
    <div className="min-h-screen bg-background p-6 font-mono text-sm">
      <h1 className="mb-6 text-xl font-bold">Internal Analytics</h1>

      {/* KPI row */}
      <div className="mb-6 flex flex-wrap gap-4">
        {[
          { label: "Total Events", value: events.length },
          { label: "Signups", value: signups.length },
          { label: "Upgrade Clicks", value: upgradeClicks.length },
          { label: "Step Completions", value: stepEvents.length },
          { label: "Errors", value: errors.length },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-card p-4 shadow-card min-w-[140px]">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <div className="rounded-lg border overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap">{fmt(e.created_at)}</TableCell>
                    <TableCell className="font-medium">{e.event_name}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{e.user_id?.slice(0, 8)}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {JSON.stringify(e.metadata)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="mt-4">
          <div className="rounded-lg border overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap">{fmt(e.created_at)}</TableCell>
                    <TableCell className="max-w-[400px] truncate text-destructive">{e.message}</TableCell>
                    <TableCell>{e.route}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{e.user_id?.slice(0, 8)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="upgrades" className="mt-4">
          <div className="rounded-lg border overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upgradeClicks.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap">{fmt(e.created_at)}</TableCell>
                    <TableCell className="font-medium">{e.event_name}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{e.user_id?.slice(0, 8)}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {JSON.stringify(e.metadata)}
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
