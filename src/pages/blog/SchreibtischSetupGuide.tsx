import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Schreibtisch Setup Guide – So baust du dir einen High-Performance Workspace",
  author: { "@type": "Organization", name: "BuildYourBrand" },
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
  publisher: { "@type": "Organization", name: "BuildYourBrand" },
  description: "Der komplette Guide für ein professionelles Schreibtisch-Setup."
};

export default function SchreibtischSetupGuide() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Schreibtisch Setup Guide – High-Performance Workspace"
        description="Der komplette Schreibtisch Setup Guide 2026: Monitor, Tastatur, Desk Mat, Ergonomie. Baue dir einen Workspace, der Produktivität maximiert."
        path="/blog/schreibtisch-setup-guide"
        jsonLd={articleJsonLd}
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <article className="container mx-auto max-w-3xl prose-neutral">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Zurück zum Blog
          </Link>

          <time className="text-xs text-muted-foreground block mb-2">15. Februar 2026</time>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl leading-tight mb-6">
            Schreibtisch Setup Guide – So baust du dir einen High-Performance Workspace
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Dein Schreibtisch ist dein wichtigstes Werkzeug. Nicht dein Laptop, nicht deine Software –
            dein physischer Arbeitsplatz bestimmt, wie gut du arbeitest. In diesem Guide zeigen wir dir
            Schritt für Schritt, wie du einen Workspace aufbaust, der Fokus, Ergonomie und Ästhetik vereint.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Die Basis: Der richtige Schreibtisch</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Ein höhenverstellbarer Schreibtisch ist 2026 Standard – nicht Luxus. Die Möglichkeit,
            zwischen Sitzen und Stehen zu wechseln, reduziert Rückenschmerzen um bis zu 54 % (Stanford
            Back Pain Study). Mindestgröße: 140x70 cm für ein Single-Monitor-Setup, 160x80 cm für Dual-Screen.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Materialempfehlung: Bambusplatte oder MDF mit Echtholz-Furnier. Beide sind robust, nachhaltig
            und sehen gut aus. Vermeide Glas – es spiegelt, ist kalt und zeigt jeden Fingerabdruck.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Monitor: Dein Fenster zur Arbeit</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Empfehlung: Ein 27-Zoll-Monitor mit 4K-Auflösung und IPS-Panel. Die Oberkante des Monitors
            sollte auf Augenhöhe sein – verwende einen Monitorarm statt des mitgelieferten Standfußes.
            Das spart Platz und ermöglicht stufenlose Höhenverstellung.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Für kreative Arbeit oder Entwicklung: Dual-Screen-Setup mit identischen Monitoren.
            Verschiedene Modelle nebeneinander wirken unruhig und stören den visuellen Flow.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Tastatur & Maus</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Eine mechanische Tastatur mit linearen Switches (z. B. Cherry MX Red) bietet das beste
            Tippgefühl ohne störende Klickgeräusche. Kompakte 65 %-Layouts sparen Platz und bringen
            die Maus näher an die Körpermitte – ergonomisch vorteilhaft.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Bei der Maus: Ergonomische Formen reduzieren die Belastung des Handgelenks. Kabellos ist
            Standard, achte auf Akkulaufzeit (mindestens 60 Stunden) und einen USB-C-Ladeanschluss.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Die Arbeitsfläche: Desk Mat als Fundament</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Eine{" "}
            <Link to="/product" className="text-accent underline underline-offset-4 hover:text-accent/80">
              hochwertige Schreibtischunterlage
            </Link>{" "}
            ist das Fundament deines Setups. Sie definiert deine Arbeitszone, schützt die Tischoberfläche
            und bietet eine optimale Gleitfläche für die Maus. Die ideale Größe für die meisten Setups
            ist 90x45 cm – groß genug für Tastatur und Maus, ohne den Tisch zu dominieren.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Achte auf Premium-Materialien: PU-Leder mit Naturkautschuk-Unterseite statt billiges Filz,
            das sich nach wenigen Wochen auflöst. Mehr Details zur Materialwahl findest du auf unserer{" "}
            <Link to="/product" className="text-accent underline underline-offset-4 hover:text-accent/80">
              Produktseite
            </Link>.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Ergonomie: Der unsichtbare Game-Changer</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Die perfekte Sitzhöhe: Deine Unterarme sollten beim Tippen parallel zum Boden sein.
            Die Füße stehen flach auf dem Boden. Der Monitor ist eine Armlänge entfernt, die Oberkante
            auf Augenhöhe. Diese drei Regeln eliminieren 80 % der typischen Bürobeschwerden.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 my-6">
            {[
              "Unterarme parallel zum Boden",
              "Füße flach auf dem Boden",
              "Monitor auf Augenhöhe",
              "Armlänge Abstand zum Screen",
              "90° Winkel in den Knien",
              "Schultern entspannt, nicht hochgezogen"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Check className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">Kabelmanagement & Ordnung</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Ein professionelles Setup sieht aus wie ein Produktfoto – nicht wie ein Serverraum.
            Verwende einen Kabelkorb unter dem Tisch, Klettbänder für Bündelung und eine Tischdurchführung
            für das Ladekabel. Ziel: Von vorne keine Kabel sichtbar. Lies auch unseren{" "}
            <Link to="/blog/minimalistischer-arbeitsplatz" className="text-accent underline underline-offset-4 hover:text-accent/80">
              Guide zum minimalistischen Arbeitsplatz
            </Link>{" "}
            für weitere Tipps.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Beleuchtung</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Drei Lichtquellen bilden die ideale Schreibtischbeleuchtung: Tageslicht von der Seite,
            eine Schreibtischlampe mit 5000K (neutralweiß) und eine indirekte Hintergrundbeleuchtung
            hinter dem Monitor. Dieses Setup reduziert Augenbelastung und schafft Tiefe.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Die Checkliste: High-Performance Workspace</h2>
          <div className="space-y-2 mb-8">
            {[
              "Höhenverstellbarer Schreibtisch (140x70 cm+)",
              "27\" 4K Monitor mit Monitorarm",
              "Mechanische 65% Tastatur",
              "Ergonomische kabellose Maus",
              "Premium Desk Mat 90x45 cm",
              "Ergonomischer Bürostuhl",
              "Kabelmanagement-System",
              "Tageslichtlampe 5000K",
              "Noise-Cancelling Kopfhörer"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-accent shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">Fazit</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Ein High-Performance Workspace ist eine Investition in dich selbst. Jedes Element – vom
            Schreibtisch über den Monitor bis zur Desk Mat – beeinflusst deine tägliche Arbeit.
            Starte mit den Basics (Schreibtisch, Monitor, Desk Mat), dann optimiere Schritt für Schritt.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Steigere deine{" "}
            <Link to="/blog/produktivitaet-home-office" className="text-accent underline underline-offset-4 hover:text-accent/80">
              Home-Office-Produktivität
            </Link>{" "}
            mit dem richtigen Environment Design. Und wenn du bereit bist, dein eigenes Workspace-Produkt
            zu launchen:{" "}
            <Link to="/" className="text-accent underline underline-offset-4 hover:text-accent/80">
              BuildYourBrand
            </Link>{" "}
            begleitet dich von der Idee bis zum fertigen Produkt.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
