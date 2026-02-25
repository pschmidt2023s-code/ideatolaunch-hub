import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock, Package, Factory, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { getFeatureAccess } from "@/lib/feature-flags";
import { matchSuppliers, type SupplierMatchInput } from "@/lib/supplier-matcher";
import type { Supplier } from "@/data/supplier-database";

interface SupplierMatchCardProps {
  productCategory: string;
  budget: number;
  targetRegion: "EU" | "Asia" | "Global";
  launchQuantity: number;
  priceSegment: "low" | "mid" | "premium";
}

function SupplierRow({ supplier }: { supplier: Supplier }) {
  const capitalMin = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[0];
  const capitalMax = supplier.estimatedMOQ * supplier.estimatedUnitCostRange[1];

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm">{supplier.name}</div>
        <Badge variant="outline" className="shrink-0 text-xs">
          <MapPin className="h-3 w-3 mr-1" />
          {supplier.region}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{supplier.bestFor}</p>
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
      <div className="text-xs text-muted-foreground">
        Kapitalbedarf: {capitalMin.toLocaleString("de-DE")} – {capitalMax.toLocaleString("de-DE")} €
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

function MatchContent({ input }: { input: SupplierMatchInput }) {
  const result = useMemo(() => matchSuppliers(input), [input]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-accent/5 p-4 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-accent" />
          Empfohlene Region: {result.recommendedRegion}
        </div>
        <p className="text-xs text-muted-foreground">{result.reasoning}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Factory className="h-4 w-4" />
          Top 3 Produktionspartner
        </div>
        {result.productionSuppliers.map((s) => (
          <SupplierRow key={s.name} supplier={s} />
        ))}
        {result.productionSuppliers.length > 0 && (
          <div className="space-y-1 pl-1">
            <p className="text-xs font-medium text-muted-foreground">Vorlaufzeiten</p>
            {result.productionSuppliers.map((s) => (
              <LeadTimeBar key={s.name} days={s.leadTimeDays} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4" />
          Top 2 Verpackungspartner
        </div>
        {result.packagingSuppliers.map((s) => (
          <SupplierRow key={s.name} supplier={s} />
        ))}
      </div>

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

export function SupplierMatchCard({
  productCategory,
  budget,
  targetRegion,
  launchQuantity,
  priceSegment,
}: SupplierMatchCardProps) {
  const { plan } = useSubscription();
  const access = getFeatureAccess("supplierMatching", plan);

  const hasInput = productCategory.trim().length > 0 && budget > 0 && launchQuantity > 0;

  const input: SupplierMatchInput = {
    productCategory,
    budget,
    targetRegion,
    launchQuantity,
    priceSegment,
  };

  const card = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Factory className="h-5 w-5 text-accent" />
          Supplier Matching
          <Badge variant="secondary" className="text-[10px] ml-auto">PRO</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasInput ? (
          <MatchContent input={input} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Fülle Produktkategorie, Budget und Menge oben aus, um passende Lieferanten zu finden.
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
