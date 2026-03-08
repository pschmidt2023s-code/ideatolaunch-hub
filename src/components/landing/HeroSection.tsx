import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function HeroSection() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 pt-40 pb-20 md:pt-52 md:pb-28" aria-label="Hero">
      {/* Multi-layer backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.02),transparent_40%)]" />

      <div className="container relative mx-auto max-w-3xl text-center">
        {/* Badge */}
        <div className="mb-12 inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground shadow-sm animate-fade-in" style={{ animationDelay: "100ms" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          {isDE
            ? "Ø 5.000 € Verlust durch vermeidbare Fehler"
            : "Avg. €5,000 lost to avoidable mistakes"}
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-[18ch] text-5xl font-extrabold tracking-[-0.03em] font-display md:text-6xl lg:text-7xl leading-[1.06] animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {isDE ? (
            <>
              Stoppe{" "}
              <span className="text-gradient">Kapitalverluste</span>
              {" "}bevor sie passieren.
            </>
          ) : (
            <>
              Stop{" "}
              <span className="text-gradient">capital losses</span>
              {" "}before they happen.
            </>
          )}
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-8 max-w-lg text-lg text-muted-foreground md:text-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          {isDE
            ? "Das Founder Operating System für produktbasierte Unternehmer. Risiken erkennen. Kapital schützen. Strukturiert launchen."
            : "The Founder Operating System for product-based entrepreneurs. Detect risks. Protect capital. Launch with structure."}
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <Button
            size="lg"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => navigate("/auth?tab=signup")}
          >
            {isDE ? "Kostenlos starten" : "Start free"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 px-8 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            {isDE ? "So funktioniert's" : "How it works"}
          </Button>
        </div>

        {/* Value props row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "650ms" }}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            <span>{isDE ? "DSGVO-konform" : "GDPR compliant"}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>{isDE ? "Ø €3.200 gespart" : "Avg. €3,200 saved"}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <span>{isDE ? "2.400+ Gründer" : "2,400+ founders"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
