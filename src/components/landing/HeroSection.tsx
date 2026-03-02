import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function HeroSection() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  return (
    <section className="relative overflow-hidden px-4 pt-36 pb-28 md:pt-48 md:pb-40" aria-label="Hero">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.04),transparent_60%)]" />
      <div className="container relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          {isDE
            ? "Ø 5.000 € Verlust durch vermeidbare Fehler"
            : "Avg. €5,000 lost to avoidable mistakes"}
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl leading-[1.08]">
          {isDE ? (
            <>
              Stoppe <span className="text-gradient">Kapitalverluste</span> bevor sie passieren.
            </>
          ) : (
            <>
              Stop <span className="text-gradient">capital losses</span> before they happen.
            </>
          )}
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground md:text-xl leading-relaxed">
          {isDE
            ? "Das Founder Operating System für produktbasierte Unternehmer. Risiken erkennen. Kapital schützen. Strukturiert launchen."
            : "The Founder Operating System for product-based entrepreneurs. Detect risks. Protect capital. Launch with structure."}
        </p>

        {/* Founder Risk Index Visual */}
        <div className="mx-auto mt-12 max-w-sm">
          <div className="rounded-2xl border bg-card/80 backdrop-blur p-6 shadow-card relative">
            {/* Live Preview Badge */}
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live Preview
            </span>

            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Founder Risk Index
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums text-warning">48</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-4 flex items-center">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-warning transition-all duration-1000 ease-out"
                  style={{ width: "48%" }}
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {isDE ? "Mittleres Risiko · 9 Monate Runway · 3 offene Blocker" : "Medium risk · 9 months runway · 3 open blockers"}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md px-8 text-base"
            onClick={() => navigate("/auth?tab=signup")}
          >
            {isDE ? "Kostenlos starten" : "Start free"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 px-8"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            {isDE ? "So funktioniert's" : "How it works"}
          </Button>
        </div>

        {/* Social proof */}
        <p className="mt-10 text-sm text-muted-foreground">
          {isDE
            ? "2.400+ Gründer nutzen BrandOS · Ø €3.200 gespart"
            : "2,400+ founders use BrandOS · Avg. €3,200 saved"}
        </p>
      </div>
    </section>
  );
}
