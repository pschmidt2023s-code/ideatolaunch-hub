import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Terminal-style premium section wrapper for key metrics.
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
        "rounded-lg border border-border bg-muted/20 p-4 space-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}
