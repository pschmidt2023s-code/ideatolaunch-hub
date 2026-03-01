import { useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertTriangle, MapPin, Clock, Package, Factory, Gift, TrendingUp,
  Info, Shield, Zap, ExternalLink as ExternalLinkIcon, Filter, Star, ChevronDown, ChevronUp,
} from "lucide-react";
import { openExternal } from "@/lib/openExternal";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { getFeatureAccess } from "@/lib/feature-flags";
import { matchSuppliers, type SupplierMatchInput, type ScoredSupplier } from "@/lib/supplier-matcher";
import { computeSupplierRisk, type SupplierRiskInput, type RiskDimension } from "@/lib/supplier-risk-engine";
import type { ProductionSupplier } from "@/data/suppliers/production";
import type { PackagingSupplier } from "@/data/suppliers/packaging";
import type { AddonSupplier } from "@/data/suppliers/addons";
import {
  applyFilters, computeSmartScore, getFitLabel, getDelayWarning,
  type SupplierFilter, DEFAULT_FILTERS, type AnyIntelligentSupplier,
} from "@/lib/supplier-recommendation";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";

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

function getRiskColor(score: number) {
  if (score <= 20) return "text-green-500";
  if (score <= 45) return "text-yellow-500";
  if (score <= 65) return "text-orange-500";
  return "text-destructive";
}

function getReliabilityColor(score: number) {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  return "text-orange-500";
}

function buildSupplierUrl(supplier: AnyIntelligentSupplier): string | undefined {
  // Use affiliate URL if available, otherwise website
  const url = supplier.affiliateAvailable && supplier.affiliateUrl
    ? supplier.affiliateUrl
    : supplier.website;
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (!supplier.affiliateAvailable) {
      u.searchParams.set("ref", "brandos");
    }
    return u.toString();
  } catch {
    return url;
  }
}

