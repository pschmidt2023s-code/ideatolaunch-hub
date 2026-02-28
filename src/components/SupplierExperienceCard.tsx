import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock, Package, Factory, Gift, TrendingUp, Info, Shield, Globe, FileWarning, Users, Timer } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { getFeatureAccess } from "@/lib/feature-flags";
import { matchSuppliers, type SupplierMatchInput, type ScoredSupplier } from "@/lib/supplier-matcher";
import { analyzeSupplierRisk, type SupplierRiskReport } from "@/lib/supplier-risk-engine";
import type { ProductionSupplier } from "@/data/suppliers/production";
import type { PackagingSupplier } from "@/data/suppliers/packaging";
import type { AddonSupplier } from "@/data/suppliers/addons";

interface SupplierExperienceCardProps {
  categoryId: string;
  budget: number;
  targetRegion: "EU" | "Asia" | "Global";
  launchQuantity: number;
  priceSegment: "budget" | "mid" | "premium";
  addonBudget?: number;
  // For risk engine
  unitCost?: number;
  monthlyBurn?: number;
  cashRunwayMonths?: number;
}

type AnySupplier = ProductionSupplier | PackagingSupplier | AddonSupplier;

function riskColor(level: string) {
  if (level === "critical") return "text-destructive";
  if (level === "high") return "text-orange-500";
  if (level === "medium") return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

function riskBg(level: string) {
  if (level === "critical") return "bg-destructive/10 border-destructive/30";
  if (level === "high") return "bg-orange-500/10 border-orange-500/30";
  if (level === "medium") return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-green-500/10 border-green-500/30";
}

function RiskLayerCard({ layer, isDE }: { layer: { label: { de: string; en: string }; score: number; level: string; details: { de: string; en: string }[] }; isDE: boolean }) {
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${riskBg(layer.level)}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{isDE ? layer.label.de : layer.label.en}</p>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold ${riskColor(layer.level)}`}>{layer.score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      {layer.details.map((d, i) => (
        <p key={i} className="text-[11px] text-muted-foreground">{isDE ? d.de : d.en}</p>
      ))}
    </div>
  );
}

function SupplierRow({ supplier, budget }: { supplier: AnySupplier; budget: number }) {
  const capitalMin = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[0];
  const capitalMax = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[1];
  const isRisky = capitalMin > budget * 0.6;

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm">{supplier.name}</div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {supplier.region}
          </Badge>
          <Badge variant="secondary" className="text-[10px] capitalize">{supplier.positioning}</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{supplier.notes}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Package className="h-3 w-3" />
          MOQ: {supplier.estimatedMOQ.toLocaleString("de-DE")}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          {supplier.estimatedUnitCostRange[0].toFixed(2)}–{supplier.estimatedUnitCostRange[1].toFixed(2)} €
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {supplier.leadTimeDays} {isRisky ? "" : ""}Tage
        </div>
      </div>
      <div className={`text-xs ${isRisky ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        Kapitalbedarf: {capitalMin.toLocaleString("de-DE")} – {capitalMax.toLocaleString("de-DE")} €
        {isRisky && " ⚠️ >60% Budget"}
      </div>
    </div>
  );
}

function LeadTimeBar({ days }: { days: number }) {
  const pct = Math.min((days / 60) * 100, 100);
  const color = days <= 21 ? "bg-green-500" : days <= 35 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="w-16 shrink-0">{days} Tage</span>
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AddonTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    tissue_paper: "Seidenpapier", sticker: "Sticker / Labels", thank_you_card: "Dankeskarte",
    custom_box: "Custom Box", sample_insert: "Beilage / Insert", ribbon: "Band / Ribbon", sleeve: "Sleeve",
  };
  return <Badge variant="outline" className="text-[10px]">{labels[type] ?? type}</Badge>;
}

