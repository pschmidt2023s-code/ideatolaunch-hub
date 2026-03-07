import { DollarSign, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface WorkingCapitalData {
  required: number;
  available: number;
  cashConversionDays: number;
  stockoutRiskDays: number;
  reorderPoint: number;
}

export function WorkingCapitalEngine() {
  const { user } = useAuth();
  const { brand } = useBrand();

  const { data: financialModel } = useQuery({
    queryKey: ["financial-model", brand?.id],
    enabled: !!brand?.id && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_models")
        .select("*")
        .eq("brand_id", brand!.id)
        .maybeSingle();
      return data;
    },
  });

  // Calculate working capital from real financial model data
  const hasData = !!financialModel;
  const productionCost = financialModel?.production_cost ?? 0;
  const packagingCost = financialModel?.packaging_cost ?? 0;
  const shippingCost = financialModel?.shipping_cost ?? 0;
  const required = Math.round((productionCost + packagingCost + shippingCost) * 10); // rough estimate
  const available = 0; // user would input this
  const gap = required - available;
  const isDeficit = gap > 0 && hasData;

  if (!hasData) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <DollarSign className="h-4 w-4 text-accent" />
          Working Capital Engine
        </h3>
        <div className="text-center py-8">
          <DollarSign className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Keine Finanzdaten vorhanden.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Vervollständige dein Finanzmodell im Business Calculator, um dein Working Capital zu berechnen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
        <DollarSign className="h-4 w-4 text-accent" />
        Working Capital Engine
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Geschätzter Bedarf</p>
          <p className="text-2xl font-bold tabular-nums">{required.toLocaleString("de-DE")} €</p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Produktionskosten</p>
          <p className="text-2xl font-bold tabular-nums">
            {productionCost.toLocaleString("de-DE")} €
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Verpackung
          </p>
          <p className="text-2xl font-bold tabular-nums">{packagingCost.toLocaleString("de-DE")} €</p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Versand
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {shippingCost.toLocaleString("de-DE")} €
          </p>
        </div>
      </div>

      {isDeficit && (
        <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          ⚠️ Working Capital Bedarf: {required.toLocaleString("de-DE")} € — Finanzierungsbedarf prüfen
        </div>
      )}
    </div>
  );
}
