import { ArrowRight, Layers, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.06),transparent_70%)]" />
      <div className="container relative mx-auto max-w-5xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-card">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Von der Idee zur fertigen Marke
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Deine Marke.{" "}
          <span className="text-gradient">Strukturiert</span>{" "}
          aufgebaut.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          BuildYourBrand führt dich Schritt für Schritt von der Geschäftsidee zur
          startbereiten Marke — mit strukturierten Workflows, Kalkulationen und
          KI-Unterstützung.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md px-8"
            onClick={() => navigate("/auth")}
          >
            Kostenlos starten
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 px-8"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            Mehr erfahren
          </Button>
        </div>

        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Target, label: "7 Schritte", desc: "Vom Konzept zum Launch" },
            { icon: Layers, label: "Alles strukturiert", desc: "Nie wieder Chaos" },
            { icon: TrendingUp, label: "Datengetrieben", desc: "Kalkulation & Analyse" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 shadow-card animate-fade-in">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <span className="font-semibold">{label}</span>
              <span className="text-sm text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
