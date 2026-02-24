import { useBrandHealth } from "@/hooks/useBrandHealth";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";

export function BrandHealthCard() {
  const { health } = useBrandHealth();
  const { t } = useTranslation();

  if (!health) return null;

  const colorClasses = {
    red: "from-destructive/20 to-destructive/5 border-destructive/30",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    green: "from-green-500/20 to-green-500/5 border-green-500/30",
  };

  const scoreColor = {
    red: "text-destructive",
    yellow: "text-yellow-600 dark:text-yellow-400",
    green: "text-green-600 dark:text-green-400",
  };

  const severityIcon = {
    critical: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  };

  const topWarnings = health.warnings.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <div className={`rounded-xl border bg-gradient-to-br p-6 ${colorClasses[health.color]}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("health.title")}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${scoreColor[health.color]}`}>{health.score}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
            <p className={`mt-1 text-sm font-medium ${scoreColor[health.color]}`}>{health.label}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
            health.color === "green" ? "bg-green-500/10" : health.color === "yellow" ? "bg-yellow-500/10" : "bg-destructive/10"
          }`}>
            {health.color === "green" ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : health.color === "yellow" ? (
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{health.explanation}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-background/60 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              {t("health.biggestRisk")}
            </div>
            <p className="mt-1 text-sm font-medium">{health.biggestRisk}</p>
          </div>
          <div className="rounded-lg bg-background/60 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ArrowRight className="h-3.5 w-3.5" />
              {t("health.nextAction")}
            </div>
            <p className="mt-1 text-sm font-medium">{health.nextAction}</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {topWarnings.length > 0 && (
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold">{t("health.warnings")}</h3>
          <div className="space-y-2.5">
            {topWarnings.map((w) => (
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
}
