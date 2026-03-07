import { isBetaMode } from "@/lib/beta-client";

export function BetaBadge() {
  if (!isBetaMode()) return null;

  return (
    <div className="pointer-events-none fixed top-3 right-3 z-40 flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
      Beta
    </div>
  );
}
