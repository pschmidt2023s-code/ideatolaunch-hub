import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Calculator, ShieldCheck, Truck, Rocket, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const lessons = [
  { icon: BookOpen, title: "Eigenmarke gründen – Der komplette Guide", desc: "Alles, was du wissen musst, um deine erste Marke aufzubauen.", href: "/guide/eigenmarke-gruenden", time: "15 Min" },
  { icon: Calculator, title: "Produktionskosten kalkulieren", desc: "Lerne, wie du realistische Kosten für dein Produkt berechnest.", href: "/guide/produktionskosten-kalkulieren", time: "8 Min" },
  { icon: Truck, title: "Lieferanten finden & verhandeln", desc: "Strategien für die Suche und Bewertung von Produktionspartnern.", href: "/guide/lieferanten-finden", time: "10 Min" },
  { icon: BarChart3, title: "Break-Even verstehen & berechnen", desc: "Ab wann wird deine Marke profitabel? So rechnest du richtig.", href: "/guide/break-even-rechner", time: "6 Min" },
  { icon: ShieldCheck, title: "Produktionsfehler vermeiden", desc: "Die häufigsten Fehler beim ersten Produktionslauf – und wie du sie vermeidest.", href: "/guide/produktionsfehler-vermeiden", time: "7 Min" },
  { icon: Rocket, title: "Launch-Plan erstellen", desc: "Dein 30-Tage Plan für einen erfolgreichen Markenstart.", href: "/guide/launch-plan-erstellen", time: "8 Min" },
];

export default function Academy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Academy – Markenaufbau lernen"
        description="Kostenlose Mini-Tutorials und Guides für deinen Markenaufbau. Lerne Schritt für Schritt, wie du deine Eigenmarke erfolgreich startest."
        path="/academy"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Academy", url: "/academy" }]}
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-4xl">
          <section className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Academy</span>
            <h1 className="text-3xl font-bold mt-3 md:text-5xl">Markenaufbau lernen</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Kostenlose Tutorials und Guides – von der Idee bis zum Launch.
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {lessons.map(({ icon: Icon, title, desc, href, time }) => (
              <Link key={href} to={href} className="group rounded-xl border bg-card p-6 hover:border-accent/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-xs text-muted-foreground">{time}</span>
                </div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-accent transition-colors">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>

          <section className="mb-16 rounded-2xl border bg-card p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-3 text-center">Newsletter: Wöchentliche Founder Insights</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md mx-auto">
              Jeden Mittwoch: eine kurze, actionable Lektion zum Markenaufbau. Kein Spam, jederzeit abmeldbar.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/auth?tab=signup")}>
                Kostenlos anmelden <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>

          <div className="rounded-2xl border bg-card p-8 text-center">
            <h2 className="text-xl font-bold mb-3">Bereit, es umzusetzen?</h2>
            <p className="text-muted-foreground mb-6">Starte kostenlos mit BuildYourBrand und setze dein Gelerntes direkt um.</p>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/auth?tab=signup")}>
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
