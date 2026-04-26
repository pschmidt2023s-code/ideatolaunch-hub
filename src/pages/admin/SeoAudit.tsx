import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, AlertTriangle, AlertCircle, Info, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Run {
  id: string;
  status: string;
  scan_type: string;
  urls_scanned: number;
  findings_count: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  overall_score: number | null;
  duration_ms: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

interface Finding {
  id: string;
  url: string;
  category: string;
  severity: "critical" | "warning" | "info";
  code: string;
  title: string;
  description: string | null;
  recommendation: string | null;
  current_value: string | null;
  expected_value: string | null;
  fix_status: string;
  auto_fixable: boolean;
}

const severityIcon = (s: string) => {
  if (s === "critical") return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (s === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <Info className="h-4 w-4 text-blue-500" />;
};

const severityVariant = (s: string): "destructive" | "secondary" | "default" =>
  s === "critical" ? "destructive" : s === "warning" ? "secondary" : "default";

export default function SeoAudit() {
  const qc = useQueryClient();
  const [origin, setOrigin] = useState("https://ideatolaunch-hub.lovable.app");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const runsQ = useQuery({
    queryKey: ["seo-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_audit_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Run[];
    },
    refetchInterval: (q) => {
      const runs = q.state.data as Run[] | undefined;
      return runs?.some((r) => r.status === "running" || r.status === "pending") ? 3000 : false;
    },
  });

  // Auto-select most recent run when none selected
  useEffect(() => {
    if (!selectedRunId && runsQ.data && runsQ.data.length > 0) {
      setSelectedRunId(runsQ.data[0].id);
    }
  }, [runsQ.data, selectedRunId]);

  const findingsQ = useQuery({
    queryKey: ["seo-findings", selectedRunId],
    enabled: !!selectedRunId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_audit_findings")
        .select("*")
        .eq("run_id", selectedRunId!)
        .order("severity", { ascending: true })
        .limit(2000);
      if (error) throw error;
      return data as Finding[];
    },
  });

  const defaultTab = useMemo(() => {
    if (!findingsQ.data) return "critical";
    if (findingsQ.data.some((f) => f.severity === "critical")) return "critical";
    if (findingsQ.data.some((f) => f.severity === "warning")) return "warning";
    return "info";
  }, [findingsQ.data]);

  const startScan = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("seo-audit-scan", {
        body: { origin, scanType: "full" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      toast.success("Scan gestartet", { description: `Run ID: ${data.runId}` });
      setSelectedRunId(data.runId);
      qc.invalidateQueries({ queryKey: ["seo-runs"] });
    },
    onError: (e: any) => toast.error("Scan fehlgeschlagen", { description: e.message }),
  });

  const updateFix = useMutation({
    mutationFn: async ({ id, fix_status }: { id: string; fix_status: string }) => {
      const { error } = await supabase.from("seo_audit_findings").update({ fix_status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seo-findings", selectedRunId] }),
  });

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">SEO Audit Scanner</h1>
        <p className="text-sm text-muted-foreground">Modul 1: Technical + On-Page + Performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neuen Scan starten</CardTitle>
          <CardDescription>Crawlt sitemap.xml + prüft jede URL gegen 25+ SEO-Regeln. PageSpeed läuft für die ersten 5 URLs.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="https://example.com" />
          <Button onClick={() => startScan.mutate()} disabled={startScan.isPending}>
            {startScan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Scan starten
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Scan-Verlauf</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {runsQ.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {runsQ.data?.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRunId(r.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedRunId === r.id ? "bg-accent border-primary" : "hover:bg-accent/50"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={r.status === "completed" ? "default" : r.status === "failed" ? "destructive" : "secondary"}>
                    {r.status === "running" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    {r.status}
                  </Badge>
                  {r.overall_score !== null && (
                    <span className={`text-lg font-bold ${r.overall_score >= 80 ? "text-green-600" : r.overall_score >= 50 ? "text-yellow-600" : "text-destructive"}`}>
                      {r.overall_score}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(r.started_at), { addSuffix: true, locale: de })}
                </div>
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-destructive">●{r.critical_count}</span>
                  <span className="text-yellow-600">●{r.warning_count}</span>
                  <span className="text-blue-500">●{r.info_count}</span>
                  <span className="text-muted-foreground ml-auto">{r.urls_scanned} URLs</span>
                </div>
              </button>
            ))}
            {runsQ.data?.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Scans.</p>}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {!selectedRunId && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Wähle einen Scan aus oder starte einen neuen.
              </CardContent>
            </Card>
          )}
          {selectedRunId && findingsQ.isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
          {selectedRunId && findingsQ.data && (
            <Tabs defaultValue={defaultTab} key={`${selectedRunId}-${defaultTab}`}>
              <TabsList>
                <TabsTrigger value="critical">Kritisch ({findingsQ.data.filter((f) => f.severity === "critical").length})</TabsTrigger>
                <TabsTrigger value="warning">Warnung ({findingsQ.data.filter((f) => f.severity === "warning").length})</TabsTrigger>
                <TabsTrigger value="info">Info ({findingsQ.data.filter((f) => f.severity === "info").length})</TabsTrigger>
              </TabsList>
              {(["critical", "warning", "info"] as const).map((sev) => (
                <TabsContent key={sev} value={sev} className="space-y-3">
                  {findingsQ.data.filter((f) => f.severity === sev).map((f) => (
                    <Card key={f.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {severityIcon(f.severity)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{f.title}</div>
                              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 truncate max-w-full">
                                {f.url} <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{f.category}</Badge>
                        </div>
                        {(f.current_value || f.expected_value) && (
                          <div className="text-xs flex gap-4 pl-6">
                            {f.current_value && <span><span className="text-muted-foreground">Ist:</span> {f.current_value}</span>}
                            {f.expected_value && <span><span className="text-muted-foreground">Soll:</span> {f.expected_value}</span>}
                          </div>
                        )}
                        {f.recommendation && (
                          <div className="text-xs bg-muted/50 p-2 rounded pl-6">
                            <strong>Fix:</strong> {f.recommendation}
                            {f.auto_fixable && <Badge variant="secondary" className="ml-2 text-xs">Auto-Fix möglich</Badge>}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pl-6">
                          <Badge variant={severityVariant(f.fix_status === "fixed" ? "info" : "warning")} className="text-xs">
                            {f.fix_status === "fixed" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                            {f.fix_status}
                          </Badge>
                          {f.fix_status !== "fixed" && (
                            <Button size="sm" variant="ghost" onClick={() => updateFix.mutate({ id: f.id, fix_status: "fixed" })}>
                              Als behoben markieren
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {findingsQ.data.filter((f) => f.severity === sev).length === 0 && (
                    <p className="text-sm text-muted-foreground p-6 text-center">Keine Findings dieser Stufe 🎉</p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
