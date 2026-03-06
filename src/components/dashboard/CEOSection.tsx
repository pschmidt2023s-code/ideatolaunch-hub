import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Premium section wrapper – subtle dark container for key metrics.
 * Clean, minimal – Linear/Stripe aesthetic.
 */
export function CEOSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/30 p-5 sm:p-6 space-y-5",
        className
      )}
    >
      {children}
    </div>
  );
}
