import { useMemo } from "react";
import { Trophy, Star, Flame, Target, Zap, Award, Crown, Rocket } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useBrand } from "@/hooks/useBrand";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  xp: number;
  condition: (ctx: GamificationContext) => boolean;
}

interface GamificationContext {
  currentStep: number;
  brandName: string;
  hasBrandProfile: boolean;
  hasFinancials: boolean;
  hasLaunchPlan: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_brand", icon: Star, label: "Erster Schritt", description: "Marke erstellt", xp: 50, condition: (ctx) => ctx.brandName.length > 0 },
  { id: "profile_done", icon: Target, label: "Profiliert", description: "Brand-Profil ausgefüllt", xp: 100, condition: (ctx) => ctx.hasBrandProfile },
  { id: "step_2", icon: Zap, label: "Kalkuliert", description: "Phase 2 erreicht", xp: 150, condition: (ctx) => ctx.currentStep >= 2 },
  { id: "step_3", icon: Award, label: "Produzent", description: "Phase 3 erreicht", xp: 200, condition: (ctx) => ctx.currentStep >= 3 },
  { id: "financials", icon: Flame, label: "Finanz-Profi", description: "Finanzmodell erstellt", xp: 150, condition: (ctx) => ctx.hasFinancials },
  { id: "step_4", icon: Crown, label: "Compliant", description: "Phase 4 erreicht", xp: 250, condition: (ctx) => ctx.currentStep >= 4 },
  { id: "launch_ready", icon: Rocket, label: "Launch-Ready", description: "Phase 5 erreicht", xp: 500, condition: (ctx) => ctx.currentStep >= 5 },
  { id: "launch_plan", icon: Trophy, label: "Stratege", description: "Launch-Plan erstellt", xp: 200, condition: (ctx) => ctx.hasLaunchPlan },
];

const LEVELS = [
  { name: "Starter", minXp: 0, color: "text-muted-foreground" },
  { name: "Explorer", minXp: 100, color: "text-info" },
  { name: "Builder", minXp: 300, color: "text-accent" },
  { name: "Founder", minXp: 600, color: "text-warning" },
  { name: "Leader", minXp: 1000, color: "text-primary" },
  { name: "Legend", minXp: 1500, color: "text-destructive" },
];

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return { ...LEVELS[i], index: i };
  }
  return { ...LEVELS[0], index: 0 };
}

export function GamificationWidget({
  currentStep = 1,
  hasBrandProfile = false,
  hasFinancials = false,
  hasLaunchPlan = false,
}: {
  currentStep?: number;
  hasBrandProfile?: boolean;
  hasFinancials?: boolean;
  hasLaunchPlan?: boolean;
}) {
  const { activeBrand } = useBrand();

  const ctx: GamificationContext = {
    currentStep,
    brandName: activeBrand?.name ?? "",
    hasBrandProfile,
    hasFinancials,
    hasLaunchPlan,
  };

  const { unlocked, totalXp, level, nextLevel, progressToNext } = useMemo(() => {
    const unlocked = ACHIEVEMENTS.filter((a) => a.condition(ctx));
    const totalXp = unlocked.reduce((sum, a) => sum + a.xp, 0);
    const level = getLevel(totalXp);
    const nextIdx = Math.min(level.index + 1, LEVELS.length - 1);
    const nextLevel = LEVELS[nextIdx];
    const range = nextLevel.minXp - level.minXp;
    const progress = range > 0 ? Math.min(100, ((totalXp - level.minXp) / range) * 100) : 100;
    return { unlocked, totalXp, level, nextLevel, progressToNext: progress };
  }, [ctx]);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" />
          <h3 className="text-xs font-semibold font-mono">LEVEL & ACHIEVEMENTS</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px] font-bold font-mono", level.color)}>
          {level.name}
        </Badge>
      </div>

      {/* XP Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>{totalXp} XP</span>
          <span>{nextLevel.name} ({nextLevel.minXp} XP)</span>
        </div>
        <Progress value={progressToNext} className="h-1.5" />
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-4 gap-2">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlocked.some((u) => u.id === achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-all",
                isUnlocked
                  ? "bg-accent/10 text-accent"
                  : "bg-muted/30 text-muted-foreground/40"
              )}
              title={`${achievement.label}: ${achievement.description} (+${achievement.xp} XP)`}
            >
              <achievement.icon className={cn("h-4 w-4", isUnlocked && "animate-scale-in")} />
              <span className="text-[9px] font-medium leading-tight">{achievement.label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        {unlocked.length}/{ACHIEVEMENTS.length} freigeschaltet
      </p>
    </div>
  );
}
