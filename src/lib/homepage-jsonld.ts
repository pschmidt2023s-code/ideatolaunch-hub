export const faqJsonLd = {
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
        "text": "Für Gründer, E-Commerce-Starter und alle, die eine eigene Marke strukturiert planen und starten möchten."
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
        "text": "Es gibt drei Pläne: Free (0 €), Builder (29 €/Monat), Pro (79 €/Monat) und Execution OS (159 €/Monat)."
      }
    },
    {
      "@type": "Question",
      "name": "Ist BuildYourBrand DSGVO-konform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, vollständig DSGVO-konform. Daten werden in der EU gehostet."
      }
    }
  ]
};

export const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Eigene Marke gründen in 7 Schritten",
  "description": "Schritt-für-Schritt Anleitung zum Aufbau deiner eigenen Marke mit BuildYourBrand.",
  "totalTime": "P30D",
  "tool": { "@type": "HowToTool", "name": "BuildYourBrand SaaS-Plattform" },
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Idee & Positionierung", "text": "Definiere deine Zielgruppe und analysiere den Markt." },
    { "@type": "HowToStep", "position": 2, "name": "Markenidentität aufbauen", "text": "Entwickle Markennamen, Tonalität und visuelle Richtung." },
    { "@type": "HowToStep", "position": 3, "name": "Kalkulation & Business Model", "text": "Berechne Produktionskosten, Preise und Margen." },
    { "@type": "HowToStep", "position": 4, "name": "Produktion planen", "text": "Finde Lieferanten und plane Produktion mit Qualitätskontrolle." },
    { "@type": "HowToStep", "position": 5, "name": "Compliance & Rechtliches", "text": "Produktkennzeichnung, Label-Checklisten und Regulatorik." },
    { "@type": "HowToStep", "position": 6, "name": "Vertriebsstrategie", "text": "Wähle Verkaufskanäle und plane Go-to-Market." },
    { "@type": "HowToStep", "position": 7, "name": "Launch & Go-to-Market", "text": "Starte mit 30-Tage Roadmap und Execution Readiness Score." },
  ]
};

export const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BuildYourBrand",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "SaaS-Plattform für den systematischen Markenaufbau – von der Idee bis zum Launch.",
  "url": "https://brand.aldenairperfumes.de",
  "offers": [
    { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "EUR" },
    { "@type": "Offer", "name": "Builder", "price": "29", "priceCurrency": "EUR", "billingIncrement": "P1M" },
    { "@type": "Offer", "name": "Pro", "price": "79", "priceCurrency": "EUR", "billingIncrement": "P1M" },
  ],
  "featureList": "7-Schritte Markenaufbau, KI-Risikoanalyse, Break-even Rechner, Lieferanten-Matching, PDF-Exporte, Launch-Roadmap",
  "author": { "@type": "Organization", "name": "BuildYourBrand" }
};
