import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page skeleton for dashboard loading states.
 */
export function SkeletonDashboard() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Progress bar */}
      <Skeleton className="h-28 w-full rounded-2xl" />

      {/* Next step CTA */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>

      {/* Bottom section */}
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

/**
 * Card-level skeleton for individual loading cards.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-card space-y-3 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
