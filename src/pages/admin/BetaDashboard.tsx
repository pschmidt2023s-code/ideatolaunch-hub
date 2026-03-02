import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CardGrid } from "@/components/dashboard/CardGrid";
import { getBetaFeedback, getBetaSessionStats } from "@/lib/beta-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

export default function BetaDashboard() {
  const feedback = getBetaFeedback();
  const stats = getBetaSessionStats();

  const categoryCount = feedback.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const routeFreq = feedback.reduce<Record<string, number>>((acc, f) => {
    acc[f.route] = (acc[f.route] || 0) + 1;
    return acc;
  }, {});

  const topRoutes = Object.entries(routeFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <DashboardLayout>
      <SEO title="Beta Dashboard – Admin" description="Beta client analytics" path="/admin/beta" />
      <div className="animate-fade-in space-y-8">
        <PageHeader title="Beta Dashboard" description="Übersicht über Beta-Nutzung und Feedback." />

        <CardGrid cols={4}>
          <MetricCard label="Feedback Count" value={feedback.length} />
          <MetricCard label="Session Dauer" value={`${stats.durationMinutes} min`} />
          <MetricCard label="Unique Routes" value={stats.uniqueRoutes} />
          <MetricCard label="Klicks (Session)" value={stats.clicks} />
        </CardGrid>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Top Routes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aktivste Routes</CardTitle>
            </CardHeader>
            <CardContent>
              {topRoutes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Daten.</p>
              ) : (
                <div className="space-y-2">
                  {topRoutes.map(([route, count]) => (
                    <div key={route} className="flex items-center justify-between rounded-lg border p-2.5">
                      <span className="text-sm font-mono truncate">{route}</span>
                      <Badge variant="secondary">{count}×</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback by Category */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Feedback nach Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(categoryCount).length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch kein Feedback.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(categoryCount).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between rounded-lg border p-2.5">
                      <span className="text-sm capitalize">{cat}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Feedback */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Letztes Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch kein Feedback vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {feedback.slice(-10).reverse().map((f) => (
                  <div key={f.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{f.category}</Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">{f.route}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(f.timestamp).toLocaleString("de-DE")}
                      </span>
                    </div>
                    <p className="text-sm">{f.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
