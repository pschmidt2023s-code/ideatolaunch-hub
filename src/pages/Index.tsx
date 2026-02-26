import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was ist BuildYourBrand?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BuildYourBrand ist eine SaaS-Plattform, die dir hilft, deine eigene Marke Schritt für Schritt aufzubauen – von der Idee über Kalkulation bis zum Launch."
      }
    },
    {
      "@type": "Question",
      "name": "Für wen ist BuildYourBrand geeignet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Für Gründer, E-Commerce-Starter und alle, die eine eigene Marke strukturiert planen und starten möchten – egal ob Anfänger oder erfahren."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich BuildYourBrand kostenlos nutzen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, es gibt einen kostenlosen Plan mit Basisfunktionen. Für erweiterte Features wie KI-Analysen und PDF-Exporte stehen kostenpflichtige Pläne zur Verfügung."
      }
    }
  ]
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="BuildYourBrand – Deine Marke systematisch aufbauen"
        description="Baue deine eigene Marke Schritt für Schritt auf: von der Idee über Kalkulation und Produktion bis zum Launch. Strukturiert, datengetrieben, made in Germany."
        path="/"
        jsonLd={faqJsonLd}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
