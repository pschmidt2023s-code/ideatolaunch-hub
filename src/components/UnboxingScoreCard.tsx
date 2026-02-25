import { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Gift, Lightbulb, Zap, ChevronRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { getFeatureAccess } from "@/lib/feature-flags";
import { computeUnboxingScore, type UnboxingInput } from "@/lib/unboxing-score-engine";
import { trackEvent } from "@/lib/analytics";

interface UnboxingScoreCardProps {
  input: UnboxingInput;
}

const LEVEL_CONFIG = {
  basic:   { label: "Basic",   color: "text-destructive",          badgeVariant: "destructive" as const },
  good:    { label: "Good",    color: "text-yellow-600 dark:text-yellow-400", badgeVariant: "secondary" as const },
  premium: { label: "Premium", color: "text-green-600 dark:text-green-400",   badgeVariant: "default" as const },
};

const IMPACT_BADGE = {
  low:    { label: "Gering", className: "bg-muted text-muted-foreground" },
  medium: { label: "Mittel", className: "bg-accent/20 text-accent-foreground" },
  high:   { label: "Hoch",   className: "bg-primary/20 text-primary" },
};

function ScoreContent({ input }: { input: UnboxingInput }) {
  const result = useMemo(() => computeUnboxingScore(input), [input]);
  const cfg = LEVEL_CONFIG[result.level];

  useEffect(() => {
    trackEvent("unboxing_score_viewed", { score: result.score, level: result.level });
  }, [result.score, result.level]);

  return (
    <div className="space-y-5">
      {/* Score Display */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${cfg.color}`}>{result.score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
        </div>
        <Progress value={result.score} className="h-2" />
      </div>

      {/* Top Strength */}
      {result.strengths.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border bg-accent/5 p-3">
          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-xs font-medium">Top-Stärke</p>
            <p className="text-xs text-muted-foreground">{result.strengths[0]}</p>
          </div>
        </div>
      )}

      {/* Biggest Gap */}
      {result.gaps.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
          <div>
            <p className="text-xs font-medium text-destructive">Größte Lücke</p>
            <p className="text-xs text-muted-foreground">{result.gaps[0]}</p>
          </div>
        </div>
      )}

      {/* Quick Wins */}
      {result.quickWins.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4" />
            Quick Wins
          </div>
          {result.quickWins.map((qw, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
              onClick={() => trackEvent("unboxing_quickwin_clicked", { title: qw.title })}
            >
              <Lightbulb className="h-4 w-4 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{qw.title}</p>
                <p className="text-[11px] text-muted-foreground">{qw.costHint}</p>
              </div>
              <Badge className={`text-[10px] shrink-0 ${IMPACT_BADGE[qw.impact].className}`}>
                {IMPACT_BADGE[qw.impact].label}
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Recommended Kit */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Gift className="h-4 w-4" />
          Empfohlenes Unboxing-Kit
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
          {result.recommendedKit.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Notes */}
      {result.riskNotes.length > 0 && (
        <div className="space-y-2">
          {result.riskNotes.map((note, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UnboxingScoreCard({ input }: UnboxingScoreCardProps) {
  const { plan } = useSubscription();
  const access = getFeatureAccess("unboxingScore", plan);

  const card = (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="h-5 w-5 text-accent" />
          Unboxing Score
          <Badge variant="secondary" className="text-[10px] ml-auto">PRO</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScoreContent input={input} />
      </CardContent>
    </Card>
  );

  if (access !== "enabled") {
    return (
      <LockedOverlay feature="unboxingScore">
        {card}
      </LockedOverlay>
    );
  }

  return card;
}
