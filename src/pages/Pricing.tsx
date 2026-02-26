import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PricingSection } from "@/components/landing/PricingSection";
import { trackEvent } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

const pricingFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was kostet BuildYourBrand?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BuildYourBrand bietet drei Pläne: Free (0 €/dauerhaft), Builder (29 €/Monat) und Pro (79 €/Monat). Alle Pläne sind jederzeit kündbar."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich BuildYourBrand kostenlos testen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, der Free-Plan ist dauerhaft kostenlos und umfasst 1 Marke, einen Wirtschaftlichkeits-Check und Launch-Checklisten. Kein Kreditkarte nötig."
      }
    },
    {
      "@type": "Question",
      "name": "Was ist im Builder-Plan enthalten?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Der Builder-Plan (29 €/Monat) enthält realistische Gewinnprognosen, KI-Risikoanalyse, Budget-Kontrolle, PDF-Exporte und eine 30-Tage Launch-Struktur."
      }
    },
    {
      "@type": "Question",
      "name": "Wann lohnt sich der Pro-Plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Der Pro-Plan (79 €/Monat) lohnt sich, wenn du vor der ersten Bestellung Produktionsfehler vermeiden, Szenarien simulieren und datenbasierte Lieferanten-Matches erhalten willst."
      }
    }
  ]
};

export default function Pricing() {
  useEffect(() => { trackEvent("pricing_viewed"); }, []);
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Preise & Pläne – BuildYourBrand"
        description="Kostenlos starten oder mit Builder (29 €) & Pro (79 €) schneller launchen. Transparent, fair, jederzeit kündbar."
        path="/pricing"
        jsonLd={pricingFaqJsonLd}
      />
      <Navbar />
      <main className="pt-16">
        <PricingSection />
        <section className="border-t px-4 py-12">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-sm text-muted-foreground">
              Noch unsicher? Lies unseren{" "}
              <Link to="/blog" className="text-accent underline underline-offset-4 hover:text-accent/80">
                Blog
              </Link>{" "}
              für Tipps zum Markenaufbau oder starte kostenlos mit dem{" "}
              <Link to="/auth?tab=signup" className="text-accent underline underline-offset-4 hover:text-accent/80">
                Free-Plan
              </Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