function SupplierRow({
  supplier,
  budget,
  cashRunwayMonths = 4,
  fitLabel,
  onClickTrack,
}: {
  supplier: AnyIntelligentSupplier;
  budget: number;
  cashRunwayMonths?: number;
  fitLabel: string;
  onClickTrack: (supplier: AnyIntelligentSupplier) => void;
}) {
  const capitalMin = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[0];
  const capitalMax = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[1];
  const isRisky = capitalMin > budget * 0.6;
  const href = buildSupplierUrl(supplier);
  const delayWarning = getDelayWarning(supplier, cashRunwayMonths);

  const handleClick = () => {
    onClickTrack(supplier);
  };

  const handleCardClick = () => {
    handleClick();
    if (href) openExternal(href);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`group rounded-lg border bg-muted/30 p-4 space-y-3 transition-all hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5 ${href ? "cursor-pointer" : ""}`}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={href ? handleCardClick : undefined}
      onKeyDown={href ? handleCardKeyDown : undefined}
      aria-label={href ? `${supplier.name} – Website besuchen` : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="font-semibold text-sm text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5">
            {supplier.name}
            {href && <ExternalLinkIcon className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />}
          </div>
          {fitLabel && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
              <Star className="h-3 w-3" />
              {fitLabel}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {supplier.euBased && <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600 dark:text-blue-400">EU</Badge>}
          <Badge variant="secondary" className="text-[10px] capitalize">{supplier.positioning}</Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{supplier.notes}</p>

      {/* Intelligence scores */}
      <div className="grid grid-cols-3 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded border p-1.5 text-center cursor-help">
              <p className="text-[10px] text-muted-foreground">Risk</p>
              <p className={`text-xs font-bold ${getRiskColor(supplier.riskScore)}`}>{supplier.riskScore}/100</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px]">
            <p className="text-xs">Risiko-Score: Basierend auf MOQ, Vorlaufzeit, Land und Kapitalbindung.</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded border p-1.5 text-center cursor-help">
              <p className="text-[10px] text-muted-foreground">Capital Lock</p>
              <p className={`text-xs font-bold ${getRiskColor(supplier.capitalLockScore)}`}>{supplier.capitalLockScore}/100</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px]">
            <p className="text-xs">Kapitalbindung: Wie viel % deines Kapitals in der ersten Bestellung gebunden ist.</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded border p-1.5 text-center cursor-help">
              <p className="text-[10px] text-muted-foreground">Reliability</p>
              <p className={`text-xs font-bold ${getReliabilityColor(supplier.reliabilityScore)}`}>{supplier.reliabilityScore}/100</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px]">
            <p className="text-xs">Zuverlässigkeit: Bewertung der Liefertreue und Qualitätskonsistenz.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground"><Package className="h-3 w-3" />MOQ: {supplier.estimatedMOQ.toLocaleString("de-DE")}</div>
        <div className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3 w-3" />{supplier.estimatedUnitCostRange[0].toFixed(2)}–{supplier.estimatedUnitCostRange[1].toFixed(2)} €</div>
        <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{supplier.leadTimeDays} Tage</div>
      </div>

      {/* Capital requirement */}
      <div className={`text-xs ${isRisky ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        Kapitalbedarf: {capitalMin.toLocaleString("de-DE")} – {capitalMax.toLocaleString("de-DE")} €
        {isRisky && " ⚠️ >60% Budget"}
      </div>

      {/* Delay warning */}
      {delayWarning && (
        <div className="text-[11px] text-orange-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 shrink-0" />{delayWarning}
        </div>
      )}

      {/* Tags */}
      {supplier.recommendedFor.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {supplier.recommendedFor.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] border-accent/20 text-accent/80">{tag}</Badge>
          ))}
        </div>
      )}

      {/* CTA */}
      {href && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors">
            <ExternalLinkIcon className="h-3 w-3" />
            Website besuchen
          </span>
        </div>
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
        <div
          className={`h-full rounded-full transition-all ${dim.level === "low" ? "bg-green-500" : dim.level === "medium" ? "bg-yellow-500" : dim.level === "high" ? "bg-orange-500" : "bg-destructive"}`}
          style={{ width: `${dim.score}%` }}
        />
      </div>
      <p className="text-[11px] opacity-80">{isDE ? dim.detail : dim.detailEn}</p>
    </div>
  );
}

function FilterBar({ filters, onChange }: { filters: SupplierFilter; onChange: (f: SupplierFilter) => void }) {
  const [open, setOpen] = useState(false);
  const activeCount = [filters.euOnly, filters.fastDelivery, filters.lowCapitalRisk, filters.affiliateOnly, filters.maxMOQ !== null].filter(Boolean).length;

  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
      <button
        className="flex items-center justify-between w-full text-sm font-medium"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-accent" />
          Filter
          {activeCount > 0 && <Badge variant="secondary" className="text-[10px]">{activeCount} aktiv</Badge>}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Switch id="eu-only" checked={filters.euOnly} onCheckedChange={(v) => onChange({ ...filters, euOnly: v })} />
            <Label htmlFor="eu-only" className="text-xs cursor-pointer">Nur EU</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="fast-delivery" checked={filters.fastDelivery} onCheckedChange={(v) => onChange({ ...filters, fastDelivery: v })} />
            <Label htmlFor="fast-delivery" className="text-xs cursor-pointer">Schnelle Lieferung (≤14 Tage)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="low-risk" checked={filters.lowCapitalRisk} onCheckedChange={(v) => onChange({ ...filters, lowCapitalRisk: v })} />
            <Label htmlFor="low-risk" className="text-xs cursor-pointer">Niedriges Kapitalrisiko</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="moq-500" checked={filters.maxMOQ !== null} onCheckedChange={(v) => onChange({ ...filters, maxMOQ: v ? 500 : null })} />
            <Label htmlFor="moq-500" className="text-xs cursor-pointer">MOQ ≤ 500</Label>
          </div>
        </div>
      )}
    </div>
  );
}

export function SupplierExperienceCard({
  categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget,
  monthlyBurnRate = 2000, cashRunwayMonths = 4,
}: SupplierExperienceCardProps) {
  const { plan } = useSubscription();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { activeBrand } = useBrand();
  const isDE = i18n.language === "de";
  const isExecution = plan === "execution";
  const access = getFeatureAccess("supplierMatching", plan);
  const hasInput = categoryId.length > 0 && budget > 0 && launchQuantity > 0;

  const [filters, setFilters] = useState<SupplierFilter>(DEFAULT_FILTERS);

  const input: SupplierMatchInput = { categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget };

  const result = useMemo(() => hasInput ? matchSuppliers(input) : null, [categoryId, budget, targetRegion, launchQuantity, priceSegment, addonBudget, hasInput]);

  // Smart recommendation profile
  const userProfile = useMemo(() => ({
    budget, riskTolerance: "medium" as const, archetype: "balanced" as const,
    categoryId, priceSegment,
  }), [budget, categoryId, priceSegment]);

  // Apply filters and smart sorting
  const filteredProd = useMemo(() => {
    if (!result) return [];
    const suppliers = result.productionSuppliers.map((r) => r.supplier);
    const filtered = applyFilters(suppliers, filters);
    return filtered
      .map((s) => ({ supplier: s, score: computeSmartScore(s, userProfile) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [result, filters, userProfile]);

  const filteredPack = useMemo(() => {
    if (!result) return [];
    const suppliers = result.packagingSuppliers.map((r) => r.supplier);
    const filtered = applyFilters(suppliers, filters);
    return filtered
      .map((s) => ({ supplier: s, score: computeSmartScore(s, userProfile) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [result, filters, userProfile]);

  const filteredAddons = useMemo(() => {
    if (!result) return [];
    const suppliers = result.addonSuppliers.map((r) => r.supplier);
    const filtered = applyFilters(suppliers, filters);
    return filtered
      .map((s) => ({ supplier: s, score: computeSmartScore(s, userProfile) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [result, filters, userProfile]);

  // Click tracking (silent)
  const trackClick = useCallback(async (supplier: AnyIntelligentSupplier) => {
    if (!user) return;
    try {
      await supabase.from("supplier_clicks").insert({
        user_id: user.id,
        supplier_id: supplier.partnerId,
        supplier_name: supplier.name,
        brand_id: activeBrand?.id ?? null,
        category: categoryId,
        affiliate: supplier.affiliateAvailable,
      });
    } catch {
      // Silent fail — non-critical
    }
  }, [user, activeBrand, categoryId]);

  // 5-Layer Risk Intelligence
  const topSupplier = filteredProd[0]?.supplier;
  const riskResult = useMemo(() => {
    if (!hasInput || !topSupplier) return null;
    const firstProdCost = topSupplier.estimatedMOQ * topSupplier.estimatedUnitCostRange[0];
    const riskInput: SupplierRiskInput = {
      totalCapital: budget, firstProductionCost: firstProdCost, supplierRegion: targetRegion,
      moq: topSupplier.estimatedMOQ, unitCost: topSupplier.estimatedUnitCostRange[0],
      leadTimeDays: topSupplier.leadTimeDays, singleSupplier: filteredProd.length <= 1,
      monthlyBurnRate, cashRunwayMonths,
    };
    return computeSupplierRisk(riskInput);
  }, [hasInput, topSupplier, budget, targetRegion, filteredProd.length, monthlyBurnRate, cashRunwayMonths]);

  const card = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Factory className="h-5 w-5 text-accent" />
          Supplier Intelligence
          <Badge variant="secondary" className="text-[10px] ml-auto">PRO</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasInput && result ? (
          <div className="space-y-6">
            {/* Filter Bar */}
            <FilterBar filters={filters} onChange={setFilters} />

            {/* Region Recommendation */}
            <div className="rounded-lg border bg-accent/5 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-accent" />{isDE ? "Empfohlene Region" : "Recommended Region"}: {result.recommendedRegion}</div>
              <p className="text-xs text-muted-foreground">{result.reasoning}</p>
            </div>

            {/* 5-LAYER RISK INTELLIGENCE */}
            {riskResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    Risk Intelligence
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
            {filteredProd.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Factory className="h-4 w-4" />Top {filteredProd.length} {isDE ? "Produktionspartner" : "Production Partners"}</div>
                {filteredProd.map((r) => (
                  <SupplierRow
                    key={r.supplier.partnerId}
                    supplier={r.supplier}
                    budget={budget}
                    cashRunwayMonths={cashRunwayMonths}
                    fitLabel={getFitLabel(r.supplier, userProfile)}
                    onClickTrack={trackClick}
                  />
                ))}
              </div>
            )}

            {/* Packaging Partners */}
            {filteredPack.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Package className="h-4 w-4" />Top {filteredPack.length} {isDE ? "Verpackungspartner" : "Packaging Partners"}</div>
                {filteredPack.map((r) => (
                  <SupplierRow
                    key={r.supplier.partnerId}
                    supplier={r.supplier}
                    budget={budget}
                    cashRunwayMonths={cashRunwayMonths}
                    fitLabel={getFitLabel(r.supplier, userProfile)}
                    onClickTrack={trackClick}
                  />
                ))}
              </div>
            )}

            {/* Add-ons */}
            {filteredAddons.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Gift className="h-4 w-4" />Unboxing Add-ons</div>
                {filteredAddons.map((r) => (
                  <SupplierRow
                    key={r.supplier.partnerId}
                    supplier={r.supplier}
                    budget={budget}
                    cashRunwayMonths={cashRunwayMonths}
                    fitLabel={getFitLabel(r.supplier, userProfile)}
                    onClickTrack={trackClick}
                  />
                ))}
              </div>
            )}

            {/* No results after filter */}
            {filteredProd.length === 0 && filteredPack.length === 0 && filteredAddons.length === 0 && (
              <div className="rounded-lg border p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Keine Lieferanten mit diesen Filtern gefunden.</p>
                <Button variant="outline" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>Filter zurücksetzen</Button>
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
