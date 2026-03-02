import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function HeroSection() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-24 md:pt-44 md:pb-36" aria-label="Hero">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.06),transparent_70%)]" />
      <div className="container relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-card">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          {isDE
            ? "Ø 5.000 € Verlust durch vermeidbare Produktionsfehler"
            : "Avg. €5,000 lost to avoidable production mistakes"}
        </div>

        {/* Headline – outcome focused */}
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-[1.1]">
          {isDE ? (
            <>
              Vermeide <span className="text-gradient">5.000 € Produktionsfehler</span> – starte deine Eigenmarke datenbasiert.
            </>
          ) : (
            <>
              Avoid <span className="text-gradient">€5,000 production mistakes</span> – launch your brand with data.
            </>
          )}
        </h1>

        {/* Subheadline – concise */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
          {isDE
            ? "Risiken erkennen, Kosten kalkulieren, strukturiert launchen. Das Founder Operating System für produktbasierte Unternehmer."
            : "Detect risks, calculate costs, launch with structure. The Founder Operating System for product-based entrepreneurs."}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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

        {/* Social proof micro-bar */}
        <p className="mt-8 text-sm text-muted-foreground">
          {isDE
            ? "Bereits 2.400+ Gründer nutzen BuildYourBrand · Ø €3.200 gespart"
            : "2,400+ founders use BuildYourBrand · Avg. €3,200 saved"}
        </p>
      </div>
    </section>
  );
}
