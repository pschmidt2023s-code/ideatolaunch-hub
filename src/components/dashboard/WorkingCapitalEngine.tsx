import { DollarSign, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkingCapitalData {
  required: number;
  available: number;
  cashConversionDays: number;
  stockoutRiskDays: number;
  reorderPoint: number;
}

const MOCK: WorkingCapitalData = {
  required: 14200,
  available: 12000,
  cashConversionDays: 58,
  stockoutRiskDays: 73,
  reorderPoint: 420,
};

export function WorkingCapitalEngine() {
  const gap = MOCK.required - MOCK.available;
  const isDeficit = gap > 0;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
        <DollarSign className="h-4 w-4 text-accent" />
        Working Capital Engine
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Required */}
        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Benötigt</p>
          <p className="text-2xl font-bold tabular-nums">{MOCK.required.toLocaleString("de-DE")} €</p>
        </div>

        {/* Available */}
        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Verfügbar</p>
          <p className={cn("text-2xl font-bold tabular-nums", isDeficit ? "text-destructive" : "text-success")}>
            {MOCK.available.toLocaleString("de-DE")} €
          </p>
        </div>

        {/* Cash Conversion */}
        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Cash Conversion
          </p>
          <p className="text-2xl font-bold tabular-nums">{MOCK.cashConversionDays} Tage</p>
        </div>

        {/* Stockout Risk */}
        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Stockout Risiko
          </p>
          <p className={cn("text-2xl font-bold tabular-nums", MOCK.stockoutRiskDays < 60 ? "text-destructive" : "text-warning")}>
            {MOCK.stockoutRiskDays} Tage
          </p>
        </div>
      </div>

      {isDeficit && (
        <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          ⚠️ Working Capital Gap: {gap.toLocaleString("de-DE")} € — Finanzierungsbedarf prüfen
        </div>
      )}
    </div>
  );
}
