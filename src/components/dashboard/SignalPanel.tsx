import { cn } from "@/lib/utils";
import { type AssetSignal, SIGNAL_CONFIG } from "@/lib/signal-engine";
import { ArrowUpCircle, ArrowDownCircle, MinusCircle, Target } from "lucide-react";

interface Props {
  signals: AssetSignal[];
  title?: string;
}

const SIGNAL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  strong_buy: ArrowUpCircle,
  buy: ArrowUpCircle,
  hold: MinusCircle,
  sell: ArrowDownCircle,
  strong_sell: ArrowDownCircle,
};

export function SignalPanel({ signals, title = "Signale & Empfehlungen" }: Props) {
  if (signals.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          {title}
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Simulation – keine Anlageberatung</span>
      </div>

      <div className="space-y-3">
        {signals.map((s) => {
          const config = SIGNAL_CONFIG[s.signal];
          const Icon = SIGNAL_ICON[s.signal];
          return (
            <div key={s.assetId} className={cn("rounded-xl p-3 space-y-1.5", config.bg)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="text-sm font-medium">{s.assetName}</span>
                </div>
                <span className={cn("text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border", config.color)}>
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{s.reason}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">→ {s.targetAction}</p>
                <span className="text-[10px] text-muted-foreground">Konfidenz: {s.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
