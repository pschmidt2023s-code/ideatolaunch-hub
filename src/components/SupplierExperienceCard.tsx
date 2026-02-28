import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock, Package, Factory, Gift, TrendingUp, Info, Shield, Zap, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { getFeatureAccess } from "@/lib/feature-flags";
import { matchSuppliers, type SupplierMatchInput, type ScoredSupplier } from "@/lib/supplier-matcher";
import { computeSupplierRisk, type SupplierRiskInput, type RiskDimension } from "@/lib/supplier-risk-engine";
import type { ProductionSupplier } from "@/data/suppliers/production";
import type { PackagingSupplier } from "@/data/suppliers/packaging";
import type { AddonSupplier } from "@/data/suppliers/addons";
import { useTranslation } from "react-i18next";

interface SupplierExperienceCardProps {
  categoryId: string;
  budget: number;
  targetRegion: "EU" | "Asia" | "Global";
  launchQuantity: number;
  priceSegment: "budget" | "mid" | "premium";
  addonBudget?: number;
  monthlyBurnRate?: number;
  cashRunwayMonths?: number;
}

type AnySupplier = ProductionSupplier | PackagingSupplier | AddonSupplier;

const riskLevelColor: Record<string, string> = {
  low: "text-green-600 dark:text-green-400 border-green-500/30 bg-green-500/5",
  medium: "text-yellow-600 dark:text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
  high: "text-orange-500 border-orange-500/30 bg-orange-500/5",
  critical: "text-destructive border-destructive/30 bg-destructive/5",
};

const riskLevelLabel: Record<string, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

function SupplierRow({ supplier, budget }: { supplier: AnySupplier; budget: number }) {
  const capitalMin = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[0];
  const capitalMax = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[1];
  const isRisky = capitalMin > budget * 0.6;

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm">{supplier.name}</div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{supplier.region}</Badge>
          <Badge variant="secondary" className="text-[10px] capitalize">{supplier.positioning}</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{supplier.notes}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground"><Package className="h-3 w-3" />MOQ: {supplier.estimatedMOQ.toLocaleString("de-DE")}</div>
        <div className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3 w-3" />{supplier.estimatedUnitCostRange[0].toFixed(2)}–{supplier.estimatedUnitCostRange[1].toFixed(2)} €</div>
        <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{supplier.leadTimeDays} Tage</div>
      </div>
      <div className={`text-xs ${isRisky ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        Kapitalbedarf: {capitalMin.toLocaleString("de-DE")} – {capitalMax.toLocaleString("de-DE")} €
        {isRisky && " ⚠️ >60% Budget"}
      </div>
      {supplier.website && (
        <a
          href={supplier.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Partner besuchen
        </a>
      )}
    </div>
  );
}

function RiskDimensionRow({ dim, isDE }: { dim: RiskDimension; isDE: boolean }) {
  const colorClass = riskLevelColor[dim.level];
  return (
    <div className={`rounded-lg border p-3 space-y-1.5 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">{isDE ? dim.name : dim.nameEn}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">{dim.score}/100</span>
          <Badge variant="outline" className="text-[10px]">{riskLevelLabel[dim.level]}</Badge>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-background/50">
        <div className={`h-full rounded-full transition-all ${dim.level === "low" ? "bg-green-500" : dim.level === "medium" ? "bg-yellow-500" : dim.level === "high" ? "bg-orange-500" : "bg-destructive"}`} style={{ width: `${dim.score}%` }} />
      </div>
      <p className="text-[11px] opacity-80">{isDE ? dim.detail : dim.detailEn}</p>
    </div>
  );
}

