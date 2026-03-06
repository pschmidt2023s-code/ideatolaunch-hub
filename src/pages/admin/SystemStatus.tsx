import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Database, Users, Zap, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface HealthCheck {
  status: string;
  latency_ms: number;
  details?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  total_latency_ms: number;
  checks: Record<string, HealthCheck>;
}

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  healthy: CheckCircle2,
  degraded: AlertTriangle,
  down: XCircle,
  unknown: AlertTriangle,
};

const STATUS_COLOR: Record<string, string> = {
  healthy: "text-green-500",
  degraded: "text-yellow-500",
  down: "text-destructive",
  unknown: "text-muted-foreground",
};

const CHECK_ICONS: Record<string, typeof Database> = {
  database: Database,
  auth: Users,
  edge_functions: Zap,
  error_rate: AlertTriangle,
};

export default function SystemStatus() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCounts, setErrorCounts] = useState<{ hour: number; day: number }>({ hour: 0, day: 0 });
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("admin_users").select("id").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health-check");
      if (!error && data) setHealth(data as HealthResponse);
    } catch {}
    setLoading(false);
  };

  const fetchMetrics = async () => {
    if (!isAdmin) return;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

    const [hourRes, dayRes, profileRes] = await Promise.all([
      supabase.from("error_logs").select("id", { count: "exact", head: true }).gte("created_at", oneHourAgo),
      supabase.from("error_logs").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    setErrorCounts({ hour: hourRes.count ?? 0, day: dayRes.count ?? 0 });
    setUserCount(profileRes.count ?? 0);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchHealth();
      fetchMetrics();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold">Admin-Zugang erforderlich</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const OverallIcon = STATUS_ICON[health?.status ?? "unknown"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-accent" />
          System Status
        </h1>
        <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {OverallIcon && <OverallIcon className={`h-10 w-10 ${STATUS_COLOR[health?.status ?? "unknown"]}`} />}
            <div>
              <p className="text-xl font-bold capitalize">{health?.status ?? "Loading..."}</p>
              <p className="text-sm text-muted-foreground">
                {health ? `Checked at ${new Date(health.timestamp).toLocaleTimeString()} · ${health.total_latency_ms}ms` : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {health && Object.entries(health.checks).map(([key, check]) => {
          const Icon = CHECK_ICONS[key] ?? Activity;
          const StatusIcon = STATUS_ICON[check.status] ?? AlertTriangle;
          return (
            <Card key={key}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
                  </div>
                  <StatusIcon className={`h-4 w-4 ${STATUS_COLOR[check.status]}`} />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{check.status}</Badge>
                  <span className="text-xs text-muted-foreground">{check.latency_ms}ms</span>
                </div>
                {check.details && <p className="text-[11px] text-muted-foreground truncate">{check.details}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Errors (1h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${errorCounts.hour > 20 ? "text-destructive" : errorCounts.hour > 5 ? "text-yellow-500" : "text-green-500"}`}>
              {errorCounts.hour}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Errors (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{errorCounts.day}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{userCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
