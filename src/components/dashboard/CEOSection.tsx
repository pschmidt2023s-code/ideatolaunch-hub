import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * CEO-grade dark wrapper for premium dashboard sections.
 * Forces dark palette via CSS variables scoped to this container.
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
        "ceo-section rounded-2xl p-6 sm:p-8 space-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}
