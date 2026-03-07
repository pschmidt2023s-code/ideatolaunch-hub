import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "compact" | "card";
}

/**
 * Consistent empty-state placeholder for dashboard sections.
 */
export function EmptyState({ icon, title, description, action, className, variant = "default" }: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4 rounded-xl border border-dashed bg-card/50 p-5 animate-fade-in", className)}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 text-center animate-fade-in",
        variant === "card" ? "p-6" : "p-10",
        className
      )}
    >
      <div className={cn(
        "mb-4 flex items-center justify-center rounded-2xl bg-muted",
        variant === "card" ? "h-10 w-10" : "h-14 w-14"
      )}>
        {icon}
      </div>
      <h3 className={cn("font-semibold", variant === "card" ? "text-sm" : "text-base")}>{title}</h3>
      <p className={cn("mt-1.5 max-w-xs text-muted-foreground leading-relaxed", variant === "card" ? "text-xs" : "text-sm")}>
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

/**
 * Consistent error state for dashboard sections.
 */
export function ErrorState({ title = "Fehler aufgetreten", description = "Daten konnten nicht geladen werden. Bitte versuche es erneut.", retry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-fade-in", className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-destructive">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
        >
          Erneut versuchen
        </button>
      )}
    </div>
  );
}
