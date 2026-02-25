import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock, Package, Factory, Gift, TrendingUp, Info } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { getFeatureAccess } from "@/lib/feature-flags";
import { matchSuppliers, type SupplierMatchInput, type ScoredSupplier } from "@/lib/supplier-matcher";
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
}

type AnySupplier = ProductionSupplier | PackagingSupplier | AddonSupplier;

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
          {supplier.leadTimeDays} Tage
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
    tissue_paper: "Seidenpapier",
    sticker: "Sticker / Labels",
    thank_you_card: "Dankeskarte",
    custom_box: "Custom Box",
    sample_insert: "Beilage / Insert",
    ribbon: "Band / Ribbon",
    sleeve: "Sleeve",
  };
  return <Badge variant="outline" className="text-[10px]">{labels[type] ?? type}</Badge>;
}

function MatchContent({ input }: { input: SupplierMatchInput }) {
  const result = useMemo(() => matchSuppliers(input), [
    input.categoryId, input.budget, input.targetRegion,
    input.launchQuantity, input.priceSegment, input.addonBudget,
  ]);

  return (
    <div className="space-y-6">
      {/* Region Recommendation */}
      <div className="rounded-lg border bg-accent/5 p-4 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-accent" />
          Empfohlene Region: {result.recommendedRegion}
        </div>
        <p className="text-xs text-muted-foreground">{result.reasoning}</p>
      </div>

      {/* Insufficient matches warning */}
      {result.insufficientMatches && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-400">
            <Info className="h-4 w-4" />
            Nicht genügend Matches für diese Kategorie
          </div>
          {result.suggestedCategories.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Ähnliche Kategorien: {result.suggestedCategories.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Production Partners */}
      {result.productionSuppliers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Factory className="h-4 w-4" />
            Top {result.productionSuppliers.length} Produktionspartner
          </div>
          {result.productionSuppliers.map((r) => (
            <SupplierRow key={r.supplier.name} supplier={r.supplier} budget={input.budget} />
          ))}
          <div className="space-y-1 pl-1">
            <p className="text-xs font-medium text-muted-foreground">Vorlaufzeiten</p>
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
            Top {result.packagingSuppliers.length} Verpackungspartner
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
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  MOQ: {r.supplier.estimatedMOQ.toLocaleString("de-DE")}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {r.supplier.estimatedUnitCostRange[0].toFixed(2)}–{r.supplier.estimatedUnitCostRange[1].toFixed(2)} €
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {r.supplier.leadTimeDays} Tage
                </div>
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
            Risikohinweise
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
  categoryId,
  budget,
  targetRegion,
  launchQuantity,
  priceSegment,
  addonBudget,
}: SupplierExperienceCardProps) {
  const { plan } = useSubscription();
  const access = getFeatureAccess("supplierMatching", plan);

  const hasInput = categoryId.length > 0 && budget > 0 && launchQuantity > 0;

  const input: SupplierMatchInput = {
    categoryId,
    budget,
    targetRegion,
    launchQuantity,
    priceSegment,
    addonBudget,
  };

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
        {hasInput ? (
          <MatchContent input={input} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Wähle eine Kategorie und fülle Budget und Menge aus, um passende Lieferanten zu finden.
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (access !== "enabled") {
    return (
      <LockedOverlay feature="supplierMatching">
        {card}
      </LockedOverlay>
    );
  }

  return card;
}
