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
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