function MatchContent({ input, riskReport, isExecution, isDE }: {
  input: SupplierMatchInput;
  riskReport: SupplierRiskReport | null;
  isExecution: boolean;
  isDE: boolean;
}) {
  const result = useMemo(() => matchSuppliers(input), [
    input.categoryId, input.budget, input.targetRegion,
    input.launchQuantity, input.priceSegment, input.addonBudget,
  ]);

  return (
    <div className="space-y-6">
      {/* 5-Layer Risk Intelligence */}
      {riskReport && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-accent" />
              {isDE ? "5-Layer Risk Intelligence" : "5-Layer Risk Intelligence"}
            </div>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${riskBg(riskReport.overallLevel)} ${riskColor(riskReport.overallLevel)}`}>
              {riskReport.overallScore}/100
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <RiskLayerCard layer={riskReport.layers.moqCapitalLock} isDE={isDE} />
            <RiskLayerCard layer={riskReport.layers.countryVolatility} isDE={isDE} />
            <RiskLayerCard layer={riskReport.layers.customsImport} isDE={isDE} />
            <RiskLayerCard layer={riskReport.layers.supplierDependency} isDE={isDE} />
            <RiskLayerCard layer={riskReport.layers.productionDelay} isDE={isDE} />
          </div>

          {/* Execution: Capital Exposure Summary */}
          {isExecution && riskReport.capitalExposureSummary && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent flex items-center gap-1.5 mb-1">
                <Shield className="h-3.5 w-3.5" />
                Capital Exposure Summary
              </p>
              <p className="text-sm text-foreground">
                {isDE ? riskReport.capitalExposureSummary.de : riskReport.capitalExposureSummary.en}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Region Recommendation */}
      <div className="rounded-lg border bg-accent/5 p-4 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-accent" />
          {isDE ? "Empfohlene Region" : "Recommended Region"}: {result.recommendedRegion}
        </div>
        <p className="text-xs text-muted-foreground">{result.reasoning}</p>
      </div>

      {result.insufficientMatches && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-400">
            <Info className="h-4 w-4" />
            {isDE ? "Nicht genügend Matches für diese Kategorie" : "Insufficient matches for this category"}
          </div>
          {result.suggestedCategories.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {isDE ? "Ähnliche Kategorien" : "Similar categories"}: {result.suggestedCategories.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Production Partners */}
      {result.productionSuppliers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Factory className="h-4 w-4" />
            Top {result.productionSuppliers.length} {isDE ? "Produktionspartner" : "Production Partners"}
          </div>
          {result.productionSuppliers.map((r) => (
            <SupplierRow key={r.supplier.name} supplier={r.supplier} budget={input.budget} />
          ))}
          <div className="space-y-1 pl-1">
            <p className="text-xs font-medium text-muted-foreground">{isDE ? "Vorlaufzeiten" : "Lead Times"}</p>
            {result.productionSuppliers.map((r) => (
              <LeadTimeBar key={r.supplier.name} days={r.supplier.leadTimeDays} />
            ))}
          </div>
        </div>
      )}

      {/* Packaging Partners */}
      {result.packagingSuppliers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4" />
            Top {result.packagingSuppliers.length} {isDE ? "Verpackungspartner" : "Packaging Partners"}
          </div>
          {result.packagingSuppliers.map((r) => (
            <SupplierRow key={r.supplier.name} supplier={r.supplier} budget={input.budget} />
          ))}
        </div>
      )}

      {/* Unboxing Add-ons */}
      {result.addonSuppliers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Gift className="h-4 w-4" />
            Unboxing Experience Add-ons
          </div>
          {result.addonSuppliers.map((r) => (
            <div key={r.supplier.name} className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-sm">{r.supplier.name}</div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <AddonTypeLabel type={(r.supplier as AddonSupplier).addonType} />
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {r.supplier.region}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{r.supplier.notes}</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Package className="h-3 w-3" />MOQ: {r.supplier.estimatedMOQ.toLocaleString("de-DE")}</div>
                <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{r.supplier.estimatedUnitCostRange[0].toFixed(2)}–{r.supplier.estimatedUnitCostRange[1].toFixed(2)} €</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.supplier.leadTimeDays} Tage</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Notes */}
      {result.riskNotes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {isDE ? "Risikohinweise" : "Risk Warnings"}
          </div>
          {result.riskNotes.map((note, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SupplierExperienceCard({
  categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget,
  unitCost = 0, monthlyBurn = 0, cashRunwayMonths = 6,
}: SupplierExperienceCardProps) {
  const { plan } = useSubscription();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const access = getFeatureAccess("supplierMatching", plan);
  const isExecution = plan === "execution";

  const hasInput = categoryId.length > 0 && budget > 0 && launchQuantity > 0;

  const input: SupplierMatchInput = { categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget };

  const riskReport = useMemo(() => {
    if (!hasInput || unitCost <= 0) return null;
    const regionMap: Record<string, string> = { EU: "EU", Asia: "China", Global: "China" };
    return analyzeSupplierRisk({
      moqUnits: launchQuantity,
      unitCost,
      totalCapital: budget,
      region: regionMap[targetRegion] || "EU",
      singleSupplier: true,
      leadTimeDays: targetRegion === "Asia" ? 45 : 21,
      monthlyBurn,
      cashRunwayMonths,
    });
  }, [hasInput, launchQuantity, unitCost, budget, targetRegion, monthlyBurn, cashRunwayMonths]);

  const card = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Factory className="h-5 w-5 text-accent" />
          Supplier Risk Intelligence
          <Badge variant="secondary" className="text-[10px] ml-auto">PRO</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasInput ? (
          <MatchContent input={input} riskReport={riskReport} isExecution={isExecution} isDE={isDE} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {isDE
              ? "Wähle eine Kategorie und fülle Budget und Menge aus, um passende Lieferanten zu finden."
              : "Select a category and fill in budget and quantity to find matching suppliers."}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (access !== "enabled") {
    return <LockedOverlay feature="supplierMatching">{card}</LockedOverlay>;
  }

  return card;
}
