import { cn } from "@/lib/utils";
import { Star, Zap, Rocket, Crown, Award } from "lucide-react";

const LEVELS = {
  starter: { label: "Starter", icon: Star, color: "text-muted-foreground bg-muted" },
  builder: { label: "Builder", icon: Zap, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950" },
  operator: { label: "Operator", icon: Rocket, color: "text-accent bg-accent/10" },
  strategist: { label: "Strategist", icon: Crown, color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950" },
  legend: { label: "Legend", icon: Award, color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950" },
} as const;

export function FounderLevelBadge({ level, className }: { level: string; className?: string }) {
  const config = LEVELS[level as keyof typeof LEVELS] || LEVELS.starter;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", config.color, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
