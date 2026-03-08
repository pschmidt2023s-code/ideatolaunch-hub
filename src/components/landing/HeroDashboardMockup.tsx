import { useEffect, useState } from "react";

/**
 * Animated mini-dashboard mockup that floats below the hero CTA.
 * Pure CSS + lightweight state – no heavy libs.
 */
export function HeroDashboardMockup() {
  const [riskScore, setRiskScore] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setRiskScore(73), 600);
    const t2 = setTimeout(() => setConfidence(86), 900);
    const t3 = setTimeout(() => setPhase(3), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="mx-auto mt-16 max-w-2xl animate-fade-in-up gpu-accelerated" style={{ animationDelay: "800ms" }}>
      <div className="relative rounded-2xl border bg-card/80 backdrop-blur-md shadow-xl overflow-hidden gpu-accelerated">
        {/* Glow effect */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center gap-2 border-b px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="rounded-md bg-muted px-3 py-0.5 text-[10px] text-muted-foreground font-mono">
              dashboard / command-center
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 grid grid-cols-3 gap-3">
          {/* Risk Score */}
          <div className="rounded-xl border bg-background/60 p-3 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Risk Index</p>
            <p className="text-2xl font-bold font-display tabular-nums text-success transition-all duration-1000">
              {riskScore}
            </p>
            <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-1000 ease-out"
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div className="rounded-xl border bg-background/60 p-3 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
            <p className="text-2xl font-bold font-display tabular-nums text-primary transition-all duration-1000">
              {confidence}%
            </p>
            <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          {/* Phase */}
          <div className="rounded-xl border bg-background/60 p-3 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Phase</p>
            <p className="text-2xl font-bold font-display tabular-nums text-accent transition-all duration-1000">
              {phase}/5
            </p>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= phase ? "bg-accent" : "bg-muted"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mini chart area */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="rounded-xl border bg-background/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-muted-foreground">Kapitalverlauf (6 Monate)</span>
              <span className="text-[10px] font-medium text-success">+18.4%</span>
            </div>
            <svg viewBox="0 0 300 60" className="w-full h-12" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,45 Q30,42 60,38 T120,30 T180,25 T240,18 T300,10"
                fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="2"
                className="animate-draw-line"
              />
              <path
                d="M0,45 Q30,42 60,38 T120,30 T180,25 T240,18 T300,10 L300,60 L0,60 Z"
                fill="url(#chartGrad)"
                className="animate-fade-in"
                style={{ animationDelay: "1.2s" }}
              />
            </svg>
          </div>
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-2 -right-2 sm:bottom-3 sm:right-3 rounded-lg border bg-card shadow-lg px-3 py-1.5 text-[10px] font-medium animate-slide-up-fade" style={{ animationDelay: "1.5s" }}>
          <span className="text-success">✓</span> 3 Risiken erkannt & gelöst
        </div>
      </div>
    </div>
  );
}
