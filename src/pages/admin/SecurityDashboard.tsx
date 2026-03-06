import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Shield, AlertTriangle, Lock, Eye, Activity,
  Clock, UserX, ShieldAlert, ShieldCheck, TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  route: string | null;
  ip_hint: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const EVENT_META: Record<string, { icon: React.ElementType; color: string; label: string; severity: "critical" | "warning" | "info" }> = {
  failed_login: { icon: UserX, color: "text-destructive", label: "Fehlgeschlagener Login", severity: "critical" },
  rate_limited: { icon: ShieldAlert, color: "text-warning", label: "Rate Limited", severity: "warning" },
  suspicious_activity: { icon: AlertTriangle, color: "text-destructive", label: "Verdächtige Aktivität", severity: "critical" },
  session_expired: { icon: Clock, color: "text-muted-foreground", label: "Session abgelaufen", severity: "info" },
  admin_access: { icon: Shield, color: "text-accent", label: "Admin-Zugriff", severity: "info" },
  password_weak: { icon: Lock, color: "text-warning", label: "Schwaches Passwort", severity: "warning" },
};

export default function SecurityDashboard() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["security_events_admin"],
    queryFn: async () => {
      const { data } = await supabase
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as SecurityEvent[];
    },
  });

  const { data: loginAttempts = [] } = useQuery({
    queryKey: ["login_attempts_admin"],
    queryFn: async () => {
      const { data } = await supabase
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  // Stats
  const last24h = events.filter(e => new Date(e.created_at) > new Date(Date.now() - 86400_000));
  const failedLogins = last24h.filter(e => e.event_type === "failed_login").length;
  const rateLimited = last24h.filter(e => e.event_type === "rate_limited").length;
  const suspicious = last24h.filter(e => e.event_type === "suspicious_activity").length;
  const totalEvents = last24h.length;

  const threatLevel = suspicious > 0 ? "critical" : failedLogins > 10 ? "high" : failedLogins > 3 ? "medium" : "low";
  const threatColors: Record<string, string> = {
    critical: "text-destructive bg-destructive/10 border-destructive/30",
    high: "text-destructive bg-destructive/10 border-destructive/20",
    medium: "text-warning bg-warning/10 border-warning/20",
    low: "text-success bg-success/10 border-success/20",
  };
  const threatLabels: Record<string, string> = { critical: "Kritisch", high: "Hoch", medium: "Mittel", low: "Niedrig" };

  return (
    <DashboardLayout>
      <SEO title="Security Dashboard" description="Sicherheitsübersicht und Event-Monitoring." path="/admin/security" />
      <div className="animate-fade-in space-y-6">
        <PageHeader title="Security Dashboard" description="Echtzeit-Sicherheitsüberwachung und Anomalieerkennung" badge="Admin" badgeVariant="destructive" />

        {/* Threat Level Banner */}
        <div className={cn("rounded-2xl border-2 p-6 flex items-center gap-4", threatColors[threatLevel])}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50">
            {threatLevel === "low" ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold">Bedrohungslevel: {threatLabels[threatLevel]}</h2>
            <p className="text-sm opacity-80">
              {totalEvents} Security-Events in den letzten 24h · {failedLogins} fehlgeschlagene Logins · {rateLimited} Rate Limits
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={UserX} label="Failed Logins (24h)" value={failedLogins} color="text-destructive bg-destructive/10" />
          <StatCard icon={ShieldAlert} label="Rate Limited (24h)" value={rateLimited} color="text-warning bg-warning/10" />
          <StatCard icon={AlertTriangle} label="Verdächtig (24h)" value={suspicious} color="text-destructive bg-destructive/10" />
          <StatCard icon={Activity} label="Gesamt-Events (24h)" value={totalEvents} color="text-primary bg-primary/10" />
        </div>

        {/* Event Timeline */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" /> Security Event Timeline
          </h3>
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Lade Events…</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center flex flex-col items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-success" />
              Keine Security-Events gefunden
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {events.slice(0, 50).map((event) => {
                const meta = EVENT_META[event.event_type] || {
                  icon: Activity, color: "text-muted-foreground",
                  label: event.event_type, severity: "info" as const,
                };
                const Icon = meta.icon;

                return (
                  <div key={event.id} className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                    meta.severity === "critical" ? "border-destructive/20 bg-destructive/5" :
                    meta.severity === "warning" ? "border-warning/20 bg-warning/5" : "border-border"
                  )}>
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{meta.label}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {format(new Date(event.created_at), "dd.MM. HH:mm", { locale: de })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {event.route && (
                          <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 font-mono">{event.route}</span>
                        )}
                        {event.ip_hint && (
                          <span className="text-[10px] rounded bg-muted px-1.5 py-0.5">IP: {event.ip_hint}</span>
                        )}
                        {event.metadata && typeof event.metadata === "object" && Object.keys(event.metadata).length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {Object.entries(event.metadata).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Login Attempts */}
        {loginAttempts.length > 0 && (
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4" /> Login-Versuche (letzte 50)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">E-Mail (Hint)</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {loginAttempts.map((a: any) => (
                    <tr key={a.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs">{a.email_hint}</td>
                      <td className="py-2 pr-4">
                        <span className={cn("text-xs font-bold", a.success ? "text-success" : "text-destructive")}>
                          {a.success ? "✓ Erfolg" : "✗ Fehlgeschlagen"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground tabular-nums">
                        {format(new Date(a.created_at), "dd.MM. HH:mm:ss", { locale: de })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
