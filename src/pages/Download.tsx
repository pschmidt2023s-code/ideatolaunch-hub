import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Brain, Zap, Wrench, Tag, Link2, Code2, Bug, TrendingUp } from "lucide-react";

const INSTALLER_URL =
  "https://github.com/pschmidt2023s-code/ideatolaunch-hub/releases/download/2.0/BrandOS_0.2.0_x64-setup.exe";

const patchSections = [
  {
    icon: Sparkles,
    title: "Neu",
    color: "text-emerald-500",
    items: [
      "Dynamische Roadmap basierend auf Budget, Kategorie, Zielregion, Produktionsmenge & Preispositionierung",
      "Personalisierte Label-Checkliste",
      "Dynamische Legal-Map (EU, VAT, VerpackG etc.)",
      "Operative Checkliste mit Business-Setup-Logik",
      "Risiko-Scoring für PRO & EXECUTION",
    ],
  },
  {
    icon: Brain,
    title: "PRO Tier Improvements",
    color: "text-violet-500",
    items: [
      "Individuelle Roadmap statt statischer Schritte",
      "Dynamische Compliance Hinweise",
      "Kapital-Impact pro Schritt",
      "Regionale Anpassungen (EU / Global)",
    ],
  },
  {
    icon: Zap,
    title: "EXECUTION Tier Upgrade",
    color: "text-amber-500",
    items: [
      "Risk Intelligence erweitert",
      "Survival & Recovery Simulation verbessert",
      "Szenario-basierte Kapitalexposition",
      "Dynamische Priorisierung pro Roadmap-Step",
    ],
  },
  {
    icon: Wrench,
    title: "Recovery Mode Fix",
    color: "text-blue-500",
    items: [
      "Entfernte statische Blur-Overlays",
      "Recovery Mode korrekt für PRO & EXECUTION freigeschaltet",
      "Neue Berechnung: Runway nach Umsatzschock, Kapital-Lücke, Survival Probability",
      "Verbesserte Stress-Test Logik",
    ],
  },
  {
    icon: Tag,
    title: "Label & Compliance Fix",
    color: "text-teal-500",
    items: [
      "Barcode Logik korrigiert (Retail/Amazon Pflicht)",
      "Gewerbeanmeldung in operative Checkliste integriert",
      "EU-spezifische Anforderungen ergänzt",
      "Kosmetik-/Supplement-abhängige Pflichtfelder ergänzt",
    ],
  },
  {
    icon: Link2,
    title: "Supplier System",
    color: "text-indigo-500",
    items: [
      "Affiliate-Logik vollständig entfernt",
      "Saubere externe Weiterleitungen",
      "Tracking nur noch intern",
      "Ref/UTM Konflikte behoben",
    ],
  },
  {
    icon: Code2,
    title: "Codebase Improvements",
    color: "text-muted-foreground",
    items: [
      "Entfernte statische Arrays",
      "Refactored Supplier URL Builder",
      "Verbesserte Feature Flag Logik",
      "Bereinigte Conditional Rendering Logik",
    ],
  },
  {
    icon: Bug,
    title: "Fixes",
    color: "text-red-500",
    items: [
      "405 Fehler bei externen Links behoben",
      "Falsche Weiterleitungen korrigiert",
      "Overlay-Fehler im Recovery Mode behoben",
      "Plan-Erkennung stabilisiert",
      "Auto Updater Patch",
    ],
  },
];

export default function DownloadPage() {
  return (
    <>
      <SEO title="BrandOS Download" description="Lade die neueste Version von BrandOS für Windows herunter." path="/download" />
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-[600px] space-y-6">
          {/* Download Card */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl">BrandOS Download</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full text-base gap-2" asChild>
                <a href={INSTALLER_URL} download>
                  <Download className="h-5 w-5" />
                  BrandOS für Windows herunterladen
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                Nach dem Download die Datei ausführen. Das Update ersetzt die alte Version automatisch.
              </p>
            </CardContent>
          </Card>

          {/* Patchnotes Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <div>
                  <CardTitle className="text-xl">BrandOS v2.0</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Dynamic Intelligence Upgrade</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Major Upgrade:</span> BrandOS wurde von statischen Checklisten auf eine intelligente, dynamische Entscheidungs-Engine umgestellt.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {patchSections.map((section) => (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <section.icon className={`h-4 w-4 ${section.color}`} />
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                  </div>
                  <ul className="space-y-1 pl-6">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground list-disc">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Result */}
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-4 mt-4">
                <p className="text-sm font-semibold mb-2">📈 Ergebnis</p>
                <p className="text-sm text-muted-foreground">
                  BrandOS ist jetzt: 100% dynamisch · Compliance-intelligent · Risiko-bewusst · Skalierbar für zukünftige Intelligence Layer
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
