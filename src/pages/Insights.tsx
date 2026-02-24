import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Lightbulb,
  Compass,
  Shield,
  Info,
  AlertCircle,
} from "lucide-react";

export default function InsightsPage() {
  const { health } = useBrandHealth();
  const { isFree } = useSubscription();
  const { t } = useTranslation();

  if (!health) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Info className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">{t("insights.noData")}</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t("insights.noDataDesc")}</p>
        </div>
      </DashboardLayout>
    );
  }

  const risks = health.insights.filter((i) => i.type === "risk").slice(0, 3);
  const optimizations = health.insights.filter((i) => i.type === "optimization").slice(0, 3);
  const strategy = health.insights.find((i) => i.type === "strategy");

  const severityIcon = {
    critical: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  };

  const insightsContent = (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("insights.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("insights.subtitle")}</p>
      </div>

      {strategy && (
        <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Compass className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">{t("insights.strategy")}</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{strategy.description}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold">{t("insights.risks")}</h2>
          </div>
          {risks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("insights.noRisks")}</p>
          ) : (
            <div className="space-y-3">
              {risks.map((risk, i) => (
                <div key={i} className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm font-semibold">{risk.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{risk.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">{t("insights.optimizations")}</h2>
          </div>
          {optimizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("insights.noOptimizations")}</p>
          ) : (
            <div className="space-y-3">
              {optimizations.map((opt, i) => (
                <div key={i} className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <p className="text-sm font-semibold">{opt.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {health.warnings.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold">{t("insights.allWarnings")} ({health.warnings.length})</h2>
          </div>
          <div className="space-y-2">
            {health.warnings.map((w) => (
              <div key={w.id} className="flex gap-3 rounded-lg border p-3">
                {severityIcon[w.severity]}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{w.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{w.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {isFree ? (
        <LockedOverlay message={t("upgrade.locked")}>
          {insightsContent}
        </LockedOverlay>
      ) : (
        insightsContent
      )}
    </DashboardLayout>
  );
}
