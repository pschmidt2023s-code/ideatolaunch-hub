import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WhyUsSection } from "@/components/landing/WhyUsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { LeadMagnetPopup, useLeadMagnet } from "@/components/LeadMagnetPopup";

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
        "text": "Ja, der Free-Plan ist dauerhaft kostenlos und umfasst 1 Marke, einen Wirtschaftlichkeits-Check, Launch-Checklisten und eine statische Roadmap."
      }
    },
    {
      "@type": "Question",
      "name": "Was kostet BuildYourBrand?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Es gibt drei Pläne: Free (0 €), Builder (29 €/Monat) mit KI-Analysen und PDF-Exporten, und Pro (79 €/Monat) mit Szenario-Simulationen und Lieferanten-Matching."
      }
    },
    {
      "@type": "Question",
      "name": "Welche Schritte umfasst der Markenaufbau-Prozess?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Der Prozess umfasst 7 Schritte: Idee & Positionierung, Markenidentität, Kalkulation, Produktion, Compliance, Vertrieb und Launch."
      }
    },
    {
      "@type": "Question",
      "name": "Brauche ich Erfahrung, um eine Marke zu gründen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nein. BuildYourBrand ist speziell für Einsteiger konzipiert. Der Guided Founder Mode führt dich Schritt für Schritt durch den gesamten Prozess."
      }
    },
    {
      "@type": "Question",
      "name": "Wie hilft die KI-Analyse beim Markenaufbau?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die KI analysiert dein Geschäftsmodell auf Schwachstellen, berechnet realistische Gewinnprognosen und erstellt datenbasierte Launch-Empfehlungen."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich meine Marke als PDF exportieren?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, ab dem Builder-Plan kannst du einen professionellen Brand Report als PDF exportieren – ideal für Investorengespräche oder interne Planung."
      }
    },
    {
      "@type": "Question",
      "name": "Wie funktioniert das Lieferanten-Matching?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Im Pro-Plan werden basierend auf deiner Produktkategorie, Region und Budget passende Produktions- und Packaging-Lieferanten vorgeschlagen."
      }
    },
    {
      "@type": "Question",
      "name": "Ist BuildYourBrand DSGVO-konform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, BuildYourBrand ist vollständig DSGVO-konform. Daten werden in der EU gehostet, und wir speichern keine Zahlungsdaten auf unserer Plattform."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich mein Abo jederzeit kündigen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, du kannst dein Abo jederzeit im Kundenportal kündigen. Es gibt keine Mindestlaufzeit und keine versteckten Kosten."
      }
    },
    {
      "@type": "Question",
      "name": "Was unterscheidet BuildYourBrand von anderen Tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BuildYourBrand ist das einzige Tool, das den gesamten Markenaufbau von Idee bis Launch in einem strukturierten 7-Schritte-Prozess abbildet – inklusive KI-gestützter Risikoanalyse und Lieferanten-Matching."
      }
    }
  ]
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Eigene Marke gründen in 7 Schritten",
  "description": "Schritt-für-Schritt Anleitung zum Aufbau deiner eigenen Marke mit BuildYourBrand – von der Idee bis zum Launch.",
  "totalTime": "P30D",
  "tool": {
    "@type": "HowToTool",
    "name": "BuildYourBrand SaaS-Plattform"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Idee & Positionierung",
      "text": "Definiere deine Zielgruppe, entwickle dein USP und analysiere den Markt. Lege die Grundlage für eine differenzierte Markenpositionierung."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Markenidentität aufbauen",
      "text": "Entwickle deinen Markennamen, Tonalität und visuelle Richtung. Erstelle ein konsistentes Brand Framework."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Kalkulation & Business Model",
      "text": "Berechne Produktionskosten, definiere Preise und analysiere deine Margen. Nutze den Break-even Rechner für realistische Prognosen."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Produktion planen",
      "text": "Finde passende Lieferanten, verstehe MOQ-Anforderungen und plane deine Produktion mit Qualitätskontrolle."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Compliance & Rechtliches",
      "text": "Sichere deine Marke rechtlich ab: Produktkennzeichnung, Label-Checklisten und regulatorische Anforderungen."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Vertriebsstrategie",
      "text": "Wähle deine Verkaufskanäle: eigener Online-Shop, Marktplätze oder Social Commerce. Plane deine Go-to-Market Strategie."
    },
    {
      "@type": "HowToStep",
      "position": 7,
      "name": "Launch & Go-to-Market",
      "text": "Starte deine Marke mit einer strukturierten 30-Tage Roadmap. Nutze den Execution Readiness Score für datenbasierte Entscheidungen."
    }
  ]
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BuildYourBrand",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "SaaS-Plattform für den systematischen Markenaufbau – von der Idee über Kalkulation und Produktion bis zum Launch.",
  "url": "https://brand.aldenairperfumes.de",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "EUR"
    },
    {
      "@type": "Offer",
      "name": "Builder",
      "price": "29",
      "priceCurrency": "EUR",
      "billingIncrement": "P1M"
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "79",
      "priceCurrency": "EUR",
      "billingIncrement": "P1M"
    }
  ],
  "featureList": "7-Schritte Markenaufbau, KI-Risikoanalyse, Break-even Rechner, Lieferanten-Matching, PDF-Exporte, Launch-Roadmap",
  "author": {
    "@type": "Organization",
    "name": "BuildYourBrand"
  }
};

const Index = () => {
  const { showPopup, trigger, setShowPopup } = useLeadMagnet();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Eigene Marke gründen – BuildYourBrand 2026"
        description="Baue deine Marke in 7 Schritten: Idee, Kalkulation, Produktion, Launch. Kostenlos starten. Datengetrieben & made in Germany."
        path="/"
        jsonLd={[faqJsonLd, howToJsonLd, softwareJsonLd]}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhyUsSection />
        <PricingSection />
        <TrustSection />
      </main>
      <Footer />
      {showPopup && (
        <LeadMagnetPopup trigger={trigger} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default Index;
