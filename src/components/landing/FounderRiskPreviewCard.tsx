import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface FounderRiskPreviewCardProps {
  score?: number;
  runwayMonths?: number;
  openBlockers?: number;
}

export function FounderRiskPreviewCard({
  score = 48,
  runwayMonths = 9,
  openBlockers = 3,
}: FounderRiskPreviewCardProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const [animatedScore, setAnimatedScore] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
      setBarWidth(score);
    }, 200);
    return () => clearTimeout(timeout);
  }, [score]);

  // Animate number counting up
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (animatedScore === 0) return;
    let current = 0;
    const step = Math.max(1, Math.floor(animatedScore / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= animatedScore) {
        current = animatedScore;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [animatedScore]);

  const riskColor =
    score >= 70
      ? "hsl(var(--success))"
      : score >= 40
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";

  const riskLabel =
    score >= 70
      ? isDE ? "Niedriges Risiko" : "Low risk"
      : score >= 40
        ? isDE ? "Mittleres Risiko" : "Medium risk"
        : isDE ? "Hohes Risiko" : "High risk";

  return (
    <section className="px-4 pb-24 md:pb-32" aria-label="Founder Risk Index Preview">
      <div className="mx-auto max-w-md">
        {/* Card */}
        <div className="group relative rounded-2xl border bg-card/90 backdrop-blur-sm p-8 md:p-10 shadow-card hover:shadow-lg transition-all duration-500">
          {/* Live Preview Badge */}
          <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live Preview
          </span>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Shield className="h-4 w-4 text-accent" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Founder Risk Index™
            </span>
          </div>

          {/* Score */}
          <div className="flex items-baseline gap-3 mb-6">
            <span
              className="text-6xl md:text-7xl font-bold tabular-nums tracking-tight transition-colors duration-500"
              style={{ color: riskColor }}
            >
              {displayScore}
            </span>
            <span className="text-xl text-muted-foreground font-medium">/ 100</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-6">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${barWidth}%`,
                backgroundColor: riskColor,
              }}
            />
          </div>

          {/* Stats */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {riskLabel} · {runwayMonths} {isDE ? "Monate Runway" : "months runway"} · {openBlockers} {isDE ? "offene Blocker" : "open blockers"}
          </p>

          {/* Emotional line */}
          <p className="mt-6 text-sm text-foreground/70 italic leading-relaxed">
            {isDE
              ? "Die meisten Gründer kennen ihr tatsächliches Kapitalrisiko nicht."
              : "Most founders don't know their actual capital risk."}
          </p>
        </div>

        {/* CTA below card */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md px-8 text-base"
            onClick={() => navigate("/auth?tab=signup")}
          >
            {isDE ? "Mein Risiko prüfen" : "Check my risk"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
