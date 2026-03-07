import React from "react";
import { cn } from "@/lib/utils";

/* ── GlassCard ── */
export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }
>(({ className, glow, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl text-card-foreground transition-all duration-200",
      "dark:bg-[hsl(var(--glass-bg)/0.6)] dark:border-[hsl(var(--glass-border))]",
      "shadow-[var(--shadow-card)]",
      glow && "dark:shadow-[var(--shadow-glow-accent)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
GlassCard.displayName = "GlassCard";

/* ── GlassPanel ── */
export const GlassPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border/40 bg-card/40 backdrop-blur-lg p-4",
      "dark:bg-[hsl(var(--glass-bg)/0.4)] dark:border-[hsl(var(--glass-border))]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
GlassPanel.displayName = "GlassPanel";

/* ── GlassHeader ── */
export function GlassHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl",
        "dark:bg-[hsl(var(--glass-bg)/0.5)] dark:border-[hsl(var(--glass-border))]",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}

/* ── GlassModal ── */
export function GlassModal({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 backdrop-blur-2xl shadow-xl p-6",
        "dark:bg-[hsl(var(--glass-bg)/0.8)] dark:border-[hsl(var(--glass-border))]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── GlassButton ── */
export function GlassButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
        "border border-border/50 bg-card/60 backdrop-blur-md text-foreground",
        "hover:bg-card/80 hover:border-border",
        "dark:bg-[hsl(var(--glass-bg)/0.5)] dark:border-[hsl(var(--glass-border))] dark:hover:bg-[hsl(var(--glass-bg)/0.8)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── GlassSidebar ── */
export function GlassSidebar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground",
        "dark:bg-[hsl(222,24%,8%)] dark:border-[hsl(var(--glass-border))]",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}