export function SupplierExperienceCard({
  categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget,
  monthlyBurnRate = 2000, cashRunwayMonths = 4,
}: SupplierExperienceCardProps) {
  const { plan } = useSubscription();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const isExecution = plan === "execution";
  const access = getFeatureAccess("supplierMatching", plan);
  const hasInput = categoryId.length > 0 && budget > 0 && launchQuantity > 0;

  const input: SupplierMatchInput = { categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget };

  const result = useMemo(() => hasInput ? matchSuppliers(input) : null, [categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget, hasInput]);

  // 5-Layer Risk Intelligence
  const topSupplier = result?.productionSuppliers[0]?.supplier;
  const riskResult = useMemo(() => {
    if (!hasInput || !topSupplier) return null;
    const firstProdCost = topSupplier.estimatedMOQ * topSupplier.estimatedUnitCostRange[0];
    const riskInput: SupplierRiskInput = {
      totalCapital: budget, firstProductionCost: firstProdCost, supplierRegion: targetRegion,
      moq: topSupplier.estimatedMOQ, unitCost: topSupplier.estimatedUnitCostRange[0],
      leadTimeDays: topSupplier.leadTimeDays, singleSupplier: (result?.productionSuppliers.length ?? 0) <= 1,
      monthlyBurnRate, cashRunwayMonths,
    };
    return computeSupplierRisk(riskInput);
  }, [hasInput, topSupplier, budget, targetRegion, result, monthlyBurnRate, cashRunwayMonths]);

  const card = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Factory className="h-5 w-5 text-accent" />
          Supplier Experience
          <Badge variant="secondary" className="text-[10px] ml-auto">PRO</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasInput && result ? (
          <div className="space-y-6">
            {/* Region Recommendation */}
            <div className="rounded-lg border bg-accent/5 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-accent" />{isDE ? "Empfohlene Region" : "Recommended Region"}: {result.recommendedRegion}</div>
              <p className="text-xs text-muted-foreground">{result.reasoning}</p>
            </div>

            {/* ═══ 5-LAYER RISK INTELLIGENCE ═══ */}
            {riskResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    {isDE ? "Risk Intelligence" : "Risk Intelligence"}
                  </h3>
                  <Badge variant="outline" className={`text-[10px] ${riskLevelColor[riskResult.overallLevel]}`}>
                    {isDE ? "Gesamt" : "Overall"}: {riskResult.overallScore}/100 — {riskLevelLabel[riskResult.overallLevel]}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {riskResult.dimensions.map((dim) => (
                    <RiskDimensionRow key={dim.name} dim={dim} isDE={isDE} />
                  ))}
                </div>

                {/* Execution: Capital Exposure Summary */}
                {isExecution && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                    <p className="text-xs font-semibold flex items-center gap-1.5 text-amber-600">
                      <Zap className="h-3.5 w-3.5" />
                      Capital Exposure Summary
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isDE ? riskResult.capitalExposure.message : riskResult.capitalExposure.messageEn}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded border p-2 text-center">
                        <p className="text-muted-foreground">{isDE ? "Aktueller Runway" : "Current Runway"}</p>
                        <p className="font-bold">{riskResult.capitalExposure.currentRunway.toFixed(1)} Mo.</p>
                      </div>
                      <div className="rounded border p-2 text-center">
                        <p className="text-muted-foreground">{isDE ? "Nach Underperformance" : "After Underperformance"}</p>
                        <p className={`font-bold ${riskResult.capitalExposure.runwayAfterUnderperformance < 3 ? "text-destructive" : ""}`}>
                          {riskResult.capitalExposure.runwayAfterUnderperformance} Mo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Insufficient matches */}
            {result.insufficientMatches && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-400"><Info className="h-4 w-4" />{isDE ? "Nicht genügend Matches" : "Insufficient Matches"}</div>
                {result.suggestedCategories.length > 0 && (
                  <p className="text-xs text-muted-foreground">{isDE ? "Ähnliche Kategorien" : "Similar categories"}: {result.suggestedCategories.join(", ")}</p>
                )}
              </div>
            )}

            {/* Production Partners */}
            {result.productionSuppliers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Factory className="h-4 w-4" />Top {result.productionSuppliers.length} {isDE ? "Produktionspartner" : "Production Partners"}</div>
                {result.productionSuppliers.map((r) => (<SupplierRow key={r.supplier.name} supplier={r.supplier} budget={budget} />))}
              </div>
            )}

            {/* Packaging Partners */}
            {result.packagingSuppliers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Package className="h-4 w-4" />Top {result.packagingSuppliers.length} {isDE ? "Verpackungspartner" : "Packaging Partners"}</div>
                {result.packagingSuppliers.map((r) => (<SupplierRow key={r.supplier.name} supplier={r.supplier} budget={budget} />))}
              </div>
            )}

            {/* Add-ons */}
            {result.addonSuppliers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Gift className="h-4 w-4" />Unboxing Add-ons</div>
                {result.addonSuppliers.map((r) => (<SupplierRow key={r.supplier.name} supplier={r.supplier} budget={budget} />))}
              </div>
            )}

            {/* Risk Notes */}
            {result.riskNotes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive"><AlertTriangle className="h-4 w-4" />{isDE ? "Risikohinweise" : "Risk Notes"}</div>
                {result.riskNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive shrink-0" />
                    <p className="text-xs text-destructive">{note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isDE ? "Wähle eine Kategorie und fülle Budget und Menge aus, um passende Lieferanten zu finden." : "Select a category and fill in budget and quantity to find matching suppliers."}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (access !== "enabled") {
    return (<LockedOverlay feature="supplierMatching">{card}</LockedOverlay>);
  }

  return card;
}
