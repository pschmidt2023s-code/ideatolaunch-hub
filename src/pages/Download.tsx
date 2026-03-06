import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Brain, Zap, Wrench, Tag, Link2, Code2, Bug, TrendingUp } from "lucide-react";

const INSTALLER_URL =
  "https://github.com/pschmidt2023s-code/ideatolaunch-hub/releases/download/v3.0/brandos-installer.exe";

const patchSections = [
  {
    icon: Brain,
    title: "Command Center",
    color: "text-violet-500",
    items: [
      "Founder Risk Index™ (0–100 Risiko Score)",
      "Confidence Score, Runway Anzeige, Break-even Datum",
      "Kapitaldruck-Indikator & Top 3 Risikoquellen mit € Impact",
      "Next Critical Action (KI Empfehlung)",
      "Reality Mode (Optimistic / Realistic / Worst Case)",
    ],
  },
  {
    icon: Zap,
    title: "Capital Shock & Simulation Engine",
    color: "text-amber-500",
    items: [
      "Simulierbare Ereignisse: Preis +10%, Ads +20%, Lieferzeit +30 Tage, Retouren +8%",
      "Echtzeit-Auswirkungen auf Runway, Break-even, Risiko & Gewinnpotenzial",
    ],
  },
  {
    icon: TrendingUp,
    title: "Founder Risk Index™",
    color: "text-emerald-500",
    items: [
      "Analyse: Margensicherheit, Kapitalpuffer, Lieferantenrisiko, Preisdruck, Execution, Marktpositionierung",
      "Score-Darstellung: 🟢 Stabil · 🟡 Fragil · 🔴 Gefährdet",
    ],
  },
  {
    icon: Sparkles,
    title: "Intelligence Suite 3.0",
    color: "text-pink-500",
    items: [
      "Brand Intelligence: Namensvorschläge (Score ≥ 90), Archetype Analyse, Emotion Mapping",
      "Decision Intelligence: Kapitalwarnsystem, Simulation Historie, Entscheidungs-Impact",
      "Market Intelligence: Benchmark Story Upgrade, strategische Interpretation",
    ],
  },
  {
    icon: Wrench,
    title: "Founder Journey Upgrade",
    color: "text-blue-500",
    items: [
      "Kapitalauswirkungen & Risiko-Impact pro Phase",
      "Confidence-Veränderung & Fortschrittsanzeige",
    ],
  },
  {
    icon: Tag,
    title: "Execution Pressure Mode",
    color: "text-red-500",
    items: [
      "Automatische Warnstufen bei kritischem Kapital",
      "Fokus auf Revenue-relevante Aufgaben & Prioritäten-Verschiebung",
    ],
  },
  {
    icon: Code2,
    title: "Desktop Version 3.0",
    color: "text-indigo-500",
    items: [
      "Vollständig gebrandeter Installer mit eigener Oberfläche",
      "Optimiertes Update-System & Beta Client",
      "In-App Feedback System & Admin Beta Panel",
    ],
  },
  {
    icon: Link2,
    title: "UI Redesign & Struktur",
    color: "text-teal-500",
    items: [
      "Mehr White Space, größere Typografie, cleanere Kartenstruktur",
      "Neue Hauptstruktur: Command Center → Journey → Intelligence → Settings",
      "Micro-Animationen, Skeleton Loader, schnellere Ladezeiten",
    ],
  },
  {
    icon: Bug,
    title: "Sicherheit & Stabilität",
    color: "text-muted-foreground",
    items: [
      "Optimierte Update-Architektur & Installer-Signierung",
      "DSGVO-konforme Infrastruktur & Performance Optimierungen",
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
                  <CardTitle className="text-xl">BrandOS v3.0</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Capital Intelligence Release</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Major Upgrade:</span> BrandOS verbindet Kapital, Risiko und Execution in einem einzigen Founder Operating System.
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
                <p className="text-sm font-semibold mb-2">🎯 In einem Satz</p>
                <p className="text-sm text-muted-foreground">
                  BrandOS 3.0 verbindet Kapital, Risiko und Execution in einem einzigen Founder Operating System.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
